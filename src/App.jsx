import React, { useContext, useEffect } from 'react'
import {Route, Routes, useNavigate} from 'react-router-dom'
import Login from './pages/login/login.jsx'
import Chat from './pages/Chat/Chat.jsx'
import ProfileUpdate from './pages/ProfileUpdate/ProfileUpdate.jsx'
import{ToastContainer,toast} from 'react-toastify';
import'react-toastify/dist/ReactToastify.css';
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './config/firebase.js'
import { AppContext } from './context/AppContext.jsx'


function App() {

  const navigate =  useNavigate();
  const {loadUserData} = useContext(AppContext)

  useEffect(()=>{
    onAuthStateChanged(auth, async(user)=>{
      if(user){
        navigate('/chat')
        await loadUserData(user.uid)
      }
      else{
        navigate('/')
      }
    })
  },[])

  return (
    <>
    <ToastContainer/>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/chat' element={<Chat />} />
        <Route path='/profile' element={<ProfileUpdate />} />
      </Routes>

    </>
  )
}

export default App
