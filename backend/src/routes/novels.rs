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
    models::{CreateChapter, CreateNovel, Novel, NovelChapter, UpdateChapter, UpdateNovel},
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(list_novels).post(create_novel))
        .route(
            "/:slug",
            get(get_novel).put(update_novel).delete(delete_novel),
        )
        .route("/:slug/chapters", get(list_chapters).post(create_chapter))
        .route(
            "/:slug/chapters/:number",
            get(get_chapter).put(update_chapter).delete(delete_chapter),
        )
}

#[derive(Debug, Deserialize)]
struct ListQuery {
    #[serde(default)]
    status: Option<String>,
    #[serde(default = "default_limit")]
    limit: i64,
    #[serde(default)]
    offset: i64,
}

fn default_limit() -> i64 {
    50
}

/// List all novels
async fn list_novels(
    State(state): State<AppState>,
    Query(query): Query<ListQuery>,
) -> Result<impl IntoResponse, AppError> {
    let mut where_clause = String::new();
    if let Some(ref status) = query.status {
        where_clause = format!(" WHERE status = '{}'", status);
    }

    let sql = format!(
        "SELECT id, slug, title, description, cover_image_url, genre, status, view_count, created_at, updated_at FROM novels{} ORDER BY created_at DESC LIMIT $1 OFFSET $2",
        where_clause
    );

    let novels: Vec<Novel> = sqlx::query_as(&sql)
        .bind(query.limit)
        .bind(query.offset)
        .fetch_all(&state.pool)
        .await?;

    Ok(Json(novels))
}

/// Get a single novel by slug
async fn get_novel(
    State(state): State<AppState>,
    Path(slug): Path<String>,
) -> Result<impl IntoResponse, AppError> {
    let novel = sqlx::query_as::<_, Novel>(
        "SELECT id, slug, title, description, cover_image_url, genre, status, view_count, created_at, updated_at FROM novels WHERE slug = $1"
    )
        .bind(&slug)
        .fetch_one(&state.pool)
        .await?;

    Ok(Json(novel))
}

/// Create a new novel (requires authentication)
async fn create_novel(
    State(state): State<AppState>,
    _auth: AuthUser,
    Json(payload): Json<CreateNovel>,
) -> Result<impl IntoResponse, AppError> {
    payload.validate()?;

    let novel = sqlx::query_as::<_, Novel>(
        "INSERT INTO novels (slug, title, description, cover_image_url, genre, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, slug, title, description, cover_image_url, genre, status, view_count, created_at, updated_at"
    )
        .bind(&payload.slug)
        .bind(&payload.title)
        .bind(&payload.description)
        .bind(&payload.cover_image_url)
        .bind(&payload.genre)
        .bind(payload.status.unwrap_or_else(|| "draft".to_string()))
        .fetch_one(&state.pool)
        .await?;

    Ok((StatusCode::CREATED, Json(novel)))
}

/// Update a novel (requires authentication)
async fn update_novel(
    State(state): State<AppState>,
    _auth: AuthUser,
    Path(slug): Path<String>,
    Json(payload): Json<UpdateNovel>,
) -> Result<impl IntoResponse, AppError> {
    // Build dynamic update query
    let mut updates = Vec::<String>::new();
    let mut bindings: Vec<String> = Vec::new();

    if let Some(title) = &payload.title {
        updates.push(format!("title = ${}", updates.len() + 1));
        bindings.push(title.clone());
    }
    if let Some(description) = &payload.description {
        updates.push(format!("description = ${}", updates.len() + 1));
        bindings.push(description.clone());
    }
    if let Some(cover) = &payload.cover_image_url {
        updates.push(format!("cover_image_url = ${}", updates.len() + 1));
        bindings.push(cover.clone());
    }
    if let Some(genre) = &payload.genre {
        updates.push(format!("genre = ${}", updates.len() + 1));
        bindings.push(genre.clone());
    }
    if let Some(status) = &payload.status {
        updates.push(format!("status = ${}", updates.len() + 1));
        bindings.push(status.clone());
    }

    if updates.is_empty() {
        return Err(AppError::BadRequest("No fields to update".to_string()));
    }

    updates.push(format!("updated_at = NOW()"));
    let param_idx = updates.len();

    let sql = format!(
        "UPDATE novels SET {} WHERE slug = ${} RETURNING id, slug, title, description, cover_image_url, genre, status, view_count, created_at, updated_at",
        updates.join(", "),
        param_idx
    );

    let mut query = sqlx::query_as::<_, Novel>(&sql);
    for binding in bindings {
        query = query.bind(binding);
    }
    query = query.bind(&slug);

    let novel = query.fetch_one(&state.pool).await?;

    Ok(Json(novel))
}

