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
} from "@mantine/core";

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
    <Stack gap="sm" aria-label="블로그 목록 로딩" aria-busy="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <Box
          key={i}
          py="lg"
          style={{ borderBottom: "1px solid var(--mantine-color-dark-4)" }}
        >
          <Group justify="space-between" align="baseline" gap="lg">
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Skeleton height={20} width="80%" radius="sm" />
              <Group gap="xs" mt="sm">
                <Skeleton height={12} width={48} radius="sm" />
                <Skeleton height={12} width={40} radius="sm" />
                <Skeleton height={12} width={56} radius="sm" />
              </Group>
            </Box>
            <Skeleton height={16} width={96} radius="sm" />
          </Group>
        </Box>
      ))}
    </Stack>
  );
}

function BlogDetailSkeleton() {
  return (
    <Container size="sm" py="xl" mih="100vh">
      <Text size="sm" c="dimmed" mb="md">
        ← 블로그
      </Text>

      <Box mt="xl" mb="xl">
        <Skeleton height={16} width={144} mb="md" radius="sm" />
        <Skeleton height={40} width="80%" mb="md" radius="sm" />
        <Skeleton height={40} width="60%" mb="xl" radius="sm" />

        <Group gap="xs">
          <Skeleton height={24} width={64} radius="sm" />
          <Skeleton height={24} width={80} radius="sm" />
          <Skeleton height={24} width={56} radius="sm" />
        </Group>
      </Box>

      <Box mb="xl">
        <Skeleton height={224} width="100%" radius="md" />
      </Box>

      <Stack gap="xs" mb="xl" aria-label="블로그 본문 로딩" aria-busy="true">
        <Skeleton height={16} width="100%" radius="sm" />
        <Skeleton height={16} width="92%" radius="sm" />
        <Skeleton height={16} width="84%" radius="sm" />
        <Skeleton height={16} width="100%" radius="sm" />
        <Skeleton height={16} width="75%" radius="sm" />
        <Skeleton height={16} width="92%" radius="sm" />
        <Skeleton height={16} width="66%" radius="sm" />
      </Stack>

      <Box
        pt="xl"
        style={{ borderTop: "1px solid var(--mantine-color-dark-4)" }}
      >
        <Skeleton height={16} width={192} radius="sm" />
      </Box>
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

  return (
    <Container size="sm" py="xl" mih="100vh">
      <header style={{ marginBottom: "var(--mantine-spacing-xl)" }}>
        <Button
          onClick={() => (window.location.href = "/")}
          variant="subtle"
          color="gray"
          size="sm"
          leftSection="←"
        >
          돌아가기
        </Button>
        <Title order={1} fw={300} mt="lg" mb="xs">
          블로그
        </Title>
        <Text size="sm" c="dimmed">
          기술, 경험, 그리고 생각들
        </Text>
      </header>

      {error && (
        <Paper
          withBorder
          p="md"
          mb="lg"
          color="red"
          bg="rgba(255, 0, 0, 0.1)"
          style={{ borderColor: "var(--mantine-color-red-9)" }}
        >
          <Text c="red.4" size="sm">
            {error}
          </Text>
        </Paper>
      )}

      {loading && <BlogListSkeleton />}

      {!loading && posts.length > 0 && (
        <Stack gap={0}>
          {posts.map(post => (
            <Anchor
              component="button"
              key={post.id}
              onClick={() => navigate({ view: "detail", slug: post.slug })}
              onMouseEnter={() => setHoveredSlug(post.slug)}
              onMouseLeave={() => setHoveredSlug(null)}
              underline="never"
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "var(--mantine-spacing-md) 0",
                borderBottom: "1px solid var(--mantine-color-dark-4)",
                color: "inherit",
                transition: "border-color 0.2s",
              }}
            >
              <Group
                justify="space-between"
                align="baseline"
                wrap="nowrap"
                gap="md"
              >
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Title
                    order={2}
                    size="h3"
                    fw={500}
                    c={hoveredSlug === post.slug ? "white" : "dimmed"}
                    style={{
                      transition: "color 0.2s",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {post.title}
                  </Title>
                  {post.tags && post.tags.length > 0 && (
                    <Group gap="xs" mt="xs">
                      {post.tags.slice(0, 3).map(tag => (
                        <Text key={tag} size="xs" c="dimmed">
                          #{tag}
                        </Text>
                      ))}
                    </Group>
                  )}
                </Box>
                <Text size="sm" c="dimmed" style={{ whiteSpace: "nowrap" }}>
                  {new Date(
                    post.published_at || post.created_at
                  ).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </Group>
            </Anchor>
          ))}
        </Stack>
      )}

      {!loading && posts.length === 0 && !error && (
        <Box py={64} ta="center">
          <Text c="dimmed" mb="lg">
            아직 작성된 글이 없습니다
          </Text>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="subtle"
            color="gray"
            size="sm"
            leftSection="←"
          >
            돌아가기
          </Button>
        </Box>
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
        <Text c="dimmed" mb="md">
          {error || "글을 찾을 수 없습니다"}
        </Text>
        <Button
          onClick={() => navigate({ view: "list" })}
          variant="subtle"
          color="gray"
          size="sm"
          leftSection="←"
        >
          블로그로 돌아가기
        </Button>
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
      <Button
        onClick={() => navigate({ view: "list" })}
        variant="subtle"
        color="gray"
        size="sm"
        leftSection="←"
      >
        블로그
      </Button>

      <header
        style={{
          marginTop: "var(--mantine-spacing-xl)",
          marginBottom: "var(--mantine-spacing-xl)",
        }}
      >
        <Text size="sm" c="dimmed" mb="md">
          {formatDate(post.published_at || post.created_at)}
        </Text>
        <Title order={1} fw={300} size="h1" mb="lg" style={{ lineHeight: 1.2 }}>
          {post.title}
        </Title>

        {post.tags && post.tags.length > 0 && (
          <Group gap="xs">
            {post.tags.map(tag => (
              <Text key={tag} size="sm" c="dimmed">
                #{tag}
              </Text>
            ))}
          </Group>
        )}
      </header>

      {post.cover_image_url && (
        <Box
          mb="xl"
          style={{
            borderRadius: "var(--mantine-radius-md)",
            overflow: "hidden",
          }}
        >
          <Image
            src={post.cover_image_url}
            alt={post.title}
            width={800}
            height={400}
            style={{ width: "100%", height: "auto", objectFit: "cover" }}
          />
        </Box>
      )}

      {post.excerpt && (
        <Text
          size="lg"
          c="dimmed"
          mb="xl"
          pl="lg"
          style={{ borderLeft: "2px solid var(--mantine-color-dark-4)" }}
        >
          {post.excerpt}
        </Text>
      )}

      <TypographyStylesProvider>
        <Box style={{ marginBottom: "4rem" }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </Box>
      </TypographyStylesProvider>

      <Box
        pt="lg"
        style={{ borderTop: "1px solid var(--mantine-color-dark-4)" }}
      >
        <Button
          onClick={() => navigate({ view: "list" })}
          variant="subtle"
          color="gray"
          size="sm"
          leftSection="←"
        >
          블로그로 돌아가기
        </Button>
      </Box>
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
    // We intentionally only key off paramsArray (derived from route)
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
