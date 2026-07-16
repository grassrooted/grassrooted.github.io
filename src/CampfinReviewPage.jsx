import { useState, useMemo } from "react";
import CampaignDetail from "./CampaignDetail";
import ExtractedContributionPane from "./ExtractedContributionPane";
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
const REPORT_IN_KIND_CONTRIBUTION_TOTAL_HEADER = "Total Itemized Reported In Kind Contributions";
const REPORT_NON_POLITICAL_EXPENDITURES_MADE_FROM_POLITICAL_CONTRIBUTIONS = "Total Itemized Reported Non-Political Expenditures Made from Political Contributions";
const REPORT_PAYMENTS_TO_CANDIDATE_BUSINESS_TOTAL_HEADER = "Total Itemized Reported Payments Made From Political Contributions to a Business of the Candidate/Officeholder";
const REPORT_PLEDGED_CONTRIBUTIONS_TOTAL_HEADER = "Total Itemized Reported Pledged Contributions";
const REPORT_UNPAID_INCURRED_OBLIGATIONS_TOTAL_HEADER = "Total Itemized Reported Unpaid Incurred Obligations";

function hydrateFormState(parsedData) {
  const contributionsWithIds = parsedData.contributions.map((c) => ({
    ...c,
    record_id: generateRecordId(c, "contribution")
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
    expenditures: expendituresWithIds,
    personal_funds_expenditures: personalFundsExpendituresWithIds,
    loans: loansWithIds,
    credit_card_expenditures: creditCardExpendituresWithIds,
    interest_gained: interestGainedWithIds,
    investment_purchases: investmentWithIds,
    in_kind_contributions: [],
    non_political_expenditures_made_from_political_contributions: [],
    payments_to_candidate_business: [],
    pledged_contributions: [],
    unpaid_incurred_obligations: []
  };
}


function CampaignReviewPage({ parsedData, uploadedFile }) {
  const hydratedData = hydrateFormState(parsedData);

  const [extractedData] = useState(hydratedData);
  const [formState, setFormState] = useState(hydratedData);

  const [validationOverride, setValidationOverride] = useState({
    enabled: false,
    reason: ""
  });


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
      REPORT_IN_KIND_CONTRIBUTION_TOTAL_HEADER
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
    nearlyEqual(investmentPurchasesSum, officialInvestmentPurchasesTotal);


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
      
      <ExtractedLoansPane
        extractedLoans={extractedData.loans}
        formLoans={formState.loans}
        setFormState={setFormState}
      />

      <ExtractedCreditCardExpenditurePane
        extractedCreditCardExpenditures={extractedData.credit_card_expenditures}
        formCreditCardExpenditures={formState.credit_card_expenditures}
        setFormState={setFormState}
      />

      <ExtractedInterestGainedPane
        extractedInterestGained={extractedData.interest_gained}
        formInterestGained={formState.interest_gained}
        setFormState={setFormState}
      />

      <ExtractedInvestmentPurchasesPane
        extractedInvestmentPurchases={extractedData.investment_purchases}
        formInvestmentPurchases={formState.investment_purchases}
        setFormState={setFormState}
      />

      <TotalsValidationPanel
        contributionSum={contributionSum}
        expenditureSum={expenditureSum}
        personalFundsExpenditureSum={personalFundsExpenditureSum}
        loansSum={loansSum}
        creditCardExpenditureSum={0}
        interestGainedSum={interestGainedSum}
        investmentPurchasesSum={investmentPurchasesSum}
        officialContributionTotal={officialContributionTotal}
        officialExpenditureTotal={officialExpenditureTotal}
        officialPersonalFundsExpenditureTotal={officialPersonalFundsExpenditureTotal}
        officialLoansTotal={officialLoansTotal}
        officialCreditCardExpenditureTotal={0}
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