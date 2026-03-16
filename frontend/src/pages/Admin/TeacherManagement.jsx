import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = () => {
    axiosClient.get("/admin/teachers")
      .then(res => setTeachers(res.data))
      .catch(() => alert("Không tải được danh sách giáo viên"));
  };

  const createTeacher = () => {
    if (!email || !password) {
      alert("Nhập đủ email và mật khẩu");
      return;
    }

    axiosClient.post("/admin/teachers", { email, password })
      .then(() => {
        setEmail("");
        setPassword("");
        loadTeachers();
      })
      .catch(err => alert(err.response?.data?.message || "Lỗi tạo giáo viên"));
  };

  const toggleStatus = (id) => {
    axiosClient.put(`/admin/teachers/${id}/toggle`)
      .then(() => loadTeachers());
  };

  const resetPassword = (id) => {
    const newPass = prompt("Nhập mật khẩu mới:");
    if (!newPass) return;

    axiosClient.put(`/admin/teachers/${id}/reset-password`, {
      password: newPass
    }).then(() => alert("Reset thành công"));
  };

  const editEmail = (id) => {
    const newEmail = prompt("Nhập email mới:");
    if (!newEmail) return;

    axiosClient.put(`/admin/teachers/${id}`, {
      email: newEmail
    }).then(() => loadTeachers());
  };

  const deleteTeacher = (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xoá giáo viên này?")) return;

    axiosClient.delete(`/admin/teachers/${id}`)
      .then(() => loadTeachers());
  };

  return (
    <div style={{ padding: 30 }}>
      <h2 style={{ marginBottom: 20 }}>👩‍🏫 Quản lý giáo viên</h2>

      {/* ====== CREATE FORM ====== */}
      <div style={card}>
        <h3>➕ Tạo tài khoản giáo viên</h3>

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <input
            style={input}
            placeholder="Email giáo viên"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <input
            style={input}
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <button style={primaryBtn} onClick={createTeacher}>
            Tạo
          </button>
        </div>
      </div>

      {/* ====== TABLE ====== */}
      <div style={card}>
        <table style={table}>
          <thead>
            <tr style={{ background: "#f1f5f9" }}>
              <th style={th}>Email</th>
              <th style={th}>Trạng thái</th>
              <th style={th}>Ngày tạo</th>
              <th style={th}>Đăng nhập gần nhất</th>
              <th style={th}>Hành động</th>
            </tr>
          </thead>

          <tbody>
            {teachers.map(t => (
              <tr key={t._id}>
                <td style={td}>{t.email}</td>

                <td style={td}>
                  {t.status === "active"
                    ? <span style={activeBadge}>🟢 Hoạt động</span>
                    : <span style={inactiveBadge}>🔴 Bị khoá</span>}
                </td>

                <td style={td}>
                  {t.created_at
                    ? new Date(t.created_at).toLocaleString()
                    : "—"}
                </td>

                <td style={td}>
                  {t.last_login
                    ? new Date(t.last_login).toLocaleString()
                    : "Chưa đăng nhập"}
                </td>

                <td style={td}>
                  <button style={actionBtn} onClick={() => toggleStatus(t._id)}>
                    {t.status === "active" ? "Khoá" : "Mở"}
                  </button>

                  <button style={actionBtn} onClick={() => editEmail(t._id)}>
                    ✏ Sửa
                  </button>

                  <button style={actionBtn} onClick={() => resetPassword(t._id)}>
                    🔑 Reset
                  </button>

                  <button style={deleteBtn} onClick={() => deleteTeacher(t._id)}>
                    🗑 Xoá
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const card = {
  background: "white",
  padding: 20,
  borderRadius: 8,
  marginBottom: 20,
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
};

const input = {
  padding: 8,
  borderRadius: 6,
  border: "1px solid #ddd",
  width: 220
};

const primaryBtn = {
  padding: "8px 14px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer"
};

const actionBtn = {
  marginRight: 6,
  padding: "6px 10px",
  borderRadius: 6,
  border: "1px solid #ccc",
  cursor: "pointer"
};

const deleteBtn = {
  padding: "6px 10px",
  borderRadius: 6,
  border: "none",
  background: "#ef4444",
  color: "white",
  cursor: "pointer"
};

const table = {
  width: "100%",
  borderCollapse: "collapse"
};

const th = {
  padding: 10,
  textAlign: "left",
  borderBottom: "1px solid #ddd"
};

const td = {
  padding: 10,
  borderBottom: "1px solid #eee"
};

const activeBadge = {
  background: "#dcfce7",
  padding: "4px 10px",
  borderRadius: 6,
  fontSize: 13
};

const inactiveBadge = {
  background: "#fee2e2",
  padding: "4px 10px",
  borderRadius: 6,
  fontSize: 13
};