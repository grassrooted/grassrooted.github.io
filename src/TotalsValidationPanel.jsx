import React from "react";
import "./TotalsValidationPanel.css";

const TotalsValidationPanel = ({
  contributionSum,
  expenditureSum,
  officialContributionTotal,
  officialExpenditureTotal
  }) => {
  const nearlyEqual = (a, b) => Math.abs(a - b) < 0.01;
  const contributionsMatch = nearlyEqual(officialContributionTotal, contributionSum)
  const expendituresMatch = nearlyEqual(officialExpenditureTotal, expenditureSum)

  return (
    <div className="totals-panel">
      <h3>Report Validation</h3>

      <div className="totals-section">
        <h4>Contributions</h4>
        <div>
          <span>Reported:</span>
          <strong>${officialContributionTotal}</strong>
        </div>
        <div>
          <span>Calculated:</span>
          <strong>${contributionSum}</strong>
        </div>
        <div
          className={
            contributionsMatch ? "status success" : "status error"
          }
        >
          {contributionsMatch ? "✓ Totals Match" : "✗ Totals Do Not Match"}
        </div>
      </div>

      <div className="totals-section">
        <h4>Expenditures</h4>
        <div>
          <span>Reported:</span>
          <strong>${officialExpenditureTotal}</strong>
        </div>
        <div>
          <span>Calculated:</span>
          <strong>${expenditureSum}</strong>
        </div>
        <div
          className={
            expendituresMatch ? "status success" : "status error"
          }
        >
          {expendituresMatch ? "✓ Totals Match" : "✗ Totals Do Not Match"}
        </div>
      </div>
    </div>
  );
};

export default TotalsValidationPanel;
