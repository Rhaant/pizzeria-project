// import { utils } from "stylelint";
import {Product} from './components/Product.js';
import {Cart} from './components/Cart.js';
import {select, settings} from './settings.js';
/* eslint-disable no-unused-vars */
/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars
const app = {

  initMenu: function(){
    const thisApp = this;
    console.log('thisApp.data', thisApp.data);

    for(let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },
  initData: function(){
    const thisApp = this;
    const url = `${settings.db.url}/${settings.db.product}`;
    thisApp.data = {};
    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);

        thisApp.data.products = parsedResponse;
        thisApp.initMenu();

      });
    console.log('thisApp.data', JSON.stringify(thisApp.data));

  },

  initCart: function(){
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
  },

  init: function(){
    const thisApp = this;
    // console.log('*** App starting ***');
    // console.log('thisApp:', thisApp);
    // console.log('classNames:', classNames);
    // console.log('settings:', settings);
    // console.log('templates:', templates);

    thisApp.initData();
    thisApp.initCart();
  },
};

app.init();

