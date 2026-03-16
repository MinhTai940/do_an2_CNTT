import { Link, Outlet, useNavigate } from "react-router-dom";

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user"); // nếu có
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* MENU TRÁI */}
      <aside style={{
        width: 240,
        background: "#1e1e2f",
        color: "#fff",
        padding: 20
      }}>
        <h2>👑 Admin</h2>

        <nav style={{ marginTop: 20 }}>
          <p>
            <Link style={{ color: "#fff" }} to="/admin/dashboard">
              📊 Dashboard
            </Link>
          </p>
          <p>
            <Link style={{ color: "#fff" }} to="/admin/teachers">
              👩‍🏫 Quản lý giáo viên
            </Link>
          </p>
          <p>
            <Link style={{ color: "#fff" }} to="/admin/users">
              👥 Quản lý người dùng
            </Link>
          </p>
          <p>
            <Link style={{ color: "#fff" }} to="/admin/classes">
              🏫 Quản lý lớp
            </Link>
          </p>
        </nav>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          style={{
            marginTop: 30,
            padding: "8px 12px",
            width: "100%",
            cursor: "pointer"
          }}
        >
          🚪 Đăng xuất
        </button>
      </aside>

      {/* NỘI DUNG */}
      <main style={{ flex: 1, padding: 20 }}>
        <Outlet />
      </main>
    </div>
  );
}
