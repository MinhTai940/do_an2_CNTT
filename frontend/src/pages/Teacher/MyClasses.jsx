import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function MyClasses() {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    axiosClient
      .get("/classes/teacher/me")
      .then(res => setClasses(res.data))
      .catch(() => alert("Không tải được lớp"));
  }, []);

  return (
    <div>
      <h2>Lớp tôi phụ trách</h2>

      {classes.length === 0 && <p>Chưa tạo lớp nào</p>}

      <ul>
        {classes.map((c, i) => (
          <li key={i}>
            <b>{c.class_name}</b> – {c.subject}
          </li>
        ))}
      </ul>
    </div>
  );
}
