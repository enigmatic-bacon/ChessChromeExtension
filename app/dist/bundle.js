/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./app/src/main.js":
/*!*************************!*\
  !*** ./app/src/main.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _chess_index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./chess/index */ \"./app/src/chess/index.ts\");\n\n    \n\n\nconst king = document.getElementsByClassName('wk')[0]\n\nconst piece = new _chess_index__WEBPACK_IMPORTED_MODULE_0__.Piece(king);\n\nconsole.log(piece);\n\n//# sourceURL=webpack://chessextension/./app/src/main.js?");

/***/ }),

/***/ "./app/src/chess/index.ts":
/*!********************************!*\
  !*** ./app/src/chess/index.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   Coordinate: () => (/* binding */ Coordinate),\n/* harmony export */   Move: () => (/* binding */ Move),\n/* harmony export */   Piece: () => (/* binding */ Piece)\n/* harmony export */ });\n/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ \"./app/src/chess/utils.ts\");\n\nvar Coordinate = /** @class */ (function () {\n    function Coordinate(rank, file) {\n        this.rank = rank;\n        this.file = file;\n    }\n    Coordinate.prototype.toString = function () {\n        return \"\".concat(String.fromCharCode(this.file + 97)).concat(this.rank + 1);\n    };\n    return Coordinate;\n}());\n\nvar Move = /** @class */ (function () {\n    function Move(from, to) {\n        this.from = from;\n        this.to = to;\n    }\n    return Move;\n}());\n\nvar Piece = /** @class */ (function () {\n    function Piece(element) {\n        var _this = this;\n        element.classList.forEach(function (className) {\n            if (className.startsWith('piece')) {\n                return;\n            }\n            if (className.startsWith('square')) {\n                var pos_info = className.split('-')[1];\n                var file = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.file_to_index)(pos_info.slice(0, 1));\n                var rank = parseInt(pos_info.slice(1)) - 1;\n                _this.location = new Coordinate(rank, file);\n                return;\n            }\n            _this.type = className.slice(1).toLowerCase();\n            _this.color = className.slice(0, 1);\n        });\n    }\n    Piece.prototype.toString = function () {\n        return \"\".concat(this.color).concat(this.type, \" \").concat(this.location.toString());\n    };\n    return Piece;\n}());\n\n\n\n//# sourceURL=webpack://chessextension/./app/src/chess/index.ts?");

/***/ }),

/***/ "./app/src/chess/utils.ts":
/*!********************************!*\
  !*** ./app/src/chess/utils.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   file_to_index: () => (/* binding */ file_to_index)\n/* harmony export */ });\nvar file_to_index = function (file) {\n    return file.charCodeAt(0) - 97;\n};\n\n\n//# sourceURL=webpack://chessextension/./app/src/chess/utils.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./app/src/main.js");
/******/ 	
/******/ })()
;