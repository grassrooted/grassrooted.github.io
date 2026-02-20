import SHA256 from "crypto-js/sha256";

/**
 * Generate deterministic hash from a record.
 * Only uses stable fields — exclude record_id itself.
 */
export function generateRecordId(record, type = "contribution") {
  // Normalize + sort keys to guarantee stability
  const normalized = normalizeRecord(record);

  const baseString = `${type}|${JSON.stringify(normalized)}`;

  return SHA256(baseString).toString();
}

function normalizeRecord(record) {
  const sortedKeys = Object.keys(record)
    .filter(key => key !== "record_id")
    .sort();

  const normalized = {};

  sortedKeys.forEach(key => {
    const value = record[key];

    normalized[key] =
      typeof value === "string"
        ? value.trim()
        : value ?? "";
  });

  return normalized;
}
