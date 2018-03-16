import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import DoubleDatePickerCalender from './App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<DoubleDatePickerCalender
     applyCallBack={(a,b,c)=>console.log(a,b,c)}
     startDateCallBack={(date)=>{console.log("startDate" + date)}}
     endDateCallBack={(date)=>{console.log("endDate" + date)}}
     dateFormat="MM-DD-YYYY"
     resetCallBack={()=>{console.log("reset");}}
     datesSeperatorSymbol="->"
     inputFieldStartDateText="Start"
     inputFieldEndDateText="End"
     hideResetButton={false}
     hideApplyButton={false}
     hideInputField={false}
     applyBtnText="APPLY"
     resetBtnText="RESET"
     disabledPreviousDates={true}
     />, document.getElementById('root'));
registerServiceWorker();
