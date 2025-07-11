import React, { useState } from "react";
import { bisectionMethod } from "./bisection";
import { Line } from "react-chartjs-2";
import { evaluate } from "mathjs";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck } from '@fortawesome/free-regular-svg-icons';
import Swal from 'sweetalert2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";
import './BisectionPage.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const BisectionPage = () => {
    const [xl, setXl] = useState(1);
    const [xr, setXr] = useState(2);
    const [tolerance, setTolerance] = useState(0.0001);
    const [maxIterations, setMaxIterations] = useState(100);
    const [root, setRoot] = useState(null);
    const [iterations, setIterations] = useState([]);
    const [chartData, setChartData] = useState(null);
    const [equation, setEquation] = useState("3*x - 5");

    const apiUrl = "/api/controllers/EquationController.php";


    const f = (x) => {
        try {
            const result = evaluate(equation, { x });
            if (typeof result !== "number" || isNaN(result) || !isFinite(result)) {
                throw new Error("Result is not a valid number");
            }
            return result;
        } catch (err) {
            console.error("Invalid equation:", err.message);
            return NaN;
        }
    };

    const handleCalculate = () => {
        if (
            isNaN(xl) || isNaN(xr) ||
            isNaN(tolerance) || isNaN(maxIterations)
        ) {
            Swal.fire({
                icon: 'error',
                title: 'ค่าพารามิเตอร์ไม่ครบ',
                text: 'กรุณากรอกค่าทุกช่องให้ถูกต้อง'
            });
            return;
        }

        if (tolerance <= 0 || maxIterations <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'ค่า Tolerance หรือ Iterations ไม่ถูกต้อง',
                text: 'Tolerance และ Max Iterations ต้องมากกว่า 0'
            });
            return;
        }

        if (xl >= xr) {
            Swal.fire({
                icon: 'warning',
                title: 'ช่วง XL / XR ไม่ถูกต้อง',
                text: 'XL ต้องน้อยกว่า XR'
            });
            return;
        }

        if (isNaN(f(xl)) || isNaN(f(xr))) {
            Swal.fire({
                icon: 'error',
                title: 'สมการหรือค่าไม่ถูกต้อง',
                text: 'สมการไม่ถูกต้อง หรือ XL/XR อยู่นอกขอบเขต'
            });
            return;
        }

        const result = bisectionMethod(f, xl, xr, tolerance, maxIterations, true);
        if (!result) {
            Swal.fire({
                icon: 'info',
                title: 'ไม่พบ Root',
                text: 'ไม่พบ root ในช่วงที่กำหนด'
            });
            return;
        }

        setRoot(result.root);
        setIterations(result.iterations);

        const xValues = [];
        const yValues = [];
        const step = 0.1;
        for (let x = xl - 1; x <= xr + 1; x += step) {
            xValues.push(x.toFixed(2));
            yValues.push(f(x));
        }

        setChartData({
            labels: xValues,
            datasets: [
                {
                    label: "f(x)",
                    data: yValues,
                    borderColor: "#3b82f6",
                    fill: false,
                    tension: 0.1
                },
                {
                    label: "Root",
                    data: xValues.map((x) =>
                        Math.abs(parseFloat(x) - result.root) < step ? f(result.root) : null
                    ),
                    borderColor: "#ef4444",
                    pointBackgroundColor: "#ef4444",
                    pointRadius: 6,
                    showLine: false
                }
            ]
        });
    };


    const fetchRandomEquation = async () => {
        try {
            const response = await fetch(`${apiUrl}?action=random`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            if (data && data.expression) {
                setEquation(data.expression);
                Swal.fire({
                    icon: 'success',
                    title: 'สุ่มสมการสำเร็จ!',
                    text: 'ตรวจสอบสมการก่อนทำการคำนวณ',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                Swal.fire({
                    icon: 'warning',
                    title: 'ไม่พบสมการจาก API',
                    text: 'กรุณาลองใหม่อีกครั้ง'
                });
            }
        } catch (err) {
            console.error("Error fetching random equation:", err);
            Swal.fire({
                icon: 'error',
                title: 'ข้อผิดพลาด!',
                text: 'ไม่สามารถเชื่อมต่อ API ได้'
            });
        }
    };


    const handleAddEquation = async () => {
        const { value: newEq } = await Swal.fire({
            title: 'เพิ่มสมการใหม่',
            input: 'text',
            inputLabel: 'ป้อนสมการ (เช่น x^2 - 4)',
            showCancelButton: true,
            confirmButtonText: 'เพิ่ม',
            cancelButtonText: 'ยกเลิก',
            inputValidator: (value) => {
                if (!value) return 'Please enter an equation!';
            }
        });

        if (newEq) {
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ expression: newEq })
                });
                const result = await response.json();

                if (result.success) {
                    Swal.fire('เพิ่มแล้ว!', 'เพิ่มสมการสำเร็จแล้ว', 'success');
                } else {
                    Swal.fire('Error', result.message || 'Failed to add equation.', 'error');
                }
            } catch (err) {
                console.error(err);
                Swal.fire('Error', 'Failed to connect to API.', 'error');
            }
        }
    };

    const handleUpdateEquation = async () => {
        try {
            Swal.showLoading();

            const response = await fetch(`${apiUrl}?action=getAll`);
            const data = await response.json();
            Swal.close();

            if (!Array.isArray(data) || data.length === 0) {
                Swal.fire('ไม่พบสมการ', 'ยังไม่มีสมการในระบบ', 'warning');
                return;
            }

            const tableHtml = `
            <table style="width:100%;border-collapse:collapse;text-align:left;">
                <thead>
                    <tr style="background:#4f46e5;color:#fff;">
                        <th style="padding:8px;border:1px solid #ddd;">ID</th>
                        <th style="padding:8px;border:1px solid #ddd;">Equation</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(eq => `
                        <tr>
                            <td style="padding:8px;border:1px solid #ddd;">${eq.id}</td>
                            <td style="padding:8px;border:1px solid #ddd;">${eq.expression}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

            const { value: id } = await Swal.fire({
                title: 'เลือกสมการเพื่ออัปเดต',
                html: tableHtml + '<br><input id="swal-input-id" class="swal2-input" placeholder="กรอก ID ที่ต้องการ">',
                focusConfirm: false,
                preConfirm: () => {
                    const idInput = document.getElementById('swal-input-id').value;
                    if (!idInput || isNaN(idInput) || parseInt(idInput) <= 0) {
                        Swal.showValidationMessage('กรุณาใส่ ID ที่ถูกต้อง');
                        return false;
                    }
                    return parseInt(idInput);
                },
                showCancelButton: true,
                confirmButtonText: 'ถัดไป',
                cancelButtonText: 'ยกเลิก'
            });

            if (id) {
                const { value: updatedEq } = await Swal.fire({
                    title: `ป้อนสมการใหม่ (ID: ${id})`,
                    input: 'text',
                    inputPlaceholder: 'เช่น x^2 - 4',
                    showCancelButton: true,
                    confirmButtonText: 'อัปเดต',
                    cancelButtonText: 'ยกเลิก',
                    inputValidator: (value) => {
                        if (!value.trim()) return 'กรุณากรอกสมการใหม่!';
                    }
                });

                if (updatedEq) {
                    Swal.showLoading();
                    const res = await fetch(`${apiUrl}?action=update`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id, expression: updatedEq })
                    });
                    const result = await res.json();
                    Swal.close();

                    if (result.success) {
                        Swal.fire('สำเร็จ!', 'อัปเดตสมการเรียบร้อยแล้ว', 'success');
                    } else {
                        Swal.fire('ไม่สำเร็จ', result.message || 'ไม่สามารถอัปเดตสมการได้', 'error');
                    }
                }
            }
        } catch (err) {
            Swal.close();
            console.error(err);
            Swal.fire('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อ API ได้', 'error');
        }
    };



    const handleDeleteEquation = async () => {
        try {
            Swal.showLoading();

            const response = await fetch(`${apiUrl}?action=getAll`);
            const data = await response.json();
            Swal.close();

            if (!Array.isArray(data) || data.length === 0) {
                Swal.fire('ไม่พบสมการ', 'ยังไม่มีสมการในระบบ', 'warning');
                return;
            }

            const tableHtml = `
            <table style="width:100%;border-collapse:collapse;text-align:left;">
                <thead>
                    <tr style="background:#dc2626;color:#fff;">
                        <th style="padding:8px;border:1px solid #ddd;">ID</th>
                        <th style="padding:8px;border:1px solid #ddd;">Equation</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(eq => `
                        <tr>
                            <td style="padding:8px;border:1px solid #ddd;">${eq.id}</td>
                            <td style="padding:8px;border:1px solid #ddd;">${eq.expression}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

            const { value: id } = await Swal.fire({
                title: 'เลือกสมการเพื่อลบ',
                html: tableHtml + '<br><input id="swal-input-id" class="swal2-input" placeholder="กรอก ID ที่ต้องการ">',
                focusConfirm: false,
                preConfirm: () => {
                    const idInput = document.getElementById('swal-input-id').value;
                    if (!idInput || isNaN(idInput) || parseInt(idInput) <= 0) {
                        Swal.showValidationMessage('กรุณาใส่ ID ที่ถูกต้อง (เลขบวก)');
                        return false;
                    }
                    return parseInt(idInput);
                },
                showCancelButton: true,
                confirmButtonText: 'ถัดไป',
                cancelButtonText: 'ยกเลิก'
            });

            if (id) {
                const confirm = await Swal.fire({
                    title: 'ยืนยันการลบ',
                    text: `คุณต้องการลบสมการ ID: ${id} ใช่หรือไม่?`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'ลบเลย',
                    cancelButtonText: 'ยกเลิก'
                });

                if (confirm.isConfirmed) {
                    Swal.showLoading();
                    const res = await fetch(apiUrl, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'delete', id })
                    });
                    const result = await res.json();
                    Swal.close();

                    if (result.success) {
                        Swal.fire('ลบแล้ว!', 'สมการถูกลบเรียบร้อย', 'success');
                    } else {
                        Swal.fire('ไม่สำเร็จ', result.message || 'ไม่สามารถลบสมการได้', 'error');
                    }
                }
            }
        } catch (err) {
            Swal.close();
            console.error(err);
            Swal.fire('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อ API ได้', 'error');
        }
    };






    return (
        <div className="numerical-bisection-container">
            <div className="background-circle circle-1"></div>
            <div className="background-circle circle-2"></div>

            <div className="methods-grid">
                <div className="bisection-container">
                    <div className="bisection-header">
                        <div className="bisection-icon">📐</div>
                        <div>
                            <h1 className="bisection-title">Bisection Method</h1>
                            <p className="bisection-subtitle">กรอกค่าพารามิเตอร์เพื่อคำนวณ Root ของ f(x)</p>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Equation (f(x))
                            <input
                                type="text"
                                value={equation}
                                onChange={(e) => setEquation(e.target.value)}
                                placeholder="Enter f(x), e.g. x^3 - x - 2"
                            />
                        </label>
                    </div>

                    <div className="form-group">
                        <label>XL
                            <input type="number" value={xl} onChange={(e) => setXl(parseFloat(e.target.value))} />
                        </label>
                        <label>XR
                            <input type="number" value={xr} onChange={(e) => setXr(parseFloat(e.target.value))} />
                        </label>
                        <label>Tolerance
                            <input type="number" value={tolerance} step="0.0001" onChange={(e) => setTolerance(parseFloat(e.target.value))} />
                        </label>
                        <label>Max Iterations
                            <input type="number" value={maxIterations} onChange={(e) => setMaxIterations(parseInt(e.target.value))} />
                        </label>
                    </div>

                    <div className="form-buttons">
                        <button className="calculate-btn" onClick={handleCalculate}>Calculate</button>
                        <button className="fetch-btn" onClick={fetchRandomEquation}>Fetch Api Random Equation</button>
                        <button className="add-btn" onClick={handleAddEquation}>Add</button>
                        <button className="update-btn" onClick={handleUpdateEquation}>Update</button>
                        <button className="delete-btn" onClick={handleDeleteEquation}>Delete</button>
                    </div>


                    {root && <div className="result"><FontAwesomeIcon icon={faCircleCheck} color="#10b981" /> Root : {root}</div>}

                    {chartData && (
                        <div className="chart-container">
                            <Line
                                data={chartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: "top",
                                            labels: { color: "#fff", font: { size: 14 } }
                                        },
                                        title: {
                                            display: true,
                                            text: `Graph of ${equation}`,
                                            color: "#fff",
                                            font: { size: 18 }
                                        }
                                    },
                                    scales: {
                                        x: {
                                            ticks: { color: "#ddd", font: { size: 12 } },
                                            title: { display: true, text: "x", color: "#fff", font: { size: 14 } },
                                            grid: { color: "rgba(255, 255, 255, 0.1)" }
                                        },
                                        y: {
                                            ticks: { color: "#ddd", font: { size: 12 } },
                                            title: { display: true, text: "f(x)", color: "#fff", font: { size: 14 } },
                                            grid: { color: "rgba(255, 255, 255, 0.1)" }
                                        }
                                    }
                                }}
                                height={400}
                            />
                        </div>
                    )}

                    {iterations.length > 0 && (
                        <table className="iteration-table">
                            <thead>
                                <tr>
                                    <th>Iteration</th>
                                    <th>XL</th>
                                    <th>XR</th>
                                    <th>XM</th>
                                    <th>f(XM)</th>
                                    <th>Error</th>
                                </tr>
                            </thead>
                            <tbody>
                                {iterations.map((row, i) => (
                                    <tr key={i}>
                                        <td>{i + 1}</td>
                                        <td>{row.xl}</td>
                                        <td>{row.xr}</td>
                                        <td>{row.xm}</td>
                                        <td>{row.f_xm}</td>
                                        <td>{row.error}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BisectionPage;
