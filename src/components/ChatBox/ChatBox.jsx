import React, { useContext, useState } from 'react'
import './chatBox.css'
import assets from '../../assets/assets'
import { AppContext } from '../../context/AppContext'

const ChatBox = () => {

    const {userData, messagesId, chatUser, messages, setMessages} = useContext(AppContext)

    const [input, setInput] = useState("");

    return chatUser?(
        <div className='chatBox' >
            <div className="chatUser">
                <img src={assets.profile_img} alt="" />
                <p>Shaswata <img className="dot"src={assets.green_dot} alt="" /></p>
                <img src={assets.help_icon} className='help' alt="" />
            </div>

            <div className="chatMsg">
                <div className="sMsg">
                    <p className="msg">Dummy Text</p>
                    <div>
                        <img src={assets.profile_img} alt="" />
                        <p>2:30PM</p>
                    </div>
                </div>
                <div className="sMsg">
                    <img className="msgImg"src={assets.pic1} alt="" />
                    <div>
                        <img src={assets.profile_img} alt="" />
                        <p>2:30PM</p>
                    </div>
                </div>
                <div className="rMsg">
                    <p className="msg">Dummy Text</p>
                    <div>
                        <img src={assets.profile_img} alt="" />
                        <p>2:30PM</p>
                    </div>
                </div>
            </div>

            <div className="chatInput">
                <input type="text" placeholder="Type a message" />
                <input type="file" id="file" accept="image/png, image/jpeg" hidden />
                <label htmlFor="file">
                    <img src={assets.gallery_icon} alt="Upload" />
                </label>
                <img src={assets.send_button} alt="Send" />
            </div>
        </div>
    )
    :<div className='chatWelcome'>
        <img src={assets.logo_icon} alt="" />
        <p>Chat anytime</p>
    </div>
}
export default ChatBox