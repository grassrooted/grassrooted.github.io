import { useState } from "react";
import CampaignDetail from "./CampaignDetail";
import ExtractedContributionPane from "./ExtractedContributionPane";
import DownloadVerifiedDataset from "./DownloadVerifiedDataset";
import "./CampfinReviewPage.css";
import { v4 as uuidv4 } from "uuid";

function hydrateFormState(parsedData) {
  const contributionsWithIds = parsedData.contributions.map((c) => ({
    record_id: uuidv4(),
    ...c
  }));

  return {
    candidate_info: {
      first_name: parsedData.candidate_info.first_name || "",
      last_name: parsedData.candidate_info.last_name || "",
      office_sought: parsedData.candidate_info.office_sought || "",
      period_start: parsedData.candidate_info.period_start || "",
      period_end: parsedData.candidate_info.period_end || ""
    },
    contributions: contributionsWithIds
  };
}


function CampaignReviewPage({ parsedData }) {
  const hydratedData = hydrateFormState(parsedData);

  const [extractedData] = useState(hydratedData);
  const [formState, setFormState] = useState(hydratedData);

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

      <DownloadVerifiedDataset 
        formState={formState}
        extractedData={extractedData}
      />
    </main>
  );
}

  
export default CampaignReviewPage;
