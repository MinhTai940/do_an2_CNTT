import { useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function Reports() {
  const [examId, setExamId] = useState("");
  const [data, setData] = useState(null);

  const loadReport = async () => {
    const res = await axiosClient.get(`/reports/exam/${examId}/summary`);
    setData(res.data);
  };

  return (
    <div>
      <h2>📈 Thống kê bài thi</h2>

      <input
        placeholder="Nhập Exam ID"
        value={examId}
        onChange={e => setExamId(e.target.value)}
      />
      <button onClick={loadReport}>Xem</button>

      {data && (
        <>
          <p>Số SV: {data.total_students}</p>
          <ul>
            {data.results.map((r, i) => (
              <li key={i}>
                {r.student_id} – {r.score}/{r.total}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
