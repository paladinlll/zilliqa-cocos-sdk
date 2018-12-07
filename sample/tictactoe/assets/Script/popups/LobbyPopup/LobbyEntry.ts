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

@ccclass
export default class LobbyEntry extends cc.Component {
    @property(cc.Label)
    tagLabel: cc.Label = null;

    @property(cc.Label)
    contractAddressLabel: cc.Label = null;

    @property
    contractAddressText: string = '';

    // LIFE-CYCLE CALLBACKS:
    setInfo(tag:string, address:string){
        this.tagLabel.string = tag;
        this.contractAddressLabel.string = address;
        this.contractAddressText = address;
    }

    onJoin(){
        this.node.emit('join');
    }

    onRemove(){
        this.node.emit('remove');
    }

    // onLoad () {}

    start () {

    }

    // update (dt) {}
}
