#!/usr/bin/env node

var jsdom = require("jsdom");
const { JSDOM } = jsdom;

const { window } = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`).window;

console.log(window.document.querySelector("p").textContent);