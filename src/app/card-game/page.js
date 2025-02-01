"use client";
import {
  Affix,
  Button,
  Container,
  Group,
  LoadingOverlay,
  UnstyledButton,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { MLB_BASE_URL } from "../constants";
import { CardComp } from "../components/CardComp";
import { notifications } from "@mantine/notifications";
import { useApp } from "../hooks/useApp";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { useUser } from "../hooks/useUser";

export default function Page() {
  if (loading) return <LoadingOverlay visible={loading} />;

  return <Container></Container>;
}
