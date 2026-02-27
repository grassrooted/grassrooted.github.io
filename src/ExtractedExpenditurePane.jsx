import ExtractedExpenditureRecord from "./ExtractedExpenditureRecord";

const ExtractedExpenditurePane = ({
  extractedExpenditures,
  formExpenditures,
  setFormState
}) => {
  return (
    <section className="expenditure-pane">
      <h2 className="section-title">Expenditures</h2>
      <div className="expenditure-grid">
        {formExpenditures.map(record => (
          <ExtractedExpenditureRecord
            key={record.record_id}
            record={record}
            extractedRecord={
              extractedExpenditures.find(
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

export default ExtractedExpenditurePane;
