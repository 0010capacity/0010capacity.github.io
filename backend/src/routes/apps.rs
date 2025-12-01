use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{delete, get, post, put},
    Json, Router,
};
use serde::Deserialize;
use uuid::Uuid;
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
    50
}

/// List all apps
async fn list_apps(
    State(state): State<AppState>,
    Query(query): Query<ListQuery>,
) -> Result<impl IntoResponse, AppError> {
    let mut sql = "SELECT * FROM apps".to_string();

    if let Some(ref platform) = query.platform {
        sql.push_str(&format!(" WHERE platform = '{}'", platform));
    }

    sql.push_str(" ORDER BY created_at DESC LIMIT $1 OFFSET $2");

    let apps = sqlx::query_as::<_, App>(&sql)
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
    let app = sqlx::query_as::<_, App>("SELECT * FROM apps WHERE slug = $1")
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

    let screenshots = payload.screenshots.unwrap_or_default();
    let download_links = payload
        .download_links
        .unwrap_or_else(|| serde_json::json!({}));

    let app = sqlx::query_as::<_, App>(
        "INSERT INTO apps (name, slug, description, platform, icon_url, screenshots, download_links, privacy_policy_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *",
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
    .await
    .map_err(|e| {
        if let sqlx::Error::Database(db_err) = &e {
            if db_err.is_unique_violation() {
                return AppError::Conflict("App with this slug already exists".to_string());
            }
        }
        AppError::from(e)
    })?;

    Ok((StatusCode::CREATED, Json(app)))
}

/// Update an app (requires authentication)
async fn update_app(
    State(state): State<AppState>,
    _auth: AuthUser,
    Path(slug): Path<String>,
    Json(payload): Json<UpdateApp>,
) -> Result<impl IntoResponse, AppError> {
    payload.validate()?;

    let mut updates = Vec::new();

    if payload.name.is_some() {
        updates.push(format!("name = ${}", updates.len() + 1));
    }
    if payload.description.is_some() {
        updates.push(format!("description = ${}", updates.len() + 1));
    }
    if payload.platform.is_some() {
        updates.push(format!("platform = ${}", updates.len() + 1));
    }
    if payload.icon_url.is_some() {
        updates.push(format!("icon_url = ${}", updates.len() + 1));
    }
    if payload.screenshots.is_some() {
        updates.push(format!("screenshots = ${}", updates.len() + 1));
    }
    if payload.download_links.is_some() {
        updates.push(format!("download_links = ${}", updates.len() + 1));
    }
    if payload.privacy_policy_url.is_some() {
        updates.push(format!("privacy_policy_url = ${}", updates.len() + 1));
    }

    if updates.is_empty() {
        return Err(AppError::BadRequest("No fields to update".to_string()));
    }

    updates.push("updated_at = NOW()".to_string());

    let query_str = format!(
        "UPDATE apps SET {} WHERE slug = ${} RETURNING *",
        updates.join(", "),
        updates.len()
    );

    let mut query = sqlx::query_as::<_, App>(&query_str);

    if let Some(name) = &payload.name {
        query = query.bind(name);
    }
    if let Some(description) = &payload.description {
        query = query.bind(description);
    }
    if let Some(platform) = &payload.platform {
        query = query.bind(platform);
    }
    if let Some(icon_url) = &payload.icon_url {
        query = query.bind(icon_url);
    }
    if let Some(screenshots) = &payload.screenshots {
        query = query.bind(screenshots);
    }
    if let Some(download_links) = &payload.download_links {
        query = query.bind(download_links);
    }
    if let Some(privacy_policy_url) = &payload.privacy_policy_url {
        query = query.bind(privacy_policy_url);
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
) -> Result<impl IntoResponse, AppError> {
    let result = sqlx::query("DELETE FROM apps WHERE slug = $1")
        .bind(&slug)
        .execute(&state.pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("App".to_string()));
    }

    Ok(StatusCode::NO_CONTENT)
}