/// Delete a novel (requires authentication)
async fn delete_novel(
    State(state): State<AppState>,
    _auth: AuthUser,
    Path(slug): Path<String>,
) -> Result<StatusCode, AppError> {
    sqlx::query("DELETE FROM novels WHERE slug = $1")
        .bind(&slug)
        .execute(&state.pool)
        .await?;

    Ok(StatusCode::NO_CONTENT)
}

// Chapters endpoints

/// List chapters for a novel
async fn list_chapters(
    State(state): State<AppState>,
    Path(slug): Path<String>,
) -> Result<impl IntoResponse, AppError> {
    let chapters = sqlx::query_as::<_, NovelChapter>(
        "SELECT c.id, c.novel_id, c.chapter_number, c.title, c.content, c.view_count, c.published_at, c.created_at, c.updated_at
         FROM novel_chapters c
         JOIN novels n ON c.novel_id = n.id
         WHERE n.slug = $1
         ORDER BY c.chapter_number ASC"
    )
        .bind(&slug)
        .fetch_all(&state.pool)
        .await?;

    Ok(Json(chapters))
}

/// Get a specific chapter
async fn get_chapter(
    State(state): State<AppState>,
    Path((slug, chapter_number)): Path<(String, i32)>,
) -> Result<impl IntoResponse, AppError> {
    let chapter = sqlx::query_as::<_, NovelChapter>(
        "SELECT c.id, c.novel_id, c.chapter_number, c.title, c.content, c.view_count, c.published_at, c.created_at, c.updated_at
         FROM novel_chapters c
         JOIN novels n ON c.novel_id = n.id
         WHERE n.slug = $1 AND c.chapter_number = $2"
    )
        .bind(&slug)
        .bind(chapter_number)
        .fetch_one(&state.pool)
        .await?;

    Ok(Json(chapter))
}

/// Create a new chapter (requires authentication)
async fn create_chapter(
    State(state): State<AppState>,
    _auth: AuthUser,
    Path(slug): Path<String>,
    Json(payload): Json<CreateChapter>,
) -> Result<impl IntoResponse, AppError> {
    payload.validate()?;

    // Get novel by slug
    let novel_id: (Uuid,) = sqlx::query_as("SELECT id FROM novels WHERE slug = $1")
        .bind(&slug)
        .fetch_one(&state.pool)
        .await?;

    let chapter = sqlx::query_as::<_, NovelChapter>(
        "INSERT INTO novel_chapters (novel_id, chapter_number, title, content, published_at)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, novel_id, chapter_number, title, content, view_count, published_at, created_at, updated_at"
    )
        .bind(novel_id.0)
        .bind(payload.chapter_number)
        .bind(&payload.title)
        .bind(&payload.content)
        .bind(payload.published_at)
        .fetch_one(&state.pool)
        .await?;

    Ok((StatusCode::CREATED, Json(chapter)))
}

/// Update a chapter (requires authentication)
async fn update_chapter(
    State(state): State<AppState>,
    _auth: AuthUser,
    Path((slug, chapter_number)): Path<(String, i32)>,
    Json(payload): Json<UpdateChapter>,
) -> Result<impl IntoResponse, AppError> {
    let mut updates = Vec::<String>::new();
    let mut bindings: Vec<String> = Vec::new();

    if let Some(title) = &payload.title {
        updates.push(format!("title = ${}", updates.len() + 1));
        bindings.push(title.clone());
    }
    if let Some(content) = &payload.content {
        updates.push(format!("content = ${}", updates.len() + 1));
        bindings.push(content.clone());
    }

    if updates.is_empty() {
        return Err(AppError::BadRequest("No fields to update".to_string()));
    }

    updates.push("updated_at = NOW()".to_string());
    let param_idx = updates.len();

    let sql = format!(
        "UPDATE novel_chapters SET {} WHERE novel_id = (SELECT id FROM novels WHERE slug = ${}  ) AND chapter_number = ${} RETURNING id, novel_id, chapter_number, title, content, view_count, published_at, created_at, updated_at",
        updates.join(", "),
        param_idx,
        param_idx + 1
    );

    let mut query = sqlx::query_as::<_, NovelChapter>(&sql);
    for binding in bindings {
        query = query.bind(binding);
    }
    query = query.bind(&slug).bind(chapter_number);

    let chapter = query.fetch_one(&state.pool).await?;

    Ok(Json(chapter))
}

/// Delete a chapter (requires authentication)
async fn delete_chapter(
    State(state): State<AppState>,
    _auth: AuthUser,
    Path((slug, chapter_number)): Path<(String, i32)>,
) -> Result<StatusCode, AppError> {
    sqlx::query(
        "DELETE FROM novel_chapters WHERE novel_id = (SELECT id FROM novels WHERE slug = $1) AND chapter_number = $2"
    )
        .bind(&slug)
        .bind(chapter_number)
        .execute(&state.pool)
        .await?;

    Ok(StatusCode::NO_CONTENT)
}
