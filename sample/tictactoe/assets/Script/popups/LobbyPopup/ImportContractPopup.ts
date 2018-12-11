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
} from '../..';
@ccclass
export default class ImportContractPopup extends cc.Component {

    @property(cc.EditBox)
    tagEditBox: cc.EditBox = null;

    @property(cc.EditBox)
    addressEditBox: cc.EditBox = null;

    // LIFE-CYCLE CALLBACKS:
    show(){
        this.node.active = true;           
    }

    hide(){
        this.node.active = false;
    }

    onDone(){
        if(this.tagEditBox.string.length == 0){
            this.node.emit('error', 'Tag was empty!');
            return;
        }

        if(this.addressEditBox.string.length == 0){
            this.node.emit('error', 'Address was empty!');
            return;
        }

        var that = this;
        if(GameProfile.getInstance().addchallengedAddresses(this.tagEditBox.string, this.addressEditBox.string)){
            that.node.emit('hide');
            this.hide();
        } else{
            this.node.emit('error', 'Address was exist!');
        }
    }
    // onLoad () {}

    start () {

    }

    // update (dt) {}
}
