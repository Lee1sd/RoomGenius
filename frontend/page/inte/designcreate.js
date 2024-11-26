import React, { useEffect, useState } from "react";
import Interiormenu from "./interiormenu";
import Furniture from "./furniture";
import Create from "./create";

function DesignCreate() {
    const [imageUrls, setImageUrls] = useState([]); // 여러 이미지 URL을 저장할 배열 상태
    const [currentImageIndex, setCurrentImageIndex] = useState(0); // 현재 표시 중인 이미지 인덱스
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:5000/ws");
        window.scrollTo(0, 0);
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.isLoading !== undefined) {
                setIsLoading(data.isLoading);
                if (data.isLoading) {
                    setImageUrls([]); // 로딩 중일 때 이미지 리스트 초기화
                }
            }

            // 이미지 생성이 완료되었을 때 WebSocket을 통해 URL 배열을 업데이트
            if (data.imageUrls) {
                console.log("Received image URLs:", data.imageUrls); // URL 배열 확인
                const urlsWithTimestamp = data.imageUrls.map(url => `${url}?timestamp=${new Date().getTime()}`);
                setImageUrls(urlsWithTimestamp);
                setCurrentImageIndex(0); // 첫 번째 이미지로 초기화
                setIsLoading(false);
            }
        };

        ws.onclose = () => console.log("WebSocket connection closed");

        return () => ws.close();
    }, []);

    const handlePrevImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imageUrls.length) % imageUrls.length);
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
    };

     const DesignCreateContainer = {
        background: '#E1E3E8',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        position: 'relative',
    };

     const loadingStyle = {
        display: isLoading ? 'flex' : 'none',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        width: '740px',
        height: '740px',
        margin: 'auto',
        fontSize: '24px',
        color: '#555',
        backgroundColor: '#f0f0f0',
        marginLeft: '270px',
        marginTop: '70px',
        position: 'relative',
        borderRadius: '10px',
    };

    const loadingSpinnerContainerStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    };

    const loadingSpinnerStyle = {
        border: '4px solid #f3f3f3', // Transparent light gray
        borderTop: '8px solid #578BEB', // Blue accent for spinner effect
        borderRadius: '50%',
        width: '70px',
        height: '70px',
        animation: 'spin 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite', // Smooth spinning animation
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)', // Subtle shadow
    };

    const imageContainerStyle = {
        display: isLoading ? 'none' : 'flex', // 로딩 중에는 숨김
        justifyContent: 'center',
        alignItems: 'center',
        width: '740px',
        height: '740px',
        margin: 'auto',
        position: 'relative',
        marginLeft: '270px',
        marginTop: '70px',
        borderRadius: '10px',
    };

    const frameStyle = {
        borderRadius: '15px', // 모서리를 둥글게
        padding: '10px', // 이미지와 프레임 사이 간격
        border: '5px solid #ddd', // 프레임의 두께와 색상
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', // 그림자 추가
        width: '900px', // loading box와 동일한 크기
        height: '800px', // loading box와 동일한 크기
    };

    const centeredImageStyle = {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '10px', // 이미지 자체도 약간 둥글게
    };

    // 화살표 스타일 정의
    const arrowStyle = {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '20px',
        backgroundColor: '#fff',
        borderRadius: '40%',
        width: '30px',
        height: '30px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        zIndex: 1,
        boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.2)'
    };

    return (
        <div style={DesignCreateContainer}>
            <Interiormenu />
            <Furniture />
            <Create hideImageUpload={false} requireImage={true} mode="designcreate" />


            <div style={loadingStyle}>
                <div style={loadingSpinnerContainerStyle}>
                    <div style={loadingSpinnerStyle}></div>
                </div>
                Loading...
            </div>

            {/* 이미지 컨테이너: 로딩 완료 후 3장 이미지를 표시 */}
            <div style={imageContainerStyle}>
                {/* 왼쪽 화살표: 로딩이 끝난 후에만 표시 */}
                {!isLoading && imageUrls.length > 1 && (
                    <div
                        onClick={handlePrevImage}
                        style={{ ...arrowStyle, left: '-60px' }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round" // 왼쪽 화살표 회전
                        >
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </div>
                )}

                {/* 프레임 스타일 적용 */}
                {!isLoading && imageUrls.length > 0 && (
                    <div style={frameStyle}>
                        <img
                            src={imageUrls[currentImageIndex]}
                            alt={`Generated Room ${currentImageIndex + 1}`}
                            style={centeredImageStyle}
                        />
                    </div>
                )}

                {/* 오른쪽 화살표: 로딩이 끝난 후에만 표시 */}
                {!isLoading && imageUrls.length > 1 && (
                    <div
                        onClick={handleNextImage}
                        style={{ ...arrowStyle, right: '-60px' }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polyline points="9 6 15 12 9 18"></polyline>
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
}

// CSS 키프레임 애니메이션 추가
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(styleSheet);

export default DesignCreate;
