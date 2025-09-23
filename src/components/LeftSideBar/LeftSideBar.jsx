import React from 'react'
import './leftSideBar.css'
import assets from '../../assets/assets'



const LeftSideBar = () => {
    return (
        <div className='ls'>
            <div className="lsTop">
                <div className="lsNav">
                    <img src={assets.logo} className='logo' />
                    <div className="menu">
                        <img src={assets.menu_icon} alt="" />
                        <div className="subMenu">
                            <p>Edit Profile</p>
                            <hr />
                            <p>Logout</p>
                        </div>
                    </div>
                </div>
                <div className="lsSearch">
                    <img src={assets.search_icon} alt="" />
                    <input type="text" placeholder='Search or start new chat' />
                </div>
            </div>
            <div className="lsList">
                {Array(12).fill("").map((item,index)=>(
                    <div key={index} className='friends'>
                        <img src={assets.profile_img} alt="" />
                        <div>
                            <p>Shaswata Sarkar</p>
                            <span>Hello, how are you?</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
export default LeftSideBar