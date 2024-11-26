import React,{useState} from "react";
import CreateModal from "../../components/createModal";
import '../../style/create.css';

function Create({ hideImageUpload, onGenerate, imageUrl, requireImage, mode }) {
    const [image, setImage] = useState(null);
    const [imageUrls, setImageUrls] = useState([]); // imageUrls 상태 추가
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [projectData, setProjectData] = useState({

        solution: "Restyle Room",
        roomType: "",
        designStyle: "",
        intensity: 50,
        galleryType: 'shared'
    });

    const [alertOpen, setAlertOpen] = useState(false); // 모달 상태 관리
    const [alertMessage, setAlertMessage] = useState(""); // 모달 메시지 관리

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const fileType = file.type;
            const validImageTypes = ['image/png'];

            if (!validImageTypes.includes(fileType)) {
                setAlertMessage('방 사진만 업로드할 수 있습니다.');
                setAlertOpen(true); // 모달 열기
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProjectData((prevData) => ({
            ...prevData,
            [name]: name === "intensity" ? parseInt(value) : value
        }));
    };

    const handleGalleryTypeChange = (e) => {
        setProjectData((prevData) => ({
            ...prevData,
            galleryType: e.target.checked ? 'private' : 'shared' // 갤러리 타입 변경

        }));
    };

    const handleGenerateRoom = async (e) => {
        e.preventDefault();

        // 페이지 모드에 따른 조건 처리
        if (mode === 'designcreate') {
            if (!image) {
                setAlertMessage("이미지를 업로드해 주세요.");
                setAlertOpen(true);
                return;
            }
        } else if (mode === 'textpro') {
            if (image) {
                setAlertMessage("텍스트 전용 모드에서는 이미지를 업로드할 수 없습니다.");
                setAlertOpen(true);
                return;
            }
        }

        // 선택된 API 경로에 따라 img2img 또는 txt2img 요청
        const apiUrl = image ? 'http://localhost:5000/api/generate-room' : 'http://localhost:5000/api/generate-room-txt';
        const requestBody = {
            roomType: projectData.roomType,
            designStyle: projectData.designStyle,
            intensity: projectData.intensity,
            image: image || null
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });
            const data = await response.json();

            if (!response.ok) {
                // 서버에서 반환된 에러 메시지 처리
                setAlertMessage(data.error || '방 생성 중 오류가 발생했습니다.');
                setAlertOpen(true);
                return;
            }

            setImageUrls(data.imageUrls);
            setAlertMessage("방 생성이 완료되었습니다!");
            setAlertOpen(true);

            if (onGenerate) {
                onGenerate(data.imageUrl);
            }

        } catch (error) {
            console.error('Error:', error);
            setAlertMessage('방 생성 중 오류가 발생했습니다.');
            setAlertOpen(true);
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

    return (
        <>
        <div className="controler">
            {!hideImageUpload && (
                <div className="stepone">
                    <h4>1단계: 이미지 업로드</h4>
                </div>
            )}

            {!hideImageUpload && (
                <div className="uploadimage">
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{display: "none"}}
                           id="image-upload"/>
                    <div className="arrow">⬇</div>
                    <label htmlFor="image-upload" className="upload">
                        {/* 화살표 아이콘 */}
                        {image ? <img src={image} alt="Uploaded" style={{width: "100px", height: "80px"}}/> :
                            <div className="up">첨부 파일을 놓거나 클릭하여 업로드 하세요</div>}
                    </label>
                </div>
            )}

            <div className="steptwo">
                <h4>{hideImageUpload ? "1단계: 사용자 정의" : "2단계: 사용자 정의"}</h4>
            </div>
            <div className="staptwocon">
                <form className="twosolution">
                    <label htmlFor="solution"> 방법 </label>
                    <select name="checksoultion" id="checksoultion"
                            value={projectData.solution}
                            onChange={handleInputChange}
                    >
                        <option value="Restyle">Restyle Room</option>
                        <option value="Emptyroom">Fill Empty Room</option>
                    </select>
                </form>

                <div className="tworoom">
                    <label htmlFor="roomType"> 객실 유형 </label>
                    <textarea name="roomType" placeholder="원하는 객실 유형을 입력하세요" value={projectData.roomType}
                              onChange={handleInputChange}></textarea>
                </div>

                <div className="disignstyle">
                    <label htmlFor="designStyle"> 디자인 스타일 </label>
                    <textarea name="designStyle" placeholder="원하는 스타일을 입력하세요" value={projectData.designStyle} onChange={handleInputChange}></textarea>
                </div>

                <div className="powercontrol">
                    <label> 디자인 강도 설정 </label>
                    <input type="range" min={0} max={100} step={1} name="intensity" value={projectData.intensity} onChange={handleInputChange}></input>
                </div>
            </div>

            <div className="steplast">
                <h4>{hideImageUpload ? "2단계: 생성하기" : "3단계: 생성하기"}</h4>
            </div>

            <div className="wrapper">
                <label htmlFor="wrapperpublic">공유 갤러리</label>
                <input type="checkbox" id="switch" onChange={handleGalleryTypeChange}
                checked={projectData.galleryType === 'private'} />
                <label htmlFor="switch" className="switch_label">
                    <span className="onf_btn"></span>
                </label>
                <label htmlFor="wrapperpublic">개인 갤러리</label>
            </div>

            <div className="createbutton">
                <button className="lastcreate" onClick={handleGenerateRoom}>방 생성</button>
                <button className="lastsave" onClick={handleSave}>저장하기</button>
            </div>
        </div>
        <CreateModal
        isOpen={alertOpen}
        message={<span style={{ fontSize: '20px' }}>{alertMessage}</span>}
        onClose={() => setAlertOpen(false)}
    />
</>


    );
}

export default Create;
