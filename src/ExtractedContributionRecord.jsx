import React from 'react';
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
          <label>
            Donor Name
            <input
              value={record.Name || ""}
              onChange={e => updateField("Name", e.target.value)}
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
            Employer
            <input
              value={record.Employer || ""}
              onChange={e => updateField("Employer", e.target.value)}
            />
          </label>
  
          <label>
            Occupation
            <input
              value={record.Occupation || ""}
              onChange={e => updateField("Occupation", e.target.value)}
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
  
  export default ExtractedContributionRecord;
  