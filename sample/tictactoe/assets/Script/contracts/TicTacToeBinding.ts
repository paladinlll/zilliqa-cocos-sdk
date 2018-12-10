// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
import ZilliqaNetwork from '../ZilliqaNetwork';

export default class TicTacToeBinding{

    //isEmpty:boolean = true;
    //contractCode:String = '';
    address: String = '';
    bindContract = null; 

    // setContractCode(code){
    //     this.contractCode = code;
    //     this.isEmpty = false;
    // }

    getContractInit(owner:string){
        return [
            {
                vname: 'owner',
                type: 'ByStr20',
                value: '0x' + owner.toLowerCase()
            },
        ]
    }

    bindFromAddress(address:string){
        this.bindContract = ZilliqaNetwork.getInstance().loadContractFromAddress(address);
        //const contract = that.zilliqaClient.contracts.new(code, init);
    }

    bindFromContract(contract){
        this.bindContract = contract;
        //const contract = that.zilliqaClient.contracts.new(code, init);
    }
    

    callJoin(cb: any){
        if(this.bindContract == null) return;
        console.log('callJoin');
        this.bindContract.call('join', [
            {
                vname: 'mess',
                type: 'String',
                value: 'Hello There',
            }
        ]).then((_) => {
            cb(null, 'Done');
        }).catch((err) => {                                                  
            cb(err, null);
        });
    }
}
