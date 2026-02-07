import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function StudentDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axiosClient.get("/reports/student/summary")
      .then(res => setData(res.data))
      .catch(() => alert("Không tải được dữ liệu"));
  }, []);

  if (!data) return <p>Đang tải...</p>;

  return (
    <div>
      <h2>📊 Tổng quan</h2>
      <ul>
        <li>📚 Số lớp đã tham gia: {data.classes}</li>
        <li>📝 Số bài đã làm: {data.exams_done}</li>
        <li>⭐ Điểm trung bình: {data.avg_score}</li>
      </ul>
    </div>
  );
}
