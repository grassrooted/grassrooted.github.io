import ExtractedInvestmentPurchasesRecord from "./ExtractedInvestmentPurchasesRecord";

const ExtractedInvestmentPurchasesPane = ({
  extractedInvestmentPurchases,
  formInvestmentPurchases,
  setFormState
}) => {
  return (
    <section className="investment-purchases-pane">
      <h2 className="section-title">Investment Purchases</h2>
      <div className="investment-purchases-grid">
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
    </section>
  );
};

export default ExtractedInvestmentPurchasesPane;
