use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    routing::get,
    Json, Router,
};
use serde::Deserialize;
use uuid::Uuid;
use validator::Validate;

use crate::{
    db::AppState,
    error::AppError,
    middleware::auth::AuthUser,
    models::{get_all_distribution_channels, get_all_platforms, App, CreateApp, UpdateApp},
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(list_apps).post(create_app))
        .route("/platforms", get(list_platforms))
        .route("/channels", get(list_channels))
        .route("/:slug", get(get_app).put(update_app).delete(delete_app))
}

#[derive(Debug, Deserialize)]
struct ListQuery {
    #[serde(default)]
    platform: Option<String>,
    #[serde(default = "default_limit")]
    limit: i64,
    #[serde(default)]
    offset: i64,
}

fn default_limit() -> i64 {
    20
}

/// Generate a UUID-based slug for apps
fn generate_slug() -> String {
    format!("app-{}", &Uuid::new_v4().to_string()[..8])
}

/// Ensure slug is unique by appending a number if necessary
async fn ensure_unique_slug(pool: &sqlx::PgPool, base_slug: &str) -> Result<String, AppError> {
    let mut slug = base_slug.to_string();
    let mut counter = 1;

    loop {
        let exists: Option<(i64,)> = sqlx::query_as("SELECT 1 FROM apps WHERE slug = $1 LIMIT 1")
            .bind(&slug)
            .fetch_optional(pool)
            .await?;

        if exists.is_none() {
            break;
        }

        slug = format!("{}-{}", base_slug, counter);
        counter += 1;

        if counter > 100 {
            // Safety limit
            slug = format!("{}-{}", base_slug, &Uuid::new_v4().to_string()[..8]);
            break;
        }
    }

    Ok(slug)
}

/// List all available platforms
async fn list_platforms() -> impl IntoResponse {
    Json(get_all_platforms())
}

/// List all available distribution channels
async fn list_channels() -> impl IntoResponse {
    Json(get_all_distribution_channels())
}

/// List all apps
async fn list_apps(
    State(state): State<AppState>,
    Query(query): Query<ListQuery>,
) -> Result<impl IntoResponse, AppError> {
    let where_clause = if let Some(ref platform) = query.platform {
        // Check if platform is in the platforms array
        format!(" WHERE '{}' = ANY(platforms)", platform)
    } else {
        String::new()
    };

    let sql = format!(
        "SELECT id, name, slug, description, platforms, screenshots, distribution_channels, privacy_policy_url, created_at, updated_at FROM apps{} ORDER BY created_at DESC LIMIT $1 OFFSET $2",
        where_clause
    );

    let apps: Vec<App> = sqlx::query_as(&sql)
        .bind(query.limit)
        .bind(query.offset)
        .fetch_all(&state.pool)
        .await?;

    Ok(Json(apps))
}

/// Get a single app by slug
async fn get_app(
    State(state): State<AppState>,
    Path(slug): Path<String>,
) -> Result<impl IntoResponse, AppError> {
    let app = sqlx::query_as::<_, App>(
        "SELECT id, name, slug, description, platforms, screenshots, distribution_channels, privacy_policy_url, created_at, updated_at FROM apps WHERE slug = $1"
    )
    .bind(&slug)
    .fetch_one(&state.pool)
    .await?;

    Ok(Json(app))
}

