import { useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function JoinClass() {
  const [classCode, setClassCode] = useState("");
  const [message, setMessage] = useState("");

  const handleJoin = async () => {
    try {
      const res = await axiosClient.post("/classes/join", {
        class_code: classCode,
      });

      setMessage("✅ Join class successfully");
    } catch (err) {
      if (err.response) {
        setMessage("❌ " + err.response.data.message);
      } else {
        setMessage("❌ Server error");
      }
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Join Class</h2>

      <input
        placeholder="Enter class code"
        value={classCode}
        onChange={(e) => setClassCode(e.target.value)}
      />
      <br /><br />

      <button onClick={handleJoin}>Join</button>

      <p>{message}</p>
    </div>
  );
}

