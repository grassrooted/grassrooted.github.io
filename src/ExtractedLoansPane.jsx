import ExtractedLoansRecord from "./ExtractedLoansRecord";

const ExtractedLoansPane = ({
  extractedLoans,
  formLoans,
  setFormState
}) => {
  return (
    <section className="expenditure-pane">
      <h2 className="section-title">Loans</h2>
      <div className="expenditure-grid">
        {formLoans.map(record => (
          <ExtractedLoansRecord
            key={record.record_id}
            record={record}
            extractedRecord={
              extractedLoans.find(
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

export default ExtractedLoansPane;
