import { useState, useMemo } from "react";
import CampaignDetail from "./CampaignDetail";
import ExtractedContributionPane from "./ExtractedContributionPane";
import ExtractedExpenditurePane from "./ExtractedExpenditurePane";
import DownloadVerifiedDataset from "./DownloadVerifiedDataset";
import "./CampfinReviewPage.css";
import { generateRecordId } from "./utils/generateRecordId";
import TotalsValidationPanel from "./TotalsValidationPanel";


const REPORT_CONTRIBUTION_TOTAL_HEADER = "Total Itemized Reported Contributions"
const REPORT_EXPENDITURE_TOTAL_HEADER = "Total Itemized Reported Expenditures"

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
      ...parsedData.candidate_info
    },
    contributions: contributionsWithIds,
    expenditures: expendituresWithIds
  };
}

function CampaignReviewPage({ parsedData }) {
  const hydratedData = hydrateFormState(parsedData);

  const [extractedData] = useState(hydratedData);
  const [formState, setFormState] = useState(hydratedData);

  const parseMoney = (value) => {
    if (!value) return 0;
    return Number(
      String(value).replace(/[$,]/g, "").trim()
    ) || 0;
  };

  const nearlyEqual = (a, b) => Math.abs(a - b) < 0.01;

  const contributionSum = useMemo(() => {
    return formState.contributions.reduce(
      (total, c) => total + parseMoney(c.Amount),
      0
    ).toFixed(2);
  }, [formState.contributions]);
  
  const expenditureSum = useMemo(() => {
    return formState.expenditures.reduce(
      (total, e) => total + parseMoney(e.Amount),
      0
    ).toFixed(2);
  }, [formState.expenditures]);
  
  const officialContributionTotal = parseMoney(
    extractedData.candidate_info.report_totals?.[
      REPORT_CONTRIBUTION_TOTAL_HEADER
    ]
  );
  
  const officialExpenditureTotal = parseMoney(
    extractedData.candidate_info.report_totals?.[
      REPORT_EXPENDITURE_TOTAL_HEADER
    ]
  );

  const isValidated =
    nearlyEqual(contributionSum, officialContributionTotal) &&
    nearlyEqual(expenditureSum, officialExpenditureTotal);
  
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

      <TotalsValidationPanel
        contributionSum={contributionSum}
        expenditureSum={expenditureSum}
        officialContributionTotal={officialContributionTotal}
        officialExpenditureTotal={officialExpenditureTotal}
      />

      <DownloadVerifiedDataset 
        formState={formState}
        extractedData={extractedData}
        disabled={!isValidated}
        REPORT_CONTRIBUTION_TOTAL_HEADER={REPORT_CONTRIBUTION_TOTAL_HEADER}
        REPORT_EXPENDITURE_TOTAL_HEADER={REPORT_EXPENDITURE_TOTAL_HEADER}
      />

      {!isValidated && (
        <p className="validation-warning">
          Record totals do not match official report totals.
        </p>
      )}
    </main>
  );
}

  
export default CampaignReviewPage;
