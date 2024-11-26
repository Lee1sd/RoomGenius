// src/components/Furniture.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import '../../style/furniture.css';

function Furniture() {
    const [products, setProducts] = useState([]) // 상태에 제품 데이터를 저장
    //수정한 부분
    const [isRoomGenerated, setIsRoomGenerated] = useState(false);  // Room generation status
    const [showRoomPrompt, setShowRoomPrompt] = useState(true);  // Prompt to generate room


    // IKEA 제품 데이터를 받아오는 함수
    const fetchProducts = () => {
        axios.get("http://localhost:5000/api/products")
            .then((response) => {
                const normalizedData = response.data.map((product) => {
                    return {
                        "제품 이름": product["﻿제품 이름"] ? product["﻿제품 이름"].trim() : product["제품 이름"],
                        "가격": product["가격"],
                        "이미지 경로": product["이미지 경로"]
                    };
                });
                setProducts(normalizedData);
            })
            .catch((error) => {
                console.error("Error fetching product data:", error);
            });
    };
    // 백엔드 API를 통해 제품 데이터를 가져오기
    useEffect(() => {
        fetchProducts();

        // WebSocket을 연결해 방 생성 완료 알림 수신
        const ws = new WebSocket("ws://localhost:5000/ws");
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            // 새로운 IKEA 검색 결과가 있으면 데이터 갱신
            if (data.message === "Room generated and IKEA search completed") {
                //수정한 부분
                setIsRoomGenerated(true);
                setShowRoomPrompt(false);
                fetchProducts();  // 새 데이터를 불러옴
            }
        };

        // 컴포넌트 언마운트 시 WebSocket 연결 해제
        return () => ws.close();
    }, []);

    //수정한 부분
    const handleRoomConfirmation = () => {
        setShowRoomPrompt(false);  // Hide prompt after confirmation
        if (isRoomGenerated) {
            fetchProducts();  // Fetch product data if room is already generated
        }
    };
    return (
            <div className="furniture">
                <div className="furniturebox">
                    <h4>가구</h4>
                </div>
                <div className="furnitureimage">
                    {showRoomPrompt ? (
                        <div>
                            <p>방 생성을 먼저 해주세요.</p>
                        </div>
                    ) : (
                        products.length > 0 ? (
                            products.map((product, index) => (
                                <div key={product["이미지 경로"] || index} className="product">
                                    {product["이미지 경로"] ? (
                                        <img
                                            src={`http://localhost:5000${product["이미지 경로"]}?timestamp=${new Date().getTime()}`}
                                            alt={product["제품 이름"] || "제품 이름 없음"}
                                            className="furniimg"
                                        />
                                    ) : (
                                        <p>이미지 없음</p>
                                    )}
                                    <h5>{product["제품 이름"] || "제품 이름 없음"}</h5>
                                    <p>가격: {product["가격"] || "가격 정보 없음"}</p>
                                </div>
                            ))
                        ) : (
                            <p>현재 불러올 가구가 없습니다.</p>
                        )
                    )}
                </div>
            </div>
        );
    }

export default Furniture;
