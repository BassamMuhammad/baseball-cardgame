import { useEffect, useState } from "react";
import {
  Group,
  UnstyledButton,
  Container,
  Card,
  Text,
  Title,
  Modal,
  Image,
} from "@mantine/core";

export const InstructionCardChoosingComp = ({
  cards,
  opened,
  onClose,
  title,
  isComputer,
}) => {
  const [backside, setBackside] = useState(true);
  const [selectedCard, setSelectedCard] = useState();
  const [computerTurnCompleted, setComputerTurnCompleted] = useState(false);

  const onHandleClick = (func, cardIndex) => {
    if (backside) {
      setBackside(false);
      setSelectedCard(cardIndex);
      setTimeout(() => {
        func();
        onClose();
      }, 3000);
    }
  };

  useEffect(() => {
    if (isComputer && !computerTurnCompleted) {
      setComputerTurnCompleted(true);
      const randomIndex = Math.floor(Math.random() * cards.length);
      onHandleClick(cards[randomIndex].func, randomIndex);
    }
  }, [isComputer]);

  return (
    <Modal
      title={`${title}${isComputer ? "(Computer Turn)" : ""}`}
      opened={opened}
      withCloseButton={false}
      fullScreen
    >
      <Container>
        <Group wrap="wrap">
          {cards.map(({ title, desc, func }, i) => (
            <UnstyledButton
              key={i}
              onClick={isComputer ? undefined : () => onHandleClick(func, i)}
            >
              {backside || selectedCard !== i ? (
                <Image
                  h={200}
                  style={{ borderRadius: 10 }}
                  src="./baseball.webp"
                  alt="card backside"
                />
              ) : (
                <Card h={200} shadow="md" padding="lg" radius="lg" withBorder>
                  <Title>{title}</Title>
                  <Text>{desc}</Text>
                </Card>
              )}
            </UnstyledButton>
          ))}
        </Group>
      </Container>
    </Modal>
  );
};
