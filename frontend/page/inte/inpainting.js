import React, { useState, useEffect } from "react";
import Interiormenu from './interiormenu';
//import Furniture from "./furniture";
import '../../style/inpainting.css';
import CanvasDrawing from './CanvasDrawing';
import CreateModal from '../../components/createModal';
import Furniture from "../../page/inte/furniture";

function Inpainting({ hideImageUpload, mode, onGenerate }) {
    const [image, setImage] = useState(null);
    const [canvasImage, setCanvasImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [imageUrls, setImageUrls] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [ikeaProducts, setIkeaProducts] = useState([]); // IKEA 제품 데이터를 저장
    const [isRoomGenerated, setIsRoomGenerated] = useState(false);

    const [generatedImages, setGeneratedImages] = useState([]);

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:5000/ws");
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.isLoading !== undefined) {
                setIsLoading(data.isLoading);
                if (data.isLoading) {
                    setImageUrls([]);
                }
            }

            if (data.imageUrls) {
                const urlsWithTimestamp = data.imageUrls.map(url => `${url}?timestamp=${new Date().getTime()}`);
                setImageUrls(urlsWithTimestamp);
                setCurrentImageIndex(0);
                setIsLoading(false);
            }
             if (data.products) {
                setIkeaProducts(data.products); // IKEA 검색 결과를 저장
            }
        };

        ws.onclose = () => console.log("WebSocket connection closed");

        return () => ws.close();
    }, []);

    const handleCanvasImage = async (dataURL) => {
        const imageName = `${Date.now()}.png`;
        setCanvasImage(dataURL);

        const img = new Image();
        img.src = dataURL;

        img.onload = async () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;

            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                if (data[i] === 252 && data[i + 1] === 255 && data[i + 2] === 251 && data[i + 3] === 255) {
                    data[i] = 255; data[i + 1] = 255; data[i + 2] = 255;
                } else {
                    data[i] = 0; data[i + 1] = 0; data[i + 2] = 0; data[i + 3] = 255;
                }
            }

            ctx.putImageData(imageData, 0, 0);
            const processedDataURL = canvas.toDataURL("image/png");

            try {
                await fetch('http://localhost:5000/api/save-mask', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imageData: processedDataURL, imageName }),
                });
                setAlertMessage("Mask image saved successfully!");
                setAlertOpen(true);
            } catch (error) {
                console.error("Error saving mask image:", error);
                setAlertMessage("Error saving mask image.");
                setAlertOpen(true);
            }
            setCanvasImage(processedDataURL);
        };
    };

    const handleImageUpload = (dataURL) => {
        setImage(dataURL);
    };

    const [projectData, setProjectData] = useState({
        solution: "Restyle Room",
        roomType: "",
        designStyle: "",
        intensity: 50,
        galleryType: 'shared'
    });

    const handleGalleryTypeChange = (e) => {
        setProjectData((prevData) => ({
            ...prevData,
            galleryType: e.target.checked ? 'private' : 'shared'
        }));
    };

    const handleGenerateRoom = async () => {
        setIsRoomGenerated(true); // 방 생성 시작 시 활성화
        setIsLoading(true); // 로딩 시작
        const designStyle = projectData.roomType || "a modern yellow wooden chair";
        const intensityValue = projectData.intensity || 50;

        try {
            const response = await fetch('http://localhost:5000/api/inpainting', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image, designStyle, intensity: intensityValue }),
            });

            const data = await response.json();
            setImageUrls(data.imageUrls || []);
            setCurrentImageIndex(0);
            setIsLoading(false); // 로딩 박스를 숨김

            if (data.imageUrls && data.imageUrls.length > 0) {
                await fetch('http://localhost:5000/api/search', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imageName: data.imageUrls[0] }),
                });
            }

            setAlertMessage(data.message || "Room generated successfully!");
            setAlertOpen(true);
        } catch (error) {
            console.error("Error generating room:", error);
            setAlertMessage("Error generating room.");
            setAlertOpen(true);
            setIsLoading(false); // 에러 발생 시에도 로딩 박스를 숨김
        } finally {
            setIsLoading(false);
        }
    };


    // New function to send the first image for search
    const sendImageForSearch = async (imageUrl) => {
        try {
            const response = await fetch('http://localhost:5000/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageName: imageUrl }),
            });

            if (!response.ok) {
                throw new Error('Failed to send image for search');
            }

            const data = await response.json();
            console.log("Search response:", data);
        } catch (error) {
            console.error("Error sending image for search:", error);
            setAlertMessage("Error performing image search.");
            setAlertOpen(true);
            setIsLoading(false);
        }
    };




    const handlePrevImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imageUrls.length) % imageUrls.length);
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const newProject = {
            image,
            ...projectData
        };

        if (projectData.solution === "Restyle Room" && projectData.roomType && projectData.designStyle) {
            try {
                const response = await fetch('http://localhost:5000/api/projects', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newProject),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Network response was not ok: ${errorText}`);
                }
                const data = await response.json();
                window.location.href = `http://localhost:3000/Myproject/${data.id}`;
            } catch (error) {
                console.error('Error:', error);
                setAlertMessage('저장 중 오류가 발생했습니다: ' + error.message);
                setAlertOpen(true);
            }
        } else {
            setAlertMessage('모든 필드를 채워주세요!');
            setAlertOpen(true);
        }
    };

      // 스타일 정의
    const loadingContainerStyle = {
        display: isRoomGenerated && isLoading ? 'flex' : 'none',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        width: '750px',
        height: '750px',
        fontSize: '24px',
        color: '#555',
        backgroundColor: '#f0f0f0',
        position: 'absolute',
        top: '57%',
        left: '56%',
        transform: 'translate(-50%, -50%)',
        borderRadius: '10px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
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

    const loadingSpinnerContainerStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '10px',
    };

    const imageContainerStyle = {
        display: isRoomGenerated && !isLoading ? 'flex' : 'none',
        justifyContent: 'center',
        alignItems: 'center',
        width: '750px',
        height: '750px',
        position: 'absolute',
        top: '57%',
        left: '56%',
        transform: 'translate(-50%, -50%)',
        borderRadius: '10px',
        backgroundColor: '#fff',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    };

    const centeredImageStyle = {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '10px', // 이미지 자체도 약간 둥글게
    };

    const frameStyle = {
        borderRadius: '10px',
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    };

    const arrowStyle = {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '24px',
        backgroundColor: '#fff',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        zIndex: 1,
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
    };

       return (
        <>
            <Interiormenu />
            <div style={{ position: 'relative', bottom: '-450px' }}>
                <Furniture isRoomGenerated={isRoomGenerated} />
            </div>

            <div className="PaintintTwocont">
                <div className="ptwoCanvasDrawing">
                     <CanvasDrawing onSend={handleCanvasImage} onImageUpload={handleImageUpload} />
                </div>
                <div className="PTwodraw">
                    <div className="Ptwosteptwocont">
                        <div className="Ptwostepone">
                            <h4>1단계: 사진 업로드</h4>
                        </div>
                        <div className="Ptwosteptwoimage">
                            {!hideImageUpload && (
                                <div className="inpaintingimage">
                                    <label htmlFor="inimage-upload" className="inupload">
                                        {image ? (
                                            <img src={image} alt="Uploaded" className="uploaded-image" />
                                        ) : (
                                            <div className="inup">원본 사진을 업로드 하세요</div>
                                        )}
                                    </label>
                                    <input
                                        id="inimage-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setImage(URL.createObjectURL(e.target.files[0]))}
                                        style={{ display: "none" }}
                                    />
                                </div>
                            )}
                            <div className="inpaintingsend">
                                {canvasImage ? (
                                    <img src={canvasImage} alt="Canvas Drawing" className="Canvas-Drawing" />
                                ) : (
                                    "send를 누르면 사진이 자동으로 업로드 됩니다"
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="inpaintinglast">
                        <div className="Ptwosteplast">
                            <h4>2단계: 생성</h4>
                        </div>

                        <div className="inpaintLast-inner">
                            <div className="inpaint-innerleft">
                                <textarea
                                    name="scType"
                                    placeholder="원하는 스타일을 입력하세요"
                                    style={{ whiteSpace: "pre-wrap", width: "130px", height: "70px" }}
                                ></textarea>

                                <div className="inpaint-control">
                                    <input type="range" min={0} max={100} step={1} name="intensity" className="custom-range"></input>
                                </div>
                            </div>

                            <div className="inpaint-innerRight">
                                <div className="inpaintwrapper">
                                    <label htmlFor="inpaintswitch">공유 갤러리</label>
                                    <input type="checkbox" id="inpaintswitch" />
                                    <label htmlFor="inpaintswitch" className="inpaint_label">
                                        <span className="inpaint_btn"></span>
                                    </label>
                                    <label htmlFor="wrapperpublic">개인 갤러리</label>
                                </div>

                                <div className="inpaintbutton">
                                    <button className="inpaintcreate" onClick={handleGenerateRoom}>방 생성</button>
                                    <button className="inpaintsave" onClick={handleSave}>저장하기</button>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 로딩 창은 방 생성 버튼 클릭 후에만 표시 */}
            {/* 로딩 상자 */}
            {isLoading && (
                <div style={loadingContainerStyle}>
                    <div style={loadingSpinnerContainerStyle}>
                        <div style={loadingSpinnerStyle}></div>
                    </div>
                    Loading...
                </div>
            )}
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
            <CreateModal
                isOpen={alertOpen}
                message={<span style={{ fontSize: '20px', fontFamily: "'IBM Plex Sans KR', sans-serif" }}>{alertMessage}</span>}
                onClose={() => setAlertOpen(false)}
            />
        </>
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

export default Inpainting;
