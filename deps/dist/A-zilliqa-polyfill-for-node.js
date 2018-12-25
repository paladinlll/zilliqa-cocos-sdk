//*****IMPORTANT*********make sure this file must be load first!

//import googleProtobuf from './google-protobuf'


"use strict";

(function() {
	
    if ('undefined' == typeof global.crypto) {		
        global.crypto = {};
        global.crypto.getRandomValues = function(arr) {
            for (var i = 0; i < arr.length; i++) {
                                  
                arr[i] = Math.round(Math.random() * 255);
            }			
            return arr;
        }
    }	
	console.log('XMLHttpRequest', global.XMLHttpRequest);
	if (!global.XMLHttpRequest) {
		global.XMLHttpRequest = require('./XMLHttpRequest').XMLHttpRequest;
	}
})();


