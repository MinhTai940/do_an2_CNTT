import { NavLink, Outlet, useNavigate } from "react-router-dom";

export default function StudentLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div>

      {/* SIDEBAR */}
      <div
        style={{
          width: 240,
          height: "100vh",
          background: "#0f172a",
          color: "white",
          padding: 20,
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          left: 0,
          top: 0
        }}
      >
        <h2 style={{ marginBottom: 30 }}>🎓 Student</h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>

          {[
            { to: "dashboard", label: "📊 Dashboard" },
            { to: "classes", label: "📘 Lớp của tôi" },
            // { to: "join", label: "➕ Join lớp" },
            { to: "results", label: "📑 Kết quả" },
            { to: "profile", label: "👤 Thông tin cá nhân" }
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                padding: "10px 14px",
                borderRadius: 8,
                textDecoration: "none",
                color: isActive ? "#38bdf8" : "#e2e8f0",
                background: isActive ? "#1e293b" : "transparent",
                fontWeight: isActive ? "600" : "normal"
              })}
            >
              {item.label}
            </NavLink>
          ))}

        </nav>

        {/* LOGOUT FIXED AT BOTTOM */}
        <button
          onClick={handleLogout}
          style={{
            marginTop: "auto",
            padding: "10px 14px",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600
          }}
        >
          🚪 Đăng xuất
        </button>

        <div style={{ marginTop: 15, fontSize: 12, opacity: 0.6 }}>
          © 2026 Student System
        </div>

      </div>

      {/* CONTENT */}
      <div
        style={{
          marginLeft: 240,
          padding: 40,
          background: "#f8fafc",
          minHeight: "100vh"
        }}
      >
        <Outlet />
      </div>

    </div>
  );
}