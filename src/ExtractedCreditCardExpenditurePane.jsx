import ExtractedCreditCardExpenditureRecord from "./ExtractedCreditCardExpenditureRecord";

const ExtractedCreditCardExpenditurePane = ({
  extractedCreditCardExpenditures,
  formCreditCardExpenditures,
  setFormState,
  onAddRecord
}) => {
  return (
    <section className="expenditure-pane">
      <h2 className="section-title">Credit Card Expenditures</h2>
      <div className="expenditure-grid">
        {formCreditCardExpenditures.map(record => (
          <ExtractedCreditCardExpenditureRecord
            key={record.record_id}
            record={record}
            extractedRecord={
              extractedCreditCardExpenditures.find(
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

export default ExtractedCreditCardExpenditurePane;
