"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { blogApi } from "@/lib/api";
import type { BlogPost } from "@/lib/types";
import {
  Container,
  Stack,
  Group,
  Title,
  Text,
  Button,
  Skeleton,
  Paper,
  Anchor,
  Box,
  TypographyStylesProvider,
  Center,
  Loader,
} from "@mantine/core";
import { ArrowLeft, ArrowRight } from "lucide-react";

function BlogListSkeleton() {
  return (
    <Stack gap="md" aria-label="블로그 목록 로딩" aria-busy="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <Paper key={i} p="lg" withBorder>
          <Group justify="space-between" align="flex-start" gap="lg">
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Skeleton height={24} width="70%" radius="sm" mb="sm" />
              <Skeleton height={16} width="100%" radius="sm" />
            </Box>
          </Group>
        </Paper>
      ))}
    </Stack>
  );
}

// Blog List Component
function BlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = (await blogApi.list({
          published: true,
          limit: 100,
          offset: 0,
        })) as BlogPost[];
        setPosts(Array.isArray(data) ? data : []);
        setError("");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "블로그를 불러오지 못했습니다"
        );
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Box mih="100vh" py="xl">
      <Container size="sm">
        <Stack gap="xl">
          {/* Header */}
          <Box
            pb="xl"
            style={{ borderBottom: "1px solid var(--color-border)" }}
          >
            <Button
              component={Link}
              href="/"
              variant="subtle"
              size="sm"
              leftSection={<ArrowLeft size={16} />}
              mb="lg"
            >
              돌아가기
            </Button>

            <Title order={1} fw={400} size="h2" mb="sm">
              블로그
            </Title>

            {posts.length > 0 && (
              <Text size="xs" c="dimmed">
                총 {posts.length}개
              </Text>
            )}
          </Box>

          {/* Error Message */}
          {error && (
            <Paper withBorder p="md">
              <Text size="sm">{error}</Text>
            </Paper>
          )}

          {/* Loading State */}
          {loading && <BlogListSkeleton />}

          {/* Posts List */}
          {!loading && posts.length > 0 && (
            <Stack gap="md">
              {posts.map(post => (
                <Anchor
                  component={Link}
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  underline="never"
                  style={{
                    width: "100%",
                    textAlign: "left",
                  }}
                >
                  <Paper
                    p="lg"
                    withBorder
                    style={{
                      borderColor: "var(--color-border)",
                      backgroundColor: "transparent",
                      cursor: "pointer",
                      transition: "all 0.15s ease-in-out",
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget;
                      el.style.borderColor = "var(--color-text-primary)";
                      el.style.backgroundColor = "var(--color-foreground)";
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget;
                      el.style.borderColor = "var(--color-border)";
                      el.style.backgroundColor = "transparent";
                    }}
                  >
                    <Group justify="space-between" align="flex-start" gap="md">
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Title order={2} size="h4" fw={500} mb="xs">
                          {post.title}
                        </Title>

                        {post.excerpt && (
                          <Text size="sm" c="dimmed" lineClamp={2} mb="sm">
                            {post.excerpt}
                          </Text>
                        )}

                        <Group gap="sm">
                          <Text size="xs" c="dimmed">
                            {formatDate(post.published_at || post.created_at)}
                          </Text>
                          {post.tags && post.tags.length > 0 && (
                            <Text size="xs" c="dimmed">
                              {post.tags.join(", ")}
                            </Text>
                          )}
                        </Group>
                      </Box>

                      <ArrowRight size={16} style={{ flexShrink: 0 }} />
                    </Group>
                  </Paper>
                </Anchor>
              ))}
            </Stack>
          )}

          {/* Empty State */}
          {!loading && posts.length === 0 && !error && (
            <Center py="xl">
              <Text c="dimmed">등록된 글이 없습니다</Text>
            </Center>
          )}
        </Stack>
      </Container>
    </Box>
  );
}

// Blog Detail Component
function BlogDetail({ slug }: { slug: string }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const data = (await blogApi.getBySlug(slug)) as BlogPost;
        setPost(data);
        setError("");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "블로그를 불러오지 못했습니다"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}년 ${month}월 ${day}일`;
  };

  if (loading) {
    return (
      <Center mih="100vh">
        <Loader />
      </Center>
    );
  }

  if (error || !post) {
    return (
      <Container size="sm" py="xl" mih="100vh">
        <Stack gap="md">
          <Button
            component={Link}
            href="/blog"
            variant="subtle"
            size="sm"
            leftSection={<ArrowLeft size={16} />}
          >
            돌아가기
          </Button>
          <Text c="red">{error || "글을 찾을 수 없습니다"}</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl" mih="100vh">
      <Stack gap="xl">
        <Button
          component={Link}
          href="/blog"
          variant="subtle"
          size="sm"
          leftSection={<ArrowLeft size={16} />}
        >
          돌아가기
        </Button>

        {/* Header */}
        <Box pb="xl" style={{ borderBottom: "1px solid var(--color-border)" }}>
          <Title order={1} fw={400} size="h2" mb="md">
            {post.title}
          </Title>

          <Group gap="sm" mb="md">
            <Text size="xs" c="dimmed">
              {formatDate(post.published_at || post.created_at)}
            </Text>
            {post.tags && post.tags.length > 0 && (
              <Text size="xs" c="dimmed">
                {post.tags.join(", ")}
              </Text>
            )}
          </Group>

          {post.excerpt && (
            <Text size="md" c="dimmed">
              {post.excerpt}
            </Text>
          )}
        </Box>

        {/* Featured Image */}
        {post.cover_image_url && (
          <Box
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "16 / 9",
              overflow: "hidden",
              borderRadius: "var(--mantine-radius-md)",
            }}
          >
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              style={{ objectFit: "cover" }}
            />
          </Box>
        )}

        {/* Content */}
        <TypographyStylesProvider>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </TypographyStylesProvider>
      </Stack>
    </Container>
  );
}

// Main Page Component
export default function BlogPageClient() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");

  if (slug) {
    return <BlogDetail slug={slug} />;
  }

  return <BlogList />;
}
