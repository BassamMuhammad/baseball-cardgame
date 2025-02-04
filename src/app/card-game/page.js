"use client";
import React, { useEffect, useState } from "react";
import {
  Center,
  Container,
  LoadingOverlay,
  Modal,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { BaseballField } from "../components/BaseballField";
import { useUser } from "../hooks/useUser";
import { useApp } from "../hooks/useApp";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { TeamOrderingComp } from "../components/TeamOrderingComp";
import { GameTypeChoosingComp } from "../components/GameTypeChoosingComp";
import { ScoreCardComp } from "../components/ScoreCardComp";
import { ChooseFieldingComp } from "../components/ChooseFieldingComp";
import { GamePlayComp } from "../components/GamePlayComp";

const Page = () => {
  const [teamOrder, setTeamOrder] = useState({
    batting: [],
    pitching: [],
    reliefPitching: [],
  });
  const [deck, setDeck] = useState([]);
  const [loading, setLoading] = useState(false);
  const [teamOrderSelected, setTeamOrderSelected] = useState(false);
  const [totalInnings, setTotalInnings] = useState(0);
  const [isFieldingSet, setIsFieldingSet] = useState(false);
  const [isGameFinished, setIsGameFinished] = useState(false);
  const [gameState, setGameState] = useState({
    currentInning: 0,
    player1Innings: [],
    player2Innings: [],
    strikeCount: 0,
    ballCount: 0,
    outs: 0,
    player1BatterIndex: 0,
    player2BatterIndex: 0,
    player1BattingState: { Home: null, "1B": null, "2B": null, "3B": null },
    player1FieldingState: {
      P: null,
      C: null,
      "1B": null,
      "2B": null,
      SS: null,
      "3B": null,
      RF: null,
      CF: null,
      LF: null,
    },
    player2BattingState: { Home: null, "1B": null, "2B": null, "3B": null },
    player2FieldingState: {
      P: null,
      C: null,
      "1B": null,
      "2B": null,
      SS: null,
      "3B": null,
      RF: null,
      CF: null,
      LF: null,
    },
  });
  const user = useUser();
  const app = useApp();
  const firestore = getFirestore(app);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    if (user) {
      getDoc(doc(firestore, `users/${user.uid}`)).then((doc) => {
        const deck = doc.get("deck");
        if (!deck || deck.length < 17) {
          notifications.show({
            title: "Deck not completed",
            message: "Plese complete your deck to compete",
            color: "red",
          });
          router.replace("/");
        }
        setLoading(false);
        setDeck(deck);
      });
    }
  }, [user]);

  useEffect(() => {
    setGameState((prev) => ({
      ...prev,
      player1Innings: Array(totalInnings).fill(0),
      player2Innings: Array(totalInnings).fill(0),
    }));
  }, [totalInnings]);

  const handleInningChange = () => {
    const currentInning = gameState.currentInning + 1;
    if (currentInning / 2 === totalInnings) {
      setIsGameFinished(true);
    } else {
      const playerBattingStateStr = `player${
        (currentInning % 2) + 1
      }BattingState`;
      const playerBatterIndexStr = `player${
        (currentInning % 2) + 1
      }BatterIndex`;
      setGameState((prev) => ({
        ...prev,
        [playerBattingStateStr]: {
          ...prev[playerBattingStateStr],
          Home: teamOrder.batting[prev[playerBatterIndexStr] % 9],
        },
        [playerBatterIndexStr]: prev[playerBatterIndexStr] + 1,
      }));
    }
  };

  return (
    <Container>
      <ScoreCardComp
        totalInnings={totalInnings}
        playerName={user?.displayName}
        gameState={gameState}
      />
      <GamePlayComp
        gameState={gameState}
        setGameState={setGameState}
        teamOrder={teamOrder}
        deck={deck}
        handleInningChange={handleInningChange}
      />
      <BaseballField gameState={gameState} deck={deck} />
      <TeamOrderingComp
        deck={deck}
        teamOrderSelected={teamOrderSelected}
        setTeamOrderSelected={setTeamOrderSelected}
        teamOrder={teamOrder}
        setTeamOrder={setTeamOrder}
      />
      <GameTypeChoosingComp
        opened={teamOrderSelected && !totalInnings}
        setTotalInnings={setTotalInnings}
      />
      {teamOrderSelected && totalInnings && (
        <ChooseFieldingComp
          gameState={gameState}
          setGameState={setGameState}
          opened={teamOrderSelected && totalInnings && !isFieldingSet}
          setIsFieldingSet={setIsFieldingSet}
          deck={deck}
          batters={teamOrder.batting}
          pitchers={[...teamOrder.pitching, ...teamOrder.reliefPitching]}
        />
      )}
      {isGameFinished && (
        <Modal
          opened={isGameFinished}
          centered
          title="Game Finished"
          withCloseButton={false}
        >
          <Center>
            <Stack>
              <Title>
                {gameState.player1Innings.reduce(
                  (prev, curr) => prev + curr,
                  0
                ) >
                gameState.player1Innings.reduce((prev, curr) => prev + curr, 0)
                  ? "You Win"
                  : "You Lose"}
              </Title>
              <Text>
                {user?.displayName}'s Score:{" "}
                {gameState.player1Innings.reduce(
                  (prev, curr) => prev + curr,
                  0
                )}
              </Text>
              <Text>
                Computer's Score:{" "}
                {gameState.player1Innings.reduce(
                  (prev, curr) => prev + curr,
                  0
                )}
              </Text>
            </Stack>
          </Center>
        </Modal>
      )}
      <LoadingOverlay visible={loading} />
    </Container>
  );
};

export default Page;
