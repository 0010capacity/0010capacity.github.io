use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{delete, get, post, put},
    Json, Router,
};
use serde::Deserialize;
use validator::Validate;

use crate::{
    db::AppState,
    error::AppError,
    middleware::auth::AuthUser,
    models::{App, CreateApp, UpdateApp},
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(list_apps).post(create_app))
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

/// List all apps
async fn list_apps(
    State(state): State<AppState>,
    Query(query): Query<ListQuery>,
) -> Result<impl IntoResponse, AppError> {
    let where_clause = if let Some(ref platform) = query.platform {
        format!(" WHERE platform = '{}'", platform)
    } else {
        String::new()
    };

    let sql = format!(
        "SELECT id, name, slug, description, platform, icon_url, screenshots, download_links, privacy_policy_url, created_at, updated_at FROM apps{} ORDER BY created_at DESC LIMIT $1 OFFSET $2",
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
        "SELECT id, name, slug, description, platform, icon_url, screenshots, download_links, privacy_policy_url, created_at, updated_at FROM apps WHERE slug = $1"
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

    let screenshots: Vec<String> = payload.screenshots.unwrap_or_default();
    let download_links = payload.download_links.unwrap_or(serde_json::json!({}));

    let app = sqlx::query_as::<_, App>(
        "INSERT INTO apps (name, slug, description, platform, icon_url, screenshots, download_links, privacy_policy_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, name, slug, description, platform, icon_url, screenshots, download_links, privacy_policy_url, created_at, updated_at"
    )
    .bind(&payload.name)
    .bind(&payload.slug)
    .bind(&payload.description)
    .bind(&payload.platform)
    .bind(&payload.icon_url)
    .bind(&screenshots)
    .bind(&download_links)
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
    let mut updates = Vec::<String>::new();
    let mut bindings: Vec<String> = Vec::new();

    if let Some(name) = &payload.name {
        updates.push(format!("name = ${}", updates.len() + 1));
        bindings.push(name.clone());
    }
    if let Some(description) = &payload.description {
        updates.push(format!("description = ${}", updates.len() + 1));
        bindings.push(description.clone());
    }
    if let Some(platform) = &payload.platform {
        updates.push(format!("platform = ${}", updates.len() + 1));
        bindings.push(platform.clone());
    }
    if let Some(icon_url) = &payload.icon_url {
        updates.push(format!("icon_url = ${}", updates.len() + 1));
        bindings.push(icon_url.clone());
    }

    if updates.is_empty() {
        return Err(AppError::BadRequest("No fields to update".to_string()));
    }

    updates.push("updated_at = NOW()".to_string());
    let param_idx = updates.len();

    let sql = format!(
        "UPDATE apps SET {} WHERE slug = ${} RETURNING id, name, slug, description, platform, icon_url, screenshots, download_links, privacy_policy_url, created_at, updated_at",
        updates.join(", "),
        param_idx
    );

    let mut query = sqlx::query_as::<_, App>(&sql);
    for binding in bindings {
        query = query.bind(binding);
    }
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
