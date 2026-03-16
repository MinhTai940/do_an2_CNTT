import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function ExamsByClass() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);

  useEffect(() => {
    axiosClient
      .get(`/exams/teacher/class/${classId}`)
      .then(res => setExams(res.data))
      .catch(() => alert("Không tải được danh sách bài thi"));
  }, [classId]);

  const getModeStyle = (mode) => {
    switch (mode) {
      case "strict":
        return { background: "#fee2e2", color: "#dc2626" };
      case "medium":
        return { background: "#fef9c3", color: "#ca8a04" };
      default:
        return { background: "#dcfce7", color: "#16a34a" };
    }
  };

  const translateMode = (mode) => {
    switch (mode) {
      case "strict":
        return "🔒 Nghiêm ngặt";
      case "medium":
        return "⚠ Trung bình";
      default:
        return "😊 Dễ";
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h2 style={{ marginBottom: 30 }}>📄 Danh sách bài thi</h2>

      {exams.length === 0 ? (
        <p style={{ color: "#6b7280" }}>Chưa có bài thi</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 20
          }}
        >
          {exams.map(exam => (
            <div
              key={exam._id}
              style={{
                background: "white",
                padding: 20,
                borderRadius: 16,
                boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
                transition: "0.2s",
                border: "1px solid #f3f4f6"
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-4px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              {/* Tên bài thi */}
              <h3 style={{ marginBottom: 10 }}>
                📘 {exam.exam_name}
              </h3>

              {/* Thời gian */}
              <p style={{ marginBottom: 8 }}>
                ⏱ {exam.duration} phút
              </p>

              {/* Mode */}
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 12px",
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: "bold",
                  marginBottom: 15,
                  ...getModeStyle(exam.mode)
                }}
              >
                {translateMode(exam.mode)}
              </div>

              {/* Button */}
              <button
                onClick={() =>
                  navigate(`/teacher/reports/${exam._id}`)
                }
                style={{
                  width: "100%",
                  padding: 10,
                  borderRadius: 8,
                  border: "none",
                  background: "linear-gradient(135deg,#2563eb,#7c3aed)",
                  color: "white",
                  fontWeight: "bold",
                  cursor: "pointer",
                  marginTop: 10
                }}
              >
                📊 Xem thống kê
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}