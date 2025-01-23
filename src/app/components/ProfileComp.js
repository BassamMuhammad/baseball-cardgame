import React, { useRef, useState } from "react";
import {
  Modal,
  Center,
  FileButton,
  Avatar,
  PasswordInput,
  Text,
  Button,
  TextInput,
  CloseButton,
  Group,
} from "@mantine/core";
import { updatePassword, updateProfile, signOut, getAuth } from "firebase/auth";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { notifications } from "@mantine/notifications";
import { useApp } from "../hooks/useApp";

const ProfileComp = ({ open, setOpen, user }) => {
  const [name, setName] = useState(user.displayName);
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [resetted, setResetted] = useState(false);
  const resetRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const app = useApp();
  const auth = getAuth(app);
  const storage = getStorage(app);

  const updateUserInfo = async () => {
    try {
      let didUpdate = false;
      if (profilePic || name !== user.displayName) {
        setLoading(true);
        didUpdate = true;
        let profilePicUrl = null;
        // if (profilePic) {
        //   const res = await uploadBytes(ref(storage, "profilePic"), profilePic);
        //   profilePicUrl = await getDownloadURL(res.ref);
        // }
        await updateProfile(user, {
          displayName: name,
          photoURL: profilePicUrl,
        });
      }
      if (password) {
        didUpdate = true;
        await updatePassword(user, password);
      }
      if (!didUpdate) {
        notifications.show({
          title: "Profile update",
          message: "No changes made",
          color: "red",
        });
        return;
      } else {
        notifications.show({
          title: "Profile updated",
          message: "Profile updated successfully",
          color: "green",
        });
      }
    } catch (error) {
      console.log(error);
      notifications.show({
        title: "Profile update error",
        message: "Error occurred while updating profile. Please try again",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);

      await signOut(auth);
      notifications.show({
        title: "Signed out",
        message: "You have been signed out",
        color: "green",
      });
    } catch (error) {
      console.log(error);
      notifications.show({
        title: "Logout error",
        message: "Error occurred while logging out. Please try again",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={open} onClose={() => setOpen(false)} title="Profile">
      <Center pos="relative">
        <FileButton
          resetRef={resetRef}
          onChange={setProfilePic}
          accept="image/png,image/jpeg"
        >
          {(props) => (
            <Avatar
              {...props}
              src={
                profilePic
                  ? URL.createObjectURL(profilePic)
                  : resetted
                  ? null
                  : user.photoURL
              }
              size={96}
            />
          )}
        </FileButton>
        {(profilePic || user.photoURL) && (
          <CloseButton
            onClick={() => {
              setResetted(true);
              setProfilePic(null);
              resetRef.current?.();
            }}
            pos="absolute"
            top={-5}
            left="57%"
          />
        )}
      </Center>
      <TextInput
        label="Name"
        placeholder="Your name"
        value={name}
        onChange={(event) => setName(event.currentTarget.value)}
      />
      <Text>Email: {user.email}</Text>
      <PasswordInput
        label="Password"
        placeholder="Your password"
        value={password}
        onChange={(event) => setPassword(event.currentTarget.value)}
      />
      <Group mt={10} justify="space-between">
        <Button onClick={updateUserInfo} loading={loading}>
          Update Profile
        </Button>
        <Button
          variant="outline"
          color="red"
          onClick={logout}
          loading={loading}
        >
          Logout
        </Button>
      </Group>
    </Modal>
  );
};

export default ProfileComp;
