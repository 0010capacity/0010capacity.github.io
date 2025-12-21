"use client";

import {
  useEffect,
  useState,
  useCallback,
  createContext,
  useContext,
} from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
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
  Badge,
  Divider,
} from "@mantine/core";
import { ArrowLeft, Calendar, Tag } from "lucide-react";

// Navigation Context for SPA-style routing
interface NavState {
  view: "list" | "detail";
  slug?: string;
}

interface NavContextType {
  navState: NavState;
  navigate: (state: NavState) => void;
  goBack: () => void;
}

const NavContext = createContext<NavContextType | null>(null);

function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error("useNav must be used within NavProvider");
  return ctx;
}

function BlogListSkeleton() {
  return (
    <Stack gap="md" aria-label="블로그 목록 로딩" aria-busy="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <Paper
          key={i}
          p="lg"
          withBorder
          style={{
            borderColor: "var(--mantine-color-dark-4)",
            transition: "all 0.2s ease",
          }}
        >
          <Group justify="space-between" align="baseline" gap="lg">
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Skeleton height={24} width="70%" radius="sm" mb="sm" />
              <Group gap="xs" mb="sm">
                <Skeleton height={16} width={60} radius="sm" />
                <Skeleton height={16} width={48} radius="sm" />
                <Skeleton height={16} width={56} radius="sm" />
              </Group>
              <Skeleton height={16} width="100%" radius="sm" />
            </Box>
            <Skeleton height={16} width={80} radius="sm" />
          </Group>
        </Paper>
      ))}
    </Stack>
  );
}

function BlogDetailSkeleton() {
  return (
    <Container size="sm" py="xl" mih="100vh">
      <Skeleton height={32} width={80} radius="sm" mb="xl" />

      <Box mb="xl">
        <Group gap="sm" mb="lg">
          <Skeleton height={16} width={64} radius="sm" />
          <Skeleton height={16} width={80} radius="sm" />
        </Group>
        <Skeleton height={40} width="90%" mb="md" radius="sm" />
        <Skeleton height={40} width="70%" mb="xl" radius="sm" />

        <Group gap="xs">
          <Skeleton height={24} width={64} radius="sm" />
          <Skeleton height={24} width={80} radius="sm" />
          <Skeleton height={24} width={56} radius="sm" />
        </Group>
      </Box>

      <Box mb="xl">
        <Skeleton height={240} width="100%" radius="md" />
      </Box>

      <Stack gap="sm" mb="xl" aria-label="블로그 본문 로딩" aria-busy="true">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} height={16} width={100 - i * 5} radius="sm" />
        ))}
      </Stack>

      <Divider my="lg" />
      <Skeleton height={32} width={120} radius="sm" />
    </Container>
  );
}

