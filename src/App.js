import React from "react";
import './App.css';


export default class DoubleDatePickerCalender extends React.Component {

    constructor(props) {
        super();
        const dateObj = new Date();
        this.date = dateObj.getDate(); // get date (0-31)
        this.month = dateObj.getMonth() + 1; // get month (1-12)
        this.year = dateObj.getFullYear();
        this.todayDateObj = {         //contain information of current day 
            date: this.date,
            month: this.month,
            year: this.year
        };
        this.dateSelectionHandler = this.dateSelectionHandler.bind(this);
        this.monthCreater = this.monthCreater.bind(this);
        this.selectedDateObj = {
            startDate: "", // if contain value then contain in format{date:--,month:--,year:--} otherwise empty string
            endDate: "" // if contain value then contain in format{date:--,month:--,year:--} otherwise empty string
        };
        this.selectedDateWithDateFormatObj = {
            startDate: props.inputFieldStartDateText || "",  // always string
            endDate: props.inputFieldEndDateText || ""    //always string
        };
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
        this.state = {
            monthMarkup: this.monthCreater(this.month, this.year), //create month for current month for initial rendering
            popperShow: false
        }
    }
    /**
     * leapYearFinder -- detect that passed year is leap year or not
     * @param {number} year 
     * @return {boolean} return true if passed year is leap year otherwise return false
     */
    leapYearFinder(year) {
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
    dayFinder(date, month, year) {
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
    daysInMonthFinder(month, year) {
        return (month === 2) ? (this.leapYearFinder(year) ? 29 : 28) : (31 - (month - 1) % 7 % 2);

    }

    /**
     * daysNameCreater -- on call create markup for days Name
     * @param {undefined}
     * @return {array} _daysNameMarkUp --contain array of object(having markup for each day)
     */
    daysNameCreater = () => {
        const _weekName = ["Mn", "Tu", "We", "Th", "Fr", "Sa", "Su"];
        let _daysNameMarkUp = [];
        for (let i = 1; i <= _weekName.length; i++) {
            _daysNameMarkUp = [..._daysNameMarkUp, <span className="date-picker-calender-day-name" key={i}>{_weekName[i - 1]}</span>];
        }
        return _daysNameMarkUp;
    };
    /**
     * insideMonthDateClassHandler -- function return class Name for particular date based on logic
     * @param {object} startDate -- date for which class has to find
     * @param {object} firstSelectedDate -- first date selected in calender
     * @param {object} secondSelectedDate -- second date selected in calender
     * @param {number} hoverMode --- by default its is inactive(value 0) ,it enable when mouseover event fire its value is 1 or 2 
     * @return {string} -- return class for particular date according to logic
     */
    insideMonthDateClassHandler = (startDate, firstSelectedDate, secondSelectedDate, hoverMode = 0) => {
        const _insideMonthClass = "date-picker-calender-day date-picker-calender-current-month-day",
            _currentDateClass = "date-picker-calender-today",
            _dateBetweenFirstSecondSelected = "date-picker-calender-first-second-between-selected";
        let _secondSelectedDateClass = "date-picker-calender-second-date-selected",
            _firstSelectedDateClass = "date-picker-calender-first-date-selected";

        if (hoverMode) {
            if (hoverMode === 1) {
                _secondSelectedDateClass = "date-picker-calender-first-second-between-selected";
            }
            if (hoverMode === 2) {
                _firstSelectedDateClass = "date-picker-calender-first-second-between-selected";
            }

        }

        if (!firstSelectedDate && !secondSelectedDate && startDate.date === this.todayDateObj.date && this.dateComparator(startDate, this.todayDateObj, "===")) {
            return `${_insideMonthClass} ${_currentDateClass}`;
        }
        if (firstSelectedDate && secondSelectedDate) {
            if (this.dateComparator(startDate, firstSelectedDate, "===") && this.dateComparator(firstSelectedDate, secondSelectedDate, "===")) {
                return `${_insideMonthClass} ${_firstSelectedDateClass} ${_secondSelectedDateClass}`;
            }
            if (this.dateComparator(startDate, firstSelectedDate, ">") && this.dateComparator(startDate, secondSelectedDate, "<")) {
                return `${_insideMonthClass} ${_dateBetweenFirstSecondSelected}`;
            }
        }
        if (firstSelectedDate && this.dateComparator(startDate, firstSelectedDate, "===")) {
            return `${_insideMonthClass} ${_firstSelectedDateClass}`;
        }
        if (secondSelectedDate && this.dateComparator(startDate, secondSelectedDate, "===")) {
            return `${_insideMonthClass} ${_secondSelectedDateClass}`;
        }
        else {
            return _insideMonthClass;

        }
    }
    /**
     * weekCreater create markup for a particular week on call
     * @param {object} startDate -- first date of week
     * @param {string} weekPosition -- contain position of week , it has three value first,middle and last
     * @param {number} outsideDateRepetition --it is for first and last week and has number of  day in previous and next month will show in current month
     * @param {object} firstSelectedDate -- first date selected in calender
     * @param {object} secondSelectedDate -- second date selected in calender
     * @param {number} hoverMode --- by default its is inactive(value 0) ,it enable when mouseover event fire its value is 1 or 2 
     * @return {array} _weekMarkup -- contaion array of dates of a week
     */
    weekCreater = (startDate, weekPosition, outsideDateRepetition, firstSelectedDate = 0, secondSelectedDate = 0, hoverMode = 0) => {
        let _weekMarkup = [],
            _mouseEvents = {};
        const _outsideMonthClass = "date-picker-calender-day date-picker-calender-outside-month-day";
        if ((this.selectedDateObj.startDate && !this.selectedDateObj.endDate) || (!this.selectedDateObj.startDate && this.selectedDateObj.endDate)) {
            _mouseEvents = {
                onMouseOver: this.dateMouseOverHandler,
                onMouseOut: this.dateMouseOutHandler
            }
        }

        if (weekPosition === "first") {
            if (outsideDateRepetition === 0) {
                startDate.date = 1;
            }
            for (let i = 1; i <= 7; i++) {
                if (outsideDateRepetition) {
                    _weekMarkup = [..._weekMarkup,
                    <span
                        className={_outsideMonthClass}
                        key={i}
                    >{startDate.date}
                    </span>
                    ];
                    --outsideDateRepetition;
                    ++startDate.date;
                    if (outsideDateRepetition === 0) {
                        startDate.date = 1;
                    }
                }
                else {
                    _weekMarkup = [..._weekMarkup,
                    <span
                        className={this.insideMonthDateClassHandler(startDate, firstSelectedDate, secondSelectedDate, hoverMode)}
                        key={i}
                        data-date={startDate.date}
                        data-month={startDate.month}
                        data-year={startDate.year}
                        {..._mouseEvents}
                    >
                        {startDate.date++}
                    </span>
                    ];
                }
            }
        } else if (weekPosition === "last") {
            let insideDateRepetition = 7 - outsideDateRepetition,
                j = 1;;
            for (let i = 1; i <= 7; i++) {
                if (insideDateRepetition) {
                    _weekMarkup = [..._weekMarkup,
                    <span
                        className={this.insideMonthDateClassHandler(startDate, firstSelectedDate, secondSelectedDate, hoverMode)}
                        key={i}
                        data-date={startDate.date}
                        data-month={startDate.month}
                        data-year={startDate.year}
                        {..._mouseEvents}
                    >
                        {startDate.date}
                    </span>
                    ];
                    --insideDateRepetition;
                    ++startDate.date;
                }
                else {

                    _weekMarkup = [..._weekMarkup,
                    <span className={_outsideMonthClass} key={i}>{j++}
                    </span>
                    ];
                }
            }
        }
        else {
            for (let i = 1; i <= 7; i++) {
                _weekMarkup = [..._weekMarkup,
                <span
                    className={this.insideMonthDateClassHandler(startDate, firstSelectedDate, secondSelectedDate, hoverMode)}
                    key={i}
                    data-date={startDate.date}
                    data-month={startDate.month}
                    data-year={startDate.year}
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
            _previousOutsideMonthStartDate = (month - 1 === 0) ? (this.daysInMonthFinder(12, year - 1) - (_monthFirstWeekDay - 1) + 1) : (this.daysInMonthFinder(month - 1, year) - (_monthFirstWeekDay - 1) + 1),
            _middleWeekEndDate = _totalDaysInMonth - _monthLastWeekDay;
        let _monthMarkup = [],
            _middleWeekStartDate = 7 - (_monthFirstWeekDay - 1) + 1,
            _middleWeekRepetition = (_middleWeekEndDate - (_middleWeekStartDate - 1)) / 7,
            _dynamicWeek;

        _monthMarkup = [(<div className="date-picker-calender-week" key={9}>
            {this.weekCreater({ date: _previousOutsideMonthStartDate, month, year }, "first", _monthFirstWeekDay - 1, firstSelectedDate, secondSelectedDate, hoverMode)}
        </div>)];
        while (_middleWeekRepetition) {
            _dynamicWeek = (<div className="date-picker-calender-week" key={_middleWeekRepetition}>
                {this.weekCreater({ date: _middleWeekStartDate, month, year }, "middle", 0, firstSelectedDate, secondSelectedDate, hoverMode)}
            </div>);
            _monthMarkup = [..._monthMarkup, _dynamicWeek]
            _middleWeekStartDate = _middleWeekStartDate + 7;
            --_middleWeekRepetition;
        }
        _dynamicWeek = (<div className="date-picker-calender-week" key={10}>
            {this.weekCreater({ date: _middleWeekEndDate + 1, month, year }, "last", 7 - _monthLastWeekDay, firstSelectedDate, secondSelectedDate, hoverMode)}
        </div>);
        _monthMarkup = [_monthMarkup, _dynamicWeek];

        return _monthMarkup;
    };

    /**
     * dateComparatorNumberGenerator -- return a number based on the two dates passed
     * @param {object} firstDateObj  -- contaion first date to compare in format {date:23,month:2,year:2018}
     * @param {object} secondDateObj  -- contaion second date to compare in format {date:23,month:2,year:2018}
     * @return {number} return 1 if first date is greater ,return 2 if second date is greater and return 3 if both are equal
     */
    dateComparatorNumberGenerator(firstDateObj, secondDateObj) {
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
    dateComparator(firstDateObj, secondDateObj, operator) {
        let _number = this.dateComparatorNumberGenerator(firstDateObj, secondDateObj);
        if (operator === "===" && _number === 3) {
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
     * @param {number} hoverMode --- by default its is inactive(value 0) ,it enable when mouseover event fire its value is 1 or 2 
     * @return {undefined} -- don't eturn anything
     */
    calenderHandler = (month, year, firstSelectedDate, secondSelectedDate, hoverMode = 0) => {
        this.setState({
            monthMarkup: this.monthCreater(month, year, firstSelectedDate, secondSelectedDate, hoverMode)
        });
    }

    /**
     * previousMonthBtnHandler -- on click on previous month arrow ,create markup for previous month
     * {undefined} -- not have params
     * {undefined} --not return anything
     */
    previousMonthBtnHandler = () => {
        let _firstSelectedDate = this.selectedDateObj.startDate.date && this.selectedDateObj.startDate,
            _secondSelectedDate = this.selectedDateObj.endDate.date && this.selectedDateObj.endDate;
        (this.month - 1 === 0) ?
            this.calenderHandler(this.month = 12, this.year -= 1, _firstSelectedDate, _secondSelectedDate) :
            this.calenderHandler(this.month -= 1, this.year, _firstSelectedDate, _secondSelectedDate)
    }

    /**
     * nextMonthBtnHandler -- on click on next month arrow ,create markup for next month
     * {undefined} -- not have params
     * {undefined} --not return anything
     */
    nextMonthBtnHandler = () => {
        let _firstSelectedDate = this.selectedDateObj.startDate.date && this.selectedDateObj.startDate,
            _secondSelectedDate = this.selectedDateObj.endDate.date && this.selectedDateObj.endDate;
        (this.month + 1 === 13) ?
            this.calenderHandler(this.month = 1, this.year += 1, _firstSelectedDate, _secondSelectedDate) :
            this.calenderHandler(this.month += 1, this.year, _firstSelectedDate, _secondSelectedDate)
    }

    /**
     * dateSelectionHandler -- on click handle selection of dates
     * {object} event-- click event object
     * {null} -- terminate function once any condition matched
     */
    dateSelectionHandler = (event) => {
        let _selectedDate = {
            date: Number(event.target.dataset["date"]),
            month: Number(event.target.dataset["month"]),
            year: Number(event.target.dataset["year"])
        };
        if (event.target.className.search(/\bdate-picker-calender-current-month-day\b/i) !== -1) {
            if (!this.selectedDateObj.startDate) {
                if (this.selectedDateObj.endDate) {
                    if (this.dateComparator(_selectedDate, this.selectedDateObj.endDate, "<=")) {
                        this.selectedDateObj.startDate = _selectedDate;
                        this.selectedDateWithDateFormatObj.startDate = this.dateFormatHandler(this.selectedDateObj.startDate, this.props.dateFormat);
                        this.calenderHandler(this.month, this.year, this.selectedDateObj.startDate, this.selectedDateObj.endDate);

                        this.props.startDateCallBack && this.props.startDateCallBack(this.selectedDateWithDateFormatObj.startDate);

                        return null;
                    }
                    else {
                        this.selectedDateObj.startDate = this.selectedDateObj.endDate;
                        this.selectedDateObj.endDate = _selectedDate;
                        this.selectedDateWithDateFormatObj.startDate = this.dateFormatHandler(this.selectedDateObj.startDate, this.props.dateFormat);
                        this.selectedDateWithDateFormatObj.endDate = this.dateFormatHandler(this.selectedDateObj.endDate, this.props.dateFormat);
                        this.calenderHandler(this.month, this.year, this.selectedDateObj.startDate, this.selectedDateObj.endDate);

                        this.props.startDateCallBack && this.props.startDateCallBack(this.selectedDateWithDateFormatObj.startDate);
                        this.props.endDateCallBack && this.props.endDateCallBack(this.selectedDateWithDateFormatObj.endDate);

                        return null;
                    }
                }
                else {
                    this.selectedDateObj.startDate = _selectedDate;
                    this.calenderHandler(this.month, this.year, this.selectedDateObj.startDate, 0);
                    this.selectedDateWithDateFormatObj.startDate = this.dateFormatHandler(this.selectedDateObj.startDate, this.props.dateFormat);

                    this.props.startDateCallBack && this.props.startDateCallBack(this.selectedDateWithDateFormatObj.startDate);

                    return null;
                }

            }

            if (this.selectedDateObj.startDate && !this.selectedDateObj.endDate) {
                if (this.dateComparator(_selectedDate, this.selectedDateObj.startDate, ">=")) {
                    this.selectedDateObj.endDate = _selectedDate;
                    this.selectedDateWithDateFormatObj.endDate = this.dateFormatHandler(this.selectedDateObj.endDate, this.props.dateFormat);
                    this.calenderHandler(this.month, this.year, this.selectedDateObj.startDate, this.selectedDateObj.endDate);

                    this.props.endDateCallBack && this.props.endDateCallBack(this.selectedDateWithDateFormatObj.endDate);

                    return null;
                }
                else {
                    this.selectedDateObj.endDate = this.selectedDateObj.startDate;
                    this.selectedDateObj.startDate = _selectedDate;
                    this.selectedDateWithDateFormatObj.startDate = this.dateFormatHandler(this.selectedDateObj.startDate, this.props.dateFormat);
                    this.selectedDateWithDateFormatObj.endDate = this.dateFormatHandler(this.selectedDateObj.endDate, this.props.dateFormat);
                    this.calenderHandler(this.month, this.year, this.selectedDateObj.startDate, this.selectedDateObj.endDate);

                    this.props.startDateCallBack && this.props.startDateCallBack(this.selectedDateWithDateFormatObj.startDate);
                    this.props.endDateCallBack && this.props.endDateCallBack(this.selectedDateWithDateFormatObj.endDate);

                    return null;
                }

            }

            if (this.dateComparator(_selectedDate, this.selectedDateObj.startDate, "===") && this.dateComparator(_selectedDate, this.selectedDateObj.endDate, "===")) {
                this.selectedDateObj = {
                    startDate: "",
                    endDate: ""
                };
                this.selectedDateWithDateFormatObj = {
                    startDate: this.props.inputFieldStartDateText || "",
                    endDate: this.props.inputFieldEndDateText || ""
                };
                this.calenderHandler(this.month, this.year, this.selectedDateObj.startDate, this.selectedDateObj.endDate);

                this.props.startDateCallBack && this.props.startDateCallBack(this.selectedDateWithDateFormatObj.startDate);
                this.props.endDateCallBack && this.props.endDateCallBack(this.selectedDateWithDateFormatObj.endDate);

                return null;
            }
            if (this.dateComparator(_selectedDate, this.selectedDateObj.startDate, "===")) {
                this.selectedDateObj.startDate = "";
                this.selectedDateWithDateFormatObj.startDate = this.props.inputFieldStartDateText || "";
                this.calenderHandler(this.month, this.year, this.selectedDateObj.startDate, this.selectedDateObj.endDate);

                this.props.startDateCallBack && this.props.startDateCallBack(this.selectedDateWithDateFormatObj.startDate);

                return null;
            }
            if (this.dateComparator(_selectedDate, this.selectedDateObj.endDate, "===")) {
                this.selectedDateObj.endDate = "";
                this.selectedDateWithDateFormatObj.endDate = this.props.inputFieldEndDateText || "";
                this.calenderHandler(this.month, this.year, this.selectedDateObj.startDate, this.selectedDateObj.endDate);

                this.props.endDateCallBack && this.props.endDateCallBack(this.selectedDateWithDateFormatObj.endDate);

                return null;
            }
            if (this.dateComparator(_selectedDate, this.selectedDateObj.startDate, ">=")) {
                this.selectedDateObj.endDate = _selectedDate;
                this.selectedDateWithDateFormatObj.startDate = this.dateFormatHandler(this.selectedDateObj.startDate, this.props.dateFormat);
                this.calenderHandler(this.month, this.year, this.selectedDateObj.startDate, this.selectedDateObj.endDate);

                this.props.startDateCallBack && this.props.startDateCallBack(this.selectedDateWithDateFormatObj.startDate);

                return null;
            }
            else {
                this.selectedDateObj.startDate = _selectedDate;
                this.selectedDateWithDateFormatObj.endDate = this.dateFormatHandler(this.selectedDateObj.endDate, this.props.dateFormat);
                this.calenderHandler(this.month, this.year, this.selectedDateObj.startDate, this.selectedDateObj.endDate);

                this.props.endDateCallBack && this.props.endDateCallBack(this.selectedDateWithDateFormatObj.endDate);

                return null;
            }
        }

    }

    /**
     * dateMouseOverHandler -- on mouse over of dates handle highlight of dates
     * {object} event-- mouse over event object
     * {null} -- terminate function once any condition matched
     */
    dateMouseOverHandler = (event) => {
        let _selectedDate = {
            date: Number(event.target.dataset["date"]),
            month: Number(event.target.dataset["month"]),
            year: Number(event.target.dataset["year"])
        };

        if (this.dateComparator(_selectedDate, this.selectedDateObj.startDate, "===") || this.dateComparator(_selectedDate, this.selectedDateObj.endDate, "===")) {
            this.calenderHandler(this.month, this.year, this.selectedDateObj.startDate, this.selectedDateObj.endDate);
            return null;
        }
        if (this.selectedDateObj.startDate && !this.selectedDateObj.endDate && this.dateComparator(_selectedDate, this.selectedDateObj.startDate, "<")) {
            this.calenderHandler(this.month, this.year, _selectedDate, this.selectedDateObj.startDate, 2);
            return null;
        }
        if (this.selectedDateObj.startDate && !this.selectedDateObj.endDate) {
            this.calenderHandler(this.month, this.year, this.selectedDateObj.startDate, _selectedDate, 1);
        }
        if (this.selectedDateObj.endDate && !this.selectedDateObj.startDate && this.dateComparator(_selectedDate, this.selectedDateObj.endDate, ">")) {
            this.calenderHandler(this.month, this.year, this.selectedDateObj.endDate, _selectedDate, 1);
            return null;
        }
        if ((!this.selectedDateObj.startDate && this.selectedDateObj.endDate)) {
            this.calenderHandler(this.month, this.year, _selectedDate, this.selectedDateObj.endDate, 2);
        }

    }

    /**
     * dateMouseOutHandler -- on mouse out action on dates remove action of mouse over event
     * {object} event-- mouse out event object
     * {null} -- terminate function once any condition matched
     */
    dateMouseOutHandler = (event) => {
        if (event.target.className.search(/\bdate-picker-calender-current-month-day\b/i) !== -1) {
            this.calenderHandler(this.month, this.year, this.selectedDateObj.startDate, this.selectedDateObj.endDate);
        }

    }

    /**
     * resetCalender --reset filter to initial state and execute a resetCallBack function 
     * {undefined} -- no parameter
     * {undefined} -- not returing anything
     */
    resetCalender = () => {
        this.selectedDateObj = {
            startDate: "",
            endDate: ""
        };
        this.selectedDateWithDateFormatObj = {
            startDate: this.props.inputFieldStartDateText || "",
            endDate: this.props.inputFieldEndDateText || ""
        };
        this.calenderHandler(this.todayDateObj.month, this.todayDateObj.year);
        this.date = this.todayDateObj.date;
        this.month = this.todayDateObj.month;
        this.year = this.todayDateObj.year;

        this.props.resetCallBack && this.props.resetCallBack();
    }
    /**
     * resetCalender --on click execute the applyCallBack callback with dates by parsing in required format 
     * {undefined} -- no parameter
     * {undefined} -- not returing anything
     */
    applyCalender = () => {
        this.props.applyCallBack && this.props.applyCallBack(this.selectedDateWithDateFormatObj.startDate, this.selectedDateWithDateFormatObj.endDate, this.selectedDateObj);
    }
    /**
     * dateFormatHandler -- convert date object in particular date format
     * @param {Object} dateObj 
     * @param {string} dateFormat
     * @return {string} _date conerted date in particular format
     */
    dateFormatHandler(dateObj, dateFormat) {
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

    documentEventHandler = (event) => {
        if (event.target.className.search(/\bdate-picker-calender-input-field\b/i) !== -1) {
            document.removeEventListener("click", this.documentEventHandler);
            return null;
        }
        if (document.getElementsByClassName('date-picker-calender-popper')[0].contains(event.target) === false) {
            this.setState({
                popperShow: false
            });
            document.removeEventListener("click", this.documentEventHandler);
        }
    }
    popperVisibilityHandler = (event) => {
        this.setState({
            popperShow: !this.state.popperShow
        }, () => {
            this.state.popperShow && document.addEventListener("click", this.documentEventHandler);
        });
    }

    render() {
        return (
            <div className="date-picker-calender-wrapper">
                <div className="date-picker-calender-input-wrapper">
                    <input
                        type="text"
                        name="selected-dates"
                        value={`${this.selectedDateWithDateFormatObj.startDate} ${this.props.datesSeperatorSymbol} ${this.selectedDateWithDateFormatObj.endDate}`}
                        className="date-picker-calender-input-field"
                        onClick={this.popperVisibilityHandler}
                        readOnly />
                </div>
                {
                    this.state.popperShow && (
                        <div className="date-picker-calender-popper">
                            <div className="date-picker-calender-header">
                                <span
                                    onClick={this.previousMonthBtnHandler}
                                    className="date-picker-calender-previous-btn"> &lt; </span>
                                <span className="date-picker-calender-month-year-name">
                                    <span className="date-picker-calender-month-name">{this.monthMapping[this.month]}</span>
                                    <span className="date-picker-calender-year-name">{this.year}</span>
                                </span>
                                <span
                                    onClick={this.nextMonthBtnHandler}
                                    className="date-picker-calender-next-btn">&gt; </span>
                            </div>
                            <div className="date-picker-calender-body">
                                <div className="date-picker-calender-day-name-wrapper">
                                    {this.daysNameCreater()}
                                </div>
                                <div className="date-picker-calender-month-wrapper" onClick={this.dateSelectionHandler}>
                                    {this.state.monthMarkup}
                                </div>
                            </div>
                            {
                                (!this.props.hideResetButton || !this.props.hideApplyButton) &&
                                (<div className="date-picker-calender-footer">
                                    {
                                        !this.props.hideResetButton && (<div className="date-picker-calender-reset-button" onClick={this.resetCalender}>
                                            <span>{this.props.resetBtnText || "Reset"}</span>
                                        </div>)
                                    }
                                    {
                                        !this.props.hideApplyButton && (<div className="date-picker-calender-apply-button" onClick={this.applyCalender}>
                                            <span>{this.props.applyBtnText || "Apply"}</span>
                                        </div>)
                                    }
                                </div>
                                )
                            }
                        </div>)
                }
            </div>
        );
    }
}