import { CardComp } from "./CardComp";
import { Affix, Box, Button, Group, UnstyledButton } from "@mantine/core";

export const CardChoosingComp = ({
  cards,
  onCardSelected,
  selected,
  selectedText = () => undefined,
  onSave,
  saveText,
  loadingSave = false,
}) => {
  return (
    <Box ml={50}>
      <Group wrap="wrap">
        {cards.map((card, i) => (
          <UnstyledButton key={i} onClick={() => onCardSelected(card)}>
            <CardComp
              player={card}
              selected={selected(card)}
              selectedText={selectedText(card)}
            />
          </UnstyledButton>
        ))}
      </Group>
      <Affix position={{ bottom: 20, right: 20 }}>
        <Button onClick={onSave} loading={loadingSave}>
          {saveText}
        </Button>
      </Affix>
    </Box>
  );
};
