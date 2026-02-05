import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { AuthContext } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axiosClient.post("/auth/login", {
        username,
        password,
      });

      login(res.data.token, res.data.role);

      if (res.data.role === "student") {
        navigate("/student/join");
      } else if (res.data.role === "teacher") {
        navigate("/teacher/create-class");
      }

    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Login</h2>
      <input
        placeholder="Username"
        onChange={e => setUsername(e.target.value)}
      />
      <br /><br />
      <input
        type="password"
        placeholder="Password"
        onChange={e => setPassword(e.target.value)}
      />
      <br /><br />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
