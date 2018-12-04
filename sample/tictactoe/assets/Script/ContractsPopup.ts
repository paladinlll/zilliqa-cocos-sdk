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
import ContractButton from './ContractButton'

@ccclass
export default class ContractsPopup extends cc.Component {

    @property(cc.Node)
    contractHolder: cc.Node = null;

    @property([ContractButton])
    contractEntries: ContractButton[] = [];

    // LIFE-CYCLE CALLBACKS:
    show (contracts: [any]) {
        this.node.active = true;

        this.resizeContractList(contracts.length);

        var that = this;
        for(let i=0;i<contracts.length;i++){
            this.contractEntries[i].setInfo(contracts[i].address);
            this.contractEntries[i].node.targetOff(this);

            //var contractAddress = contracts[i].address;            

            this.contractEntries[i].node.on('getInit', (contractAddress) => {
                console.log('getInit b');
                that.node.emit('getContractInit', contractAddress);
            }, this);

            this.contractEntries[i].node.on('getState', (contractAddress) => {
                that.node.emit('getContractState', contractAddress);
            }, this);

            this.contractEntries[i].node.on('getCode', (contractAddress) => {
                that.node.emit('getContractCode', contractAddress);
            }, this);            
        }
    }

    hide () {
        //this.node.active = false;
        this.node.emit('hide');
    }

    resizeContractList(count: number){
        let numMiss = count - this.contractEntries.length;
        if(numMiss > 0){            
            let sampleHosting = this.contractEntries[0].node;
            for(let i=0;i<numMiss;i++){
                let contractButton = cc.instantiate(sampleHosting);                
                this.contractHolder.addChild(contractButton);  

                this.contractEntries.push(contractButton.getComponent(ContractButton));
            }
        }
        for(let i=0;i<this.contractEntries.length;i++){
            this.contractEntries[i].node.active = (i < count);
        }
    }


    // onLoad () {}

    start () {

    }

    // update (dt) {}
}
