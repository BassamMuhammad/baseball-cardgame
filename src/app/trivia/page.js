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
  Text,
  Title,
} from "@mantine/core";
import { generateContent } from "../actions";
import { useEffect, useState } from "react";
import { useInterval } from "@mantine/hooks";

export default function Page() {
  const [triviaQuestions, setTriviaQuestions] = useState([]);
  const [checkBoxState, setCheckBoxState] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [timer, setTimer] = useState(60 * 5);
  const interval = useInterval(() => setTimer((t) => t - 1), 1000);
  const [triviaState, setTriviaState] = useState("start");
  const [score, setScore] = useState(0);

  useEffect(() => {
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
      setTriviaQuestions(
        JSON.parse(data.replace("```json", "").replace("```", ""))
      );
      setTriviaState("inProgress");
      interval.start();
    });
    return interval.stop;
  }, []);

  useEffect(() => {
    if (timer === 0) {
      onSubmit();
    }
  }, [timer]);

  const onSubmit = () => {
    interval.stop();
    setTriviaState("done");
    const correctAnswers = selectedAnswers.filter(
      (ans, i) => triviaQuestions[i].correctAnswer === ans
    );
    setScore(correctAnswers.length);
  };

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
    </Container>
  );
}
