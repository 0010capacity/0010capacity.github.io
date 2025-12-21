"use client";

import { useState } from "react";
import { Home } from "lucide-react";
import {
  Container,
  Title,
  Text,
  Button as MantineButton,
  Card,
  Stack,
  Group,
  Badge,
  Grid,
  Progress,
  Alert,
  Box,
  Center,
  Loader,
  SimpleGrid,
  Paper,
  ThemeIcon,
  RingProgress,
} from "@mantine/core";
import { GitHubAnalyzer } from "../../lib/github";
import { Button } from "../../components";

interface AnalysisResult {
  languages: { [key: string]: number };
  frameworks: string[];
  technologies: string[];
  repositories: Array<{
    name: string;
    language: string | null;
    description: string | null;
    html_url: string;
  }>;
}

export default function TechStackAnalysis() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState("0010capacity");
  const [token, setToken] = useState("");
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const analyzeUserRepos = async (user: string, userToken?: string) => {
    setLoading(true);
    setError(null);

    try {
      const analyzer = new GitHubAnalyzer(user, userToken);
      const repos = await analyzer.getRepositories();
      const techStack = await analyzer.analyzeTechStack();

      setAnalysis({
        languages: techStack.languages,
        frameworks: techStack.frameworks,
        technologies: techStack.technologies,
        repositories: repos.map(repo => ({
          name: repo.name,
          language: repo.language,
          description: repo.description,
          html_url: repo.html_url,
        })),
      });
      setHasAnalyzed(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to analyze repositories"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getLanguagePercentage = (bytes: number, total: number): number => {
    return Math.round((bytes / total) * 100);
  };

  const totalBytes = analysis
    ? Object.values(analysis.languages).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <Box
      style={{
        backgroundImage:
          "linear-gradient(to bottom right, var(--mantine-color-blue-0), var(--mantine-color-indigo-1))",
        minHeight: "100vh",
      }}
    >
      <Container size="lg" py="xl">
        {/* Header Card */}
        <Card mb="xl" withBorder padding="xl" radius="md">
          <Stack gap="lg">
            <MantineButton
              component="a"
              href="/"
              variant="outline"
              size="sm"
              leftSection={<Home size={16} />}
              w="fit-content"
            >
              Home
            </MantineButton>
            <div>
              <Title order={1} mb="md">
                GitHub Tech Stack Analyzer
              </Title>
              <Text size="lg" c="dimmed" mb="lg">
                Analyze GitHub repositories to automatically detect a
                developer&apos;s tech stack.
              </Text>
            </div>

            {/* Input Form */}
            <form
              onSubmit={e => {
                e.preventDefault();
                analyzeUserRepos(username, token || undefined);
              }}
            >
              <Stack gap="md">
                <Group grow align="flex-end">
                  <TextInput
                    label="GitHub Username"
                    placeholder="GitHub Username"
                    value={username}
                    onChange={e => setUsername(e.currentTarget.value)}
                  />
                  <PasswordInput
                    label="GitHub Personal Access Token (Optional)"
                    placeholder="GitHub Personal Access Token (Optional)"
                    value={token}
                    onChange={e => setToken(e.currentTarget.value)}
                  />
                  <MantineButton
                    type="submit"
                    disabled={loading}
                    loading={loading}
                  >
                    {loading ? "Analyzing..." : "Analyze"}
                  </MantineButton>
                </Group>
              </Stack>
            </form>
          </Stack>
        </Card>

        {/* Error State */}
        {error && (
          <Alert color="red" title="Error" mb="xl">
            {error}
            <MantineButton
              variant="subtle"
              size="sm"
              mt="sm"
              onClick={() => analyzeUserRepos(username, token || undefined)}
            >
              Retry
            </MantineButton>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Card mb="xl" withBorder padding="xl" radius="md">
            <Center py="xl">
              <Stack align="center">
                <RingProgress
                  sections={[{ value: 100, color: "blue" }]}
                  size={100}
                  thickness={4}
                />
                <Text c="dimmed">Analyzing GitHub repositories...</Text>
              </Stack>
            </Center>
          </Card>
        )}

        {/* Initial State - Before Analysis */}
        {!hasAnalyzed && !loading && (
          <Card mb="xl" withBorder padding="xl" radius="md">
            <Center py="xl">
              <Stack align="center" gap="lg" w="100%">
                <Center
                  w={80}
                  h={80}
                  style={{
                    backgroundColor: "var(--mantine-color-blue-1)",
                    borderRadius: "50%",
                  }}
                >
                  <svg
                    style={{
                      width: 40,
                      height: 40,
                      color: "var(--mantine-color-blue-6)",
                    }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </Center>
                <div style={{ textAlign: "center" }}>
                  <Title order={2} mb="sm">
                    GitHub Tech Stack Analysis
                  </Title>
                  <Text c="dimmed" mb="lg">
                    Enter the information above and click the
                    &ldquo;Analyze&rdquo; button to analyze GitHub repositories.
                  </Text>
                </div>
                <Paper
                  p="md"
                  radius="md"
                  style={{
                    backgroundColor: "var(--mantine-color-blue-0)",
                    border: "1px solid var(--mantine-color-blue-2)",
                  }}
                  w="100%"
                >
                  <Stack gap="xs">
                    <Text fw={600} c="var(--mantine-color-blue-8)" size="sm">
                      💡 Analysis Tips
                    </Text>
                    <Text
                      component="ul"
                      size="sm"
                      c="var(--mantine-color-blue-7)"
                      style={{ margin: 0, paddingLeft: 20 }}
                    >
                      <li>
                        Entering a Personal Access Token enables more accurate
                        analysis
                      </li>
                      <li>
                        Only public repositories are analyzed; private
                        repositories are not analyzed even with a token
                      </li>
                      <li>
                        Do not analyze too frequently due to API rate limits
                      </li>
                    </Text>
                  </Stack>
                </Paper>
              </Stack>
            </Center>
          </Card>
        )}

        {/* Analysis Results */}
        {analysis && !loading && (
          <Stack gap="xl">
            {/* Languages */}
            <Card withBorder padding="xl" radius="md">
              <Title order={2} mb="lg">
                Programming Languages
              </Title>
              <Stack gap="lg">
                {Object.entries(analysis.languages)
                  .slice(0, 10)
                  .map(([lang, bytes]) => {
                    const percentage = getLanguagePercentage(bytes, totalBytes);
                    return (
                      <div key={lang}>
                        <Group justify="space-between" mb="xs">
                          <Text fw={500} size="sm">
                            {lang}
                          </Text>
                          <Group gap="sm">
                            <Text size="sm" c="dimmed">
                              {percentage}%
                            </Text>
                            <Text size="xs" c="dimmed">
                              {formatBytes(bytes)}
                            </Text>
                          </Group>
                        </Group>
                        <Progress
                          value={percentage}
                          color="blue"
                          size="md"
                          radius="md"
                        />
                      </div>
                    );
                  })}
              </Stack>
            </Card>

            {/* Frameworks */}
            <Card withBorder padding="xl" radius="md">
              <Title order={2} mb="lg">
                Frameworks & Libraries
              </Title>
              <Group gap="sm">
                {analysis.frameworks.length > 0 ? (
                  analysis.frameworks.map(framework => (
                    <Badge
                      key={framework}
                      variant="light"
                      color="green"
                      size="lg"
                    >
                      {framework}
                    </Badge>
                  ))
                ) : (
                  <Text c="dimmed">No frameworks detected.</Text>
                )}
              </Group>
            </Card>

            {/* Technologies */}
            <Card withBorder padding="xl" radius="md">
              <Title order={2} mb="lg">
                Tech Stack
              </Title>
              <Group gap="sm">
                {analysis.technologies.length > 0 ? (
                  analysis.technologies.map(tech => (
                    <Badge key={tech} variant="light" color="blue" size="lg">
                      {tech}
                    </Badge>
                  ))
                ) : (
                  <Text c="dimmed">No technologies detected.</Text>
                )}
              </Group>
            </Card>

            {/* Repositories */}
            <Card withBorder padding="xl" radius="md">
              <Title order={2} mb="lg">
                Analyzed Repositories ({analysis.repositories.length})
              </Title>
              <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
                {analysis.repositories.slice(0, 12).map(repo => (
                  <Paper
                    key={repo.name}
                    p="md"
                    withBorder
                    radius="md"
                    style={{ transition: "box-shadow 0.2s ease" }}
                    className="hover:shadow-md"
                  >
                    <Stack gap="sm">
                      <Text
                        component="a"
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        fw={600}
                        c="blue"
                        style={{ textDecoration: "none" }}
                        className="hover:underline"
                      >
                        {repo.name}
                      </Text>
                      {repo.language && (
                        <Badge variant="light" size="sm">
                          {repo.language}
                        </Badge>
                      )}
                      {repo.description && (
                        <Text size="sm" c="dimmed" lineClamp={2}>
                          {repo.description}
                        </Text>
                      )}
                    </Stack>
                  </Paper>
                ))}
              </SimpleGrid>
            </Card>
          </Stack>
        )}
      </Container>
    </Box>
  );
}
