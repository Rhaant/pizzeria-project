/* eslint-disable no-unused-vars */
/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product{
    constructor(id, data){
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
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
      });

    }

    processOrder(){
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form);
      console.log('formData', formData);
      let price = thisProduct.data.price;
      console.log(thisProduct.data.params);
      for(let param in formData){

        if(thisProduct.data.params &&  thisProduct.data.params[param] && thisProduct.data.params[param].options){
          for(let option in thisProduct.data.params[param].options){
            const isSelected = formData[param].includes(option);

            const optionInfo = thisProduct.data.params[param].options[option];
            if(isSelected && !optionInfo.default) price += optionInfo.price;
            else if(optionInfo.default && !isSelected) price -= optionInfo.price;

            const allImages = thisProduct.imageWrapper.querySelectorAll(`.${param}-${option}`);
            console.log(allImages);
            if(isSelected){
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
      thisProduct.priceElem = price;
      console.log(thisProduct.priceElem);
    }
  }


  const app = {
    initData: function(){
      const thisApp = this;

      thisApp.data = dataSource;
    },

    initMenu: function(){
      const thisApp = this;
      console.log('thisApp.data', thisApp.data);

      for(let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },


    init: function(){
      const thisApp = this;
      // console.log('*** App starting ***');
      // console.log('thisApp:', thisApp);
      // console.log('classNames:', classNames);
      // console.log('settings:', settings);
      // console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
