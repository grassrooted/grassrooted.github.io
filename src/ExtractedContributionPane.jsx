import React from 'react';
import ExtractedContributionRecord from './ExtractedContributionRecord';

const ExtractedContributionPane = ({
    extractedContributions,
    formContributions,
    setFormState,
    onAddRecord
  }) => {
    return (
      <section className="contribution-pane">
        <h3 className="section-title">Contributions</h3>
  
        <div className="contribution-grid">
          {formContributions.map((record, index) => (
            <ExtractedContributionRecord
              key={record.record_id}
              record={record}
              extractedRecord={extractedContributions[index]}
              index={index}
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
  
  export default ExtractedContributionPane;  