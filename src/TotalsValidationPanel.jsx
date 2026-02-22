import React, { useMemo } from "react";
import "./TotalsValidationPanel.css";

function parseCurrency(value) {
  if (!value) return 0;

  // Remove $ , spaces etc
  const cleaned = String(value).replace(/[^0-9.-]+/g, "");
  return parseFloat(cleaned) || 0;
}

const TotalsValidationPanel = ({
  reportTotals,
  contributions,
  expenditures,
}) => {
  const {
    calculatedContributionTotal,
    calculatedExpenditureTotal,
    reportedContributionTotal,
    reportedExpenditureTotal,
    contributionsMatch,
    expendituresMatch
  } = useMemo(() => {
    const reportedContributionTotal = parseCurrency(
      reportTotals?.[
        "TOTAL POLITICAL CONTRIBUTIONS (OTHER THAN PLEDGES, LOANS, OR GUARANTEES OF LOANS)"
      ]
    );

    const reportedExpenditureTotal = parseCurrency(
      reportTotals?.["TOTAL POLITICAL EXPENDITURES"]
    );

    const calculatedContributionTotal = contributions.reduce(
      (sum, c) => sum + parseCurrency(c.Amount),
      0
    );

    const calculatedExpenditureTotal = expenditures.reduce(
      (sum, e) => sum + parseCurrency(e.Amount),
      0
    );

    return {
      reportedContributionTotal,
      reportedExpenditureTotal,
      calculatedContributionTotal,
      calculatedExpenditureTotal,
      contributionsMatch:
        reportedContributionTotal === calculatedContributionTotal,
      expendituresMatch:
        reportedExpenditureTotal === calculatedExpenditureTotal
    };
  }, [reportTotals, contributions, expenditures]);

  return (
    <div className="totals-panel">
      <h3>Report Validation</h3>

      <div className="totals-section">
        <h4>Contributions</h4>
        <div>
          <span>Reported:</span>
          <strong>${reportedContributionTotal.toFixed(2)}</strong>
        </div>
        <div>
          <span>Calculated:</span>
          <strong>${calculatedContributionTotal.toFixed(2)}</strong>
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
          <strong>${reportedExpenditureTotal.toFixed(2)}</strong>
        </div>
        <div>
          <span>Calculated:</span>
          <strong>${calculatedExpenditureTotal.toFixed(2)}</strong>
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
