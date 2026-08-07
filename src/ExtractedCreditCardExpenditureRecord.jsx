import React from "react";

const FLOAT_FIELDS = new Set([
  "Amount",
  "latitude",
  "longitude"
]);

const DATE_FIELDS = new Set([
  "Transaction_Date"
]);

const HIDDEN_FIELDS = new Set([
  "record_id"
]);

const prettyLabel = (field) =>
  field.replace(/_/g, " ");

const ExtractedCreditCardExpenditureRecord = ({
  record,
  index,
  setFormState
}) => {

  const updateField = (field, value) => {
    setFormState(prev => {
      const updated = [...prev.credit_card_expenditures];

      updated[index] = {
        ...updated[index],
        [field]: value
      };

      return {
        ...prev,
        credit_card_expenditures: updated
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

  return (
    <div className="expenditure-card">

      <div className="card-header">
        <span className="vendor-name">
          {record.Name || "Unnamed Vendor"}
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

export default ExtractedCreditCardExpenditureRecord;