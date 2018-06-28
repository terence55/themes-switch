/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__src_index__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__src_index___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__src_index__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__main_css__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__main_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__main_css__);




const themes = {"theme-dark":"static/css/theme-dark.css","theme-light":"static/css/theme-light.css"};
const buttonsContainer = document.getElementById('buttons');
let currentLink;

const title = document.createElement('div');
title.innerHTML = 'Title';
title.className = 'title';
buttonsContainer.appendChild(title);

const desc = document.createElement('div');
desc.innerHTML = 'Description';
desc.className = 'desc';
buttonsContainer.appendChild(desc);

const keys = Object.keys(themes);
keys.forEach((key) => {
  const button = document.createElement('button');
  button.innerHTML = key;
  button.onclick = () => {
    Object(__WEBPACK_IMPORTED_MODULE_0__src_index__["changeTheme"])(key, themes[key], currentLink, link => (currentLink = link));
  };
  buttonsContainer.appendChild(button);
});



/***/ }),
/* 1 */
/***/ (function(module, exports) {

function changeTheme(theme, themeUrl, currentLink, onLoad) {
  if (theme === (currentLink && currentLink.dataset.theme)) {
    return;
  }
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = themeUrl;
  link.dataset.theme = theme;
  document.head.appendChild(link);
  link.onload = () => {
    removeTheme(currentLink);
    if (onLoad) {
      onLoad(link);
    }
  };
}

function removeTheme(link) {
  if (link) {
    link.parentNode.removeChild(link);
  }
}

module.exports = {
  changeTheme,
  removeTheme
};


/***/ }),
/* 2 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ })
/******/ ]);