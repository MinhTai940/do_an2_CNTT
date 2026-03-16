import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function StudentExamReview() {

  const { examId } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {

    axiosClient
      .get(`/results/student/review/${examId}`)
      .then(res => setData(res.data))
      .catch(() => alert("Không tải được chi tiết"));

  }, [examId]);

  if (!data) return <p>⏳ Đang tải...</p>;

  const correct = data.score;
  const wrong = data.total - data.score;
  const point = ((data.score / data.total) * 10).toFixed(1);

  return (

    <div style={{ padding: 25 }}>

      <h2>📄 Xem lại bài thi</h2>


      {/* ===== SUMMARY ===== */}

      <div style={{
        marginTop: 15,
        marginBottom: 25,
        padding: 20,
        background: "#eef2f7",
        borderRadius: 12
      }}>

        <p>🎯 Điểm: <b>{point}/10</b></p>

        <p>✅ Câu đúng: <b>{correct}</b></p>

        <p>❌ Câu sai: <b>{wrong}</b></p>

      </div>


      {/* ===== QUESTIONS ===== */}

      {data.questions.map((q, index) => (

        <div
          key={q.question_id}
          style={{
            marginBottom: 20,
            padding: 20,
            border: "1px solid #ddd",
            borderRadius: 10,
            background: "white"
          }}
        >

          <p style={{ marginBottom: 10 }}>
            <b>Câu {index + 1}:</b> {q.content}
          </p>


          {q.options.map((opt, i) => {

            const isCorrect = i === q.correct_index;
            const isChosen = i === q.student_answer;

            let bg = "#f9fafb";

            if (isCorrect) bg = "#dcfce7";
            if (isChosen && !isCorrect) bg = "#fee2e2";

            return (

              <div
                key={i}
                style={{
                  padding: 10,
                  marginBottom: 6,
                  borderRadius: 6,
                  background: bg,
                  border: "1px solid #eee"
                }}
              >

                {opt}

                {isCorrect && (
                  <span style={{
                    color: "green",
                    marginLeft: 8,
                    fontWeight: "bold"
                  }}>
                    ✅ Đáp án đúng
                  </span>
                )}

                {isChosen && !isCorrect && (
                  <span style={{
                    color: "red",
                    marginLeft: 8,
                    fontWeight: "bold"
                  }}>
                    ❌ Bạn chọn
                  </span>
                )}

              </div>

            );

          })}

        </div>

      ))}

    </div>

  );

}