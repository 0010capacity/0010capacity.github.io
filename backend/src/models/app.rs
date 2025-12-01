use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use validator::Validate;

/// App model
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct App {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
    pub platform: String, // ios, android, web, desktop
    pub icon_url: Option<String>,
    pub screenshots: Vec<String>,
    pub download_links: serde_json::Value, // JSON object with platform-specific links
    pub privacy_policy_url: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Create app request
#[derive(Debug, Deserialize, Validate)]
pub struct CreateApp {
    #[validate(length(min = 1, max = 255))]
    pub name: String,

    #[validate(length(min = 1, max = 255))]
    pub slug: String,

    pub description: Option<String>,

    #[validate(length(min = 1, max = 50))]
    pub platform: String,

    pub icon_url: Option<String>,
    pub screenshots: Option<Vec<String>>,
    pub download_links: Option<serde_json::Value>,
    pub privacy_policy_url: Option<String>,
}

/// Update app request
#[derive(Debug, Deserialize, Validate)]
pub struct UpdateApp {
    #[validate(length(min = 1, max = 255))]
    pub name: Option<String>,

    pub description: Option<String>,

    #[validate(length(min = 1, max = 50))]
    pub platform: Option<String>,

    pub icon_url: Option<String>,
    pub screenshots: Option<Vec<String>>,
    pub download_links: Option<serde_json::Value>,
    pub privacy_policy_url: Option<String>,
}
