use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use validator::Validate;

/// Novel type enum
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum NovelType {
    Short,  // 단편
    Long,   // 장편
    Series, // 연재물
}

impl Default for NovelType {
    fn default() -> Self {
        NovelType::Series
    }
}

impl std::fmt::Display for NovelType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            NovelType::Short => write!(f, "short"),
            NovelType::Long => write!(f, "long"),
            NovelType::Series => write!(f, "series"),
        }
    }
}

impl From<String> for NovelType {
    fn from(s: String) -> Self {
        match s.as_str() {
            "short" => NovelType::Short,
            "long" => NovelType::Long,
            "series" => NovelType::Series,
            _ => NovelType::Series,
        }
    }
}

/// Relation type between novels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum RelationType {
    Related,      // 연관 작품
    Sequel,       // 후속작
    Prequel,      // 전편
    Spinoff,      // 스핀오프
    SameUniverse, // 같은 세계관
}

impl Default for RelationType {
    fn default() -> Self {
        RelationType::Related
    }
}

impl std::fmt::Display for RelationType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            RelationType::Related => write!(f, "related"),
            RelationType::Sequel => write!(f, "sequel"),
            RelationType::Prequel => write!(f, "prequel"),
            RelationType::Spinoff => write!(f, "spinoff"),
            RelationType::SameUniverse => write!(f, "same_universe"),
        }
    }
}

impl From<String> for RelationType {
    fn from(s: String) -> Self {
        match s.as_str() {
            "related" => RelationType::Related,
            "sequel" => RelationType::Sequel,
            "prequel" => RelationType::Prequel,
            "spinoff" => RelationType::Spinoff,
            "same_universe" => RelationType::SameUniverse,
            _ => RelationType::Related,
        }
    }
}

/// Predefined genres
pub const GENRES: &[&str] = &[
    "fantasy",       // 판타지
    "romance",       // 로맨스
    "action",        // 액션
    "thriller",      // 스릴러
    "mystery",       // 미스터리
    "sf",            // SF
    "horror",        // 호러
    "drama",         // 드라마
    "comedy",        // 코미디
    "slice_of_life", // 일상
    "historical",    // 역사
    "martial_arts",  // 무협
    "game",          // 게임
    "sports",        // 스포츠
    "music",         // 음악
    "psychological", // 심리
    "supernatural",  // 초자연
    "adventure",     // 모험
];

