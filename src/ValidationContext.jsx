import React from 'react';
import CampfinReviewPage from './CampfinReviewPage';

const ValidationContext= ({parsedData}) => {
    return (
        <div>
            <h1>Validation Context</h1>
            <CampfinReviewPage parsedData={parsedData}>

            </CampfinReviewPage>
        </div>
    );
};

export default ValidationContext;
