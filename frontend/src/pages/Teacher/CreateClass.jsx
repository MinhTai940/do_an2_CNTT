import { useState } from "react";
import axiosClient from "../../api/axiosClient";
import { useNavigate } from "react-router-dom";

export default function CreateClass() {
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!className || !subject) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      const res = await axiosClient.post("/classes/create", {
        class_name: className,
        subject: subject
      });

      alert(
        "Tạo lớp thành công! Mã lớp: " + res.data.class_code
      );

      navigate("/teacher/classes");
    } catch (err) {
      alert("Tạo lớp thất bại");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📘 Tạo lớp học</h2>

      <div style={{ marginBottom: 10 }}>
        <label>Tên lớp</label>
        <br />
        <input
          type="text"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          placeholder="VD: CNTT_K45"
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Môn học</label>
        <br />
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="VD: Công nghệ thông tin"
        />
      </div>

      <button onClick={handleCreate}>
        ➕ Tạo lớp
      </button>
    </div>
  );
}
