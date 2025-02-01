import {
  Badge,
  Card,
  CardSection,
  Divider,
  Group,
  Image,
  Text,
} from "@mantine/core";

export const CardComp = ({ player, selected }) => {
  return (
    <Card bg="yellow" shadow="md" padding="lg" radius="lg" withBorder>
      <CardSection bg="orange">
        <Image
          height={150}
          fit="contain"
          src={player.image}
          alt={player.fullName}
        />
      </CardSection>
      {selected && (
        <Badge color="red" pos="absolute" top={0} right={0}>
          Selected
        </Badge>
      )}
      <Text fw={800}>{player.fullName}</Text>
      <Divider />
      <Text fw={600}>Hitting Stats</Text>
      <Group wrap="wrap">
        <Text>
          Power:{" "}
          {Math.max(
            1,
            Math.min(
              10,
              Math.round(
                ((parseFloat(player.hittingStats.slg) * 100) / 4 +
                  (parseFloat(player.hittingStats.homeRuns) * 10) /
                    parseFloat(player.hittingStats.gamesPlayed) +
                  parseFloat(player.hittingStats.atBatsPerHomeRun) / 35) /
                  3
              )
            )
          ) || 1}
        </Text>
        <Text>
          Contact:{" "}
          {Math.max(
            1,
            Math.min(
              10,
              Math.round(
                ((parseFloat(player.hittingStats.avg) * 1000) / 35 +
                  (2000 - parseFloat(player.hittingStats.strikeOuts)) / 200 +
                  (parseFloat(player.hittingStats.babip) * 100) / 40) /
                  3
              )
            )
          ) || 1}
        </Text>
        <Text>
          Speed:{" "}
          {Math.max(
            1,
            Math.min(
              10,
              Math.round(
                ((parseFloat(player.hittingStats.stolenBases) * 10) /
                  parseFloat(player.hittingStats.gamesPlayed) +
                  parseFloat(player.hittingStats.stolenBasePercentage) * 10 +
                  ((parseFloat(player.hittingStats.doubles) +
                    parseFloat(player.hittingStats.triples)) *
                    10) /
                    parseFloat(player.hittingStats.atBats)) /
                  3
              )
            )
          ) || 1}
        </Text>
      </Group>
      <Divider />
      <Text fw={600}>Pitching Stats</Text>
      <Group wrap="wrap">
        <Text>
          Velocity:{" "}
          {Math.max(
            1,
            Math.min(
              10,
              Math.round(
                ((parseFloat(player.pitchingStats.strikeoutsPer9Inn) * 10) /
                  15 +
                  parseFloat(player.pitchingStats.strikePercentage) * 10) /
                  2
              )
            )
          ) || 1}
        </Text>
        <Text>
          Control:{" "}
          {Math.max(
            1,
            Math.min(
              10,
              Math.round(
                (10 -
                  parseFloat(player.pitchingStats.walksPer9Inn) +
                  parseFloat(player.pitchingStats.strikePercentage) * 10 +
                  parseFloat(player.pitchingStats.strikeoutWalkRatio) * 10) /
                  3
              )
            )
          ) || 1}
        </Text>
        <Text>
          Stamina:{" "}
          {Math.max(
            1,
            Math.min(
              10,
              Math.round(
                ((parseFloat(player.pitchingStats.inningsPitched) * 10) / 9 +
                  (parseFloat(player.pitchingStats.gamesPlayed) * 10) / 30 +
                  (150 - parseFloat(player.pitchingStats.pitchesPerInning)) /
                    15) /
                  3
              )
            )
          ) || 1}
        </Text>
      </Group>
      <Divider />
      <Text fw={600}>Fielding Stats</Text>
      <Text>
        Arm Strength:{" "}
        {Math.max(
          1,
          Math.min(
            10,
            Math.round(
              ((parseFloat(player.fieldingStats.assists) * 10) /
                parseFloat(player.fieldingStats.gamesPlayed) +
                (parseFloat(player.fieldingStats.rangeFactorPer9Inn) * 10) / 5 +
                (10 - player.fieldingStats.throwingErrors / 10)) /
                3
            )
          )
        ) || 1}
      </Text>
      <Divider />
    </Card>
  );
};
