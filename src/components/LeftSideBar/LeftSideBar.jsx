import React, { useContext, useState } from 'react'
import './leftSideBar.css'
import assets from '../../assets/assets'
import { useNavigate } from 'react-router-dom'
import { arrayUnion, collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'



const LeftSideBar = () => {

    const navigate = useNavigate();
    const{userData} = useContext(AppContext);
    const [user, setUser] = useState(null);
    const [showSearch, setShowSearch] = useState(false);

    const inputHandler = async(e)=>{
        try {
            const input = e.target.value;
            if(input){
                setShowSearch(true);
                const userRef = collection(db, 'users');
                const q = query(userRef, where("username", "==", input.toLowerCase()))
                const querySnap = await getDocs(q);
                if(!querySnap.empty && querySnap.docs[0].data().id !== userData.id){
                    // console.log(querySnap.docs[0].data());
                    setUser(querySnap.docs[0].data());
                }
                else{
                    setUser(null);
                }
            }
            else{
                setShowSearch(false);
            }
        } catch (error) {
            
        }
    }

    const addChat = async() => {
        const messagesRef = collection(db, "messages");
        const chatsRef = collection(db, "chats");
        try {
            const newMessageRef = doc(messagesRef);
            await setDoc(newMessageRef,{
                createAt : serverTimestamp(),
                messages : []
            })

            await updateDoc(doc(chatsRef, user.id),{
                chatsData: arrayUnion({
                    messageId:newMessageRef.id,
                    lastMessage : "",
                    rId:userData.id,
                    updatedAt:Date.now(),
                    messageSeen: true
                })
            })

            await updateDoc(doc(chatsRef, userData.id),{
                chatsData: arrayUnion({
                    messageId:newMessageRef.id,
                    lastMessage : "",
                    rId:user.id,
                    updatedAt:Date.now(),
                    messageSeen: true
                })
            })

        } catch (error) {
            toast.error(error.message);
            console.error(error);
        }
    }

    return (
        <div className='ls'>
            <div className="lsTop">
                <div className="lsNav">
                    <img src={assets.logo} className='logo' />
                    <div className="menu">
                        <img src={assets.menu_icon} alt="" />
                        <div className="subMenu">
                            <p onClick={()=>navigate('/profile')}>Edit Profile</p>
                            <hr />
                            <p>Logout</p>
                        </div>
                    </div>
                </div>
                <div className="lsSearch">
                    <img src={assets.search_icon} alt="" />
                    <input onChange={inputHandler} type="text" placeholder='Search or start new chat' />
                </div>
            </div>
            <div className="lsList">
                {showSearch && user
                ?<div onClick={addChat} className="friends addUser">
                    <img src={user.avatar} alt=""/>
                    <p>{user.name}</p>
                </div>
                :
                Array(12).fill("").map((item,index)=>(
                    <div key={index} className='friends'>
                        <img src={assets.profile_img} alt="" />
                        <div>
                            <p>Shaswata Sarkar</p>
                            <span>Hello, how are you?</span>
                        </div>
                    </div>
                ))
                }
            </div>
        </div>
    )
}
export default LeftSideBar