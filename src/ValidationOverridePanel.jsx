import React from "react";

const ValidationOverridePanel = ({
  validationOverride,
  setValidationOverride
}) => {

  const handleToggle = (event) => {
    const enabled = event.target.checked;

    setValidationOverride({
      enabled,
      reason: enabled ? validationOverride.reason : ""
    });
  };


  const handleReasonChange = (event) => {
    setValidationOverride({
      ...validationOverride,
      reason: event.target.value
    });
  };


  return (
    <div className="validation-override-panel">

      <label>
        <input
          type="checkbox"
          checked={validationOverride.enabled}
          onChange={handleToggle}
        />

        Override validation failure
      </label>


      {validationOverride.enabled && (
        <div className="override-reason-container">

          <label htmlFor="override-reason">
            Reason for override:
          </label>

          <textarea
            id="override-reason"
            value={validationOverride.reason}
            onChange={handleReasonChange}
            placeholder="Explain why this dataset is being manually verified..."
            rows={4}
          />

        </div>
      )}

    </div>
  );
};


export default ValidationOverridePanel;