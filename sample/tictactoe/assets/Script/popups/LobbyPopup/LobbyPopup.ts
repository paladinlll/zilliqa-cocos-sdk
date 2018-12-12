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

import TictactoeStatePopup from './TictactoeStatePopup'
import LobbyEntry from './LobbyEntry'
import ImportContractPopup from './ImportContractPopup'

import {     
    GameProfile,    
} from '../..';

@ccclass
export default class LobbyPopup extends cc.Component {

    @property(cc.Label)
    hostTitleLabel: cc.Label = null;

    @property(cc.Node)
    hostAddressNode: cc.Node = null;

    @property(cc.Label)
    hostAddressLabel: cc.Label = null;

    @property(TictactoeStatePopup)
    tictactoeStatePopup: TictactoeStatePopup = null;

    @property(ImportContractPopup)
    importContractPopup: ImportContractPopup = null;

    @property(cc.Node)
    lobbyEntryHolder: cc.Node = null;

    @property([LobbyEntry])
    lobbyEntries: LobbyEntry[] = [];
    

    // LIFE-CYCLE CALLBACKS:
    refresh(){
        var that = this;
        var activeTicTacToeAddress = GameProfile.getInstance().getActiveTicTacToeAddress();
        
        if(activeTicTacToeAddress == ''){
            this.hostAddressNode.active = false;
            this.hostTitleLabel.string = 'Host New Contract';
        } else {
            this.hostTitleLabel.string = 'Your Hosting Contract';
            this.hostAddressNode.active = true;
            this.hostAddressLabel.string = activeTicTacToeAddress;            
        }

        var challengedAddresses = GameProfile.getInstance().getChallengedAddressList();

        let sampleLobby = this.lobbyEntries[0].node;
        var size = 0, tag;
        for (tag in challengedAddresses) {
            var entry = null;
            if(size < this.lobbyEntries.length){
                entry = this.lobbyEntries[size];
            } else{
                let acc = cc.instantiate(sampleLobby);                
                this.lobbyEntryHolder.addChild(acc);  
                entry = acc.getComponent(LobbyEntry);
                this.lobbyEntries.push(entry);
            }

            entry.node.targetOff(this);
            let addr = challengedAddresses[tag];
            entry.node.on('join', () => {
                that.onSelectJoinableContract(addr);
            }, this);

            entry.setInfo(tag, addr);
            size++;
        }

        for(let i=0;i<this.lobbyEntries.length;i++){
            this.lobbyEntries[i].node.active = (i < size);
        }
    }

    onHostButtonClicked(){
        var activeTicTacToeAddress = GameProfile.getInstance().getActiveTicTacToeAddress();
        if(activeTicTacToeAddress == ''){
            this.tictactoeStatePopup.show(activeTicTacToeAddress);
        } else {
            this.tictactoeStatePopup.show(activeTicTacToeAddress);
        }
    }

    onSelectJoinableContract(address:string){
        this.tictactoeStatePopup.show(address);
    }

    onImportContractButtonClicked(){
        this.importContractPopup.show();
    }

    
    // onLoad () {}

    start () {
        this.tictactoeStatePopup.node.active = false;
        this.importContractPopup.node.active = false;
        //this.refresh();

        var that = this;
        this.tictactoeStatePopup.node.on('hide', () => {            
            that.refresh();
        });

        this.importContractPopup.node.on('hide', () => {            
            that.refresh();
        });
    }

    // update (dt) {}
}
