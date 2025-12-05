use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use validator::Validate;

/// Platform types for apps
pub const PLATFORMS: &[(&str, &str)] = &[
    ("ios", "iOS"),
    ("android", "Android"),
    ("web", "Web"),
    ("windows", "Windows"),
    ("macos", "macOS"),
    ("linux", "Linux"),
    ("game", "Game"),
];

/// Distribution channel types
pub const DISTRIBUTION_CHANNELS: &[(&str, &str)] = &[
    ("app_store", "App Store"),
    ("play_store", "Google Play"),
    ("web", "Web App"),
    ("steam", "Steam"),
    ("stove", "Stove"),
    ("epic", "Epic Games"),
    ("gog", "GOG"),
    ("itch", "itch.io"),
    ("landing_page", "Landing Page"),
    ("direct_download", "Direct Download"),
    ("github", "GitHub Releases"),
    ("other", "Other"),
];

/// Get all available platforms
pub fn get_all_platforms() -> Vec<serde_json::Value> {
    PLATFORMS
        .iter()
        .map(|(id, name)| {
            serde_json::json!({
                "id": id,
                "name": name
            })
        })
        .collect()
}

/// Get all available distribution channels
pub fn get_all_distribution_channels() -> Vec<serde_json::Value> {
    DISTRIBUTION_CHANNELS
        .iter()
        .map(|(id, name)| {
            serde_json::json!({
                "id": id,
                "name": name
            })
        })
        .collect()
}

/// App model
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct App {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
    pub platforms: Vec<String>, // ["ios", "android", "web", "windows", "macos", "linux", "game"]
    pub icon_url: Option<String>,
    pub screenshots: Vec<String>,
    pub distribution_channels: serde_json::Value, // JSON array: [{"type": "app_store", "url": "...", "label": "..."}]
    pub privacy_policy_url: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Distribution channel entry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DistributionChannel {
    #[serde(rename = "type")]
    pub channel_type: String, // app_store, play_store, web, steam, stove, etc.
    pub url: String,
    pub label: Option<String>, // Optional custom label
}

/// Create app request
#[derive(Debug, Deserialize, Validate)]
pub struct CreateApp {
    #[validate(length(min = 1, max = 255))]
    pub name: String,

    // Ignored: slug is always auto-generated from UUID
    pub slug: Option<String>,

    pub description: Option<String>,

    // Array of platforms: ["ios", "android", "web", etc.]
    pub platforms: Option<Vec<String>>,

    pub icon_url: Option<String>,
    pub screenshots: Option<Vec<String>>,

    // Array of distribution channels
    pub distribution_channels: Option<Vec<DistributionChannel>>,

    pub privacy_policy_url: Option<String>,
}

/// Update app request
#[derive(Debug, Deserialize, Validate)]
pub struct UpdateApp {
    #[validate(length(min = 1, max = 255))]
    pub name: Option<String>,

    pub description: Option<String>,

    pub platforms: Option<Vec<String>>,

    pub icon_url: Option<String>,
    pub screenshots: Option<Vec<String>>,
    pub distribution_channels: Option<Vec<DistributionChannel>>,
    pub privacy_policy_url: Option<String>,
}
