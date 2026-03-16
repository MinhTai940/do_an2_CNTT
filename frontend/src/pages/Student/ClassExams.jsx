import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function ClassExams() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient
      .get(`/exams/student/class/${classId}`)
      .then(res => setExams(res.data))
      .catch(() => alert("Không tải được đề thi"))
      .finally(() => setLoading(false));
  }, [classId]);

  return (
    <div>
      <h2>Danh sách đề thi</h2>

      {loading && <p>Đang tải...</p>}

      {!loading && exams.length === 0 && (
        <p>Chưa có đề thi</p>
      )}

      <ul style={{ listStyle: "none", padding: 0 }}>
  {exams.map(e => (
    <li
      key={e._id}
      style={{
        background: "white",
        padding: 20,
        borderRadius: 12,
        boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
        marginBottom: 20
      }}
    >
      <h3 style={{ margin: 0 }}>
        📘 {e.exam_name}
      </h3>

      <p style={{ margin: "5px 0", color: "#555" }}>
        ⏱ {e.duration} phút
      </p>

      {/* 🔥 HIỂN THỊ THỜI GIAN ĐÓNG */}
      {e.close_time && (
        <p style={{ fontSize: 13, color: "#6b7280", margin: "5px 0" }}>
          ⏰ Đóng lúc: {new Date(e.close_time).toLocaleString()}
        </p>
      )}

      {/* 🔥 TRẠNG THÁI */}
      <div style={{ margin: "8px 0" }}>
        {e.is_closed ? (
          <span style={{ color: "red", fontWeight: 600 }}>
            🔴 Đã đóng
          </span>
        ) : (
          <span style={{ color: "green", fontWeight: 600 }}>
            🟢 Đang mở
          </span>
        )}
      </div>

      {/* 🔥 NÚT LÀM BÀI */}
      <button
        disabled={e.is_closed}
        style={{
          background: e.is_closed ? "#ccc" : "#6366f1",
          color: "white",
          border: "none",
          padding: "8px 14px",
          borderRadius: 8,
          cursor: e.is_closed ? "not-allowed" : "pointer",
          fontWeight: 500
        }}
        onClick={() => navigate(`/student/exams/${e._id}`)}
      >
        📝 Làm bài
      </button>
    </li>
  ))}
</ul>
    </div>
  );
}
