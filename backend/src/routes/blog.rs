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
    models::{BlogPost, CreateBlogPost, UpdateBlogPost},
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(list_posts).post(create_post))
        .route("/:slug", get(get_post).put(update_post).delete(delete_post))
}

#[derive(Debug, Deserialize)]
struct ListQuery {
    #[serde(default)]
    published: Option<bool>,
    #[serde(default = "default_limit")]
    limit: i64,
    #[serde(default)]
    offset: i64,
}

fn default_limit() -> i64 {
    20
}

/// List all blog posts
async fn list_posts(
    State(state): State<AppState>,
    Query(query): Query<ListQuery>,
) -> Result<impl IntoResponse, AppError> {
    let mut where_clause = String::new();
    if let Some(published) = query.published {
        where_clause = format!(" WHERE published = {}", published);
    }

    let sql = format!(
        "SELECT id, slug, title, content, excerpt, tags, published, view_count, published_at, created_at, updated_at FROM blog_posts{} ORDER BY published_at DESC NULLS LAST LIMIT $1 OFFSET $2",
        where_clause
    );

    let posts: Vec<BlogPost> = sqlx::query_as(&sql)
        .bind(query.limit)
        .bind(query.offset)
        .fetch_all(&state.pool)
        .await?;

    Ok(Json(posts))
}

/// Get a single blog post by slug
async fn get_post(
    State(state): State<AppState>,
    Path(slug): Path<String>,
) -> Result<impl IntoResponse, AppError> {
    let post = sqlx::query_as::<_, BlogPost>(
        "SELECT id, slug, title, content, excerpt, tags, published, view_count, published_at, created_at, updated_at FROM blog_posts WHERE slug = $1"
    )
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

    let tags: Vec<String> = payload.tags.unwrap_or_default();

    // Generate slug from provided value or create UUID-based slug
    let slug = match &payload.slug {
        Some(s) if !s.trim().is_empty() => s.trim().to_string(),
        _ => format!(
            "post-{}",
            Uuid::new_v4()
                .to_string()
                .split('-')
                .next()
                .unwrap_or("unknown")
        ),
    };

    // Check for duplicate slug
    let existing = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM blog_posts WHERE slug = $1")
        .bind(&slug)
        .fetch_one(&state.pool)
        .await?;

    let final_slug = if existing > 0 {
        format!(
            "{}-{}",
            slug,
            Uuid::new_v4().to_string().split('-').next().unwrap_or("1")
        )
    } else {
        slug
    };

    let post = sqlx::query_as::<_, BlogPost>(
        "INSERT INTO blog_posts (slug, title, content, excerpt, tags, published, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, slug, title, content, excerpt, tags, published, view_count, published_at, created_at, updated_at"
    )
    .bind(&final_slug)
    .bind(&payload.title)
    .bind(&payload.content)
    .bind(&payload.excerpt)
    .bind(&tags)
    .bind(payload.published.unwrap_or(false))
    .bind(payload.published_at)
    .fetch_one(&state.pool)
    .await?;

    Ok((StatusCode::CREATED, Json(post)))
}

/// Update a blog post (requires authentication)
async fn update_post(
    State(state): State<AppState>,
    _auth: AuthUser,
    Path(slug): Path<String>,
    Json(payload): Json<UpdateBlogPost>,
) -> Result<impl IntoResponse, AppError> {
    // First, get the existing post
    let existing = sqlx::query_as::<_, BlogPost>(
        "SELECT id, slug, title, content, excerpt, tags, published, view_count, published_at, created_at, updated_at FROM blog_posts WHERE slug = $1"
    )
    .bind(&slug)
    .fetch_optional(&state.pool)
    .await?
    .ok_or_else(|| AppError::NotFound("Blog post not found".to_string()))?;

    // Merge with existing values
    let title = payload.title.unwrap_or(existing.title);
    let content = payload.content.unwrap_or(existing.content);
    let excerpt = payload.excerpt.or(existing.excerpt);
    let tags = payload.tags.unwrap_or(existing.tags);
    let published = payload.published.unwrap_or(existing.published);
    let published_at = payload.published_at.or(existing.published_at);

    // Update with proper typed bindings
    let post = sqlx::query_as::<_, BlogPost>(
        "UPDATE blog_posts SET title = $1, content = $2, excerpt = $3, tags = $4, published = $5, published_at = $6, updated_at = NOW() WHERE slug = $7 RETURNING id, slug, title, content, excerpt, tags, published, view_count, published_at, created_at, updated_at"
    )
    .bind(&title)
    .bind(&content)
    .bind(&excerpt)
    .bind(&tags)
    .bind(published)
    .bind(published_at)
    .bind(&slug)
    .fetch_one(&state.pool)
    .await?;

    Ok(Json(post))
}

/// Delete a blog post (requires authentication)
async fn delete_post(
    State(state): State<AppState>,
    _auth: AuthUser,
    Path(slug): Path<String>,
) -> Result<StatusCode, AppError> {
    sqlx::query("DELETE FROM blog_posts WHERE slug = $1")
        .bind(&slug)
        .execute(&state.pool)
        .await?;

    Ok(StatusCode::NO_CONTENT)
}
