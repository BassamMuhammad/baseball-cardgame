import { InstructionCardChoosingComp } from "./InstructionCardChoosingComp";
import {
  Button,
  Card,
  Center,
  Group,
  Modal,
  ScrollArea,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState, useEffect } from "react";

export const GamePlayComp = ({
  gameState,
  setGameState,
  teamOrder,
  deck,
  handleInningChange,
}) => {
  const [startPitch, setStartPitch] = useState(false);
  const [commentry, setCommentry] = useState([]);
  const [showCommentry, setShowCommentry] = useState(false);
  const [showPitchingInstruction, setShowPitchingInstruction] = useState(false);
  const [showBattingInstruction, setShowBattingInstruction] = useState(false);
  const [showHitLocationInstruction, setShowHitLocationInstruction] =
    useState(false);
  const [showFieldingInstruction, setShowFieldingInstruction] = useState(false);
  const [showThrowingInstruction, setShowThrowingInstruction] = useState(false);
  const [shouldResolveDefense, setShouldResolveDefense] = useState(false);
  const [fieldingIndexes, setFieldingIndexes] = useState([]);
  const [throwingIndexes, setThrowingIndexes] = useState([]);
  const [hitLocation, setHitLocation] = useState();

  const playerBattingStateStr = `player${
    (gameState.currentInning % 2) + 1
  }BattingState`;
  const playerBatterIndexStr = `player${
    (gameState.currentInning % 2) + 1
  }BatterIndex`;
  const playerInningStr = `player${(gameState.currentInning % 2) + 1}Innings`;
  const outfielders = ["CF", "LF", "RF"];

  const pitchingInstructionCards = [
    {
      title: "Wild Pitch",
      desc: "Runner may advance; if bases empty, counts as a ball",
      func: () => {
        let message = "A wild pitch!! ";
        const basesWithRunners = Object.entries(
          gameState[playerBattingStateStr]
        ).filter(([key, value]) => value && key !== "Home");
        if (basesWithRunners.length) {
          const shouldAdvance = confirm(
            "Wild Pitch thrown. Do you want to advance runners?"
          );
          if (shouldAdvance) {
            setHitLocation("C");
            setShouldResolveDefense(true);
            setShowFieldingInstruction(true);
            setShowThrowingInstruction(true);
          } else {
            message += "Collected by catcher. No advances made. ";
            setStartPitch(false);
          }
        } else {
          ballCountAdvance();
        }
        setCommentry((prev) => [...prev, message]);
        notifications.show({ title: "Commentry", message, color: "gray" });
      },
    },
    {
      title: "Ball",
      desc: "Ball call; if four are thrown, batter walks",
      func: () => {
        ballCountAdvance();
      },
    },
    {
      title: "Strike",
      desc: "Called strike; counts toward three-strike limit",
      func: () => {
        handleStrike();
      },
    },
    {
      title: "Ground Ball",
      desc: "Ground ball to infield; possible out or double play",
      func: () => {
        setShowBattingInstruction(true);
      },
    },
    {
      title: "Fly Ball",
      desc: "Fly ball to outfield; possible out or extra bases",
      func: () => {
        setShowBattingInstruction(true);
      },
    },
  ];

  const battingInstructionCards = [
    {
      title: "Strikeout",
      desc: "Batter strikes out swinging or looking",
      func: () => {
        handleStrike();
      },
    },
    {
      title: "Groundout",
      desc: "Batter hits a ground ball; fielder attempts play",
      func: () => {
        setShouldResolveDefense(true);
        setShowHitLocationInstruction(true);
        setShowFieldingInstruction(true);
        setShowThrowingInstruction(true);
      },
    },
    {
      title: "Single",
      desc: "Batter reaches first base safely",
      func: () => {
        advanceSingle();
      },
    },
    {
      title: "Double",
      desc: "Batter reaches second base safely",
      func: () => {
        advanceDouble();
      },
    },
    {
      title: "Home Run",
      desc: "Batter clears the fence; all runners score",
      func: () => {
        //advance player to next base
        let outs = gameState.outs;
        const playerInnings = gameState[playerInningStr];
        if (gameState[playerBattingStateStr]["3B"]) {
          playerInnings[Math.floor(gameState.currentInning / 2)]++;
          outs++;
        }
        if (gameState[playerBattingStateStr]["2B"]) {
          playerInnings[Math.floor(gameState.currentInning / 2)]++;
          outs++;
        }
        if (gameState[playerBattingStateStr]["1B"]) {
          playerInnings[Math.floor(gameState.currentInning / 2)]++;
          outs++;
        }
        if (gameState[playerBattingStateStr]["Home"]) {
          playerInnings[Math.floor(gameState.currentInning / 2)]++;
          outs++;
        }

        setGameState((prev) => ({
          ...prev,
          [playerBattingStateStr]: {
            Home: teamOrder.batting[prev[playerBatterIndexStr] % 9],
            "1B": null,
            "2B": null,
            "3B": null,
          },
          [playerBatterIndexStr]: prev[playerBatterIndexStr] + 1,
          [playerInningStr]: playerInnings,
          outs,
        }));
        const message = "What a shot!! Home Run!!!";
        setCommentry((prev) => [...prev, message]);
        notifications.show({ title: "Commentry", message, color: "gray" });
        setStartPitch(false);
      },
    },
  ];

  const hitLocationInstructionCards = [
    {
      title: "To 1B",
      desc: "Ground ball or line drive to first base",
      func: () => {
        setHitLocation("1B");
      },
    },
    {
      title: "To 3B",
      desc: "Ground ball or line drive to third base",
      func: () => {
        setHitLocation("3B");
      },
    },
    {
      title: "To SS (Shortstop)",
      desc: "Ground ball or line drive to shortstop",
      func: () => {
        setHitLocation("SS");
      },
    },
    {
      title: "To 2B",
      desc: "Ground ball or line drive to second base",
      func: () => {
        setHitLocation("2B");
      },
    },
    {
      title: "To LF (Left Field)",
      desc: "Fly ball or line drive to left field",
      func: () => {
        setHitLocation("LF");
      },
    },
    {
      title: "To CF (Center Field)",
      desc: "Fly ball or line drive to center field",
      func: () => {
        setHitLocation("CF");
      },
    },
    {
      title: "To RF (Right Field)",
      desc: "Fly ball or line drive to right field",
      func: () => {
        setHitLocation("RF");
      },
    },
  ];

  const fieldingInstructionCards = [
    {
      title: "On 10",
      desc: "Successful fielding if Fielding Rating is 10",
      func: () => {
        setFieldingIndexes([10]);
      },
    },
    {
      title: "Greater than 7",
      desc: "Successful fielding if Fielding Rating is greater than 7",
      func: () => {
        setFieldingIndexes([10, 9, 8]);
      },
    },
    {
      title: "Greater than 4",
      desc: "Successful fielding if Fielding Rating is greater than 5",
      func: () => {
        setFieldingIndexes([10, 9, 8, 7, 6, 5]);
      },
    },
    {
      title: "Greater than 2",
      desc: "Successful fielding if Fielding Rating is greater than 2",
      func: () => {
        setFieldingIndexes([10, 9, 8, 7, 6, 5, 4, 3]);
      },
    },
  ];

  const throwingInstructionCards = [
    {
      title: "On 10",
      desc: "Runner out if Arm Strength is 10",
      func: () => {
        setThrowingIndexes([10]);
      },
    },
    {
      title: "Greater than 7",
      desc: "Runner out if Arm Strength is greater than 7",
      func: () => {
        setThrowingIndexes([10, 9, 8]);
      },
    },
    {
      title: "Greater than 4",
      desc: "Runner out if Arm Strength is greater than 5",
      func: () => {
        setThrowingIndexes([10, 9, 8, 7, 6, 5]);
      },
    },
    {
      title: "Greater than 2",
      desc: "Runner out if Arm Strength is greater than 2",
      func: () => {
        setThrowingIndexes([10, 9, 8, 7, 6, 5, 4, 3]);
      },
    },
  ];

  useEffect(() => {
    if (
      shouldResolveDefense &&
      fieldingIndexes.length > 0 &&
      throwingIndexes.length > 0
    ) {
      let message =
        hitLocation === "C"
          ? "Catcher goes after ball. "
          : `Ball gone to ${hitLocation}. `;
      const fielder = deck.find(
        (c) =>
          c.id ==
          gameState[
            `player${((gameState.currentInning + 1) % 2) + 1}FieldingState`
          ][hitLocation]
      );
      const fieldingRating =
        Math.max(
          1,
          Math.min(
            10,
            Math.round(
              (parseFloat(fielder.fieldingStats.fielding) * 10 +
                ((parseFloat(fielder.fieldingStats.assists) +
                  parseFloat(fielder.fieldingStats.putOuts)) *
                  10) /
                  parseFloat(fielder.fieldingStats.chances) +
                (parseFloat(fielder.fieldingStats.doublePlays) * 10) /
                  parseFloat(fielder.fieldingStats.gamesPlayed) -
                parseFloat(fielder.fieldingStats.errors) / 10) /
                3
            )
          )
        ) || 1;
      if (!fieldingIndexes.includes(fieldingRating)) {
        message += `Miss-fielding there. Batting team advances `;
        if (outfielders.includes(hitLocation)) {
          message += `two bases`;
          advanceDouble(true);
        } else {
          message += `one base`;
          advanceSingle(true);
        }
      } else {
        const fielderArmStrength =
          Math.max(
            1,
            Math.min(
              10,
              Math.round(
                ((parseFloat(fielder.fieldingStats.assists) * 10) /
                  parseFloat(fielder.fieldingStats.gamesPlayed) +
                  (parseFloat(fielder.fieldingStats.rangeFactorPer9Inn) * 10) /
                    5 +
                  (10 -
                    parseFloat(fielder.fieldingStats.throwingErrors) / 10)) /
                  3
              )
            )
          ) || 1;
        if (!throwingIndexes.includes(fielderArmStrength)) {
          message += `Collected the ball but throw could be better. Batting team advances `;
          if (outfielders.includes(hitLocation)) {
            message += `two bases`;
            advanceDouble(true);
          } else {
            message += `one base`;
            advanceSingle(true);
          }
        } else {
          message += `Collected the ball and good throw. `;
          if (outfielders.includes(hitLocation)) {
            message += `Only a single.`;
            advanceSingle(true);
          } else {
            message += ` Batter is caught at first base and he is out`;
            setGameState((prev) => ({
              ...prev,
              [playerBattingStateStr]: {
                ...prev[playerBattingStateStr],
                Home: teamOrder.batting[prev[playerBatterIndexStr] % 9],
              },
              [playerBatterIndexStr]: prev[playerBatterIndexStr] + 1,
              outs: prev.outs + 1,
            }));
          }
        }
      }
      setCommentry((prev) => [...prev, message]);
      notifications.show({ title: "Commentry", message, color: "gray" });
      setShouldResolveDefense(false);
      setFieldingIndexes([]);
      setThrowingIndexes([]);
      setStartPitch(false);
    }
  }, [shouldResolveDefense, fieldingIndexes, throwingIndexes]);

  useEffect(() => {
    if (gameState.outs >= 3) {
      const message = `Three out and that will be ${
        gameState.currentInning % 2 === 0 ? "half of" : "the"
      } innings`;
      setCommentry((prev) => [...prev, message]);
      notifications.show({ title: "Commentry", message, color: "gray" });
      setGameState((prev) => ({
        ...prev,
        currentInning: prev.currentInning + 1,
        strikeCount: 0,
        ballCount: 0,
        outs: 0,
        player1BattingState: { Home: null, "1B": null, "2B": null, "3B": null },
        player2BattingState: { Home: null, "1B": null, "2B": null, "3B": null },
      }));
      handleInningChange();
      setStartPitch(false);
    }
  }, [gameState.outs]);

  const ballCountAdvance = () => {
    let ballCount = gameState.ballCount + 1;
    let message = "";
    if (ballCount >= 4) {
      ballCount = 0;
      advanceSingle(true, ballCount);
      message = "Ball Called. This is 4 time. Batter is given the walk";
    } else {
      message = `Ball Called. This is ${ballCount} time`;
      setGameState((prev) => ({
        ...prev,
        ballCount,
      }));
    }
    setCommentry((prev) => [...prev, message]);
    notifications.show({ title: "Commentry", message, color: "gray" });
    setStartPitch(false);
  };

  const advanceSingle = (noCommentry, newBallCount) => {
    //advance player to next base
    let outs = gameState.outs;
    const playerInnings = gameState[playerInningStr];
    if (gameState[playerBattingStateStr]["3B"]) {
      playerInnings[Math.floor(gameState.currentInning / 2)]++;
      outs++;
    }

    setGameState((prev) => ({
      ...prev,
      [playerBattingStateStr]: {
        Home: teamOrder.batting[prev[playerBatterIndexStr] % 9],
        "1B": prev[playerBattingStateStr]["Home"],
        "2B": prev[playerBattingStateStr]["1B"],
        "3B": prev[playerBattingStateStr]["2B"],
      },
      [playerBatterIndexStr]: prev[playerBatterIndexStr] + 1,
      [`player${(prev.currentInning % 2) + 1}Innings`]: playerInnings,
      outs,
      ballCount: newBallCount ?? prev.ballCount,
    }));
    if (!noCommentry) {
      const message = "Advanced one base";
      setCommentry((prev) => [...prev, message]);
      notifications.show({ title: "Commentry", message, color: "gray" });
    }
    setStartPitch(false);
  };

  const advanceDouble = (noCommentry) => {
    //advance player to next base
    let outs = gameState.outs;
    const playerInnings = gameState[playerInningStr];
    if (gameState[playerBattingStateStr]["3B"]) {
      playerInnings[Math.floor(gameState.currentInning / 2)]++;
      outs++;
    }
    if (gameState[playerBattingStateStr]["2B"]) {
      playerInnings[Math.floor(gameState.currentInning / 2)]++;
      outs++;
    }
    setGameState((prev) => ({
      ...prev,
      [playerBattingStateStr]: {
        Home: teamOrder.batting[prev[playerBatterIndexStr] % 9],
        "1B": null,
        "2B": prev[playerBattingStateStr]["Home"],
        "3B": prev[playerBattingStateStr]["1B"],
      },
      [playerBatterIndexStr]: prev[playerBatterIndexStr] + 1,
      [`player${(prev.currentInning % 2) + 1}Innings`]: playerInnings,
      outs,
    }));
    if (!noCommentry) {
      const message = "Advanced two base";
      setCommentry((prev) => [...prev, message]);
      notifications.show({ title: "Commentry", message, color: "gray" });
      setStartPitch(false);
    }
  };

  const handleStrike = () => {
    let strikeCount = gameState.strikeCount + 1;
    let message = "";
    if (strikeCount >= 3) {
      message = "Strike!! Thats the third one. Batter is out";
      strikeCount = 0;
      const outs = gameState.outs + 1;
      setGameState((prev) => ({
        ...prev,
        [playerBattingStateStr]: {
          ...prev[playerBattingStateStr],
          Home:
            outs >= 3
              ? null
              : teamOrder.batting[
                  prev[`player${(prev.currentInning % 2) + 1}BatterIndex`] % 9
                ],
        },
        [playerBatterIndexStr]:
          prev[playerBatterIndexStr] + (outs >= 3 ? 0 : 1),
        strikeCount,
        outs,
      }));
    } else {
      message = `Strike!! Thats ${strikeCount}`;
      setGameState((prev) => ({ ...prev, strikeCount }));
    }
    setCommentry((prev) => [...prev, message]);
    notifications.show({ title: "Commentry", message, color: "gray" });
    setStartPitch(false);
  };

  return (
    <>
      {!startPitch && (
        <Center mt={10}>
          <Group>
            <Button
              onClick={() => {
                setStartPitch(true);
                setShowPitchingInstruction(true);
              }}
            >
              Start Pitch
            </Button>
            <Button
              onClick={() => {
                setShowCommentry(true);
              }}
            >
              Show Commentry
            </Button>
          </Group>
        </Center>
      )}
      {showPitchingInstruction && startPitch && (
        <InstructionCardChoosingComp
          cards={pitchingInstructionCards}
          opened={showPitchingInstruction && startPitch}
          title="Pick a card to determine pitch play"
          isComputer={gameState.currentInning % 2 === 0}
          onClose={() => {
            setShowPitchingInstruction(false);
          }}
        />
      )}
      {showBattingInstruction && (
        <InstructionCardChoosingComp
          cards={battingInstructionCards}
          opened={showBattingInstruction}
          title="Pick a card to determine bat play"
          isComputer={gameState.currentInning % 2 !== 0}
          onClose={() => {
            setShowBattingInstruction(false);
          }}
        />
      )}
      {showThrowingInstruction && (
        <InstructionCardChoosingComp
          cards={throwingInstructionCards}
          opened={showThrowingInstruction}
          title="Pick a card to determine throw play"
          isComputer={gameState.currentInning % 2 === 0}
          onClose={() => {
            setShowThrowingInstruction(false);
          }}
        />
      )}
      {showFieldingInstruction && (
        <InstructionCardChoosingComp
          cards={fieldingInstructionCards}
          opened={showFieldingInstruction}
          title="Pick a card to determine field play"
          isComputer={gameState.currentInning % 2 === 0}
          onClose={() => {
            setShowFieldingInstruction(false);
          }}
        />
      )}
      {showHitLocationInstruction && (
        <InstructionCardChoosingComp
          cards={hitLocationInstructionCards}
          opened={showHitLocationInstruction}
          title="Pick a card to determine hit location"
          isComputer={gameState.currentInning % 2 !== 0}
          onClose={() => {
            setShowHitLocationInstruction(false);
          }}
        />
      )}
      <Modal
        title="Commentry"
        fullScreen
        opened={showCommentry}
        onClose={() => setShowCommentry(false)}
      >
        <ScrollArea>
          {commentry.map((c, i) => (
            <Card
              key={i}
              mb={10}
              shadow="lg"
              radius="md"
              padding="lg"
              withBorder
            >
              <Text>{c}</Text>
            </Card>
          ))}
        </ScrollArea>
      </Modal>
    </>
  );
};
