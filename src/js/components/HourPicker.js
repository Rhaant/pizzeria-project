import { BaseWidget } from './BaseWidget.js';
import { settings, select } from '../settings.js';
import { utils } from '../utils.js';

export class HourPicker extends BaseWidget{
  constructor(wrapper){
    super(wrapper, settings.hours.open);
    const thisWidget = this;
    console.log(thisWidget.dom.wrapper);
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.input);
    thisWidget.dom.output = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.output);
    thisWidget.initPlugin();
    thisWidget.value = thisWidget.dom.input.value;
  }

  initPlugin(){
    const thisWidget = this;
    // eslint-disable-next-line no-undef
    rangeSlider.create(thisWidget.dom.input);
    thisWidget.dom.input.addEventListener('input',()=>{
      thisWidget.value = thisWidget.dom.input.value;
      console.log(thisWidget.value);
    });


  }


  parseValue(newValue){
    return utils.numberToHour(newValue);
  }
  isValid(){
    return true;
  }

  renderValue(){
    const thisWidget = this;
    thisWidget.dom.output.innerHTML = thisWidget.value;
  }

}
