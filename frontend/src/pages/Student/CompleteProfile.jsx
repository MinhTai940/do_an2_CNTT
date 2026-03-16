import { useState } from "react";
import axiosClient from "../../api/axiosClient";
import { useNavigate } from "react-router-dom";

export default function CompleteProfile() {
  const [fullName, setFullName] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [className, setClassName] = useState("");
  const [dob, setDob] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!fullName || !className || !dob) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }

    await axiosClient.post("/student/profile", {
      full_name: fullName,
      student_code: studentCode,
      class_name: className,
      dob
    });

    // 🔥 Cập nhật lại user trong localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    localStorage.setItem(
      "user",
      JSON.stringify({
        ...user,
        is_profile_completed: true
      })
    );

    alert("Cập nhật hồ sơ thành công");
    navigate("/student/dashboard");
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto" }}>
      <h2>🧑‍🎓 Hoàn tất hồ sơ sinh viên</h2>

      <input
        placeholder="Họ tên *"
        onChange={e => setFullName(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <input
        placeholder="Mã sinh viên (nếu có)"
        onChange={e => setStudentCode(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <input
        placeholder="Lớp *"
        onChange={e => setClassName(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <input
        type="date"
        onChange={e => setDob(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <button onClick={handleSubmit} style={{ width: "100%" }}>
        💾 Lưu hồ sơ
      </button>
    </div>
  );
}
