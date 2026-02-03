import { useState } from "react";
import CampaignDetail from "./CampaignDetail";
import ExtractedContributionPane from "./ExtractedContributionPane";
import "./CampfinReviewPage.css";

function hydrateFormState(parsedData) {
  return {
    candidate_info: {
      first_name: parsedData.candidate_info.first_name || "",
      last_name: parsedData.candidate_info.last_name || "",
      office_sought: parsedData.candidate_info.office_sought || "",
      period_start: parsedData.candidate_info.period_start || "",
      period_end: parsedData.candidate_info.period_end || ""
    },
    contributions: parsedData.contributions.map((c, index) => ({
        id: index, // replace with hash/UUID later
        ...c
      }))
  };
}

function CampaignReviewPage({ parsedData }) {
    const [extractedData] = useState(parsedData);
    const [formState, setFormState] = useState(
      hydrateFormState(parsedData)
    );
  
    return (
      <main className="review-page">
        <CampaignDetail
          extractedMetadata={extractedData.candidate_info}
          formState={formState.candidate_info}
          setFormState={setFormState}
        />
  
        <ExtractedContributionPane  
          extractedContributions={extractedData.contributions}
          formContributions={formState.contributions}
          setFormState={setFormState}
        />
      </main>
    );
  }
  
export default CampaignReviewPage;
