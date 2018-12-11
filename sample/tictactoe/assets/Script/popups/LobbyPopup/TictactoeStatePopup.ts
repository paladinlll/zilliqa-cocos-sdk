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
import { 
    ZilliqaNetwork, 
    GameProfile,
    TicTacToeBinding,    
    ZilliqaParser
} from '../..';

@ccclass
export default class TictactoeStatePopup extends cc.Component {

    @property(cc.Node)
    connectingNode: cc.Node = null;

    @property(cc.Label)
    titleLabel: cc.Label = null;

    @property(cc.EditBox)
    addressEditBox: cc.EditBox = null;

    @property
    addressText: string = '';

    @property(cc.Label)
    stateLabel: cc.Label = null;

    @property(cc.Label)
    joinOrAcceptLabel: cc.Label = null;

    @property(cc.Node)
    hostingUILayer: cc.Node = null;

    @property(cc.Button)
    hostingCloseButton: cc.Button = null;

    @property(cc.Button)
    hostingAcceptButton: cc.Button = null;

    @property(cc.Node)
    joiningUILayer: cc.Node = null;

    @property(cc.Button)
    joinningJoinButton: cc.Button = null;

    @property(cc.Button)
    joinningDeleteButton: cc.Button = null;
    

    // LIFE-CYCLE CALLBACKS:
    show(address:string){
        this.node.active = true;

        this.connectingNode.active = false;
        
        this.stateLabel.string = "";

        this.addressText = address;
        this.addressEditBox.string = this.addressText;
        this.getContractState(this.addressText);
        
        if(this.isHosting()){
            this.joinOrAcceptLabel.string = "Accept";
            this.titleLabel.string = "Hosting";            
        } else{
            this.joinOrAcceptLabel.string = "Join";
            this.titleLabel.string = "Challenge";
        }
    }

    isHosting(){
        ///Todo: need to check import seft contract.
        var activeTicTacToeAddress = GameProfile.getInstance().getActiveTicTacToeAddress();
        return (activeTicTacToeAddress == this.addressText)
    }

    hide(){
        this.node.active = false;
    }

    restoreAddressEditBox(){
        this.addressEditBox.string = this.addressText;
    }

    getContractState(contractAddress: string) {        
        var that = this;
        this.hostingUILayer.active = false;
        this.joiningUILayer.active = false;
        this.connectingNode.active = true;
        ZilliqaNetwork.getInstance().getSmartContractState(contractAddress, function(err, data) {
            if (err || data.error) {
                that.fillContractState(null)
            } else {                                
                var stateData = ZilliqaParser.convertToSimpleJson(data.result);            
                that.stateLabel.string = JSON.stringify(stateData, null, 2);
                var binding = new TicTacToeBinding();
                GameProfile.getInstance().activeTicTacToeBinding = binding;                
                binding.bindFromAddress(contractAddress);

                that.fillContractState(stateData)
            }
            that.connectingNode.active = false;
        });
    }

    fillContractState(stateData){
        var userAddress = ZilliqaNetwork.getInstance().getUserAddress();
        if(this.isHosting()){
            this.hostingUILayer.active = true;
            this.hostingAcceptButton.interactable = false;
            this.hostingCloseButton.interactable = true;
            if(stateData == null){
                this.stateLabel.string = "Contract wasn't exits";            
            } else if(!stateData.opening){
                this.handleError("You closed this game.");
            } else if(stateData.challenger != ''){
                if(stateData.accepted){
                    if(stateData.winner_code == 0){
                        this.stateLabel.string = "Playing turn " + stateData.turn.toString();;
                    } else{
                        this.stateLabel.string = "Game end with winner_code " + stateData.winner_code.toString();
                    }
                } else{
                    this.stateLabel.string = "You have a challenge from " + stateData.challenger + "\n" + stateData.welcome_msg;
                    this.hostingAcceptButton.interactable = true;
                }
            } else{
                this.stateLabel.string = "Waiting for a challenge...";
            }
        } else{
            this.joiningUILayer.active = true;
            this.joinningJoinButton.interactable = false;
            this.joinningDeleteButton.interactable = true;
            if(stateData == null){
                this.stateLabel.string = "Contract wasn't exits";            
            } else if(!stateData.opening){
                this.handleError("Disable by host.");
            } else if(stateData.challenger != ''){
                if(stateData.challenger.replace('0x', '').toLowerCase() == userAddress.toLowerCase()){
                    if(stateData.accepted){
                        if(stateData.winner_code == 0){
                            this.stateLabel.string = "Playing turn " + stateData.turn.toString();;
                        } else{
                            this.stateLabel.string = "Game end with winner_code " + stateData.winner_code.toString();
                        }
                    } else{
                        this.stateLabel.string = "Waiting for host accept your challenge";
                    }
                } else{
                    this.handleError("Host was busing");
                }
            } else{
                this.stateLabel.string = "Challenge Now!";
                this.joinningJoinButton.interactable = true;
            }
        }
    }

    handleError(err){        
        ///Todo show popup
        console.log(err);
        this.stateLabel.string = err;
    }

    onJoin(){        
        if(this.isHosting()) return;
        var binding = GameProfile.getInstance().activeTicTacToeBinding;
        
        if(binding == null) return;
        var that = this;
        this.connectingNode.active = true;
        binding.callJoin(function(err, data) {
            that.connectingNode.active = false;
            if (err) {
                that.handleError(err);                
            } else if (data.error) {
                that.handleError(data.error);
            } else {
                console.log(data);
                that.getContractState(that.addressText);
            }  
            
        })
    }

    onDelete(){
        if(this.isHosting()) return;
    }

    onAccept(){
        if(!this.isHosting()) return;
        var binding = GameProfile.getInstance().activeTicTacToeBinding;
        
        if(binding == null) return;
        var that = this;
        this.connectingNode.active = true;
        binding.callAcceptChallenge(function(err, data) {
            that.connectingNode.active = false;
            if (err) {
                that.handleError(err);                
            } else if (data.error) {
                that.handleError(data.error);
            } else {
                console.log(data);
                that.getContractState(that.addressText);
            }  
        })
    }

    onChangeState(){
        if(!this.isHosting()) return;
    }
    // onLoad () {}

    start () {

    }

    // update (dt) {}
}
