import React, { useState } from "react";
import { auth, googleProvider } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import axios from "axios";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }
      const token = await userCredential.user.getIdToken();
      const res = await axios.post("http://localhost:3001/auth/verify", { token });
      setSuccess(isLogin ? "Login successful!" : "Signup successful!");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setSuccess("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      const res = await axios.post("http://localhost:3001/auth/verify", { token });
      setSuccess("Google login successful!");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{
      maxWidth: 350,
      margin: "60px auto",
      padding: 24,
      border: "1px solid #ddd",
      borderRadius: 8,
      background: "#fff"
    }}>
      <h2 style={{ textAlign: "center" }}>{isLogin ? "Login" : "Sign Up"}</h2>
      <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={e => setPassword(e.target.value)}
        />
        <button type="submit">{isLogin ? "Login" : "Sign Up"}</button>
      </form>
      <button onClick={handleGoogle} style={{ marginTop: 12, width: "100%" }}>
        Continue with Google
      </button>
      <div style={{ marginTop: 16, textAlign: "center" }}>
        <span>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            style={{ color: "#1976d2", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </span>
      </div>
      {error && <div style={{ color: "red", marginTop: 12 }}>{error}</div>}
      {success && <div style={{ color: "green", marginTop: 12 }}>{success}</div>}
    </div>
  );
};

export default AuthPage;