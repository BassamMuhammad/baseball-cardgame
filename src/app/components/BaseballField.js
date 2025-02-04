import { Center, Container, Modal, Paper, Title } from "@mantine/core";
import { CardComp } from "./CardComp";
import { useState } from "react";

// A reusable component for a base marker as a small rectangle
const BaseMarker = ({ cx, cy, label, active, onClick }) => {
  // Define the dimensions of the base rectangle
  const width = 12;
  const height = 12;
  // Calculate the top-left corner so the rectangle is centered at (cx, cy)
  const x = cx - width / 2;
  const y = cy - height / 2;

  return (
    <>
      <rect
        style={{ cursor: active && "pointer" }}
        onClick={onClick}
        x={x}
        y={y}
        width={width}
        height={height}
        fill={active ? "blue" : "#fff"}
        stroke="#333"
        strokeWidth="2"
      />
      {/* Optional label above the base marker */}
      <text
        style={{ cursor: active && "pointer" }}
        onClick={onClick}
        x={cx}
        y={cy - 10}
        textAnchor="middle"
        fill={active ? "white" : "#333"}
        fontSize="10"
      >
        {label}
      </text>
    </>
  );
};

// A reusable component for fielding position markers (e.g. Pitcher, Catcher, etc.)
const PositionMarker = ({ cx, cy, label, active, onClick }) => (
  <>
    <circle
      style={{ cursor: active && "pointer" }}
      onClick={onClick}
      cx={cx}
      cy={cy}
      r={15}
      fill={active ? "blue" : "#fff"}
      stroke="#333"
      strokeWidth="2"
    />
    <text
      style={{ cursor: active && "pointer" }}
      onClick={onClick}
      x={cx}
      y={cy}
      textAnchor="middle"
      dy="0.35em"
      fill={active ? "white" : "#333"}
      fontSize="12"
      fontWeight="bold"
    >
      {label}
    </text>
  </>
);

export const BaseballField = ({ gameState, deck }) => {
  const [openModal, setOpenModal] = useState(false);
  const [player, setPlayer] = useState();
  const baseMarkers = [
    { cx: 200, cy: 350, label: "Home" },
    { cx: 300, cy: 250, label: "1B" },
    { cx: 200, cy: 150, label: "2B" },
    { cx: 100, cy: 250, label: "3B" },
  ];
  const positionMarkers = [
    { cx: 200, cy: 250, label: "P" },
    { cx: 200, cy: 370, label: "C" },
    { cx: 320, cy: 250, label: "1B" },
    { cx: 250, cy: 200, label: "2B" },
    { cx: 150, cy: 200, label: "SS" },
    { cx: 80, cy: 250, label: "3B" },
    { cx: 70, cy: 120, label: "3B" },
    { cx: 80, cy: 250, label: "LF" },
    { cx: 200, cy: 30, label: "CF" },
    { cx: 330, cy: 120, label: "RF" },
  ];

  const handleOnClick = (playerId) => {
    const player = deck.find((p) => p.id == playerId);
    if (player) {
      setOpenModal(true);
      setPlayer(player);
    }
  };

  return (
    <Container h="90vh" style={{ display: "flex", justifyContent: "center" }}>
      <svg viewBox="0 0 400 400">
        <defs>
          <style>{`
              /* Style for the infield (dirt) */
              .infield {
                fill: #e0cda9;
                stroke: #333;
                stroke-width: 2;
              }
              /* Style for the outfield (grass) */
              .outfield {
                fill: #7cfc00;
                stroke: #333;
                stroke-width: 2;
              }
            `}</style>
        </defs>

        {/*
            Draw the outfield as an arc:
            - The arc spans from LF (70,120) to RF (330,120)
            - It connects to the bottom to form a closed shape.
          */}
        <path
          d="M70,120 A139,139 0 0,1 330,120 L330,350 L70,350 Z"
          className="outfield"
        />

        {/*
            Draw the infield diamond using a polygon.
            The vertices of the diamond (clockwise) are:
              - Home Plate: (200,350)
              - First Base: (300,250)
              - Second Base: (200,150)
              - Third Base: (100,250)
          */}
        <polygon className="infield" points="200,350 300,250 200,150 100,250" />

        {/*
            Place base markers as small rectangles at each edge (vertex) of the diamond.
          */}
        {baseMarkers.map(({ cx, cy, label }, i) => (
          <BaseMarker
            key={i}
            cx={cx}
            cy={cy}
            label={label}
            onClick={() =>
              handleOnClick(
                gameState[
                  `player${(gameState.currentInning % 2) + 1}BattingState`
                ][label]
              )
            }
            active={deck.find(
              (p) =>
                p.id ==
                gameState[
                  `player${(gameState.currentInning % 2) + 1}BattingState`
                ][label]
            )}
          />
        ))}

        {/*
            Optionally, you can also add position markers for the players.
            The coordinates below are approximate:
              - Pitcher (P) at (200,250) – center of the diamond.
              - Catcher (C) at (200,370) – behind home plate.
              - First Baseman (1B) at (320,250)
              - Second Baseman (2B) at (250,200)
              - Shortstop (SS) at (150,200)
              - Third Baseman (3B) at (80,250)
              - Left Fielder (LF) at (70,120)
              - Center Fielder (CF) at (200,30)
              - Right Fielder (RF) at (330,120)
          */}
        {positionMarkers.map(({ cx, cy, label }, i) => (
          <PositionMarker
            key={i}
            cx={cx}
            cy={cy}
            label={label}
            onClick={() =>
              handleOnClick(
                gameState[
                  `player${
                    ((gameState.currentInning + 1) % 2) + 1
                  }FieldingState`
                ][label]
              )
            }
            active={deck.find(
              (p) =>
                p.id ==
                gameState[
                  `player${
                    ((gameState.currentInning + 1) % 2) + 1
                  }FieldingState`
                ][label]
            )}
          />
        ))}
      </svg>
      <Modal
        title={player?.fullName}
        centered
        opened={openModal}
        onClose={() => setOpenModal(false)}
      >
        <Center>
          <CardComp player={player} />
        </Center>
      </Modal>
    </Container>
  );
};
