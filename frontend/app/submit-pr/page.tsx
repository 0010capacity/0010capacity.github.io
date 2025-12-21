"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Container,
  Stack,
  Title,
  Text,
  TextInput,
  Textarea,
  Select,
  Button,
  Group,
  Alert,
  Box,
  Loader,
  Center,
} from "@mantine/core";
import { IconSend, IconExternalLink } from "@tabler/icons-react";
import { createPrivacyPolicyPR } from "../../lib/github";

function SubmitPRForm() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [appName, setAppName] = useState("");
  const [language, setLanguage] = useState("ko");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [prUrl, setPrUrl] = useState("");
  const [error, setError] = useState("");

  // Load URL parameters
  useEffect(() => {
    const appParam = searchParams.get("app");
    const langParam = searchParams.get("lang");

    if (appParam) {
      setAppName(decodeURIComponent(appParam));
    }
    if (langParam) {
      setLanguage(langParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setPrUrl("");

    try {
      const url = await createPrivacyPolicyPR(
        token,
        appName,
        language,
        content
      );
      setPrUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container size="sm" py="xl">
      <Stack gap="xl">
        <Box>
          <Title order={1} mb="md">
            Submit Privacy Policy PR
          </Title>
          <Text c="dimmed">
            Create a pull request to add or update a privacy policy for your
            app.
          </Text>
        </Box>

        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            {/* Token Input */}
            <Stack gap="xs">
              <Text fw={500} size="sm">
                GitHub Personal Access Token
              </Text>
              <TextInput
                type="password"
                value={token}
                onChange={e => setToken(e.currentTarget.value)}
                placeholder="ghp_..."
                required
                disabled={isLoading}
              />
              <Text size="xs" c="dimmed">
                Please enter a token with repo permissions.
              </Text>
            </Stack>

            {/* App Name Input */}
            <Stack gap="xs">
              <Text fw={500} size="sm">
                App Name
              </Text>
              <TextInput
                value={appName}
                onChange={e => setAppName(e.currentTarget.value)}
                placeholder="MyApp"
                required
                disabled={isLoading}
              />
            </Stack>

            {/* Language Select */}
            <Stack gap="xs">
              <Text fw={500} size="sm">
                Language
              </Text>
              <Select
                value={language}
                onChange={value => setLanguage(value || "ko")}
                data={[
                  { value: "ko", label: "Korean (ko)" },
                  { value: "en", label: "English (en)" },
                  { value: "ja", label: "Japanese (ja)" },
                  { value: "zh", label: "Chinese (zh)" },
                ]}
                disabled={isLoading}
                searchable={false}
              />
            </Stack>

            {/* Content Textarea */}
            <Stack gap="xs">
              <Text fw={500} size="sm">
                Privacy Policy Content
              </Text>
              <Textarea
                value={content}
                onChange={e => setContent(e.currentTarget.value)}
                placeholder="Enter the privacy policy content..."
                minRows={8}
                required
                disabled={isLoading}
              />
            </Stack>

            {/* Error Alert */}
            {error && (
              <Alert title="Error" color="red" variant="light">
                {error}
              </Alert>
            )}

            {/* Success Alert */}
            {prUrl && (
              <Alert title="Success" color="green" variant="light">
                <Group justify="space-between">
                  <Text>PR created successfully!</Text>
                  <Button
                    component="a"
                    href={prUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="light"
                    size="xs"
                    rightSection={<IconExternalLink size={14} />}
                  >
                    View PR
                  </Button>
                </Group>
              </Alert>
            )}

            {/* Action Buttons */}
            <Group justify="flex-end" gap="md" pt="md">
              <Button
                type="button"
                variant="default"
                onClick={() => window.history.back()}
                disabled={isLoading}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !token || !appName || !content}
                loading={isLoading}
                leftSection={<IconSend size={16} />}
              >
                {isLoading ? "Creating PR..." : "Submit PR"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Container>
  );
}

export default function SubmitPRPage() {
  return (
    <Suspense
      fallback={
        <Center h="100vh">
          <Loader />
        </Center>
      }
    >
      <SubmitPRForm />
    </Suspense>
  );
}
