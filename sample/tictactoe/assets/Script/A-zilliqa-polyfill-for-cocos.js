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
	
	/*if (!window.Long) {
		window.Long = require('./Long')
	}*/
	
	//if (!window.XMLHttpRequest) {
	//	window.XMLHttpRequest = require('./XMLHttpRequest').XMLHttpRequest
	//}
	
    //window['google-protobuf'] = googleProtobuf;
})();


/*
const crypto = {}
crypto.randomBytes = function(n) {
    var arr = new Uint8Array(n);
    for (var i = 0; i < arr.length; i++) {
        arr[i] = Math.round(cc.random0To1() * 255);
    }

    return v;
}
*/


