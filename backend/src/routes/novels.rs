use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{delete, get, post, put},
    Json, Router,
};
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;
use validator::Validate;

use crate::{
    db::AppState,
    error::AppError,
    middleware::auth::AuthUser,
    models::{
        ChapterPreview, CreateChapter, CreateNovel, Novel, NovelChapter, NovelWithStats,
        UpdateChapter, UpdateNovel,
    },
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
        .route("/:slug/increment-view", post(increment_novel_view))
        .route(
            "/:slug/chapters/:number/increment-view",
            post(increment_chapter_view),
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
    let mut sql = "SELECT n.*, COUNT(c.id) as chapter_count
                   FROM novels n
                   LEFT JOIN novel_chapters c ON n.id = c.novel_id"
        .to_string();

    if let Some(ref status) = query.status {
        sql.push_str(&format!(" WHERE n.status = '{}'", status));
    }

    sql.push_str(" GROUP BY n.id ORDER BY n.created_at DESC LIMIT $1 OFFSET $2");

    let novels = sqlx::query_as::<_, NovelWithStats>(&sql)
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
    let novel = sqlx::query_as::<_, Novel>("SELECT * FROM novels WHERE slug = $1")
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

    let status = payload.status.unwrap_or_else(|| "draft".to_string());

    let novel = sqlx::query_as::<_, Novel>(
        "INSERT INTO novels (slug, title, description, cover_image_url, genre, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *",
    )
    .bind(&payload.slug)
    .bind(&payload.title)
    .bind(&payload.description)
    .bind(&payload.cover_image_url)
    .bind(&payload.genre)
    .bind(&status)
    .fetch_one(&state.pool)
    .await
    .map_err(|e| {
        if let sqlx::Error::Database(db_err) = &e {
            if db_err.is_unique_violation() {
                return AppError::Conflict("Novel with this slug already exists".to_string());
            }
        }
        AppError::from(e)
    })?;

    Ok((StatusCode::CREATED, Json(novel)))
}

/// Update a novel (requires authentication)
async fn update_novel(
    State(state): State<AppState>,
    _auth: AuthUser,
    Path(slug): Path<String>,
    Json(payload): Json<UpdateNovel>,
) -> Result<impl IntoResponse, AppError> {
    payload.validate()?;

    // Build dynamic update query
    let mut updates = Vec::new();
    let mut values: Vec<String> = Vec::new();

    if let Some(title) = &payload.title {
        updates.push(format!("title = ${}", updates.len() + 1));
        values.push(title.clone());
    }
    if let Some(description) = &payload.description {
        updates.push(format!("description = ${}", updates.len() + 1));
        values.push(description.clone());
    }
    if let Some(cover_image_url) = &payload.cover_image_url {
        updates.push(format!("cover_image_url = ${}", updates.len() + 1));
        values.push(cover_image_url.clone());
    }
    if let Some(genre) = &payload.genre {
        updates.push(format!("genre = ${}", updates.len() + 1));
        values.push(genre.clone());
    }
    if let Some(status) = &payload.status {
        updates.push(format!("status = ${}", updates.len() + 1));
        values.push(status.clone());
    }

    if updates.is_empty() {
        return Err(AppError::BadRequest("No fields to update".to_string()));
    }

    updates.push("updated_at = NOW()".to_string());

    let query_str = format!(
        "UPDATE novels SET {} WHERE slug = ${} RETURNING *",
        updates.join(", "),
        updates.len()
    );

    let mut query = sqlx::query_as::<_, Novel>(&query_str);
    for value in values {
        query = query.bind(value);
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
) -> Result<impl IntoResponse, AppError> {
    let result = sqlx::query("DELETE FROM novels WHERE slug = $1")
        .bind(&slug)
        .execute(&state.pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("Novel".to_string()));
    }

    Ok(StatusCode::NO_CONTENT)
}

/// List chapters for a novel
async fn list_chapters(
    State(state): State<AppState>,
    Path(slug): Path<String>,
) -> Result<impl IntoResponse, AppError> {
    let chapters = sqlx::query_as::<_, ChapterPreview>(
        "SELECT c.id, c.novel_id, c.chapter_number, c.title, c.view_count,
                c.published_at, c.created_at
         FROM novel_chapters c
         JOIN novels n ON c.novel_id = n.id
         WHERE n.slug = $1
         ORDER BY c.chapter_number ASC",
    )
    .bind(&slug)
    .fetch_all(&state.pool)
    .await?;

    Ok(Json(chapters))
}

/// Get a specific chapter
async fn get_chapter(
    State(state): State<AppState>,
    Path((slug, number)): Path<(String, i32)>,
) -> Result<impl IntoResponse, AppError> {
    let chapter = sqlx::query_as::<_, NovelChapter>(
        "SELECT c.*
         FROM novel_chapters c
         JOIN novels n ON c.novel_id = n.id
         WHERE n.slug = $1 AND c.chapter_number = $2",
    )
    .bind(&slug)
    .bind(number)
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

    // Get novel ID from slug
    let novel: (Uuid,) = sqlx::query_as("SELECT id FROM novels WHERE slug = $1")
        .bind(&slug)
        .fetch_one(&state.pool)
        .await?;

    let chapter = sqlx::query_as::<_, NovelChapter>(
        "INSERT INTO novel_chapters (novel_id, chapter_number, title, content, published_at)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *",
    )
    .bind(novel.0)
    .bind(payload.chapter_number)
    .bind(&payload.title)
    .bind(&payload.content)
    .bind(payload.published_at)
    .fetch_one(&state.pool)
    .await
    .map_err(|e| {
        if let sqlx::Error::Database(db_err) = &e {
            if db_err.is_unique_violation() {
                return AppError::Conflict(
                    "Chapter number already exists for this novel".to_string(),
                );
            }
        }
        AppError::from(e)
    })?;

    Ok((StatusCode::CREATED, Json(chapter)))
}

/// Update a chapter (requires authentication)
async fn update_chapter(
    State(state): State<AppState>,
    _auth: AuthUser,
    Path((slug, number)): Path<(String, i32)>,
    Json(payload): Json<UpdateChapter>,
) -> Result<impl IntoResponse, AppError> {
    payload.validate()?;

    let mut updates = Vec::new();
    let mut bind_count = 1;

    let mut query = sqlx::QueryBuilder::new("UPDATE novel_chapters SET ");

    if let Some(title) = &payload.title {
        if bind_count > 1 {
            query.push(", ");
        }
        query.push(format!("title = ${}", bind_count));
        bind_count += 1;
    }

    if let Some(content) = &payload.content {
        if bind_count > 1 {
            query.push(", ");
        }
        query.push(format!("content = ${}", bind_count));
        bind_count += 1;
    }

    if let Some(published_at) = payload.published_at {
        if bind_count > 1 {
            query.push(", ");
        }
        query.push(format!("published_at = ${}", bind_count));
        bind_count += 1;
    }

    query.push(", updated_at = NOW() ");
    query.push(format!(
        "WHERE novel_id = (SELECT id FROM novels WHERE slug = ${}) ",
        bind_count
    ));
    bind_count += 1;
    query.push(format!("AND chapter_number = ${} RETURNING *", bind_count));

    let mut sql_query = query.build_query_as::<NovelChapter>();

    if let Some(title) = &payload.title {
        sql_query = sql_query.bind(title);
    }
    if let Some(content) = &payload.content {
        sql_query = sql_query.bind(content);
    }
    if let Some(published_at) = payload.published_at {
        sql_query = sql_query.bind(published_at);
    }

    sql_query = sql_query.bind(&slug).bind(number);

    let chapter = sql_query.fetch_one(&state.pool).await?;

    Ok(Json(chapter))
}

/// Delete a chapter (requires authentication)
async fn delete_chapter(
    State(state): State<AppState>,
    _auth: AuthUser,
    Path((slug, number)): Path<(String, i32)>,
) -> Result<impl IntoResponse, AppError> {
    let result = sqlx::query(
        "DELETE FROM novel_chapters
         WHERE novel_id = (SELECT id FROM novels WHERE slug = $1)
         AND chapter_number = $2",
    )
    .bind(&slug)
    .bind(number)
    .execute(&state.pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("Chapter".to_string()));
    }

    Ok(StatusCode::NO_CONTENT)
}

/// Increment novel view count
async fn increment_novel_view(
    State(state): State<AppState>,
    Path(slug): Path<String>,
) -> Result<impl IntoResponse, AppError> {
    sqlx::query("UPDATE novels SET view_count = view_count + 1 WHERE slug = $1")
        .bind(&slug)
        .execute(&state.pool)
        .await?;

    Ok(StatusCode::NO_CONTENT)
}

/// Increment chapter view count
async fn increment_chapter_view(
    State(state): State<AppState>,
    Path((slug, number)): Path<(String, i32)>,
) -> Result<impl IntoResponse, AppError> {
    sqlx::query(
        "UPDATE novel_chapters
         SET view_count = view_count + 1
         WHERE novel_id = (SELECT id FROM novels WHERE slug = $1)
         AND chapter_number = $2",
    )
    .bind(&slug)
    .bind(number)
    .execute(&state.pool)
    .await?;

    Ok(StatusCode::NO_CONTENT)
}
