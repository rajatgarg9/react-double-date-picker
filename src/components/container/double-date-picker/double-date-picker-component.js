import React from "react";
import PropTypes from "prop-types";

export default class DoubleDatePickerCalender extends React.Component {

    constructor(props) {
        super(props);

        // mapping Name of months and week by props
        this.nameMapping();

        const dateObj = new Date();
        this.day = dateObj.getDay(); // get day (1-7)
        this.date = dateObj.getDate(); // get date (1-31)
        this.month = dateObj.getMonth() + 1; //  month (1-12)
        this.year = dateObj.getFullYear();
        this.todayDateObj = {         //contain information of current day 
            day: this.weekNamesMapping[this.day % 7],
            date: this.date,
            month: this.month,
            year: this.year
        };

        // decide single date picker , double date picker or simple calender 1 for single date picker , 
        // 2 for double date picker and 3 for simple calender with date picker
        this.datePickerMode = this.datePickerLogicMapping(); //object

        this.dateSelectionHandler = this.dateSelectionHandler.bind(this);
        this.monthCreater = this.monthCreater.bind(this);
        this.selectedDateObj = {
            startDate: "", // if contain object  in format{day:--,date:--,month:--,year:--} otherwise empty string
            endDate: "" // if contain object  in format{day:--,date:--,month:--,year:--} otherwise empty string
        };
        //contain date in particular format
        this.selectedDateWithDateFormatObj = {
            startDate: props.inputFieldStartDateText || "",  // always string
            endDate: props.inputFieldEndDateText || ""    //always string
        };
        this.state = {
            monthMarkup: this.monthCreater(this.month, this.year), //create month for current month for initial rendering
            popperShow: !this.inputFieldVisiblityHandler()
        }
    }

    /**
     * nameMapping -- on call map  week name and month name on basis of condition if condition false then give default name 
     * @param {undefined}  no params
     * @return {undefined} no returns 
     */
    nameMapping = () => {
        if (this.props.monthMapping && Object.keys(this.props.monthMapping).length === 12) {
            this.monthMapping = this.props.monthMapping
        }
        else {
            this.monthMapping = {
                1: "January",
                2: "Feburary",
                3: "March",
                4: "April",
                5: "May",
                6: "June",
                7: "July",
                8: "August",
                9: "September",
                10: "October",
                11: "November",
                12: "December"
            };
        };
        if (this.props.weekNamesMapping && Object.keys(this.props.weekNamesMapping).length === 7) {
            this.monthMapping = this.props.weekNames
        }
        else {
            this.weekNamesMapping = {
                1: "Monday",
                2: "Tuesday",
                3: "Wednesday",
                4: "Thrusday",
                5: "Friday",
                6: "Saturday",
                7: "Sunday",
            };
        }
    }

    /**
     * datePickerLogicMapping -- on call set date picker logic to single date picker,double date picker or simple calender 
     *   1 for single date picker , 2 for double date picker and 3 for simple calender otherwise it will behave as double date picker
     * @param {undefined}  no params
     * * @return {Object} {number-contain mode in numeric,text- contain mode in string} 
     */
    datePickerLogicMapping = () => {
        const _datePickerMode=Number(this.props.datePickerMode);

        if (_datePickerMode === 1) {
            this.datePickerDateLogic = this.singleDatePickerDateLogic;
            return {
                number: 1,
                text: "single"
            };
        }
        else if (_datePickerMode === 3) {
            this.datePickerDateLogic = () => { };
            return {
                number: 3,
                text: "simple-calender"
            };
        }
        else {
            this.datePickerDateLogic = this.doubleDatePickerDateLogic;
            return {
                number: 2,
                text: "double"
            };
        }
    }

