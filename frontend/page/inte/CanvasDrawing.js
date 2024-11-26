import React, { useRef, useState, useEffect } from "react";
import DrawingE from '../../assets/이미지/eraser.png';
import Inpencil from '../../assets/이미지/inpencil.png';
import '../../style/CanvasDrawing.css';

function CanvasDrawing({ onSend, mode, onImageUpload }) {
    const canvasRef = useRef(null);
    const rangeRef = useRef(null);
    const eraserRef = useRef(null);
    const modeRef = useRef(null);
    const [fileName, setFileName] = useState("");
    const [image, setImage] = useState(null);
    const [isEraserActive, setIsEraserActive] = useState(false);

    let drawingPath = []; // 경로를 저장하는 배열

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

    const handleImageUpload = async (event) => {
        const files = event.target.files;
        if (!files || files.length === 0) {
            console.warn("No files found");
            return;
        }

        const file = files[0];
        console.log("Selected file:", file); // 선택된 파일 확인

        if (file) {
            setFileName(file.name);

            // 파일을 읽는 작업을 Promise로 변환하여 await로 처리
            const dataURL = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = (error) => reject(error);
                reader.readAsDataURL(file);
            });

            console.log("Loaded image data:", dataURL); // 브라우저 콘솔에 이미지 데이터 출력
            setImage(dataURL);

            const img = new Image();
            img.src = dataURL;
            img.onload = () => {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                drawImageToCanvas(img, ctx, 450);

                setImage(img); // 이미지 상태 업데이트
                if (onImageUpload) {
                    onImageUpload(dataURL); // 상위 컴포넌트에 이미지 전달
                }
            };
        } else {
            console.warn("파일이 선택되지 않았습니다.");
        }
    };



    const handleSend = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const dataURL = canvas.toDataURL("image/png");
            onSend(dataURL);
        }
    };

    const INITIAL_COLOR = '#fcfffb';  //252  255 251  100   '#fcfffb'

    function handleColorClick(color) {

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (color === '#fcfffb') {
            // 하얀색 선택 시: 테두리는 하얀색, 채우기도 하얀색으로 설정
            ctx.strokeStyle = '#fcfffb';
            ctx.fillStyle = '#fcfffb';
        } else {
            // 다른 경우: 기본 검은색으로 테두리와 채우기 설정
            ctx.strokeStyle = INITIAL_COLOR;
            ctx.fillStyle = INITIAL_COLOR;
        }
        setIsEraserActive(false);
    }

    function handleEraserClick() {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (image) {
            drawImageToCanvas(image, ctx, 450);
        } else {
            ctx.fillStyle = '#fcfffb';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        setIsEraserActive(false);
    }


    useEffect(() => {
        const mode = modeRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const CANVAS_SIZE = 450;

        canvas.width = CANVAS_SIZE;
        canvas.height = CANVAS_SIZE;

        ctx.fillStyle = '#fcfffb';
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        ctx.strokeStyle = INITIAL_COLOR;
        ctx.fillStyle = INITIAL_COLOR; //
        ctx.lineWidth = 2.5;

        let painting = false;
        let filling = false;

        mode.innerText = 'Fill';

        function stopPainting() {
            painting = false;
        }

        function startPainting() {
            painting = true;
            drawingPath = []; // 시작할 때 경로 초기화
        }

        function onMouseMove(event) {
            const x = event.offsetX;
            const y = event.offsetY;
            if (!painting) {
                ctx.beginPath();
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
                ctx.stroke();
                if (!isEraserActive) {
                    drawingPath.push({ x, y });
                }
            }
        }

        function fillDrawnPath() {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            if (drawingPath.length > 0) {
                ctx.beginPath();
                ctx.moveTo(drawingPath[0].x, drawingPath[0].y);
                for (let i = 1; i < drawingPath.length; i++) {
                    ctx.lineTo(drawingPath[i].x, drawingPath[i].y);
                }
                ctx.closePath();
                ctx.fill(); // 현재 설정된 fillStyle 색상으로 채우기
            }
        }

        function handleModeClick() {
            filling = !filling;
            mode.innerText = filling ? 'Paint' : 'Fill';
        }

        function handleCanvasClick() {
            if (filling) {
                fillDrawnPath();
            }
        }

        function handleRangeChange(event) {
            const size = event.target.value;
            ctx.lineWidth = size;
        }

        if (canvas) {
            canvas.addEventListener('mousemove', onMouseMove);
            canvas.addEventListener('mousedown', startPainting);
            canvas.addEventListener('mouseup', stopPainting);
            canvas.addEventListener('mouseleave', stopPainting);
            canvas.addEventListener('click', handleCanvasClick);
        }

        if (rangeRef.current) {
            rangeRef.current.addEventListener('input', handleRangeChange);
        }

        if (mode) {
            mode.addEventListener('click', handleModeClick);
        }

        return () => {
            if (canvas) {
                canvas.removeEventListener('mousemove', onMouseMove);
                canvas.removeEventListener('mousedown', startPainting);
                canvas.removeEventListener('mouseup', stopPainting);
                canvas.removeEventListener('mouseleave', stopPainting);
                canvas.removeEventListener('click', handleCanvasClick);
            }
            if (rangeRef.current) {
                rangeRef.current.removeEventListener('input', handleRangeChange);
            }
            if (mode) {
                mode.removeEventListener('click', handleModeClick);
            }
        };
    }, []);

    return (
        <div className="inpaintingCanvas">
            <canvas ref={canvasRef} className="InpaintingjsCanvas"></canvas>
            <div className="Inpaintingtoolbox">
                <div className="upInpainting">
                    <input
                        id="inimage-upload"
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                            console.log("File input changed"); // 콘솔에 로그 출력
                            handleImageUpload(event);
                        }}
                        style={{display: "none"}}
                    />
                    <input type="range" ref={rangeRef} min="0.1" max="10" step="0.1"/>
                    <button id="inpMode" ref={modeRef}>Fill</button>
                    <button onClick={handleSend} className="inpainting-send">Send</button>
                    <label htmlFor="inimage-upload" className="cavansbitton">
                        {fileName ? fileName : "사진 선택"}
                    </label>
                </div>
                <div className="Inpaintingcolors">
                    <div className="inColor" onClick={() => handleColorClick("#FFFFFF")}>
                        <img src={Inpencil} alt="Pencil" style={{width: '30px', height: '30px'}}/>
                    </div>
                    <div className="inpaintingE">
                    <img src={DrawingE} alt="DrawingE" ref={eraserRef} onClick={handleEraserClick}
                            className="inpaintingeraser" style={{ width: '40px', height: '40px' }} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CanvasDrawing;
