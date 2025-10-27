/* eslint-disable react-refresh/only-export-components */
import { doc, getDoc, onSnapshot, updateDoc, setDoc } from "firebase/firestore";
import { createContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [chatData, setChatData] = useState(null);
  const [messagesId, setMessagesId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const [chatVisible, setChatVisible] = useState(false);

  // ✅ Load user data safely
  const loadUserData = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.error("User document not found in Firestore!");
        return;
      }

      const userData = userSnap.data();
      setUserData(userData);

      // Navigate depending on profile completeness
      if (userData.avatar && userData.name) {
        navigate("/chat");
      } else {
        navigate("/profile");
      }

      // Update last seen immediately
      await updateDoc(userRef, {
        lastSeen: Date.now(),
      });

      // Update every 60 seconds
      setInterval(async () => {
        if (auth.currentUser) {
          await updateDoc(userRef, {
            lastSeen: Date.now(),
          });
        }
      }, 60000);

      // ✅ Ensure chat doc exists for this user
      const chatRef = doc(db, "chats", uid);
      const chatSnap = await getDoc(chatRef);
      if (!chatSnap.exists()) {
        await setDoc(chatRef, { chatsData: [] });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  // ✅ Listen to user's chat updates
  useEffect(() => {
    if (userData) {
      const chatRef = doc(db, "chats", userData.id);

      const unSub = onSnapshot(chatRef, async (res) => {
        const data = res.data();

        // if chat document doesn’t exist or empty
        if (!data || !data.chatsData) {
          setChatData([]);
          return;
        }

        const chatItems = data.chatsData;
        const tempData = [];

        for (const item of chatItems) {
          // skip if receiver id missing
          if (!item?.rId) continue;

          try {
            const userRef = doc(db, "users", item.rId);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
              const userInfo = userSnap.data();
              tempData.push({ ...item, userData: userInfo });
            }
          } catch (err) {
            console.error("Error loading chat item:", err, item);
          }
        }

        // Sort chats by updatedAt descending
        setChatData(tempData.sort((a, b) => b.updatedAt - a.updatedAt));
      });

      return () => unSub();
    }
  }, [userData]);

  const value = {
    userData,
    setUserData,
    chatData,
    setChatData,
    loadUserData,
    messages,
    setMessages,
    messagesId,
    setMessagesId,
    chatUser,
    setChatUser,
    chatVisible,
    setChatVisible,
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
