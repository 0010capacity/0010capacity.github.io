pub mod app;
pub mod auth;
pub mod blog;
pub mod novel;

pub use app::{App, CreateApp, UpdateApp};
pub use auth::{Admin, AdminInfo, Claims, LoginRequest, LoginResponse};
pub use blog::{BlogPost, BlogPostPreview, CreateBlogPost, UpdateBlogPost};
pub use novel::{
    ChapterPreview, CreateChapter, CreateNovel, Novel, NovelChapter, NovelWithStats, UpdateChapter,
    UpdateNovel,
};
