use crate::models::{BlogPost, Novel};
use chrono::DateTime;
use html_escape::encode_text;

pub fn generate_blog_html(post: &BlogPost, base_url: &str) -> String {
    let title = encode_text(&post.title);
    let description = encode_text(
        &post
            .excerpt
            .clone()
            .unwrap_or_else(|| post.content.chars().take(160).collect::<String>()),
    );
    let url = format!("{}/blog/{}/", base_url, post.slug);
    let published_date = post
        .published_at
        .map(|d| d.to_rfc3339())
        .unwrap_or_else(|| post.created_at.to_rfc3339());

    let tags_html = post
        .tags
        .iter()
        .map(|tag| {
            format!(
                r#"<a href="/blog?tag={}" class="text-xs text-neutral-600 hover:text-neutral-400">#{}</a>"#,
                encode_text(tag),
                encode_text(tag)
            )
        })
        .collect::<Vec<_>>()
        .join(" ");

    let content_html = markdown_to_html(&post.content);

    format!(
        r#"<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{} | 0010capacity</title>
    <meta name="description" content="{}">
    <meta name="author" content="0010capacity">

    <!-- Open Graph -->
    <meta property="og:type" content="article">
    <meta property="og:title" content="{}">
    <meta property="og:description" content="{}">
    <meta property="og:url" content="{}">
    <meta property="og:site_name" content="0010capacity">
    <meta property="article:published_time" content="{}">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{}">
    <meta name="twitter:description" content="{}">

    <!-- Canonical -->
    <link rel="canonical" href="{}">

    <!-- SEO -->
    <meta name="robots" content="index, follow">
    <meta name="keywords" content="{}">

    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        html {{
            background: #0a0a0a;
            color: #e5e7eb;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
        }}

        body {{
            background: #0a0a0a;
            color: #e5e7eb;
        }}

        .container {{
            max-width: 42rem;
            margin: 0 auto;
            padding: 1.5rem;
        }}

        header {{
            margin-bottom: 2rem;
        }}

        .back-link {{
            font-size: 0.875rem;
            color: #9ca3af;
            text-decoration: none;
            margin-bottom: 2rem;
            display: inline-block;
        }}

        .back-link:hover {{
            color: #d1d5db;
        }}

        h1 {{
            font-size: 1.875rem;
            font-weight: 300;
            margin-bottom: 1.5rem;
            line-height: 1.2;
        }}

        time {{
            font-size: 0.875rem;
            color: #9ca3af;
            display: block;
            margin-bottom: 1rem;
        }}

        .tags {{
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
            margin-bottom: 2rem;
        }}

        .tags a {{
            font-size: 0.75rem;
            color: #9ca3af;
            text-decoration: none;
        }}

        .tags a:hover {{
            color: #d1d5db;
        }}

        article {{
            margin-bottom: 2rem;
            margin-top: 3rem;
        }}

        article p {{
            margin-bottom: 1rem;
            color: #d1d5db;
        }}

        article h2 {{
            font-size: 1.5rem;
            font-weight: 300;
            margin-top: 2rem;
            margin-bottom: 1rem;
            color: #e5e7eb;
        }}

        article h3 {{
            font-size: 1.25rem;
            font-weight: 300;
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
            color: #e5e7eb;
        }}

        article code {{
            background: #1f2937;
            color: #d1d5db;
            padding: 0.125rem 0.375rem;
            border-radius: 0.25rem;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.875rem;
        }}

        article pre {{
            background: #111827;
            border: 1px solid #374151;
            border-radius: 0.5rem;
            padding: 1rem;
            overflow-x: auto;
            margin-bottom: 1rem;
        }}

        article pre code {{
            background: none;
            color: #d1d5db;
            padding: 0;
        }}

        article blockquote {{
            border-left: 2px solid #374151;
            color: #9ca3af;
            padding-left: 1.5rem;
            margin: 1.5rem 0;
        }}

        article ul, article ol {{
            margin-left: 1.5rem;
            margin-bottom: 1rem;
        }}

        article li {{
            margin-bottom: 0.5rem;
        }}

        article a {{
            color: #9ca3af;
            text-decoration: none;
        }}

        article a:hover {{
            color: #e5e7eb;
        }}

        footer {{
            border-top: 1px solid #1f2937;
            padding-top: 2rem;
            margin-top: 3rem;
        }}

        .back-link-footer {{
            font-size: 0.875rem;
            color: #9ca3af;
            text-decoration: none;
        }}

        .back-link-footer:hover {{
            color: #d1d5db;
        }}
    </style>
</head>
<body>
    <div class="container">
        <a href="/" class="back-link">← 돌아가기</a>

        <header>
            <time>{}</time>
            <h1>{}</h1>
            {}</header>

        <article>
            {}
        </article>

        <footer>
            <a href="/blog/" class="back-link-footer">← 블로그로 돌아가기</a>
        </footer>
    </div>
</body>
</html>"#,
        title,
        description,
        title,
        description,
        url,
        published_date,
        title,
        description,
        url,
        post.tags.join(", "),
        format_date(&post.published_at.unwrap_or(post.created_at)),
        title,
        tags_html,
        content_html,
    )
}

