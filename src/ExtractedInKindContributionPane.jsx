import ExtractedInKindContributionRecord from "./ExtractedInKindContributionRecord";

const ExtractedInKindContributionPane = ({
  extractedInKindContributions,
  formInKindContributions,
  setFormState,
  onAddRecord
}) => {
  return (
    <section className="expenditure-pane">
      <h2 className="section-title">In Kind Contributions</h2>
      <div className="InKindContribution-grid">
        {formInKindContributions.map(record => (
          <ExtractedInKindContributionRecord
            key={record.record_id}
            record={record}
            extractedRecord={
              extractedInKindContributions.find(
                e => e.record_id === record.record_id
              )
            }
            setFormState={setFormState}
          />
        ))}
      </div>

      <div className="pane-header">
        <button
            type="button"
            onClick={onAddRecord}
        >
            + Add Record
        </button>
      </div>
    </section>
  );
};

export default ExtractedInKindContributionPane;
