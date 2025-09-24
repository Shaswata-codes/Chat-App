/* eslint-disable react-refresh/only-export-components */
import { doc, getDoc } from "firebase/firestore";
import { createContext, useState } from "react";
import { db } from "../config/firebase";
export const AppContext = createContext();
const AppContextProvider = (props) =>{
    const[userData, setUserData] = useState(null);
    const[chatData, setChatData] = useState(null)

    const loadUserData = async(uid)=>{
        try {
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data();
            console.log(userData)
        } catch (error) {
            console.error("Error loading user data:", error);
        }
    }

    const value = {
        userData, setUserData,
        chatData, setChatData,
        loadUserData
    }
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};
export default AppContextProvider