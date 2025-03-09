const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

const app = express();

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Use express-fileupload middleware
app.use(fileUpload());

// Serve static files from the 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public1', 'index.html'));
});

// Handle image upload and MATLAB processing
app.post('/upload', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    // Access the uploaded file
    let uploadedFile = req.files.image;
    const inputImagePath = path.join(__dirname, 'uploads', uploadedFile.name);
    const outputImagePath = path.join(__dirname, 'uploads', 'processed_' + uploadedFile.name);

    // Save the uploaded file
    uploadedFile.mv(inputImagePath, (err) => {
        if (err) {
            return res.status(500).send(err);
        }

        // Call MATLAB to process the image
        const matlabCommand = `matlab -nosplash -nodesktop -r "addpath('C:/56/matmoon'); processImage('${inputImagePath}', '${outputImagePath}'); exit;"`;


        exec(matlabCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing MATLAB: ${error.message}`);
                return res.status(500).send('Error processing image.');
            }
            console.error(`MATLAB stderr: ${stderr}`);
            console.log(`MATLAB stdout: ${stdout}`);

            // Send the processed image URL back to the client
            res.json({ imageUrl: `/uploads/processed_${uploadedFile.name}` });
        });
    });
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
