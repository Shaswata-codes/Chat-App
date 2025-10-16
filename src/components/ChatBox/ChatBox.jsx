import React, { useContext, useEffect, useState } from 'react'
import './chatBox.css'
import assets from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { toast } from 'react-toastify'
import upload from '../../lib/upload'

const ChatBox = () => {

    const { userData, messagesId, chatUser, messages, setMessages } = useContext(AppContext)
    const [input, setInput] = useState("")

    const sendMessage = async () => {
        try {
            if (!input.trim() || !messagesId) return

            // 1️⃣ Add message to messages collection
            await updateDoc(doc(db, 'messages', messagesId), {
                messages: arrayUnion({
                    sId: userData.id,
                    text: input,
                    createdAt: new Date()
                })
            })

            // 2️⃣ Update each user's chatsData safely
            const userIDs = [chatUser.rId, userData.id]

            await Promise.all(userIDs.map(async (id) => {
                const userChatsRef = doc(db, 'chats', id)
                const userChatsSnapshot = await getDoc(userChatsRef)

                if (userChatsSnapshot.exists()) {
                    const userChatData = userChatsSnapshot.data()
                    if (!userChatData.chatsData) userChatData.chatsData = []

                    // ✅ Compare only by messagesId to prevent duplicate contacts
                    const chatIndex = userChatData.chatsData.findIndex(
                        (c) => c.messagesId === messagesId
                    )

                    if (chatIndex !== -1) {
                        // Update existing chat
                        userChatData.chatsData[chatIndex].lastMessage = input.slice(0, 30)
                        userChatData.chatsData[chatIndex].updatedAt = Date.now()

                        // Mark unseen for receiver only
                        if (id === chatUser.rId) {
                            userChatData.chatsData[chatIndex].messageSeen = false
                        }
                    } else {
                        // Create new chat entry if not found
                        userChatData.chatsData.push({
                            messagesId,
                            rId: id === userData.id ? chatUser.rId : userData.id,
                            lastMessage: input.slice(0, 30),
                            updatedAt: Date.now(),
                            messageSeen: id === chatUser.rId ? false : true
                        })
                    }

                    // Save updates
                    await updateDoc(userChatsRef, {
                        chatsData: userChatData.chatsData
                    })
                }
            }))

            setInput("") // clear input after sending

        } catch (error) {
            console.error("Error sending message:", error)
            toast.error(error.message)
        }
    }

    const sendImage = async (e) => {
  try {
    const file = e.target.files[0];
    if (!file) return;

    const fileUrl = await upload(file);

    if (fileUrl && messagesId) {
      // 1️⃣ Add image message to Firestore
      await updateDoc(doc(db, 'messages', messagesId), {
        messages: arrayUnion({
          sId: userData.id,
          image: fileUrl,
          createdAt: new Date()
        })
      });

      // 2️⃣ Update chatsData for both users
      const userIDs = [chatUser.rId, userData.id];

      await Promise.all(userIDs.map(async (id) => {
        const userChatsRef = doc(db, 'chats', id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatData = userChatsSnapshot.data();
          if (!userChatData.chatsData) userChatData.chatsData = [];

          const chatIndex = userChatData.chatsData.findIndex(
            (c) => c.messagesId === messagesId
          );

          if (chatIndex !== -1) {
            userChatData.chatsData[chatIndex].lastMessage = "📷 Image";
            userChatData.chatsData[chatIndex].updatedAt = Date.now();

            if (id === chatUser.rId) {
              userChatData.chatsData[chatIndex].messageSeen = false;
            }
          } else {
            userChatData.chatsData.push({
              messagesId,
              rId: id === userData.id ? chatUser.rId : userData.id,
              lastMessage: "📷 Image",
              updatedAt: Date.now(),
              messageSeen: id === chatUser.rId ? false : true
            });
          }

          await updateDoc(userChatsRef, {
            chatsData: userChatData.chatsData
          });
        }
      }));
    }
  } catch (error) {
    console.error("Error sending image:", error);
    toast.error(error.message);
  }
};


    // 🟢 Real-time message listener
    useEffect(() => {
        if (!messagesId) return

        const unSub = onSnapshot(doc(db, 'messages', messagesId), (res) => {
            const data = res.data()
            if (data?.messages) {
                const reversed = [...data.messages].reverse()
                setMessages(reversed)
            }
        })

        return () => unSub()
    }, [messagesId, setMessages])

    // 🟣 UI Render
    return chatUser ? (
        <div className='chatBox'>
            <div className="chatUser">
                <img src={chatUser.userData.avatar} alt="avatar" />
                <p>
                    {chatUser.userData.name}
                    <img className="dot" src={assets.green_dot} alt="online" />
                </p>
                <img src={assets.help_icon} className='help' alt="help" />
            </div>

            <div className="chatMsg">
                {messages.map((msg, idx) => (
                    <div key={idx} className={msg.sId === userData.id ? 'sMsg' : 'rMsg'}>
                        <p className="msg">{msg.text}</p>
                        <div>
                            <img
                                src={msg.sId === userData.id ? userData.avatar : chatUser.userData.avatar}
                                alt="profile"
                            />
                            <p>
                                {new Date(msg.createdAt?.seconds ? msg.createdAt.seconds * 1000 : msg.createdAt)
                                    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                />
                <input onChange={sendImage} type="file" id="file" accept="image/png, image/jpeg" hidden />
                <label htmlFor="file">
                    <img src={assets.gallery_icon} alt="Upload" />
                </label>
                <img onClick={sendMessage} src={assets.send_button} alt="Send" />
            </div>
        </div>
    ) : (
        <div className='chatWelcome'>
            <img src={assets.logo_icon} alt="logo" />
            <p>Chat anytime</p>
        </div>
    )
}

export default ChatBox
