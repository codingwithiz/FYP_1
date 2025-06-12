// src/components/Login.jsx
import React, { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import axios from "axios";

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleEmailLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      await axios.post("http://localhost:3001/api/verify-token", {}, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      onLoginSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      await axios.post("http://localhost:3001/api/verify-token", {}, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      onLoginSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleEmailLogin}>Login with Email</button>
      <button onClick={handleGoogleLogin}>Login with Google</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default Login;
