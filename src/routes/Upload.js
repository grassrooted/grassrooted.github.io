import '../Upload.css'
import React, {useState } from "react";
import CampfinReviewPage from '../CampfinReviewPage';

function Upload() {
    const [cohFile, setCohFile] = useState(null);
    const [supplementalFile, setSupplementalFile] = useState(null);
    const [parsedData, setParsedData] = useState(null);

    const [loading, setLoading] = useState(false);

    async function handleUpload() {
        if (!cohFile) {
          alert("Please select a PDF file first.");
          return;
        }
    
        const cohFormData = new FormData();
        cohFormData.append("file", cohFile);


        const supplementalFormData = new FormData();
        supplementalFormData.append("file", supplementalFile)
    
        setLoading(true);
        try {
            const cohResponse = await fetch("http://localhost:8000/extractCOH", {
            method: "POST",
            body: cohFormData
            });

            const supplementalResponse = await fetch("http://localhost:8000/extractSupplemental", {
                method: "POST",
                body: supplementalFormData
            })

            const cohData = await cohResponse.json();

            const supplementalData = await supplementalResponse.json()

            if (supplementalData){
                const cohReportTotals = cohData["candidate_info"]["report_totals"]
                const supplementalReportTotals = supplementalData["candidate_info"]["report_totals"]

                const combinedReportTotals = {...cohReportTotals, ...supplementalReportTotals}
                supplementalData["candidate_info"]["report_totals"] = combinedReportTotals

                if (supplementalData["candidate_info"]["office_sought"] == "Not Found"){
                    supplementalData["candidate_info"]["office_sought"] = cohData["candidate_info"]["office_sought"]
                }
                setParsedData(supplementalData);
            }
            else{
                setParsedData(cohData);
            }

            console.log(cohData);
            console.log(supplementalData);

        } catch (err) {
            console.error("Upload failed", err);
        } finally {
            setLoading(false);
        }
    }
    return (

        <div className='upload-section'>

            
            <h3>Upload Campaign Finance PDF</h3>
            <label htmlFor="cohFileInput">Upload Candidate/Officeholder (COH) PDF</label>
            <input
                type="file"
                id="cohFileInput"
                accept="application/pdf"
                placeholder="Upload Candidate/Officeholder (COH) PDF"
                onChange={(e) => setCohFile(e.target.files[0])}
            
            />

            <label htmlFor="supplementalFileInput">Upload Supplemental PDF (Optional)</label>
            <input
                type="file"
                id="supplementalFileInput"
                accept="application/pdf"
                onChange={(e) => setSupplementalFile(e.target.files[0])}
            
            />

            <button onClick={handleUpload} disabled={loading}>
            {loading ? "Processing..." : "Upload & Parse"}
            </button>

            {parsedData && 
                <CampfinReviewPage parsedData={parsedData} uploadedFile={supplementalFile ? supplementalFile.name : cohFile.name}/>
            }
        </div>
    );
}
export default Upload;
