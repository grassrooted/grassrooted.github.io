import React from "react";

const DownloadVerifiedDataset = ({
  formState,
  extractedData,
  isValidated,
  validationOverride,
  parseVersion = "v1.0.0",
  uploadedFile
}) => {

  const saveFilename = uploadedFile.split(".")[0];


  const generateEditLog = (originalRecords, editedRecords, recordType) => {
    const editLog = [];

    const originalMap = new Map(
      originalRecords.map(r => [r.record_id, r])
    );

    editedRecords.forEach(record => {
      const original = originalMap.get(record.record_id);
      if (!original) return;

      Object.keys(record).forEach(field => {

        if (field === "record_id") return;

        const originalValue = original[field] ?? null;
        const updatedValue = record[field] ?? null;

        if (String(originalValue) !== String(updatedValue)) {

          editLog.push({
            record_id: record.record_id,
            record_type: recordType,
            field,
            original_value: originalValue,
            updated_value: updatedValue,
            timestamp: new Date().toISOString(),
            editor: "local-admin"
          });

        }
      });
    });

    return editLog;
  };


  const generateDatasetHash = async (dataset) => {
    const encoder = new TextEncoder();

    const data = encoder.encode(
      JSON.stringify(dataset)
    );

    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      data
    );

    const hashArray = Array.from(
      new Uint8Array(hashBuffer)
    );

    return hashArray
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  };


  const canDownload =
    isValidated ||
    (
      validationOverride.enabled &&
      validationOverride.reason.trim().length > 0
    );


  const handleDownload = async () => {

    const contributionEdits = generateEditLog(
      extractedData.contributions,
      formState.contributions,
      "contribution"
    );


    const expenditureEdits = generateEditLog(
      extractedData.expenditures || [],
      formState.expenditures || [],
      "expenditure"
    );


    const personalFundsExpenditureEdits = generateEditLog(
      extractedData.personal_funds_expenditures || [],
      formState.personal_funds_expenditures || [],
      "personal_funds_expenditure"
    );


    const edit_log = [
      ...contributionEdits,
      ...expenditureEdits,
      ...personalFundsExpenditureEdits
    ];


    const verification_timestamp = new Date().toISOString();


    const dataset = {

      metadata: {
        verification_timestamp,
        parse_version: parseVersion,

        validation_override: validationOverride.enabled,

        override_reason:
          validationOverride.enabled
            ? validationOverride.reason.trim()
            : "",

        total_contributions:
          formState.contributions.length,
        total_expenditures:
          formState.expenditures?.length || 0,
        total_personal_funds_expenditures:
          formState.personal_funds_expenditures?.length || 0,
        total_in_kind_contributions:
          formState.in_kind_contributions?.length || 0,
        total_loans:
          formState.loans?.length || 0,
        total_credit_card_expenditures:
          formState.credit_card_expenditures?.length || 0,
        total_interest_gained:
          formState.interest_gained?.length || 0,
        total_investment_purchases:
          formState.investment_purchases?.length || 0,
        total_non_political_expenditures_made_from_political_contributions:
          formState.non_political_expenditures_made_from_political_contributions?.length || 0,
        total_payments_to_candidate_business:
          formState.payments_to_candidate_business?.length || 0,
        total_pledged_contributions:
          formState.pledged_contributions?.length || 0,
        total_unpaid_incurred_obligations:
          formState.unpaid_incurred_obligations?.length || 0,

        total_edits:
          edit_log.length
      },

      candidate_info: formState.candidate_info,

      contributions:
        formState.contributions,
      expenditures:
        formState.expenditures || [],
      personal_funds_expenditures:
        formState.personal_funds_expenditures || [],
      in_kind_contributions:
        formState.in_kind_contributions || [],
      loans: 
        formState.loans || [],
      credit_card_expenditures: 
        formState.credit_card_expenditures || [] ,
      interest_gained: 
        formState.interest_gained || [],
      investment_purchases:
        formState.investment_purchases || [],
      non_political_expenditures_made_from_political_contributions: 
        formState.non_political_expenditures_made_from_political_contributions || [],
      payments_to_candidate_business: 
        formState.payments_to_candidate_business || [],
      pledged_contributions: 
        formState.pledged_contributions || [],
      unpaid_incurred_obligations: 
        formState.unpaid_incurred_obligations || [],
      edit_log
    };


    const dataset_hash = await generateDatasetHash(dataset);


    dataset.metadata.dataset_hash = dataset_hash;


    const blob = new Blob(
      [
        JSON.stringify(dataset, null, 2)
      ],
      {
        type: "application/json"
      }
    );


    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = saveFilename + ".json";

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  };


  return (
    <div style={{ marginTop: "2rem" }}>

      <button
        onClick={handleDownload}
        disabled={!canDownload}
        style={{
          opacity: canDownload ? 1 : 0.5,
          cursor: canDownload
            ? "pointer"
            : "not-allowed"
        }}
      >
        Download Verified Dataset
      </button>

    </div>
  );
};


export default DownloadVerifiedDataset;