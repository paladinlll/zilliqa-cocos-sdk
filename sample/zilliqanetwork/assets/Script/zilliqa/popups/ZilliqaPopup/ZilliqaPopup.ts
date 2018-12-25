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

import ZilliqaNetwork from '../../ZilliqaNetwork';
import ErrorPopup from '../ErrorPopup';
import AuthenticationPopup from './AuthenticationPopup';
import ContractsPopup from './ContractsPopup'

@ccclass
export default class ZilliqaPopup extends cc.Component {

    @property(cc.Node)
    offChainNode: cc.Node = null;

    @property(AuthenticationPopup)
    authenticationPopup: AuthenticationPopup = null;

    @property(cc.Node)
    onChainNode: cc.Node = null;

    @property(cc.EditBox)
    addressEditBox: cc.EditBox = null;

    @property(ContractsPopup)
    contractsPopup: ContractsPopup = null;

    @property(cc.Node)
    connectingNode: cc.Node = null;

    @property(ErrorPopup)
    errorPopup: ErrorPopup = null;

    @property(ErrorPopup)
    messagePopup: ErrorPopup = null;

    
    @property(cc.Label)
    responseText: cc.Label = null;

    @property(cc.Node)
    minimizeLayer: cc.Node = null;

    @property(cc.Node)
    maximizeLayer: cc.Node = null;

    @property(cc.Label)
    networkLabel: cc.Label = null;

    @property(cc.Label)
    balanceLabel: cc.Label = null;

    // LIFE-CYCLE CALLBACKS:

    //onLoad () {}

    start () {      
        this.offChainNode.active = true;
        this.onChainNode.active = false;        
        this.addressEditBox.string = "";
        this.authenticationPopup.node.active = false;        
        this.contractsPopup.node.active = false;
        this.connectingNode.active = false;
        this.errorPopup.node.active = false;
        this.messagePopup.node.active = false;
        
        this.onMaximize();
        var that = this;
        this.authenticationPopup.node.on('error', (msg:string) => {
            that.errorPopup.show(msg);
        });

        this.authenticationPopup.node.on('authorized', (msg:string) => {
            that.authenticationPopup.node.active = false;
            that.onChainNode.active = true;            
            that.restoreAddressEditBox();
            that.getBalance();
        });
        
        this.contractsPopup.node.on('hide', () => {
            that.contractsPopup.node.active = false;
            that.onChainNode.active = true;
        });

        this.contractsPopup.node.on('showPopup', (msg:string) => {
            that.showPopup(msg);
        });

        this.contractsPopup.node.on('getContractInit', this.getContractInit, this);
        this.contractsPopup.node.on('getContractState', this.getContractState, this);
        this.contractsPopup.node.on('getContractCode', this.getContractCode, this);        
    }

    restoreAddressEditBox(){
        this.addressEditBox.string = ZilliqaNetwork.getInstance().getUserAddress();
    }

    updateBalance(data){
        this.balanceLabel.string = "" + (data.balance || 0);
    }

    onMaximize(){
        this.maximizeLayer.active = true;
        this.minimizeLayer.active = false;
    }

    onMinimize(){
        this.maximizeLayer.active = false;
        this.minimizeLayer.active = true;
        this.node.emit('minimize');
    }

    handleError(err, data){        
        if (err) {
            this.errorPopup.show(err);
            this.responseText.string = err;
        } else if (data.error) {
            this.errorPopup.show(data.error.message);
            this.responseText.string = JSON.stringify(data.error);
        }
    }

    showPopup(msg:string) {
        this.messagePopup.show(msg);
    }

    onConnect(){
        var that = this;
        this.connectingNode.active = true;

        let URL = 'https://api.zilliqa.com/';
        //let URL = 'https://api-scilla.zilliqa.com';
        ZilliqaNetwork.getInstance().connect(URL, function(err, data) {
            if (err || data.error) {                         
                that.handleError(err, data);
            } else {
                that.offChainNode.active = false;
                that.authenticationPopup.show();
                //that.onChainNode.active = true;
                that.responseText.string = data.result;
                that.networkLabel.string = data.result;
            }
            that.connectingNode.active = false;
        });
    }

    onLogout() {
        if(ZilliqaNetwork.getInstance().wasAuthenticated()){
            ZilliqaNetwork.getInstance().logOut();
            this.addressEditBox.string = '';
            this.onChainNode.active = false;            
            this.authenticationPopup.show();            
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
                that.updateBalance(data.result);
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
                that.getBalance();
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
                that.contractsPopup.show(data.result);
            }
            that.connectingNode.active = false;
        });
    }

    deployHelloWorld(){      
        var that = this;
        this.connectingNode.active = true;
        var url = cc.url.raw('resources/HelloWorld.scilla');
        cc.loader.load(url, function(err, code){
            if(err){                    
                that.handleError('Code not found!', {});
                that.connectingNode.active = false;
                return;                
            }
            const init = [
                {
                    vname: 'owner',
                    type: 'ByStr20',
                    value: '0x' + ZilliqaNetwork.getInstance().getUserAddress().toLowerCase()
                },
            ];

            ZilliqaNetwork.getInstance().deployContract(code, init, function(err, hello) {
                if (err) {                
                    that.handleError(err, {});
                    that.connectingNode.active = false;
                } else {
                    that.responseText.string = 'Deployed to ' + hello.address + '. Calling setHello';
                    that.connectingNode.active = false;
                }      
                that.getBalance();      
            });
        });
    }

    
    getContractInit(contractAddress: string) {        
        this.connectingNode.active = true;
        var that = this;
        ZilliqaNetwork.getInstance().getSmartContractInit(contractAddress, function(err, data) {
            if (err || data.error) {                
                that.handleError(err, data);
            } else {                            
                that.showPopup(JSON.stringify(data.result));
            }
            that.connectingNode.active = false; 
        });
    }

    getContractState(contractAddress: string) {
        this.connectingNode.active = true;
        var that = this;
        ZilliqaNetwork.getInstance().getSmartContractState(contractAddress, function(err, data) {
            if (err || data.error) {                
                that.handleError(err, data);
            } else {                            
                that.showPopup(JSON.stringify(data.result));
            }
            that.connectingNode.active = false;             
        });
    }

    getContractCode(contractAddress: string) {
        this.connectingNode.active = true;
        var that = this;

        ZilliqaNetwork.getInstance().getSmartContractCode(contractAddress, function(err, data) {
            if (err || data.error) {                
                that.handleError(err, data);
            } else {                            
                that.showPopup(data.result.code);                
            }
            that.connectingNode.active = false; 
        });
    }
    // update (dt) {}
}