    /**
     * leapYearFinder -- detect that passed year is leap year or not
     * @param {number} year 
     * @return {boolean} return true if passed year is leap year otherwise return false
     */
    leapYearFinder = (year) => {
        if ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * dayFinder --on call find day number of a week 
     * @param {number} date 
     * @param {number} month 
     * @param {number} year 
     * @return {number} -- return day number 1 for monday,2 for tuesday ... 7 for sunday
     */
    dayFinder = (date, month, year) => {
        let _resultDay,
            _firstTwoDigitYear = Math.floor(year / 100);
        const _lastTwoDigitYear = year % 100,
            _monthMapping = {
                1: 1,
                2: 4,
                3: 4,
                4: 0,
                5: 2,
                6: 5,
                7: 0,
                8: 3,
                9: 6,
                10: 1,
                11: 4,
                12: 6
            },
            _centuryCodeMapping = {
                17: 4,
                18: 2,
                19: 0,
                20: 6
            };

        _resultDay = (Math.floor(_lastTwoDigitYear / 4) + date) + _monthMapping[month];
        if (this.leapYearFinder(year) && month <= 2) {
            _resultDay -= 1;
        }
        if (_firstTwoDigitYear < 17) {
            _firstTwoDigitYear += Math.floor((17 - _firstTwoDigitYear) / 4) * 4;
            if (_firstTwoDigitYear < 17) {
                _firstTwoDigitYear += 4;
            }
        }
        else if (_firstTwoDigitYear > 20) {
            _firstTwoDigitYear -= Math.floor((_firstTwoDigitYear - 20) / 4) * 4;
            if (_firstTwoDigitYear > 20) {
                _firstTwoDigitYear -= 4;
            }
        }
        _resultDay += _centuryCodeMapping[_firstTwoDigitYear] + _lastTwoDigitYear;
        _resultDay %= 7;
        _resultDay -= 1;

        return (_resultDay <= 0) ? _resultDay + 7 : _resultDay;
    }

    /**
     * daysInMonthFinder -- on call find number of days in a month
     * @param {number} month 
     * @param {number} year 
     * @return {number} contain number of days like 31 in Jan , 29 in Feb in leap year etc
     */
    daysInMonthFinder = (month, year) => {
        return (month === 2) ? (this.leapYearFinder(year) ? 29 : 28) : (31 - (month - 1) % 7 % 2);
    }

    /**
     * daysNameCreater -- on call create markup for days Name
     * @param {undefined}
     * @return {array} _daysNameMarkUp --contain array of object(having markup for each day)
     */
    daysNameCreater = () => {
        let _daysNameMarkUp = [],
            _weekNamesLength = (Number(this.props.weekNamesLength) && !0) ? this.props.weekNamesLength : 2;
        for (const key in this.weekNamesMapping) {
            _daysNameMarkUp = [..._daysNameMarkUp, <span className="double-date-picker-calender-day-name" key={key}>{this.weekNamesMapping[key].trim().slice(0, _weekNamesLength)}</span>];
        }
        return _daysNameMarkUp;
    };

    /**
     * insideMonthDatesInfoHandler -- function calculate class Name,aria-label and tab index for particular date based on logic
     * @param {object} startDate -- date for which class has to find
     * @param {object} firstSelectedDate -- first date selected in calender
     * @param {object} secondSelectedDate -- second date selected in calender
     * @param {number} hoverMode --- by default its is inactive(value 0) ,it enable when mouseover event fire its value is 1 or 2 
     * @return {object} -- return class Name,aria-label and tab index for particular date according to logic
     */
    insideMonthDatesInfoHandler = (startDate, firstSelectedDate, secondSelectedDate, hoverMode = 0) => {
        const _insideMonthClass = "double-date-picker-calender-day double-date-picker-calender-current-month-day",
            _currentDateClass = "double-date-picker-calender-today",
            _dateBetweenFirstSecondSelected = "double-date-picker-calender-first-second-between-selected",
            _disabledDateClass = "double-date-picker-calender-current-month-day-disabled";
        let _secondSelectedDateClass = "double-date-picker-calender-second-date-selected",
            _firstSelectedDateClass = "double-date-picker-calender-first-date-selected";

        if (hoverMode) {
            // hover date is smaller than start date
            if (hoverMode === 1) {
                _firstSelectedDateClass = "double-date-picker-calender-first-second-between-selected";
            }
            // hover date is greater than start date
            if (hoverMode === 2) {
                _secondSelectedDateClass = "double-date-picker-calender-first-second-between-selected";

            }

        }
        if (this.props.disablePastDates && this.dateComparator(startDate, this.todayDateObj, "<")) {
            return {
                class: `${_insideMonthClass} ${_disabledDateClass}`,
                label: "Inactive past dates",
                tabIndex: "-1",
                pressed: false
            }
        }
        //this condition true only 1 time so for perfomance , added third condition
        if (!firstSelectedDate && !secondSelectedDate && startDate.date === this.todayDateObj.date && this.dateComparator(startDate, this.todayDateObj, "===")) {
            return {
                class: `${_insideMonthClass} ${_currentDateClass}`,
                label: `Today date is ${this.ariaDateHandler(startDate)}`,
                tabIndex: "0",
                pressed: false
            }
        }
        if (firstSelectedDate && secondSelectedDate) {
            if (this.dateComparator(startDate, firstSelectedDate, "===") && this.dateComparator(firstSelectedDate, secondSelectedDate, "===")) {
                return {
                    class: `${_insideMonthClass} ${_firstSelectedDateClass} ${_secondSelectedDateClass}`,
                    label: `start date and end date is ${this.ariaDateHandler(startDate)}`,
                    tabIndex: "0",
                    pressed: true
                }
            }
            if (this.dateComparator(startDate, firstSelectedDate, ">") && this.dateComparator(startDate, secondSelectedDate, "<")) {
                return {
                    class: `${_insideMonthClass} ${_dateBetweenFirstSecondSelected}`,
                    label: `dates between start date and end date is ${this.ariaDateHandler(startDate)}`,
                    tabIndex: "0",
                    pressed: false
                }
            }
        }
        if (firstSelectedDate && this.dateComparator(startDate, firstSelectedDate, "===")) {
            return {
                class: `${_insideMonthClass} ${_firstSelectedDateClass}`,
                //check for single single date picker or double date picker
                label: `${(this.datePickerMode.number === 1) ? "selected" : "start"} date is ${this.ariaDateHandler(startDate)}`,
                tabIndex: "0",
                pressed: true
            }
        }
        if (secondSelectedDate && this.dateComparator(startDate, secondSelectedDate, "===")) {
            return {
                class: `${_insideMonthClass} ${_secondSelectedDateClass}`,
                label: `end date is ${this.ariaDateHandler(startDate)}`,
                tabIndex: "0",
                pressed: true
            }
        }
        else {
            return {
                class: _insideMonthClass,
                label: `${this.ariaDateHandler(startDate)}`,
                tabIndex: "0",
                pressed: false
            }
        }
    }

    /**
     * weekCreater -- on call create markup for a particular week
     * @param {object} startDate -- first date of week
     * @param {object} weekParamsObj -- contain weekPosition, outsideMonthDateRepetition, hoverMode properties
     *            weekPosition -- contain position of week , it has three value first,middle and last
     *            outsideMonthDateRepetition --it is for first and last week and has number of  day in previous and next month will show in current month
     *            hoverMode --- by default its is inactive(value 0) ,it enable when mouseover event fire its value is 1 or 2 
     * @param {object} firstSelectedDate -- first date selected in calender
     * @param {object} secondSelectedDate -- second date selected in calender
     * @return {array} _weekMarkup -- contaion array of dates of a week
     */
    weekCreater = (startDate, weekParamsObj, firstSelectedDate = 0, secondSelectedDate = 0) => {
        let _weekMarkup = [],
            _mouseEvents = {};
        const _outsideMonthClassPrevious = "double-date-picker-calender-day double-date-picker-calender-outside-month-day-previous",
            _outsideMonthClassNext = "double-date-picker-calender-day double-date-picker-calender-outside-month-day-next";


        if (this.selectedDateObj.startDate && (this.datePickerMode.number !== 1)) {
            _mouseEvents = {
                onMouseOver: this.dateMouseOverHandler,
                onMouseOut: this.dateMouseOutHandler
            }
        }
        if (weekParamsObj.weekPosition === "first") {
            if (weekParamsObj.outsideMonthDateRepetition === 0) {
                startDate.date = 1;
            }
            for (let i = 1; i <= 7; i++) {
                if (weekParamsObj.outsideMonthDateRepetition) {
                    _weekMarkup = [..._weekMarkup,
                    (<span
                        className={_outsideMonthClassPrevious}
                        key={i}
                        tabIndex="-1">
                        {startDate.date}
                    </span>)
                    ];
                    --weekParamsObj.outsideMonthDateRepetition;
                    ++startDate.date;
                    if (weekParamsObj.outsideMonthDateRepetition === 0) {
                        startDate.date = 1;
                    }
                }
                else {
                    const _day = this.weekNamesMapping[(i % 7) === 0 ? 7 : i % 7],
                        _dateInfoObj = this.insideMonthDatesInfoHandler({ ...startDate, day: _day }, firstSelectedDate, secondSelectedDate, weekParamsObj.hoverMode);
                    _weekMarkup = [..._weekMarkup,
                    <span
                        className={_dateInfoObj.class}
                        key={i}
                        data-day={_day}
                        data-date={startDate.date}
                        data-month={startDate.month}
                        data-year={startDate.year}
                        tabIndex={_dateInfoObj.tabIndex}
                        aria-label={_dateInfoObj.label}
                        role="button"
                        aria-pressed={_dateInfoObj.pressed}
                        {..._mouseEvents}
                    >
                        {startDate.date++}
                    </span>
                    ];
                }
            }
        }
        else if (weekParamsObj.weekPosition === "last") {
            let _insideDateRepetition = 7 - weekParamsObj.outsideMonthDateRepetition,
                j = 1;

            for (let i = 1; i <= 7; i++) {
                const _day = this.weekNamesMapping[(i % 7) === 0 ? 7 : i % 7],
                    _dateInfoObj = this.insideMonthDatesInfoHandler({ ...startDate, day: _day }, firstSelectedDate, secondSelectedDate, weekParamsObj.hoverMode);
                if (_insideDateRepetition) {
                    _weekMarkup = [..._weekMarkup,
                    <span
                        className={_dateInfoObj.class}
                        key={i}
                        data-day={_day}
                        data-date={startDate.date}
                        data-month={startDate.month}
                        data-year={startDate.year}
                        tabIndex={_dateInfoObj.tabIndex}
                        aria-label={_dateInfoObj.label}
                        role="button"
                        aria-pressed={_dateInfoObj.pressed}
                        {..._mouseEvents}
                    >
                        {startDate.date}
                    </span>
                    ];
                    --_insideDateRepetition;
                    ++startDate.date;
                }
                else {

                    _weekMarkup = [..._weekMarkup,
                    <span
                        className={_outsideMonthClassNext}
                        key={i}
                        tabIndex="-1"
                    >
                        {j++}
                    </span>
                    ];
                }
            }
        }
        else {
            for (let i = 1; i <= 7; i++) {
                const _day = this.weekNamesMapping[(i % 7) === 0 ? 7 : i % 7],
                    _dateInfoObj = this.insideMonthDatesInfoHandler({ ...startDate, day: _day }, firstSelectedDate, secondSelectedDate, weekParamsObj.hoverMode);
                _weekMarkup = [..._weekMarkup,
                <span
                    className={_dateInfoObj.class}
                    key={i}
                    data-day={_day}
                    data-date={startDate.date}
                    data-month={startDate.month}
                    data-year={startDate.year}
                    tabIndex={_dateInfoObj.tabIndex}
                    aria-label={_dateInfoObj.label}
                    role="button"
                    aria-pressed={_dateInfoObj.pressed}
                    {..._mouseEvents}
                >
                    {startDate.date}
                </span>
                ];
                ++startDate.date;
            }
        }
        return _weekMarkup;
    }

    /**
     * monthCreater -- create markup for particular month 
     * @param {number} month -- month for which month markup has to create
     * @param {number} year -- year of month for which month markup has to create
     * @param {object} firstSelectedDate -- first date selected in calender
     * @param {object} secondSelectedDate -- second date selected in calender
     * @param {number} hoverMode --- by default its is inactive(value 0) ,it enable when mouseover event fire its value is 1 or 2 
     * @return {array} _monthMarkup -- contain array of weeks of a month
     */
    monthCreater = (month, year, firstSelectedDate = 0, secondSelectedDate = 0, hoverMode = 0) => {
        const _totalDaysInMonth = this.daysInMonthFinder(month, year),
            _monthFirstWeekDay = this.dayFinder(1, month, year),
            _monthLastWeekDay = this.dayFinder(_totalDaysInMonth, month, year),
            _previousOutsideMonthStartDate = (month - 1 === 0) ? (this.daysInMonthFinder(12, year - 1) - (_monthFirstWeekDay - 1) + 1)
                : (this.daysInMonthFinder(month - 1, year) - (_monthFirstWeekDay - 1) + 1),
            _middleWeekEndDate = _totalDaysInMonth - _monthLastWeekDay;
        let _monthMarkup = [],
            _middleWeekStartDate = (7 - (_monthFirstWeekDay - 1)) + 1,
            _middleWeekRepetition = (_middleWeekEndDate - (_middleWeekStartDate - 1)) / 7,
            _dynamicWeek,
            _weekStartDateObj = {},
            _weekArgumentsObj = {};

        //first row of dates
        _weekStartDateObj = { date: _previousOutsideMonthStartDate, month, year };
        _weekArgumentsObj = {
            weekPosition: "first",
            outsideMonthDateRepetition: _monthFirstWeekDay - 1,
            hoverMode,
        };
        _dynamicWeek = (<div className="double-date-picker-calender-week" key={9}>
            {this.weekCreater(_weekStartDateObj, _weekArgumentsObj, firstSelectedDate, secondSelectedDate)}
        </div>);
        _monthMarkup = [_dynamicWeek];

        //middle row of dates
        while (_middleWeekRepetition) {
            _weekStartDateObj = { date: _middleWeekStartDate, month, year };
            _weekArgumentsObj = {
                weekPosition: "middle",
                outsideMonthDateRepetition: 0,
                hoverMode,
            };
            _dynamicWeek = (<div className="double-date-picker-calender-week" key={_middleWeekRepetition}>
                {this.weekCreater(_weekStartDateObj, _weekArgumentsObj, firstSelectedDate, secondSelectedDate)}
            </div>);
            _monthMarkup = [..._monthMarkup, _dynamicWeek]
            _middleWeekStartDate = _middleWeekStartDate + 7;
            --_middleWeekRepetition;
        }

        //last row of dates
        _weekStartDateObj = { date: _middleWeekEndDate + 1, month, year };
        _weekArgumentsObj = {
            weekPosition: "last",
            outsideMonthDateRepetition: 7 - _monthLastWeekDay,
            hoverMode,
        };
        _dynamicWeek = (<div className="double-date-picker-calender-week" key={10}>
            {this.weekCreater(_weekStartDateObj, _weekArgumentsObj, firstSelectedDate, secondSelectedDate)}
        </div>);
        _monthMarkup = [..._monthMarkup, _dynamicWeek];

        return _monthMarkup;
    };

    /**
     * dateComparatorNumberGenerator -- return a number based on the two dates passed
     * @param {object} firstDateObj  -- contaion first date to compare in format {date:23,month:2,year:2018}
     * @param {object} secondDateObj  -- contaion second date to compare in format {date:23,month:2,year:2018}
     * @return {number} return 1 if first date is greater ,return 2 if second date is greater and return 3 if both are equal
     */
    dateComparatorNumberGenerator = (firstDateObj, secondDateObj) => {
        if (firstDateObj.year < secondDateObj.year) {
            return 2;
        }
        if (firstDateObj.year > secondDateObj.year) {
            return 1;
        }
        if (firstDateObj.year === secondDateObj.year) {
            if (firstDateObj.month < secondDateObj.month) {
                return 2;
            }
            if (firstDateObj.month > secondDateObj.month) {
                return 1;
            }
            if (firstDateObj.month === secondDateObj.month) {
                if (firstDateObj.date < secondDateObj.date) {
                    return 2;
                }
                if (firstDateObj.date > secondDateObj.date) {
                    return 1;
                }
                if (firstDateObj.date === secondDateObj.date) {
                    return 3;
                }
            }
        }
    }

    /**
     * dateComparator -- compare two date object
     * @param {object} firstDateObj  -- contaion first date to compare in format {date:23,month:2,year:2018}
     * @param {object} secondDateObj  -- contaion second date to compare in format {date:23,month:2,year:2018}
     * @param {string} operator -- contaion symbol on the basis of which both date are compared
     * @return {boolean} return true or false base on calculation
     */
    dateComparator = (firstDateObj, secondDateObj, operator) => {
        let _number = this.dateComparatorNumberGenerator(firstDateObj, secondDateObj);
        if (operator === "===" && _number === 3) {
            return true;
        } if (operator === "!==" && _number !== 3) {
            return true;
        } else if (operator === "<=" && (_number === 3 || _number === 2)) {
            return true;
        } else if (operator === ">=" && (_number === 3 || _number === 1)) {
            return true;
        }
        else if (operator === ">" && _number === 1) {
            return true;
        }
        else if (operator === "<" && _number === 2) {
            return true;
        }
        else {
            return false;
        }
    }

    /**
     * calenderHandler -- create new month and then change state of it 
      * @param {number} month -- month for which month markup has to create
     * @param {number} year -- year of month for which month markup has to create
     * @param {object} firstSelectedDate -- first date selected in calender
     * @param {object} secondSelectedDate -- second date selected in calender
     * @param {function} callBackFunc  -- execute after new month created
     * @param {number} hoverMode --- by default its is inactive(value 0) ,it enable when mouseover event fire its value is 1 or 2 
     * @return {undefined} -- don't return anything
     */
    calenderHandler = (month, year, firstSelectedDate, secondSelectedDate, hoverMode = 0, callBackFunc) => {
        this.setState({
            monthMarkup: this.monthCreater(month, year, firstSelectedDate, secondSelectedDate, hoverMode)
        }, () => {
            callBackFunc && callBackFunc();
        });
    }


    /**
     * SelectionEventValidator -- on call validate  fired event is from mouse click , or enter key or space key
     * @param {Object} event -- contain properties of js event object
     * @return {Boolean} return true if event is triggered from click , or enter key or space key else return false
     */
    SelectionEventValidator = (event) => {
        const _eventCode = event.which || event.keyCode;
        //13 for enter key and 32 for space key 
        if ((event.type === "click") || (event.type === "keydown" && (_eventCode === 13 || _eventCode === 32))) {
            return true;
        }
        else {
            return false;
        }
    }

    /**
     * previousMonthBtnHandler -- on click or press enter or space key on previous month arrow ,create markup for previous month
     * @param {Object} event -- contain event properties of triggered event
     * @param {function} callBackFunc -- function to execute after new month markup 
     * {undefined} --not return anything
     */
    previousMonthBtnHandler = (event, callBackFunc) => {
        if (!this.SelectionEventValidator(event)) {
            return null;
        }

        let _firstSelectedDate = this.selectedDateObj.startDate,
            _secondSelectedDate = this.selectedDateObj.endDate;
        (this.month - 1 === 0) ?
            this.calenderHandler(this.month = 12, this.year -= 1, _firstSelectedDate, _secondSelectedDate, 0, callBackFunc) :
            this.calenderHandler(this.month -= 1, this.year, _firstSelectedDate, _secondSelectedDate, 0, callBackFunc)
    }

    /**
     * nextMonthBtnHandler -- on click or press enter or space key on next month arrow ,create markup for next month
     * @param {Object} event -- contain event properties of triggered event
     * @param {function} callBackFunc -- function to execute after new month markup 
     * {undefined} --not return anything
     */
    nextMonthBtnHandler = (event, callBackFunc) => {

        if (!this.SelectionEventValidator(event)) {
            return null;
        }

        let _firstSelectedDate = this.selectedDateObj.startDate,
            _secondSelectedDate = this.selectedDateObj.endDate;
        (this.month + 1 === 13) ?
            this.calenderHandler(this.month = 1, this.year += 1, _firstSelectedDate, _secondSelectedDate, 0, callBackFunc) :
            this.calenderHandler(this.month += 1, this.year, _firstSelectedDate, _secondSelectedDate, 0, callBackFunc)
    }

    /**
     * arrowKeyHandler -- on call manage focus on pressing arrow keys
     * @param {Object} event -- contain properties of triggered event
     * @return {Boolean} return true if arrow key is trigered otherwise false
     */
    arrowKeyHandler = (event) => {
        const _eventCode = event.which || event.keyCode,
            _daysNodeArray = this.monthContainerRef.getElementsByClassName("double-date-picker-calender-current-month-day");

        //up key
        if (_eventCode === 38) {
            const _node = _daysNodeArray[(Number(event.target.dataset["date"]) - 8)];
            if (_node) {
                _node.focus();
            }
            else {
                // change key code so that previousMonthBtnHandler can create new month
                event.keyCode = 13;
                event.which = 13;
                this.previousMonthBtnHandler(event, () => {
                    const _nodeArray = this.monthContainerRef.getElementsByClassName("double-date-picker-calender-current-month-day");
                    _nodeArray[_nodeArray.length - 1].focus();
                });
            }
            return true;
        }
        //down key
        if (_eventCode === 40) {
            const _node = _daysNodeArray[(Number(event.target.dataset["date"])) + 6];
            if (_node) {
                _node.focus()
            }
            else {
                // change key code so that nextMonthBtnHandler can create new month
                event.keyCode = 13;
                event.which = 13;
                this.nextMonthBtnHandler(event, () => {
                    const _nodeArray = this.monthContainerRef.getElementsByClassName("double-date-picker-calender-current-month-day");
                    _nodeArray[0].focus();
                });
            }
            return true;
        }
        //right key
        if (_eventCode === 39) {
            const _node = _daysNodeArray[(Number(event.target.dataset["date"]))];
            if (_node) {
                _node.focus()
            }
            else {
                // change key code so that nextMonthBtnHandler can create new month
                event.keyCode = 13;
                event.which = 13;
                this.nextMonthBtnHandler(event, () => {
                    const _nodeArray = this.monthContainerRef.getElementsByClassName("double-date-picker-calender-current-month-day");
                    _nodeArray[0].focus();
                });
            }
            return true;
        }

        //left key
        if (_eventCode === 37) {
            const _node = _daysNodeArray[(Number(event.target.dataset["date"]) - 2)];
            if (_node) {
                _node.focus();
            }
            else {
                // change key code so that previousMonthBtnHandler can create new month
                event.keyCode = 13;
                event.which = 13;
                this.previousMonthBtnHandler(event, () => {
                    const _nodeArray = this.monthContainerRef.getElementsByClassName("double-date-picker-calender-current-month-day");
                    _nodeArray[_nodeArray.length - 1].focus();
                });
            }
            return true;
        }
        return false;
    }

    /**
     * singleDatePickerDateLogic --manage date selection in case of sigle date picker
     *  @param {Object} selectedDate -- date selected by user
     * @return {null}
     */
    singleDatePickerDateLogic = (selectedDate) => {
        if (this.dateComparator(selectedDate, this.selectedDateObj.startDate, "===")) {
            this.selectedDateObj.startDate = "";
            this.calenderHandler(this.month, this.year, this.selectedDateObj.startDate, this.selectedDateObj.endDate);
            this.selectedDateWithDateFormatObj = {
                startDate: this.props.inputFieldStartDateText || "",
            };

            this.props.startDateCallBack && this.props.startDateCallBack(this.selectedDateWithDateFormatObj.startDate, this.selectedDateObj.startDate);

            return null;
        }

        else {
            this.selectedDateObj.startDate = selectedDate;
            this.calenderHandler(this.month, this.year, this.selectedDateObj.startDate, this.selectedDateObj.endDate);
            this.selectedDateWithDateFormatObj.startDate = this.dateFormatHandler(this.selectedDateObj.startDate, this.props.dateFormat);

            this.props.startDateCallBack && this.props.startDateCallBack(this.selectedDateWithDateFormatObj.startDate, this.selectedDateObj.startDate);

            return null;
        }
    }

    /**
     * doubleDatePickerDateLogic --manage date selection in case of double date picker
     *  @param {Object} selectedDate -- date selected by user
     * @return {null}
     */
    doubleDatePickerDateLogic = (selectedDate) => {

        if (!this.selectedDateObj.startDate) {
            this.selectedDateObj.startDate = selectedDate;
            this.selectedDateObj.endDate = selectedDate;
            this.calenderHandler(this.month, this.year, this.selectedDateObj.startDate, this.selectedDateObj.endDate);
            this.selectedDateWithDateFormatObj.startDate = this.dateFormatHandler(this.selectedDateObj.startDate, this.props.dateFormat);
            this.selectedDateWithDateFormatObj.endDate = this.dateFormatHandler(this.selectedDateObj.endDate, this.props.dateFormat);

            this.props.startDateCallBack && this.props.startDateCallBack(this.selectedDateWithDateFormatObj.startDate, this.selectedDateObj.startDate);
            this.props.endDateCallBack && this.props.endDateCallBack(this.selectedDateWithDateFormatObj.endDate, this.selectedDateObj.endDate);

            return null;
        }

        if (this.dateComparator(selectedDate, this.selectedDateObj.startDate, "===") && this.dateComparator(selectedDate, this.selectedDateObj.endDate, "===")) {
            this.selectedDateObj = {
                startDate: "",
                endDate: ""
            };
            this.selectedDateWithDateFormatObj = {
                startDate: this.props.inputFieldStartDateText || "",
                endDate: this.props.inputFieldEndDateText || ""
            };
            this.calenderHandler(this.month, this.year, this.selectedDateObj.startDate, this.selectedDateObj.endDate);

            this.props.startDateCallBack && this.props.startDateCallBack(this.selectedDateWithDateFormatObj.startDate, this.selectedDateObj.startDate);
            this.props.endDateCallBack && this.props.endDateCallBack(this.selectedDateWithDateFormatObj.endDate, this.selectedDateObj.endDate);

            return null;
        }
        if (this.dateComparator(selectedDate, this.selectedDateObj.startDate, "===")) {

            this.selectedDateObj.startDate = this.selectedDateObj.endDate;
            this.selectedDateWithDateFormatObj.startDate = this.dateFormatHandler(this.selectedDateObj.startDate, this.props.dateFormat);
            this.calenderHandler(this.month, this.year, this.selectedDateObj.startDate, this.selectedDateObj.endDate);

            this.props.startDateCallBack && this.props.startDateCallBack(this.selectedDateWithDateFormatObj.startDate, this.selectedDateObj.startDate);

            return null;
        }
        if (this.dateComparator(selectedDate, this.selectedDateObj.endDate, "===")) {
            this.selectedDateObj.endDate = this.selectedDateObj.startDate;
            this.selectedDateWithDateFormatObj.endDate = this.dateFormatHandler(this.selectedDateObj.endDate, this.props.dateFormat);
            this.calenderHandler(this.month, this.year, this.selectedDateObj.startDate, this.selectedDateObj.endDate);

            this.props.endDateCallBack && this.props.endDateCallBack(this.selectedDateWithDateFormatObj.endDate, this.selectedDateObj.endDate);

            return null;
        }
        if (this.dateComparator(selectedDate, this.selectedDateObj.startDate, ">=")) {
            this.selectedDateObj.endDate = selectedDate;
            this.selectedDateWithDateFormatObj.endDate = this.dateFormatHandler(this.selectedDateObj.endDate, this.props.dateFormat);
            this.calenderHandler(this.month, this.year, this.selectedDateObj.startDate, this.selectedDateObj.endDate);

            this.props.endDateCallBack && this.props.endDateCallBack(this.selectedDateWithDateFormatObj.endDate, this.selectedDateObj.endDate);

            return null;
        }
        else {
            this.selectedDateObj.startDate = selectedDate;
            this.selectedDateWithDateFormatObj.startDate = this.dateFormatHandler(this.selectedDateObj.startDate, this.props.dateFormat);
            this.calenderHandler(this.month, this.year, this.selectedDateObj.startDate, this.selectedDateObj.endDate);

            this.props.startDateCallBack && this.props.startDateCallBack(this.selectedDateWithDateFormatObj.startDate, this.selectedDateObj.startDate);

            return null;
        }
    }


    /**
     * dateSelectionHandler -- on click or press enter or space key handle selection of dates
     * @param {object} event-- triggered event object
     * @return {null} -- terminate function once any condition matched
     */
    dateSelectionHandler = (event) => {

        //handle arrow key actions
        if (this.arrowKeyHandler(event)) {
            return null;
        }
        // validae if date selection event is triggered
        if (!this.SelectionEventValidator(event)) {
            return null;
        }

        let _selectedDate = {
            day: event.target.dataset["day"],
            date: Number(event.target.dataset["date"]),
            month: Number(event.target.dataset["month"]),
            year: Number(event.target.dataset["year"])
        };
        if (event.target.className.search(/\bdouble-date-picker-calender-current-month-day\b/i) !== -1) {
            this.datePickerDateLogic(_selectedDate);
            return null;
        }

    }

    /**
     * dateMouseOverHandler -- on mouse over of dates handle highlight of dates
     * @param {object} event-- mouse over event object
     * @return {null} -- terminate function once any condition matched
     */
    dateMouseOverHandler = (event) => {
        const _selectedDate = {
            day: event.target.dataset["day"],
            date: Number(event.target.dataset["date"]),
            month: Number(event.target.dataset["month"]),
            year: Number(event.target.dataset["year"])
        };

        if (this.dateComparator(_selectedDate, this.selectedDateObj.startDate, "===") || this.dateComparator(_selectedDate, this.selectedDateObj.endDate, "===")) {
            this.calenderHandler(this.month, this.year, this.selectedDateObj.startDate, this.selectedDateObj.endDate);
            return null;
        }

        if (this.dateComparator(_selectedDate, this.selectedDateObj.startDate, "<")) {
            this.calenderHandler(this.month, this.year, _selectedDate, this.selectedDateObj.endDate, 1);
            return null;
        }
        else {
            this.calenderHandler(this.month, this.year, this.selectedDateObj.startDate, _selectedDate, 2);
            return null;
        }
    }

    /**
     * dateMouseOutHandler -- on mouse out action on dates remove action of mouse over event
     * @param {object} event-- mouse out event object
     * @return {null} -- terminate function once any condition matched
     */
    dateMouseOutHandler = (event) => {
        this.calenderHandler(this.month, this.year, this.selectedDateObj.startDate, this.selectedDateObj.endDate);

    }

    /**
     * resetCalender --reset filter to initial state and execute a resetCallBack function 
     * @param {event} -- triggered event object 
     * @return {undefined or null} -- return null if not triggered by click , enter key or space key otherwise undefined
     */
    resetCalender = (event) => {

        if (!this.SelectionEventValidator(event)) {
            return null;
        }

        this.selectedDateObj = {
            startDate: "",
            endDate: ""
        };
        this.selectedDateWithDateFormatObj = {
            startDate: this.props.inputFieldStartDateText || "",
            endDate: this.props.inputFieldEndDateText || ""
        };
        this.calenderHandler(this.todayDateObj.month, this.todayDateObj.year);
        this.day = this.todayDateObj.day;
        this.date = this.todayDateObj.date;
        this.month = this.todayDateObj.month;
        this.year = this.todayDateObj.year;

        this.props.resetCallBack && this.props.resetCallBack();
    }

    /**
     * applyCalender --on click execute the applyCallBack callback with dates by parsing in required format 
     * @param {event} -- triggered event object 
     * @return {undefined or null} -- return null if not triggered by click , enter key or space key otherwise undefined
     */
    applyCalender = (event) => {
        if (!this.SelectionEventValidator(event)) {
            return null;
        }

        this.props.applyCallBack && this.props.applyCallBack(this.selectedDateWithDateFormatObj.startDate, this.selectedDateWithDateFormatObj.endDate, this.selectedDateObj);
    }

    /**
     * dateFormatHandler -- convert date object in particular date format
     * @param {Object} dateObj 
     * @param {string} dateFormat
     * @return {string} _date conerted date in particular format
     */
    dateFormatHandler = (dateObj, dateFormat) => {
        let _date;

        if (!dateFormat || dateFormat.indexOf("DD") === -1 || dateFormat.indexOf("MM") === -1 || dateFormat.indexOf("YYYY") === -1) {
            dateFormat = "DD/MM/YYYY";
        }
        _date = dateFormat;
        _date = _date.replace("DD", dateObj.date);
        _date = _date.replace("MM", (dateObj.month < 10) ? `0${dateObj.month}` : dateObj.month);
        _date = _date.replace("YYYY", dateObj.year);

        return _date;
    }

    /**
     * documentEventHandler --  manage the display , hide functionality on clicking document
     * @param {object} event -- triggered event object
     * @return {undefined}
     */
    documentEventHandler = (event) => {
        const _node = document.getElementsByClassName('double-date-picker-calender-popper')[0];
        if (_node && _node.contains(event.target) === false) {
            this.setState({
                popperShow: false
            });
            document.removeEventListener("click", this.documentEventHandler);
        }
    }

    /**
     * popperVisibilityHandler -- handle calender popper display , hide functionality on click or enter key or space key
     * @param {object} event -- event object passed on click
     * @return {undefined or null} -- return null if not triggered by click , enter key or space key otherwise undefined
     */
    popperVisibilityHandler = (event) => {
        if (!this.SelectionEventValidator(event)) {
            return null;
        }

        this.setState({
            popperShow: !this.state.popperShow
        }, () => {
            if (this.state.popperShow) {
                document.addEventListener("click", this.documentEventHandler);
            }
            else {
                document.removeEventListener("click", this.documentEventHandler);
            }
        });
    }

    /**
     * ariaDateHandler -- on call return date in particular format
     * @param {Object} dateObj -- contain date information
     * @return {String} -- date in particular format
     */
    ariaDateHandler = (dateObj) => {
        if (dateObj) {
            return `${dateObj.day} ${dateObj.date} ${this.monthMapping[dateObj.month].trim()} ${dateObj.year}`;
        }
        else {
            return null;
        }
    }

    /**
     * inputFieldDataHandler -- on call manage label and aria-label of input field based on single date picker or double date picker
     * @param {undefined} no params
     * @return {object} label contain aria label and value contain visible text for Input field
     */
    inputFieldDataHandler = () => {
        let _aria_label = "";
        //for single date picker
        if (this.datePickerMode.number === 1) {
            _aria_label = this.selectedDateObj.startDate ?
                `Selected Date is ${this.ariaDateHandler(this.selectedDateObj.startDate)}` :
                "No Dates Selected";
            return {
                label: _aria_label,
                value: `${this.selectedDateWithDateFormatObj.startDate}`
            }
        }
        else {
            _aria_label = this.selectedDateObj.startDate ?
                `Selected Date is from ${this.ariaDateHandler(this.selectedDateObj.startDate)} to ${this.ariaDateHandler(this.selectedDateObj.endDate)}` :
                "No Dates Selected";
            return {
                label: _aria_label,
                value: `${this.selectedDateWithDateFormatObj.startDate} ${this.props.datesSeperatorSymbol || "->"} ${this.selectedDateWithDateFormatObj.endDate}`
            }
        }
    }

    /**
     * inputFieldVisiblityHandler -- on call tetrun true if input field will visible othervise false
     * @param {undefined} no param
     * @return {Boolean} true if field will disable otherwise false
     */
    inputFieldVisiblityHandler = () => {
        return !this.props.hideInputField && (this.datePickerMode.number !== 3);
    }

    render() {
        const _displayInputField = this.inputFieldVisiblityHandler(),
            _inputFieldObj = _displayInputField && this.inputFieldDataHandler();

        return (
            <div className={`double-date-picker-calender-wrapper ${this.datePickerMode.text}-date-picker-mode`} role="application">
                {_displayInputField &&
                    (<div className="double-date-picker-calender-input-wrapper">
                        <input
                            type="text"
                            name="selected-dates"
                            value={_inputFieldObj.value}
                            className="double-date-picker-calender-input-field"
                            onClick={this.popperVisibilityHandler}
                            onKeyDown={this.popperVisibilityHandler}
                            aria-label={_inputFieldObj.label}
                            tabIndex="0"
                            readOnly />
                    </div>)
                }
                {
                    this.state.popperShow && (
                        <div className={_displayInputField ? "double-date-picker-calender-popper double-date-picker-calender-popper-arrow" : "double-date-picker-calender-popper"}>
                            <div className="double-date-picker-calender-header">
                                <span
                                    onClick={this.previousMonthBtnHandler}
                                    onKeyDown={this.previousMonthBtnHandler}
                                    className="double-date-picker-calender-previous-btn"
                                    aria-label="Previous month button"
                                    tabIndex="0">
                                    &lt;
                                </span>
                                <span
                                    className="double-date-picker-calender-month-year-name"
                                    tabIndex="0">
                                    <span className="double-date-picker-calender-month-name">{this.monthMapping[this.month]}</span>
                                    <span className="double-date-picker-calender-year-name">{this.year}</span>
                                </span>
                                <span
                                    onClick={this.nextMonthBtnHandler}
                                    onKeyDown={this.nextMonthBtnHandler}
                                    className="double-date-picker-calender-next-btn"
                                    aria-label="Next month button"
                                    tabIndex="0">
                                    &gt;
                                </span>
                            </div>
                            <div className="double-date-picker-calender-body">
                                <div className="double-date-picker-calender-day-name-wrapper">
                                    {this.daysNameCreater()}
                                </div>
                                <div
                                    className="double-date-picker-calender-month-wrapper"
                                    tabIndex="-1"
                                    onClick={this.dateSelectionHandler}
                                    onKeyDown={this.dateSelectionHandler}
                                    ref={(input) => { this.monthContainerRef = input; }}>
                                    {this.state.monthMarkup}
                                </div>
                            </div>
                            {
                                (!this.props.hideResetButton || !this.props.hideApplyButton) &&
                                (<div className="double-date-picker-calender-footer">
                                    {
                                        !this.props.hideResetButton &&
                                        (<div className="double-date-picker-calender-reset-button-wrapper">
                                            <button
                                                className="double-date-picker-calender-reset-button"
                                                onClick={this.resetCalender}
                                                onKeyDown={this.resetCalender}
                                                tabIndex="0"
                                            >{this.props.resetBtnText || "Reset"}</button>
                                        </div>)
                                    }
                                    {
                                        !this.props.hideApplyButton &&
                                        (<div className="double-date-picker-calender-apply-button-wrapper" >
                                            <button
                                                className={(this.selectedDateObj.startDate) ?
                                                    "double-date-picker-calender-apply-button" :
                                                    "double-date-picker-calender-apply-button double-date-picker-calender-apply-button-disabled"}
                                                onClick={this.applyCalender}
                                                onKeyDown={this.applyCalender}
                                                tabIndex="0">
                                                {this.props.applyBtnText || "Apply"}
                                            </button>
                                        </div>)
                                    }
                                </div>)
                            }
                        </div>)
                }
            </div>
        );
    }
}

DoubleDatePickerCalender.propTypes = {
    weekNames: PropTypes.arrayOf(PropTypes.string),
    weekNamesLength: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    datePickerMode:PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    monthMapping: PropTypes.objectOf(PropTypes.string),
    applyBtnText: PropTypes.string,
    resetBtnText: PropTypes.string,
    dateFormat: PropTypes.string,
    datesSeperatorSymbol: PropTypes.string,
    inputFieldStartDateText: PropTypes.string,
    inputFieldEndDateText: PropTypes.string,
    hideResetButton: PropTypes.bool,
    hideApplyButton: PropTypes.bool,
    hideInputField: PropTypes.bool,
    disablePastDates: PropTypes.bool,
    applyCallBack: PropTypes.func,
    startDateCallBack: PropTypes.func,
    endDateCallBack: PropTypes.func,
    resetCallBack: PropTypes.func
}