import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axiosClient.get("/admin/dashboard")
      .then(res => setData(res.data))
      .catch(() => alert("Không tải được dữ liệu admin"));
  }, []);

  if (!data) return <p>Đang tải...</p>;

  return (
    <div>
        <h1>👑 Admin Dashboard</h1>
      <p>Đăng nhập admin thành công</p>
      <h2>👑 Admin Dashboard</h2>
      <ul>
        <li>👥 Tổng user: {data.total_users}</li>
        <li>🎓 Sinh viên: {data.students}</li>
        <li>👩‍🏫 Giảng viên: {data.teachers}</li>
        <li>🏫 Lớp học: {data.classes}</li>
        <li>📝 Đề thi: {data.exams}</li>
        <li>🚨 Gian lận: {data.cheat_logs}</li>
      </ul>
    </div>
  );
}
