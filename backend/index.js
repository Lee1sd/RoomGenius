const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const expressWs = require('express-ws');
const csv = require('csv-parser');
const app = express();
expressWs(app); // WebSocket 설정
const PORT = 5000;

app.use(cors({
    origin: 'http://localhost:3000', // 클라이언트의 주소를 명확하게 지정
    credentials: true,// 쿠키 허용
}));

app.use(bodyParser.json({ limit: '50mb' }));

const outputDir = path.join(__dirname,'output_images');
const samplesDir = path.join(outputDir, 'samples'); // 생성된 이미지 저장 폴더
const savedImagesDir = path.join(outputDir, 'saved'); // 저장된 이미지 폴더

if (!fs.existsSync(savedImagesDir)) {
    fs.mkdirSync(savedImagesDir, { recursive: true });
}

// output_images 폴더를 정적으로 제공하여 samples 폴더를 포함한 전체 폴더에 접근 가능하게 합니다.
app.use('/output_images', express.static(path.join(__dirname, 'output_images')));
app.use('/images', express.static(path.join("D:", "RoomGenius", "backend", "ikea_results")));

const fixedImageNames = ['00000.png', '00001.png', '00002.png'];
let clients = [];

// WebSocket 연결 관리
app.ws('/ws', (ws) => {
    clients.push(ws);
    ws.on('close', () => {
        clients = clients.filter(client => client !== ws);
    });
});

// WebSocket을 통해 프론트엔드에 알림을 보내는 함수
const notifyClients = (data) => {
    clients.forEach(client => {
        client.send(JSON.stringify(data));
    });
};

// IKEA 검색을 실행하고 CSV 경로 반환
const searchIkeaProducts = (imagePath, callback) => {
    const command = `python D:/RoomGenius/AI/search.py ${imagePath}`;
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing IKEA search script: ${error.message}`);
            callback(error, null);
        } else {
            console.log(`IKEA search completed. stdout: ${stdout}`);
            callback(null, 'products.csv');
        }
    });
};

// 이미지 업로드 기반 이미지 생성 API (img2img)
app.post('/api/generate-room', async (req, res) => {
    const { image, roomType, designStyle, intensity } = req.body;
    if (!image) {
        return res.status(400).json({ error: "이미지가 필요합니다." });
    }
    try {
        notifyClients({ isLoading: true });

        // 프롬프트 분석 단계
        const analyzeCommand = `python D:/RoomGenius/AI/scripts/img2img.py --prompt "${roomType} with ${designStyle}" --analyze-only`;
        exec(analyzeCommand, (analyzeError, analyzeStdout, analyzeStderr) => {
            if (analyzeError) {
                console.error("Prompt analysis failed: ", analyzeError);
                notifyClients({ isLoading: false });
                return res.status(400).json({ error: "시스템 오류" });
            }

            if (analyzeStdout.includes("This image cannot be generated")) {
                console.error("Prompt not suitable: ", analyzeStdout);
                notifyClients({ isLoading: false });
                return res.status(400).json({ error: "프롬프트가 적절하지 않습니다. 다시 작성해주세요" });
            }

            // 프롬프트 분석 성공 시 이미지 생성 로직 실행
            try {
                // 기존 파일 삭제
                fs.readdirSync(outputDir).forEach((file) => {
                    const filePath = path.join(outputDir, file);
                    if (file.endsWith('.png') && fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                });

                // 이미지 저장
                const imageData = image.replace(/^data:image\/png;base64,/, "");
                const inputImagePath = path.join(__dirname, 'input.png');
                fs.writeFileSync(inputImagePath, imageData, 'base64');
                // 이미지 생성 명령 실행//--strength ${intensity / 100}     0.65
                const command = `python D:/RoomGenius/AI/scripts/img2img.py --prompt "High quality real space with ${roomType} with ${designStyle}" --init-img "${inputImagePath}" --strength ${intensity / 100} --outdir ${outputDir}/samples --num-inference-steps 800`; //800
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Execution error: ${error}`);
                        notifyClients({ isLoading: false });
                        return res.status(500).json({ error: "Error executing script", details: error.message });
                    }

                    console.log(`Python script executed successfully. stdout: ${stdout}`);

                    // 생성된 파일 정리
                    const sampleFiles = fs.readdirSync(outputDir)
                        .filter(file => file.endsWith('.png'))
                        .sort((a, b) => fs.statSync(path.join(outputDir, b)).mtime - fs.statSync(path.join(outputDir, a)).mtime);

                    const fixedImageNames = ['00000.png', '00001.png', '00002.png'];
                    sampleFiles.slice(0, 3).forEach((file, index) => {
                        const oldPath = path.join(outputDir, file);
                        const newPath = path.join(outputDir, fixedImageNames[index]);
                        fs.renameSync(oldPath, newPath);
                    });

                    const imageUrls = fixedImageNames.map(name => `http://localhost:5000/output_images/samples/${name}`);
                    notifyClients({ imageUrls, isLoading: false }); // 3장의 이미지 URL 배열 전송

                    // IKEA 검색 실행 및 결과 CSV 저장
                    searchIkeaProducts(path.join(outputDir, fixedImageNames[0]), (err, csvPath) => {
                        if (err) {
                            console.error("IKEA search error: ", err);
                            return res.status(500).json({ error: "Failed to execute IKEA search." });
                        }
                        notifyClients({ message: "Room generated and IKEA search completed" }); // IKEA 검색 완료 알림 전송
                        res.status(200).json({ imageUrls, message: "Room generated and IKEA search completed." });
                    });
                });
            } catch (fileError) {
                console.error("Error processing files: ", fileError);
                notifyClients({ isLoading: false });
                res.status(500).json({ error: "File processing error", details: fileError.message });
            }
        });
    } catch (err) {
        console.error("Error in processing the request:", err);
        notifyClients({ isLoading: false });
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
});



