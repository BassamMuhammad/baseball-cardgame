"use client";

import {
  Button,
  Card,
  Center,
  Checkbox,
  Container,
  Group,
  List,
  ListItem,
  LoadingOverlay,
  Modal,
  Text,
  Title,
} from "@mantine/core";
import { generateContent } from "../actions";
import { useEffect, useState } from "react";
import { useInterval } from "@mantine/hooks";
import { useUser } from "../hooks/useUser";
import { useApp } from "../hooks/useApp";
import {
  collection,
  doc,
  getDoc,
  getFirestore,
  increment,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";

export default function Page() {
  const [triviaQuestions, setTriviaQuestions] = useState([]);
  const [checkBoxState, setCheckBoxState] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [timer, setTimer] = useState(60 * 5);
  const [triviaState, setTriviaState] = useState("start");
  const [score, setScore] = useState(0);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const interval = useInterval(() => setTimer((t) => t - 1), 1000);
  const router = useRouter();
  const user = useUser();
  const app = useApp();
  const firestore = getFirestore(app);

  useEffect(() => {
    setLoading(true);
    if (user) {
      getDoc(doc(firestore, `users/${user.uid}`)).then((doc) => {
        const data = doc.data();
        const todayDate = new Date();
        const triviaLastDate = new Date(data.lastTriviaAt.seconds * 1000);
        if (todayDate.getDate() !== triviaLastDate.getDate()) {
          setPoints(data.points);
          generateContent(
            `Generate 10 trivia questions on MLB in multiple choice format.
                  Display result in following format:
                 [
                      {
                          question: "Who was the first player to hit 50 home runs in a season?",
                          answers: ["Babe Ruth", "Roger Maris", "Mickey Mantle", "Barry Bonds"],
                          correctAnswer: "Babe Ruth",
                      },
                      ...
                  ],
                  `
          ).then((data) => {
            setLoading(false);
            setTriviaQuestions(
              JSON.parse(data.replace("```json", "").replace("```", ""))
            );
            setTriviaState("inProgress");
            interval.start();
          });
        } else {
          const nextDay = new Date(todayDate);
          nextDay.setDate(todayDate.getDate() + 1);
          nextDay.setHours(0, 0, 0, 0);
          notifications.show({
            title: "Trivia Error",
            message: `Trivia not available. Come back after ${Math.floor(
              (nextDay - triviaLastDate) / (1000 * 60 * 60)
            )} hours`,
            color: "red",
          });
          router.replace("/");
        }
      });
      return interval.stop;
    }
  }, [user]);

  useEffect(() => {
    if (timer === 0) {
      onSubmit();
    }
  }, [timer]);

  const onSubmit = async () => {
    setLoading(true);
    interval.stop();
    setTriviaState("done");
    const correctAnswers = selectedAnswers.filter(
      (ans, i) => triviaQuestions[i].correctAnswer === ans
    );
    setScore(correctAnswers.length);
    await updateDoc(doc(firestore, `users/${user.uid}`), {
      points: increment(score + timer),
      lastTriviaAt: serverTimestamp(),
    });
    setModalOpen(true);
    setLoading(false);
  };

  if (loading) return <LoadingOverlay visible={loading} />;
  return (
    <Container>
      <Group>
        <Title ml="auto">MLB Trivia</Title>
        <Title mx="auto" order={4}>
          {triviaState === "inProgress"
            ? `Time Remaining: ${timer}`
            : `Score: ${score}/10`}
        </Title>
      </Group>
      {triviaQuestions.map((question, i) => (
        <Card
          key={i}
          shadow="xs"
          padding="md"
          radius="md"
          withBorder
          mb={10}
          bg={
            triviaState === "done"
              ? selectedAnswers[i] === question.correctAnswer
                ? "green"
                : "red"
              : "transparent"
          }
        >
          <Title order={4}>{question.question}</Title>
          <List>
            {question.answers.map((answer, j) => (
              <ListItem
                key={j}
                icon={
                  <Checkbox
                    checked={checkBoxState?.[i]?.[j] ?? false}
                    onChange={(val) => {
                      setCheckBoxState((state) => {
                        const newState = [...state];
                        newState[i] = Array(4).fill(false);
                        newState[i][j] = val;
                        return newState;
                      });
                      setSelectedAnswers((state) => {
                        const newState = [...state];
                        newState[i] = answer;
                        return newState;
                      });
                    }}
                  />
                }
              >
                {answer}
              </ListItem>
            ))}
          </List>
          {triviaState === "done" &&
            selectedAnswers[i] !== question.correctAnswer && (
              <Text>Correct Answer: {question.correctAnswer}</Text>
            )}
        </Card>
      ))}
      {triviaQuestions.length > 0 && <Button onClick={onSubmit}>Submit</Button>}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Results"
        centered
      >
        <Text>Score: {score}</Text>
        <Text>Time Remaining: {timer}</Text>
        <Text>Points Earned: {timer + score}</Text>
        <Text>Previous points: {points}</Text>
        <Text>Total points: {points + timer + score}</Text>
      </Modal>
    </Container>
  );
}
