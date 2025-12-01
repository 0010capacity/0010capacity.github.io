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
    models::{BlogPost, BlogPostPreview, CreateBlogPost, UpdateBlogPost},
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(list_posts).post(create_post))
        .route("/:slug", get(get_post).put(update_post).delete(delete_post))
        .route("/tags/:tag", get(list_posts_by_tag))
        .route("/:slug/increment-view", post(increment_view))
}

#[derive(Debug, Deserialize)]
struct ListQuery {
    #[serde(default)]
    published: Option<bool>,
    #[serde(default)]
    tag: Option<String>,
    #[serde(default = "default_limit")]
    limit: i64,
    #[serde(default)]
    offset: i64,
}

fn default_limit() -> i64 {
    50
}

/// List all blog posts
async fn list_posts(
    State(state): State<AppState>,
    Query(query): Query<ListQuery>,
) -> Result<impl IntoResponse, AppError> {
    let mut sql = "SELECT id, slug, title, excerpt, cover_image_url, tags, published,
                          view_count, published_at, created_at, updated_at
                   FROM blog_posts"
        .to_string();

    let mut conditions = Vec::new();

    if let Some(published) = query.published {
        conditions.push(format!("published = {}", published));
    }

    if let Some(ref tag) = query.tag {
        conditions.push(format!("'{}' = ANY(tags)", tag));
    }

    if !conditions.is_empty() {
        sql.push_str(&format!(" WHERE {}", conditions.join(" AND ")));
    }

    sql.push_str(" ORDER BY published_at DESC NULLS LAST, created_at DESC LIMIT $1 OFFSET $2");

    let posts = sqlx::query_as::<_, BlogPostPreview>(&sql)
        .bind(query.limit)
        .bind(query.offset)
        .fetch_all(&state.pool)
        .await?;

    Ok(Json(posts))
}

/// Get posts by tag
async fn list_posts_by_tag(
    State(state): State<AppState>,
    Path(tag): Path<String>,
) -> Result<impl IntoResponse, AppError> {
    let posts = sqlx::query_as::<_, BlogPostPreview>(
        "SELECT id, slug, title, excerpt, cover_image_url, tags, published,
                view_count, published_at, created_at, updated_at
         FROM blog_posts
         WHERE $1 = ANY(tags) AND published = true
         ORDER BY published_at DESC NULLS LAST, created_at DESC",
    )
    .bind(&tag)
    .fetch_all(&state.pool)
    .await?;

    Ok(Json(posts))
}

/// Get a single blog post by slug
async fn get_post(
    State(state): State<AppState>,
    Path(slug): Path<String>,
) -> Result<impl IntoResponse, AppError> {
    let post = sqlx::query_as::<_, BlogPost>("SELECT * FROM blog_posts WHERE slug = $1")
        .bind(&slug)
        .fetch_one(&state.pool)
        .await?;

    Ok(Json(post))
}

/// Create a new blog post (requires authentication)
async fn create_post(
    State(state): State<AppState>,
    _auth: AuthUser,
    Json(payload): Json<CreateBlogPost>,
) -> Result<impl IntoResponse, AppError> {
    payload.validate()?;

    let published = payload.published.unwrap_or(false);
    let tags = payload.tags.unwrap_or_default();

    let post = sqlx::query_as::<_, BlogPost>(
        "INSERT INTO blog_posts (slug, title, content, excerpt, cover_image_url, tags, published, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *",
    )
    .bind(&payload.slug)
    .bind(&payload.title)
    .bind(&payload.content)
    .bind(&payload.excerpt)
    .bind(&payload.cover_image_url)
    .bind(&tags)
    .bind(published)
    .bind(payload.published_at)
    .fetch_one(&state.pool)
    .await
    .map_err(|e| {
        if let sqlx::Error::Database(db_err) = &e {
            if db_err.is_unique_violation() {
                return AppError::Conflict("Blog post with this slug already exists".to_string());
            }
        }
        AppError::from(e)
    })?;

    Ok((StatusCode::CREATED, Json(post)))
}

/// Update a blog post (requires authentication)
async fn update_post(
    State(state): State<AppState>,
    _auth: AuthUser,
    Path(slug): Path<String>,
    Json(payload): Json<UpdateBlogPost>,
) -> Result<impl IntoResponse, AppError> {
    payload.validate()?;

    let mut updates = Vec::new();
    let mut values: Vec<Box<dyn std::fmt::Display>> = Vec::new();

    if let Some(title) = &payload.title {
        updates.push(format!("title = ${}", updates.len() + 1));
    }
    if let Some(content) = &payload.content {
        updates.push(format!("content = ${}", updates.len() + 1));
    }
    if let Some(excerpt) = &payload.excerpt {
        updates.push(format!("excerpt = ${}", updates.len() + 1));
    }
    if let Some(cover_image_url) = &payload.cover_image_url {
        updates.push(format!("cover_image_url = ${}", updates.len() + 1));
    }
    if payload.tags.is_some() {
        updates.push(format!("tags = ${}", updates.len() + 1));
    }
    if let Some(published) = payload.published {
        updates.push(format!("published = ${}", updates.len() + 1));
    }
    if payload.published_at.is_some() {
        updates.push(format!("published_at = ${}", updates.len() + 1));
    }

    if updates.is_empty() {
        return Err(AppError::BadRequest("No fields to update".to_string()));
    }

    updates.push("updated_at = NOW()".to_string());

    let query_str = format!(
        "UPDATE blog_posts SET {} WHERE slug = ${} RETURNING *",
        updates.join(", "),
        updates.len()
    );

    let mut query = sqlx::query_as::<_, BlogPost>(&query_str);

    if let Some(title) = &payload.title {
        query = query.bind(title);
    }
    if let Some(content) = &payload.content {
        query = query.bind(content);
    }
    if let Some(excerpt) = &payload.excerpt {
        query = query.bind(excerpt);
    }
    if let Some(cover_image_url) = &payload.cover_image_url {
        query = query.bind(cover_image_url);
    }
    if let Some(tags) = &payload.tags {
        query = query.bind(tags);
    }
    if let Some(published) = payload.published {
        query = query.bind(published);
    }
    if let Some(published_at) = payload.published_at {
        query = query.bind(published_at);
    }

    query = query.bind(&slug);

    let post = query.fetch_one(&state.pool).await?;

    Ok(Json(post))
}

/// Delete a blog post (requires authentication)
async fn delete_post(
    State(state): State<AppState>,
    _auth: AuthUser,
    Path(slug): Path<String>,
) -> Result<impl IntoResponse, AppError> {
    let result = sqlx::query("DELETE FROM blog_posts WHERE slug = $1")
        .bind(&slug)
        .execute(&state.pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("Blog post".to_string()));
    }

    Ok(StatusCode::NO_CONTENT)
}

/// Increment blog post view count
async fn increment_view(
    State(state): State<AppState>,
    Path(slug): Path<String>,
) -> Result<impl IntoResponse, AppError> {
    sqlx::query("UPDATE blog_posts SET view_count = view_count + 1 WHERE slug = $1")
        .bind(&slug)
        .execute(&state.pool)
        .await?;

    Ok(StatusCode::NO_CONTENT)
}
