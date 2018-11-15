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
import ErrorPopup from './ErrorPopup';
import AuthenticationPopup from './AuthenticationPopup';


@ccclass
export default class ZilliqaPopup extends cc.Component {

    @property(cc.Node)
    offChainNode: cc.Node = null;

    @property(AuthenticationPopup)
    authenticationPopup: AuthenticationPopup = null;

    @property(cc.Node)
    onChainNode: cc.Node = null;

    @property(cc.Node)
    connectingNode: cc.Node = null;

    @property(ErrorPopup)
    errorPopup: ErrorPopup = null;

    
    @property(cc.Label)
    responseText: cc.Label = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.offChainNode.active = true;
        this.authenticationPopup.node.active = false;
        this.onChainNode.active = false;
        this.connectingNode.active = false;
        this.errorPopup.node.active = false;

        var that = this;
        this.authenticationPopup.node.on('error', (msg:string) => {
            that.errorPopup.show(msg);
        });

        this.authenticationPopup.node.on('authorized', (msg:string) => {
            that.authenticationPopup.node.active = false;
            that.onChainNode.active = true;
        });
        
    }

    handleError(err, data){        
        if (err) {
            this.errorPopup.show(err);
            this.responseText.string = err;
        } else if (data.error) {
            this.errorPopup.show(data.error);
            this.responseText.string = data.error;
        }
    }

    onConnect(){
        var that = this;
        this.connectingNode.active = true;
        ZilliqaNetwork.getInstance().connect(function(err, data) {
            if (err || data.error) {                         
                that.handleError(err, data);
            } else {
                that.offChainNode.active = false;
                that.authenticationPopup.show();
                //that.onChainNode.active = true;
                that.responseText.string = data.result;
            }
            that.connectingNode.active = false;
        });
    }

    onLogout() {
        if(ZilliqaNetwork.getInstance().wasAuthenticated()){
            ZilliqaNetwork.getInstance().logOut();
            this.authenticationPopup.show();
            this.onChainNode.active = false;
        }
    }

    getBalance(){
        var that = this;
        this.connectingNode.active = true;
        ZilliqaNetwork.getInstance().getBalance('', function(err, data) {
            if (err || data.error) {                
                that.handleError(err, data);
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
            if (err || data.error) {                
                that.handleError(err, data);
            } else {            
                that.responseText.string = JSON.stringify(data.result);
            }
            that.connectingNode.active = false;
        });
    }

    sendFaucetRequest() {
        var that = this;
        this.connectingNode.active = true;
        ZilliqaNetwork.getInstance().sendFaucetRequest(function(err) {
            if (err) {                
                that.handleError(err, {});
            } else {            
                that.responseText.string = 'Done';
            }
            that.connectingNode.active = false;
        });
    }

    getSmartContracts(){
        var that = this;
        this.connectingNode.active = true;
        ZilliqaNetwork.getInstance().getSmartContracts(function(err, data) {
            if (err || data.error) {                
                that.handleError(err, data);
            } else {               
                that.responseText.string = JSON.stringify(data.result);
            }
            that.connectingNode.active = false;
        });
    }

    deployHelloWorld(){
        var that = this;
        this.connectingNode.active = true;
        ZilliqaNetwork.getInstance().deployHelloWorld(function(err) {
            if (err) {                
                that.handleError(err, {});
            } else {            
                that.responseText.string = 'Done';
            }
            that.connectingNode.active = false;
        });
    }

    getSmartContractState(){
        var that = this;
        this.connectingNode.active = true;
        ZilliqaNetwork.getInstance().getSmartContractState('83c425e960d54b0ae393c0395703c4489cda2e97', function(err, data) {
            if (err || data.error) {                
                that.handleError(err, data);
            } else {               
                that.responseText.string = JSON.stringify(data.result);
            }
            that.connectingNode.active = false;
        });
    }

    getSmartContractCode(){
        var that = this;
        this.connectingNode.active = true;
        ZilliqaNetwork.getInstance().getSmartContractCode('83c425e960d54b0ae393c0395703c4489cda2e97', function(err, data) {
            if (err || data.error) {                
                that.handleError(err, data);
            } else {               
                that.responseText.string = JSON.stringify(data.result);
            }
            that.connectingNode.active = false;
        });
    }

    getSmartContractInit(){
        var that = this;
        this.connectingNode.active = true;
        ZilliqaNetwork.getInstance().getSmartContractInit('83c425e960d54b0ae393c0395703c4489cda2e97', function(err, data) {
            if (err || data.error) {                
                that.handleError(err, data);
            } else {               
                that.responseText.string = JSON.stringify(data.result);
            }
            that.connectingNode.active = false;
        });
    }


    // update (dt) {}
}
