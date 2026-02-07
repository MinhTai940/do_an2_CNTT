import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

export default function CreateExam() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [examName, setExamName] = useState("");
  const [duration, setDuration] = useState("");

  const handleCreateExam = async () => {
    if (!examName || !duration) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      await axiosClient.post("/exams/create", {
        exam_name: examName,
        duration: Number(duration),
        class_id: classId,
      });

      alert("Tạo đề thi thành công");
      navigate(`/teacher/classes/${classId}`);
    } catch (err) {
      alert("Tạo đề thi thất bại");
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Tạo đề thi</h2>

      <input
        placeholder="Tên đề thi"
        value={examName}
        onChange={(e) => setExamName(e.target.value)}
      />

      <br />

      <input
        type="number"
        placeholder="Thời gian (phút)"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
      />

      <br />

      <button onClick={handleCreateExam}>Tạo đề</button>
    </div>
  );
}
