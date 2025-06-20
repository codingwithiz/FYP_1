import React, { useState } from "react";
import { auth, googleProvider } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const navigate = useNavigate();

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
      await axios.post("http://localhost:3001/auth/verify", { token });
      setSuccess(isLogin ? "Login successful!" : "Signup successful!");
      navigate("/map");
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
      await axios.post("http://localhost:3001/auth/verify", { token });
      setSuccess("Google login successful!");
      navigate("/map");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetMsg("");
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMsg("Password reset email sent! Please check your inbox.");
    } catch (err) {
      setResetMsg(err.message);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e3f0ff 0%, #f9f9f9 100%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          width: 400,
          maxWidth: "90vw",
          margin: "100px auto",
          padding: 40,
          border: "1px solid #e0e6ed",
          borderRadius: 20,
          background: "#fff",
          boxShadow: "0 4px 24px rgba(25, 118, 210, 0.07)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 24, color: "#222", fontWeight: 700, letterSpacing: 1 }}>
          {isLogin ? "Login" : "Sign Up"}
        </h2>
        <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={e => setEmail(e.target.value)}
            style={{
              padding: "12px 14px",
              borderRadius: 8,
              border: "1px solid #cfd8dc",
              fontSize: 16,
              outline: "none",
              transition: "border 0.2s",
            }}
            onFocus={e => (e.target.style.border = "1.5px solid #1976d2")}
            onBlur={e => (e.target.style.border = "1px solid #cfd8dc")}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            required
            onChange={e => setPassword(e.target.value)}
            style={{
              padding: "12px 14px",
              borderRadius: 8,
              border: "1px solid #cfd8dc",
              fontSize: 16,
              outline: "none",
              transition: "border 0.2s",
            }}
            onFocus={e => (e.target.style.border = "1.5px solid #1976d2")}
            onBlur={e => (e.target.style.border = "1px solid #cfd8dc")}
          />
          {isLogin && (
            <div style={{ textAlign: "right", marginBottom: -10 }}>
              <button
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  color: "#1976d2",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontSize: 14,
                  padding: 0,
                }}
                onClick={() => setShowForgot(true)}
              >
                Forgot your password?
              </button>
            </div>
          )}
          <button
            type="submit"
            style={{
              background: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "12px 0",
              fontWeight: 600,
              fontSize: 17,
              marginTop: 8,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(25, 118, 210, 0.08)",
              transition: "background 0.2s",
            }}
            onMouseOver={e => (e.currentTarget.style.background = "#1251a3")}
            onMouseOut={e => (e.currentTarget.style.background = "#1976d2")}
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>
        <div style={{ margin: "18px 0", display: "flex", alignItems: "center" }}>
          <div style={{ flex: 1, height: 1, background: "#e0e0e0" }} />
          <span style={{ margin: "0 12px", color: "#888", fontSize: 14 }}>or</span>
          <div style={{ flex: 1, height: 1, background: "#e0e0e0" }} />
        </div>
        <button
          onClick={handleGoogle}
          style={{
            width: "100%",
            background: "#fff",
            color: "#222",
            border: "1px solid #cfd8dc",
            borderRadius: 8,
            padding: "12px 0",
            fontWeight: 600,
            fontSize: 16,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(25, 118, 210, 0.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            transition: "border 0.2s",
          }}
          onMouseOver={e => (e.currentTarget.style.border = "1.5px solid #1976d2")}
          onMouseOut={e => (e.currentTarget.style.border = "1px solid #cfd8dc")}
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: 22, height: 22 }} />
          Continue with Google
        </button>
        <div style={{ marginTop: 20, textAlign: "center", fontSize: 15 }}>
          <span>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              style={{
                color: "#1976d2",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                fontWeight: 600,
                fontSize: 15,
              }}
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Sign Up" : "Login"}
            </button>
          </span>
        </div>
        {error && <div style={{ color: "#d32f2f", marginTop: 14, textAlign: "center", fontWeight: 500 }}>{error}</div>}
        {success && <div style={{ color: "#388e3c", marginTop: 14, textAlign: "center", fontWeight: 500 }}>{success}</div>}
      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{
            background: "#fff", padding: 24, borderRadius: 12, minWidth: 320, boxShadow: "0 2px 16px rgba(0,0,0,0.15)"
          }}>
            <h3>Reset Password</h3>
            <form onSubmit={handleForgotPassword}>
              <input
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                required
                style={{ width: "100%", padding: 8, marginBottom: 12, borderRadius: 6, border: "1px solid #ccc" }}
              />
              <button
                type="submit"
                style={{
                  background: "#1976d2", color: "#fff", border: "none", borderRadius: 6,
                  padding: "8px 16px", fontWeight: 600, cursor: "pointer"
                }}
              >
                Send Reset Email
              </button>
              <button
                type="button"
                onClick={() => { setShowForgot(false); setResetMsg(""); }}
                style={{
                  marginLeft: 12, background: "#eee", color: "#222", border: "none", borderRadius: 6,
                  padding: "8px 16px", fontWeight: 600, cursor: "pointer"
                }}
              >
                Cancel
              </button>
            </form>
            {resetMsg && <div style={{ marginTop: 12, color: resetMsg.startsWith("Password reset") ? "green" : "red" }}>{resetMsg}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthPage;