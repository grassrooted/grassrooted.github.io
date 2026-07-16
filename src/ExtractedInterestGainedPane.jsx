import ExtractedInterestGainedRecord from "./ExtractedInterestGainedRecord";

const ExtractedInterestGainedPane = ({
  extractedInterestGained,
  formInterestGained,
  setFormState
}) => {
  return (
    <section className="interest-gained-pane">
      <h2 className="section-title">Interest Gained</h2>
      <div className="expenditure-grid">
        {formInterestGained.map(record => (
          <ExtractedInterestGainedRecord
            key={record.record_id}
            record={record}
            extractedRecord={
              extractedInterestGained.find(
                e => e.record_id === record.record_id
              )
            }
            setFormState={setFormState}
          />
        ))}
      </div>
    </section>
  );
};

export default ExtractedInterestGainedPane;
