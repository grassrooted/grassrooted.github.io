import ExtractedInvestmentPurchasesRecord from "./ExtractedInvestmentPurchasesRecord";

const ExtractedInvestmentPurchasesPane = ({
  extractedInvestmentPurchases,
  formInvestmentPurchases,
  setFormState,
  onAddRecord
}) => {
  return (
    <section className="expenditure-pane">
      <h2 className="section-title">Investment Purchases</h2>
      <div className="expenditure-grid">
        {formInvestmentPurchases.map(record => (
          <ExtractedInvestmentPurchasesRecord
            key={record.record_id}
            record={record}
            extractedRecord={
              extractedInvestmentPurchases.find(
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

export default ExtractedInvestmentPurchasesPane;
