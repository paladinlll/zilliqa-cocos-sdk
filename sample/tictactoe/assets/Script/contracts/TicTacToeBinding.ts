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
    ZilliqaNetwork    
} from '..';

import {BN, Long, ScillaDataParser} from '../zilliqa/zilliqa.cocos'
export default class TicTacToeBinding{
    address: string = '';
    bindContract = null; 
    contractInit = null;
    contractState = null;

    getContractInit(owner:string, checksum:string){
        return [
            {
                vname: 'owner',
                type: 'ByStr20',
                value: '0x' + owner.toLowerCase()
            },{
                vname: 'checksum',
                type: 'String',
                value: checksum
            }
        ]
    }

    bindFromAddress(addr:string, cb: any){
        this.address = addr
        this.contractInit = null;
        this.contractState = null;
        var contract = ZilliqaNetwork.getInstance().loadContractFromAddress(addr);

        var that = this;
        this.fetchInit(contract, (err, data) => {
            if(err){
                cb(err, null);
            } else{                
                that.bindContract = contract;
                that.contractInit = data;
                cb(null, data);
            }
        });
    }

    bindFromContract(contract, cb: any){
        this.address = contract.address;        
        this.contractInit = null;
        this.contractState = null;

        var that = this;
        this.fetchInit(contract, (err, data) => {
            if(err){
                cb(err, null);
            } else{                
                that.bindContract = contract;
                that.contractInit = data;
                cb(null, data);
            }
        });
    }

    fetchInit(contract, cb: any){       
        var that = this;
        ZilliqaNetwork.getInstance().getSmartContractInit(contract.address, function(err, data) {
            if (err) {
                cb(err, null);
            } else if (data.error) {
                cb(data.error, null);
            } else if (data.result.Error) {
                cb(data.result.Error, null);
            } else {                                
                var stateInit = ScillaDataParser.convertToSimpleJson(data.result);            
                that.contractInit = stateInit;
                cb(null, stateInit);
            }            
        });
    }
    
    fetchState(cb: any){
        this.contractState = null;
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
                var stateData = ScillaDataParser.convertToSimpleJson(data.result);                
                that.contractState = stateData;
                cb(null, stateData);
            }            
        });
    }

    isMyContract(userAddress:string){
        if(this.contractInit == null){
            return false;
        }
        if(this.contractInit.owner.replace('0x', '').toLowerCase() == userAddress.toLowerCase()){
            return true;
        }
        return false;
    }

    callJoin(cb: any){
        if(this.bindContract == null) return cb('null contract', null);
        console.log('callJoin');
        this.bindContract.call('join', [{
            vname: 'mess',
            type: 'String',
            value: 'Hello There',            
        }], new BN(0), Long.fromNumber(5000), new BN(100)
        ).then((_) => {
            cb(null, 'Done');
        }).catch((err) => {                                                  
            cb(err, null);
        });
    }

    callAnswerChallenge(b:boolean, cb: any){
        if(this.bindContract == null) return cb('null contract', null);
        console.log('callAnswerChallenge');

        // {
        //     "vname": "b", 
        //     "type": "Bool",
        //     "value": {
        //         "argtypes": [],
        //         "arguments": [],
        //         "constructor": b ? "True" : "False"
        //     }            
        // }
        this.bindContract.call('answerChallenge', ScillaDataParser.convertToScillaDataList([{
            "vname": "b", 
            "type": "Bool",
            "value": b
        }]), new BN(0), Long.fromNumber(5000), new BN(100))
        .then((_) => {
            cb(null, 'Done');
        }).catch((err) => {                                                  
            cb(err, null);
        });
    }

    callChangeOpenStatus(b:boolean, cb: any){
        if(this.bindContract == null) return cb('null contract', null);
        console.log('callChangeOpenStatus to ', b);
        this.bindContract.call('changeOpenStatus', ScillaDataParser.convertToScillaDataList([{
            "vname": "b", 
            "type": "Bool",
            "value": b
        }]), {
            // amount, gasPrice and gasLimit must be explicitly provided
            amount: new BN(0),
            gasPrice: new BN(100),
            gasLimit: Long.fromNumber(2500),
        }).then((_) => {
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
