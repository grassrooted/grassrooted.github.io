import { useState, useMemo } from "react";
import CampaignDetail from "./CampaignDetail";
import ExtractedContributionPane from "./ExtractedContributionPane";
import ExtractedInKindContributionPane from "./ExtractedInKindContributionPane";
import ExtractedExpenditurePane from "./ExtractedExpenditurePane";
import ExtractedPersonalFundsExpenditurePane from "./ExtractedPersonalFundsExpenditurePane";
import ExtractedLoansPane from "./ExtractedLoansPane";
import ExtractedCreditCardExpenditurePane from "./ExtractedCreditCardExpenditurePane";
import ExtractedInterestGainedPane from "./ExtractedInterestGainedPane";
import ExtractedInvestmentPurchasesPane from "./ExtractedInvestmentPurchasesPane";
import DownloadVerifiedDataset from "./DownloadVerifiedDataset";
import ValidationOverridePanel from "./ValidationOverridePanel";
import "./CampfinReviewPage.css";
import { generateRecordId } from "./utils/generateRecordId";
import TotalsValidationPanel from "./TotalsValidationPanel";


const REPORT_CONTRIBUTION_TOTAL_HEADER = "Total Itemized Reported Contributions";
const REPORT_EXPENDITURE_TOTAL_HEADER = "Total Itemized Reported Expenditures";
const REPORT_PERSONAL_FUNDS_EXPENDITURE_TOTAL_HEADER = "Total Itemized Reported Expenditures Made From Personal Funds";
const REPORT_LOANS_TOTAL_HEADER = "Total Itemized Reported Loans";
const REPORT_CREDIT_CARD_EXPENDITURE_TOTAL_HEADER = "Total Itemized Reported Credit Card Expenditures";
const REPORT_INTEREST_GAINED_TOTAL_HEADER = "Total Itemized Reported Interest, Credits, Gains, Refunds, and Contributions Returned to Filer";
const REPORT_INVESTMENT_TOTAL_HEADER = "Total Itemized Reported Purchase of Investments Made From Political Contributions";
const REPORT_NON_POLITICAL_EXPENDITURES_MADE_FROM_POLITICAL_CONTRIBUTIONS = "Total Itemized Reported Non-Political Expenditures Made from Political Contributions";
const REPORT_PAYMENTS_TO_CANDIDATE_BUSINESS_TOTAL_HEADER = "Total Itemized Reported Payments Made From Political Contributions to a Business of the Candidate/Officeholder";
const REPORT_PLEDGED_CONTRIBUTIONS_TOTAL_HEADER = "Total Itemized Reported Pledged Contributions";
const REPORT_UNPAID_INCURRED_OBLIGATIONS_TOTAL_HEADER = "Total Itemized Reported Unpaid Incurred Obligations";
const REPORT_IN_KIND_CONTRIBUTIONS_TOTAL_HEADER = "Total Itemized Reported In Kind Contributions"

function hydrateFormState(parsedData) {
  const contributionsWithIds = parsedData.contributions.map((c) => ({
    ...c,
    record_id: generateRecordId(c, "contribution")
  }));

  const inKindContributionsWithIds = parsedData.in_kind_contributions.map((c) => ({
    ...c,
    record_id: generateRecordId(c, "in_kind_contribution")
  }));

  const expendituresWithIds = (parsedData.expenditures || []).map((e) => ({
    ...e,
    record_id: generateRecordId(e, "expenditure")
  }));

  const personalFundsExpendituresWithIds = (
    parsedData.personal_funds_expenditures || []
  ).map((e) => ({
    ...e,
    record_id: generateRecordId(e, "personal_funds_expenditure")
  }));

  const loansWithIds = (parsedData.loans || []).map((l) => ({
    ...l,
    record_id: generateRecordId(l, "loan")
  }));

  const creditCardExpendituresWithIds = (
    parsedData.credit_card_expenditures || []
  ).map((e) => ({
    ...e,
    record_id: generateRecordId(e, "credit_card_expenditure")
  }));

  const interestGainedWithIds = (
    parsedData.interest_gained || []
  ).map((i) => ({
    ...i,
    record_id: generateRecordId(i, "interest_gained")
  }));

  const investmentWithIds = (
    parsedData.investment_purchases || []
  ).map((i) => ({
    ...i,
    record_id: generateRecordId(i, "investment_purchases")
  }));

  return {
    candidate_info: {
      ...parsedData.candidate_info
    },
    contributions: contributionsWithIds,
    in_kind_contributions: inKindContributionsWithIds,
    expenditures: expendituresWithIds,
    personal_funds_expenditures: personalFundsExpendituresWithIds,
    loans: loansWithIds,
    credit_card_expenditures: creditCardExpendituresWithIds,
    interest_gained: interestGainedWithIds,
    investment_purchases: investmentWithIds,
    non_political_expenditures_made_from_political_contributions: [],
    payments_to_candidate_business: [],
    pledged_contributions: [],
    unpaid_incurred_obligations: []
  };
}


