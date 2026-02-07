import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function ExamDetail() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!examId) return;

    axiosClient
      .get(`/questions/exam/${examId}/teacher`) // ✅ ĐÚNG API CHO GIÁO VIÊN
      .then(res => setQuestions(res.data))
      .catch(() => alert("Không tải được câu hỏi"))
      .finally(() => setLoading(false));
  }, [examId]);

  return (
    <div>
      <h2>Chi tiết đề thi</h2>

      <button
        onClick={() =>
          navigate(`/teacher/exams/${examId}/create-question`)
        }
      >
        ➕ Tạo câu hỏi
      </button>

      <h3>Danh sách câu hỏi</h3>

      {loading && <p>Đang tải câu hỏi...</p>}

      {!loading && questions.length === 0 && (
        <p>Chưa có câu hỏi</p>
      )}

      <ol>
        {questions.map((q, index) => (
          <li key={q._id || index}>
            <b>{q.content}</b>
            <ul>
              {q.options.map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
