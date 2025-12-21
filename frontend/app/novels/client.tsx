"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { novelsApi } from "@/lib/api";
import { Novel, NovelChapter } from "@/lib/types";
import {
  Skeleton,
  Container,
  Title,
  Text,
  Button,
  Stack,
  Group,
  Anchor,
  Box,
  TypographyStylesProvider,
  Paper,
  Center,
  Loader,
} from "@mantine/core";
import { ArrowLeft, ArrowRight } from "lucide-react";

function NovelListSkeleton() {
  return (
    <Stack gap="md" aria-label="소설 목록 로딩" aria-busy="true">
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

// Novel List Component
function NovelList() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNovels = async () => {
      try {
        setLoading(true);
        const response = (await novelsApi.list({ limit: 50 })) as {
          novels: Novel[];
          total: number;
        };
        const publishedNovels = (response.novels || []).filter(
          novel => novel.status !== "draft"
        );
        setNovels(publishedNovels);
        setError("");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "소설을 불러오지 못했습니다"
        );
        setNovels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNovels();
  }, []);

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
              소설
            </Title>

            {novels.length > 0 && (
              <Text size="xs" c="dimmed">
                총 {novels.length}개
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
          {loading && <NovelListSkeleton />}

          {/* Novels List */}
          {!loading && novels.length > 0 && (
            <Stack gap="md">
              {novels.map(novel => (
                <Anchor
                  component={Link}
                  key={novel.id}
                  href={`/novels?novel=${novel.slug}`}
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
                          {novel.title}
                        </Title>

                        {novel.description && (
                          <Text size="sm" c="dimmed" lineClamp={2}>
                            {novel.description}
                          </Text>
                        )}

                        <Group gap="sm" mt="sm">
                          <Text size="xs" c="dimmed">
                            {novel.status === "ongoing"
                              ? "연재 중"
                              : novel.status === "completed"
                                ? "완결"
                                : novel.status}
                          </Text>
                          {novel.genre && (
                            <Text size="xs" c="dimmed">
                              {novel.genre}
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
          {!loading && novels.length === 0 && !error && (
            <Center py="xl">
              <Text c="dimmed">등록된 소설이 없습니다</Text>
            </Center>
          )}
        </Stack>
      </Container>
    </Box>
  );
}

// Novel Detail Component
function NovelDetail({ slug }: { slug: string }) {
  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<NovelChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNovelData = async () => {
      try {
        setLoading(true);
        const novelData = (await novelsApi.getBySlug(slug)) as Novel;
        const chaptersData = (await novelsApi.getChapters(
          slug
        )) as NovelChapter[];
        setNovel(novelData);
        setChapters(chaptersData || []);
        setError("");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "소설을 불러오지 못했습니다"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchNovelData();
  }, [slug]);

  const statusLabel = (status: string) => {
    switch (status) {
      case "draft":
        return "작성 중";
      case "ongoing":
        return "연재 중";
      case "completed":
        return "완결";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Center mih="100vh">
        <Loader />
      </Center>
    );
  }

  if (error || !novel) {
    return (
      <Container size="sm" py="xl" mih="100vh">
        <Stack gap="md">
          <Button
            component={Link}
            href="/novels"
            variant="subtle"
            size="sm"
            leftSection={<ArrowLeft size={16} />}
          >
            돌아가기
          </Button>
          <Text c="red">{error || "소설을 찾을 수 없습니다"}</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl" mih="100vh">
      <Stack gap="xl">
        <Button
          component={Link}
          href="/novels"
          variant="subtle"
          size="sm"
          leftSection={<ArrowLeft size={16} />}
        >
          돌아가기
        </Button>

        <Box pb="xl" style={{ borderBottom: "1px solid var(--color-border)" }}>
          <Group gap="xs" mb="md">
            <Text size="xs" fw={500}>
              {statusLabel(novel.status)}
            </Text>
            {novel.genre && (
              <Text size="xs" fw={500}>
                {novel.genre}
              </Text>
            )}
            {novel.novel_type && (
              <Text size="xs" fw={500}>
                {novel.novel_type === "series"
                  ? "연재물"
                  : novel.novel_type === "long"
                    ? "장편"
                    : "단편"}
              </Text>
            )}
          </Group>

          <Title order={1} fw={400} size="h2" mb="md">
            {novel.title}
          </Title>

          {novel.description && (
            <Text size="md" c="dimmed" mb="md">
              {novel.description}
            </Text>
          )}

          {chapters.length > 0 && (
            <Text size="xs" c="dimmed">
              {chapters.length}개의 장
            </Text>
          )}
        </Box>

        {chapters.length > 0 && (
          <Stack gap="xs">
            <Text fw={500} size="sm">
              목차
            </Text>
            {chapters.map(chapter => (
              <Anchor
                component={Link}
                key={chapter.id}
                href={`/novels?novel=${slug}&chapter=${chapter.chapter_number}`}
                underline="never"
              >
                <Box
                  p="md"
                  style={{
                    borderLeft: "1px solid var(--color-border)",
                    paddingLeft: "1rem",
                    cursor: "pointer",
                    transition: "all 0.2s ease-in-out",
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget;
                    el.style.borderLeftColor = "var(--color-text-primary)";
                    el.style.paddingLeft = "1.25rem";
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget;
                    el.style.borderLeftColor = "var(--color-border)";
                    el.style.paddingLeft = "1rem";
                  }}
                >
                  <Group justify="space-between" align="center">
                    <Box>
                      <Text fw={500} size="sm">
                        {chapter.title || `${chapter.chapter_number}장`}
                      </Text>
                      {chapter.published_at && (
                        <Text size="xs" c="dimmed">
                          {new Date(chapter.published_at).toLocaleDateString(
                            "ko-KR"
                          )}
                        </Text>
                      )}
                    </Box>
                    <ArrowRight size={16} />
                  </Group>
                </Box>
              </Anchor>
            ))}
          </Stack>
        )}

        {chapters.length === 0 && (
          <Center py="xl">
            <Text c="dimmed">등록된 장이 없습니다</Text>
          </Center>
        )}
      </Stack>
    </Container>
  );
}

// Chapter Read Component
function ChapterRead({
  slug,
  chapterNumber,
}: {
  slug: string;
  chapterNumber: number;
}) {
  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapter, setChapter] = useState<NovelChapter | null>(null);
  const [chapters, setChapters] = useState<NovelChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchChapterData = async () => {
      try {
        setLoading(true);
        const novelData = (await novelsApi.getBySlug(slug)) as Novel;
        const chapterData = (await novelsApi.getChapter(
          slug,
          chapterNumber
        )) as NovelChapter;
        const chaptersData = (await novelsApi.getChapters(
          slug
        )) as NovelChapter[];
        setNovel(novelData);
        setChapter(chapterData);
        setChapters(chaptersData || []);
        setError("");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "챕터를 불러오지 못했습니다"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchChapterData();
  }, [slug, chapterNumber]);

  if (loading) {
    return (
      <Center mih="100vh">
        <Loader />
      </Center>
    );
  }

  if (error || !novel || !chapter) {
    return (
      <Container size="sm" py="xl" mih="100vh">
        <Stack gap="md">
          <Button
            component={Link}
            href={`/novels?novel=${slug}`}
            variant="subtle"
            size="sm"
            leftSection={<ArrowLeft size={16} />}
          >
            돌아가기
          </Button>
          <Text c="red">{error || "챕터를 찾을 수 없습니다"}</Text>
        </Stack>
      </Container>
    );
  }

  const currentIndex = chapters.findIndex(
    c => c.chapter_number === chapterNumber
  );
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : undefined;
  const nextChapter =
    currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : undefined;

  return (
    <Container size="sm" py="xl" mih="100vh">
      <Stack gap="xl">
        <Button
          component={Link}
          href={`/novels?novel=${slug}`}
          variant="subtle"
          size="sm"
          leftSection={<ArrowLeft size={16} />}
        >
          소설로 돌아가기
        </Button>

        <Box pb="xl" style={{ borderBottom: "1px solid var(--color-border)" }}>
          <Text fw={500} size="sm" mb="xs">
            {novel.title}
          </Text>
          <Title order={1} fw={400} size="h2" mb="md">
            {chapter.title || `${chapter.chapter_number}장`}
          </Title>
          {chapter.published_at && (
            <Text size="xs" c="dimmed">
              {new Date(chapter.published_at).toLocaleDateString("ko-KR")}
            </Text>
          )}
        </Box>

        <TypographyStylesProvider>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {chapter.content}
          </ReactMarkdown>
        </TypographyStylesProvider>

        <Group justify="space-between" gap="md" py="xl">
          {prevChapter ? (
            <Button
              component={Link}
              href={`/novels?novel=${slug}&chapter=${prevChapter.chapter_number}`}
              variant="subtle"
              size="sm"
              leftSection={<ArrowLeft size={16} />}
            >
              이전장
            </Button>
          ) : (
            <Box />
          )}

          {nextChapter ? (
            <Button
              component={Link}
              href={`/novels?novel=${slug}&chapter=${nextChapter.chapter_number}`}
              variant="subtle"
              size="sm"
              rightSection={<ArrowRight size={16} />}
            >
              다음장
            </Button>
          ) : (
            <Box />
          )}
        </Group>
      </Stack>
    </Container>
  );
}

// Main Page Component
export default function NovelsPageClient() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("novel");
  const chapterParam = searchParams.get("chapter");

  const renderView = () => {
    if (slug && chapterParam) {
      const chapterNumber = parseInt(chapterParam, 10);
      return <ChapterRead slug={slug} chapterNumber={chapterNumber} />;
    }

    if (slug) {
      return <NovelDetail slug={slug} />;
    }

    return <NovelList />;
  };

  return renderView();
}
