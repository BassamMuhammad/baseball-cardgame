"use client";
import { Card, Group } from "@mantine/core";
import { useRouter } from "next/navigation";
export default function Home() {
  const router = useRouter();

  return (
    <Group p={10}>
      <Card
        onClick={() => router.push("/comparison")}
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
      >
        Compare Teams or Players
      </Card>
    </Group>
  );
}