// 텍스트 기반 이미지 생성 API (txt2img)
app.post('/api/generate-room-txt', async (req, res) => {
    const { roomType, designStyle } = req.body;

    try {
        notifyClients({ isLoading: true });

        console.log(`txt2img 스크립트 실행 시작: ${roomType} a real picture with ${designStyle}`);

        const command = `python D:/RoomGenius/AI/scripts/txt2img.py --prompt "${roomType} a real picture with ${designStyle}" --outdir ${outputDir}/samples --ddim_steps 50`;

        //const command = `python C:/Users/MMClab/RoomGenius/AI/scripts/txt2img.py --prompt "${roomType} with ${designStyle}" --outdir ${outputDir} --ddim_steps 50`;
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Execution error: ${error}`);
                notifyClients({ isLoading: false });
                return res.status(500).json({ error: "Error executing txt2img script", details: error.message });
            }

            console.log("txt2img 이미지 생성 완료");

            const sampleFiles = fs.readdirSync(outputDir)
                .filter(file => file.endsWith('.png'))
                .sort((a, b) => fs.statSync(path.join(outputDir, b)).mtime - fs.statSync(path.join(outputDir, a)).mtime);

            sampleFiles.slice(0, 3).forEach((file, index) => {
                const oldPath = path.join(outputDir, file);
                const newPath = path.join(outputDir, fixedImageNames[index]);
                fs.renameSync(oldPath, newPath);
            });

            const imageUrls = fixedImageNames.map(name => `http://localhost:5000/output_images/samples/${name}`);
            notifyClients({ imageUrls, isLoading: false }); // 3장의 이미지 URL 배열 전송
            // IKEA 검색 실행 및 결과 CSV 저장
            searchIkeaProducts(path.join(outputDir, fixedImageNames[0]), (err, csvPath) => {
                if (err) {
                    return res.status(500).json({ error: "Failed to execute IKEA search." });
                }
                notifyClients({ message: "Room generated and IKEA search completed" });  // IKEA 검색 완료 알림 전송
                res.status(200).json({ imageUrls, message: "Room generated and IKEA search completed." });
            });
        });
    } catch (err) {
        console.error("Error in processing the request:", err);
        notifyClients({ isLoading: false });
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
});

// IKEA 제품 정보를 제공하는 API
app.get("/api/products", (req, res) => {
    const csvFilePath = path.join("D:", "RoomGenius", "backend", "products.csv");
    const products = [];

    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on("data", (row) => {
            row["이미지 경로"] = `/images/${path.basename(row["이미지 경로"])}`;
            products.push(row);
        })
        .on("end", () => {
            res.json(products);
        })
        .on("error", (error) => {
            console.error("Error reading CSV file:", error);
            res.status(500).json({ error: "Failed to read CSV file" });
        });
});


