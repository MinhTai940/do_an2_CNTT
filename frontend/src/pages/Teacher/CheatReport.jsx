import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function CheatReport() {
  const { examId } = useParams();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient
      .get(`/cheat/exam/${examId}`)
      .then(res => setLogs(res.data))
      .catch(() => alert("Không tải được dữ liệu gian lận"))
      .finally(() => setLoading(false));
  }, [examId]);

  if (loading) return <p>⏳ Đang tải dữ liệu...</p>;

  return (
    <div>
      <h2>🚨 Gian lận trong bài thi</h2>

      {logs.length === 0 ? (
        <p>✅ Không có gian lận</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>STT</th>
              <th>Sinh viên</th>
              <th>Hành vi</th>
              <th>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{l.student_id}</td>
                <td>{mapAction(l.action)}</td>
                <td>{new Date(l.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function mapAction(action) {
  const map = {
    tab_switch: "Chuyển tab",
    fullscreen_exit: "Thoát fullscreen",
    copy: "Copy nội dung",
    devtools_open: "Mở DevTools"
  };
  return map[action] || action;
}