// Blog List Component
function BlogList() {
  const { navigate } = useNav();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = (await blogApi.list({
          published: true,
          limit: 50,
          offset: 0,
        })) as BlogPost[];
        setPosts(Array.isArray(data) ? data : []);
        setError("");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "포스트를 불러오지 못했습니다"
        );
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Container size="sm" py="xl" mih="100vh">
      {/* Header */}
      <Box
        mb="xl"
        pb="xl"
        style={{ borderBottom: "1px solid var(--mantine-color-dark-4)" }}
      >
        <Button
          onClick={() => (window.location.href = "/")}
          variant="subtle"
          color="gray"
          size="sm"
          leftSection={<ArrowLeft size={16} />}
          mb="lg"
          style={{
            transition: "all 0.2s ease",
            "&:hover": {
              color: "var(--mantine-color-accent-5)",
            },
          }}
        >
          돌아가기
        </Button>

        <Title
          order={1}
          fw={300}
          size="h1"
          mb="sm"
          style={{
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}
        >
          블로그
        </Title>

        <Text size="md" c="dimmed" style={{ fontSize: "1.05rem" }}>
          기술, 경험, 그리고 생각들을 나누는 공간
        </Text>

        {posts.length > 0 && (
          <Text size="xs" c="dark.6" mt="md">
            총 {posts.length}개의 글
          </Text>
        )}
      </Box>

      {/* Error Message */}
      {error && (
        <Paper
          withBorder
          p="md"
          mb="lg"
          bg="rgba(255, 0, 0, 0.05)"
          style={{
            borderColor: "var(--mantine-color-red-9)",
            borderLeft: "3px solid var(--mantine-color-red-9)",
          }}
        >
          <Group gap="sm">
            <Text size="sm" c="red.4">
              오류가 발생했습니다
            </Text>
            <Text size="xs" c="red.6">
              {error}
            </Text>
          </Group>
        </Paper>
      )}

      {/* Loading State */}
      {loading && <BlogListSkeleton />}

      {/* Posts List */}
      {!loading && posts.length > 0 && (
        <Stack gap="md">
          {posts.map(post => (
            <Anchor
              component="button"
              key={post.id}
              onClick={() => navigate({ view: "detail", slug: post.slug })}
              onMouseEnter={() => setHoveredSlug(post.slug)}
              onMouseLeave={() => setHoveredSlug(null)}
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
                  borderColor:
                    hoveredSlug === post.slug
                      ? "var(--mantine-color-accent-5)"
                      : "var(--mantine-color-dark-4)",
                  background:
                    hoveredSlug === post.slug
                      ? "linear-gradient(135deg, rgba(58, 158, 236, 0.05) 0%, rgba(58, 158, 236, 0.02) 100%)"
                      : "transparent",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                  transform:
                    hoveredSlug === post.slug
                      ? "translateX(4px)"
                      : "translateX(0)",
                  boxShadow:
                    hoveredSlug === post.slug
                      ? "0 4px 12px rgba(58, 158, 236, 0.1)"
                      : "none",
                }}
              >
                <Group justify="space-between" align="flex-start" gap="md">
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    {/* Metadata */}
                    <Group gap="xs" mb="sm">
                      <Group gap={4}>
                        <Calendar size={14} style={{ opacity: 0.6 }} />
                        <Text size="xs" c="dimmed">
                          {formatDate(post.published_at || post.created_at)}
                        </Text>
                      </Group>
                      {post.tags && post.tags.length > 0 && (
                        <>
                          <Text size="xs" c="dark.6">
                            ·
                          </Text>
                          <Group gap={4}>
                            <Tag size={14} style={{ opacity: 0.6 }} />
                            <Text size="xs" c="dimmed">
                              {post.tags.length}개 태그
                            </Text>
                          </Group>
                        </>
                      )}
                    </Group>

                    {/* Title */}
                    <Title
                      order={2}
                      size="h4"
                      fw={600}
                      c={hoveredSlug === post.slug ? "white" : "gray.0"}
                      mb="sm"
                      style={{
                        transition: "color 0.2s ease",
                        letterSpacing: "-0.01em",
                        lineHeight: 1.3,
                      }}
                    >
                      {post.title}
                    </Title>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <Group gap="xs" mb="sm">
                        {post.tags.slice(0, 4).map(tag => (
                          <Badge
                            key={tag}
                            size="sm"
                            variant="light"
                            color="accent"
                            style={{
                              textTransform: "none",
                              fontSize: "0.7rem",
                              fontWeight: 500,
                            }}
                          >
                            #{tag}
                          </Badge>
                        ))}
                        {post.tags.length > 4 && (
                          <Text size="xs" c="dimmed">
                            +{post.tags.length - 4}
                          </Text>
                        )}
                      </Group>
                    )}

                    {/* Excerpt */}
                    {post.excerpt && (
                      <Text
                        size="sm"
                        c="dimmed"
                        lineClamp={2}
                        style={{
                          transition: "color 0.2s ease",
                          color:
                            hoveredSlug === post.slug
                              ? "var(--mantine-color-gray-4)"
                              : "var(--mantine-color-gray-6)",
                        }}
                      >
                        {post.excerpt}
                      </Text>
                    )}
                  </Box>

                  {/* Read More Arrow */}
                  <Box
                    style={{
                      opacity: hoveredSlug === post.slug ? 1 : 0.4,
                      transform:
                        hoveredSlug === post.slug
                          ? "translateX(4px)"
                          : "translateX(0)",
                      transition: "all 0.2s ease",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Text size="sm" c="accent.5">
                      →
                    </Text>
                  </Box>
                </Group>
              </Paper>
            </Anchor>
          ))}
        </Stack>
      )}

      {/* Empty State */}
      {!loading && posts.length === 0 && !error && (
        <Paper p="xl" ta="center" bg="rgba(255, 255, 255, 0.02)">
          <Title order={3} size="h4" fw={400} c="dimmed" mb="md">
            아직 작성된 글이 없습니다
          </Title>
          <Text size="sm" c="dark.6" mb="lg">
            곧 좋은 내용으로 찾아뵙겠습니다
          </Text>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="subtle"
            color="gray"
            size="sm"
            leftSection={<ArrowLeft size={16} />}
          >
            돌아가기
          </Button>
        </Paper>
      )}
    </Container>
  );
}

