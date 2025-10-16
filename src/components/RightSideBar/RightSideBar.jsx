import React, { useContext } from 'react'
import './rightSideBar.css'
import assets from '../../assets/assets'
import { logout } from '../../config/firebase'
import { AppContext } from '../../context/AppContext'

const RightSideBar = () => {

    const {chatUser, messages} = useContext(AppContext)

    return chatUser?(
        <div className='rs'>
            <div className="rsProfile">
                <img src={chatUser.userData.avatar} alt="" />
                <h3>{chatUser.userData.name}<img src={assets.green_dot} className='dot'></img></h3>
                <p>{chatUser.userData.bio}</p>
            </div>
            <hr/>
            <div className='rsMedia'>
                <p>Media</p>
                <div>
                    <img src={assets.pic1} alt="" />
                    <img src={assets.pic2} alt="" />
                    <img src={assets.pic3} alt="" />
                    <img src={assets.pic4} alt="" />
                    <img src={assets.pic1} alt="" />
                    <img src={assets.pic2} alt="" />
                </div>
            </div>
            <button onClick={()=>logout()}>Logout</button>
        </div>
    )
    :(
        <div className='rsWelcome'>
            <button onClick={()=>logout()}>Logout</button>
        </div>
    )
}
export default RightSideBar