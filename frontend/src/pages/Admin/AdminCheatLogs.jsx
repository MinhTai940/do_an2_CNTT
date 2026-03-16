import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function AdminCheatLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    axiosClient.get("/admin/cheat-logs")
      .then(res => setLogs(res.data))
      .catch(() => alert("Không tải được log"));
  }, []);

  return (
    <div>
      <h2>🚨 Gian lận toàn hệ thống</h2>

      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>Sinh viên</th>
            <th>Đề thi</th>
            <th>Hành vi</th>
            <th>Thời gian</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l, i) => (
            <tr key={i}>
              <td>{l.student_name}</td>
              <td>{l.exam_name}</td>
              <td>{l.action}</td>
              <td>{new Date(l.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}