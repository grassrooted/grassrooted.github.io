import React from 'react';
import ValidationContext from './ValidationContext';


const EditLogContext = ({parsedData}) => {
    /*
    const editLog = []
    function logEdit({timestamp, field, original_value, new_value, user_initiated}){
        editLog.push({timestamp, field, original_value, new_value, user_initiated})
        console.log("new edit logged")
    }
    */
    return (
        <div>
            <h1>Edit Log Context</h1>
            <ValidationContext parsedData={parsedData}>

            </ValidationContext>
        </div>
    );
};


export default EditLogContext;