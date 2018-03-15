import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import DoubleDatePickerCalender from './App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<DoubleDatePickerCalender
     applyCallBack={(a,b,c)=>console.log(a,b,c)}
     startDateCallBack={(date)=>{console.log(date)}}
     endDateCallBack={(date)=>{console.log(date)}}
     />, document.getElementById('root'));
registerServiceWorker();
