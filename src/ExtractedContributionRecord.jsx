import React from "react";

const ExtractedContributionRecord = ({
  record,
  extractedRecord,
  index,
  setFormState
}) => {
  const updateField = (field, value) => {
    setFormState(prev => {
      const updated = [...prev.contributions];
      updated[index] = {
        ...updated[index],
        [field]: value
      };

      return {
        ...prev,
        contributions: updated
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
    <div className="contribution-card">
      <div className="card-header">
        <span className="donor-name">
          {record.Name || "Unnamed Contributor"}
        </span>
        <span className="amount">
          ${record.Amount || "—"}
        </span>
      </div>

      <div className="card-fields">
        <label className={isEmpty(record.Name) ? "label-empty" : ""}>
          Donor Name
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

        <label className={isEmpty(record.Employer) ? "label-empty" : ""}>
          Employer
          <input
            className={fieldClass(record.Employer)}
            value={record.Employer || ""}
            onChange={e => updateField("Employer", e.target.value)}
          />
        </label>

        <label className={isEmpty(record.Occupation) ? "label-empty" : ""}>
          Occupation
          <input
            className={fieldClass(record.Occupation)}
            value={record.Occupation || ""}
            onChange={e => updateField("Occupation", e.target.value)}
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

export default ExtractedContributionRecord;