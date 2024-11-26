// NameContext.js
import React, { createContext, useState, useEffect } from 'react';
import RoomIcon from '../../assets/이미지/user.png';

export const NameContext = createContext();

export const NameProvider = ({ children }) => {
    const [name, setName] = useState(() => localStorage.getItem("profileName") || "강지현");
    const [profileImage, setProfileImage] = useState(() => localStorage.getItem("profileImage")|| RoomIcon);

    useEffect(() => {
        localStorage.setItem("profileName", name); // name이 변경될 때마다 localStorage에 저장
    }, [name]);

    useEffect(() => {
        if (profileImage !== RoomIcon) {
            localStorage.setItem("profileImage", profileImage); // profileImage가 변경될 때마다 localStorage에 저장
        }
    }, [profileImage]);

    return (
        <NameContext.Provider value={{ name, setName, profileImage, setProfileImage }}>
            {children}
        </NameContext.Provider>
    );
};
