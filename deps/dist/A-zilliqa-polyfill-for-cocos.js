//*****IMPORTANT*********make sure this file must be load first!

//import googleProtobuf from './google-protobuf'


"use strict";

(function() {
	
    if ('undefined' == typeof window.crypto) {		
        window.crypto = {};
        window.crypto.getRandomValues = function(arr) {
            for (var i = 0; i < arr.length; i++) {
                                  
                arr[i] = Math.round(Math.random() * 255);
            }			
            return arr;
        }
    }	
})();


