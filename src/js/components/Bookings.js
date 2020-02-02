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
    thisBooking.dom.phone = thisBooking.element.querySelector(select.booking.phone);
    thisBooking.dom.address = thisBooking.element.querySelector(select.booking.address);
    thisBooking.dom.submit = thisBooking.dom.wrapper.querySelector(select.booking.form);
    thisBooking.dom.starters = document.querySelectorAll('.checkbox input');

  }

  initWidgets(){
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    thisBooking.element.addEventListener('updated', ()=>{thisBooking.updatedDom();});
    thisBooking.dom.phone.addEventListener('change', ()=> {thisBooking.phone = thisBooking.dom.phone.value;});
    thisBooking.dom.address.addEventListener('change', ()=>{thisBooking.address = thisBooking.dom.address.value;});
    thisBooking.dom.submit.addEventListener('submit', ()=>{
      event.preventDefault();
      thisBooking.sendBooking();
    });
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
      // console.log(event.date);
      // console.log(eventsCurrent[currentEvent].date);
    }
    for(let currentEvent in bookings) {
      let event = bookings[currentEvent];
      // console.log(event.date);
      thisBooking.makeBooked(event.date, utils.hourToNumber(event.hour), event.duration, event.table);
    }
    for(let currentEvent in eventsRepeat){
      let event = eventsRepeat[currentEvent];
      thisBooking.makeBooked(event.date, utils.hourToNumber(event.hour), event.duration, event.table);
      let maxDate = Date.parse(thisBooking.datePicker.maxDate);
      let currentDate = Date.parse(event.date);
      const singleDay = 24*60*60*1000;
      // console.log('maxDate:', maxDate, 'currentDate: ', currentDate, 'singleDay:', singleDay);
      for(let date = currentDate; date <= maxDate; date += singleDay){
        event.date = new Date(date);
        let newDate = utils.dateToStr(event.date);
        // console.log(newDate);
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
    let selectedTables = [];
    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);
    // console.log(thisBooking.date);
    for(let table of thisBooking.dom.tables){
      let tableID = parseInt(table.getAttribute(settings.booking.tableIdAttribute));
      // console.log(thisBooking.booked[thisBooking.date]);
      if(thisBooking.booked[thisBooking.date] && thisBooking.booked[thisBooking.date][thisBooking.hour]  && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableID)){
        // console.log('teraz');
        table.classList.add(classNames.booking.tableBooked);
      }else table.classList.remove(classNames.booking.tableBooked);

      table.addEventListener('click', ()=> {
        event.preventDefault;
        if(selectedTables.length == 0){
          selectedTables.push(table);
          table.classList.add(classNames.booking.tableBooked);
        }else {
          selectedTables[0].classList.remove(classNames.booking.tableBooked);
          selectedTables.pop();
          selectedTables.push(table);
          table.classList.add(classNames.booking.tableBooked);
        }
        thisBooking.selectedTable = selectedTables[0].getAttribute('data-table');
        console.log(selectedTables[0].getAttribute('data-table'));
      });

    }
  }
  sendBooking(){
    const thisBooking = this;
    const url = `${settings.db.url}/${settings.db.booking}`;

    const payload = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: parseInt(thisBooking.selectedTable),
      repeat: false,
      duration: thisBooking.hoursAmount.value,
      ppl: parseInt(thisBooking.peopleAmount.value),
      phone: thisBooking.phone,
      address: thisBooking.address,
      starters: []
    };
    for(let starter of thisBooking.dom.starters){
      if(starter.checked) payload.starters.push(starter.value);
    }
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      });
    console.log(payload);
    thisBooking.getData();

  }

}
