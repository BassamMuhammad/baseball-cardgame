import { Modal, Stepper, StepperStep } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { CardChoosingComp } from "./CardChoosingComp";

export const TeamOrderingComp = ({
  deck,
  teamOrderSelected,
  setTeamOrderSelected,
  teamOrder,
  setTeamOrder,
}) => {
  const [step, setStep] = useState(0);

  const updateOrder = (teamOrderType, player, playerType, maxLimit) => {
    const index = teamOrder[teamOrderType].findIndex((p) => p == player.id);
    const tempOrder = [...teamOrder[teamOrderType]];
    if (index >= 0) {
      tempOrder.splice(index, 1);
    } else if (tempOrder.length < maxLimit) {
      if (
        playerType === "Starting Pitchers" &&
        teamOrder.batting.includes(player.id)
      ) {
        notifications.show({
          title: `Plauyer already choosen`,
          message: `Player already choosen as a batter`,
          color: "red",
        });
        return;
      } else if (
        playerType === "Relief Pitchers" &&
        (teamOrder.batting.includes(player.id) ||
          teamOrder.pitching.includes(player.id))
      ) {
        notifications.show({
          title: `Plauyer already choosen`,
          message: `Player already choosen as a batter or starting pitcher`,
          color: "red",
        });
        return;
      }
      tempOrder.push(player.id);
    } else {
      notifications.show({
        title: `Max ${playerType} selected`,
        message: `You can not select more than ${maxLimit} ${playerType}`,
        color: "red",
      });
    }
    setTeamOrder((prev) => ({ ...prev, [teamOrderType]: tempOrder }));
  };

  const saveOrder = (
    teamOrderType,
    maxLimit,
    titlePlayerType,
    messagePlayerType
  ) => {
    if (teamOrder[teamOrderType].length !== maxLimit) {
      notifications.show({
        title: `${titlePlayerType} order not completed`,
        message: `You need to select ${maxLimit} ${messagePlayerType}`,
        color: "red",
      });
      return;
    }
    const newStep = step + 1;
    if (newStep >= 3) {
      if (
        teamOrder.batting.length === 9 &&
        teamOrder.pitching.length === 5 &&
        teamOrder.reliefPitching.length === 3
      ) {
        setTeamOrderSelected(true);
      } else {
        notifications.show({
          title: `All steps not completed`,
          message: `Please complete all steps`,
          color: "red",
        });
      }
    }
    setStep(newStep);
  };

  return (
    <Modal
      opened={!teamOrderSelected}
      fullScreen
      title="Choosing Team Order"
      withCloseButton={false}
    >
      <Stepper active={step} onStepClick={setStep}>
        <StepperStep
          allowStepSelect={false}
          label="First step"
          description="Choose 9 batters"
        >
          <CardChoosingComp
            cards={deck}
            selected={(card) => teamOrder.batting.find((p) => p === card.id)}
            selectedText={(card) =>
              `Batter ${teamOrder.batting.indexOf(card.id) + 1}`
            }
            saveText="Save Batting Order"
            onCardSelected={(card) =>
              updateOrder("batting", card, "Batters", 9)
            }
            onSave={() => saveOrder("batting", 9, "Batting", "Batters")}
          />
        </StepperStep>
        <StepperStep
          allowStepSelect={false}
          label="Second step"
          description="Choose 5 Starting Pitchers"
        >
          <CardChoosingComp
            cards={deck}
            selected={(card) =>
              teamOrder.batting.find((p) => p === card.id) ||
              teamOrder.pitching.find((p) => p === card.id)
            }
            selectedText={(card) =>
              teamOrder.batting.indexOf(card.id) >= 0
                ? `Batter ${teamOrder.batting.indexOf(card.id) + 1}`
                : `Starting Pitcher ${teamOrder.pitching.indexOf(card.id) + 1}`
            }
            saveText="Save Starting Pitching Order"
            onCardSelected={(card) =>
              updateOrder("pitching", card, "Starting Pitchers", 5)
            }
            onSave={() =>
              saveOrder("pitching", 5, "Starting Pitching", "Starting Pitchers")
            }
          />
        </StepperStep>
        <StepperStep
          allowStepSelect={false}
          label="Final step"
          description="Choose 3 Relief Pitchers"
        >
          <CardChoosingComp
            cards={deck}
            selected={(card) =>
              teamOrder.batting.find((p) => p === card.id) ||
              teamOrder.pitching.find((p) => p === card.id) ||
              teamOrder.reliefPitching.find((p) => p === card.id)
            }
            selectedText={(card) =>
              teamOrder.batting.indexOf(card.id) >= 0
                ? `Batter ${teamOrder.batting.indexOf(card.id) + 1}`
                : teamOrder.pitching.indexOf(card.id) >= 0
                ? `Starting Pitcher ${teamOrder.pitching.indexOf(card.id) + 1}`
                : `Relief Pitcher ${
                    teamOrder.reliefPitching.indexOf(card.id) + 1
                  }`
            }
            saveText="Save Relief Pitching Order"
            onCardSelected={(card) =>
              updateOrder("reliefPitching", card, "Relief Pitchers", 3)
            }
            onSave={() =>
              saveOrder(
                "reliefPitching",
                3,
                "Relief Pitching",
                "Relief Pitchers"
              )
            }
          />
        </StepperStep>
      </Stepper>
    </Modal>
  );
};
