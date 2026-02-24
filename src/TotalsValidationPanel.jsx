import React from "react";
import "./TotalsValidationPanel.css";

const TotalsValidationPanel = ({
  contributionSum = 0,
  expenditureSum = 0,
  officialContributionTotal = 0,
  officialExpenditureTotal = 0
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

  const formatCurrency = (value) =>
    value?.toLocaleString("en-US", {
      style: "currency",
      currency: "USD"
    });

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
    </div>
  );
};

export default TotalsValidationPanel;