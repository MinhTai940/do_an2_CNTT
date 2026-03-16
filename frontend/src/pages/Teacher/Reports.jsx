import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function Reports() {
  const { examId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!examId) return;

    axiosClient
      .get(`/reports/exam/${examId}/summary`)
      .then(res => setData(res.data))
      .catch(() => alert("Không tải được thống kê"))
      .finally(() => setLoading(false));
  }, [examId]);

  if (loading) return <p style={{ padding: 30 }}>⏳ Đang tải thống kê...</p>;
  if (!data) return <p style={{ padding: 30 }}>❌ Không có dữ liệu</p>;
  if (!data.results || data.results.length === 0)
    return <p style={{ padding: 30 }}>📭 Chưa có sinh viên làm bài thi này</p>;

  const totalStudents = data.total_students;

  const validResults = data.results.filter(r => !r.is_cancelled);

  const avgScore =
    validResults.length > 0
      ? (
          validResults.reduce((sum, r) => sum + r.point, 0) /
          validResults.length
        ).toFixed(2)
      : 0;

  const cheatStudents = data.results.filter(
    r => Object.keys(r.cheats || {}).length > 0
  ).length;

  const formatTime = (isoString) => {
    if (!isoString) return "—";
    return new Date(isoString).toLocaleString("vi-VN");
  };

  return (
    <div style={{ padding: 30 }}>
      <h2 style={{ marginBottom: 30 }}>📊 Thống kê bài thi</h2>

      {/* ===== DASHBOARD CARDS ===== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: 20,
          marginBottom: 40
        }}
      >
        <StatCard icon="👨‍🎓" label="Sinh viên" value={totalStudents} />
        <StatCard icon="⭐" label="Điểm TB" value={avgScore} />
        <StatCard icon="🚨" label="SV gian lận" value={cheatStudents} />
      </div>

      {/* ===== STUDENT CARDS ===== */}
      <div style={{ display: "grid", gap: 20 }}>
        {data.results.map((r, index) => (
          <div
            key={index}
            style={{
              background: "white",
              padding: 20,
              borderRadius: 16,
              boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
              border: r.is_cancelled
                ? "2px solid #ef4444"
                : "1px solid #e5e7eb"
            }}
          >
            {/* HEADER */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                marginBottom: 10
              }}
            >
              <div>
                <h3 style={{ margin: 0 }}>
                  👤 {r.student_name}
                </h3>
                <p style={{ margin: 0, color: "#6b7280" }}>
                  MSSV: {r.student_code || "—"}
                </p>
              </div>

              <div>
                {r.is_cancelled ? (
                  <Badge text="❌ Bị huỷ" color="#dc2626" bg="#fee2e2" />
                ) : Object.keys(r.cheats || {}).length > 0 ? (
                  <Badge text="⚠ Có vi phạm" color="#d97706" bg="#fef3c7" />
                ) : (
                  <Badge text="✅ Đạt" color="#16a34a" bg="#dcfce7" />
                )}
              </div>
            </div>

            {/* SCORE */}
            {!r.is_cancelled && (
              <p style={{ fontSize: 16, marginBottom: 10 }}>
                ⭐ Điểm: <b>{r.point}</b> / 10
              </p>
            )}

            {/* CHEAT DETAILS */}
            {Object.keys(r.cheats || {}).length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <p style={{ fontWeight: "bold", marginBottom: 5 }}>
                  🚨 Chi tiết vi phạm:
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {Object.entries(r.cheats).map(([type, count]) => (
                    <span
                      key={type}
                      style={{
                        background: "#fee2e2",
                        color: "#dc2626",
                        padding: "4px 10px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: "bold"
                      }}
                    >
                      {type} ({count})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* TIME */}
            <p style={{ color: "#6b7280" }}>
              🕒 {formatTime(r.submitted_at)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== SMALL COMPONENTS ===== */

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

function Badge({ text, color, bg }) {
  return (
    <span
      style={{
        background: bg,
        color: color,
        padding: "6px 12px",
        borderRadius: 20,
        fontWeight: "bold",
        fontSize: 13
      }}
    >
      {text}
    </span>
  );
}