/// Novel model
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Novel {
    pub id: Uuid,
    pub slug: String,
    pub title: String,
    pub description: Option<String>,
    pub novel_type: Option<String>,
    pub genre: Option<String>,       // Legacy single genre field
    pub genres: Option<Vec<String>>, // New multiple genres field
    pub status: String,              // draft, ongoing, completed, hiatus
    pub view_count: i64,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Novel relation model
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct NovelRelation {
    pub id: Uuid,
    pub novel_id: Uuid,
    pub related_novel_id: Uuid,
    pub relation_type: String,
    pub created_at: DateTime<Utc>,
}

/// Related novel info for API response
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct RelatedNovel {
    pub id: Uuid,
    pub slug: String,
    pub title: String,
    pub relation_type: String,
}

/// Novel chapter model
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct NovelChapter {
    pub id: Uuid,
    pub novel_id: Uuid,
    pub chapter_number: i32,
    pub title: Option<String>,
    pub content: String,
    pub view_count: i64,
    pub published_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Create novel request
#[derive(Debug, Deserialize, Validate)]
pub struct CreateNovel {
    #[validate(length(min = 1, max = 500))]
    pub title: String,

    pub description: Option<String>,

    #[validate(length(max = 50))]
    pub novel_type: Option<String>, // 'short', 'long', 'series'

    pub genres: Option<Vec<String>>,

    pub status: Option<String>, // defaults to 'draft'

    // Ignored: slug is always auto-generated from UUID (not title-based)
    pub slug: Option<String>,
}

/// Update novel request
#[derive(Debug, Deserialize, Validate)]
pub struct UpdateNovel {
    #[validate(length(min = 1, max = 500))]
    pub title: Option<String>,

    pub description: Option<String>,

    #[validate(length(max = 50))]
    pub novel_type: Option<String>,

    pub genres: Option<Vec<String>>,

    pub status: Option<String>,
}

/// Add related novel request
#[derive(Debug, Deserialize, Validate)]
pub struct AddRelatedNovel {
    #[validate(length(min = 1))]
    pub related_novel_slug: String,

    pub relation_type: Option<String>, // defaults to 'related'
}

/// Create chapter request
#[derive(Debug, Deserialize, Validate)]
pub struct CreateChapter {
    pub chapter_number: i32,

    #[validate(length(min = 0, max = 500))]
    pub title: Option<String>,

    #[validate(length(min = 1))]
    pub content: String,

    pub published_at: Option<DateTime<Utc>>,
}

/// Update chapter request
#[derive(Debug, Deserialize, Validate)]
pub struct UpdateChapter {
    #[validate(length(min = 0, max = 500))]
    pub title: Option<String>,

    #[validate(length(min = 1))]
    pub content: Option<String>,

    pub published_at: Option<DateTime<Utc>>,
}

/// Novel with chapters count and related novels
#[derive(Debug, Serialize)]
pub struct NovelWithStats {
    #[serde(flatten)]
    pub novel: Novel,
    pub chapter_count: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub related_novels: Option<Vec<RelatedNovel>>,
}

/// Chapter preview (without full content)
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ChapterPreview {
    pub id: Uuid,
    pub novel_id: Uuid,
    pub chapter_number: i32,
    pub title: Option<String>,
    pub view_count: i64,
    pub published_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}

/// Genre info for API
#[derive(Debug, Serialize)]
pub struct GenreInfo {
    pub id: &'static str,
    pub name: &'static str,
}

/// Get all genres with Korean names
pub fn get_all_genres() -> Vec<GenreInfo> {
    vec![
        GenreInfo {
            id: "fantasy",
            name: "판타지",
        },
        GenreInfo {
            id: "romance",
            name: "로맨스",
        },
        GenreInfo {
            id: "action",
            name: "액션",
        },
        GenreInfo {
            id: "thriller",
            name: "스릴러",
        },
        GenreInfo {
            id: "mystery",
            name: "미스터리",
        },
        GenreInfo {
            id: "sf",
            name: "SF",
        },
        GenreInfo {
            id: "horror",
            name: "호러",
        },
        GenreInfo {
            id: "drama",
            name: "드라마",
        },
        GenreInfo {
            id: "comedy",
            name: "코미디",
        },
        GenreInfo {
            id: "slice_of_life",
            name: "일상",
        },
        GenreInfo {
            id: "historical",
            name: "역사",
        },
        GenreInfo {
            id: "martial_arts",
            name: "무협",
        },
        GenreInfo {
            id: "game",
            name: "게임",
        },
        GenreInfo {
            id: "sports",
            name: "스포츠",
        },
        GenreInfo {
            id: "music",
            name: "음악",
        },
        GenreInfo {
            id: "psychological",
            name: "심리",
        },
        GenreInfo {
            id: "supernatural",
            name: "초자연",
        },
        GenreInfo {
            id: "adventure",
            name: "모험",
        },
    ]
}

/// Novel type info for API
#[derive(Debug, Serialize)]
pub struct NovelTypeInfo {
    pub id: &'static str,
    pub name: &'static str,
    pub description: &'static str,
}

/// Get all novel types with Korean names
pub fn get_all_novel_types() -> Vec<NovelTypeInfo> {
    vec![
        NovelTypeInfo {
            id: "short",
            name: "단편",
            description: "한 편으로 완결되는 짧은 이야기",
        },
        NovelTypeInfo {
            id: "long",
            name: "장편",
            description: "한 권 분량의 완결된 이야기",
        },
        NovelTypeInfo {
            id: "series",
            name: "연재물",
            description: "여러 회차로 연재되는 이야기",
        },
    ]
}
