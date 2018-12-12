// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
//import ZilliqaNetwork from '../ZilliqaNetwork';
import { 
    ZilliqaNetwork,     
    ZilliqaParser
} from '..';

import {BN, Long} from '../zilliqa-sdk/zilliqa.cocos'
export default class TicTacToeBinding{

    //isEmpty:boolean = true;
    //contractCode:String = '';
    address: string = '';
    bindContract = null; 
    contractState = null;

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

    bindFromAddress(addr:string){
        this.address = addr;
        this.bindContract = ZilliqaNetwork.getInstance().loadContractFromAddress(addr);
        this.contractState = null;        
    }

    bindFromContract(contract){
        this.bindContract = contract;        
    }
    
    fetchState(cb: any){
        if(this.bindContract == null) return cb('null contract', null);

        var that = this;
        ZilliqaNetwork.getInstance().getSmartContractState(this.address, function(err, data) {
            if (err) {
                cb(err, null);
            } else if (data.error) {
                cb(data.error, null);
            } else if (data.result.Error) {
                cb(data.result.Error, null);
            } else {                                
                var stateData = ZilliqaParser.convertToSimpleJson(data.result);            
                that.contractState = stateData;
                cb(null, stateData);
            }            
        });
    }

    callJoin(cb: any){
        if(this.bindContract == null) return cb('null contract', null);
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

    callAcceptChallenge(cb: any){
        if(this.bindContract == null) return cb('null contract', null);
        console.log('callAcceptChallenge');
        this.bindContract.call('acceptChallenge', []).then((_) => {
            cb(null, 'Done');
        }).catch((err) => {                                                  
            cb(err, null);
        });
    }

    callChangeOpenStatus(b:boolean, cb: any){
        if(this.bindContract == null) return cb('null contract', null);
        console.log('callChangeOpenStatus to ', b);
        this.bindContract.call('changeOpenStatus', [{
            "vname": "b", 
            "type": "Bool",
            "value": {
                "argtypes": [],
                "arguments": [],
                "constructor": b ? "True" : "False"
            }            
        }]).then((_) => {
            cb(null, 'Done');
        }).catch((err) => {                                                  
            cb(err, null);
        });
    }

    callMove(slot:number, cb: any){
        if(this.bindContract == null) return cb('null contract', null);
        console.log('callMove');
        this.bindContract.call('move', [{
            "vname": "slot", 
            "type": "Uint32",
            "value": slot.toString()
        }], new BN(0), Long.fromNumber(5000), new BN(100)
        ).then((_) => {
            cb(null, 'Done');
        }).catch((err) => {                                                  
            cb(err, null);
        });
    }
}
