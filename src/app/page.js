"use client";
import { Card, Group } from "@mantine/core";
import { useRouter } from "next/navigation";
export default function Home() {
  const router = useRouter();

  return (
    <Group p={10} wrap="wrap" justify="center">
      {[
        { text: "Compare Teams or Players", url: "/comparison" },
        { text: "Trivia", url: "/trivia" },
        { text: "Build Deck", url: "/build-deck" },
        { text: "Card Game", url: "/card-game" },
      ].map(({ text, url }) => (
        <Card
          key={text}
          style={{ cursor: "pointer" }}
          onClick={() => router.push(url)}
          shadow="sm"
          padding="lg"
          radius="md"
          withBorder
          w={300}
        >
          {text}
        </Card>
      ))}
    </Group>
  );
}
