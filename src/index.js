import React from 'react';
import ReactDOM from 'react-dom';
import './scss/main.css';
import DoubleDatePickerCalender from './components/container/double-date-picker/double-date-picker-component';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<DoubleDatePickerCalender
     applyCallBack={(a,b,c)=>console.log(a,b,c)}
     startDateCallBack={(date,obj)=>{console.log(obj)}}
     endDateCallBack={(date,obj)=>{console.log( obj)}}
     dateFormat="MM-DD-YYYY"
     resetCallBack={()=>{console.log("reset");}}
     hideResetButton={false}
     hideApplyButton={false}
     hideInputField={false}
     applyBtnText="APPLY"
     resetBtnText="RESET"
     disablePastDates={true}
     monthMapping=""
     weekName=""
     />, document.getElementById('root'));
registerServiceWorker();
