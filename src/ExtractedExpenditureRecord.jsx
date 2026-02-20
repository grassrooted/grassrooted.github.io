import React from "react";

const ExtractedExpenditureRecord = ({
  record,
  extractedRecord,
  setFormState
}) => {

  const updateField = (field, value) => {
    setFormState(prev => {
      const updated = prev.expenditures.map(exp =>
        exp.record_id === record.record_id
          ? { ...exp, [field]: value }
          : exp
      );

      return {
        ...prev,
        expenditures: updated
      };
    });
  };

  return (
    <div className="expenditure-card">
      <div className="card-header">
        <span className="vendor-name">
          {record.Payee_Name || "Unnamed Vendor"}
        </span>
        <span className="amount">
          ${record.Amount || "—"}
        </span>
      </div>

      <div className="card-fields">
        <label>
          Payee Name
          <input
            value={record.Payee_Name || ""}
            onChange={e => updateField("Payee_Name", e.target.value)}
          />
        </label>

        <label>
          Amount
          <input
            type="number"
            value={record.Amount || ""}
            onChange={e => updateField("Amount", e.target.value)}
          />
        </label>

        <label>
          Purpose
          <input
            value={record.Purpose || ""}
            onChange={e => updateField("Purpose", e.target.value)}
          />
        </label>

        <label>
          Category
          <input
            value={record.Category || ""}
            onChange={e => updateField("Category", e.target.value)}
          />
        </label>

        <label>
          Transaction Date
          <input
            type="date"
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

export default ExtractedExpenditureRecord;
