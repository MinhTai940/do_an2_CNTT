import { Link, Outlet } from "react-router-dom";

export default function TeacherLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{ width: 250, background: "#1f2937", color: "#fff", padding: 20 }}>
        <h3>👩‍🏫 Teacher</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li><Link to="/teacher/dashboard">📊 Dashboard</Link></li>
          <li><Link to="/teacher/classes">📚 Lớp học</Link></li>
          <li><Link to="/teacher/create-class">➕ Tạo lớp</Link></li>
          <li><Link to="/teacher/reports">📈 Thống kê</Link></li>
          <li><Link to="/">🚪 Đăng xuất</Link></li>
        </ul>
      </aside>

      <main style={{ flex: 1, padding: 20 }}>
        <Outlet />
      </main>
    </div>
  );
}
