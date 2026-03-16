import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { useNavigate } from "react-router-dom";

export default function MyClasses() {
  const [classes, setClasses] = useState([]);
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [openMenu, setOpenMenu] = useState(null);

  // 🔥 Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const classesPerPage = 3;

  const navigate = useNavigate();

  /* ================= FETCH CLASSES ================= */

  const fetchClasses = () => {
    axiosClient
      .get("/classes/teacher/me")
      .then(res => setClasses(res.data))
      .catch(() => alert("Không tải được lớp"));
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  /* ================= PAGINATION LOGIC ================= */

  const indexOfLast = currentPage * classesPerPage;
  const indexOfFirst = indexOfLast - classesPerPage;
  const currentClasses = classes.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(classes.length / classesPerPage);

  /* ================= CREATE CLASS ================= */

  const handleCreateClass = async () => {
    if (!className || !subject) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      await axiosClient.post("/classes/create", {
        class_name: className,
        subject: subject
      });

      alert("✅ Tạo lớp thành công");

      setClassName("");
      setSubject("");
      setCurrentPage(1); // 🔥 Reset về trang 1 khi tạo mới

      fetchClasses();
    } catch (err) {
      alert("❌ Tạo lớp thất bại");
    }
  };
/* ================= DELETE CLASS ================= */
  const handleDeleteClass = async (id) => {
  if (!window.confirm("Bạn có chắc muốn xóa lớp này?")) return;

  try {
    await axiosClient.delete(`/classes/${id}`);
    alert("Xóa lớp thành công");

    fetchClasses();
  } catch {
    alert("Xóa lớp thất bại");
  }
};

  return (
    <div style={{ padding: 30 }}>
      <h2 style={{ marginBottom: 20 }}>📚 Lớp tôi phụ trách</h2>

      <div style={{ display: "flex", gap: 40 }}>

        {/* ================= LEFT SIDE ================= */}
        <div style={{ flex: 2 }}>
          {classes.length === 0 && <p>Chưa có lớp nào</p>}

          {currentClasses.map((c) => (
            <div
               key={c._id}
                style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 20,
                marginBottom: 20,
                background: "white",
                borderRadius: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                position: "relative"
              }}
            >
              {/* LEFT CONTENT */}
              <div>
                <p style={{ fontSize: 16 }}>
                  <b>Tên lớp:</b> {c.class_name}
                </p>

                <p style={{ marginTop: 5 }}>
                  <b>Môn học:</b> {c.subject}
                </p>

                <div style={{ marginTop: 15 }}>
                  <button
                    style={{
                      padding: "8px 14px",
                      borderRadius: 6,
                      border: "none",
                      background: "#2563eb",
                      color: "white",
                      cursor: "pointer"
                    }}
                    onClick={() =>
                      navigate(`/teacher/classes/${c._id}`)
                    }
                  >
                    📘 Chi tiết lớp
                  </button>

                  <button
                    style={{
                      padding: "8px 14px",
                      borderRadius: 6,
                      border: "none",
                      background: "#16a34a",
                      color: "white",
                      cursor: "pointer",
                      marginLeft: 10
                    }}
                    onClick={() =>
                      navigate(`/teacher/classes/${c._id}/exams`)
                    }
                  >
                    📊 Xem bài thi
                  </button>
                </div>
              </div>

              {/* CLASS CODE */}
              <div
                style={{
                  background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                  color: "white",
                  padding: "16px 22px",
                  borderRadius: 12,
                  textAlign: "center",
                  minWidth: 150
                }}
              >
                <div style={{ fontSize: 12, opacity: 0.8 }}>
                  MÃ LỚP
                </div>

                <div
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    letterSpacing: 1,
                    marginTop: 4
                  }}
                >
                  {c.class_code || c._id}
                </div>
              </div>
              {/* MENU 3 CHẤM */}
<div
  style={{
    position: "absolute",
    top: 10,
    right: 15
  }}
>
  <button
    onClick={() =>
      setOpenMenu(openMenu === c._id ? null : c._id)
    }
    style={{
      border: "none",
      background: "transparent",
      fontSize: 20,
      cursor: "pointer"
    }}
  >
    ⋮
  </button>

  {openMenu === c._id && (
    <div
      style={{
        position: "absolute",
        right: 0,
        top: 30,
        background: "white",
        borderRadius: 10,
        boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
        width: 120,
        overflow: "hidden",
        zIndex: 10
      }}
    >
      <div
        onClick={() => handleDeleteClass(c._id)}
        style={{
          padding: 10,
          cursor: "pointer",
          color: "red"
        }}
      >
        🗑 Xóa lớp
      </div>
    </div>
  )}
</div>
            </div>
          ))}

          {/* ================= PAGINATION ================= */}
          {classes.length > classesPerPage && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 20,
                marginTop: 20
              }}
            >
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: "none",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  background: "#e5e7eb"
                }}
              >
                ⬅
              </button>

              <span style={{ fontWeight: "bold" }}>
                Trang {currentPage} / {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: "none",
                  cursor:
                    currentPage === totalPages
                      ? "not-allowed"
                      : "pointer",
                  background: "#e5e7eb"
                }}
              >
                ➡
              </button>
            </div>
          )}
        </div>

        {/* ================= RIGHT SIDE - CREATE CLASS ================= */}
        <div
          style={{
            flex: 1,
            background: "white",
            padding: 25,
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            height: "fit-content"
          }}
        >
          <h3 style={{ marginBottom: 20 }}>➕ Tạo lớp mới</h3>

          <div style={{ marginBottom: 15 }}>
            <label>Tên lớp</label>
            <input
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="VD: CNTT_K45"
              style={{
                width: "100%",
                padding: 8,
                marginTop: 5,
                borderRadius: 6,
                border: "1px solid #ddd"
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label>Môn học</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="VD: An toàn thông tin"
              style={{
                width: "100%",
                padding: 8,
                marginTop: 5,
                borderRadius: 6,
                border: "1px solid #ddd"
              }}
            />
          </div>

          <button
            onClick={handleCreateClass}
            style={{
              width: "100%",
              padding: 10,
              background: "#7c3aed",
              color: "white",
              border: "none",
              borderRadius: 6,
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            🚀 Tạo lớp
          </button>
        </div>
      </div>
    </div>
  );
}