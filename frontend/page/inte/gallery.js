import React, { useState, useEffect, useContext } from "react";
import '../../style/gallery.css';
import Galleryintro from "../../assets/이미지/gen.png";
import Gallery1 from "../../assets/이미지/공학관_북카페.png";
import Gallery2 from "../../assets/이미지/공학관_계단.png";
import Gallery3 from "../../assets/이미지/아이들욕실.png";
import Gallery4 from "../../assets/이미지/aacl.png";
import Gallery5 from "../../assets/이미지/1163앞.png";
import Gallery6 from "../../assets/이미지/공학관_복도.png";
import Gallery7 from "../../assets/이미지/공학관_계단아래2.png";
import Gallery8 from "../../assets/이미지/공주방3.png";
import Profile1 from "../../assets/이미지/pro1.jpg";
import Profile2 from "../../assets/이미지/pro2.jpg";
import Profile3 from "../../assets/이미지/pro3.jpg";
import Profile4 from "../../assets/이미지/pro5.jpg";
import Profile5 from "../../assets/이미지/pro4.webp";
import Profile6 from "../../assets/이미지/pro6.webp";
import Profile7 from "../../assets/이미지/pro7.webp";
import Profile8 from "../../assets/이미지/pro8.jpg";
import { NameContext } from '../Auth/NameContext';

function Gallery() {
    const [isShareModalOpen, setIsModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [likes, setLikes] = useState(Array(8).fill(0));
    const { name } = useContext(NameContext);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const titles = ["공학관 북카페", "공학관 계단 아래!", "아이들 욕실", "a1401", "1163 앞", "공학관 복도", "럭셔리 도서관", "딸을 위한 공주방"];
    const images = [Gallery1, Gallery2, Gallery3, Gallery4, Gallery5, Gallery6, Gallery7, Gallery8];
    const profileImages = [Profile1, Profile2, Profile3, Profile4, Profile5, Profile6, Profile7, Profile8];

    const [commentWidth, setCommentWidth] = useState("100%"); // 댓글 입력란 너비 상태

    useEffect(() => {
        const storedLikes = localStorage.getItem("likes");
        if (storedLikes) {
            setLikes(JSON.parse(storedLikes));
        }
    }, []);

    const openModal = (image, index) => {
        setSelectedImage(image);
        setSelectedIndex(index);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedImage(null);
    };

    const handleLike = (index) => {
        const newLikes = [...likes];
        newLikes[index] += 1;
        setLikes(newLikes);
        localStorage.setItem("likes", JSON.stringify(newLikes));
    };

    const [comments, setComments] = useState([[], [], [], [], [], [], [], []]);
    const [comment, setComment] = useState("");

    const handleCommentChange = (e) => {
        setComment(e.target.value);
    };

    const handleAddComment = () => {
        if (comment.trim() !== "") {
            const newComments = [...comments];
            newComments[selectedIndex] = [...newComments[selectedIndex], comment];
            setComments(newComments);
            setComment("");
        }
    };

    return (
        <>
            <div className="galleryintro">
                <img src={Galleryintro} alt="Gallery Intro" className="background-image"/>
                <h1 className="gallery-title">Interior Gallery</h1>
            </div>
            <div className="gallerycont">
                {images.map((image, index) => (
                    <div key={index} className="gallery-item">
                        <img src={image} alt={`Gallery ${index + 1}`} onClick={() => openModal(image, index)}/>
                        <div className="image-details">
                            <img src={profileImages[index]} alt="galleryprofile" className="galleryprofile"/>
                            <p className="title">{titles[index]}</p>
                        </div>
                    </div>
                ))}
            </div>

            {isShareModalOpen && (
            <div className="modal">
                <div className="modalgallerycontent">
                    <span className="close" onClick={closeModal}>&times;</span>

                    <div style={{ position: 'relative' }}>
                        <img src={selectedImage} alt="Selected"/>
                    </div>

                    <div className="sharecomment">
                        <div className="comment-list">
                            {comments[selectedIndex].map((comment, idx) => (
                                <div key={idx} className="comment">
                                    {comment}
                                </div>
                            ))}
                        </div>
                        <div className="textarea-wrapper">
                            <div className="like-section">
                                <button className="like-icon" onClick={() => handleLike(selectedIndex)}>
                                    ❤
                                </button>
                                <span className="like-count">{likes[selectedIndex]}</span>
                            </div>
                            <textarea
                                className="comment-textarea"
                                style={{ width: 150 }} // 동적으로 너비 조정 가능
                                name="comment"
                                placeholder="의견을 남겨주세요"
                                value={comment}
                                onChange={handleCommentChange}
                            ></textarea>
                            <button className="commentbutton" onClick={handleAddComment}>comment</button>
                        </div>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}

export default Gallery;
