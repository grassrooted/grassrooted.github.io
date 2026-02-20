import { useState } from "react";
import CampaignDetail from "./CampaignDetail";
import ExtractedContributionPane from "./ExtractedContributionPane";
import ExtractedExpenditurePane from "./ExtractedExpenditurePane";
import DownloadVerifiedDataset from "./DownloadVerifiedDataset";
import "./CampfinReviewPage.css";
import { generateRecordId } from "./utils/generateRecordId";

function hydrateFormState(parsedData) {
  const contributionsWithIds = parsedData.contributions.map((c) => ({
    ...c,
    record_id: generateRecordId(c, "contribution")
  }));

  const expendituresWithIds = (parsedData.expenditures || []).map((e) => ({
    ...e,
    record_id: generateRecordId(e, "expenditure")
  }));

  return {
    candidate_info: {
      first_name: parsedData.candidate_info.first_name || "",
      last_name: parsedData.candidate_info.last_name || "",
      office_sought: parsedData.candidate_info.office_sought || "",
      period_start: parsedData.candidate_info.period_start || "",
      period_end: parsedData.candidate_info.period_end || ""
    },
    contributions: contributionsWithIds,
    expenditures: expendituresWithIds
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

      <ExtractedExpenditurePane  
        extractedExpenditures={extractedData.expenditures}
        formExpenditures={formState.expenditures}
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
