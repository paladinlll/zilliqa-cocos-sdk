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
    GameProfile
} from '../..';
@ccclass
export default class TictactoeStatePopup extends cc.Component {

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

    // LIFE-CYCLE CALLBACKS:
    show(address:string){
        this.node.active = true;
        this.addressText = address;
        this.addressEditBox.string = this.addressText;
        this.getContractState(this.addressText);

        var activeTicTacToeAddress = GameProfile.getInstance().getActiveTicTacToeAddress();
        if(activeTicTacToeAddress == this.addressText){
            this.joinOrAcceptLabel.string = "Accept";
            this.titleLabel.string = "Hosting";            
        } else{
            this.joinOrAcceptLabel.string = "Join";
            this.titleLabel.string = "Challenge";
        }
    }

    hide(){
        this.node.active = false;
    }

    restoreAddressEditBox(){
        this.addressEditBox.string = this.addressText;
    }

    getContractState(contractAddress: string) {        
        var that = this;
        ZilliqaNetwork.getInstance().getSmartContractState(contractAddress, function(err, data) {
            if (err || data.error) {                                
            } else {                            
                that.stateLabel.string = JSON.stringify(data.result, null, 2);
            }
        });
    }
    // onLoad () {}

    start () {

    }

    // update (dt) {}
}
