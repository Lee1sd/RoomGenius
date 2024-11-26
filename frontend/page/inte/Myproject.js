import React, { useEffect, useState } from "react";
import Interiormenu from "./interiormenu";
import '../../style/Mypro.css';
//import { AiOutlineClose } from "react-icons/ai";

function Myproject() {
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null); // 모달에 표시할 이미지

    const openModal = (image) => {
        setSelectedImage(image);
    };

    const closeModal = () => {
        setSelectedImage(null);
    };
    useEffect(() => {
        // 서버에서 saved 폴더의 모든 이미지 가져오기
        fetch("http://localhost:5000/api/get-saved-images", {
            credentials: 'include',
        })
        .then((response) => {
            if (!response.ok) throw new Error("Failed to fetch images");
            return response.json();
        })
        .then((data) => {
            setImages(data); // saved 이미지 목록을 설정
        })
        .catch((error) => {
            console.error("Error fetching images:", error);
        });
    }, []);

     return (
            <div className="Mypro">
                <Interiormenu />
                <div className="MyproContent">
                    <div className="saved-images-gallery">
                        {images.map((image, index) => (
                            <div key={index} className="saved-image-item" onClick={() => openModal(image.url)}>
                                <img src={image.url} alt={`Project ${index + 1}`} />
                                <div className="myproname"><h3>Picture {index + 1}</h3></div>
                            </div>
                        ))}
                    </div>
                </div>
            {/* 모달 */}
            {selectedImage && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-button" onClick={closeModal}>×</button> {/* Close button moved */}
                        <img src={selectedImage} alt="Enlarged project" />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Myproject;