/// Create a new app (requires authentication)
async fn create_app(
    State(state): State<AppState>,
    _auth: AuthUser,
    Json(payload): Json<CreateApp>,
) -> Result<impl IntoResponse, AppError> {
    payload.validate()?;

    // Always generate UUID-based slug
    let base_slug = generate_slug();
    let slug = ensure_unique_slug(&state.pool, &base_slug).await?;

    let platforms: Vec<String> = payload.platforms.unwrap_or_default();
    let screenshots: Vec<String> = payload.screenshots.unwrap_or_default();
    let distribution_channels = match payload.distribution_channels {
        Some(channels) => serde_json::to_value(channels).unwrap_or(serde_json::json!([])),
        None => serde_json::json!([]),
    };

    let app = sqlx::query_as::<_, App>(
        "INSERT INTO apps (name, slug, description, platforms, screenshots, distribution_channels, privacy_policy_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, name, slug, description, platforms, screenshots, distribution_channels, privacy_policy_url, created_at, updated_at"
    )
    .bind(&payload.name)
    .bind(&slug)
    .bind(&payload.description)
    .bind(&platforms)
    .bind(&screenshots)
    .bind(&distribution_channels)
    .bind(&payload.privacy_policy_url)
    .fetch_one(&state.pool)
    .await?;

    Ok((StatusCode::CREATED, Json(app)))
}

/// Update an app (requires authentication)
async fn update_app(
    State(state): State<AppState>,
    _auth: AuthUser,
    Path(slug): Path<String>,
    Json(payload): Json<UpdateApp>,
) -> Result<impl IntoResponse, AppError> {
    // Build dynamic update query
    let mut set_clauses = Vec::<String>::new();
    let mut param_idx = 1;

    // We'll use a different approach for mixed types
    // First, collect what needs to be updated
    let has_name = payload.name.is_some();
    let has_description = payload.description.is_some();
    let has_platforms = payload.platforms.is_some();
    let has_screenshots = payload.screenshots.is_some();
    let has_distribution_channels = payload.distribution_channels.is_some();
    let has_privacy_policy_url = payload.privacy_policy_url.is_some();

    if has_name {
        set_clauses.push(format!("name = ${}", param_idx));
        param_idx += 1;
    }
    if has_description {
        set_clauses.push(format!("description = ${}", param_idx));
        param_idx += 1;
    }
    if has_platforms {
        set_clauses.push(format!("platforms = ${}", param_idx));
        param_idx += 1;
    }
    if has_screenshots {
        set_clauses.push(format!("screenshots = ${}", param_idx));
        param_idx += 1;
    }
    if has_distribution_channels {
        set_clauses.push(format!("distribution_channels = ${}", param_idx));
        param_idx += 1;
    }
    if has_privacy_policy_url {
        set_clauses.push(format!("privacy_policy_url = ${}", param_idx));
        param_idx += 1;
    }

    if set_clauses.is_empty() {
        return Err(AppError::BadRequest("No fields to update".to_string()));
    }

    set_clauses.push("updated_at = NOW()".to_string());

    let sql = format!(
        "UPDATE apps SET {} WHERE slug = ${} RETURNING id, name, slug, description, platforms, screenshots, distribution_channels, privacy_policy_url, created_at, updated_at",
        set_clauses.join(", "),
        param_idx
    );

    let mut query = sqlx::query_as::<_, App>(&sql);

    // Bind parameters in order
    if let Some(name) = &payload.name {
        query = query.bind(name);
    }
    if let Some(description) = &payload.description {
        query = query.bind(description);
    }
    if let Some(platforms) = &payload.platforms {
        query = query.bind(platforms);
    }
    if let Some(screenshots) = &payload.screenshots {
        query = query.bind(screenshots);
    }
    if let Some(channels) = &payload.distribution_channels {
        let channels_json = serde_json::to_value(channels).unwrap_or(serde_json::json!([]));
        query = query.bind(channels_json);
    }
    if let Some(privacy_policy_url) = &payload.privacy_policy_url {
        query = query.bind(privacy_policy_url);
    }

    // Bind slug for WHERE clause
    query = query.bind(&slug);

    let app = query.fetch_one(&state.pool).await?;

    Ok(Json(app))
}

/// Delete an app (requires authentication)
async fn delete_app(
    State(state): State<AppState>,
    _auth: AuthUser,
    Path(slug): Path<String>,
) -> Result<StatusCode, AppError> {
    sqlx::query("DELETE FROM apps WHERE slug = $1")
        .bind(&slug)
        .execute(&state.pool)
        .await?;

    Ok(StatusCode::NO_CONTENT)
}
