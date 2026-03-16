import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend
} from "recharts";

export default function AdminClassDetail() {

    const { classId } = useParams();

    const [exams, setExams] = useState([]);
    const [examId, setExamId] = useState("");

    const [students, setStudents] = useState([]);
    const [filtered, setFiltered] = useState([]);

    const [statusFilter, setStatusFilter] = useState("all");
    const [cheatFilter, setCheatFilter] = useState("all");

    // load exams
    useEffect(() => {
        axiosClient
            .get(`/admin/classes/${classId}/exams`)
            .then(res => setExams(res.data));
    }, [classId]);

    // load report
    useEffect(() => {

        if (!examId) return;

        axiosClient
            .get(`/admin/reports/class-exam/${examId}`)
            .then(res => {
                setStudents(res.data);
                setFiltered(res.data);
            });

    }, [examId]);

    // FILTER
    const handleFilter = () => {

        let data = students;

        if (statusFilter !== "all") {
            data = data.filter(s => s.status === statusFilter);
        }

        if (cheatFilter === "cheat") {
            data = data.filter(s => s.cheat_count > 0);
        }

        if (cheatFilter === "no_cheat") {
            data = data.filter(s => s.cheat_count === 0);
        }

        setFiltered(data);
    };

    // ===== THỐNG KÊ =====
    const present = filtered.filter(s => s.status === "present").length;
    const absent = filtered.filter(s => s.status === "absent").length;

    const cheatStudents = filtered.filter(s => s.cheat_count > 0);

    const totalCheat = cheatStudents.length;
    const noCheat = filtered.length - totalCheat;

    const examChart = [
        { name: "Có thi", value: present },
        { name: "Vắng thi", value: absent }
    ];

    const cheatChart = [
        { name: "Gian lận", value: totalCheat },
        { name: "Không gian lận", value: noCheat }
    ];

    return (
        <div style={{ padding: 30 }}>

            <h2>📊 Chi tiết lớp</h2>

            {/* SELECT EXAM */}
            <select
                value={examId}
                onChange={e => setExamId(e.target.value)}
                style={{ padding: 10, borderRadius: 8, marginTop: 20 }}
            >
                <option value="">-- Chọn bài thi --</option>
                {exams.map(e => (
                    <option key={e._id} value={e._id}>
                        {e.exam_name}
                    </option>
                ))}
            </select>

            {examId && (
                <>
                    {/* FILTER */}
                    <div style={{ marginTop: 25 }}>
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="present">Có thi</option>
                            <option value="absent">Vắng thi</option>
                        </select>

                        <select
                            value={cheatFilter}
                            onChange={e => setCheatFilter(e.target.value)}
                            style={{ marginLeft: 10 }}
                        >
                            <option value="all">Tất cả gian lận</option>
                            <option value="cheat">Có gian lận</option>
                            <option value="no_cheat">Không gian lận</option>
                        </select>

                        <button
                            onClick={handleFilter}
                            style={{ marginLeft: 10 }}
                        >
                            Lọc
                        </button>
                    </div>

                    {/* THỐNG KÊ */}
                    <div style={{ display: "flex", gap: 20, marginTop: 30 }}>
                        <Card title="Tổng SV" value={filtered.length} />
                        <Card title="Có thi" value={present} color="#22c55e" />
                        <Card title="Vắng thi" value={absent} color="#ef4444" />
                        <Card title="Gian lận" value={totalCheat} color="#f59e0b" />
                    </div>

                    {/* BIỂU ĐỒ */}
                    <div style={{ display: "flex", gap: 60, marginTop: 40 }}>
                        <Chart title="Tỷ lệ thi" data={examChart} />
                        <Chart
                            title="Tỷ lệ gian lận"
                            data={cheatChart}
                            colors={["#f59e0b", "#22c55e"]}
                        />
                    </div>

                    {/* TABLE */}
                    <div style={tableCard}>
                        <table style={table}>
                            <thead>
                                <tr>
                                    <th>MSSV</th>
                                    <th>Họ tên</th>
                                    <th>Email</th>
                                    <th>Trạng thái</th>
                                    <th>Gian lận</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filtered.map(s => (
                                    <tr key={s.student_id}>
                                        <td>{s.student_code || "-"}</td>
                                        <td>{s.student_name || "-"}</td>
                                        <td>{s.email}</td>

                                        <td>
                                            {s.status === "present"
                                                ? <Tag green>✔ Có thi</Tag>
                                                : <Tag red>✖ Vắng</Tag>
                                            }
                                        </td>

                                        <td>
                                            {s.cheat_count > 0
                                                ? <Tag orange>{s.cheat_count} lần</Tag>
                                                : "-"
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

        </div>
    );
}

/* COMPONENT */

function Card({ title, value, color = "#111" }) {
    return (
        <div style={{
            background: "white",
            padding: 20,
            borderRadius: 12,
            width: 140,
            textAlign: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
            <h2 style={{ color }}>{value}</h2>
            <p>{title}</p>
        </div>
    );
}

function Chart({ title, data, colors = ["#22c55e", "#ef4444"] }) {
    return (
        <div>
            <h3>{title}</h3>
            <PieChart width={320} height={260}>
                <Pie data={data} dataKey="value" outerRadius={90} label>
                    {data.map((e, i) => (
                        <Cell key={i} fill={colors[i]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </div>
    );
}

function Tag({ children, green, red, orange }) {
    let bg = "#eee";
    if (green) bg = "#dcfce7";
    if (red) bg = "#fee2e2";
    if (orange) bg = "#fef3c7";

    return (
        <span style={{
            padding: "5px 10px",
            borderRadius: 8,
            background: bg
        }}>
            {children}
        </span>
    );
}

const tableCard = {
    marginTop: 30,
    background: "white",
    padding: 20,
    borderRadius: 12
};

const table = {
    width: "100%",
    borderCollapse: "collapse"
};