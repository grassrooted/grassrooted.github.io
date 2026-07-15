import React from "react";
import "./TotalsValidationPanel.css";

const TotalsValidationPanel = ({
  contributionSum = 0,
  expenditureSum = 0,
  personalFundsExpenditureSum = 0,
  loansSum = 0,
  creditCardExpenditureSum = 0,
  interestGainedSum = 0,
  investmentPurchasesSum = 0,
  officialContributionTotal = 0,
  officialExpenditureTotal = 0,
  officialPersonalFundsExpenditureTotal = 0,
  officialLoansTotal = 0,
  officialCreditCardExpenditureTotal = 0,
  officialInterestGainedTotal = 0,
  officialInvestmentPurchasesTotal = 0,
  officialInKindContributionsTotal=0,
  officialNonPoliticalExpendituresTotal=0,
  officialPledgedContributionsTotal=0,
  officialPaymentsToCandidateBusinessTotal=0,
  officialUnpaidObligationsTotal=0
}) => {
  const nearlyEqual = (a, b) => Math.abs(a - b) < 0.01;

  const contributionsMatch = nearlyEqual(
    officialContributionTotal,
    contributionSum
  );

  const expendituresMatch = nearlyEqual(
    officialExpenditureTotal,
    expenditureSum
  );

  const personalFundsExpendituresMatch = nearlyEqual(
    officialPersonalFundsExpenditureTotal,
    personalFundsExpenditureSum
  );

  const loansMatch = nearlyEqual(
    officialLoansTotal,
    loansSum
  );

  const creditCardExpendituresMatch = nearlyEqual(
    officialCreditCardExpenditureTotal,
    creditCardExpenditureSum
  );

  const interestGainedMatch = nearlyEqual(
    officialInterestGainedTotal,
    interestGainedSum
  );

  const investmentPurchasesMatch = nearlyEqual(
    officialInvestmentPurchasesTotal,
    investmentPurchasesSum
  );

  const formatCurrency = (value) =>{
    const number = Number(value)

    if (isNaN(number)) return "$0.00";

    return number.toLocaleString("en-US", {
      style: "currency",
      currency: "USD"
    })
  };

  return (
    <div className="totals-panel">
      <h3 className="panel-title">Report Validation</h3>

      <div className="totals-section">
        <h4 className="section-title">Contributions</h4>

        <div className="totals-row">
          <span>Reported</span>
          <strong>{formatCurrency(officialContributionTotal)}</strong>
        </div>

        <div className="totals-row">
          <span>Calculated</span>
          <strong>{formatCurrency(contributionSum)}</strong>
        </div>

        <div
          className={`status ${
            contributionsMatch ? "success" : "error"
          }`}
        >
          {contributionsMatch ? "✓ Totals Match" : "✗ Totals Do Not Match"}
        </div>
      </div>

      <div className="totals-divider" />

      <div className="totals-section">
        <h4 className="section-title">Expenditures</h4>

        <div className="totals-row">
          <span>Reported</span>
          <strong>{formatCurrency(officialExpenditureTotal)}</strong>
        </div>

        <div className="totals-row">
          <span>Calculated</span>
          <strong>{formatCurrency(expenditureSum)}</strong>
        </div>

        <div
          className={`status ${
            expendituresMatch ? "success" : "error"
          }`}
        >
          {expendituresMatch ? "✓ Totals Match" : "✗ Totals Do Not Match"}
        </div>
      </div>

      <div className="totals-divider" />

      <div className="totals-section">
        <h4 className="section-title">Personal Funds Expenditures</h4>

        <div className="totals-row">
          <span>Reported</span>
          <strong>{formatCurrency(officialPersonalFundsExpenditureTotal)}</strong>
        </div>

        <div className="totals-row">
          <span>Calculated</span>
          <strong>{formatCurrency(personalFundsExpenditureSum)}</strong>
        </div>

        <div
          className={`status ${
            personalFundsExpendituresMatch ? "success" : "error"
          }`}
        >
          {personalFundsExpendituresMatch ? "✓ Totals Match" : "✗ Totals Do Not Match"}
        </div>
      </div>

      <div className="totals-divider" />

      <div className="totals-section">
        <h4 className="section-title">Loans</h4>

        <div className="totals-row">
          <span>Reported</span>
          <strong>{formatCurrency(officialLoansTotal)}</strong>
        </div>

        <div className="totals-row">
          <span>Calculated</span>
          <strong>{formatCurrency(loansSum)}</strong>
        </div>

        <div
          className={`status ${
            loansMatch ? "success" : "error"
          }`}
        >
          {loansMatch ? "✓ Totals Match" : "✗ Totals Do Not Match"}
        </div>
      </div>

      <div className="totals-divider" />

      <div className="totals-section">
        <h4 className="section-title">Credit Card Expenditures</h4>

        <div className="totals-row">
          <span>Reported</span>
          <strong>{formatCurrency(officialCreditCardExpenditureTotal)}</strong>
        </div>

        <div className="totals-row">
          <span>Calculated</span>
          <strong>{formatCurrency(creditCardExpenditureSum)}</strong>
        </div>

        <div
          className={`status ${
            creditCardExpendituresMatch ? "success" : "error"
          }`}
        >
          {creditCardExpendituresMatch ? "✓ Totals Match" : "✗ Totals Do Not Match"}
        </div>
      </div>

      <div className="totals-divider" />

      <div className="totals-section">
        <h4 className="section-title">Interest Gained</h4>

        <div className="totals-row">
          <span>Reported</span>
          <strong>{formatCurrency(officialInterestGainedTotal)}</strong>
        </div>

        <div className="totals-row">
          <span>Calculated</span>
          <strong>{formatCurrency(interestGainedSum)}</strong>
        </div>

        <div
          className={`status ${
            interestGainedMatch ? "success" : "error"
          }`}
        >
          {interestGainedMatch ? "✓ Totals Match" : "✗ Totals Do Not Match"}
        </div>
      </div>

      <div className="totals-divider" />

      <div className="totals-section">
        <h4 className="section-title">Investment Purchases</h4>


        <div className="totals-row">
            <span>Reported</span>
            <strong>{formatCurrency(officialInvestmentPurchasesTotal)}</strong>
        </div>

        <div className="totals-row">
          <span>Calculated</span>
          <strong>{formatCurrency(investmentPurchasesSum)}</strong>
        </div>

        <div
          className={`status ${
            investmentPurchasesMatch ? "success" : "error"
          }`}
        >
          {investmentPurchasesMatch ? "✓ Totals Match" : "✗ Totals Do Not Match"}
        </div>
      </div>

      <div className="totals-divider" />

      <div className="totals-section">
        <h4 className="section-title">In-Kind Contributions</h4>


        <div className="totals-row">
            <span>Reported</span>
            <strong>{formatCurrency(officialInKindContributionsTotal)}</strong>
        </div>

        <div className="status unrecorded">
          Unrecorded Records
        </div>
      </div>

      <div className="totals-divider" />

      <div className="totals-section">
        <h4 className="section-title">Non-Political Expenditures Using Political Contributions</h4>


        <div className="totals-row">
            <span>Reported</span>
            <strong>{formatCurrency(officialNonPoliticalExpendituresTotal)}</strong>
        </div>

        <div className="status unrecorded">
          Unrecorded Records
        </div>
      </div>

      <div className="totals-divider" />

      <div className="totals-section">
        <h4 className="section-title">Pledged Contributions</h4>

        <div className="totals-row">
            <span>Reported</span>
            <strong>{formatCurrency(officialPledgedContributionsTotal)}</strong>
        </div>

        <div className="status unrecorded">
          Unrecorded Records
        </div>
      </div>

      <div className="totals-divider" />

      <div className="totals-section">
        <h4 className="section-title">Payments to a Candidate's Business</h4>

        <div className="totals-row">
            <span>Reported</span>
            <strong>{formatCurrency(officialPaymentsToCandidateBusinessTotal)}</strong>
        </div>

        <div className="status unrecorded">
          Unrecorded Records
        </div>
      </div>

      <div className="totals-divider" />

      <div className="totals-section">
        <h4 className="section-title">Unpaid Incurred Obligations</h4>

        <div className="totals-row">
            <span>Reported</span>
            <strong>{formatCurrency(officialUnpaidObligationsTotal)}</strong>
        </div>

        <div className="status unrecorded">
          Unrecorded Records
        </div>
      </div>

    </div>
  );
};

export default TotalsValidationPanel;