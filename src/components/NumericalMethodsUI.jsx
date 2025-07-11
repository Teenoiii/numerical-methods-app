import React, { useState } from 'react';
import { Calculator, Target, RotateCcw, TrendingUp, Zap, ChevronRight, Code, BookOpen } from 'lucide-react';
import './NumericalMethodsUI.css';
import Swal from 'sweetalert2';
import { bisectionMethod } from './bisection';
import { useNavigate } from "react-router-dom";



const NumericalMethodsUI = () => {
    const [hoveredMethod, setHoveredMethod] = useState(null);

    const methods = [
        {
            id: 'bisection',
            name: 'Bisection Method',
            description: 'การหาค่ารากโดยการแบ่งช่วงซ้ำๆ',
            icon: <Target size={32} />,
            color: 'blue',
            complexity: 'O(log n)',
            convergence: 'Linear'
        },
        {
            id: 'false-position',
            name: 'False Position Method',
            description: 'การหาค่ารากตามการสอดแทรกเชิงเส้น',
            icon: <TrendingUp size={32} />,
            color: 'purple',
            complexity: 'O(n)',
            convergence: 'Superlinear'
        },
        {
            id: 'one-point-iteration',
            name: 'One Point Iteration',
            description: 'การวนซ้ำแบบจุดคงที่สำหรับการแก้สมการ',
            icon: <RotateCcw size={32} />,
            color: 'green',
            complexity: 'O(n)',
            convergence: 'Linear'
        },
        {
            id: 'newton-raphson',
            name: 'Newton-Raphson Method',
            description: 'การประมาณเส้นสัมผัสเพื่อการบรรจบกันอย่างรวดเร็ว',
            icon: <Zap size={32} />,
            color: 'orange',
            complexity: 'O(n)',
            convergence: 'Quadratic'
        },
        {
            id: 'secant',
            name: 'Secant Method',
            description: 'วิธีแบบนิวตันที่ไม่มีอนุพันธ์',
            icon: <Calculator size={32} />,
            color: 'teal',
            complexity: 'O(n)',
            convergence: 'Superlinear'
        }
    ];
    const navigate = useNavigate();
    const handleMethodClick = (methodId) => {
        Swal.fire({
            title: `คุณเลือก ${methodId}`,
            text: "ต้องการไปยังหน้านี้หรือไม่?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'ตกลง',
            cancelButtonText: 'ยกเลิก',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                console.log(`Navigating to ${methodId} method`);
                if (methodId === "bisection") {
                    navigate(`/bisection`);
                } else {
                    console.log(`ยังไม่ได้กำหนดหน้าให้ ${methodId}`);
                }
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                console.log('User cancelled');
            }
        });
    };
    return (
        <div className="numerical-methods-container">
            {/* Background Elements */}
            <div className="background-circle circle-1"></div>
            <div className="background-circle circle-2"></div>

            {/* Header */}
            <div className="header">
                <div className="header-content">
                    <div className="header-icons">
                        <div className="header-icon icon-yellow">
                            <Calculator size={32} />
                        </div>
                        <div className="header-icon icon-cyan">
                            <Code size={32} />
                        </div>
                    </div>

                    <h1 className="main-title">
                        Numerical
                        <span className="title-highlight"> Methods</span>
                    </h1>

                    <p className="subtitle">
                        สำรวจอัลกอริทึมเชิงตัวเลข<span className='title-highlight'>(คุณธรรม)</span>สำหรับการแก้สมการคณิตศาสตร์และหาค่าราก
                    </p>


                </div>
            </div>

            {/* Methods Grid */}
            <div className="methods-grid">
                {methods.map((method, index) => (
                    <div
                        key={method.id}
                        className={`method-card ${method.color} ${hoveredMethod === method.id ? 'hovered' : ''}`}
                        onMouseEnter={() => setHoveredMethod(method.id)}
                        onMouseLeave={() => setHoveredMethod(null)}
                        onClick={() => handleMethodClick(method.id)}
                        style={{
                            animationDelay: `${index * 100}ms`
                        }}
                    >
                        {/* Icon */}
                        <div className={`method-icon ${method.color}-icon`}>
                            {method.icon}
                        </div>

                        {/* Content */}
                        <h3 className="method-title">{method.name}</h3>
                        <p className="method-description">{method.description}</p>

                        {/* Stats */}
                        <div className="method-stats">
                            <div className="stat">
                                <span className="stat-label">Complexity: </span>
                                <span className="stat-value">{method.complexity}</span>
                            </div>
                            <div className="stat">
                                <span className="stat-label">Convergence: </span>
                                <span className="stat-value">{method.convergence}</span>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="method-action">
                            <span>สำรวจวิธีการ</span>
                            <ChevronRight size={16} className="action-arrow" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="footer">
                <span className='title-highlight'>สร้างด้วย React + Vite • เลือกวิธีการในการเริ่มแก้สมการ</span>
                <br></br>
                <p>นาย รัตน์ คงคารัตน์ 6404062636447</p>
            </div>
        </div>
    );
};

export default NumericalMethodsUI;