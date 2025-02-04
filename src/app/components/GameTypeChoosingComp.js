import {
  Center,
  Modal,
  Paper,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";

export const GameTypeChoosingComp = ({ opened, setTotalInnings }) => {
  const gameTypes = [
    { label: "Quick Play (3 innings)", value: 3 },
    { label: "Full Game (9 innings)", value: 9 },
  ];

  return (
    <Modal
      opened={opened}
      fullScreen
      withCloseButton={false}
      title="Select Game Type"
    >
      <Center>
        <Stack>
          {gameTypes.map(({ label, value }) => (
            <UnstyledButton key={label} onClick={() => setTotalInnings(value)}>
              <Paper shadow="xs" p="xl">
                <Text>{label}</Text>
              </Paper>
            </UnstyledButton>
          ))}
        </Stack>
      </Center>
    </Modal>
  );
};
