import React, { useContext, useEffect, useState } from 'react'
import './chatBox.css'
import assets from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { toast } from 'react-toastify'

const ChatBox = () => {

    const {userData, messagesId, chatUser, messages, setMessages} = useContext(AppContext)

    const [input, setInput] = useState("");

    const sendMessage = async () => {
        try {
            if (!input.trim() || !messagesId) return;

            // 1️⃣ Add message to messages collection
            await updateDoc(doc(db, 'messages', messagesId), {
                messages: arrayUnion({
                    sId: userData.id,
                    text: input,
                    createdAt: new Date()
                })
            });

            // 2️⃣ Update each user's chatsData
            const userIDs = [chatUser.rId, userData.id];

            await Promise.all(userIDs.map(async (id) => {
                const userChatsRef = doc(db, 'chats', id);
                const userChatsSnapshot = await getDoc(userChatsRef);

                if (userChatsSnapshot.exists()) {
                    const userChatData = userChatsSnapshot.data();
                    if (!userChatData.chatsData) userChatData.chatsData = [];

                    // ✅ Check both messagesId and rId
                    const chatIndex = userChatData.chatsData.findIndex(
                        (c) => c.messagesId === messagesId && c.rId === chatUser.rId
                    );

                    if (chatIndex !== -1) {
                        // existing chat — update last message
                        userChatData.chatsData[chatIndex].lastMessage = input.slice(0, 30);
                        userChatData.chatsData[chatIndex].updatedAt = Date.now();

                        if (userChatData.chatsData[chatIndex].rId === userData.id) {
                            userChatData.chatsData[chatIndex].messageSeen = false;
                        }
                    } else {
                        // create new chat only if it doesn't already exist
                        userChatData.chatsData.push({
                            messagesId,
                            rId: chatUser.rId,
                            lastMessage: input.slice(0, 30),
                            updatedAt: Date.now(),
                            messageSeen: false
                        });
                    }

                    await updateDoc(userChatsRef, {
                        chatsData: userChatData.chatsData
                    });
                }
            }));

            setInput(""); // clear input after sending

        } catch (error) {
            console.error("Error sending message:", error);
            toast.error(error.message);
        }
    };

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

    return chatUser ? (
        <div className='chatBox'>
            <div className="chatUser">
                <img src={chatUser.userData.avatar} alt="" />
                <p>{chatUser.userData.name} <img className="dot" src={assets.green_dot} alt="" /></p>
                <img src={assets.help_icon} className='help' alt="" />
            </div>

            <div className="chatMsg">
                {messages.map((msg, idx) => (
                    <div key={idx} className={msg.sId === userData.id ? 'sMsg' : 'rMsg'}>
                        <p className="msg">{msg.text}</p>
                        <div>
                            <img src={assets.profile_img} alt="" />
                            <p>{new Date(msg.createdAt?.seconds ? msg.createdAt.seconds * 1000 : msg.createdAt)
                                .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="chatInput">
                <input onChange={(e) => setInput(e.target.value)} value={input} type="text" placeholder="Type a message" />
                <input type="file" id="file" accept="image/png, image/jpeg" hidden />
                <label htmlFor="file">
                    <img src={assets.gallery_icon} alt="Upload" />
                </label>
                <img onClick={sendMessage} src={assets.send_button} alt="Send" />
            </div>
        </div>
    ) : (
        <div className='chatWelcome'>
            <img src={assets.logo_icon} alt="" />
            <p>Chat anytime</p>
        </div>
    );
}

export default ChatBox;
