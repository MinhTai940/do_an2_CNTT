import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function MyClasses() {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    axiosClient
      .get("/classes/student/me")
      .then(res => setClasses(res.data))
      .catch(() => alert("Không tải được danh sách lớp"));
  }, []);

  return (
    <div>
      <h2>Lớp học của tôi</h2>

      {classes.length === 0 && <p>Bạn chưa tham gia lớp nào</p>}

      <ul>
        {classes.map((c, index) => (
          <li key={index}>
            <b>{c.class_name}</b> – {c.subject}
          </li>
        ))}
      </ul>
    </div>
  );
}
