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
    models::{
        get_all_genres, get_all_novel_types, AddRelatedNovel, CreateChapter, CreateNovel, Novel,
        NovelChapter, RelatedNovel, UpdateChapter, UpdateNovel,
    },
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(list_novels).post(create_novel))
        .route("/genres", get(list_genres))
        .route("/types", get(list_novel_types))
        .route(
            "/:slug",
            get(get_novel).put(update_novel).delete(delete_novel),
        )
        .route("/:slug/chapters", get(list_chapters).post(create_chapter))
        .route(
            "/:slug/chapters/:number",
            get(get_chapter).put(update_chapter).delete(delete_chapter),
        )
        .route(
            "/:slug/relations",
            get(list_relations)
                .post(add_relation)
                .delete(remove_relation),
        )
}

#[derive(Debug, Deserialize)]
struct ListQuery {
    #[serde(default)]
    status: Option<String>,
    #[serde(default)]
    novel_type: Option<String>,
    #[serde(default)]
    genre: Option<String>,
    #[serde(default = "default_limit")]
    limit: i64,
    #[serde(default)]
    offset: i64,
    /// If true, include draft novels (for admin use). Defaults to false.
    #[serde(default)]
    include_drafts: bool,
}

fn default_limit() -> i64 {
    50
}

/// Generate a UUID-based slug for novels
fn generate_slug() -> String {
    format!("novel-{}", &Uuid::new_v4().to_string()[..8])
}

/// Ensure slug is unique by appending a number if necessary
async fn ensure_unique_slug(pool: &sqlx::PgPool, base_slug: &str) -> Result<String, AppError> {
    let mut slug = base_slug.to_string();
    let mut counter = 1;

    loop {
        let exists: Option<(i64,)> = sqlx::query_as("SELECT 1 FROM novels WHERE slug = $1 LIMIT 1")
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
            slug = format!(
                "{}-{}",
                base_slug,
                Uuid::new_v4().to_string()[..8].to_string()
            );
            break;
        }
    }

    Ok(slug)
}

/// List all genres
async fn list_genres() -> impl IntoResponse {
    Json(get_all_genres())
}

/// List all novel types
async fn list_novel_types() -> impl IntoResponse {
    Json(get_all_novel_types())
}

/// List all novels
async fn list_novels(
    State(state): State<AppState>,
    Query(query): Query<ListQuery>,
) -> Result<impl IntoResponse, AppError> {
    let mut conditions = Vec::new();
    let mut param_count = 0;

    // By default, exclude draft novels from public view
    // Only include drafts if explicitly requested (e.g., by admin)
    if !query.include_drafts && query.status.is_none() {
        conditions.push("status != 'draft'".to_string());
    }

    if query.status.is_some() {
        param_count += 1;
        conditions.push(format!("status = ${}", param_count));
    }
    if query.novel_type.is_some() {
        param_count += 1;
        conditions.push(format!("novel_type = ${}", param_count));
    }
    if query.genre.is_some() {
        param_count += 1;
        conditions.push(format!("${}::text = ANY(genres)", param_count));
    }

    let where_clause = if conditions.is_empty() {
        String::new()
    } else {
        format!(" WHERE {}", conditions.join(" AND "))
    };

    let sql = format!(
        "SELECT id, slug, title, description, novel_type, genre, genres, status, view_count, created_at, updated_at
         FROM novels{}
         ORDER BY created_at DESC
         LIMIT ${} OFFSET ${}",
        where_clause,
        param_count + 1,
        param_count + 2
    );

    let mut query_builder = sqlx::query_as::<_, Novel>(&sql);

    if let Some(ref status) = query.status {
        query_builder = query_builder.bind(status);
    }
    if let Some(ref novel_type) = query.novel_type {
        query_builder = query_builder.bind(novel_type);
    }
    if let Some(ref genre) = query.genre {
        query_builder = query_builder.bind(genre);
    }

    query_builder = query_builder.bind(query.limit).bind(query.offset);

    let novels: Vec<Novel> = query_builder.fetch_all(&state.pool).await?;

    // Get total count
    let count_sql = format!("SELECT COUNT(*) as count FROM novels{}", where_clause);

    let mut count_query = sqlx::query_scalar::<_, i64>(&count_sql);
    if let Some(ref status) = query.status {
        count_query = count_query.bind(status);
    }
    if let Some(ref novel_type) = query.novel_type {
        count_query = count_query.bind(novel_type);
    }
    if let Some(ref genre) = query.genre {
        count_query = count_query.bind(genre);
    }

    let total: i64 = count_query.fetch_one(&state.pool).await.unwrap_or(0);

    Ok(Json(serde_json::json!({
        "novels": novels,
        "total": total
    })))
}

