import React from "react";

const FLOAT_FIELDS = new Set([
  "Amount",
  "latitude",
  "longitude",
]);

const DATE_FIELDS = new Set([
  "Transaction_Date"
]);

const HIDDEN_FIELDS = new Set([
  "record_id"
]);

const prettyLabel = (field) =>
  field.replace(/_/g, " ");

const ExtractedInvestmentPurchasesRecord = ({
  record,
  index,
  setFormState
}) => {

  const updateField = (field, value) => {
    setFormState(prev => {
      const updated = [...prev.investment_purchases];

      updated[index] = {
        ...updated[index],
        [field]: value
      };

      return {
        ...prev,
        investment_purchases: updated
      };
    });
  };

  const isEmpty = value =>
    value === undefined ||
    value === null ||
    value === "";

  const fieldClass = value =>
    isEmpty(value)
      ? "input-empty"
      : "";

  const orderedFields = Object.entries(record).sort(([a], [b]) => {
    if (a === "Source") return 1;
    if (b === "Source") return -1;
    return 0;
    });
  return (
    <div className="expenditure-card">

      <div className="card-header">
        <span className="donor-name">
          {record.Name || "Unnamed Investment"}
        </span>

        <span className="amount">
          ${record.Amount || "—"}
        </span>
      </div>

      <div className="card-fields">

        {Object.entries(record)
          .filter(([field]) => !HIDDEN_FIELDS.has(field))
          .map(([field, value]) => {

            let inputType = "text";

            if (DATE_FIELDS.has(field))
              inputType = "date";

            else if (FLOAT_FIELDS.has(field))
              inputType = "number";

            return (
              <label
                key={field}
                className={isEmpty(value) ? "label-empty" : ""}
              >

                {prettyLabel(field)}

                <input
                  type={inputType}
                  step={
                    FLOAT_FIELDS.has(field)
                      ? "any"
                      : undefined
                  }
                  className={fieldClass(value)}
                  value={value ?? ""}
                  onChange={e =>
                    updateField(field, e.target.value)
                  }
                />

              </label>
            );

          })}

      </div>

    </div>
  );
};

export default ExtractedInvestmentPurchasesRecord;