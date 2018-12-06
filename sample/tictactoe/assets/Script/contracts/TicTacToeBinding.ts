// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html


export default class TicTacToeBinding{

    isEmpty:boolean = true;
    contractCode:String = '';    

    setContractCode(code){
        this.contractCode = code;
        this.isEmpty = false;
    }

    getContractInit(owner:String){
        return [
            {
                vname: 'owner',
                type: 'ByStr20',
                value: '0x' + owner.toLowerCase()
            },
        ]
    }
}
