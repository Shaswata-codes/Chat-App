import React from 'react'
import './rightSideBar.css'
import assets from '../../assets/assets'

const RightSideBar = () => {
    return (
        <div className='rs'>
            <div className="rsProfile">
                <img src={assets.profile_img} alt="" />
                <h3>Virat Kohli<img src={assets.green_dot} className='dot'></img></h3>
                <p>Dummmmmmmmmy Text</p>
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
            <button>Logout</button>
        </div>
    )
}
export default RightSideBar