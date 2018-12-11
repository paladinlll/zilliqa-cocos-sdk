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
export default class CellState extends cc.Component {

    @property(cc.Node)
    crossNode: cc.Node = null;

    @property(cc.Node)
    circleNode: cc.Node = null;

    // LIFE-CYCLE CALLBACKS:
    setInfo(cellType:number){
        this.crossNode.active = false;
        this.circleNode.active = false;
        if(cellType == 1){
            this.crossNode.active = true;
            this.crossNode.opacity = 255;
        } else if(cellType == 2){
            this.circleNode.active = true;
            this.circleNode.opacity = 255;
        }
    }

    setHighlight(cellType:number){
        this.crossNode.active = false;
        this.circleNode.active = false;
        if(cellType == 1){
            this.crossNode.active = true;
            this.crossNode.opacity = 150;
        } else if(cellType == 2){
            this.circleNode.active = true;
            this.circleNode.opacity = 150;
        }
    }
    // onLoad () {}

    start () {

    }

    // update (dt) {}
}
