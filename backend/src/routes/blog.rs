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
        "SELECT id, slug, title, content, excerpt, cover_image_url, tags, published, view_count, published_at, created_at, updated_at FROM blog_posts{} ORDER BY published_at DESC NULLS LAST LIMIT $1 OFFSET $2",
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
        "SELECT id, slug, title, content, excerpt, cover_image_url, tags, published, view_count, published_at, created_at, updated_at FROM blog_posts WHERE slug = $1"
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
        "INSERT INTO blog_posts (slug, title, content, excerpt, cover_image_url, tags, published, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, slug, title, content, excerpt, cover_image_url, tags, published, view_count, published_at, created_at, updated_at"
    )
    .bind(&final_slug)
    .bind(&payload.title)
    .bind(&payload.content)
    .bind(&payload.excerpt)
    .bind(&payload.cover_image_url)
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
    if let Some(excerpt) = &payload.excerpt {
        updates.push(format!("excerpt = ${}", updates.len() + 1));
        bindings.push(excerpt.clone());
    }
    if let Some(cover) = &payload.cover_image_url {
        updates.push(format!("cover_image_url = ${}", updates.len() + 1));
        bindings.push(cover.clone());
    }
    if let Some(published) = payload.published {
        updates.push(format!("published = ${}", updates.len() + 1));
        bindings.push(published.to_string());
    }
    if let Some(published_at) = payload.published_at {
        updates.push(format!("published_at = ${}", updates.len() + 1));
        bindings.push(published_at.to_rfc3339());
    }

    if updates.is_empty() {
        return Err(AppError::BadRequest("No fields to update".to_string()));
    }

    updates.push("updated_at = NOW()".to_string());
    let param_idx = updates.len();

    let sql = format!(
        "UPDATE blog_posts SET {} WHERE slug = ${} RETURNING id, slug, title, content, excerpt, cover_image_url, tags, published, view_count, published_at, created_at, updated_at",
        updates.join(", "),
        param_idx
    );

    let mut query = sqlx::query_as::<_, BlogPost>(&sql);
    for binding in bindings {
        query = query.bind(binding);
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
) -> Result<StatusCode, AppError> {
    sqlx::query("DELETE FROM blog_posts WHERE slug = $1")
        .bind(&slug)
        .execute(&state.pool)
        .await?;

    Ok(StatusCode::NO_CONTENT)
}
