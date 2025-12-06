use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use std::fmt;

/// Application error type
#[derive(Debug)]
pub enum AppError {
    // Database errors
    DatabaseError(sqlx::Error),

    // Authentication errors
    Unauthorized,
    InvalidToken,
    TokenExpired,
    InvalidCredentials,

    // Validation errors
    ValidationError(String),

    // Not found errors
    NotFound(String),

    // Conflict errors
    Conflict(String),

    // Internal errors
    InternalError(String),

    // Bad request
    BadRequest(String),
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::DatabaseError(e) => write!(f, "Database error: {}", e),
            AppError::Unauthorized => write!(f, "Unauthorized"),
            AppError::InvalidToken => write!(f, "Invalid token"),
            AppError::TokenExpired => write!(f, "Token expired"),
            AppError::InvalidCredentials => write!(f, "Invalid credentials"),
            AppError::ValidationError(msg) => write!(f, "Validation error: {}", msg),
            AppError::NotFound(resource) => write!(f, "{} not found", resource),
            AppError::Conflict(msg) => write!(f, "Conflict: {}", msg),
            AppError::InternalError(msg) => write!(f, "Internal error: {}", msg),
            AppError::BadRequest(msg) => write!(f, "Bad request: {}", msg),
        }
    }
}

impl std::error::Error for AppError {}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, error_message) = match self {
            AppError::DatabaseError(e) => {
                tracing::error!("Database error: {:?}", e);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    format!("Database error: {}", e),
                )
            }
            AppError::Unauthorized => (StatusCode::UNAUTHORIZED, "Unauthorized".to_string()),
            AppError::InvalidToken => (StatusCode::UNAUTHORIZED, "Invalid token".to_string()),
            AppError::TokenExpired => (StatusCode::UNAUTHORIZED, "Token expired".to_string()),
            AppError::InvalidCredentials => {
                (StatusCode::UNAUTHORIZED, "Invalid credentials".to_string())
            }
            AppError::ValidationError(msg) => (StatusCode::BAD_REQUEST, msg),
            AppError::NotFound(resource) => {
                (StatusCode::NOT_FOUND, format!("{} not found", resource))
            }
            AppError::Conflict(msg) => (StatusCode::CONFLICT, msg),
            AppError::InternalError(msg) => {
                tracing::error!("Internal error: {}", msg);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "An internal error occurred".to_string(),
                )
            }
            AppError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg),
        };

        let body = Json(json!({
            "error": error_message,
            "status": status.as_u16()
        }));

        (status, body).into_response()
    }
}

// Implement From traits for common error types
impl From<sqlx::Error> for AppError {
    fn from(err: sqlx::Error) -> Self {
        // Check for unique constraint violation (Postgres code 23505)
        if let sqlx::Error::Database(ref db_err) = err {
            if db_err.code().as_deref() == Some("23505") {
                return AppError::Conflict("Unique constraint violation".to_string());
            }
        }

        match err {
            sqlx::Error::RowNotFound => AppError::NotFound("Resource".to_string()),
            _ => AppError::DatabaseError(err),
        }
    }
}

impl From<jsonwebtoken::errors::Error> for AppError {
    fn from(err: jsonwebtoken::errors::Error) -> Self {
        match err.kind() {
            jsonwebtoken::errors::ErrorKind::ExpiredSignature => AppError::TokenExpired,
            _ => AppError::InvalidToken,
        }
    }
}

impl From<argon2::password_hash::Error> for AppError {
    fn from(_: argon2::password_hash::Error) -> Self {
        AppError::InvalidCredentials
    }
}

impl From<validator::ValidationErrors> for AppError {
    fn from(err: validator::ValidationErrors) -> Self {
        AppError::ValidationError(err.to_string())
    }
}
