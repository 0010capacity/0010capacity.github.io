use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use validator::Validate;

/// Admin user model
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Admin {
    pub id: Uuid,
    pub username: String,
    #[serde(skip_serializing)]
    pub password_hash: String,
    pub created_at: DateTime<Utc>,
}

/// Login request
#[derive(Debug, Deserialize, Validate)]
pub struct LoginRequest {
    #[validate(length(min = 3, max = 100))]
    pub username: String,

    #[validate(length(min = 6))]
    pub password: String,
}

/// Login response
#[derive(Debug, Serialize)]
pub struct LoginResponse {
    pub token: String,
    pub expires_at: DateTime<Utc>,
    pub user: AdminInfo,
}

/// Admin info (without password)
#[derive(Debug, Serialize, Deserialize)]
pub struct AdminInfo {
    pub id: Uuid,
    pub username: String,
}

/// JWT Claims
#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String, // user id
    pub username: String,
    pub exp: i64, // expiration timestamp
    pub iat: i64, // issued at timestamp
}

impl Claims {
    pub fn new(admin_id: Uuid, username: String, expiration_seconds: i64) -> Self {
        let now = Utc::now().timestamp();
        Self {
            sub: admin_id.to_string(),
            username,
            exp: now + expiration_seconds,
            iat: now,
        }
    }
}
