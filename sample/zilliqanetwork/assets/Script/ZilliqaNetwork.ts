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

//import Zilliqa from './zilliqa-sdk/zilliqa';

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    // LIFE-CYCLE CALLBACKS:

    signIn(){
        // let URL = 'https://api-scilla.zilliqa.com'
        //     let zilliqa = new Zilliqa({
        //         nodeUrl: URL
        //     });

        //     let node = zilliqa.getNode();

        //     let privateKey = zilliqa.util.generatePrivateKey();
        //     let address = zilliqa.util.getAddressFromPrivateKey(privateKey);
            
        //     node.getBalance({ address: 'E8A67C0B1F19DF61A28E8E8FB5D830377045BCC7' }, (err, data) => {
        //         if (err || data.error) {
        //             console.log('Error')
        //         } else {
        //             console.log(data.result)
        //         }
        //     });
    }

    // onLoad () {}

    start () {

    }

    // update (dt) {}
}
