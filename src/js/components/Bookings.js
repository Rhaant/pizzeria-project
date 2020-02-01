import { templates, select, settings, classNames } from '../settings.js';
import { utils } from '../utils.js';
import { AmountWidget } from './AmountWidget.js';
import { DatePicker } from './DatePickr.js';
import { HourPicker } from './HourPicker.js';


export class Booking{

  constructor(element){
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  render(element){
    const thisBooking = this;
    thisBooking.element = element;
    const bookingTemplate = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = thisBooking.element;
    thisBooking.dom.wrapper.innerHTML = bookingTemplate;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.element.querySelectorAll(select.booking.tables);
  }

  initWidgets(){
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    thisBooking.element.addEventListener('updated', ()=>{thisBooking.updatedDom();});
  }
  getData(){
    const thisBooking = this;

    const startEndDates = {};
    startEndDates[settings.db.dateStartParamKey] = utils.dateToStr(thisBooking.datePicker.minDate);
    startEndDates[settings.db.dateEndParamKey] = utils.dateToStr(thisBooking.datePicker.maxDate);

    const endDate = {};
    endDate[settings.db.dateEndParamKey] = startEndDates[settings.db.dateEndParamKey];

    const params = {
      booking: utils.queryParams(startEndDates),
      eventsCurrent: settings.db.notRepeatParam + '&' + utils.queryParams(startEndDates),
      eventsRepeat: settings.db.repeatParam + '&' + utils.queryParams(endDate),
    };
    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking,
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent,
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat,
    };

    console.log('getData urls', urls);

    console.log('getData params', params);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function([bookingsResponse, eventsCurrentResponse, eventsRepeatResponse]){
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }
  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;
    thisBooking.booked = {};
    console.log(eventsCurrent);
    for(let currentEvent in eventsCurrent){
      let event = eventsCurrent[currentEvent];
      thisBooking.makeBooked(event.date, utils.hourToNumber(event.hour), event.duration, event.table);
      console.log(event.date);
      console.log(eventsCurrent[currentEvent].date);
    }
    for(let currentEvent in bookings) {
      let event = bookings[currentEvent];
      console.log(event.date);
      thisBooking.makeBooked(event.date, utils.hourToNumber(event.hour), event.duration, event.table);
    }
    for(let currentEvent in eventsRepeat){
      let event = eventsRepeat[currentEvent];
      thisBooking.makeBooked(event.date, utils.hourToNumber(event.hour), event.duration, event.table);
      let maxDate = Date.parse(thisBooking.datePicker.maxDate);
      let currentDate = Date.parse(event.date);
      const singleDay = 24*60*60*1000;
      console.log('maxDate:', maxDate, 'currentDate: ', currentDate, 'singleDay:', singleDay);
      for(let date = currentDate; date <= maxDate; date += singleDay){
        event.date = new Date(date);
        let newDate = utils.dateToStr(event.date);
        console.log(newDate);
        thisBooking.makeBooked(newDate, utils.hourToNumber(event.hour), event.duration, event.table);
      }
    }
    thisBooking.updatedDom();
  }
  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if (!thisBooking.booked[date]) thisBooking.booked[date]= {};
    let startHour = hour;
    let endHour = hour + duration;
    const i = 0.5;
    for(let presentHour = startHour; presentHour < endHour; presentHour += i ){
      if (!thisBooking.booked[date][presentHour]) thisBooking.booked[date][presentHour] = [];
      if(!thisBooking.booked[date][presentHour].includes(table)) thisBooking.booked[date][presentHour].push(table);
    }
    // console.log(thisBooking.booked);
  }
  updatedDom(){
    const thisBooking = this;
    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);
    console.log(thisBooking.date);
    for(let table of thisBooking.dom.tables){
      let tableID = parseInt(table.getAttribute(settings.booking.tableIdAttribute));
      let newArray = thisBooking.booked[thisBooking.date][thisBooking.hour];
      console.log(thisBooking.booked[thisBooking.date]);
      console.log(newArray, parseInt(tableID));
      if(thisBooking.booked[thisBooking.date] && thisBooking.booked[thisBooking.date][thisBooking.hour]  && newArray.includes(tableID)){
        console.log('teraz');
        table.classList.add(classNames.booking.tableBooked);
      }else table.classList.remove(classNames.booking.tableBooked);

    }

  }

}
