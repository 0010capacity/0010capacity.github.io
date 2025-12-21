"use client";

import Link from "next/link";
import {
  Container,
  Stack,
  Title,
  Text,
  Grid,
  Card,
  Button,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";

export default function Portfolio() {
  const projects = [
    {
      id: 1,
      title: "Project 1",
      description: "Description of project 1.",
    },
    {
      id: 2,
      title: "Project 2",
      description: "Description of project 2.",
    },
    {
      id: 3,
      title: "Project 3",
      description: "Description of project 3.",
    },
  ];

  return (
    <Container size="md" py="xl">
      <Stack gap="xl" align="center">
        <Title order={1} size="h1">
          My Portfolio
        </Title>
        <Text size="lg" ta="center">
          Here are some of my projects and works.
        </Text>

        <Grid gutter="lg" w="100%">
          {projects.map(project => (
            <Grid.Col key={project.id} span={{ base: 12, sm: 6, md: 4 }}>
              <Card withBorder>
                <Title order={2} size="h3">
                  {project.title}
                </Title>
                <Text>{project.description}</Text>
              </Card>
            </Grid.Col>
          ))}
        </Grid>

        <Button
          component={Link}
          href="/"
          variant="light"
          leftSection={<IconArrowLeft size={16} />}
          mt="md"
        >
          Back to Home
        </Button>
      </Stack>
    </Container>
  );
}
