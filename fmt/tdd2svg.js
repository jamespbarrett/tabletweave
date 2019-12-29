#!/usr/bin/env node

/* Set up a fake DOM to make it seem that we are loaded in a browser */
var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`).window;

console.log(window.document.querySelector("p").textContent);