/// Get a single novel by slug with related novels
async fn get_novel(
    State(state): State<AppState>,
    Path(slug): Path<String>,
) -> Result<impl IntoResponse, AppError> {
    let novel = sqlx::query_as::<_, Novel>(
        "SELECT id, slug, title, description, novel_type, genre, genres, status, view_count, created_at, updated_at
         FROM novels WHERE slug = $1",
    )
    .bind(&slug)
    .fetch_one(&state.pool)
    .await?;

    // Get related novels
    let related_novels = sqlx::query_as::<_, RelatedNovel>(
        "SELECT n.id, n.slug, n.title, nr.relation_type
         FROM novel_relations nr
         JOIN novels n ON nr.related_novel_id = n.id
         WHERE nr.novel_id = $1
         ORDER BY n.title",
    )
    .bind(novel.id)
    .fetch_all(&state.pool)
    .await
    .unwrap_or_default();

    // Get chapter count
    let chapter_count: i64 =
        sqlx::query_scalar("SELECT COUNT(*) FROM novel_chapters WHERE novel_id = $1")
            .bind(novel.id)
            .fetch_one(&state.pool)
            .await
            .unwrap_or(0);

    Ok(Json(serde_json::json!({
        "id": novel.id,
        "slug": novel.slug,
        "title": novel.title,
        "description": novel.description,
        "novel_type": novel.novel_type,
        "genre": novel.genre,
        "genres": novel.genres,
        "status": novel.status,
        "view_count": novel.view_count,
        "created_at": novel.created_at,
        "updated_at": novel.updated_at,
        "chapter_count": chapter_count,
        "related_novels": related_novels
    })))
}

