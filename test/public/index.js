
"use strict";
var runtest;
var logsuccess = false;
var NOM =  require('nested-object-model');
var uuid = require('node-uuid');
var JOQULAR = require('./javascripts/joqular.js');
NOM.Event.trace(0);

var db = JOQULAR.db("Test", {storage:new JOQULAR.Storage(undefined,new JOQULAR.Server(window.location.origin + '/joqular'))});
var test = require("./unit-tests.js");
test(runtest,logsuccess,db);



