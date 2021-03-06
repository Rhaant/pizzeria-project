// import { utils } from "stylelint";
import {Product} from './components/Product.js';
import {Cart} from './components/Cart.js';
import {select, settings, classNames} from './settings.js';
import {Booking} from './components/Bookings.js';
import {slider} from './components/slider.js';
/* eslint-disable no-unused-vars */
/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars
const app = {

  initMenu: function(){
    const thisApp = this;
    // console.log('thisApp.data', thisApp.data);

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
        // console.log('parsedResponse', parsedResponse);

        thisApp.data.products = parsedResponse;
        thisApp.initMenu();

      });
    // console.log('thisApp.data', JSON.stringify(thisApp.data));

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

  initPages: function(){
    const thisApp = this;

    thisApp.pages = Array.from(document.querySelector(select.containerOf.pages).children);
    thisApp.navLinks = Array.from(document.querySelectorAll(select.nav.links));
    thisApp.homeLinks = Array.from(document.querySelectorAll('.nav-options a'));
    console.log(thisApp.pages, thisApp.navLinks);
    console.log(thisApp.homeLinks);

    let pagesMatchingHash = [];
    if(window.location.hash.length > 2){
      const idFromHash = window.location.hash.replace(/#/, '');

      pagesMatchingHash = thisApp.pages.filter(function(page){
        return page.id == idFromHash;
      });
    }
    thisApp.activatePage(pagesMatchingHash.length ? pagesMatchingHash[0].id : thisApp.pages[0].id);

    for(let link of thisApp.homeLinks){
      link.addEventListener('click', function(event) {
        const clickedElement = this;
        event.preventDefault();
        const ID = clickedElement.getAttribute('href').replace(/#/,'');
        console.log(ID);
        thisApp.activatePage(ID);
        for(let link of thisApp.navLinks){
          link.style.display = 'flex';
        }
      });
    }


    for(let link of thisApp.navLinks){
      link.addEventListener('click', function(event) {
        const clickedElement = this;
        event.preventDefault;
        // console.log(clickedElement);
        const ID = clickedElement.getAttribute('href').replace(/#/,'');
        // console.log(ID);

        thisApp.activatePage(ID);
      });
    }
    if(window.location.hash == '#/home'){
      let buttonsToHide = document.querySelectorAll('.main-nav a');
      console.log(buttonsToHide);
      for(let button of buttonsToHide){
        button.style.display = 'none';
      }
    }


  },

  activatePage: function(pageId){
    const thisApp = this;
    for(let link of thisApp.navLinks){
      link.classList.toggle(classNames.nav.active, link.getAttribute('href') == `#${pageId}`);
    }

    for(let page of thisApp.pages){
      // console.log(page);
      page.classList.toggle(classNames.pages.active, page.getAttribute('id') == pageId);
    }

    window.location.hash = '#/' + pageId;
  },

  initBooking: function(){
    const thisApp = this;
    const reservation = document.querySelector(select.containerOf.booking);
    new Booking(reservation);
  },

  init: function(){
    const thisApp = this;
    // console.log('*** App starting ***');
    // console.log('thisApp:', thisApp);
    // console.log('classNames:', classNames);
    // console.log('settings:', settings);
    // console.log('templates:', templates);

    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
    slider();

  },
};

app.init();

