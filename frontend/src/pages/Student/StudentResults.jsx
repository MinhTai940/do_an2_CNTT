import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { useNavigate } from "react-router-dom";

export default function StudentResults() {

  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {

    axiosClient
      .get("/results/student")
      .then(res => setResults(res.data))
      .catch(() => alert("Không tải được kết quả"));

    axiosClient
      .get("/reports/student/summary")
      .then(res => setSummary(res.data))
      .catch(() => console.log("Không tải được summary"));

  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleString("vi-VN");
  };

  const getModeText = (mode) => {

    if (mode === "strict") return "🔒 Nghiêm ngặt";
    if (mode === "medium") return "⚠️ Trung bình";

    return "🟢 Dễ";
  };

  const getModeColor = (mode) => {

    if (mode === "strict") return "#ef4444";
    if (mode === "medium") return "#f59e0b";

    return "#22c55e";
  };

  return (

    <div style={{ padding: 20 }}>

      <h2>📊 Kết quả bài thi</h2>


      {/* ===== SUMMARY ===== */}

      {summary && (

        <div style={{
          marginTop: 20,
          padding: 20,
          background: "#eef2f7",
          borderRadius: 12
        }}>

          <p>📝 Số bài đã làm: <b>{summary.exams_done}</b></p>

          <p>⭐ Điểm trung bình: <b>{summary.avg_score}</b></p>

        </div>

      )}



      {/* ===== LIST CARD ===== */}

      <div style={{
        marginTop: 25,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))",
        gap: 20
      }}>


        {results.map((r) => {

          const passed = r.score >= r.total * 0.5

          return (

            <div
              key={r._id}
              style={{
                background: "white",
                padding: 20,
                borderRadius: 16,
                boxShadow: "0 6px 16px rgba(0,0,0,0.08)"
              }}
            >

              <h3 style={{ marginBottom: 10 }}>
                📘 {r.exam_title}
              </h3>


              {/* ===== MODE ===== */}

              <p>

                🛡️ Chế độ thi:

                <b style={{
                  marginLeft: 5,
                  color: getModeColor(r.mode)
                }}>

                  {getModeText(r.mode)}

                </b>

              </p>


              <p>🎯 Điểm: <b>{r.point}</b></p>

              <p>✅ Số câu đúng: {r.score}/{r.total}</p>


              {/* ===== STATUS ===== */}

              <p>

                {r.is_cancelled ? (

                  <span style={{ color: "red", fontWeight: "bold" }}>
                    ❌ Bị huỷ do gian lận
                  </span>

                ) : passed ? (

                  <span style={{ color: "green", fontWeight: "bold" }}>
                    🟢 Đạt
                  </span>

                ) : (

                  <span style={{ color: "orange", fontWeight: "bold" }}>
                    🔴 Không đạt
                  </span>

                )}

              </p>


              {/* ===== VIOLATIONS ===== */}

              {r.cheat_count > 0 && (

                <p style={{ fontSize: 13, color: "orange" }}>
                  ⚠️ Vi phạm: {r.cheat_count}
                </p>

              )}


              <p style={{ fontSize: 13, color: "#666" }}>
                ⏰ {formatDate(r.submitted_at)}
              </p>



              {/* ===== BUTTON ===== */}

              {!r.is_cancelled && (

                <button
                  disabled={r.mode === "strict"}
                  onClick={() => navigate(`/student/results/${r.exam_id}`)}
                  style={{
                    marginTop: 10,
                    width: "100%",
                    padding: 10,
                    border: "none",
                    borderRadius: 10,
                    background:
                      r.mode === "strict"
                        ? "#9ca3af"
                        : "linear-gradient(90deg,#4f46e5,#9333ea)",
                    color: "white",
                    cursor:
                      r.mode === "strict"
                        ? "not-allowed"
                        : "pointer",
                    fontWeight: "bold"
                  }}
                >

                  {r.mode === "strict"
                    ? "🔒 Không xem được đáp án"
                    : "📊 Xem chi tiết"}

                </button>

              )}

            </div>

          )

        })}

      </div>

    </div>
  )
}