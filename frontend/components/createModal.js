import { width } from '@fortawesome/free-solid-svg-icons/fa0';
import React, { useState } from 'react';

function AlertModal({ isOpen, message, onClose }) {
    if (!isOpen) return null;

    const createmodaloverlay ={
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1
    }

    const createmodalcontent = {
        top:'30px',
        position:'absolute',
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        width:'400px',
    }

    const cbutton = {
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '5px',
        cursor: 'pointer',
        position:'relative',
        top:'20px',
        left: '150px'

    }

    return (
        <div style={createmodaloverlay}>
            <div style={createmodalcontent}>
                <p>{message}</p>
                <button style={cbutton} onClick={onClose}>확인</button>
            </div>
        </div>
    );
}

export default AlertModal;
