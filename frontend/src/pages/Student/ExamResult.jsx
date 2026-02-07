import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function ExamResult() {
  const { examId } = useParams();
  const [result, setResult] = useState(null);

  useEffect(() => {
    axiosClient.get(`/results/student/exam/${examId}`)
      .then(res => setResult(res.data))
      .catch(() => alert("Không tải được kết quả"));
  }, [examId]);

  if (!result) return <p>Đang tải...</p>;

  return (
    <div>
      <h2>📊 Kết quả bài thi</h2>
      <p>Điểm: <b>{result.score}</b></p>
      <p>Số câu đúng: {result.correct}/{result.total}</p>
    </div>
  );
}
