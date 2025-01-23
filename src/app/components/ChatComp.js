"use client";
import { Box, Card, Divider, Loader, Text, TextInput } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import {
  addDoc,
  getDocs,
  collection,
  getFirestore,
  limit,
  orderBy,
  query,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { useApp } from "../hooks/useApp";
import { useUser } from "../hooks/useUser";
import { IconMailForward } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

export const ChatComp = () => {
  const user = useUser();
  const app = useApp();
  const firestore = getFirestore(app);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesBoxRef = useRef();

  useEffect(() => {
    const q = query(
      collection(firestore, "messages"),
      orderBy("timestamp"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = [];
      snapshot.forEach((doc) => {
        messages.push(doc.data());
      });
      setMessages(messages);
      setTimeout(() => {
        if (messagesBoxRef.current) {
          messagesBoxRef.current.scrollTop =
            messagesBoxRef.current.scrollHeight;
        }
      }, 100);
    });
    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (message.length === 0) return;
    try {
      setLoading(true);
      await addDoc(collection(firestore, "messages"), {
        text: message,
        ownerId: user.uid,
        ownerName: user.displayName,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.log(error);
      notifications.show({
        title: "Message sending error",
        message: "Error occurred while sending message. Please try again",
        color: "red",
      });
    } finally {
      setLoading(false);
      setMessage("");
    }
  };

  return (
    <Box pos="relative" h="100%" w="100%">
      <Box
        ref={messagesBoxRef}
        style={{ overflowY: "auto", height: "calc(100% - 50px)" }}
      >
        {messages.map((message, i) => (
          <Card
            key={i}
            shadow="xs"
            padding="sm"
            radius="md"
            mt={5}
            w="50%"
            withBorder
            bg={message.ownerId === user.uid ? "blue" : "green"}
            ml={message.ownerId === user.uid ? "auto" : "0"}
          >
            <Text c="white">{message.ownerName}</Text>
            <Divider />
            <Text c="white">{message.text}</Text>
          </Card>
        ))}
      </Box>
      <TextInput
        pos="absolute"
        w="98%"
        bottom={5}
        left={2}
        value={message}
        onChange={(e) => setMessage(e.currentTarget.value)}
        rightSection={
          loading ? (
            <Loader size={18} />
          ) : (
            <IconMailForward
              onClick={message.length > 0 ? sendMessage : null}
              color={message.length > 0 ? "blue" : "grey"}
            />
          )
        }
      />
    </Box>
  );
};
