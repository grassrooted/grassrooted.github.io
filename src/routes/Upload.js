import '../Upload.css'
import React, {useState } from "react";
import CampfinReviewPage from '../CampfinReviewPage';

function Upload() {
    const [file, setFile] = useState(null);
    const [parsedData, setParsedData] = useState(null);
    const [loading, setLoading] = useState(false);

    async function handleUpload() {
        if (!file) {
          alert("Please select a PDF file first.");
          return;
        }
    
        const formData = new FormData();
        formData.append("file", file);
    
        setLoading(true);
        try {
            const response = await fetch("http://localhost:8000/extract", {
            method: "POST",
            body: formData
            });
    
            const data = await response.json();
            setParsedData(data);
            console.log(data);
        } catch (err) {
            console.error("Upload failed", err);
        } finally {
            setLoading(false);
        }
    }
    return (

        <div className='upload-section'>

            
            <h3>Upload Campaign Finance PDF</h3>

            <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            
            />

            <button onClick={handleUpload} disabled={loading}>
            {loading ? "Processing..." : "Upload & Parse"}
            </button>

            {parsedData && 
                <CampfinReviewPage parsedData={parsedData}/>
            }
        </div>
    );
}
export default Upload;
