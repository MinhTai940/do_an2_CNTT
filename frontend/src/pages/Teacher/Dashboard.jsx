import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { Line, Pie, Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function TeacherDashboard() {
  const [summary, setSummary] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [results, setResults] = useState([]);
  const [onlyCheaters, setOnlyCheaters] = useState(false);

  /* ================= LOAD SUMMARY ================= */
  useEffect(() => {
    axiosClient.get("/reports/teacher/summary")
      .then(res => setSummary(res.data))
      .catch(() => alert("Không tải được dashboard"));
  }, []);

  /* ================= LOAD CLASSES ================= */
  useEffect(() => {
    axiosClient.get("/classes/teacher/me")
      .then(res => setClasses(res.data))
      .catch(() => alert("Không tải được lớp"));
  }, []);

  /* ================= LOAD CLASS REPORT ================= */
  useEffect(() => {
    if (!selectedClass) return;

    axiosClient
      .get(`/reports/class/${selectedClass}`)
      .then(res => setResults(res.data.results || []))
      .catch(() => alert("Không tải được dữ liệu lớp"));
  }, [selectedClass]);

  if (!summary) return <p style={{ padding: 30 }}>⏳ Đang tải...</p>;

  /* ================= FILTER ================= */
  const filteredResults = onlyCheaters
    ? results.filter(r => r.cheat_total > 0)
    : results;

  /* ================= TOP 3 ================= */
  const top3 = [...results]
    .sort((a, b) => b.point - a.point)
    .slice(0, 3);

 
  /* ================= DONUT CHART ================= */

const total = results.length;

const cheatCount = results.filter(r => r.cheat_total > 0).length;
const passCount = total - cheatCount;

const cheatPercent = total > 0
  ? ((cheatCount / total) * 100).toFixed(1)
  : 0;

const passPercent = total > 0
  ? ((passCount / total) * 100).toFixed(1)
  : 0;

const donutData = {
  labels: ["Đạt", "Gian lận"],
  datasets: [
    {
      data: [passCount, cheatCount],
      backgroundColor: ["#22c55e", "#ef4444"],
      borderWidth: 0
    }
  ]
};

const donutOptions = {
  cutout: "65%",
  plugins: {
    legend: {
      display: false
    }
  }
};
/* ================= LINE CHART THEO TUẦN ================= */

function getISOWeek(date) {
  const temp = new Date(date.valueOf());
  const dayNum = (date.getDay() + 6) % 7;
  temp.setDate(temp.getDate() - dayNum + 3);
  const firstThursday = temp.valueOf();
  temp.setMonth(0, 1);
  if (temp.getDay() !== 4) {
    temp.setMonth(0, 1 + ((4 - temp.getDay() + 7) % 7));
  }
  const weekNumber = 1 + Math.ceil((firstThursday - temp) / 604800000);
  return `${date.getFullYear()}-W${weekNumber}`;
}

const cheatByWeek = {};

results.forEach(r => {
  if (!r.submitted_at) return;

  const date = new Date(r.submitted_at);
  const weekKey = getISOWeek(date);

  if (!cheatByWeek[weekKey]) cheatByWeek[weekKey] = 0;

  if (r.cheat_total > 0) cheatByWeek[weekKey]++;
});

/* SORT tuần tăng dần */
const sortedWeeks = Object.keys(cheatByWeek).sort();

const lineData = {
  labels: sortedWeeks,
  datasets: [
    {
      label: "Số sinh viên gian lận",
      data: sortedWeeks.map(w => cheatByWeek[w]),
      borderColor: "#ef4444",
      backgroundColor: "#ef4444",
      tension: 0.3,
      fill: false
    }
  ]
};
/* ================= PHÂN LOẠI GIAN LẬN ================= */

const cheatTypes = {
  copy: 0,
  fullscreen_exit: 0,
  ai_detected: 0,
  tab_switch: 0
};

results.forEach(r => {
  Object.entries(r.cheats || {}).forEach(([type, count]) => {
    if (cheatTypes[type] !== undefined) {
      cheatTypes[type] += count;
    }
  });
});

const cheatTypeData = {
  labels: [
    "Copy",
    "Thoát fullscreen",
    "AI phát hiện",
    "Chuyển tab"
  ],
  datasets: [
    {
      label: "Số lần vi phạm",
      data: [
        cheatTypes.copy,
        cheatTypes.fullscreen_exit,
        cheatTypes.ai_detected,
        cheatTypes.tab_switch
      ],
      backgroundColor: [
        "#f59e0b",
        "#ef4444",
        "#6366f1",
        "#10b981"
      ]
    }
  ]
};

  return (
    <div style={{ padding: 30 }}>
      <h2 style={{ marginBottom: 30 }}>📊 Dashboard giáo viên</h2>

      {/* ================= SUMMARY CARDS ================= */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
          gap: 20,
          marginBottom: 40
        }}
      >
        <StatCard icon="📚" label="Số lớp" value={summary.classes} />
        <StatCard icon="📝" label="Số đề thi" value={summary.exams} />
        <StatCard icon="❓" label="Số câu hỏi" value={summary.questions} />
      </div>

      {/* ================= CLASS FILTER ================= */}
      <div style={{ marginBottom: 30 }}>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          style={{
            padding: 8,
            borderRadius: 6,
            border: "1px solid #ddd",
            minWidth: 250
          }}
        >
          <option value="">-- Chọn lớp để phân tích --</option>
          {classes.map(c => (
            <option key={c._id} value={c._id}>
              {c.class_name}
            </option>
          ))}
        </select>

        <label style={{ marginLeft: 20 }}>
          <input
            type="checkbox"
            checked={onlyCheaters}
            onChange={() => setOnlyCheaters(!onlyCheaters)}
          />
          🔍 Chỉ xem SV gian lận
        </label>
      </div>

      {selectedClass && (
        <>
          {/* ================= DONUT ================= */}
<div style={{ marginBottom: 60 }}>
  <h3>🥧 Tỷ lệ đạt & gian lận</h3>

  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 60,
      marginTop: 20
    }}
  >
    {/* DONUT */}
    <div style={{ position: "relative", width: 300, height: 300 }}>
      <Doughnut data={donutData} options={donutOptions} />

      {/* TEXT GIỮA DONUT */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center"
        }}
      >
        <h2 style={{ margin: 0, color: "#ef4444" }}>
          {cheatPercent}%
        </h2>
        <p style={{ margin: 0, fontSize: 14 }}>
          Gian lận
        </p>
      </div>
    </div>

    {/* BẢNG THỐNG KÊ BÊN PHẢI */}
    <div style={{ fontSize: 16 }}>
      <div style={{ marginBottom: 15 }}>
        <span style={{ color: "#22c55e", fontWeight: 600 }}>
          ● Đạt:
        </span>{" "}
        {passPercent}% ({passCount} SV)
      </div>

      <div style={{ marginBottom: 15 }}>
        <span style={{ color: "#ef4444", fontWeight: 600 }}>
          ● Gian lận:
        </span>{" "}
        {cheatPercent}% ({cheatCount} SV)
      </div>

      <div style={{ color: "#6b7280" }}>
        Tổng sinh viên: {total}
      </div>
    </div>
  </div>
</div>

          {/* LINE */}
          <div style={{ marginBottom: 50 }}>
            <h3>📈 Xu hướng gian lận theo thời gian</h3>
            <Line data={lineData} />
          </div>

          {/* BAR PHÂN LOẠI */}
          <div style={{ marginTop: 60 }}>
            <h3>📊 Phân loại gian lận</h3>
            <Bar data={cheatTypeData} />
          </div>

          {/* TOP 3 */}
          <div>
            <h3>🎯 Top 3 sinh viên cao điểm</h3>

            <div style={{ display: "flex", gap: 20 }}>
              {top3.map((s, i) => (
                <div
                  key={i}
                  style={{
                    background: "white",
                    padding: 20,
                    borderRadius: 12,
                    boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
                    flex: 1
                  }}
                >
                  <h4>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"} {s.student_name}
                  </h4>
                  <p>⭐ Điểm: {s.point}</p>
                  <p>🚨 Vi phạm: {s.cheat_total}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ================= SMALL COMPONENT ================= */

function StatCard({ icon, label, value }) {
  return (
    <div
      style={{
        background: "white",
        padding: 20,
        borderRadius: 16,
        boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
        textAlign: "center"
      }}
    >
      <div style={{ fontSize: 28 }}>{icon}</div>
      <h2 style={{ margin: "10px 0" }}>{value}</h2>
      <p style={{ color: "#6b7280", margin: 0 }}>{label}</p>
    </div>
  );
}