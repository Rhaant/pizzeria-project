import {select, settings} from '../settings.js';
import {BaseWidget} from './BaseWidget.js';

export class AmountWidget extends BaseWidget{
  constructor(wrapper){
    super(wrapper, settings.amountWidget.defaultValue);
    const thisWidget = this;
    thisWidget.getElements();
    thisWidget.dom.input.value   = settings.amountWidget.defaultValue;
    thisWidget.initActions();

  }

  getElements(){
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  initActions(){
    const thisWidget = this;
    thisWidget.dom.input.addEventListener('change', ()=>{thisWidget.value = thisWidget.dom.input.value;});
    thisWidget.dom.linkDecrease.addEventListener('click', ()=>{
      event.preventDefault;
      thisWidget.value --;
    });
    thisWidget.dom.linkIncrease.addEventListener('click', function() {
      event.preventDefault;
      thisWidget.value ++;
    });
  }
  isValid(newValue){
    return !isNaN(newValue) && newValue >= settings.amountWidget.defaultMin && newValue<= settings.amountWidget.defaultMax;
  }

  renderValue() {

    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  }

}
