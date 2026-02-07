import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function TeacherDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axiosClient.get("/reports/teacher/summary")
      .then(res => setData(res.data))
      .catch(() => alert("Không tải được dashboard"));
  }, []);

  if (!data) return <p>Đang tải...</p>;

  return (
    <div>
      <h2>📊 Tổng quan</h2>
      <ul>
        <li>📚 Số lớp: {data.classes}</li>
        <li>📝 Số đề thi: {data.exams}</li>
        <li>❓ Số câu hỏi: {data.questions}</li>
      </ul>
    </div>
  );
}