/////////////////////////////////////////////////
// 이미지 저장 API
app.post('/api/save-image', (req, res) => {
    const { imageUrl, galleryType } = req.body;

    // 개인 갤러리가 아닌 경우 저장 불가
    if (galleryType !== 'private') {
        return res.status(403).json({ error: "Only private galleries can save images." });
    }

    const timestamp = Date.now();
    const imageName = `project_${timestamp}.png`;
    const sourcePath = path.join(samplesDir, path.basename(imageUrl));
    const savedPath = path.join(savedImagesDir, imageName);

    // 로그 추가: imageUrl 및 sourcePath 확인
    console.log("Attempting to save image from sourcePath:", sourcePath);

    fs.copyFile(sourcePath, savedPath, (err) => {
        if (err) {
            console.error("Error saving image:", err);
            return res.status(500).json({ error: "Failed to save image" });
        }

        res.status(200).json({ message: "Image saved successfully.", imagePath: `/output_images/saved/${imageName}` });
    });
});

// saved 폴더에 있는 모든 이미지를 반환하는 API
app.get('/api/get-saved-images', (req, res) => {
    fs.readdir(savedImagesDir, (err, files) => {
        if (err) {
            console.error("Error reading saved images:", err);
            return res.status(500).json({ error: "Failed to read saved images" });
        }

        const imageUrls = files
            .filter(file => file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg'))
            .map(file => ({ url: `http://localhost:${PORT}/output_images/saved/${file}` }));

        res.json(imageUrls);
    });
});
// 기존의 프로젝트 데이터를 저장하고 이미지를 저장하는 API 제거

// 프로젝트 데이터를 저장하는 API
app.post('/api/projects', (req, res) => {
    const { imageUrl, galleryType, ...projectData } = req.body;

    // 개인 갤러리가 아닌 경우 저장 불가
    if (galleryType !== 'private') {
        return res.status(403).json({ error: "Only private galleries can save projects." });
    }

    const projectId = `project_${Date.now()}`;
    const projectsFilePath = path.join(__dirname, 'projects', 'projects.json');
    const savedImagePath = path.join(savedImagesDir, `${projectId}.png`);

    fs.readFile(projectsFilePath, (err, data) => {
        let projects = [];
        if (!err && data.length > 0) {
            projects = JSON.parse(data);
        }

        const newProject = { id: projectId, imageUrl, galleryType, ...projectData };
        projects.push(newProject);

        fs.writeFile(projectsFilePath, JSON.stringify(projects, null, 2), (writeErr) => {
            if (writeErr) {
                console.error("Error saving project:", writeErr);
                return res.status(500).json({ error: "Failed to save project" });
            }

            notifyClients({ type: 'NEW_PROJECT', data: newProject });

            res.status(200).json({ message: "Project saved successfully.", project: newProject });
        });
    });
});


// 프로젝트 데이터를 저장하고 이미지를 저장하는 API
app.post('/api/projects', (req, res) => {
    const { imageUrl, galleryType, ...projectData } = req.body;

    // 개인 갤러리가 아닌 경우 저장 불가
    if (galleryType !== 'private') {
        return res.status(403).json({ error: "Only private galleries can save projects." });
    }

    const projectId = `project_${Date.now()}`;
    const projectsFilePath = path.join(__dirname, 'projects', 'projects.json');
    const savedImagePath = path.join(savedImagesDir, `${projectId}.png`);

    // 프로젝트 폴더가 없으면 생성
    if (!fs.existsSync(path.join(__dirname, 'projects'))) {
        fs.mkdirSync(path.join(__dirname, 'projects'), { recursive: true });
    }

    // 이미지 저장 경로 설정
    const sourcePath = path.join(samplesDir, path.basename(imageUrl));

    // 이미지 파일을 저장한 후 프로젝트 데이터 저장
    fs.copyFile(sourcePath, savedImagePath, (err) => {
        if (err) {
            console.error("Error saving image:", err);
            return res.status(500).json({ error: "Failed to save image" });
        }

        // 프로젝트 파일에 데이터 저장
        fs.readFile(projectsFilePath, (err, data) => {
            let projects = [];
            if (!err && data.length > 0) {
                projects = JSON.parse(data);
            }

            // 프로젝트 정보 추가
            const newProject = { id: projectId, imageUrl: `/output_images/saved/${projectId}.png`, galleryType, ...projectData };
            projects.push(newProject);

            fs.writeFile(projectsFilePath, JSON.stringify(projects, null, 2), (writeErr) => {
                if (writeErr) {
                    console.error("Error saving project:", writeErr);
                    return res.status(500).json({ error: "Failed to save project" });
                }

                // WebSocket을 통해 클라이언트에게 알림 전송
                notifyClients({ type: 'NEW_PROJECT', data: newProject });

                res.status(200).json({ message: "Project saved successfully.", project: newProject });
            });
        });
    });
});

// ================================================ inpainting 구현 api 추가==================================
// 마스크 이미지를 저장하는 API
app.post('/api/save-mask', (req, res) => {
    const { imageData } = req.body;
    if (!imageData) {
        return res.status(400).json({ error: "imageData is required." });
    }

    const maskDir = path.join(__dirname, 'mask');
    const savePath = path.join(maskDir, 'latest_mask.png'); // 고정된 이름으로 저장

    // 마스크 폴더가 없으면 생성
    if (!fs.existsSync(maskDir)) {
        fs.mkdirSync(maskDir, { recursive: true });
    }

    // 이미지 데이터를 파일로 저장
    const base64Data = imageData.replace(/^data:image\/png;base64,/, '');
    fs.writeFile(savePath, base64Data, 'base64', (err) => {
        if (err) {
            console.error("Error saving mask image:", err);
            return res.status(500).json({ error: "Failed to save mask image" });
        }
        res.status(200).json({ message: "Mask image saved successfully." });
    });
});

// Inpainting 작업을 수행하는 API
app.post('/api/inpainting', async (req, res) => {
    const { image, designStyle, intensity } = req.body;

    if (!image) {
        return res.status(400).json({ error: "Image is required." });
    }

    const inputImagePath = path.join(__dirname, 'input.png');
    const maskPath = path.join(__dirname, 'mask', 'latest_mask.png');

    // Save base64 image to file
    const imageData = image.replace(/^data:image\/png;base64,/, "");
    fs.writeFileSync(inputImagePath, imageData, 'base64');

    const command = `python D:/RoomGenius/AI/scripts/inpaint.py --prompt "a real picture with ${designStyle}" --init-img "${inputImagePath}" --mask-img "${maskPath}" --strength ${0.99} --outdir ${outputDir}/samples --num-inference-steps 20`;

    try {
        notifyClients({ isLoading: true });

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error("Inpainting error:", error);
                notifyClients({ isLoading: false });
                return res.status(500).json({ error: "Inpainting failed.", details: error.message });
            }

            console.log("Inpainting completed successfully.");

            // Ensure we are sending back three fixed image URLs
            const sampleFiles = fs.readdirSync(outputDir)
                .filter(file => file.endsWith('.png'))
                .sort((a, b) => fs.statSync(path.join(outputDir, b)).mtime - fs.statSync(path.join(outputDir, a)).mtime);

            sampleFiles.slice(0, 3).forEach((file, index) => {
                const oldPath = path.join(outputDir, file);
                const newPath = path.join(outputDir, fixedImageNames[index]);
                fs.renameSync(oldPath, newPath);
            });

            const imageUrls = fixedImageNames.map(name => `http://localhost:5000/output_images/samples/${name}`);
            notifyClients({ imageUrls, isLoading: false });

            // IKEA product search
            searchIkeaProducts(path.join(outputDir, fixedImageNames[0]), (err, csvPath) => {
                if (err) {
                    console.error("IKEA search error:", err);
                    notifyClients({ isLoading: false });
                    return res.status(500).json({ error: "Failed to execute IKEA search." });
                }

                // Read IKEA search results from CSV file
                const products = [];
                const csvFilePath = path.join("D:","RoomGenius", "backend", "products.csv");

                fs.createReadStream(csvFilePath)
                    .pipe(csv())
                    .on("data", (row) => {
                        row["이미지 경로"] = `/images/${path.basename(row["이미지 경로"])}`;
                        products.push(row);
                    })
                    .on("end", () => {
                        notifyClients({
                            message: "Room generated and IKEA search completed",
                            products
                        }); // IKEA 검색 결과 WebSocket 전송

                        res.status(200).json({
                            message: "Room generated and IKEA search completed",
                            imageUrls,
                            products // IKEA 검색 결과 포함
                        });
                    })
                    .on("error", (error) => {
                        console.error("Error reading IKEA search results:", error);
                        res.status(500).json({ error: "Failed to read IKEA search results." });
                    });
            });
        });
    } catch (err) {
        console.error("Error in processing the request:", err);
        notifyClients({ isLoading: false });
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});