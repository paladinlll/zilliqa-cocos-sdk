// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
//var Zilliqa = require("./zilliqa-sdk/zilliqa")
//import Zilliqa from './zilliqa-sdk/zilliqa';
//var _zilliqa = require('./zilliqa-sdk/zilliqa');
//import {Zilliqa} from './zilliqa-sdk/zilliqa.server';
//let {Zilliqa} = require('zilliqa.server')['zilliqa.js'];
cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
		logText: {
			default: null,
			type: cc.Label
		}
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {     
    },
    
    signIn() {

        if(Zilliqa == undefined){
            console.log('Zilliqa is undefined!');
			this.logText.string = 'Zilliqa is undefined!';
        } else{
            //greet();
            let URL = 'https://dev-test-api.aws.z7a.xyz'
            let zilliqa = new Zilliqa({
                nodeUrl: URL
            });

            let node = zilliqa.getNode();

            let privateKey = zilliqa.util.generatePrivateKey();
            let address = zilliqa.util.getAddressFromPrivateKey(privateKey);
            
            node.getBalance({ address: '8DF0010571B2142329E13D80D530407E298FDE8E' }, (err, data) => {
                if (err || data.error) {
                    console.log('error', JSON.stringify(err))
					this.logText.string = JSON.stringify(err);
                } else {
                    console.log(data.result)
					this.logText.string = JSON.stringify(data.result);
                }
            });
        }        
    },

    // update (dt) {},
});
