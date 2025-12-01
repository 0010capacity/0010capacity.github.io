use sqlx::PgPool;

/// Test database connection
pub async fn test_connection(pool: &PgPool) -> Result<(), sqlx::Error> {
    sqlx::query("SELECT 1").fetch_one(pool).await?;

    Ok(())
}

/// Get database version
pub async fn get_db_version(pool: &PgPool) -> Result<String, sqlx::Error> {
    let row: (String,) = sqlx::query_as("SELECT version()").fetch_one(pool).await?;

    Ok(row.0)
}
