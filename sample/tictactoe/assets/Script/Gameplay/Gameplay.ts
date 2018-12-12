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
    TicTacToeBinding
} from '..';

import CellState from './CellState'
import ErrorPopup from '../popups/ErrorPopup';
@ccclass
export default class Gameplay extends cc.Component {
    @property(cc.Label)
    statusLabel: cc.Label = null;

    @property(cc.Node)
    connectingNode: cc.Node = null;

    @property(ErrorPopup)
    errorPopup: ErrorPopup = null;

    @property(cc.EditBox)
    addressEditBox: cc.EditBox = null;

    @property(cc.Node)
    cellEntryHolder: cc.Node = null;

    @property([CellState])
    cellEntries: CellState[] = [];

    // LIFE-CYCLE CALLBACKS:
    onQuit(){
        cc.director.loadScene('main');
    }
    onLoad () {
        if(!ZilliqaNetwork.getInstance().wasAuthenticated()){
            cc.director.loadScene('main');
            return;
        }

        this.connectingNode.active = false;
        this.addressEditBox.string = GameProfile.getInstance().activeTicTacToeBinding.address;

        let sampleCell = this.cellEntries[0].node;
        var that = this;

        for (var i=0;i<9;i++) {
            var entry = null;
            if(i < this.cellEntries.length){
                entry = this.cellEntries[i];
            } else{
                let acc = cc.instantiate(sampleCell);                
                this.cellEntryHolder.addChild(acc);  
                entry = acc.getComponent(CellState);
                this.cellEntries.push(entry);
            }                     
        }

        this.cellEntryHolder.on(cc.Node.EventType.TOUCH_START, function (evt) {
            var pos = that.cellEntryHolder.convertToNodeSpace(evt.getLocation());
            let slot = ( 2 - Math.floor(pos.y / 80)) * 3 + Math.floor(pos.x / 80);
            if(slot >= 0 && slot <= 8){
                that.onCellFocused(slot);
            }
        });
        this.cellEntryHolder.on(cc.Node.EventType.TOUCH_MOVE , function (evt) {	
            var pos = that.cellEntryHolder.convertToNodeSpace(evt.getLocation());
            let slot = ( 2 - Math.floor(pos.y / 80)) * 3 + Math.floor(pos.x / 80);
            if(slot >= 0 && slot <= 8){
                that.onCellFocused(slot);
            }
        }); 
        this.cellEntryHolder.on(cc.Node.EventType.TOUCH_END, function (evt) {				
            var pos = that.cellEntryHolder.convertToNodeSpace(evt.getLocation());
            let slot = ( 2 - Math.floor(pos.y / 80)) * 3 + Math.floor(pos.x / 80);
            if(slot >= 0 && slot <= 8){
                that.onCellPressed(slot);
            }
        });

        this.refresh();
    }

    refresh(){
        var stateData = GameProfile.getInstance().activeTicTacToeBinding.contractState;

        for (var i=0;i<9;i++) {
            var cellType = stateData.board[i.toString()];
            this.cellEntries[i].setInfo(cellType);
        }

        if(stateData.winner_code == 0){
            if(this.isMyTurn()){
                this.statusLabel.string = "Your Turn";
            } else{
                this.statusLabel.string = "Opponent Turn";
            }
            
        } else if(stateData.winner_code == 3){
            this.statusLabel.string = "Draw";
        } else if(this.isMyTurn()){
            this.statusLabel.string = "Your Lose";
        } else{
            this.statusLabel.string = "Your Win";
        }
    }

    isMyTurn(){
        var stateData = GameProfile.getInstance().activeTicTacToeBinding.contractState;
      
        if(this.isHosting()){
            return (stateData.turn % 2) == 0;
        } else{
            return (stateData.turn % 2) == 1;
        }
    }

    isHosting(){
        var stateData = GameProfile.getInstance().activeTicTacToeBinding.contractState;
        var userAddress = ZilliqaNetwork.getInstance().getUserAddress();
        if(stateData.challenger.replace('0x', '').toLowerCase() == userAddress.toLowerCase()){
            return false;
        }
        return true;
    }

    restoreAddressEditBox(){
        this.addressEditBox.string = GameProfile.getInstance().activeTicTacToeBinding.address;
    }

    onCellFocused(cellId:number){
        console.log('onCellFocused', cellId);
        var stateData = GameProfile.getInstance().activeTicTacToeBinding.contractState;
        

        for (var i=0;i<9;i++) {
            var cellType = stateData.board[i.toString()];
            if(cellType == 0){
                if(cellId == i){
                    var nextType = 1 + (stateData.turn % 2);
                    this.cellEntries[i].setHighlight(nextType);
                } else{
                    this.cellEntries[i].setHighlight(0);
                }
                
            }            
        }
    }

    onCellPressed(cellId:number){                      
        var stateData = GameProfile.getInstance().activeTicTacToeBinding.contractState;
        if(stateData.board[cellId.toString()] != 0){            
            return;
        }        

        for (var i=0;i<9;i++) {
            var cellType = stateData.board[i.toString()];
            if(cellType == 0){
                this.cellEntries[i].setHighlight(0);                
            }            
        }
        if(stateData.winner_code != 0){
            return false;
        }
        if(!this.isMyTurn()){
            return;
        } 
        var nextType = 1 + (stateData.turn % 2);
        this.cellEntries[cellId].setInfo(nextType);

        var binding = GameProfile.getInstance().activeTicTacToeBinding;
        
        if(binding == null) return;
        var that = this;
        this.connectingNode.active = true;
        binding.callMove(cellId, function(err, data) {
            that.connectingNode.active = false;
            if (err) {
                that.handleError(err);
                that.refresh();
            } else if (data.error) {
                that.handleError(data.error);
                that.refresh();
            } else {                
                that.getContractState();
            }            
        })
    }

    getContractState() {        
        var that = this;
        var binding = GameProfile.getInstance().activeTicTacToeBinding;        
        if(binding == null) return;
        this.connectingNode.active = true;
        binding.fetchState(function(_, data) {
            that.refresh();
            that.connectingNode.active = false;
        })
    }

    handleError(err){                        
        this.errorPopup.show(err);
    }

    start () {
        this.errorPopup.node.active = false;
    }

    // update (dt) {}
}
