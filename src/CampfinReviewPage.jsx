import { useState, useMemo } from "react";
import CampaignDetail from "./CampaignDetail";
import ExtractedContributionPane from "./ExtractedContributionPane";
import ExtractedExpenditurePane from "./ExtractedExpenditurePane";
import ExtractedPersonalFundsExpenditurePane from "./ExtractedPersonalFundsExpenditurePane";
import DownloadVerifiedDataset from "./DownloadVerifiedDataset";
import "./CampfinReviewPage.css";
import { generateRecordId } from "./utils/generateRecordId";
import TotalsValidationPanel from "./TotalsValidationPanel";


const REPORT_CONTRIBUTION_TOTAL_HEADER = "Total Itemized Reported Contributions"
const REPORT_EXPENDITURE_TOTAL_HEADER = "Total Itemized Reported Expenditures"
const REPORT_PERSONAL_FUNDS_EXPENDITURE_TOTAL_HEADER = "Total Itemized Reported Expenditures Made From Personal Funds"

function hydrateFormState(parsedData) {
  const contributionsWithIds = parsedData.contributions.map((c) => ({
    ...c,
    record_id: generateRecordId(c, "contribution")
  }));

  const expendituresWithIds = (parsedData.expenditures || []).map((e) => ({
    ...e,
    record_id: generateRecordId(e, "expenditure")
  }));

  const personalFundsExpendituresWithIds = (parsedData.personal_funds_expenditures || []).map((e) => ({
    ...e,
    record_id: generateRecordId(e, "personal_funds_expenditure")
  }));

  return {
    candidate_info: {
      ...parsedData.candidate_info
    },
    contributions: contributionsWithIds,
    expenditures: expendituresWithIds,
    personal_funds_expenditures: personalFundsExpendituresWithIds
  };
}

function CampaignReviewPage({ parsedData, uploadedFile }) {
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

  const officialUnitemizedContributionTotal = parseMoney(
    extractedData.candidate_info.report_totals?.[
      "Total Unitemized Reported Contributions"
    ]
  )

  const contributionSum = useMemo(() => {
    return formState.contributions.reduce(
      (total, c) => total + parseMoney(c.Amount),
      0
    ).toFixed(2);
  }, [formState.contributions]) - officialUnitemizedContributionTotal;
  
  const expenditureSum = useMemo(() => {
    return formState.expenditures.reduce(
      (total, e) => total + parseMoney(e.Amount),
      0
    ).toFixed(2);
  }, [formState.expenditures]);

  const personalFundsExpenditureSum = useMemo(() => {
    return formState.personal_funds_expenditures.reduce(
      (total, e) => total + parseMoney(e.Amount),
      0
    ).toFixed(2);
  }, [formState.personal_funds_expenditures]);

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

  const officialPersonalFundsExpenditureTotal = parseMoney(
    extractedData.candidate_info.report_totals?.[
      REPORT_PERSONAL_FUNDS_EXPENDITURE_TOTAL_HEADER
    ]
  );

  const isValidated =
    nearlyEqual(contributionSum, officialContributionTotal) &&
    nearlyEqual(expenditureSum, officialExpenditureTotal) &&
    nearlyEqual(personalFundsExpenditureSum, officialPersonalFundsExpenditureTotal);


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

      <ExtractedPersonalFundsExpenditurePane
        extractedPersonalFundsExpenditures={extractedData.personal_funds_expenditures}
        formPersonalFundsExpenditures={formState.personal_funds_expenditures}
        setFormState={setFormState}
      />

      <TotalsValidationPanel
        contributionSum={contributionSum}
        expenditureSum={expenditureSum}
        personalFundsExpenditureSum={personalFundsExpenditureSum}
        officialContributionTotal={officialContributionTotal}
        officialExpenditureTotal={officialExpenditureTotal}
        officialPersonalFundsExpenditureTotal={officialPersonalFundsExpenditureTotal}
      />

      <DownloadVerifiedDataset 
        formState={formState}
        extractedData={extractedData}
        disabled={!isValidated}
        REPORT_CONTRIBUTION_TOTAL_HEADER={REPORT_CONTRIBUTION_TOTAL_HEADER}
        REPORT_EXPENDITURE_TOTAL_HEADER={REPORT_EXPENDITURE_TOTAL_HEADER}
        uploadedFile = {uploadedFile}
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
