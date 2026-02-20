import ExtractedExpenditureRecord from "./ExtractedExpenditureRecord";

const ExtractedExpenditurePane = ({
  extractedExpenditures,
  formExpenditures,
  setFormState
}) => {
  return (
    <section className="expenditure-pane">
      <h2>Expenditures</h2>

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
    </section>
  );
};

export default ExtractedExpenditurePane;
