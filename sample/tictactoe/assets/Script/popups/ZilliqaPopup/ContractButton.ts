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
    GameProfile
} from './index';

@ccclass
export default class ContractButton extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    contractAddress: string = '';

    @property(cc.Label)
    activeStatusLabel: cc.Label = null;

    // LIFE-CYCLE CALLBACKS:
    setInfo(address:string){
        this.contractAddress = address;        
        this.label.string = address;
        this.refresh();
    }

    getInit() {
        console.log('getInit a');
        this.node.emit('getInit', this.contractAddress);
    }

    getState() {
        this.node.emit('getState', this.contractAddress);
    }

    getCode() {
        this.node.emit('getCode', this.contractAddress);
    }

    verify() {
        this.node.emit('verify', this.contractAddress);
    }

    refresh(){
        if(this.contractAddress == GameProfile.getInstance().activeTicTacToeAddress){
            this.activeStatusLabel.string = 'Activating';    
            this.activeStatusLabel.node.color = new cc.Color(255, 0, 0);
        } else {
            this.activeStatusLabel.string = 'Verify & \nActive\nTictactoe';    
            this.activeStatusLabel.node.color = new cc.Color(0, 0, 0);
        }        
    }

    // onLoad () {}

    start () {

    }

    // update (dt) {}
}
