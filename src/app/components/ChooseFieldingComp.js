import { Modal, Stepper, StepperStep } from "@mantine/core";
import { CardChoosingComp } from "./CardChoosingComp";
import { useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";
import { generateContent } from "../actions";

export const ChooseFieldingComp = ({
  opened,
  setIsFieldingSet,
  gameState,
  setGameState,
  deck,
  batters,
  pitchers,
}) => {
  const [step, setStep] = useState(0);

  const fieldStateToPosition = (fieldState) => {
    switch (fieldState) {
      case "P":
        return "Pitcher";
      case "C":
        return "Catcher";
      default:
        return fieldState;
    }
  };

  const updateFieldingState = (playerId, field) => {
    const player1FieldingState = gameState[`player1FieldingState`];

    const index = Object.values(player1FieldingState).findIndex(
      (f) => f == playerId
    );
    if (index >= 0) {
      if (Object.keys(player1FieldingState)[index] === field) {
        const fieldingState = {
          ...player1FieldingState,
        };
        fieldingState[field] = null;
        setGameState((prev) => ({
          ...prev,
          player1FieldingState: fieldingState,
        }));
      } else {
        notifications.show({
          title: "Player already selected",
          message: "Player already selected in different position",
          color: "red",
        });
      }
    } else {
      setGameState((prev) => ({
        ...prev,
        player1FieldingState: {
          ...prev[`player1FieldingState`],
          [field]: playerId,
        },
      }));
    }
  };

  useEffect(() => {
    if (gameState.currentInning === 0) {
      generateContent(`You are an expert baseball player. Select all the fielders from following Fielders list suitable to baseball locations and a pitcher from Pitchers list.
            Fielders: ${JSON.stringify(batters)}
            Pitchers: ${JSON.stringify(pitchers)}
            Return output as json only in following format with position name as key and single player id as value withou any explanation
            Example:
            {
                P: 123,
                C: 456,
                "1B": 789,
                "2B": 987,
                SS: 654,
                "3B": 321,
                RF: 1234,
                CF: 5678,
                LF: 1357,
            }
        `)
        .then((d) => {
          console.log(d);
          setGameState((prev) => ({
            ...prev,
            [`player${((gameState.currentInning + 1) % 2) + 1}FieldingState`]:
              JSON.parse(d.replace("```json", "").replace("```", "")),
          }));
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }, []);

  return (
    <Modal
      opened={opened}
      fullScreen
      title="Setting Fielding"
      withCloseButton={false}
    >
      <Stepper active={step} onStepClick={setStep}>
        {Object.keys(gameState[`player1FieldingState`]).map((f, i) => (
          <StepperStep
            key={i}
            allowStepSelect={false}
            label={`Choose ${fieldStateToPosition(f)}`}
          >
            <CardChoosingComp
              cards={deck.filter((c) =>
                f === "P" ? pitchers.includes(c.id) : batters.includes(c.id)
              )}
              selected={(card) =>
                gameState[`player1FieldingState`][f] == card.id
              }
              selectedText={(card) => fieldStateToPosition(f)}
              saveText={`Save ${fieldStateToPosition(f)}`}
              onCardSelected={(card) => updateFieldingState(card.id, f)}
              onSave={() => {
                const newStep = step + 1;
                if (newStep >= 9) {
                  const playerBattingStateStr = `player${
                    (gameState.currentInning % 2) + 1
                  }BattingState`;
                  const playerBatterIndexStr = `player${
                    (gameState.currentInning % 2) + 1
                  }BatterIndex`;
                  setGameState((prev) => ({
                    ...prev,
                    [playerBattingStateStr]: {
                      ...prev[playerBattingStateStr],
                      Home: batters[prev[playerBatterIndexStr] % 9],
                    },
                    [playerBatterIndexStr]: prev[playerBatterIndexStr] + 1,
                  }));
                  setIsFieldingSet(true);
                } else {
                  if (gameState[`player1FieldingState`][f]) {
                    setStep(newStep);
                  } else {
                    notifications.show({
                      title: "Player not selected",
                      message: "Please choose a player",
                      color: "red",
                    });
                  }
                }
              }}
            />
          </StepperStep>
        ))}
      </Stepper>
    </Modal>
  );
};
