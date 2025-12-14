use axum::{
    http::{header, Method, StatusCode},
    response::IntoResponse,
    routing::get,
    Json, Router,
};
use serde_json::json;
use sqlx::postgres::PgPoolOptions;
use std::env;
use tower_http::{
    cors::CorsLayer,
    trace::{DefaultMakeSpan, TraceLayer},
};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod config;
mod db;
mod error;
mod middleware;
mod models;
mod routes;
mod utils;

use config::Config;
use error::AppError;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Load environment variables
    dotenvy::dotenv().ok();

    // Initialize tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "backend=debug,tower_http=debug,axum=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Load configuration
    let config = Config::from_env()?;

    // Create database connection pool
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&config.database_url)
        .await?;

    // Run migrations
    tracing::info!("Running database migrations...");
    sqlx::migrate!("./migrations").run(&pool).await?;

    tracing::info!("Database migrations completed successfully");

    // Build application state
    let app_state = db::AppState {
        pool: pool.clone(),
        config: config.clone(),
    };

    // Build router
    let app = create_router(app_state);

    // Start server
    let addr = format!("0.0.0.0:{}", config.port);
    let listener = tokio::net::TcpListener::bind(&addr).await?;

    tracing::info!("Server listening on {}", addr);

    axum::serve(listener, app).await?;

    Ok(())
}

fn create_router(state: db::AppState) -> Router {
    // CORS configuration - specific origins only
    let cors = CorsLayer::new()
        .allow_origin([
            "http://localhost:3000".parse().unwrap(),
            "https://0010capacity.github.io".parse().unwrap(),
        ])
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::DELETE,
            Method::OPTIONS,
        ])
        .allow_headers([header::CONTENT_TYPE, header::AUTHORIZATION]);

    // Build API routes
    let api_routes = Router::new()
        .nest("/novels", routes::novels::router())
        .nest("/blog", routes::blog::router())
        .nest("/apps", routes::apps::router())
        .nest("/auth", routes::auth::router())
        .with_state(state);

    // Main router
    Router::new()
        .route("/", get(root_handler))
        .route("/health", get(health_handler))
        .nest("/api", api_routes)
        .fallback(handler_404)
        .layer(cors)
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(DefaultMakeSpan::default().include_headers(true)),
        )
}

async fn root_handler() -> impl IntoResponse {
    Json(json!({
        "name": "0010capacity Backend API",
        "version": env!("CARGO_PKG_VERSION"),
        "status": "running",
        "endpoints": {
            "health": "/health",
            "api": "/api",
            "novels": "/api/novels",
            "blog": "/api/blog",
            "apps": "/api/apps",
            "auth": "/api/auth"
        }
    }))
}

async fn health_handler() -> impl IntoResponse {
    Json(json!({
        "status": "healthy",
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

async fn handler_404() -> impl IntoResponse {
    (
        StatusCode::NOT_FOUND,
        Json(json!({
            "error": "Not Found",
            "message": "The requested resource does not exist"
        })),
    )
}
