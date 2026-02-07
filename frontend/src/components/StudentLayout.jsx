import { NavLink, Outlet } from "react-router-dom";

export default function StudentLayout() {
  return (
    <div style={{ display: "flex" }}>
      <aside style={{ width: 220, background: "#1f2937", color: "#fff", padding: 20 }}>
        <h2>🎓 Student</h2>

        <nav>
          <NavLink to="/student/dashboard">📊 Dashboard</NavLink><br />
          <NavLink to="/student/classes">🏫 Lớp của tôi</NavLink><br />
          <NavLink to="/student/join">➕ Join lớp</NavLink><br />
          <NavLink to="/student/results">📄 Kết quả</NavLink><br />
          <button onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}>
            🚪 Đăng xuất
          </button>
        </nav>
      </aside>

      <main style={{ flex: 1, padding: 20 }}>
        <Outlet />
      </main>
    </div>
  );
}
