import {select, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import {AmountWidget} from './AmountWidget.js';

export class Product{
  constructor(id, data){
    const thisProduct = this;
    thisProduct.id = id;
    thisProduct.data = data;
    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
    // console.log('new Product:', thisProduct);

  }
  renderInMenu(){
    const thisProduct = this;
    const generatedHTML = templates.menuProduct(thisProduct.data);
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    const menuContainer = document.querySelector(select.containerOf.menu);
    menuContainer.appendChild(thisProduct.element);
  }
  getElements(){
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }
  initAccordion(){
    const thisProduct = this;
    const button = thisProduct.accordionTrigger;
    button.addEventListener('click', function(){
      event.preventDefault;
      thisProduct.element.classList.toggle('active');
      const activeProducts = document.querySelectorAll('article.active');
      // console.log(activeProducts)
      for(let activeProduct of activeProducts){
        // console.log(activeProduct)
        if(activeProduct == thisProduct.element){
          continue;
        }else{
          activeProduct.classList.remove('active');}
      }
    });}
  initOrderForm(){
    const thisProduct = this;

    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });

    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });

  }
  initAmountWidget(){
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', ()=>{thisProduct.processOrder();});
  }

  processOrder(){
    const thisProduct = this;
    const formData = utils.serializeFormToObject(thisProduct.form);
    thisProduct.params = {};
    // console.log('formData', formData);
    let price = thisProduct.data.price;
    // console.log(thisProduct.data.params);
    for(let paramID in thisProduct.data.params){
      const param = thisProduct.data.params[paramID];

      if(thisProduct.data.params &&  thisProduct.data.params[paramID] && thisProduct.data.params[paramID].options){
        for(let optionID in thisProduct.data.params[paramID].options){
          const option = param.options[optionID];
          const isSelected = formData[paramID].includes(optionID);

          const optionInfo = thisProduct.data.params[paramID].options[optionID];
          if(isSelected && !optionInfo.default) price += optionInfo.price;
          else if(optionInfo.default && !isSelected) price -= optionInfo.price;

          const allImages = thisProduct.imageWrapper.querySelectorAll(`.${paramID}-${optionID}`);
          // console.log(allImages);
          if(isSelected){

            if(!thisProduct.params[paramID]){
              thisProduct.params[paramID] = {
                label: param.label,
                options: {},
              };
              // console.log(thisProduct.params[paramID]);
            }
            thisProduct.params[paramID].options[optionID] = option.label;

            for(let image of allImages){
              image.classList.add(classNames.menuProduct.imageVisible);}
          }else{
            for(let image of allImages){
              image.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }

      }

    }
    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

    thisProduct.priceElem.innerHTML = thisProduct.price;

  }

  addToCart(){
    const thisProduct = this;

    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });
    thisProduct.element.dispatchEvent(event);
  }
}