/// Create a new novel (requires authentication)
async fn create_novel(
    State(state): State<AppState>,
    _auth: AuthUser,
    Json(payload): Json<CreateNovel>,
) -> Result<impl IntoResponse, AppError> {
    payload.validate()?;

    // Always generate UUID-based slug (ignore any provided slug)
    let base_slug = generate_slug();

    let slug = ensure_unique_slug(&state.pool, &base_slug).await?;

    let novel_type = payload.novel_type.unwrap_or_else(|| "series".to_string());
    let status = payload.status.unwrap_or_else(|| "draft".to_string());
    let genres = payload.genres.unwrap_or_default();

    let novel = sqlx::query_as::<_, Novel>(
        "INSERT INTO novels (slug, title, description, novel_type, genres, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, slug, title, description, novel_type, genre, genres, status, view_count, created_at, updated_at",
    )
    .bind(&slug)
    .bind(&payload.title)
    .bind(&payload.description)
    .bind(&novel_type)
    .bind(&genres)
    .bind(&status)
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
    let mut param_idx = 0;

    if payload.title.is_some() {
        param_idx += 1;
        updates.push(format!("title = ${}", param_idx));
    }
    if payload.description.is_some() {
        param_idx += 1;
        updates.push(format!("description = ${}", param_idx));
    }
    if payload.novel_type.is_some() {
        param_idx += 1;
        updates.push(format!("novel_type = ${}", param_idx));
    }
    if payload.genres.is_some() {
        param_idx += 1;
        updates.push(format!("genres = ${}", param_idx));
    }
    if payload.status.is_some() {
        param_idx += 1;
        updates.push(format!("status = ${}", param_idx));
    }

    if updates.is_empty() {
        return Err(AppError::BadRequest("No fields to update".to_string()));
    }

    updates.push("updated_at = NOW()".to_string());
    param_idx += 1;

    let sql = format!(
        "UPDATE novels SET {} WHERE slug = ${}
         RETURNING id, slug, title, description, novel_type, genre, genres, status, view_count, created_at, updated_at",
        updates.join(", "),
        param_idx
    );

    let mut query = sqlx::query_as::<_, Novel>(&sql);

    if let Some(ref title) = payload.title {
        query = query.bind(title);
    }
    if let Some(ref description) = payload.description {
        query = query.bind(description);
    }
    if let Some(ref novel_type) = payload.novel_type {
        query = query.bind(novel_type);
    }
    if let Some(ref genres) = payload.genres {
        query = query.bind(genres);
    }
    if let Some(ref status) = payload.status {
        query = query.bind(status);
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

// Related novels endpoints

/// List related novels
async fn list_relations(
    State(state): State<AppState>,
    Path(slug): Path<String>,
) -> Result<impl IntoResponse, AppError> {
    let related = sqlx::query_as::<_, RelatedNovel>(
        "SELECT n.id, n.slug, n.title, nr.relation_type
         FROM novel_relations nr
         JOIN novels n ON nr.related_novel_id = n.id
         WHERE nr.novel_id = (SELECT id FROM novels WHERE slug = $1)
         ORDER BY n.title",
    )
    .bind(&slug)
    .fetch_all(&state.pool)
    .await?;

    Ok(Json(related))
}

/// Add a related novel
async fn add_relation(
    State(state): State<AppState>,
    _auth: AuthUser,
    Path(slug): Path<String>,
    Json(payload): Json<AddRelatedNovel>,
) -> Result<impl IntoResponse, AppError> {
    payload.validate()?;

    let relation_type = payload
        .relation_type
        .unwrap_or_else(|| "related".to_string());

    // Get both novel IDs
    let novel_id: (Uuid,) = sqlx::query_as("SELECT id FROM novels WHERE slug = $1")
        .bind(&slug)
        .fetch_one(&state.pool)
        .await?;

    let related_id: (Uuid,) = sqlx::query_as("SELECT id FROM novels WHERE slug = $1")
        .bind(&payload.related_novel_slug)
        .fetch_one(&state.pool)
        .await?;

    // Insert the relation (ignore if already exists)
    sqlx::query(
        "INSERT INTO novel_relations (novel_id, related_novel_id, relation_type)
         VALUES ($1, $2, $3)
         ON CONFLICT (novel_id, related_novel_id) DO UPDATE SET relation_type = $3",
    )
    .bind(novel_id.0)
    .bind(related_id.0)
    .bind(&relation_type)
    .execute(&state.pool)
    .await?;

    Ok(StatusCode::CREATED)
}

#[derive(Debug, Deserialize)]
struct RemoveRelationQuery {
    related_slug: String,
}

/// Remove a related novel
async fn remove_relation(
    State(state): State<AppState>,
    _auth: AuthUser,
    Path(slug): Path<String>,
    Query(query): Query<RemoveRelationQuery>,
) -> Result<StatusCode, AppError> {
    sqlx::query(
        "DELETE FROM novel_relations
         WHERE novel_id = (SELECT id FROM novels WHERE slug = $1)
         AND related_novel_id = (SELECT id FROM novels WHERE slug = $2)",
    )
    .bind(&slug)
    .bind(&query.related_slug)
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
    Path((slug, chapter_number)): Path<(String, i32)>,
) -> Result<impl IntoResponse, AppError> {
    let chapter = sqlx::query_as::<_, NovelChapter>(
        "SELECT c.id, c.novel_id, c.chapter_number, c.title, c.content, c.view_count, c.published_at, c.created_at, c.updated_at
         FROM novel_chapters c
         JOIN novels n ON c.novel_id = n.id
         WHERE n.slug = $1 AND c.chapter_number = $2",
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
    Json(mut payload): Json<CreateChapter>,
) -> Result<impl IntoResponse, AppError> {
    payload.validate()?;

    // Sanitize content to remove null bytes
    payload.content = payload.content.replace('\0', "");

    // Get novel by slug
    let novel_id: (Uuid,) = sqlx::query_as("SELECT id FROM novels WHERE slug = $1")
        .bind(&slug)
        .fetch_one(&state.pool)
        .await?;

    let chapter_number = payload.chapter_number;
    let chapter = sqlx::query_as::<_, NovelChapter>(
        "INSERT INTO novel_chapters (novel_id, chapter_number, title, content, published_at)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, novel_id, chapter_number, title, content, view_count, published_at, created_at, updated_at",
    )
    .bind(novel_id.0)
    .bind(chapter_number)
    .bind(&payload.title)
    .bind(&payload.content)
    .bind(payload.published_at)
    .fetch_one(&state.pool)
    .await
    .map_err(|e| {
        if let sqlx::Error::Database(ref db_err) = e {
            if db_err.code().as_deref() == Some("23505") {
                return AppError::Conflict(format!("Chapter {} already exists", chapter_number));
            }
        }
        e.into()
    })?;

    Ok((StatusCode::CREATED, Json(chapter)))
}

/// Update a chapter (requires authentication)
async fn update_chapter(
    State(state): State<AppState>,
    _auth: AuthUser,
    Path((slug, chapter_number)): Path<(String, i32)>,
    Json(mut payload): Json<UpdateChapter>,
) -> Result<impl IntoResponse, AppError> {
    // Sanitize content to remove null bytes if present
    if let Some(ref mut content) = payload.content {
        *content = content.replace('\0', "");
    }

    let mut updates = Vec::<String>::new();
    let mut param_idx = 0;

    if payload.title.is_some() {
        param_idx += 1;
        updates.push(format!("title = ${}", param_idx));
    }
    if payload.content.is_some() {
        param_idx += 1;
        updates.push(format!("content = ${}", param_idx));
    }

    if updates.is_empty() {
        return Err(AppError::BadRequest("No fields to update".to_string()));
    }

    updates.push("updated_at = NOW()".to_string());

    let sql = format!(
        "UPDATE novel_chapters SET {}
         WHERE novel_id = (SELECT id FROM novels WHERE slug = ${}) AND chapter_number = ${}
         RETURNING id, novel_id, chapter_number, title, content, view_count, published_at, created_at, updated_at",
        updates.join(", "),
        param_idx + 1,
        param_idx + 2
    );

    let mut query = sqlx::query_as::<_, NovelChapter>(&sql);

    if let Some(ref title) = payload.title {
        query = query.bind(title);
    }
    if let Some(ref content) = payload.content {
        query = query.bind(content);
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
        "DELETE FROM novel_chapters
         WHERE novel_id = (SELECT id FROM novels WHERE slug = $1) AND chapter_number = $2",
    )
    .bind(&slug)
    .bind(chapter_number)
    .execute(&state.pool)
    .await?;

    Ok(StatusCode::NO_CONTENT)
}
