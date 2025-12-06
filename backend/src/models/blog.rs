use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use validator::Validate;

/// Blog post model
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct BlogPost {
    pub id: Uuid,
    pub slug: String,
    pub title: String,
    pub content: String, // Markdown
    pub excerpt: Option<String>,
    pub tags: Vec<String>,
    pub published: bool,
    pub view_count: i64,
    pub published_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Create blog post request
#[derive(Debug, Deserialize, Validate)]
pub struct CreateBlogPost {
    #[validate(length(max = 255))]
    pub slug: Option<String>, // Optional - will be auto-generated from UUID if not provided

    #[validate(length(min = 1, max = 500))]
    pub title: String,

    #[validate(length(min = 1))]
    pub content: String,

    #[validate(length(max = 1000))]
    pub excerpt: Option<String>,

    pub tags: Option<Vec<String>>,
    pub published: Option<bool>,
    pub published_at: Option<DateTime<Utc>>,
}

/// Update blog post request
#[derive(Debug, Deserialize, Validate)]
pub struct UpdateBlogPost {
    #[validate(length(min = 1, max = 500))]
    pub title: Option<String>,

    #[validate(length(min = 1))]
    pub content: Option<String>,

    #[validate(length(max = 1000))]
    pub excerpt: Option<String>,

    pub tags: Option<Vec<String>>,
    pub published: Option<bool>,
    pub published_at: Option<DateTime<Utc>>,
}

/// Blog post preview (without full content)
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct BlogPostPreview {
    pub id: Uuid,
    pub slug: String,
    pub title: String,
    pub excerpt: Option<String>,
    pub tags: Vec<String>,
    pub published: bool,
    pub view_count: i64,
    pub published_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
