import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axiosClient from "../../api/axiosClient";
import { useCallback } from "react";



const MAX_VIOLATIONS = 5;
const translateViolation = (code) => {
  const map = {
    phone_detected: "Phát hiện sử dụng điện thoại",
    multiple_person: "Có nhiều người trong khung hình",
    no_face: "Không thấy khuôn mặt",
    looking_down: "Nhìn xuống nghi ngờ tài liệu"
  };
  return map[code] || code;
};

export default function DoExam() {
  const { examId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loadedTime, setLoadedTime] = useState(false);
  const [started, setStarted] = useState(false);
  const [violations, setViolations] = useState([]);
  const [mode, setMode] = useState("easy");
  const [resultData, setResultData] = useState(null);
  const [aiWarnings, setAiWarnings] = useState([]);

  const [popupWarning, setPopupWarning] = useState(null);


  const questionRefs = useRef([]);
  const submittedRef = useRef(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);   // 🔥 Lưu camera stream

  /* ================= LOAD ================= */

  useEffect(() => {
    axiosClient
      .get(`/questions/exam/${examId}`)
      .then(res => setQuestions(res.data))
      .catch(() => alert("Không tải được câu hỏi"));
  }, [examId]);

  useEffect(() => {
    axiosClient
      .get(`/exams/student/${examId}`)
      .then(res => {
        setTimeLeft(res.data.duration * 60);
        setMode(res.data.mode || "easy");
        setLoadedTime(true);
      })
      .catch(() => alert("Không tải được thời gian"));
  }, [examId]);

  /* ================= SYNC REF ================= */
  /*==================STOP CAMERA ==================*/
  useEffect(() => {
    submittedRef.current = submitted;
  }, [submitted]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };
  /* ================= SUBMIT ================= */

  const submitExam = useCallback(async () => {
    if (submittedRef.current) return;

    submittedRef.current = true;
    setSubmitted(true);

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      stopCamera();   // 🔥 TẮT CAMERA
      const res = await axiosClient.post("/results/submit", {
        exam_id: examId,
        answers
      });

      setResultData(res.data);
      alert("✅ Nộp bài thành công");

    } catch (err) {
      console.error(err);

      // Nếu đã nộp rồi thì vẫn coi như thành công
      if (err.response?.status === 400) {
        alert("ℹ️ Bài đã được nộp trước đó.");
      } else {
        alert("❌ Nộp bài thất bại");
        submittedRef.current = false;
        setSubmitted(false);
      }
    }
  }, [examId, answers]);

  /* ================= TIMER ================= */

  useEffect(() => {
    if (!loadedTime || submitted || !started) return;

    if (timeLeft <= 0) {
      submitExam();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitted, loadedTime, started]);

  /* ================= VIOLATION ================= */

  const addViolation = async (message, action) => {
    if (mode === "easy") return;

    try {
      await axiosClient.post("/cheat/log", {
        exam_id: examId,
        action
      });
    } catch (err) {
      console.error("Log cheat failed");
    }

    setViolations(prev => [...prev, message]);
  };

  /* ===== AUTO SUBMIT WHEN MAX VIOLATIONS ===== */

  useEffect(() => {
    if (
      violations.length >= MAX_VIOLATIONS &&
      !submittedRef.current
    ) {
      alert("🚨 Quá số lần vi phạm! Tự động nộp bài.");
      submitExam();
    }
  }, [violations, submitExam]);

  /* ================= CHEAT DETECTION ================= */

  useEffect(() => {
    if (!started || mode === "easy") return;

    const handleVisibilityChange = () => {
      if (document.hidden && !submittedRef.current) {
        addViolation("Chuyển tab", "tab_switch");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [started, mode]);

  useEffect(() => {
    if (!started || mode === "easy") return;

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !submittedRef.current) {
        addViolation("Thoát fullscreen", "fullscreen_exit");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [started, mode]);

  useEffect(() => {
    if (!started || mode !== "strict") return;

    const handleCopy = (e) => {
      e.preventDefault();
      addViolation("Copy nội dung", "copy");
    };

    const handleKeyDown = (e) => {
      if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key === "I")) {
        e.preventDefault();
        addViolation("Mở DevTools", "devtools_open");
      }
    };

    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCopy);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCopy);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [started, mode]);

  /* ================= CAMERA CAPTURE ================= */

  useEffect(() => {

    if (!started || mode !== "strict") return;

    const interval = setInterval(() => {

      if (!videoRef.current) return;

      const video = videoRef.current;

      if (!video.videoWidth) return;

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);

      const imageData = canvas.toDataURL("image/jpeg");

      axiosClient.post("/cheat/camera-frame", {
        exam_id: examId,
        image: imageData
      });

    }, 5000);

    return () => clearInterval(interval);

  }, [started, mode, examId]);

  /* ================= AI ANALYZE ================= */

  useEffect(() => {

    if (!started || mode !== "strict") return;

    const interval = setInterval(() => {

      axiosClient.post("/cheat/analyze-pending", {
        exam_id: examId
      });

    }, 15000);

    return () => clearInterval(interval);

  }, [started, mode]);
  /* ================= START CAMERA ================= */
  useEffect(() => {
    if (!started || mode !== "strict") return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;   // 🔥 LƯU STREAM
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

      } catch (err) {
        console.error(err);
        alert("Không thể bật camera");
      }
    };

    startCamera();

  }, [started, mode]);
  /* ================= FETCH AI WARNINGS ================= */
  const [lastLogId, setLastLogId] = useState(null);

  useEffect(() => {

    if (!started || mode !== "strict") return;

    const interval = setInterval(async () => {
      try {
        const res = await axiosClient.get(`/cheat/my-violations/${examId}`);

        if (!res.data || res.data.length === 0) return;

        const latestLog = res.data[res.data.length - 1];

        // Nếu log mới
        if (latestLog._id !== lastLogId) {

          setLastLogId(latestLog._id);

          if (latestLog.details && latestLog.details.length > 0) {

            const message = translateViolation(latestLog.details[0]);

            // Popup
            setPopupWarning(message);

            // Tính là violation
            addViolation(message, "ai_detected");

            setTimeout(() => {
              setPopupWarning(null);
            }, 3000);
          }
        }

      } catch (err) {
        console.error("AI poll lỗi");
      }
    }, 7000);

    return () => clearInterval(interval);

  }, [started, mode, examId, lastLogId]);

  useEffect(() => {
    return () => {
      stopCamera();   // 🔥 Tắt camera khi rời trang
    };
  }, []);

  /* ================= ANSWER ================= */

  const chooseAnswer = (questionId, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const scrollToQuestion = (index) => {
    questionRefs.current[index]?.scrollIntoView({
      behavior: "smooth"
    });
  };

  /* ================= START ================= */

  const startExam = async () => {
    if (mode !== "easy") {
      await document.documentElement.requestFullscreen();
    }
    setStarted(true);
  };

  if (!started) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <h2>📝 Bài thi</h2>
        <p>Chế độ: <b>{mode.toUpperCase()}</b></p>
        <button onClick={startExam}>▶️ Bắt đầu làm bài</button>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div style={{ display: "flex", gap: 20 }}>

      {/* ================= LEFT PANEL ================= */}
      <div style={{ flex: 3 }}>

        <h2>📝 Làm bài thi</h2>

        {popupWarning && (
          <div style={{
            position: "fixed",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#ff4d4f",
            color: "white",
            padding: "15px 25px",
            borderRadius: 10,
            fontWeight: "bold",
            zIndex: 2000,
            boxShadow: "0 5px 15px rgba(0,0,0,0.3)"
          }}>
            🚨 {popupWarning}
          </div>
        )}

        {timeLeft !== null && !submitted && (
          <h3 style={{ color: timeLeft < 60 ? "red" : "black" }}>
            ⏰ {Math.floor(timeLeft / 60)}:
            {String(timeLeft % 60).padStart(2, "0")}
          </h3>
        )}

        {questions.map((q, index) => (

          <div
            key={q._id}
            ref={(el) => (questionRefs.current[index] = el)}
            style={{
              marginBottom: 25,
              padding: 20,
              background: "white",
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}
          >

            <p>
              <b>Câu {index + 1}:</b> {q.content}
            </p>

            {/* OPTIONS */}
            {q.options.map((o, i) => (
              <div key={i} style={{ marginBottom: 6 }}>
                <b>{String.fromCharCode(65 + i)}.</b> {o}
              </div>
            ))}

            {/* ANSWER BAR */}
            <div
              style={{
                background: "#1e64b7",
                color: "white",
                padding: 10,
                borderRadius: 5,
                marginTop: 10,
                display: "flex",
                alignItems: "center"
              }}
            >

              <span style={{ marginRight: 10 }}>Đáp án của bạn:</span>

              {["A", "B", "C", "D"].map((l, i) => {

                const chosen = answers[q._id] === i

                return (

                  <button
                    key={i}
                    onClick={() => chooseAnswer(q._id, i)}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      border: "none",
                      marginRight: 8,
                      cursor: "pointer",
                      background: chosen ? "#f59e0b" : "white",
                      color: chosen ? "white" : "black",
                      fontWeight: "bold"
                    }}
                  >
                    {l}
                  </button>

                )

              })}

            </div>

          </div>

        ))}

      </div>


      {/* ================= RIGHT PANEL ================= */}
      <div style={{
        flex: 1,
        position: "sticky",
        top: 20,
        border: "1px solid #ddd",
        padding: 15,
        borderRadius: 10,
        height: "fit-content"
      }}>

        <h4>📌 Câu hỏi</h4>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>

          {questions.map((q, index) => {

            const answered = answers[q._id] !== undefined

            return (

              <button
                key={index}
                onClick={() => scrollToQuestion(index)}
                style={{
                  width: 35,
                  height: 35,
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                  background: answered ? "#22c55e" : "#e5e7eb",
                  color: answered ? "white" : "black"
                }}
              >
                {index + 1}
              </button>

            )

          })}

        </div>


        {/* ===== VIOLATION ===== */}
        {violations.length > 0 && mode !== "easy" && (

          <div style={{
            background: "#fee",
            padding: 10,
            borderRadius: 6,
            marginTop: 20
          }}>

            <b>⚠️ Vi phạm ({violations.length}/{MAX_VIOLATIONS})</b>

            <ul style={{ marginTop: 8, paddingLeft: 18 }}>
              {violations.map((v, index) => (
                <li key={index}>{v}</li>
              ))}
            </ul>

          </div>

        )}


        {/* ===== SUBMIT BUTTON ===== */}
        {!submitted && (
          <button
            onClick={submitExam}
            style={{
              width: "100%",
              marginTop: 20,
              padding: 10,
              borderRadius: 6,
              fontWeight: "bold"
            }}
          >
            📤 Nộp bài
          </button>
        )}


        {/* ===== RESULT ===== */}
        {submitted && resultData && (

          <div style={{
            marginTop: 20,
            padding: 15,
            background: "#f0f9ff",
            borderRadius: 8
          }}>

            <h4>🎯 Kết quả</h4>

            <p>✅ Số câu đúng: {resultData.score}</p>
            <p>📊 Điểm: {resultData.point}/10</p>

            {mode === "strict" && (
              <p style={{ color: "red", marginTop: 10 }}>
                🔒 Chế độ nghiêm ngặt — Không hiển thị đáp án
              </p>
            )}

          </div>

        )}

      </div>


      {/* ===== CAMERA STRICT MODE ===== */}
      {mode === "strict" && (

        <video
          ref={videoRef}
          autoPlay
          muted
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            width: 200,
            borderRadius: 10,
            border: "3px solid red",
            zIndex: 999
          }}
        />

      )}

    </div>
  );
}