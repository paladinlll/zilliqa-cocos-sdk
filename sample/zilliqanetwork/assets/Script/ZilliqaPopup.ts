// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

import ZilliqaNetwork from './ZilliqaNetwork';

@ccclass
export default class ZilliqaPopup extends cc.Component {

    @property(cc.Node)
    offChainNode: cc.Node = null;

    @property(cc.Node)
    onChainNode: cc.Node = null;

    @property(cc.Node)
    connectingNode: cc.Node = null;

    @property(cc.Label)
    responseText: cc.Label = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.offChainNode.active = true;
        this.onChainNode.active = false;
        this.connectingNode.active = false;
    }

    onConnect(){
        var that = this;
        this.connectingNode.active = true;
        ZilliqaNetwork.getInstance().connect(function(err, data) {
            if (err) {
                console.log(err)
            } else {
                that.offChainNode.active = false;
                that.onChainNode.active = true;

                that.responseText.string = data.result;
            }
            that.connectingNode.active = false;
        });
    }

    getBalance(){
        var that = this;
        this.connectingNode.active = true;
        ZilliqaNetwork.getInstance().getBalance(function(err, data) {
            if (err) {
                that.responseText.string = JSON.stringify(err);
            } else if (data.error) {
                that.responseText.string = JSON.stringify(data.error);
            } else {                
                that.responseText.string = JSON.stringify(data.result);
            }
            that.connectingNode.active = false;
        });
    }

    getNetworkId(){
        var that = this;
        this.connectingNode.active = true;
        ZilliqaNetwork.getInstance().getNetworkId(function(err, data) {
            if (err) {
                console.log(err)
            } else {               
                that.responseText.string = data.result;
            }
            that.connectingNode.active = false;
        });
    }


    // update (dt) {}
}
