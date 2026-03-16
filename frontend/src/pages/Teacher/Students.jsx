import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function Students() {

  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedExam, setSelectedExam] = useState("");

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState("manual");

  const [uploading, setUploading] = useState(false);

  const [newStudent, setNewStudent] = useState({
    student_code: "",
    name: "",
    email: "",
    gender: "Nam"
  });


  // ================= LOAD CLASSES =================

  useEffect(() => {

    axiosClient.get("/classes/teacher/me")
      .then(res => setClasses(res.data))
      .catch(err => console.log(err));

  }, []);


  // ================= LOAD STUDENTS BY CLASS =================
  const loadStudentsByClass = (classId) => {

    axiosClient
      .get(`/classes/teacher/${classId}/students`)
      .then(res => {

        const data = res.data.map(s => ({
          ...s,
          status: "none",
          subject: "-"
        }));

        setStudents(data);

      })
      .catch(err => console.log(err));

  };

  // ================= LOAD EXAMS =================

  const loadExams = (classId) => {

    axiosClient
      .get(`/exams/teacher/class/${classId}`)
      .then(res => setExams(res.data))
      .catch(err => console.log(err));

  };



  // ================= LOAD STUDENTS =================

  const loadStudents = (examId) => {

    axiosClient
      .get(`/reports/exam-attendance/${examId}`)
      .then(res => setStudents(res.data))
      .catch(err => console.log(err));

  };



  // ================= FILTER =================

  const filteredStudents = students
    .filter(s => {

      if (filter === "present") return s.status === "present";

      if (filter === "absent") return s.status === "absent";

      return true;

    })
    .filter(s => {

      const name = s.full_name || s.name || "";

      return name.toLowerCase().includes(search.toLowerCase());

    });



  // ================= THỐNG KÊ =================

  const total = students.length;

  const present = students.filter(s => s.status === "present").length;

  const absent = students.filter(s => s.status === "absent").length;



  // ================= ADD STUDENT =================

  const addStudent = async () => {

    if (!selectedClass) {
      alert("Vui lòng chọn lớp");
      return;
    }

    try {

      await axiosClient.post("/classes/add-student", {
        class_id: selectedClass,
        ...newStudent
      });

      alert("✅ Thêm sinh viên thành công");

      setNewStudent({
        student_code: "",
        name: "",
        email: "",
        gender: "Nam"
      });

    } catch {

      alert("❌ Thêm thất bại");

    }

  };



  // ================= IMPORT EXCEL =================

  const uploadExcel = async (e) => {

    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();

    formData.append("file", file);
    formData.append("class_id", selectedClass);

    try {

      setUploading(true);

      await axiosClient.post(
        "/classes/import-students",
        formData
      );

      alert("✅ Import Excel thành công");

    } catch {

      alert("❌ Import thất bại");

    } finally {

      setUploading(false);

    }

  };



  return (

    <div style={styles.container}>

      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerIcon}>👨‍🎓</div>
          <div>
            <h2 style={styles.headerTitle}>Danh sách học sinh</h2>
            <p style={styles.headerSubtitle}>Quản lý sinh viên và theo dõi điểm danh thi</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={styles.addBtn}
        >
          <span style={{ marginRight: 8 }}>➕</span> Thêm học sinh
        </button>
      </div>



      {/* FILTER BAR */}
      <div style={styles.filterBar}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>📚 Lớp học</label>
          <select
            value={selectedClass}
            onChange={(e) => {

              const classId = e.target.value;

              setSelectedClass(classId);
              setSelectedExam("");
              setStudents([]);

              if (classId) {
                loadExams(classId);
                loadStudentsByClass(classId);
              }
            }}
            style={styles.select}
          >
            <option value="">-- Chọn lớp --</option>
            {classes.map(c => (
              <option key={c._id} value={c._id}>
                {c.class_name}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>📝 Bài thi</label>
          <select
            value={selectedExam}
            onChange={(e) => {
              const examId = e.target.value;
              setSelectedExam(examId);
              if (examId) {
                loadStudents(examId);
              } else {
                loadStudentsByClass(selectedClass);
              }
            }}
            style={styles.select}
          >
            <option value="">-- Chọn bài thi --</option>
            {exams.map(e => (
              <option key={e._id} value={e._id}>
                {e.exam_name}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>🔍 Lọc trạng thái</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={styles.select}
          >
            <option value="all">Tất cả</option>
            <option value="present">Có thi</option>
            <option value="absent">Vắng thi</option>
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>🔎 Tìm kiếm</label>
          <input
            type="text"
            placeholder="Tìm theo tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>



      {/* THỐNG KÊ */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>👨‍🎓</div>
          <div>
            <div style={styles.statValue}>{total}</div>
            <div style={styles.statLabel}>Tổng sinh viên</div>
          </div>
        </div>
        <div style={{ ...styles.statCard, ...styles.statCardPresent }}>
          <div style={styles.statIcon}>✅</div>
          <div>
            <div style={styles.statValue}>{present}</div>
            <div style={styles.statLabel}>Có thi</div>
          </div>
        </div>
        <div style={{ ...styles.statCard, ...styles.statCardAbsent }}>
          <div style={styles.statIcon}>❌</div>
          <div>
            <div style={styles.statValue}>{absent}</div>
            <div style={styles.statLabel}>Vắng thi</div>
          </div>
        </div>
      </div>



      {/* TABLE */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th style={{ ...styles.th, borderTopLeftRadius: 12 }}>MSSV</th>
              <th style={styles.th}>Họ tên</th>
              <th style={styles.th}>Giới tính</th>
              <th style={styles.th}>Môn</th>
              <th style={styles.th}>Email</th>
              <th style={{ ...styles.th, borderTopRightRadius: 12 }}>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan="6" style={styles.emptyRow}>Không có dữ liệu</td>
              </tr>
            )}
            {filteredStudents.map((s, index) => (
              <tr key={s.student_id} style={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                <td style={styles.td}>
                  <span style={styles.studentCode}>{s.student_code}</span>
                </td>
                <td style={styles.td}>
                  <span style={styles.studentName}>{s.full_name || s.name}</span>
                </td>
                <td style={styles.td}>{s.gender || "-"}</td>
                <td style={styles.td}>{s.subject || "-"}</td>
                <td style={styles.td}>
                  <span style={styles.email}>{s.email}</span>
                </td>
                <td style={styles.td}>
                  {s.status === "present" && (
                    <span style={styles.badgePresent}>✅ Có thi</span>
                  )}
                  {s.status === "absent" && (
                    <span style={styles.badgeAbsent}>❌ Vắng thi</span>
                  )}
                  {s.status === "none" && (
                    <span style={styles.badgeNone}>-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>



      {/* ================= MODAL ================= */}

      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>👨‍🎓 Thêm sinh viên vào lớp</h3>
              <button
                onClick={() => setShowModal(false)}
                style={styles.closeModalBtn}
              >
                ✕
              </button>
            </div>

            <div style={styles.tabs}>
              <button
                onClick={() => setTab("manual")}
                style={tab === "manual" ? styles.activeTab : styles.tabBtn}
              >
                📝 Thêm thủ công
              </button>
              <button
                onClick={() => setTab("excel")}
                style={tab === "excel" ? styles.activeTab : styles.tabBtn}
              >
                📊 Import Excel
              </button>
            </div>



            {/* MANUAL */}

            {tab === "manual" && (
              <div style={styles.tabContent}>
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>MSSV</label>
                    <input
                      style={styles.input}
                      value={newStudent.student_code}
                      onChange={(e) =>
                        setNewStudent({
                          ...newStudent,
                          student_code: e.target.value
                        })
                      }
                      placeholder="Nhập mã sinh viên"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Họ tên</label>
                    <input
                      style={styles.input}
                      value={newStudent.name}
                      onChange={(e) =>
                        setNewStudent({
                          ...newStudent,
                          name: e.target.value
                        })
                      }
                      placeholder="Nhập họ tên"
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Email</label>
                  <input
                    style={styles.input}
                    value={newStudent.email}
                    onChange={(e) =>
                      setNewStudent({
                        ...newStudent,
                        email: e.target.value
                      })
                    }
                    placeholder="Nhập địa chỉ email"
                    type="email"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Giới tính</label>
                  <select
                    style={styles.input}
                    value={newStudent.gender}
                    onChange={(e) =>
                      setNewStudent({
                        ...newStudent,
                        gender: e.target.value
                      })
                    }
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>

                <div style={styles.buttonGroup}>
                  <button style={styles.saveBtn} onClick={addStudent}>
                    💾 Lưu thông tin
                  </button>
                  <button
                    style={styles.cancelBtn}
                    onClick={() => setShowModal(false)}
                  >
                    Hủy bỏ
                  </button>
                </div>
              </div>
            )}



            {/* EXCEL */}

            {tab === "excel" && (
              <div style={styles.tabContent}>
                <div style={styles.dropZone}>
                  <div style={styles.dropZoneIcon}>📂</div>
                  <p style={styles.dropZoneText}>Chọn file Excel để import</p>
                  <p style={styles.dropZoneHint}>.xlsx files only</p>
                  <input
                    type="file"
                    accept=".xlsx"
                    onChange={uploadExcel}
                    style={styles.fileInput}
                  />
                </div>

                {uploading && (
                  <div style={styles.uploading}>
                    <div style={styles.spinner}></div>
                    <p>⏳ Đang import dữ liệu...</p>
                  </div>
                )}

                <div style={styles.excelInfo}>
                  <p style={styles.excelTitle}>📋 File Excel cần có các cột:</p>
                  <div style={styles.excelColumns}>
                    <span style={styles.excelColumn}>student_code</span>
                    <span style={styles.excelColumn}>name</span>
                    <span style={styles.excelColumn}>email</span>
                    <span style={styles.excelColumn}>gender</span>
                  </div>
                </div>

                <button
                  style={styles.cancelBtn}
                  onClick={() => setShowModal(false)}
                >
                  Đóng
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>

  );
}



// ================= STYLES =================

const styles = {
  container: {
    padding: "24px",
    background: "#f8fafc",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },

  // Header
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "24px 32px",
    borderRadius: "16px",
    boxShadow: "0 10px 40px rgba(102, 126, 234, 0.3)"
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    gap: "16px"
  },
  headerIcon: {
    fontSize: "48px",
    background: "rgba(255,255,255,0.2)",
    padding: "12px",
    borderRadius: "12px"
  },
  headerTitle: {
    margin: 0,
    color: "white",
    fontSize: "28px",
    fontWeight: "700"
  },
  headerSubtitle: {
    margin: "4px 0 0 0",
    color: "rgba(255,255,255,0.8)",
    fontSize: "14px"
  },
  addBtn: {
    background: "white",
    color: "#667eea",
    border: "none",
    padding: "12px 24px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
  },

  // Filter Bar
  filterBar: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    marginBottom: "24px",
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  filterLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  select: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    background: "white",
    fontSize: "14px",
    color: "#1e293b",
    cursor: "pointer",
    outline: "none",
    transition: "border-color 0.2s",
    width: "100%"
  },
  searchInput: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
    width: "100%",
    boxSizing: "border-box"
  },

  // Stats
  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
    marginBottom: "24px"
  },
  statCard: {
    background: "white",
    padding: "20px 24px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
  },
  statCardPresent: {
    borderLeft: "4px solid #22c55e"
  },
  statCardAbsent: {
    borderLeft: "4px solid #ef4444"
  },
  statIcon: {
    fontSize: "32px"
  },
  statValue: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1e293b"
  },
  statLabel: {
    fontSize: "13px",
    color: "#64748b",
    marginTop: "2px"
  },

  // Table
  tableContainer: {
    background: "white",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  thead: {
    background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)"
  },
  th: {
    padding: "16px",
    textAlign: "left",
    fontWeight: "600",
    color: "#475569",
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    borderBottom: "2px solid #e2e8f0"
  },
  td: {
    padding: "14px 16px",
    borderBottom: "1px solid #f1f5f9",
    color: "#334155",
    fontSize: "14px"
  },
  evenRow: {
    background: "white"
  },
  oddRow: {
    background: "#f8fafc"
  },
  emptyRow: {
    padding: "40px",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "14px"
  },
  studentCode: {
    fontWeight: "600",
    color: "#6366f1",
    fontFamily: "monospace"
  },
  studentName: {
    fontWeight: "500",
    color: "#1e293b"
  },
  email: {
    color: "#64748b",
    fontSize: "13px"
  },
  badgePresent: {
    display: "inline-block",
    padding: "4px 10px",
    background: "#dcfce7",
    color: "#166534",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500"
  },
  badgeAbsent: {
    display: "inline-block",
    padding: "4px 10px",
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500"
  },
  badgeNone: {
    color: "#94a3b8",
    fontSize: "13px"
  },

  // Modal
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)"
  },
  modal: {
    background: "white",
    width: "520px",
    borderRadius: "16px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    overflow: "hidden"
  },
  modalHeader: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "20px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  modalTitle: {
    margin: 0,
    color: "white",
    fontSize: "18px",
    fontWeight: "600"
  },
  closeModalBtn: {
    background: "rgba(255,255,255,0.2)",
    border: "none",
    color: "white",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  tabs: {
    display: "flex",
    padding: "16px 24px",
    gap: "12px",
    borderBottom: "1px solid #f1f5f9"
  },
  tabBtn: {
    padding: "10px 18px",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    cursor: "pointer",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#64748b",
    transition: "all 0.2s",
    flex: 1
  },
  activeTab: {
    padding: "10px 18px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    flex: 1,
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)"
  },
  tabContent: {
    padding: "24px"
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px"
  },
  formGroup: {
    marginBottom: "16px"
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#475569"
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box"
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
    marginTop: "24px"
  },
  saveBtn: {
    flex: 1,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    padding: "12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    transition: "transform 0.2s"
  },
  cancelBtn: {
    flex: 1,
    background: "#f1f5f9",
    color: "#64748b",
    border: "1px solid #e2e8f0",
    padding: "12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px"
  },

  // Excel Drop Zone
  dropZone: {
    border: "2px dashed #cbd5e1",
    padding: "40px 20px",
    borderRadius: "12px",
    textAlign: "center",
    marginBottom: "20px",
    background: "#f8fafc",
    transition: "border-color 0.2s, background 0.2s",
    cursor: "pointer"
  },
  dropZoneIcon: {
    fontSize: "48px",
    marginBottom: "12px"
  },
  dropZoneText: {
    margin: "0 0 8px 0",
    color: "#475569",
    fontSize: "15px",
    fontWeight: "500"
  },
  dropZoneHint: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "13px"
  },
  fileInput: {
    marginTop: "16px"
  },
  uploading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    padding: "16px",
    background: "#f0f9ff",
    borderRadius: "8px",
    color: "#0369a1",
    marginBottom: "16px"
  },
  spinner: {
    width: "20px",
    height: "20px",
    border: "2px solid #e0f2fe",
    borderTop: "2px solid #0369a1",
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  },
  excelInfo: {
    background: "#f8fafc",
    padding: "16px",
    borderRadius: "8px",
    marginBottom: "20px"
  },
  excelTitle: {
    margin: "0 0 12px 0",
    fontSize: "13px",
    fontWeight: "600",
    color: "#475569"
  },
  excelColumns: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px"
  },
  excelColumn: {
    padding: "4px 10px",
    background: "#e2e8f0",
    borderRadius: "4px",
    fontSize: "12px",
    fontFamily: "monospace",
    color: "#475569"
  }
};

