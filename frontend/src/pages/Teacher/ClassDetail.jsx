import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function ClassDetail() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [keyword, setKeyword] = useState("");

  // ================= LOAD EXAMS =================
  const loadExams = () => {
    axiosClient
      .get(`/exams/teacher/class/${classId}`)
      .then(res => setExams(res.data))
      .catch(() => alert("Không tải được đề thi"));
  };

  useEffect(() => {
    loadExams();
  }, [classId]);

  // ================= SEARCH =================
  const handleSearch = () => {
    if (!keyword.trim()) {
      loadExams();
      return;
    }

    axiosClient
      .get(`/exams/teacher/search?q=${keyword}`)
      .then(res => {
        const filtered = res.data.filter(
          e => e.class_id === classId
        );
        setExams(filtered);
      })
      .catch(() => alert("Lỗi tìm kiếm"));
  };

  // ================= DELETE =================
  const deleteExam = (examId) => {
    if (!window.confirm("Bạn có chắc muốn xóa đề thi này?")) return;

    axiosClient
      .delete(`/exams/${examId}`)
      .then(() => {
        setExams(exams.filter(e => e._id !== examId));
      })
      .catch(() => alert("Xóa thất bại"));
  };

  // ================= EDIT =================
  const editExam = (exam) => {
    const newName = prompt("Nhập tên đề thi mới:", exam.exam_name);
    if (!newName) return;

    const newDuration = prompt(
      "Nhập thời gian làm bài (phút):",
      exam.duration
    );
    if (!newDuration || isNaN(newDuration)) {
      alert("Thời gian không hợp lệ");
      return;
    }

    axiosClient
      .put(`/exams/${exam._id}`, {
        exam_name: newName,
        duration: Number(newDuration)
      })
      .then(() => {
        setExams(
          exams.map(e =>
            e._id === exam._id
              ? { ...e, exam_name: newName, duration: newDuration }
              : e
          )
        );
      })
      .catch(() => alert("Cập nhật thất bại"));
  };

  return (
    <div style={{ padding: 30 }}>
      {/* HEADER */}
      <div style={{ marginBottom: 30 }}>
        <h2 style={{ marginBottom: 10 }}>📘 Chi tiết lớp</h2>
        <p style={{ color: "#6b7280" }}>
          Tổng số đề thi: <b>{exams.length}</b>
        </p>
      </div>

      {/* SEARCH + CREATE */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 30
        }}
      >
        <div>
          <input
            type="text"
            placeholder="🔍 Tìm đề thi..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{
              padding: 10,
              borderRadius: 10,
              border: "1px solid #ddd",
              width: 250,
              marginRight: 10
            }}
          />
          <button className="btn-primary" onClick={handleSearch}>
            Tìm
          </button>
        </div>

        <button
          onClick={() => navigate(`/teacher/create-exam/${classId}`)}
          style={{
            background: "#10b981",
            color: "white",
            padding: "10px 20px",
            borderRadius: 10,
            border: "none",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          ➕ Tạo đề thi
        </button>
      </div>

      {/* EMPTY STATE */}
      {exams.length === 0 && (
        <div
          style={{
            background: "#f3f4f6",
            padding: 30,
            borderRadius: 12,
            textAlign: "center",
            color: "#6b7280"
          }}
        >
          📭 Chưa có đề thi nào
        </div>
      )}

      {/* CARD GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
          gap: 20
        }}
      >
        {exams.map((e) => (
          <div
            key={e._id}
            style={{
              background: "white",
              padding: 20,
              borderRadius: 16,
              boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
              transition: "0.2s"
            }}
            onMouseEnter={(ev) =>
              (ev.currentTarget.style.transform = "translateY(-4px)")
            }
            onMouseLeave={(ev) =>
              (ev.currentTarget.style.transform = "translateY(0px)")
            }
          >
            <h3 style={{ marginBottom: 10 }}>
              📄 {e.exam_name}
            </h3>

            <p style={{ color: "#6b7280", marginBottom: 15 }}>
              ⏱ Thời gian: {e.duration} phút
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between"
              }}
            >
              <button
                className="btn-primary"
                onClick={() =>
                  navigate(`/teacher/exams/${e._id}`)
                }
              >
                📋 Câu hỏi
              </button>

              <button
                className="btn-warning"
                onClick={() => editExam(e)}
              >
                ✏️ Sửa
              </button>

              <button
                className="btn-danger"
                onClick={() => deleteExam(e._id)}
              >
                🗑 Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
      <style>{`
  .btn-primary {
    background: #6366f1;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: 0.2s;
  }

  .btn-primary:hover {
    background: #4f46e5;
  }

  .btn-warning {
    background: #f59e0b;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: 0.2s;
  }

  .btn-warning:hover {
    background: #d97706;
  }

  .btn-danger {
    background: #ef4444;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: 0.2s;
  }

  .btn-danger:hover {
    background: #dc2626;
  }
`}</style>
    </div>
  );
}