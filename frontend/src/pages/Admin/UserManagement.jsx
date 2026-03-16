import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function UserManagement() {

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");

  useEffect(() => {
    loadStudents();
    loadClasses();
  }, []);

  // ================= LOAD USERS =================
  const loadStudents = () => {

    axiosClient.get("/admin/students", {
      params: {
        search: search,
        class_id: selectedClass
      }
    })
      .then(res => setStudents(res.data))
      .catch(err => console.log(err));

  };

  // ================= LOAD CLASSES =================
  const loadClasses = () => {

    axiosClient.get("/admin/classes")
      .then(res => setClasses(res.data))
      .catch(err => console.log(err));

  };

  // ================= TOGGLE STATUS =================
  const toggleStatus = (id) => {

    axiosClient.put(`/admin/students/${id}/toggle`)
      .then(() => loadStudents());

  };

  // ================= DELETE USER =================
  const deleteUser = (id) => {

    if (!window.confirm("Xoá tài khoản này?")) return;

    axiosClient.delete(`/admin/students/${id}`)
      .then(() => loadStudents());

  };

  return (

    <div style={{ padding: 30 }}>

      <h2>👥 Quản lý người dùng</h2>

      {/* ===== FILTER BAR ===== */}
      <div style={filterBar}>

        {/* SEARCH */}
        <input
          style={input}
          placeholder="🔍 Tìm theo email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {/* CLASS COMBOBOX */}
        <select
          style={input}
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >

          <option value="">📚 Tất cả lớp</option>

          {classes.map(c => (
            <option key={c._id} value={c._id}>
              {c.class_name}
            </option>
          ))}

        </select>

        {/* FILTER BUTTON */}
        <button
          style={primaryBtn}
          onClick={loadStudents}
        >
          Lọc
        </button>

      </div>

      {/* ===== TABLE ===== */}
      <div style={card}>

        <table style={table}>

          <thead>
            <tr>
              <th>Email</th>
              <th>Lớp</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Đăng nhập gần nhất</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>

            {students.map(s => (

              <tr key={s._id}>

                <td>{s.email}</td>

                <td>{s.class_name || "—"}</td>

                <td>
                  {s.status === "active"
                    ? <span style={active}>🟢 Hoạt động</span>
                    : <span style={inactive}>🔴 Bị khoá</span>}
                </td>

                <td>
                  {s.created_at
                    ? new Date(s.created_at).toLocaleString()
                    : "—"}
                </td>

                <td>
                  {s.last_login
                    ? new Date(s.last_login).toLocaleString()
                    : "Chưa đăng nhập"}
                </td>

                <td>

                  <button
                    style={btn}
                    onClick={() => toggleStatus(s._id)}
                  >
                    {s.status === "active" ? "Khoá" : "Mở"}
                  </button>

                  <button
                    style={deleteBtn}
                    onClick={() => deleteUser(s._id)}
                  >
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


/* ================= STYLE ================= */

const card = {
  background: "white",
  padding: 20,
  borderRadius: 8,
  marginTop: 20,
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
};

const filterBar = {
  display: "flex",
  gap: 10,
  marginTop: 15
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

const table = {
  width: "100%",
  borderCollapse: "collapse"
};

const btn = {
  marginRight: 6,
  padding: "6px 10px",
  borderRadius: 6
};

const deleteBtn = {
  background: "#ef4444",
  color: "white",
  padding: "6px 10px",
  borderRadius: 6,
  border: "none",
  cursor: "pointer"
};

const active = {
  background: "#dcfce7",
  padding: "4px 8px",
  borderRadius: 6
};

const inactive = {
  background: "#fee2e2",
  padding: "4px 8px",
  borderRadius: 6
};