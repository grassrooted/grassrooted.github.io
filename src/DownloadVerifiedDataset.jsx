import React from "react";

const DownloadVerifiedDataset = ({
  formState,
  extractedData,
  parseVersion = "v1.0.0"
}) => {

  const generateEditLog = (originalRecords, editedRecords) => {
    const editLog = [];

    console.log(originalRecords)
    console.log(editedRecords)

    const originalMap = new Map(
      originalRecords.map(r => [r.record_id, r])
    );

    editedRecords.forEach(record => {
      const original = originalMap.get(record.record_id);
      if (!original) return;

      Object.keys(record).forEach(field => {
        // Loop through each key searching for diffs; skip record_id key
        if (field === "record_id") return;

        const originalValue = original[field] ?? null;
        const updatedValue = record[field] ?? null;

        // On diff -> push an edit log with record UUID as breadcrumb
        if (String(originalValue) !== String(updatedValue)) {
          editLog.push({
            record_id: record.record_id,
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
    const data = encoder.encode(JSON.stringify(dataset));
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  };

  const handleDownload = async () => {
    const edit_log = generateEditLog(
      extractedData.contributions,
      formState.contributions
    );

    const verification_timestamp = new Date().toISOString();

    const dataset = {
      metadata: {
        verification_timestamp,
        parse_version: parseVersion,
        total_records: formState.contributions.length
      },
      contributions: formState.contributions,
      edit_log
    };

    const dataset_hash = await generateDatasetHash(dataset);

    dataset.metadata.dataset_hash = dataset_hash;

    const blob = new Blob(
      [JSON.stringify(dataset, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "verified_contributions_dataset.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <button onClick={handleDownload}>
        Download Verified Dataset
      </button>
    </div>
  );
};

export default DownloadVerifiedDataset;
