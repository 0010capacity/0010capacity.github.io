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
  Badge,
  Anchor,
  Box,
  TypographyStylesProvider,
} from "@mantine/core";

function NovelListSkeleton() {
  return (
    <Stack gap="xl">
      {Array.from({ length: 6 }).map((_, i) => (
        <Box
          key={i}
          py="lg"
          style={{ borderBottom: "1px solid var(--mantine-color-dark-4)" }}
        >
          <Group justify="space-between" align="flex-start" mb="xs">
            <Skeleton height={24} width="66%" radius="sm" />
            <Skeleton height={20} width={64} radius="sm" />
          </Group>
          <Skeleton height={16} width="100%" mb="xs" radius="sm" />
          <Skeleton height={16} width="80%" mb="md" radius="sm" />
          <Group gap="md">
            <Skeleton height={12} width={80} radius="sm" />
            <Skeleton height={12} width={56} radius="sm" />
          </Group>
        </Box>
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
        // Filter out draft novels - they should be hidden from public view
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

  return (
    <Container size="sm" py="xl" mih="100vh">
      <header style={{ marginBottom: "var(--mantine-spacing-xl)" }}>
        <Button
          component={Link}
          href="/"
          variant="subtle"
          color="gray"
          size="sm"
          leftSection="←"
        >
          돌아가기
        </Button>
        <Title order={1} fw={300} mt="lg" mb="xs">
          소설
        </Title>
        <Text size="sm" c="dimmed">
          이야기를 씁니다
        </Text>
      </header>

      {error && (
        <Box
          p="md"
          mb="lg"
          style={{
            border: "1px solid var(--mantine-color-red-9)",
            backgroundColor: "rgba(255, 0, 0, 0.1)",
          }}
        >
          <Text c="red.4" size="sm">
            {error}
          </Text>
        </Box>
      )}

      {loading && <NovelListSkeleton />}

      {!loading && novels.length > 0 && (
        <Stack gap="lg">
          {novels.map(novel => (
            <Anchor
              component={Link}
              key={novel.id}
              href={`/novels?novel=${novel.slug}`}
              underline="never"
              style={{
                display: "block",
                padding: "var(--mantine-spacing-lg) 0",
                borderBottom: "1px solid var(--mantine-color-dark-4)",
                transition: "border-color 0.2s",
              }}
              className="group"
            >
              <Group justify="space-between" align="flex-start" mb="xs">
                <Title
                  order={2}
                  size="h3"
                  fw={500}
                  c="dimmed"
                  style={{ transition: "color 0.2s" }}
                  className="group-hover:text-white"
                >
                  {novel.title}
                </Title>
                <Badge variant="light" color="gray" size="sm" radius="sm">
                  {statusLabel(novel.status)}
                </Badge>
              </Group>
              {novel.description && (
                <Text size="sm" c="dimmed" lineClamp={2} mb="xs">
                  {novel.description}
                </Text>
              )}
              <Group gap="md">
                {novel.genre && (
                  <Text size="xs" c="dimmed">
                    {novel.genre}
                  </Text>
                )}
              </Group>
            </Anchor>
          ))}
        </Stack>
      )}

      {!loading && novels.length === 0 && !error && (
        <Box py={100} ta="center">
          <Text c="dimmed" mb="xs">
            아직 등록된 소설이 없습니다
          </Text>
          <Text size="sm" c="dimmed">
            곧 새로운 이야기가 시작됩니다
          </Text>
        </Box>
      )}
    </Container>
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
        const [novelData, chaptersData, relationsData] = await Promise.all([
          novelsApi.getBySlug(slug),
          novelsApi.getChapters(slug),
          novelsApi.getRelations(slug),
        ]);
        const fetchedNovel = novelData as Novel;

        // Block access to draft novels - they should be hidden from public view
        if (fetchedNovel.status === "draft") {
          setError("이 소설은 아직 공개되지 않았습니다");
          setNovel(null);
          setChapters([]);
          return;
        }

        // Add related novels to the novel object
        fetchedNovel.related_novels = Array.isArray(relationsData)
          ? relationsData
          : [];

        setNovel(fetchedNovel);
        setChapters(
          Array.isArray(chaptersData) ? (chaptersData as NovelChapter[]) : []
        );
        setError("");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "소설을 불러오지 못했습니다"
        );
        setNovel(null);
        setChapters([]);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchNovelData();
    }
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

  // 소설 유형에 따른 단위
  const getUnit = (novelType?: string) => {
    return novelType === "series" ? "화" : "장";
  };

  if (loading) {
    return (
      <Container
        size="sm"
        h="100vh"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text size="sm" c="dimmed">
          불러오는 중...
        </Text>
      </Container>
    );
  }

  if (error || !novel) {
    return (
      <Container size="sm" py="xl" mih="100vh">
        <Text c="dimmed" mb="md">
          {error || "소설을 찾을 수 없습니다"}
        </Text>
        <Button
          component={Link}
          href="/novels"
          variant="subtle"
          color="gray"
          size="sm"
          leftSection="←"
        >
          목록으로
        </Button>
      </Container>
    );
  }

  const unit = getUnit(novel.novel_type);

  return (
    <Container size="sm" py="xl" mih="100vh">
      <Button
        component={Link}
        href="/novels"
        variant="subtle"
        color="gray"
        size="sm"
        leftSection="←"
      >
        목록으로
      </Button>

      <header
        style={{
          marginTop: "var(--mantine-spacing-xl)",
          marginBottom: "var(--mantine-spacing-xl)",
        }}
      >
        <Group gap="xs" mb="md">
          <Badge variant="outline" color="gray" size="sm" radius="sm">
            {statusLabel(novel.status)}
          </Badge>
          {novel.genre && (
            <Text size="xs" c="dimmed">
              {novel.genre}
            </Text>
          )}
          {novel.novel_type && (
            <Text size="xs" c="dimmed">
              {novel.novel_type === "series"
                ? "연재물"
                : novel.novel_type === "long"
                  ? "장편"
                  : "단편"}
            </Text>
          )}
        </Group>

        <Title order={1} fw={300} size="h1" mb="lg">
          {novel.title}
        </Title>

        {novel.description && (
          <Text c="dimmed" style={{ lineHeight: 1.6 }}>
            {novel.description}
          </Text>
        )}

        <Group
          gap="lg"
          mt="xl"
          pt="lg"
          style={{ borderTop: "1px solid var(--mantine-color-dark-4)" }}
        >
          <Text size="sm" c="dimmed">
            {chapters.length} {unit}
          </Text>
          <Text size="sm" c="dimmed">
            {new Date(novel.created_at).toLocaleDateString("ko-KR")}
          </Text>
        </Group>
      </header>

      <section>
        <Text
          size="sm"
          c="dimmed"
          tt="uppercase"
          fw={700}
          mb="lg"
          style={{ letterSpacing: "1px" }}
        >
          {novel.novel_type === "series" ? "회차 목록" : "목차"}
        </Text>

        {chapters.length > 0 ? (
          <Stack gap={0}>
            {chapters.map(chapter => (
              <Anchor
                component={Link}
                key={chapter.id}
                href={`/novels?novel=${slug}&chapter=${chapter.chapter_number}`}
                underline="never"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  padding: "var(--mantine-spacing-md) 0",
                  borderBottom: "1px solid var(--mantine-color-dark-4)",
                  color: "inherit",
                }}
                className="group"
              >
                <Group gap="lg" align="baseline">
                  <Text size="sm" c="dimmed" w={48}>
                    {chapter.chapter_number}
                    {unit}
                  </Text>
                  <Text
                    c="dimmed"
                    style={{ transition: "color 0.2s" }}
                    className="group-hover:text-white"
                  >
                    {chapter.title}
                  </Text>
                </Group>
                <Text size="xs" c="dark.3">
                  {new Date(chapter.created_at).toLocaleDateString("ko-KR", {
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </Anchor>
            ))}
          </Stack>
        ) : (
          <Text size="sm" c="dimmed">
            아직 {unit}이 없습니다
          </Text>
        )}
      </section>

      {novel.related_novels && novel.related_novels.length > 0 && (
        <section
          style={{
            marginTop: "var(--mantine-spacing-xl)",
            paddingTop: "var(--mantine-spacing-xl)",
            borderTop: "1px solid var(--mantine-color-dark-4)",
          }}
        >
          <Text
            size="sm"
            c="dimmed"
            tt="uppercase"
            fw={700}
            mb="lg"
            style={{ letterSpacing: "1px" }}
          >
            연관 작품
          </Text>
          <Stack gap="sm">
            {novel.related_novels.map(relatedNovel => (
              <Anchor
                component={Link}
                key={relatedNovel.id}
                href={`/novels?novel=${relatedNovel.slug}`}
                underline="never"
                p="md"
                style={{
                  display: "block",
                  border: "1px solid var(--mantine-color-dark-4)",
                  borderRadius: "var(--mantine-radius-sm)",
                  transition: "background-color 0.2s",
                  color: "inherit",
                }}
                className="hover:bg-dark-6"
              >
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      fw={500}
                      c="dimmed"
                      truncate
                      style={{ transition: "color 0.2s" }}
                      className="group-hover:text-white"
                    >
                      {relatedNovel.title}
                    </Text>
                    <Text size="xs" c="dimmed" mt={4}>
                      {relatedNovel.relation_type === "sequel"
                        ? "후속작"
                        : relatedNovel.relation_type === "prequel"
                          ? "전편"
                          : relatedNovel.relation_type === "spinoff"
                            ? "스핀오프"
                            : relatedNovel.relation_type === "same_universe"
                              ? "같은 세계관"
                              : "연관 작품"}
                    </Text>
                  </Box>
                  <Text size="xs" c="dimmed">
                    →
                  </Text>
                </Group>
              </Anchor>
            ))}
          </Stack>
        </section>
      )}
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
        const [novelData, chapterData, chaptersData] = await Promise.all([
          novelsApi.getBySlug(slug),
          novelsApi.getChapter(slug, chapterNumber),
          novelsApi.getChapters(slug),
        ]);
        const fetchedNovel = novelData as Novel;

        // Block access to draft novel chapters - they should be hidden from public view
        if (fetchedNovel.status === "draft") {
          setError("이 소설은 아직 공개되지 않았습니다");
          setNovel(null);
          setChapter(null);
          setChapters([]);
          return;
        }

        setNovel(fetchedNovel);
        setChapter(chapterData as NovelChapter);
        setChapters(
          Array.isArray(chaptersData) ? (chaptersData as NovelChapter[]) : []
        );
        setError("");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "챕터를 불러오지 못했습니다"
        );
        setChapter(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug && chapterNumber) {
      fetchChapterData();
    }
  }, [slug, chapterNumber]);

  // 소설 유형에 따른 단위
  const getUnit = (novelType?: string) => {
    return novelType === "series" ? "화" : "장";
  };

  if (loading) {
    return (
      <Container
        size="sm"
        h="100vh"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text size="sm" c="dimmed">
          불러오는 중...
        </Text>
      </Container>
    );
  }

  if (error || !chapter || !novel) {
    return (
      <Container size="sm" py="xl" mih="100vh">
        <Text c="dimmed" mb="md">
          {error || "챕터를 찾을 수 없습니다"}
        </Text>
        <Button
          component={Link}
          href={`/novels?novel=${slug}`}
          variant="subtle"
          color="gray"
          size="sm"
          leftSection="←"
        >
          돌아가기
        </Button>
      </Container>
    );
  }

  const unit = getUnit(novel.novel_type);
  const currentIndex = chapters.findIndex(
    c => c.chapter_number === chapterNumber
  );
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter =
    currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  return (
    <Container size="sm" py="xl" mih="100vh">
      <Group justify="space-between" mb="xl">
        <Button
          component={Link}
          href={`/novels?novel=${slug}`}
          variant="subtle"
          color="gray"
          size="sm"
          leftSection="←"
        >
          {novel.title}
        </Button>
        <Text size="sm" c="dimmed">
          {chapterNumber} / {chapters.length}
        </Text>
      </Group>

      <header
        style={{
          marginBottom: "var(--mantine-spacing-xl)",
          paddingBottom: "var(--mantine-spacing-lg)",
          borderBottom: "1px solid var(--mantine-color-dark-4)",
        }}
      >
        <Text size="sm" c="dimmed" mb="xs">
          {chapterNumber}
          {unit}
        </Text>
        <Title order={1} fw={300} size="h2" mb="md">
          {chapter.title}
        </Title>
        <Text size="sm" c="dark.3">
          {new Date(chapter.created_at).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </header>

      <TypographyStylesProvider className="mb-16">
        <div className="prose prose-invert prose-neutral max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {chapter.content}
          </ReactMarkdown>
        </div>
      </TypographyStylesProvider>

      <Group
        justify="space-between"
        align="center"
        py="lg"
        style={{ borderTop: "1px solid var(--mantine-color-dark-4)" }}
      >
        {prevChapter ? (
          <Button
            component={Link}
            href={`/novels?novel=${slug}&chapter=${prevChapter.chapter_number}`}
            variant="subtle"
            color="gray"
            size="sm"
            leftSection="←"
          >
            이전
          </Button>
        ) : (
          <Box w={60} />
        )}

        <Button
          component={Link}
          href={`/novels?novel=${slug}`}
          variant="subtle"
          color="gray"
          size="sm"
        >
          목차
        </Button>

        {nextChapter ? (
          <Button
            component={Link}
            href={`/novels?novel=${slug}&chapter=${nextChapter.chapter_number}`}
            variant="subtle"
            color="gray"
            size="sm"
            rightSection="→"
          >
            다음
          </Button>
        ) : (
          <Box w={60} />
        )}
      </Group>
    </Container>
  );
}

// Main Page Component with SPA-style Routing
export default function NovelsPageClient() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("novel");
  const chapterParam = searchParams.get("chapter");

  const renderView = () => {
    if (!slug) {
      return <NovelList />;
    }

    if (chapterParam) {
      const chapterNumber = parseInt(chapterParam, 10);
      if (!isNaN(chapterNumber)) {
        return <ChapterRead slug={slug} chapterNumber={chapterNumber} />;
      }
    }

    return <NovelDetail slug={slug} />;
  };

  return <>{renderView()}</>;
}
