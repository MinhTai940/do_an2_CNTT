import { useState } from "react";
import axiosClient from "../../api/axiosClient";
import { useNavigate } from "react-router-dom";

export default function JoinClass() {
  const [classCode, setClassCode] = useState("");
  const navigate = useNavigate();

  const handleJoin = async () => {
    try {
      await axiosClient.post("/classes/join", {
        class_code: classCode,
      });

      alert("Join class successfully");

      // ✅ chuyển sang trang lớp của tôi
      navigate("/student/classes");
    } catch (err) {
      alert("Join thất bại");
    }
  };

  return (
    <div>
      <h2>Join Class</h2>

      <input
        value={classCode}
        onChange={(e) => setClassCode(e.target.value)}
        placeholder="Nhập mã lớp"
      />

      <button onClick={handleJoin}>Join</button>
    </div>
  );
}
