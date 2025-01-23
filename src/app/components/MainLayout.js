"use client";

import { useDisclosure } from "@mantine/hooks";
import {
  AppShellHeader,
  AppShellMain,
  AppShellNavbar,
  AppShell,
  Burger,
  Group,
  Avatar,
  Title,
} from "@mantine/core";
import { useUser } from "../hooks/useUser";
import ProfileComp from "./ProfileComp";
import { useState } from "react";
import AuthComp from "./AuthComp";
import { ChatComp } from "./ChatComp";

export const MainLayout = ({ children }) => {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const [openModal, setOpenModal] = useState(false);
  const user = useUser();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
    >
      <AppShellHeader>
        <Group h="100%" px="md" justify="space-between" align="center">
          <Group>
            <Burger
              opened={mobileOpened}
              onClick={toggleMobile}
              hiddenFrom="sm"
              size="sm"
            />
            <Burger
              opened={desktopOpened}
              onClick={toggleDesktop}
              visibleFrom="sm"
              size="sm"
            />
          </Group>
          <Avatar
            src={user?.photoURL}
            size={48}
            onClick={() => setOpenModal(true)}
            color={user ? "blue" : "gray"}
          />
        </Group>
      </AppShellHeader>

      <AppShellNavbar>
        {user ? (
          <ChatComp />
        ) : (
          <Title order={3} c="red">
            Login or Sign up to access chat
          </Title>
        )}
      </AppShellNavbar>

      <AppShellMain>{children}</AppShellMain>
      {openModal && user ? (
        <ProfileComp open={openModal} setOpen={setOpenModal} user={user} />
      ) : (
        <AuthComp open={openModal} setOpen={setOpenModal} />
      )}
    </AppShell>
  );
};
