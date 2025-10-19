import React, { useContext, useEffect, useState } from 'react';
import './chatBox.css';
import assets from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { toast } from 'react-toastify';

const ChatBox = () => {
  const { userData, messagesId, chatUser, messages, setMessages, chatVisible, setChatVisible } =
    useContext(AppContext);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  // 🔹 Upload file to Cloudinary
  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'starting11'); // your unsigned preset
    data.append('cloud_name', 'dthr9jugh'); // your Cloudinary name

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/dthr9jugh/image/upload`, {
        method: 'POST',
        body: data,
      });
      const result = await res.json();
      if (result.secure_url) return result.secure_url;
      throw new Error('Cloudinary upload failed');
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Image upload failed!');
      return null;
    }
  };

  // 🔹 Send Text Message
  const sendMessage = async () => {
    if (!input.trim() || !messagesId || sending) return;

    setSending(true);
    try {
      await updateDoc(doc(db, 'messages', messagesId), {
        messages: arrayUnion({
          sId: userData.id,
          text: input,
          createdAt: new Date(),
        }),
      });

      await updateChatMeta(input.slice(0, 30));
      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.message);
    } finally {
      setSending(false);
    }
  };

  // 🔹 Send Image Message
  const sendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !messagesId || sending) return;

    setSending(true);
    try {
      const fileUrl = await uploadToCloudinary(file);
      if (!fileUrl) throw new Error('Image upload failed');

      // Add image message to Firestore
      await updateDoc(doc(db, 'messages', messagesId), {
        messages: arrayUnion({
          sId: userData.id,
          image: fileUrl,
          createdAt: new Date(),
        }),
      });

      await updateChatMeta('📷 Image');
    } catch (error) {
      console.error('Error sending image:', error);
      toast.error(error.message);
    } finally {
      setSending(false);
    }
  };

  // 🔹 Update Chat Metadata for both users
  const updateChatMeta = async (lastMessageText) => {
    const userIDs = [chatUser.rId, userData.id];

    await Promise.all(
      userIDs.map(async (id) => {
        const userChatsRef = doc(db, 'chats', id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatData = userChatsSnapshot.data();
          if (!userChatData.chatsData) userChatData.chatsData = [];

          const chatIndex = userChatData.chatsData.findIndex(
            (c) => c.messagesId === messagesId
          );

          if (chatIndex !== -1) {
            userChatData.chatsData[chatIndex].lastMessage = lastMessageText;
            userChatData.chatsData[chatIndex].updatedAt = Date.now();
            if (id === chatUser.rId) userChatData.chatsData[chatIndex].messageSeen = false;
          } else {
            userChatData.chatsData.push({
              messagesId,
              rId: id === userData.id ? chatUser.rId : userData.id,
              lastMessage: lastMessageText,
              updatedAt: Date.now(),
              messageSeen: id === chatUser.rId ? false : true,
            });
          }

          await updateDoc(userChatsRef, { chatsData: userChatData.chatsData });
        }
      })
    );
  };

  // 🔹 Real-time listener
  useEffect(() => {
    if (!messagesId) return;

    const unSub = onSnapshot(doc(db, 'messages', messagesId), (res) => {
      const data = res.data();
      if (data?.messages) {
        const reversed = [...data.messages].reverse();
        setMessages(reversed);
      }
    });

    return () => unSub();
  }, [messagesId, setMessages]);

  // 🟣 UI
  return chatUser ? (
    <div className={`chatBox ${chatVisible ? '' : 'hidden'}`}>
      <div className="chatUser">
        <img src={chatUser.userData.avatar} alt="avatar" />
        <p>
          {chatUser.userData.name}
          {Date.now() - chatUser.userData.lastSeen <= 70000 ? (
            <img src={assets.green_dot} className="dot" alt="online" />
          ) : (
            <span className="lastSeen">
              Last seen at{' '}
              {new Date(chatUser.userData.lastSeen).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}
        </p>
        <img src={assets.help_icon} className="help" alt="help" />
        <img
          onClick={() => setChatVisible(false)}
          src={assets.arrow_icon}
          className="arrow"
          alt="back"
        />
      </div>

      <div className="chatMsg">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.sId === userData.id ? 'sMsg' : 'rMsg'}>
            {msg.text && <p className="msg">{msg.text}</p>}
            {msg.image && (
              <img src={msg.image} alt="sent" className="msgImage" />
            )}
            <div>
              <img
                src={
                  msg.sId === userData.id ? userData.avatar : chatUser.userData.avatar
                }
                alt="profile"
              />
              <p>
                {new Date(
                  msg.createdAt?.seconds
                    ? msg.createdAt.seconds * 1000
                    : msg.createdAt
                ).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="chatInput">
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          placeholder="Type a message"
          disabled={sending}
        />
        <input
          onChange={sendImage}
          type="file"
          id="file"
          accept="image/png, image/jpeg"
          hidden
        />
        <label htmlFor="file">
          <img src={assets.gallery_icon} alt="Upload" />
        </label>
        <img
          onClick={sendMessage}
          src={assets.send_button}
          alt="Send"
          style={{ opacity: sending ? 0.6 : 1 }}
        />
      </div>
    </div>
  ) : (
    <div className={`chatWelcome ${chatVisible ? '' : 'hidden'}`}>
      <img src={assets.logo_icon} alt="logo" />
      <p>Chat anytime</p>
    </div>
  );
};

export default ChatBox;