function CampaignReviewPage({ parsedData, uploadedFile }) {
  const EMPTY_RECORDS = {
    contributions: () => ({
      record_id: generateRecordId({}, "contribution"),
      Transaction_Date: "",
      Name: "",
      latitude: "",
      longitude: "",
      Occupation: "",
      Employer: "",
      Amount: "",
      Transaction_Type: "",
      Source : uploadedFile,
      Schedule: "A1",
      Page : ""
    }),

    in_kind_contributions: () => ({
      record_id: generateRecordId({}, "contribution"),
      Transaction_Date: "",
      Name: "",
      latitude: "",
      longitude: "",
      Description: "",
      Amount: "",
      Transaction_Type: "",
      Source : uploadedFile,
      Schedule: "A2",
      Page : ""
    }),

    expenditures: () => ({
      record_id: generateRecordId({}, "contribution"),
      Transaction_Date: "",
      Name: "",
      latitude: "",
      longitude: "",
      Category: "",
      Description: "",
      Amount: "",
      Transaction_Type: "",
      Source : uploadedFile,
      Schedule: "F1",
      Page : ""
    }),

    loans: () => ({
      record_id: generateRecordId({}, "contribution"),
      Transaction_Date: "",
      Name: "",
      latitude: "",
      longitude: "",
      Interest_Rate: "",
      Amount: "",
      Transaction_Type: "",
      Source : uploadedFile,
      Schedule: "E",
      Page : ""
    }),

    personal_funds_expenditures: () => ({
      record_id: generateRecordId({}, "contribution"),
      Transaction_Date: "",
      Name: "",
      latitude: "",
      longitude: "",
      Category: "",
      Description: "",
      Amount: "",
      Transaction_Type: "",
      Source : uploadedFile,
      Schedule: "G",
      Page : ""
    }),

    credit_card_expenditures: () => ({
      record_id: generateRecordId({}, "contribution"),
      Transaction_Date: "",
      Name: "",
      latitude: "",
      longitude: "",
      Category: "",
      Description: "",
      Amount: "",
      Transaction_Type: "",
      Source : uploadedFile,
      Schedule: "F4",
      Page : ""
    }),

    interest_gained: () => ({
      record_id: generateRecordId({}, "contribution"),
      Transaction_Date: "",
      Name: "",
      latitude: "",
      longitude: "",
      Description: "",
      Amount: "",
      Transaction_Type: "",
      Source : uploadedFile,
      Schedule: "K",
      Page : ""
    }),

    investment_purchases: () => ({
      record_id: generateRecordId({}, "contribution"),
      Transaction_Date: "",
      Name: "",
      latitude: "",
      longitude: "",
      Description: "",
      Amount: "",
      Transaction_Type: "",
      Source : uploadedFile,
      Schedule: "F3",
      Page : ""
    })
  };

  const addRecord = (datasetName) => {
    const createRecord = EMPTY_RECORDS[datasetName];

    if (!createRecord) return;

    setFormState(prev => ({
      ...prev,
      [datasetName]: [
        ...prev[datasetName],
        createRecord()
      ]
    }));
  };
  const hydratedData = hydrateFormState(parsedData);

  const [extractedData] = useState(hydratedData);
  const [formState, setFormState] = useState(hydratedData);

  const [validationOverride, setValidationOverride] = useState({
    enabled: false,
    reason: ""
  });
  console.log(parsedData)

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
  );


  const contributionSum = useMemo(() => {
    return formState.contributions.reduce(
      (total, c) => total + parseMoney(c.Amount),
      0
    ).toFixed(2);
  }, [formState.contributions]) - officialUnitemizedContributionTotal;

  const inKindContributionSum = useMemo(() => {
    return formState.in_kind_contributions.reduce(
      (total, c) => total + parseMoney(c.Amount),
      0
    ).toFixed(2);
  }, [formState.in_kind_contributions]);

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

  const loansSum = useMemo(() => {
    return formState.loans.reduce(
      (total, l) => total + parseMoney(l.Amount),
      0
    ).toFixed(2);
  }, [formState.loans]);

  const creditCardExpenditureSum = useMemo(() => {
    return formState.credit_card_expenditures.reduce(
      (total, e) => total + parseMoney(e.Amount),
      0
    ).toFixed(2);
  }, [formState.credit_card_expenditures]);

  const interestGainedSum = useMemo(() => {
    return formState.interest_gained.reduce(
      (total, i) => total + parseMoney(i.Amount),
      0
    ).toFixed(2);
  }, [formState.interest_gained]);

  const investmentPurchasesSum = useMemo(() => {
    return formState.investment_purchases.reduce(
      (total, i) => total + parseMoney(i.Amount),
      0
    ).toFixed(2);
  }, [formState.investment_purchases]);

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

  const officialLoansTotal = parseMoney(
    extractedData.candidate_info.report_totals?.[
      REPORT_LOANS_TOTAL_HEADER
    ]
  );

  const officialCreditCardExpenditureTotal = parseMoney(
    extractedData.candidate_info.report_totals?.[
      REPORT_CREDIT_CARD_EXPENDITURE_TOTAL_HEADER
    ]
  );

  const officialInterestGainedTotal = parseMoney(
    extractedData.candidate_info.report_totals?.[
      REPORT_INTEREST_GAINED_TOTAL_HEADER
    ]
  );

  const officialInvestmentPurchasesTotal = parseMoney(
    extractedData.candidate_info.report_totals?.[
      REPORT_INVESTMENT_TOTAL_HEADER
    ]
  );

  const officialInKindContributionsTotal = parseMoney(
    extractedData.candidate_info.report_totals?.[
      REPORT_IN_KIND_CONTRIBUTIONS_TOTAL_HEADER
    ]
  );

  const officialNonPoliticalExpendituresTotal = parseMoney(
    extractedData.candidate_info.report_totals?.[
      REPORT_NON_POLITICAL_EXPENDITURES_MADE_FROM_POLITICAL_CONTRIBUTIONS
    ]
  )

  const officialPaymentsToCandidateBusinessTotal = parseMoney(
    extractedData.candidate_info.report_totals?.[
      REPORT_PAYMENTS_TO_CANDIDATE_BUSINESS_TOTAL_HEADER
    ]
  )

  const officialPledgedContributionsTotal = parseMoney(
    extractedData.candidate_info.report_totals?.[
      REPORT_PLEDGED_CONTRIBUTIONS_TOTAL_HEADER
    ]
  )

  const officialUnpaidObligationsTotal = parseMoney(
    extractedData.candidate_info.report_totals?.[
      REPORT_UNPAID_INCURRED_OBLIGATIONS_TOTAL_HEADER
    ]
  )

  const isValidated =
    nearlyEqual(contributionSum, officialContributionTotal) &&
    nearlyEqual(expenditureSum, officialExpenditureTotal) &&
    nearlyEqual(personalFundsExpenditureSum, officialPersonalFundsExpenditureTotal) &&
    nearlyEqual(loansSum, officialLoansTotal) &&
    nearlyEqual(creditCardExpenditureSum, officialCreditCardExpenditureTotal) &&
    nearlyEqual(interestGainedSum, officialInterestGainedTotal) &&
    nearlyEqual(investmentPurchasesSum, officialInvestmentPurchasesTotal) &&
    nearlyEqual(inKindContributionSum, officialInKindContributionsTotal);


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
        onAddRecord={() => addRecord("contributions")}

      />

      <ExtractedInKindContributionPane
        extractedInKindContributions={extractedData.in_kind_contributions}
        formInKindContributions={formState.in_kind_contributions}
        setFormState={setFormState}
        onAddRecord={() => addRecord("in_kind_contributions")}

      />

      <ExtractedExpenditurePane
        extractedExpenditures={extractedData.expenditures}
        formExpenditures={formState.expenditures}
        setFormState={setFormState}
        onAddRecord={() => addRecord("expenditures")}
      />

      <ExtractedPersonalFundsExpenditurePane
        extractedPersonalFundsExpenditures={extractedData.personal_funds_expenditures}
        formPersonalFundsExpenditures={formState.personal_funds_expenditures}
        setFormState={setFormState}
        onAddRecord={() => addRecord("personal_funds_expenditures")}
      />
      
      <ExtractedLoansPane
        extractedLoans={extractedData.loans}
        formLoans={formState.loans}
        setFormState={setFormState}
        onAddRecord={() => addRecord("loans")}
      />

      <ExtractedCreditCardExpenditurePane
        extractedCreditCardExpenditures={extractedData.credit_card_expenditures}
        formCreditCardExpenditures={formState.credit_card_expenditures}
        setFormState={setFormState}
        onAddRecord={() => addRecord("credit_card_expenditures")}
      />

      <ExtractedInterestGainedPane
        extractedInterestGained={extractedData.interest_gained}
        formInterestGained={formState.interest_gained}
        setFormState={setFormState}
        onAddRecord={() => addRecord("interest_gained")}
      />

      <ExtractedInvestmentPurchasesPane
        extractedInvestmentPurchases={extractedData.investment_purchases}
        formInvestmentPurchases={formState.investment_purchases}
        setFormState={setFormState}
        onAddRecord={() => addRecord("investment_purchases")}
      />

      <TotalsValidationPanel
        contributionSum={contributionSum}
        inKindContributionSum={inKindContributionSum}
        expenditureSum={expenditureSum}
        personalFundsExpenditureSum={personalFundsExpenditureSum}
        loansSum={loansSum}
        creditCardExpenditureSum={creditCardExpenditureSum}
        interestGainedSum={interestGainedSum}
        investmentPurchasesSum={investmentPurchasesSum}
        officialContributionTotal={officialContributionTotal}
        officialExpenditureTotal={officialExpenditureTotal}
        officialPersonalFundsExpenditureTotal={officialPersonalFundsExpenditureTotal}
        officialLoansTotal={officialLoansTotal}
        officialCreditCardExpenditureTotal={officialCreditCardExpenditureTotal}
        officialInterestGainedTotal={officialInterestGainedTotal}
        officialInvestmentPurchasesTotal={officialInvestmentPurchasesTotal}
        officialInKindContributionsTotal={officialInKindContributionsTotal}
        officialNonPoliticalExpendituresTotal={officialNonPoliticalExpendituresTotal}
        officialPledgedContributionsTotal={officialPledgedContributionsTotal}
        officialPaymentsToCandidateBusinessTotal={officialPaymentsToCandidateBusinessTotal}
        officialUnpaidObligationsTotal={officialUnpaidObligationsTotal}
      />


      {!isValidated && (
        <>
          <p className="validation-warning">
            Record totals do not match official report totals.
          </p>

          <ValidationOverridePanel
            validationOverride={validationOverride}
            setValidationOverride={setValidationOverride}
          />
        </>
      )}


      <DownloadVerifiedDataset
        formState={formState}
        extractedData={extractedData}
        isValidated={isValidated}
        validationOverride={validationOverride}
        REPORT_CONTRIBUTION_TOTAL_HEADER={
          REPORT_CONTRIBUTION_TOTAL_HEADER
        }
        REPORT_EXPENDITURE_TOTAL_HEADER={
          REPORT_EXPENDITURE_TOTAL_HEADER
        }
        uploadedFile={uploadedFile}
      />

    </main>
  );
}


export default CampaignReviewPage;