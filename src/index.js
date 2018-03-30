import React from 'react';
import ReactDOM from 'react-dom';
import './scss/index.scss';
import DoubleDatePickerCalender from './components/container/double-date-picker/double-date-picker-component';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<div><DoubleDatePickerCalender
    applyCallBack={(startDate,endDate,dateObj)=>console.log(startDate,endDate,dateObj)}
    startDateCallBack={(startDate,startDateObj)=>{console.log(`start Date : ${startDate}`);console.log(startDateObj)}}
    endDateCallBack={(endDate,endDateObj)=>{console.log(`end Date : ${endDate}`);console.log(endDateObj)}}
    dateFormat="MM-DD-YYYY"
    resetCallBack={()=>{console.log("reset");}}
    datesSeperatorSymbol="->"
    inputFieldStartDateText="Start Date"
    inputFieldEndDateText="End Date"
    applyBtnText="APPLY"
    resetBtnText="RESET"
    disablePastDates={false}
    hideInputField={false}
    weekNameLength="2"
    /></div>, document.getElementById('root'));
     
registerServiceWorker();
