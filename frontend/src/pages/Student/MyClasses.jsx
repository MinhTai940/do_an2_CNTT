import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

export default function StudentClasses() {

  const [classes, setClasses] = useState([]);
  const [classCode, setClassCode] = useState("");
  const navigate = useNavigate();

  const loadClasses = () => {
    axiosClient
      .get("/classes/student/me")
      .then(res => setClasses(res.data))
      .catch(() => alert("Không tải được lớp"));
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const joinClass = () => {

    if (!classCode) {
      alert("Vui lòng nhập mã lớp");
      return;
    }

    axiosClient
      .post("/classes/join", { class_code: classCode })
      .then(() => {
        alert("Tham gia lớp thành công");
        setClassCode("");
        loadClasses();
      })
      .catch(err => {
        alert(err.response?.data?.message || "Join thất bại");
      });
  };

  return (
    <div>

      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 30
        }}
      >

        <h2>📘 Lớp của tôi</h2>

        {/* JOIN CLASS */}
        <div style={{ display: "flex", gap: 10 }}>

          <input
            placeholder="Nhập mã lớp..."
            value={classCode}
            onChange={(e) => setClassCode(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #ccc"
            }}
          />

          <button
            onClick={joinClass}
            style={{
              background: "#3b82f6",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: 8,
              cursor: "pointer"
            }}
          >
            Join
          </button>

        </div>

      </div>

      {/* DANH SÁCH LỚP */}

      {classes.length === 0 && (
        <p>Chưa tham gia lớp nào</p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
          gap: 20
        }}
      >

        {classes.map(c => (

          <div
            key={c._id}
            style={{
              background: "white",
              padding: 20,
              borderRadius: 10,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}
          >

            <h3>📘 {c.class_name}</h3>

            <p style={{ color: "#555" }}>
              Môn: {c.subject}
            </p>

            <button
              onClick={() => navigate(`/student/classes/${c._id}/exams`)}
              style={{
                background: "#10b981",
                color: "white",
                border: "none",
                padding: "8px 14px",
                borderRadius: 6,
                cursor: "pointer"
              }}
            >
              Xem đề thi
            </button>

          </div>

        ))}

      </div>

    </div>
  );
}