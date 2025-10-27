// import React, { useContext } from 'react'
// import './rightSideBar.css'
// import assets from '../../assets/assets'
// import { logout } from '../../config/firebase'
// import { AppContext } from '../../context/AppContext'

// const RightSideBar = () => {

//     const {chatUser, messages} = useContext(AppContext)

//     return chatUser?(
//         <div className='rs'>
//             <div className="rsProfile">
//                 <img src={chatUser.userData.avatar} alt="" />
//                 <h3>{Date.now()-chatUser.userData.lastSeen <= 70000?<img src ={assets.green_dot}/>:null}{chatUser.userData.name}</h3>
//                 <p>{chatUser.userData.bio}</p>
//             </div>
//             <hr/>
//             <div className='rsMedia'>
//                 <p>Media</p>
//                 <div>
//                     <img src={assets.pic1} alt="" />
//                     <img src={assets.pic2} alt="" />
//                     <img src={assets.pic3} alt="" />
//                     <img src={assets.pic4} alt="" />
//                     <img src={assets.pic1} alt="" />
//                     <img src={assets.pic2} alt="" />
//                 </div>
//             </div>
//             <button onClick={()=>logout()}>Logout</button>
//         </div>
//     )
//     :(
//         <div className='rsWelcome'>
//             <button onClick={()=>logout()}>Logout</button>
//         </div>
//     )
// }
// export default RightSideBar

import React, { useContext } from 'react'
import './RightSideBar.css'
import assets from '../../assets/assets'
import { logout } from '../../config/firebase'
import { AppContext } from '../../context/AppContext'

const RightSideBar = () => {
    const { chatUser, messages } = useContext(AppContext)

    // Get only messages that have images
    const imageMessages = messages.filter(msg => msg.image)

    return chatUser ? (
        <div className='rs'>
            <div className="rsProfile">
                <img src={chatUser.userData.avatar} alt="" />
                <h3>
                    {Date.now() - chatUser.userData.lastSeen <= 70000 && <img src={assets.green_dot} alt="online" />}
                    {chatUser.userData.name}
                </h3>
                <p>{chatUser.userData.bio}</p>
            </div>
            <hr />
            <div className='rsMedia'>
                <p>Media</p>
                <div>
                    {imageMessages.length > 0 ? (
                        imageMessages.map((msg, idx) => (
                            <img key={idx} src={msg.image} alt={`media-${idx}`} />
                        ))
                    ) : (
                        <p style={{ fontSize: '12px', color: '#aaa' }}>No media yet</p>
                    )}
                </div>
            </div>
            <button onClick={() => logout()}>Logout</button>
        </div>
    ) : (
        <div className='rsWelcome'>
            <button onClick={() => logout()}>Logout</button>
        </div>
    )
}

export default RightSideBar
