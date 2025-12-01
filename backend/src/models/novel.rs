use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use validator::Validate;

/// Novel model
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Novel {
    pub id: Uuid,
    pub slug: String,
    pub title: String,
    pub description: Option<String>,
    pub cover_image_url: Option<String>,
    pub genre: Option<String>,
    pub status: String, // draft, ongoing, completed
    pub view_count: i64,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Novel chapter model
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct NovelChapter {
    pub id: Uuid,
    pub novel_id: Uuid,
    pub chapter_number: i32,
    pub title: String,
    pub content: String,
    pub view_count: i64,
    pub published_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Create novel request
#[derive(Debug, Deserialize, Validate)]
pub struct CreateNovel {
    #[validate(length(min = 1, max = 255))]
    pub slug: String,

    #[validate(length(min = 1, max = 500))]
    pub title: String,

    pub description: Option<String>,
    pub cover_image_url: Option<String>,

    #[validate(length(max = 100))]
    pub genre: Option<String>,

    pub status: Option<String>, // defaults to 'draft'
}

/// Update novel request
#[derive(Debug, Deserialize, Validate)]
pub struct UpdateNovel {
    #[validate(length(min = 1, max = 500))]
    pub title: Option<String>,

    pub description: Option<String>,
    pub cover_image_url: Option<String>,

    #[validate(length(max = 100))]
    pub genre: Option<String>,

    pub status: Option<String>,
}

/// Create chapter request
#[derive(Debug, Deserialize, Validate)]
pub struct CreateChapter {
    pub chapter_number: i32,

    #[validate(length(min = 1, max = 500))]
    pub title: String,

    #[validate(length(min = 1))]
    pub content: String,

    pub published_at: Option<DateTime<Utc>>,
}

/// Update chapter request
#[derive(Debug, Deserialize, Validate)]
pub struct UpdateChapter {
    #[validate(length(min = 1, max = 500))]
    pub title: Option<String>,

    #[validate(length(min = 1))]
    pub content: Option<String>,

    pub published_at: Option<DateTime<Utc>>,
}

/// Novel with chapters count
#[derive(Debug, Serialize)]
pub struct NovelWithStats {
    #[serde(flatten)]
    pub novel: Novel,
    pub chapter_count: i64,
}

/// Chapter preview (without full content)
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ChapterPreview {
    pub id: Uuid,
    pub novel_id: Uuid,
    pub chapter_number: i32,
    pub title: String,
    pub view_count: i64,
    pub published_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}
