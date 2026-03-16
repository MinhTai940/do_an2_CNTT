import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { AuthContext } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);

      const res = await axiosClient.post("/auth/login", {
        username,
        password,
      });

      login(res.data.token, res.data.role);

      if (res.data.role === "admin") {
        navigate("/admin/dashboard");
      } else if (res.data.role === "teacher") {
        navigate("/teacher/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err) {
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <style>{`
        .login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;

  /* 🔥 Background tím nhạt */
  background: linear-gradient(135deg, #ede9fe, #e0e7ff);
}

.login-card {
  background: white;
  padding: 45px;
  width: 400px;
  border-radius: 24px;
  box-shadow: 0 25px 50px rgba(0,0,0,0.08);
}

.login-title {
  text-align: center;
  font-size: 26px;
  font-weight: bold;
  margin-bottom: 30px;
}

.input-group {
  margin-bottom: 20px;
}

.input-group input {
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  box-sizing: border-box;   /* 🔥 QUAN TRỌNG */
  transition: 0.3s;
  background: #f8fafc;
}

.input-group input:focus {
  outline: none;
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124,58,237,0.15);
  background: white;
}

.login-btn {
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  border: none;
  background: linear-gradient(90deg, #7c3aed, #4f46e5);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(124,58,237,0.25);
}

.register-text {
  margin-top: 18px;
  text-align: center;
  font-size: 14px;
}

.register-text a {
  color: #7c3aed;
  font-weight: 500;
  text-decoration: none;
}

.register-text a:hover {
  text-decoration: underline;
}
      `}</style>

      <div className="login-card">
        <div className="login-title">🔐 Đăng Nhập</div>

        <div className="input-group">
          <input
            placeholder="Username hoặc Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="input-group">
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          className="login-btn"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        <div className="register-text">
          Chưa có tài khoản? <a href="/register">Đăng ký</a>
        </div>
      </div>
    </div>
  );
}