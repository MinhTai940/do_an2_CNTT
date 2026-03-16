import { useEffect, useState } from "react"
import axiosClient from "../../api/axiosClient"
import { Bar, Doughnut } from "react-chartjs-2"
import ChartDataLabels from "chartjs-plugin-datalabels"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  ChartDataLabels
)

export default function StudentDashboard() {

  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedDate, setSelectedDate] = useState("")

  const [results, setResults] = useState([])
  const [bestSubject, setBestSubject] = useState(null)

  /* LOAD CLASSES */

  useEffect(() => {

    axiosClient.get("/classes/student/me")
      .then(res => setClasses(res.data || []))
      .catch(() => alert("Không tải được lớp"))

  }, [])

  /* LOAD DASHBOARD */

  const loadDashboard = () => {

    if (!selectedClass) {
      alert("Vui lòng chọn lớp")
      return
    }

    axiosClient.post("/reports/student/dashboard", {

      class_id: selectedClass,
      date: selectedDate

    })
      .then(res => {

        setResults(res.data.results || [])
        setBestSubject(res.data.best_subject || null)

      })
      .catch(() => alert("Không tải được dữ liệu"))

  }

  /* ================= BAR CHART ================= */

  const subjectScores = {};

  (results || []).forEach(r => {

    if (!r.subject) return

    if (!subjectScores[r.subject])
      subjectScores[r.subject] = []

    subjectScores[r.subject].push(r.point || 0)

  })

  const subjects = Object.keys(subjectScores)

  const avgScores = subjects.map(s => {

    const arr = subjectScores[s]

    return (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2)

  })

  const barData = {
    labels: subjects,
    datasets: [
      {
        label: "Điểm trung bình",
        data: avgScores,
        backgroundColor: "#3b82f6"
      }
    ]
  }

  /* ================= PIE CHART ================= */

  const total = results.length

  const cheatCount = results.filter(r => r.cheat_total > 0).length
  const passCount = total - cheatCount

  const donutData = {
    labels: ["Đạt", "Gian lận"],
    datasets: [
      {
        data: [passCount, cheatCount],
        backgroundColor: ["#22c55e", "#ef4444"]
      }
    ]
  }

  return (

    <div style={{ padding: 30 }}>

      <h2 style={{ marginBottom: 30 }}>📊 Dashboard sinh viên</h2>

      {/* FILTER */}

      <div style={{
        display: "flex",
        gap: 15,
        alignItems: "center",
        marginBottom: 30
      }}>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          style={{
            padding: 8,
            borderRadius: 6,
            border: "1px solid #ddd"
          }}
        >

          <option value="">-- Chọn lớp --</option>

          {classes.map(c => (
            <option key={c._id} value={c._id}>
              {c.class_name}
            </option>
          ))}

        </select>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{
            padding: 8,
            borderRadius: 6,
            border: "1px solid #ddd"
          }}
        />

        <button
          onClick={loadDashboard}
          style={{
            padding: "8px 20px",
            border: "none",
            background: "#2563eb",
            color: "white",
            borderRadius: 6,
            cursor: "pointer"
          }}
        >
          Lọc
        </button>

      </div>

      {/* BEST SUBJECT */}

      {bestSubject && (

        <div style={{
          background: "#f0f9ff",
          padding: 15,
          borderRadius: 10,
          marginBottom: 30
        }}>

          🏆 Môn điểm cao nhất: <b>{bestSubject}</b>

        </div>

      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: 40
      }}>

        {/* BAR */}

        <div>

          <h3>📈 Điểm các môn</h3>

          {subjects.length > 0 ? (
            <Bar data={barData} />
          ) : (
            <p>Chưa có dữ liệu</p>
          )}

        </div>

        {/* PIE */}

        <div>

          <h3>🥧 Tỷ lệ đạt & gian lận</h3>

          {total > 0 ? (
            <Doughnut
              data={donutData}
              options={{
                plugins: {
                  legend: {
                    position: "bottom"
                  },
                  datalabels: {
                    color: "#fff",
                    font: {
                      weight: "bold",
                      size: 16
                    },
                    formatter: (value, context) => {

                      const data = context.chart.data.datasets[0].data

                      const total = data.reduce((a, b) => a + b, 0)

                      const percentage = total ? ((value / total) * 100).toFixed(1) : 0

                      return percentage + "%"
                    }
                  }
                }
              }}
            />
          ) : (
            <p>Chưa có dữ liệu</p>
          )}

        </div>

      </div>

    </div>

  )

}