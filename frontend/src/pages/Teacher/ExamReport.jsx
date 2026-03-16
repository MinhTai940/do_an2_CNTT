import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function ExamReport() {
  const { examId } = useParams();
  const navigate = useNavigate();   // 👈 THÊM DÒNG NÀY
  const [summary, setSummary] = useState(null);
  const [results, setResults] = useState([]);

  useEffect(() => {
    axiosClient
      .get(`/reports/exam/${examId}/summary`)
      .then(res => {
        setSummary(res.data);
        setResults(res.data.results || []);
      });
  }, [examId]);

  if (!summary) return <p>Đang tải...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>📊 Thống kê đề thi</h2>
      <button
      style={{
        background: "#dc2626",
        color: "#fff",
        padding: "6px 12px",
        border: "none",
        borderRadius: 4,
        cursor: "pointer",
        marginBottom: 10
      }}
      onClick={() => navigate(`/teacher/exams/${examId}/cheat`)}
    >
      🚨 Xem gian lận
    </button>
      <p>👨‍🎓 Số học sinh làm bài: {summary.total_students}</p>

      <h3>Kết quả chi tiết</h3>

      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Học sinh</th>
            <th>Điểm</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => (
            <tr key={i}>
              <td>
              <b>{r.student_name}</b>
              <br />
              <small>{r.student_code}</small>
              </td>
              <td>{r.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
