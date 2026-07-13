import ExtractedPersonalFundsExpenditureRecord from "./ExtractedPersonalFundsExpenditureRecord";

const ExtractedPersonalFundsExpenditurePane = ({
  extractedPersonalFundsExpenditures,
  formPersonalFundsExpenditures,
  setFormState
}) => {
  return (
    <section className="expenditure-pane">
      <h2 className="section-title">Personal Funds Expenditures</h2>
      <div className="expenditure-grid">
        {formPersonalFundsExpenditures.map(record => (
          <ExtractedPersonalFundsExpenditureRecord
            key={record.record_id}
            record={record}
            extractedRecord={
              extractedPersonalFundsExpenditures.find(
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

export default ExtractedPersonalFundsExpenditurePane;
