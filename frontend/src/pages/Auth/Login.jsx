import { useState } from "react";
import axiosClient from "../../api/axiosClient";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
  try {
    const res = await axiosClient.post("/auth/login", {
  email: email,
  password: password
});

    const { token, role, is_profile_completed } = res.data;

    localStorage.setItem("user", JSON.stringify({
  role,
  is_profile_completed
}));

    if (role === "student") {
      if (!is_profile_completed) {
        navigate("/student/complete-profile");
      } else {
        navigate("/student/dashboard");
      }
    }

    if (role === "teacher") {
      navigate("/teacher/dashboard");
    }

    if (role === "admin") {
      navigate("/admin/dashboard");
    }

  } catch (err) {
    alert("Login failed");
  }
};

  return (
    <div style={{ maxWidth: 400, margin: "100px auto" }}>
      <h2>🔐 Đăng nhập</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <br />

      <input
        type="password"
        placeholder="Mật khẩu"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <br />

      <button onClick={handleLogin}>Đăng nhập</button>

      <p>
        Chưa có tài khoản?{" "}
        <Link to="/register">Đăng ký</Link>
      </p>
    </div>
  );
}
