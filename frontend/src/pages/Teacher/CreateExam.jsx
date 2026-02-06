import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

export default function CreateExam() {
  const { classCode } = useParams();
  const navigate = useNavigate();

  const [examName, setExamName] = useState("");
  const [duration, setDuration] = useState("");

  const handleCreateExam = async () => {
    try {
      await axiosClient.post("/exams/create", {
        exam_name: examName,
        class_code: classCode,
        duration: Number(duration),
      });

      alert("Tạo đề thi thành công");
      navigate(`/teacher/classes/${classCode}`);
    } catch (err) {
      alert("Tạo đề thi thất bại");
    }
  };

  return (
    <div>
      <h2>Tạo đề thi cho lớp {classCode}</h2>

      <input
        placeholder="Tên đề thi"
        value={examName}
        onChange={e => setExamName(e.target.value)}
      />

      <input
        type="number"
        placeholder="Thời gian (phút)"
        value={duration}
        onChange={e => setDuration(e.target.value)}
      />

      <button onClick={handleCreateExam}>Tạo đề</button>
    </div>
  );
}
