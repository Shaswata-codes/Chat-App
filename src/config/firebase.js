import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";

const firebaseConfig = {
    apiKey: "AIzaSyBwyHPBfzl-s9XOhnNuW56ZZCt1QjHx1LE",
    authDomain: "chat-app-gs-1ce47.firebaseapp.com",
    projectId: "chat-app-gs-1ce47",
  storageBucket: "chat-app-gs-1ce47.appspot.com", // ✅ fix .app → .appspot.com
    messagingSenderId: "751118404799",
    appId: "1:751118404799:web:09fc7f70f3e84a7d470a0a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signUp = async (username, email, password) => {
    try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    console.log("Auth created:", user.uid);

    await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        username: username.toLowerCase(),
        email,
        name: "",
        avatar: "",
        bio: "Hey there I'm using chat-app",
        lastSeen: Date.now(),
    });
    console.log("User doc written!");

    await setDoc(doc(db, "chats", user.uid), {
        chatsData: [],
    });
    console.log("Chats doc written!");
    } catch (error) {
    console.error("Error in signUp:", error);
    toast.error(error.code.split('/')[1].split('-').join(" "));
    }
};

const login = async(email,password) => {
    try {
        await signInWithEmailAndPassword(auth,email,password);
    } catch (error) {
        console.error(error)
        toast.error(error.code.split('/')[1].split('-').join(" "));

    }
}

const logout = async() =>{
    try {
        await signOut(auth)
    } catch (error) {
        console.error(error)
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }
}

export {signUp, login, logout, auth, db};
