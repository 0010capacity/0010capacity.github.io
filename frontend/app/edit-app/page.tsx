"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Save, ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import {
  Container,
  Title,
  Text,
  Button as MantineButton,
  TextInput,
  PasswordInput,
  Textarea,
  Select,
  Checkbox,
  Alert,
  Box,
  Grid,
  Card,
  Stack,
  Group,
  Center,
  Loader,
  Paper,
} from "@mantine/core";
import { updateAppPR } from "../../lib/github";
import { Button } from "../../components";

interface Deployment {
  type: "website" | "appstore" | "googleplay" | "steam" | "download" | "other";
  url: string;
  label?: string;
}

interface AppData {
  name: string;
  description: string;
  deployments: Deployment[];
  githubRepo?: string;
  createdAt: string;
  updatedAt: string;
}

function EditAppForm() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [appName, setAppName] = useState("");
  const [description, setDescription] = useState("");
  const [deployments, setDeployments] = useState<Deployment[]>([
    { type: "website", url: "" },
  ]);
  const [githubRepo, setGithubRepo] = useState("");
  const [showGithubField, setShowGithubField] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingApp, setIsLoadingApp] = useState(true);
  const [prUrl, setPrUrl] = useState("");
  const [error, setError] = useState("");

  // Load app data from URL parameter
  useEffect(() => {
    const loadAppData = async () => {
      const appParam = searchParams.get("app");
      if (!appParam) {
        setError("App name is not specified.");
        setIsLoadingApp(false);
        return;
      }

      const decodedAppName = decodeURIComponent(appParam);
      setAppName(decodedAppName);

      try {
        // Load actual app data from JSON file
        const response = await fetch(
          `/data/apps/${encodeURIComponent(decodedAppName)}.json`
        );
        if (!response.ok) {
          throw new Error("App data not found");
        }
        const appData: AppData = await response.json();

        setDescription(appData.description || "");
        setDeployments(
          appData.deployments && appData.deployments.length > 0
            ? appData.deployments
            : [{ type: "website", url: "" }]
        );
        if (appData.githubRepo) {
          setGithubRepo(appData.githubRepo);
          setShowGithubField(true);
        }
      } catch (err) {
        console.error("Failed to load app data:", err);
        setError(
          "Failed to load app data. The app may not exist or there was a network error."
        );
      } finally {
        setIsLoadingApp(false);
      }
    };

    loadAppData();
  }, [searchParams]);

  const addDeployment = () => {
    setDeployments([...deployments, { type: "website", url: "" }]);
  };

  const removeDeployment = (index: number) => {
    if (deployments.length > 1) {
      setDeployments(deployments.filter((_, i) => i !== index));
    }
  };

  const updateDeployment = (
    index: number,
    field: keyof Deployment,
    value: string
  ) => {
    const updated = deployments.map((deployment, i) =>
      i === index ? { ...deployment, [field]: value } : deployment
    );
    setDeployments(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setPrUrl("");

    // Validate deployments
    const validDeployments = deployments.filter(d => d.url.trim() !== "");
    if (validDeployments.length === 0) {
      setError("Please enter at least one deployment URL.");
      setIsLoading(false);
      return;
    }

    try {
      const url = await updateAppPR(
        token,
        appName,
        description,
        validDeployments,
        showGithubField ? githubRepo : undefined
      );
      setPrUrl(url);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingApp) {
    return (
      <Container size="sm" py="xl">
        <Center py="xl">
          <Stack align="center" gap="md">
            <Loader />
            <Text c="dimmed">Loading app information...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Stack gap="lg">
        <Group gap="md">
          <Button
            href={`/apps/${encodeURIComponent(appName)}`}
            variant="outline"
            size="sm"
            icon={ArrowLeft}
          />
          <Title order={1}>Edit App: {appName}</Title>
        </Group>

        <form onSubmit={handleSubmit}>
          <Stack gap="lg">
            {/* GitHub Token */}
            <Box>
              <PasswordInput
                label="GitHub Personal Access Token"
                value={token}
                onChange={e => setToken(e.currentTarget.value)}
                required
                placeholder="ghp_..."
                description="Enter a token with repo permissions."
              />
            </Box>

            {/* App Name (Read-only) */}
            <Box>
              <TextInput
                label="App Name"
                value={appName}
                readOnly
                disabled
                description="App name cannot be modified."
              />
            </Box>

            {/* App Description */}
            <Textarea
              label="App Description"
              value={description}
              onChange={e => setDescription(e.currentTarget.value)}
              required
              placeholder="Enter a detailed description of the app..."
              minRows={4}
            />

            {/* Deployment Info */}
            <Box>
              <Group justify="space-between" mb="md">
                <Text fw={500} size="sm">
                  Deployment Info
                </Text>
                <MantineButton
                  type="button"
                  onClick={addDeployment}
                  variant="outline"
                  size="sm"
                  leftSection={<Plus size={16} />}
                />
              </Group>

              <Stack gap="md">
                {deployments.map((deployment, index) => (
                  <Card
                    key={index}
                    withBorder
                    padding="md"
                    radius="md"
                    bg="var(--mantine-color-gray-0)"
                  >
                    <Stack gap="md">
                      <Group justify="space-between">
                        <Text fw={500} size="sm">
                          Deployment {index + 1}
                        </Text>
                        {deployments.length > 1 && (
                          <MantineButton
                            type="button"
                            onClick={() => removeDeployment(index)}
                            color="red"
                            size="sm"
                            leftSection={<Trash2 size={16} />}
                          />
                        )}
                      </Group>

                      <Grid gutter="md">
                        <Grid.Col span={{ base: 12, md: 4 }}>
                          <Select
                            label="Deployment Type"
                            value={deployment.type}
                            onChange={value =>
                              updateDeployment(
                                index,
                                "type",
                                value || "website"
                              )
                            }
                            data={[
                              { value: "website", label: "Website" },
                              { value: "appstore", label: "App Store" },
                              {
                                value: "googleplay",
                                label: "Google Play",
                              },
                              { value: "steam", label: "Steam" },
                              { value: "download", label: "Download" },
                              { value: "other", label: "Other" },
                            ]}
                          />
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, md: 8 }}>
                          <TextInput
                            label="URL"
                            type="url"
                            value={deployment.url}
                            onChange={e =>
                              updateDeployment(
                                index,
                                "url",
                                e.currentTarget.value
                              )
                            }
                            placeholder="https://..."
                            required
                          />
                        </Grid.Col>
                      </Grid>

                      {deployment.type === "other" && (
                        <TextInput
                          label="Custom Label (Optional)"
                          value={deployment.label || ""}
                          onChange={e =>
                            updateDeployment(
                              index,
                              "label",
                              e.currentTarget.value
                            )
                          }
                          placeholder="e.g., Microsoft Store, Itch.io, etc."
                        />
                      )}
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Box>

            {/* GitHub Repository */}
            <Box>
              <Checkbox
                checked={showGithubField}
                onChange={e => setShowGithubField(e.currentTarget.checked)}
                label="Add GitHub Repository"
              />

              {showGithubField && (
                <Box mt="md">
                  <TextInput
                    label="GitHub Repository URL"
                    type="url"
                    value={githubRepo}
                    onChange={e => setGithubRepo(e.currentTarget.value)}
                    placeholder="https://github.com/username/repo"
                    description="Please enter the GitHub repository URL where the app's source code is located."
                  />
                </Box>
              )}
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert color="red" title="Error">
                {error}
              </Alert>
            )}

            {/* Success Alert */}
            {prUrl && (
              <Alert color="green" title="Success">
                <Group gap="xs">
                  <Text size="sm">App information updated successfully!</Text>
                  <MantineButton
                    component="a"
                    href={prUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outline"
                    size="sm"
                    rightSection={<ExternalLink size={14} />}
                  >
                    View PR
                  </MantineButton>
                </Group>
              </Alert>
            )}

            {/* Submit Buttons */}
            <Group grow>
              <MantineButton
                type="button"
                onClick={() => window.history.back()}
                variant="outline"
              >
                Cancel
              </MantineButton>
              <MantineButton
                type="submit"
                loading={isLoading}
                leftSection={<Save size={16} />}
              >
                {isLoading ? "Updating..." : "Update"}
              </MantineButton>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Container>
  );
}

export default function EditAppPage() {
  return (
    <Suspense
      fallback={
        <Container size="sm" py="xl">
          <Center py="xl">
            <Loader />
          </Center>
        </Container>
      }
    >
      <EditAppForm />
    </Suspense>
  );
}
