import React from "react";

const ExtractedLoansRecord = ({
  record,
  extractedRecord,
  setFormState
}) => {

  const updateField = (field, value) => {
    setFormState(prev => {
      const updated = prev.loans.map(loan =>
        loan.record_id === record.record_id
          ? { ...loan, [field]: value }
          : loan
      );

      return {
        ...prev,
        loans: updated
      };
    });
  };

  const isEmpty = (value) =>
    value === undefined ||
    value === null ||
    value === "";

  const fieldClass = (value) =>
    isEmpty(value) ? "input-empty" : "";

  return (
    <div className="expenditure-card">
      <div className="card-header">
        <span className="lender-name">
          {record.Name || "Unnamed Lender"}
        </span>
        <span className="amount">
          ${record.Amount || "—"}
        </span>
      </div>

      <div className="card-fields">
        <label className={isEmpty(record.Name) ? "label-empty" : ""}>
          Lender Name
          <input
            className={fieldClass(record.Name)}
            value={record.Name || ""}
            onChange={e => updateField("Name", e.target.value)}
          />
        </label>

        <label className={isEmpty(record.Amount) ? "label-empty" : ""}>
          Amount
          <input
            type="number"
            className={fieldClass(record.Amount)}
            value={record.Amount || ""}
            onChange={e => updateField("Amount", e.target.value)}
          />
        </label>

        <label className={isEmpty(record.Interest_Rate) ? "label-empty" : ""}>
          Interest Rate
          <input
            type="number"
            className={fieldClass(record.Interest_Rate)}
            value={record.Interest_Rate || ""}
            onChange={e => updateField("Interest_Rate", e.target.value)}
          />
        </label>

        <label className={isEmpty(record.Transaction_Type) ? "label-empty" : ""}>
          Transaction Type
          <input
            className={fieldClass(record.Transaction_Type)}
            value={record.Transaction_Type || ""}
            onChange={e => updateField("Transaction_Type", e.target.value)}
          />
        </label>

        <label
          className={
            isEmpty(record.Transaction_Date) ? "label-empty" : ""
          }
        >
          Transaction Date
          <input
            type="date"
            className={fieldClass(record.Transaction_Date)}
            value={record.Transaction_Date || ""}
            onChange={e =>
              updateField("Transaction_Date", e.target.value)
            }
          />
        </label>
      </div>
    </div>
  );
};

export default ExtractedLoansRecord;