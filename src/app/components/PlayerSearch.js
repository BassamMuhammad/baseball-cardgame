"use client";
import { Select } from "@mantine/core";
import { useEffect, useState } from "react";

export const PlayerSearch = ({
  selectedPlayerId,
  setSelectedPlayerId,
  placeholder,
  url,
}) => {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const getPlayers = async () => {
      try {
        const playersData = await fetch(url);
        const players = await playersData.json();
        setPlayers(players?.people ?? players?.teams ?? []);
      } catch (error) {
        alert("Error occurred. Please try again");
      }
    };
    getPlayers();
  }, [url]);

  return (
    <Select
      data={players.map((player) => ({
        label: player.fullName ?? player.name,
        value: String(player.id),
      }))}
      value={selectedPlayerId}
      onChange={setSelectedPlayerId}
      searchable
      nothingFoundMessage="Nothing found..."
      placeholder={placeholder}
      mr={5}
    />
  );
};
