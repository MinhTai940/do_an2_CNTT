import { useState } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

export default function CreateExam() {
  const { classId } = useParams();

  const [examName, setExamName] = useState("");
  const [duration, setDuration] = useState("");
  const [mode, setMode] = useState("easy");
  const [closeTime, setCloseTime] = useState("");
  const [createdExamId, setCreatedExamId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState("");

  const handleCreateExam = async () => {
    if (!examName || !duration) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);

      const res = await axiosClient.post("/exams/create", {
        exam_name: examName,
        duration: Number(duration),
        class_id: classId,
        mode,
        start_time: startTime,
        close_time: closeTime || null,
      });

      setCreatedExamId(res.data.exam_id);
      alert("✅ Tạo đề thành công!");
    } catch {
      alert("❌ Tạo đề thất bại");
    } finally {
      setLoading(false);
    }
  };

  const uploadWord = async (e) => {
    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    try {
      const res = await axiosClient.post(
        `/exams/upload-word/${createdExamId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert(`✅ Upload thành công ${res.data.total_questions} câu`);
    } catch {
      alert("❌ Upload thất bại");
    }
  };

  return (
    <div className="create-exam-container">
      <style>{`
        .create-exam-container {
          padding: 40px;
          background: #f3f4f6;
          min-height: 100vh;
          background: transparent; /* hoặc xóa luôn dòng background */
        }

        .create-title {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 25px;
        }

        .exam-card {
          background: white;
          padding: 30px;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          margin-bottom: 30px;
          max-width: 900px;
        }

        .exam-card h3 {
          margin-bottom: 20px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .full-width {
          grid-column: span 1;
        }

        .form-group label {
          font-weight: 500;
          margin-bottom: 6px;
          display: block;
        }

        .form-group input {
          width: 100%;
          padding: 10px;
          border-radius: 10px;
          border: 1px solid #ddd;
          transition: 0.3s;
        }

        .form-group input:focus {
          border-color: #7c3aed;
          outline: none;
          box-shadow: 0 0 0 2px rgba(124,58,237,0.2);
        }

        .mode-buttons {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }

        .mode-buttons button {
          padding: 8px 14px;
          border-radius: 10px;
          border: 1px solid #ddd;
          background: white;
          cursor: pointer;
          transition: 0.3s;
        }

        .mode-buttons button:hover {
          transform: translateY(-2px);
        }

        .active.easy {
          background: #16a34a;
          color: white;
          border-color: #16a34a;
        }

        .active.medium {
          background: #f59e0b;
          color: white;
          border-color: #f59e0b;
        }

        .active.strict {
          background: #ef4444;
          color: white;
          border-color: #ef4444;
        }

        .mode-description {
          margin-top: 10px;
          font-size: 14px;
        }

        .danger {
          color: #dc2626;
          font-weight: 500;
        }

        .btn-wrapper {
          text-align: right;
          margin-top: 25px;
        }

        .create-btn {
          padding: 12px 30px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(90deg, #7c3aed, #4f46e5);
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: 0.3s;
        }

        .create-btn:hover {
          transform: scale(1.05);
        }

        .create-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>

      <h2 className="create-title">📄 Tạo đề thi</h2>

      <div className="exam-card">
        <h3>📝 Bước 1: Nhập thông tin đề</h3>

        <div className="form-grid">
          <div className="form-group">
            <label>Tên đề thi</label>
            <input
              type="text"
              placeholder="VD: Kiểm tra giữa kỳ"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Thời gian (phút)</label>
            <input
              type="number"
              placeholder="VD: 45"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          {/* Thời gian mở đề */}
<div className="form-group full-width">
  <label>🕒 Thời gian mở đề</label>
  <input
    type="datetime-local"
    value={startTime}
    onChange={(e) => setStartTime(e.target.value)}
  />
</div>

{/* Thời gian đóng đề */}
<div className="form-group full-width">
  <label>⏰ Thời gian đóng đề</label>
  <input
    type="datetime-local"
    value={closeTime}
    onChange={(e) => setCloseTime(e.target.value)}
  />
</div>

          <div className="form-group full-width">
            <label>Chế độ thi</label>

            <div className="mode-buttons">
              <button
                className={mode === "easy" ? "active easy" : ""}
                onClick={() => setMode("easy")}
              >
                🟢 Đơn giản
              </button>

              <button
                className={mode === "medium" ? "active medium" : ""}
                onClick={() => setMode("medium")}
              >
                🟡 Trung bình
              </button>

              <button
                className={mode === "strict" ? "active strict" : ""}
                onClick={() => setMode("strict")}
              >
                🔴 Nghiêm ngặt
              </button>
            </div>

            <div className="mode-description">
              {mode === "easy" && (
                <p>✔ Không chống gian lận. Xem đáp án sau khi nộp.</p>
              )}
              {mode === "medium" && (
                <p>⚠ Chống gian lận cơ bản. Vẫn xem đáp án.</p>
              )}
              {mode === "strict" && (
                <p className="danger">
                  ❌ Chống gian lận đầy đủ. Không xem đáp án sau khi nộp.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="btn-wrapper">
          <button
            className="create-btn"
            onClick={handleCreateExam}
            disabled={loading}
          >
            {loading ? "Đang tạo..." : "🚀 Tạo đề"}
          </button>
        </div>
      </div>

      {createdExamId && (
        <div className="exam-card">
          <h3>📂 Bước 2: Upload file Word</h3>
          <input type="file" accept=".docx" onChange={uploadWord} />
        </div>
      )}
    </div>
  );
}