function CampaignDetail({ extractedMetadata, formState, setFormState }) {
    const updateField = (field, value) => {
        /*
        logEdit({
            timestamp: Date.now(),
            field,
            original_value: extractedMetadata.field,
            new_value: value,
            user_initiated: true
        })
        */
        setFormState(prev => ({
            ...prev,
            candidate_info: {
            ...prev.candidate_info,
            [field]: value
            }
        }));
    };
  
    return (
      <div className="document-header">  
        <label>
          Campaign First Name:
          <input
            value={formState.first_name}
            onChange={e => updateField("first_name", e.target.value)}
          />
        </label>
  
        <label>
          Campaign Last Name:
          <input
            value={formState.last_name}
            onChange={e => updateField("last_name", e.target.value)}
          />
        </label>
  
        <label>
          Period Start:
          <input
            type="date"
            value={formState.period_start}
            onChange={e => updateField("period_start", e.target.value)}
          />
        </label>
  
        <label>
          Period End:
          <input
            type="date"
            value={formState.period_end}
            onChange={e => updateField("period_end", e.target.value)}
          />
        </label>

        <label>
          Office Sought:
          <input
            value={formState.office_sought}
            onChange={e => updateField("office_sought", e.target.value)}
          />
        </label>
      </div>
    );
  }
  
  export default CampaignDetail;
  