// Blog Detail Component
function BlogDetail({ slug }: { slug: string }) {
  const { navigate } = useNav();
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
          err instanceof Error ? err.message : "글을 불러오지 못했습니다"
        );
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchPost();
  }, [slug]);

  if (loading) {
    return <BlogDetailSkeleton />;
  }

  if (error || !post) {
    return (
      <Container size="sm" py="xl" mih="100vh">
        <Button
          onClick={() => navigate({ view: "list" })}
          variant="subtle"
          color="gray"
          size="sm"
          leftSection={<ArrowLeft size={16} />}
          mb="lg"
        >
          블로그로 돌아가기
        </Button>

        <Paper p="xl" ta="center" bg="rgba(255, 0, 0, 0.05)">
          <Title order={3} size="h4" fw={400} c="dimmed" mb="md">
            {error || "글을 찾을 수 없습니다"}
          </Title>
          <Text size="sm" c="dark.6">
            다른 글을 확인해보세요
          </Text>
        </Paper>
      </Container>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Container size="sm" py="xl" mih="100vh">
      {/* Back Button */}
      <Button
        onClick={() => navigate({ view: "list" })}
        variant="subtle"
        color="gray"
        size="sm"
        leftSection={<ArrowLeft size={16} />}
        mb="xl"
        style={{
          transition: "all 0.2s ease",
        }}
      >
        블로그
      </Button>

      {/* Article Header */}
      <Box component="header" mb="xl">
        {/* Metadata */}
        <Group gap="sm" mb="lg">
          <Group gap={4}>
            <Calendar size={16} style={{ opacity: 0.6 }} />
            <Text size="sm" c="dimmed">
              {formatDate(post.published_at || post.created_at)}
            </Text>
          </Group>
          {post.tags && post.tags.length > 0 && (
            <>
              <Text size="xs" c="dark.6">
                ·
              </Text>
              <Group gap={4}>
                <Tag size={16} style={{ opacity: 0.6 }} />
                <Text size="sm" c="dimmed">
                  {post.tags.length}개 태그
                </Text>
              </Group>
            </>
          )}
        </Group>

        {/* Title */}
        <Title
          order={1}
          fw={300}
          size="h1"
          mb="lg"
          style={{
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          {post.title}
        </Title>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <Group gap="xs">
            {post.tags.map(tag => (
              <Badge
                key={tag}
                size="lg"
                variant="light"
                color="accent"
                style={{
                  textTransform: "none",
                  fontWeight: 500,
                }}
              >
                #{tag}
              </Badge>
            ))}
          </Group>
        )}
      </Box>

      {/* Cover Image */}
      {post.cover_image_url && (
        <Box
          mb="xl"
          style={{
            borderRadius: "var(--mantine-radius-lg)",
            overflow: "hidden",
            border: "1px solid var(--mantine-color-dark-4)",
          }}
        >
          <Image
            src={post.cover_image_url}
            alt={post.title}
            width={800}
            height={400}
            style={{
              width: "100%",
              height: "auto",
              objectFit: "cover",
              display: "block",
            }}
          />
        </Box>
      )}

      {/* Excerpt */}
      {post.excerpt && (
        <Paper
          p="lg"
          withBorder
          mb="xl"
          bg="rgba(58, 158, 236, 0.05)"
          style={{
            borderColor: "var(--mantine-color-accent-5)",
            borderLeft: "3px solid var(--mantine-color-accent-5)",
          }}
        >
          <Text
            size="md"
            c="accent.2"
            style={{ fontStyle: "italic", lineHeight: 1.7 }}
          >
            {post.excerpt}
          </Text>
        </Paper>
      )}

      {/* Article Content */}
      <TypographyStylesProvider>
        <Box
          component="article"
          mb="xl"
          style={{
            fontSize: "1.025rem",
            lineHeight: 1.8,
          }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </Box>
      </TypographyStylesProvider>

      {/* Footer */}
      <Divider my="xl" />

      <Group justify="space-between" align="center" py="lg">
        <Text size="sm" c="dimmed">
          이 글이 도움이 되었나요?
        </Text>
        <Button
          onClick={() => navigate({ view: "list" })}
          variant="subtle"
          color="gray"
          size="sm"
          leftSection={<ArrowLeft size={16} />}
        >
          더 많은 글 보기
        </Button>
      </Group>
    </Container>
  );
}

// Main Page Component with SPA-style Routing
export default function BlogPageClient() {
  const params = useParams();
  const paramsArray = params?.params as string[] | undefined;

  const [navState, setNavState] = useState<NavState>({ view: "list" });
  const [history, setHistory] = useState<NavState[]>([]);

  // Parse URL params on mount to determine initial state
  useEffect(() => {
    if (paramsArray && paramsArray.length === 1 && paramsArray[0]) {
      setNavState({ view: "detail", slug: paramsArray[0] });
    } else {
      setNavState({ view: "list" });
    }
  }, [paramsArray]);

  const navigate = useCallback(
    (state: NavState) => {
      setHistory([...history, navState]);
      setNavState(state);
    },
    [navState, history]
  );

  const goBack = useCallback(() => {
    if (history.length > 0) {
      const newHistory = [...history];
      const prevState = newHistory.pop();
      setHistory(newHistory);
      setNavState(prevState || { view: "list" });
    } else {
      setNavState({ view: "list" });
    }
  }, [history]);

  const renderView = () => {
    switch (navState.view) {
      case "detail":
        return navState.slug ? (
          <BlogDetail slug={navState.slug} />
        ) : (
          <BlogList />
        );
      case "list":
      default:
        return <BlogList />;
    }
  };

  return (
    <NavContext.Provider value={{ navState, navigate, goBack }}>
      {renderView()}
    </NavContext.Provider>
  );
}
