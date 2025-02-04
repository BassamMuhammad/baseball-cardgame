import {
  Center,
  Group,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
} from "@mantine/core";

export const ScoreCardComp = ({ totalInnings, playerName, gameState }) => {
  return (
    <>
      <Table mt={10} withTableBorder withColumnBorders>
        <TableThead>
          <TableTr>
            <TableTh>Innings</TableTh>
            {Array(totalInnings)
              .fill(0)
              .map((_, i) => (
                <TableTh key={i}>{i + 1}</TableTh>
              ))}
          </TableTr>
        </TableThead>
        <TableTbody>
          {[
            { name: playerName, innings: gameState.player1Innings },
            { name: "Computer", innings: gameState.player2Innings },
          ].map(({ name, innings }, i) => (
            <TableTr key={i}>
              <TableTh>{name}</TableTh>
              {innings?.map((inn, j) => (
                <TableTd
                  key={j}
                  bg={
                    gameState.currentInning % 2 === i &&
                    Math.floor(gameState.currentInning / 2) === j
                      ? "green"
                      : undefined
                  }
                >
                  {inn}
                </TableTd>
              ))}
            </TableTr>
          ))}
        </TableTbody>
      </Table>
      <Center>
        <Group>
          <Text>Strike Count: {gameState.strikeCount}</Text>
          <Text>Ball Count: {gameState.ballCount}</Text>
          <Text>Outs: {gameState.outs}</Text>
        </Group>
      </Center>
    </>
  );
};
