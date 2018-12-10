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
    GameProfile,
    TicTacToeBinding
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
        
        if(this.isHosting()){
            this.joinOrAcceptLabel.string = "Accept";
            this.titleLabel.string = "Hosting";            
        } else{
            this.joinOrAcceptLabel.string = "Join";
            this.titleLabel.string = "Challenge";
        }
    }

    isHosting(){
        ///Todo: need to check import seft contract.
        var activeTicTacToeAddress = GameProfile.getInstance().getActiveTicTacToeAddress();
        return (activeTicTacToeAddress == this.addressText)
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
                var binding = new TicTacToeBinding();
                GameProfile.getInstance().activeTicTacToeBinding = binding;                
                binding.bindFromAddress(contractAddress);
            }
        });
    }

    onJoin(){
        console.log('onJoin', this.isHosting());
        if(this.isHosting()) return;
        var binding = GameProfile.getInstance().activeTicTacToeBinding;
        
        if(binding == null) return;
        var that = this;
        binding.callJoin(function(err, data) {
            if (err) {                
                console.log(err);
            } else {
                console.log(data);
            }  
        })
    }

    onDelete(){
        if(this.isHosting()) return;
    }

    onAccept(){
        if(!this.isHosting()) return;
    }

    onChangeState(){
        if(!this.isHosting()) return;
    }
    // onLoad () {}

    start () {

    }

    // update (dt) {}
}
