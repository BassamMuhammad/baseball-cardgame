import React, { useState } from "react";
import {
  Modal,
  Button,
  TextInput,
  PasswordInput,
  Group,
  FileButton,
  Center,
  Avatar,
} from "@mantine/core";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { useApp } from "../hooks/useApp";
import { notifications } from "@mantine/notifications";
import { addDoc, doc, getFirestore } from "firebase/firestore";

const AuthComp = ({ open, setOpen }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const app = useApp();
  const auth = getAuth(app);
  const storage = getStorage(app);
  const firestore = getFirestore(app);

  const handleAuth = async () => {
    try {
      setLoading(true);
      if (!email || !password) {
        notifications.show({
          title: "Authentication error",
          message: "Please enter email and password",
          color: "red",
        });
        return;
      }
      if (isSignUp) {
        if (!name) {
          notifications.show({
            title: "Authentication error",
            message: "Please enter name",
            color: "red",
          });
          return;
        }

        let profilePicUrl = null;
        // if (profilePic) {
        //   const res = await uploadBytes(ref(storage, "profilePic"), profilePic);
        //   profilePicUrl = await getDownloadURL(res.ref);
        // }
        const userCredentials = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        await updateProfile(userCredentials.user, {
          displayName: name,
          photoURL: profilePicUrl,
        });
        await addDoc(doc(firestore, "users", userCredentials.user.uid), {
          points: 0,
          deck: [],
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setOpen(false);
    } catch (error) {
      console.error("Authentication error:", error);
      notifications.show({
        title: "Authentication error",
        message: "Error occured. Please try again",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={open}
      onClose={() => setOpen(false)}
      title={isSignUp ? "Sign Up" : "Sign In"}
    >
      {isSignUp && (
        <Center>
          <FileButton onChange={setProfilePic} accept="image/png,image/jpeg">
            {(props) => (
              <Avatar
                {...props}
                src={profilePic ? URL.createObjectURL(profilePic) : null}
                size={100}
              />
            )}
          </FileButton>
        </Center>
      )}
      {isSignUp && (
        <TextInput
          label="Name"
          placeholder="Your name"
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
        />
      )}
      <TextInput
        label="Email"
        placeholder="Your email"
        value={email}
        onChange={(event) => setEmail(event.currentTarget.value)}
      />
      <PasswordInput
        label="Password"
        placeholder="Your password"
        value={password}
        onChange={(event) => setPassword(event.currentTarget.value)}
      />
      <Group mt={10} position="apart">
        <Button onClick={handleAuth} loading={loading}>
          {isSignUp ? "Sign Up" : "Sign In"}
        </Button>
        <Button variant="outline" onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp
            ? "Already have an account? Sign In"
            : "Don't have an account? Sign Up"}
        </Button>
      </Group>
    </Modal>
  );
};

export default AuthComp;
