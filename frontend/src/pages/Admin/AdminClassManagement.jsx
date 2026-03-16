import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

export default function AdminClassManagement() {

  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [search, setSearch] = useState("");
  const [teacherFilter, setTeacherFilter] = useState("");

  // ================= LOAD CLASSES =================

  const loadClasses = () => {

    axiosClient.get("/admin/classes", {
      params: {
        search: search,
        teacher_id: teacherFilter
      }
    })
      .then(res => setClasses(res.data))
      .catch(() => alert("Không tải được lớp"));

  };

  // ================= LOAD TEACHERS =================

  const loadTeachers = () => {

    axiosClient.get("/admin/teachers/simple")
      .then(res => setTeachers(res.data))
      .catch(() => alert("Không tải được giáo viên"));

  };

  useEffect(() => {

    loadClasses();
    loadTeachers();

  }, []);


  return (

    <div style={{ padding: 30 }}>

      <h2>🏫 Quản lý lớp học</h2>

      {/* ================= FILTER BAR ================= */}

      <div style={filterBar}>

        <input
          style={input}
          placeholder="🔍 Tìm lớp / môn học / giáo viên..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          style={input}
          value={teacherFilter}
          onChange={(e) => setTeacherFilter(e.target.value)}
        >

          <option value="">👨‍🏫 Tất cả giáo viên</option>

          {teachers.map(t => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}

        </select>

        <button
          style={primaryBtn}
          onClick={loadClasses}
        >
          Lọc
        </button>

      </div>


      {/* ================= TABLE ================= */}

      <div style={card}>

        <table style={table}>

          <thead>
            <tr>
              <th>Tên lớp</th>
              <th>Môn học</th>
              <th>Giảng viên</th>
              <th>Số SV</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>

            {classes.map(c => (
              <tr key={c._id}>

                <td>{c.class_name}</td>

                <td>{c.subject}</td>

                <td>{c.teacher_name}</td>

                <td>{c.student_count}</td>

                <td>
                  {c.status === "active"
                    ? <span style={active}>🟢 Hoạt động</span>
                    : <span style={inactive}>🔴 Khoá</span>}
                </td>

                <td>

                  <button
                    style={viewBtn}
                    onClick={() => navigate(`/admin/classes/${c._id}`)}
                  >
                    👁 Xem chi tiết
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

const filterBar = {
  display: "flex",
  gap: 10,
  marginTop: 20,
  marginBottom: 20
}

const input = {
  padding: 8,
  borderRadius: 6,
  border: "1px solid #ddd",
  width: 220
}

const primaryBtn = {
  padding: "8px 16px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer"
}

const card = {
  background: "white",
  padding: 20,
  borderRadius: 8,
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
}

const table = {
  width: "100%",
  borderCollapse: "collapse"
}

const active = {
  background: "#dcfce7",
  padding: "4px 8px",
  borderRadius: 6
}

const inactive = {
  background: "#fee2e2",
  padding: "4px 8px",
  borderRadius: 6
}

const viewBtn = {
  padding: "6px 12px",
  borderRadius: 6,
  background: "#6366f1",
  color: "white",
  border: "none",
  cursor: "pointer"
}