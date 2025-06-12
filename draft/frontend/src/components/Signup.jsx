import React, { useState } from "react";
import { auth, provider } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import axios from "axios";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signupEmail = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      await axios.post("http://localhost:3001/auth/verify", { token });
      alert("Signup successful");
    } catch (err) {
      console.error(err.message);
    }
  };

  const loginEmail = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      await axios.post("http://localhost:3001/auth/verify", { token });
      alert("Login successful");
    } catch (err) {
      console.error(err.message);
    }
  };

  const loginGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      await axios.post("http://localhost:3001/auth/verify", { token });
      alert("Google login successful");
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <div>
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={signupEmail}>Sign Up</button>
      <button onClick={loginEmail}>Login</button>
      <button onClick={loginGoogle}>Login with Google</button>
    </div>
  );
};

export default Signup;
