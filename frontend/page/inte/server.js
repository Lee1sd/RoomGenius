const express = require('express');
const cors = require('cors');
const app = express();

// CORS 설정
app.use(cors({
    origin: 'http://localhost:3000', 
    credentials: true,
}));

// 요청 본문 크기 설정
app.use(express.json({ limit: '10mb' })); // 최대 10MB로 설정
app.use(express.urlencoded({ limit: '10mb', extended: true })); // URL-encoded 데이터 최대 10MB로 설정

// 나머지 서버 설정 및 라우트
app.post('/api/projects', (req, res) => {
    const project = req.body;

    // 프로젝트 저장 로직 (DB에 저장 등)
    // 예시로, 새 프로젝트의 ID를 생성
    const newProject = { id: Date.now(), ...project }; // ID를 포함한 객체 생성

    // 프로젝트를 DB에 저장하는 로직이 필요함

    res.status(201).json(newProject); // 클라이언트에 새 프로젝트 반환
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT}에서 실행 중입니다.`);
});
