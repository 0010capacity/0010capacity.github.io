"use client";

import { useState, useEffect } from "react";
import { Plus, Upload, ExternalLink, Trash2 } from "lucide-react";
import {
  Container,
  Title,
  Button as MantineButton,
  TextInput,
  PasswordInput,
  Textarea,
  Group,
  Stack,
  Card,
  Checkbox,
  Select,
  Alert,
  Box,
  Grid,
  Text,
} from "@mantine/core";
import { createAppPR } from "../../lib/github";

interface Deployment {
  type: "website" | "appstore" | "googleplay" | "steam" | "download" | "other";
  url: string;
  label?: string;
}

export default function UploadAppPage() {
  const [token, setToken] = useState("");
  const [appName, setAppName] = useState("");
  const [description, setDescription] = useState("");
  const [deployments, setDeployments] = useState<Deployment[]>([
    { type: "website", url: "" },
  ]);
  const [githubRepo, setGithubRepo] = useState("");
  const [showGithubField, setShowGithubField] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [prUrl, setPrUrl] = useState("");
  const [error, setError] = useState("");
  const [rememberToken, setRememberToken] = useState(false);

  // Load saved token on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem("github_token");
    if (savedToken) {
      setToken(savedToken);
      setRememberToken(true);
    }
  }, []);

  // Save or remove token based on remember preference
  useEffect(() => {
    if (rememberToken && token) {
      localStorage.setItem("github_token", token);
    } else if (!rememberToken) {
      localStorage.removeItem("github_token");
    }
  }, [token, rememberToken]);

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
    // Modified to allow app registration even without deployment information
    if (appName.trim() === "") {
      setError("Please enter the app name.");
      setIsLoading(false);
      return;
    }
    if (description.trim() === "") {
      setError("Please enter the app description.");
      setIsLoading(false);
      return;
    }

    try {
      const url = await createAppPR(
        token,
        appName,
        description,
        validDeployments,
        showGithubField ? githubRepo : undefined
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
      <Title order={1} mb="lg">
        Upload App
      </Title>

      <form onSubmit={handleSubmit}>
        <Stack gap="lg">
          {/* GitHub Token */}
          <div>
            <PasswordInput
              label="GitHub Personal Access Token"
              id="token"
              value={token}
              onChange={e => setToken(e.currentTarget.value)}
              required
              placeholder="ghp_..."
            />
            <Group mt="sm">
              <Checkbox
                id="rememberToken"
                checked={rememberToken}
                onChange={e => setRememberToken(e.currentTarget.checked)}
                label="Remember token (save in browser)"
              />
            </Group>
            <Text size="sm" c="dimmed" mt="xs">
              Please enter a token with repo permissions.
            </Text>
          </div>

          {/* App Name */}
          <TextInput
            label="App Name"
            id="appName"
            value={appName}
            onChange={e => setAppName(e.currentTarget.value)}
            required
            placeholder="My Awesome App"
          />

          {/* App Description */}
          <Textarea
            label="App Description"
            id="description"
            value={description}
            onChange={e => setDescription(e.currentTarget.value)}
            required
            placeholder="Enter a detailed description of your app..."
            minRows={4}
          />

          {/* Deployment Info */}
          <div>
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
                  <Group justify="space-between" mb="md">
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
                          updateDeployment(index, "type", value || "website")
                        }
                        data={[
                          { value: "website", label: "Website" },
                          { value: "appstore", label: "App Store" },
                          { value: "googleplay", label: "Google Play" },
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
                          updateDeployment(index, "url", e.currentTarget.value)
                        }
                        placeholder="https://..."
                        required
                      />
                    </Grid.Col>
                  </Grid>

                  {deployment.type === "other" && (
                    <Box mt="md">
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
                    </Box>
                  )}
                </Card>
              ))}
            </Stack>
          </div>

          {/* GitHub Repository */}
          <div>
            <Checkbox
              id="showGithubField"
              checked={showGithubField}
              onChange={e => setShowGithubField(e.currentTarget.checked)}
              label="Add GitHub Repository"
            />

            {showGithubField && (
              <Box mt="md">
                <TextInput
                  label="GitHub Repository URL"
                  id="githubRepo"
                  type="url"
                  value={githubRepo}
                  onChange={e => setGithubRepo(e.currentTarget.value)}
                  placeholder="https://github.com/username/repo"
                />
                <Text size="sm" c="dimmed" mt="xs">
                  Please enter the GitHub repository URL where the app&apos;s
                  source code is located.
                </Text>
              </Box>
            )}
          </div>

          {/* Submit Buttons */}
          <Group grow>
            <MantineButton
              type="button"
              onClick={() => window.history.back()}
              variant="outline"
            >
              취소
            </MantineButton>
            <MantineButton
              type="submit"
              loading={isLoading}
              leftSection={<Upload size={16} />}
            >
              {isLoading ? "Uploading..." : "Upload"}
            </MantineButton>
          </Group>
        </Stack>
      </form>

      {error && (
        <Alert color="red" title="Error" mt="lg">
          {error}
        </Alert>
      )}

      {prUrl && (
        <Alert color="green" title="Success" mt="lg">
          <Group>
            <Text size="sm">App uploaded successfully!</Text>
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
    </Container>
  );
}
