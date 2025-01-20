"use client";
import { PlayerSearch } from "@/app/components/PlayerSearch";
import { BarChart } from "@mantine/charts";
import {
  Button,
  Center,
  Container,
  Group,
  Modal,
  SegmentedControl,
  Title,
} from "@mantine/core";
import { useState } from "react";
import { MLB_BASE_URL } from "../constants";
import { YearPickerInput } from "@mantine/dates";
import { generateContent } from "@/app/actions";
import dynamic from "next/dynamic";
const Markdown = dynamic(() => import("react-markdown"), {
  loading: () => <p>Loading...</p>,
});

export default function Page() {
  const [isTeamComparison, setIsTeamComparison] = useState("team");
  const [player1Id, setPlayer1Id] = useState();
  const [player2Id, setPlayer2Id] = useState();
  const [comparisonStat, setComparisonStat] = useState("season");
  const [comparisonSeason, setComparisonSeason] = useState(new Date());
  const [comparisonGroup, setComparisonGroup] = useState("hitting");
  const [compareData, setCompareData] = useState([]);
  const [compareExplanation, setCompareExplanation] = useState("");
  const [showCompareExplanation, setShowCompareExplanation] = useState(false);

  const getCompareInfo = async () => {
    const getComparisonUrl = (id) =>
      `${MLB_BASE_URL}/${
        isTeamComparison === "team" ? "teams" : "people"
      }/${id}/stats?stats=${comparisonStat}&season=${comparisonSeason.getFullYear()}&group=${comparisonGroup}`;
    if (!player1Id || !player2Id) {
      alert(`Please select two ${isTeamComparison}s to compare`);
      return;
    }
    if (player1Id === player2Id) {
      alert(`Please select two different ${isTeamComparison}s to compare`);
      return;
    }
    const player1Data = await fetch(getComparisonUrl(player1Id));
    if (player1Data.status === 404) {
      alert(`No data found for ${isTeamComparison} 1`);
      return;
    }
    const player1 = await player1Data.json();
    const player2Data = await fetch(getComparisonUrl(player2Id));
    if (player2Data.status === 404) {
      alert(`No data found for ${isTeamComparison} 2`);
      return;
    }
    const player2 = await player2Data.json();

    const compareData = [];
    Object.entries(player1.stats[0].splits[0].stat).forEach(([key, value]) => {
      compareData.push({
        product: key,
        [player1.stats[0].splits[0][isTeamComparison][
          isTeamComparison === "team" ? "name" : "fullName"
        ]]: value,
        [player2.stats[0].splits[0][isTeamComparison][
          isTeamComparison === "team" ? "name" : "fullName"
        ]]: player2.stats[0].splits[0].stat[key],
      });
    });
    const compareExplanation = await generateContent(
      `Explain the following data between two ${isTeamComparison}s and explain comparison in detail
    ${JSON.stringify(compareData)}`
    );
    setCompareData(compareData);
    setCompareExplanation(compareExplanation);
  };

  return (
    <Container>
      <Center mt={10}>
        <SegmentedControl
          size="lg"
          value={isTeamComparison}
          onChange={(val) => {
            setIsTeamComparison(val);
            setComparisonStat("season");
          }}
          data={[
            { value: "team", label: "Compare Teams" },
            { value: "player", label: "Compare Players" },
          ]}
        />
      </Center>
      <Group wrap="wrap" justify="center" align="flex-end" mt={10}>
        {isTeamComparison === "player" && (
          <SegmentedControl
            value={comparisonStat}
            onChange={setComparisonStat}
            data={[
              { value: "season", label: "Compare by season" },
              { value: "career", label: "Compare by career" },
            ]}
          />
        )}
        {comparisonStat === "season" && (
          <YearPickerInput
            flex={2}
            label="Choose season"
            placeholder="Choose season"
            minDate={new Date(1876, 11)}
            maxDate={new Date()}
            value={comparisonSeason}
            onChange={setComparisonSeason}
          />
        )}
        {isTeamComparison === "team" && (
          <SegmentedControl
            value={comparisonGroup}
            onChange={setComparisonGroup}
            data={[
              { value: "hitting", label: "Compare hitting stats" },
              { value: "fielding", label: "Compare fielding stats" },
              { value: "pitching", label: "Compare pitching stats" },
            ]}
          />
        )}
      </Group>
      <Center my={10}>
        <Title>
          Choose{" "}
          {isTeamComparison.at(0).toUpperCase() + isTeamComparison.slice(1)} to
          Compare
        </Title>
      </Center>
      <Center>
        <Group wrap="wrap">
          <PlayerSearch
            selectedPlayerId={player1Id}
            setSelectedPlayerId={setPlayer1Id}
            placeholder={`Pick ${
              isTeamComparison.at(0).toUpperCase() + isTeamComparison.slice(1)
            } 1`}
            url={`${MLB_BASE_URL}/${
              isTeamComparison === "team" ? "teams" : "people/search"
            }`}
          />
          <PlayerSearch
            selectedPlayerId={player2Id}
            setSelectedPlayerId={setPlayer2Id}
            placeholder={`Pick ${
              isTeamComparison.at(0).toUpperCase() + isTeamComparison.slice(1)
            } 2`}
            url={`${MLB_BASE_URL}/${
              isTeamComparison === "team" ? "teams" : "people/search"
            }`}
          />
          <Button onClick={getCompareInfo}>Compare</Button>
          {compareData.length > 0 && (
            <Button onClick={() => setShowCompareExplanation(true)}>
              Explain Comparison
            </Button>
          )}
        </Group>
      </Center>
      {compareData.length > 0 &&
        [1, 2, 3].map((i) => (
          <BarChart
            key={i}
            h={300}
            data={compareData.slice(13 * (i - 1), 13 * i)}
            dataKey="product"
            series={[
              {
                name:
                  Object.keys(compareData[0]).filter(
                    (n) => n !== "product"
                  )[0] ?? "",
                color: "lime.4",
                opacity: 0.1,
              },
              {
                name:
                  Object.keys(compareData[0]).filter(
                    (n) => n !== "product"
                  )[1] ?? "",
                color: "cyan.4",
                opacity: 0.1,
              },
            ]}
            tickLine="y"
            withLegend
          />
        ))}
      <Modal
        opened={showCompareExplanation}
        onClose={(e) => setShowCompareExplanation(false)}
        title="Explanation"
        fullScreen
      >
        <Markdown>{compareExplanation}</Markdown>
      </Modal>
    </Container>
  );
}
