import { useState } from "react";
import axiosClient from "../../api/axiosClient";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await axiosClient.post("/auth/register", {
        email,
        password
      });

      alert("Đăng ký thành công, hãy đăng nhập");
      navigate("/login");
    } catch {
      alert("Đăng ký thất bại");
    }
  };

  return (
    <div>
      <h2>🧑‍🎓 Đăng ký sinh viên</h2>
      <input placeholder="Email sinh viên" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Mật khẩu" onChange={e => setPassword(e.target.value)} />
      <button onClick={handleRegister}>Đăng ký</button>
    </div>
  );
}