pub fn generate_blog_list_html(posts: &[BlogPost], base_url: &str) -> String {
    let posts_html = posts
        .iter()
        .map(|post| {
            let title = encode_text(&post.title);
            let date = format_date(&post.published_at.unwrap_or(post.created_at));
            let tags_html = post
                .tags
                .iter()
                .take(3)
                .map(|tag| format!(r#"<span class="text-xs text-neutral-600">#{}</span>"#, encode_text(tag)))
                .collect::<Vec<_>>()
                .join("");

            format!(
                r#"<a href="/blog/{}" class="group flex items-baseline justify-between w-full text-left py-4 border-b border-neutral-900 hover:border-neutral-700 transition-colors">
                    <div class="flex-1 min-w-0 pr-4">
                        <h2 class="text-neutral-300 group-hover:text-white transition-colors truncate">{}</h2>
                        <div class="flex gap-2 mt-2">{}</div>
                    </div>
                    <time class="text-sm text-neutral-600 flex-shrink-0">{}</time>
                </a>"#,
                post.slug, title, tags_html, date
            )
        })
        .collect::<Vec<_>>()
        .join("");

    format!(
        r#"<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>블로그 | 0010capacity</title>
    <meta name="description" content="기술, 경험, 그리고 생각들에 대한 블로그">
    <meta name="author" content="0010capacity">

    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="블로그 | 0010capacity">
    <meta property="og:description" content="기술, 경험, 그리고 생각들에 대한 블로그">
    <meta property="og:url" content="{}/blog/">
    <meta property="og:site_name" content="0010capacity">

    <!-- Canonical -->
    <link rel="canonical" href="{}/blog/">

    <!-- SEO -->
    <meta name="robots" content="index, follow">

    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        html {{
            background: #0a0a0a;
            color: #e5e7eb;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
        }}

        body {{
            background: #0a0a0a;
            color: #e5e7eb;
        }}

        .container {{
            max-width: 42rem;
            margin: 0 auto;
            padding: 1.5rem;
        }}

        header {{
            margin-bottom: 4rem;
        }}

        .back-link {{
            font-size: 0.875rem;
            color: #9ca3af;
            text-decoration: none;
            margin-bottom: 2rem;
            display: inline-block;
        }}

        .back-link:hover {{
            color: #d1d5db;
        }}

        h1 {{
            font-size: 1.5rem;
            font-weight: 300;
            margin-top: 2rem;
            margin-bottom: 0.5rem;
        }}

        .subtitle {{
            font-size: 0.875rem;
            color: #9ca3af;
        }}

        .posts {{
            space-y: 0.25rem;
        }}

        a {{
            color: inherit;
            text-decoration: none;
        }}

        h2 {{
            font-size: 1rem;
            font-weight: 400;
        }}

        time {{
            font-size: 0.875rem;
            color: #9ca3af;
        }}
    </style>
</head>
<body>
    <div class="container">
        <a href="/" class="back-link">← 돌아가기</a>

        <header>
            <h1>블로그</h1>
            <p class="subtitle">기술, 경험, 그리고 생각들</p>
        </header>

        <div class="posts">
            {}
        </div>
    </div>
</body>
</html>"#,
        base_url, base_url, posts_html
    )
}

pub fn generate_novel_html(novel: &Novel, content: &str, base_url: &str) -> String {
    let title = encode_text(&novel.title);
    let description = encode_text(
        &novel
            .synopsis
            .clone()
            .unwrap_or_else(|| novel.description.clone().unwrap_or_default()),
    );
    let url = format!("{}/novels/{}/", base_url, novel.slug);
    let published_date = novel
        .published_at
        .map(|d| d.to_rfc3339())
        .unwrap_or_else(|| novel.created_at.to_rfc3339());

    let content_html = markdown_to_html(content);

    format!(
        r#"<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{} | 0010capacity</title>
    <meta name="description" content="{}">
    <meta name="author" content="0010capacity">

    <!-- Open Graph -->
    <meta property="og:type" content="article">
    <meta property="og:title" content="{}">
    <meta property="og:description" content="{}">
    <meta property="og:url" content="{}">
    <meta property="og:site_name" content="0010capacity">
    <meta property="article:published_time" content="{}">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{}">
    <meta name="twitter:description" content="{}">

    <!-- Canonical -->
    <link rel="canonical" href="{}">

    <!-- SEO -->
    <meta name="robots" content="index, follow">

    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        html {{
            background: #0a0a0a;
            color: #e5e7eb;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
        }}

        body {{
            background: #0a0a0a;
            color: #e5e7eb;
        }}

        .container {{
            max-width: 42rem;
            margin: 0 auto;
            padding: 1.5rem;
        }}

        header {{
            margin-bottom: 2rem;
        }}

        .back-link {{
            font-size: 0.875rem;
            color: #9ca3af;
            text-decoration: none;
            margin-bottom: 2rem;
            display: inline-block;
        }}

        .back-link:hover {{
            color: #d1d5db;
        }}

        h1 {{
            font-size: 1.875rem;
            font-weight: 300;
            margin-bottom: 1.5rem;
            line-height: 1.2;
        }}

        time {{
            font-size: 0.875rem;
            color: #9ca3af;
            display: block;
            margin-bottom: 1rem;
        }}

        article {{
            margin-bottom: 2rem;
            margin-top: 3rem;
        }}

        article p {{
            margin-bottom: 1rem;
            color: #d1d5db;
        }}

        article h2 {{
            font-size: 1.5rem;
            font-weight: 300;
            margin-top: 2rem;
            margin-bottom: 1rem;
            color: #e5e7eb;
        }}

        article code {{
            background: #1f2937;
            color: #d1d5db;
            padding: 0.125rem 0.375rem;
            border-radius: 0.25rem;
        }}

        article blockquote {{
            border-left: 2px solid #374151;
            color: #9ca3af;
            padding-left: 1.5rem;
            margin: 1.5rem 0;
        }}

        footer {{
            border-top: 1px solid #1f2937;
            padding-top: 2rem;
            margin-top: 3rem;
        }}

        .back-link-footer {{
            font-size: 0.875rem;
            color: #9ca3af;
            text-decoration: none;
        }}

        .back-link-footer:hover {{
            color: #d1d5db;
        }}
    </style>
</head>
<body>
    <div class="container">
        <a href="/" class="back-link">← 돌아가기</a>

        <header>
            <time>{}</time>
            <h1>{}</h1>
        </header>

        <article>
            {}
        </article>

        <footer>
            <a href="/novels/" class="back-link-footer">← 소설로 돌아가기</a>
        </footer>
    </div>
</body>
</html>"#,
        title,
        description,
        title,
        description,
        url,
        published_date,
        title,
        description,
        url,
        format_date(&novel.published_at.unwrap_or(novel.created_at)),
        title,
        content_html,
    )
}

pub fn generate_novels_list_html(novels: &[Novel], base_url: &str) -> String {
    let novels_html = novels
        .iter()
        .map(|novel| {
            let title = encode_text(&novel.title);
            let date = format_date(&novel.published_at.unwrap_or(novel.created_at));

            format!(
                r#"<a href="/novels/{}" class="group flex items-baseline justify-between w-full text-left py-4 border-b border-neutral-900 hover:border-neutral-700 transition-colors">
                    <div class="flex-1 min-w-0 pr-4">
                        <h2 class="text-neutral-300 group-hover:text-white transition-colors truncate">{}</h2>
                    </div>
                    <time class="text-sm text-neutral-600 flex-shrink-0">{}</time>
                </a>"#,
                novel.slug, title, date
            )
        })
        .collect::<Vec<_>>()
        .join("");

    format!(
        r#"<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>소설 | 0010capacity</title>
    <meta name="description" content="창작 소설 모음">
    <meta name="author" content="0010capacity">

    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="소설 | 0010capacity">
    <meta property="og:description" content="창작 소설 모음">
    <meta property="og:url" content="{}/novels/">
    <meta property="og:site_name" content="0010capacity">

    <!-- Canonical -->
    <link rel="canonical" href="{}/novels/">

    <!-- SEO -->
    <meta name="robots" content="index, follow">

    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        html {{
            background: #0a0a0a;
            color: #e5e7eb;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
        }}

        body {{
            background: #0a0a0a;
            color: #e5e7eb;
        }}

        .container {{
            max-width: 42rem;
            margin: 0 auto;
            padding: 1.5rem;
        }}

        header {{
            margin-bottom: 4rem;
        }}

        .back-link {{
            font-size: 0.875rem;
            color: #9ca3af;
            text-decoration: none;
            margin-bottom: 2rem;
            display: inline-block;
        }}

        .back-link:hover {{
            color: #d1d5db;
        }}

        h1 {{
            font-size: 1.5rem;
            font-weight: 300;
            margin-top: 2rem;
            margin-bottom: 0.5rem;
        }}

        .subtitle {{
            font-size: 0.875rem;
            color: #9ca3af;
        }}

        a {{
            color: inherit;
            text-decoration: none;
        }}

        h2 {{
            font-size: 1rem;
            font-weight: 400;
        }}

        time {{
            font-size: 0.875rem;
            color: #9ca3af;
        }}
    </style>
</head>
<body>
    <div class="container">
        <a href="/" class="back-link">← 돌아가기</a>

        <header>
            <h1>소설</h1>
            <p class="subtitle">창작 소설</p>
        </header>

        <div class="novels">
            {}
        </div>
    </div>
</body>
</html>"#,
        base_url, base_url, novels_html
    )
}

fn format_date(date: &DateTime<chrono::Utc>) -> String {
    date.format("%Y년 %m월 %d일").to_string()
}

fn markdown_to_html(markdown: &str) -> String {
    // Basic markdown to HTML conversion
    // For production, consider using a proper markdown parser like `markdown-rs` or `comrak`
    let mut html = String::new();
    let mut in_code_block = false;
    let mut code_block_content = String::new();

    for line in markdown.lines() {
        if line.starts_with("```") {
            if in_code_block {
                html.push_str(&format!(
                    "<pre><code>{}</code></pre>",
                    encode_text(&code_block_content)
                ));
                code_block_content.clear();
                in_code_block = false;
            } else {
                in_code_block = true;
            }
            continue;
        }

        if in_code_block {
            code_block_content.push_str(line);
            code_block_content.push('\n');
            continue;
        }

        let trimmed = line.trim();

        if trimmed.is_empty() {
            html.push_str("<br>");
        } else if trimmed.starts_with("# ") {
            html.push_str(&format!("<h2>{}</h2>", encode_text(&trimmed[2..])));
        } else if trimmed.starts_with("## ") {
            html.push_str(&format!("<h3>{}</h3>", encode_text(&trimmed[3..])));
        } else if trimmed.starts_with("- ") {
            html.push_str(&format!("<li>{}</li>", encode_text(&trimmed[2..])));
        } else {
            html.push_str(&format!("<p>{}</p>", encode_text(trimmed)));
        }
    }

    html
}

pub fn generate_sitemap_xml(blog_posts: &[BlogPost], novels: &[Novel], base_url: &str) -> String {
    let mut urls = String::from(
        r#"<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>"#,
    );

    urls.push_str(&format!("{}/</loc>\n", base_url));
    urls.push_str(r#"    <lastmod>"#);
    urls.push_str(&chrono::Utc::now().format("%Y-%m-%d").to_string());
    urls.push_str(
        r#"</lastmod>
    <priority>1.0</priority>
  </url>
"#,
    );

    for post in blog_posts {
        if post.published {
            urls.push_str("  <url>\n");
            urls.push_str(&format!(
                "    <loc>{}/blog/{}/</loc>\n",
                base_url, post.slug
            ));
            if let Some(date) = post.published_at {
                urls.push_str(&format!(
                    "    <lastmod>{}</lastmod>\n",
                    date.format("%Y-%m-%d")
                ));
            }
            urls.push_str("    <priority>0.8</priority>\n");
            urls.push_str("  </url>\n");
        }
    }

    for novel in novels {
        if novel.published {
            urls.push_str("  <url>\n");
            urls.push_str(&format!(
                "    <loc>{}/novels/{}/</loc>\n",
                base_url, novel.slug
            ));
            if let Some(date) = novel.published_at {
                urls.push_str(&format!(
                    "    <lastmod>{}</lastmod>\n",
                    date.format("%Y-%m-%d")
                ));
            }
            urls.push_str("    <priority>0.8</priority>\n");
            urls.push_str("  </url>\n");
        }
    }

    urls.push_str("</urlset>");
    urls
}
