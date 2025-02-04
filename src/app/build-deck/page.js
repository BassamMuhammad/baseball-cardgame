"use client";
import { LoadingOverlay } from "@mantine/core";
import { useEffect, useState } from "react";
import { MLB_BASE_URL } from "../constants";
import { notifications } from "@mantine/notifications";
import { useApp } from "../hooks/useApp";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { useUser } from "../hooks/useUser";
import { CardChoosingComp } from "../components/CardChoosingComp";

export default function Page() {
  const [players, setPlayers] = useState([]);
  const [playersWithStats, setPlayersWithStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSavingDeck, setLoadingSavingDeck] = useState(false);
  const [deck, setDeck] = useState([]);
  const user = useUser();
  const app = useApp();
  const firestore = getFirestore(app);

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetch(`${MLB_BASE_URL}/people/search`)
        .then((playersData) => playersData.json())
        .then((players) => {
          setPlayers(players?.people ?? []);
        })
        .catch((e) => {
          console.log(e);
          notifications.show({
            title: "Loading error",
            message: "Error occured. Please try again",
            color: "red",
          });
          setLoading(false);
        });
      getDoc(doc(firestore, `users/${user.uid}`)).then((doc) => {
        setDeck(doc.get("deck") ?? []);
      });
    }
  }, [user]);

  useEffect(() => {
    const playerDataReqs = [];
    const playerIdsToTask = {};
    players.forEach((player) => {
      playerIdsToTask[player.id] = ["hitting", "fielding", "pitching"];

      playerDataReqs.push(
        fetch(
          `${MLB_BASE_URL}/people/${player.id}/stats?stats=career&group=hitting`
        )
      );
      playerDataReqs.push(
        fetch(
          `${MLB_BASE_URL}/people/${player.id}/stats?stats=career&group=fielding`
        )
      );
      playerDataReqs.push(
        fetch(
          `${MLB_BASE_URL}/people/${player.id}/stats?stats=career&group=pitching`
        )
      );
    });
    Promise.all(playerDataReqs)
      .then((playersData) => {
        Promise.all(
          playersData.map((playerData) =>
            playerData.headers.get("content-type").includes("application/json")
              ? playerData.json()
              : playerData.blob()
          )
        )
          .then((data) => {
            const playersWithStats = [];
            Object.keys(playerIdsToTask).forEach((p, i) => {
              i *= 3;
              playersWithStats.push({
                id: p,
                fullName: players.find((player) => player.id == p)?.fullName,
                hittingStats: data[i]?.stats?.[0]?.splits?.[0]?.stat ?? [],
                fieldingStats: data[i + 1]?.stats?.[0]?.splits?.[0]?.stat ?? [],
                pitchingStats: data[i + 2]?.stats?.[0]?.splits?.[0]?.stat ?? [],
              });
            });
            setPlayersWithStats(playersWithStats);
            setLoading(false);
          })
          .catch((e) => {
            console.log(e);
            notifications.show({
              title: "Loading error",
              message: "Error occured. Please try again",
              color: "red",
            });
            setLoading(false);
          });
      })
      .catch((e) => {
        console.log(e);
        notifications.show({
          title: "Loading error",
          message: "Error occured. Please try again",
          color: "red",
        });
        setLoading(false);
      });
  }, [players]);

  const updateDeck = (newPlayer) => {
    const tempDeck = [...deck];
    const index = tempDeck.findIndex((d) => d.fullName === newPlayer.fullName);
    if (index >= 0) {
      tempDeck.splice(index, 1);
    } else if (tempDeck.length < 17) {
      tempDeck.push(newPlayer);
    } else {
      notifications.show({
        title: "Max deck length reached",
        message: "You can not add more than 17 cards",
        color: "red",
      });
    }
    setDeck(tempDeck);
  };

  const saveDeck = async () => {
    try {
      if (deck.length !== 17) {
        notifications.show({
          title: "Deck saving error",
          message: "Deck should be of length 17",
          color: "red",
        });
        return;
      }
      setLoadingSavingDeck(true);
      await updateDoc(doc(firestore, `users/${user.uid}`), {
        deck,
      });
      notifications.show({
        title: "Deck saved",
        message: "Deck saved successfully",
        color: "green",
      });
    } catch (e) {
      console.log(e);
      notifications.show({
        title: "Deck saving error",
        message: "Error while saving deck. Please try again",
        color: "red",
      });
    } finally {
      setLoadingSavingDeck(false);
    }
  };

  if (loading) return <LoadingOverlay visible={loading} />;

  return (
    <CardChoosingComp
      cards={playersWithStats}
      selected={(card) => deck.find((p) => p.id == card.id)}
      saveText="Save Deck"
      onCardSelected={updateDeck}
      onSave={saveDeck}
      loadingSave={loadingSavingDeck}
    />
  );
}
