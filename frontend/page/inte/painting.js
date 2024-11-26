import React, { useRef, useEffect, useState } from "react";
import Interiormenu from "./interiormenu";
import '../../style/painting.css';
import Eraser from '../../assets/이미지/eraser.png';
import Funiture from '../../page/inte/furniture';
import CreateModal from '../../components/createModal';
import Furniture from "../../page/inte/furniture";
import Create from "./create";

function Painting(onGenerate, imageUrl, requireImage, mode) {
    const canvasRef = useRef(null);
    const rangeRef = useRef(null);
    const modeRef = useRef(null);
    const saveBtnRef = useRef(null);
    const eraserRef = useRef(null);
    const [image, setImage] = useState(null);
    const [isEraserActive, setIsEraserActive] = useState(false); // 지우개 상태 추가
    const [imageData, setImageData] = useState(null); // paintCreat에 표시할 이미지 데이터
    const [alertOpen, setAlertOpen] = useState(false); // 모달 상태 관리
    const [alertMessage, setAlertMessage] = useState(""); // 모달 메시지 관리
    const [isLoading, setIsLoading] = useState(false);  // 로딩 상태를 추적
    const [imageUrls, setImageUrls] = useState([]);      // 이미지 URL 배열
    const [currentImageIndex, setCurrentImageIndex] = useState(0);  // 현재 이미지 인덱스
    const [fileName, setFileName] = useState("");
    // 이미지 슬라이드를 위한 함수 정의
    const handlePrevImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imageUrls.length) % imageUrls.length);
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
    };

    let drawingPath = [];  // 경로를 저장하는 배열

    function drawImageToCanvas(img, ctx, CANVAS_SIZE) {
        const imageAspectRatio = img.width / img.height;
        const canvasAspectRatio = CANVAS_SIZE / CANVAS_SIZE;
        let renderableHeight, renderableWidth, xStart, yStart;

        if (imageAspectRatio < canvasAspectRatio) {
            renderableHeight = CANVAS_SIZE;
            renderableWidth = img.width * (renderableHeight / img.height);
            xStart = (CANVAS_SIZE - renderableWidth) / 2;
            yStart = 0;
        } else if (imageAspectRatio > canvasAspectRatio) {
            renderableWidth = CANVAS_SIZE;
            renderableHeight = img.height * (renderableWidth / img.width);
            xStart = 0;
            yStart = (CANVAS_SIZE - renderableHeight) / 2;
        } else {
            renderableWidth = CANVAS_SIZE;
            renderableHeight = CANVAS_SIZE;
            xStart = 0;
            yStart = 0;
        }

        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        ctx.drawImage(img, xStart, yStart, renderableWidth, renderableHeight);
    }

    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            setFileName(file.name);
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                drawImageToCanvas(img, ctx, 512);
                setImage(img);
            };
        }
    }

    function handleColorClick(event) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const color = event.target.style.backgroundColor;
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        setIsEraserActive(false); // 색상 선택 시 지우개 비활성화
    }

    function handleEraserClick() {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (image) {
            drawImageToCanvas(image, ctx, 512); // 배경 이미지를 다시 그립니다.
        } else {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = '#000000';
        ctx.fillStyle = '#000000';
        setIsEraserActive(false);
    }

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

            if (data.imageUrls) {
                const urlsWithTimestamp = data.imageUrls.map(url => `${url}?timestamp=${new Date().getTime()}`);
                setImageUrls(urlsWithTimestamp);
                setCurrentImageIndex(0); // 첫 번째 이미지로 초기화
                setIsLoading(false);
            }
        };

        ws.onclose = () => console.log("WebSocket connection closed");

        const fontLink = document.createElement('link');
        fontLink.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR&display=swap';
        fontLink.rel = 'stylesheet';
        document.head.appendChild(fontLink);


        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const range = rangeRef.current;
        const mode = modeRef.current;
        const saveBtn = saveBtnRef.current;
        const eraserBtn = eraserRef.current;

        const INITIAL_COLOR = '#000000';
        const CANVAS_SIZE = 512;

        canvas.width = CANVAS_SIZE;
        canvas.height = CANVAS_SIZE;

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        ctx.strokeStyle = INITIAL_COLOR;
        ctx.fillStyle = INITIAL_COLOR;
        ctx.lineWidth = 2.5;

        let painting = false;
        let filling = false;

        mode.innerText = 'Fill';

        function stopPainting() {
            painting = false;
        }

        function startPainting() {
            painting = true;
        }

        function onMouseMove(event) {
            const x = event.offsetX;
            const y = event.offsetY;
            if (!painting) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                drawingPath = [];
            } else {
                ctx.lineTo(x, y);
                ctx.stroke();
                if (!isEraserActive) {
                    drawingPath.push({ x, y });
                }
            }
        }

        function fillDrawnPath() {
            if (!isEraserActive && drawingPath.length > 0) {
                ctx.beginPath();
                ctx.moveTo(drawingPath[0].x, drawingPath[0].y);
                for (let i = 1; i < drawingPath.length; i++) {
                    ctx.lineTo(drawingPath[i].x, drawingPath[i].y);
                }
                ctx.closePath();
                ctx.fill();
            }
        }

        function handleRangeChange(event) {
            const size = event.target.value;
            ctx.lineWidth = size;
        }

        function handleModeClick() {
            if (filling === true) {
                filling = false;
                mode.innerText = 'Fill';
            } else {
                filling = true;
                mode.innerText = 'Paint';
            }
        }

        function handleCanvasClick() {
            if (filling) {
                fillDrawnPath();
            }
        }

        function handleCM(event) {
            event.preventDefault();
        }

        function handleSaveClick() {
            const canvas = canvasRef.current;
            const imageDataUrl = canvas.toDataURL("image/png");
            setImageData(imageDataUrl);
        }

        if (canvas) {
            canvas.addEventListener('mousemove', onMouseMove);
            canvas.addEventListener('mousedown', startPainting);
            canvas.addEventListener('mouseup', stopPainting);
            canvas.addEventListener('mouseleave', stopPainting);
            canvas.addEventListener('click', handleCanvasClick);
            canvas.addEventListener('contextmenu', handleCM);
        }

        Array.from(document.getElementsByClassName('jsColor')).forEach((color) =>
            color.addEventListener('click', handleColorClick)
        );

        if (range) {
            range.addEventListener('input', handleRangeChange);
        }

        if (mode) {
            mode.addEventListener('click', handleModeClick);
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', handleSaveClick);
        }

        if (eraserBtn) {
            eraserBtn.addEventListener('click', handleEraserClick);
        }

        return () => {
            if (canvas) {
                canvas.removeEventListener('mousemove', onMouseMove);
                canvas.removeEventListener('mousedown', startPainting);
                canvas.removeEventListener('mouseup', stopPainting);
                canvas.removeEventListener('mouseleave', stopPainting);
                canvas.removeEventListener('click', handleCanvasClick);
                canvas.removeEventListener('contextmenu', handleCM);
            }
            Array.from(document.getElementsByClassName('jsColor')).forEach((color) =>
                color.removeEventListener('click', handleColorClick)
            );

            if (range) {
                range.removeEventListener('input', handleRangeChange);
            }

            if (mode) {
                mode.removeEventListener('click', handleModeClick);
            }

            if (saveBtn) {
                saveBtn.removeEventListener('click', handleSaveClick);
            }
            if (eraserBtn) {
                eraserBtn.removeEventListener('click', handleEraserClick);
            }
            document.head.removeChild(fontLink);
        };
    }, []);

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

    const handleGenerateRoom = async (e) => {
        e.preventDefault();

        if (mode === 'designcreate' && !image) {
            setAlertMessage("이미지를 업로드해 주세요.");
            setAlertOpen(true);
            return;
        } else if (mode === 'textpro' && image) {
            setAlertMessage("텍스트 전용 모드에서는 이미지를 업로드할 수 없습니다.");
            setAlertOpen(true);
            return;
        }

        const apiUrl = 'http://localhost:5000/api/generate-room';
        const requestBody = {
            image: imageData,
            roomType: projectData.roomType,
            designStyle: projectData.designStyle,
            intensity: projectData.intensity
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setAlertMessage("Room generated successfully!");
            setAlertOpen(true);

            if (onGenerate) {
                onGenerate(data.imageUrls);
            }
        } catch (error) {
            //console.error('Error:', error);
            //setAlertMessage('방 생성 중 오류가 발생했습니다.');
            //setAlertOpen(true);
        }
    };

    const handleSave = async () => {
        // 개인 갤러리에서만 저장 가능하도록 설정
        if (projectData.galleryType !== 'private') {
            setAlertMessage("개인 갤러리에서만 저장 가능합니다.");
            setAlertOpen(true);
            return;
        }

        const selectedImageUrl = imageUrls[currentImageIndex];

        const response = await fetch("http://localhost:5000/api/save-image", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                imageUrl: selectedImageUrl,
                galleryType: projectData.galleryType // 수정된 부분
            })
        });

        if (response.ok) {
            alert("이미지가 저장되었습니다.");
        } else {
            alert("저장 중 오류가 발생했습니다.");
        }
    };

    const DesignCreateContainer = {
        background: '#D9D9D9',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        position: 'relative',
    };

    const loadingStyle = {
        display: isLoading ? 'flex' : 'none',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '24px',
        color: '#555',
        backgroundColor: '#f0f0f0',
        position: 'absolute',
        top: '55%',
        left: '59%',
        transform: 'translate(-50%, -50%)',
        width: '700px',
        height: '700px',
        flexDirection: 'column',
        borderRadius: '10px',// 이미지 자체도 약간 둥글게
        marginLeft: '-45px',
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
        display: isLoading ? 'none' : 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: '55%',
        left: '59%',
        transform: 'translate(-50%, -50%)',
        width: '700px',
        height: '700px',
        borderRadius: '10px', // 이미지 자체도 약간 둥글게
        marginLeft: '-45px',
    };

    const frameStyle = {
        borderRadius: '15px',
        padding: '10px',
        border: '5px solid #ddd',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
        width: '700px',
        height: '700px',
    };

    const loadingSpinnerContainerStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    };


    const centeredImageStyle = {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '10px',
    };

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
    <>
        <Interiormenu />
        <div style={{ position: 'relative', bottom: '-450px' }}>
            <Furniture />
        </div>
        <div className="Paintcont">
            <div className="painTtoolcont">
                <canvas id="jsCanvas" ref={canvasRef} className="jsCanvas"></canvas>
                <div className="painTtool">
                    <input type="range" id="jsRange" ref={rangeRef} min="0.1" max="10" step="0.1"/>
                    <button id="jsMode" ref={modeRef}>Fill</button>
                    <button id="jsSave" ref={saveBtnRef}>Send</button>
                    <input type="file" accept="image/*" onChange={handleImageUpload}
                           id="paintupload" style={{display: "none"}}/> {/* 이미지 업로드 */}
                    <label htmlFor="paintupload" className="paintupload">
                        {fileName ? fileName : "사진 선택"}
                    </label>
                </div>
            </div>
            <div className="colors">
                <div className="jsColor" style={{backgroundColor: '#FF3B30'}} onClick={handleColorClick}></div>
                <div className="jsColor" style={{backgroundColor: '#FF9500'}} onClick={handleColorClick}></div>
                <div className="jsColor" style={{ backgroundColor: '#FFCC00' }} onClick={handleColorClick}></div>
                <div className="jsColor" style={{ backgroundColor: '#4CD964' }} onClick={handleColorClick}></div>
                <div className="jsColor" style={{ backgroundColor: '#5AC8FA' }} onClick={handleColorClick}></div>
                <div className="jsColor" style={{ backgroundColor: '#007AFF' }} onClick={handleColorClick}></div>
                <div className="jsColor" style={{ backgroundColor: '#5856D6' }} onClick={handleColorClick}></div>
                <div className="jsColor" style={{ backgroundColor: '#000000' }} onClick={handleColorClick}></div>
                <div className="jsColor" style={{ backgroundColor: '#ffffff' }} onClick={handleColorClick}></div>
                <div className="jsColorE">
                    <img src={Eraser} id="Eraser" alt="Eraser" ref={eraserRef} onClick={handleEraserClick} />
                </div>
            </div>

            <div className="paintCreat">
                <div className="SCstyleone">
                    <div className="scone">
                        <h4>1단계: 사진 업로드</h4>
                    </div>
                    <div className="SCbox">
                        {!imageData && (
                            <p className="SCinner">
                                {projectData.ImageType}
                                send를 누르면<br /> 자동으로
                                이미지가 <br />업로드 됩니다.
                            </p>
                        )}
                        {imageData && <img src={imageData} alt="Saved Canvas" id="SavedCanvas" />}
                    </div>
                </div>

                <div className="scstyle">
                    <div className="sctwo"><h4> 2단계: 생성하기</h4></div>
                    <div className="sctwoinner">
                        <textarea
                            name="scType"
                            placeholder="원하는 스타일을 입력하세요"
                            value={projectData.roomType}
                            onChange={(e) => setProjectData({ ...projectData, roomType: e.target.value })}
                            style={{ whiteSpace: "pre-wrap", width: "220px", height: "70px" }}
                        ></textarea>

                        <div className="sccontrol">
                            <label></label>
                            <input type="range" min={0} max={100} step={1} name="intensity"
                                   className="custom-range"></input>
                        </div>

                        <div className="scwrapper">
                            <label htmlFor="wrapperpublic">공유 갤러리</label>
                            <input type="checkbox" id="scswitch"
                                   onChange={handleGalleryTypeChange}
                                   checked={projectData.galleryType === 'private'}
                            />
                            <label htmlFor="scswitch" className="scswitch_label">
                                <span className="sconf_btn"></span>
                            </label>
                            <label htmlFor="wrapperpublic">개인 갤러리</label>
                        </div>

                        <div className="scbutton">
                            <button className="sccreate" onClick={handleGenerateRoom}>방 생성</button>
                            <button className="scsave" onClick={handleSave}>저장하기</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* 로딩 중일 때 스피너와 Loading... 텍스트 */}
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

            <CreateModal
                isOpen={alertOpen}
                message={<span
                    style={{fontSize: '20px', fontFamily: "'IBM Plex Sans KR', sans-serif"}}>{alertMessage}</span>}
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
document.head.appendChild(styleSheet);
export default Painting;
