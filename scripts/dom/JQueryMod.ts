import $ from "jquery";
import { observeAttribute, observeAttributeBySelector, observeBorderBox, observeBySelector, observeContentBox } from "./Observer.ts";

//
$.fn.observeAttr = function (attributes, callback) {
    this.each((el)=>{
        observeAttribute(el, attributes, callback);
    });
}

//
$.fn.observeSelector = function (selector, callback) {
    this.each((el)=>{
        observeBySelector(el, selector, callback);
    });
}

//
$.fn.observeBorderBox = function (callback) {
    this.each((el)=>{
        observeBorderBox(el, callback);
    });
}

//
$.fn.observeContentBox = function (callback) {
    this.each((el)=>{
        observeContentBox(el, callback);
    });
}

//
$.fn.observeAttrBySelector = function (selector, attributes, callback) {
    this.each((el)=>{
        observeAttributeBySelector(el, selector, attributes, callback);
    });
}
