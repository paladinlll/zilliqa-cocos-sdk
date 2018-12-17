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
import AccountEntry from './AccountEntry';
import { 
    ZilliqaNetwork
} from '../..';

@ccclass
export default class AuthenticationPopup extends cc.Component {

    @property(cc.Button)
    tabButtons: cc.Button[] = [];

    @property(cc.Node)
    panelNodes: cc.Node[] = [];

    @property(cc.EditBox)
    newPasswordEditBox: cc.EditBox = null;

    @property(cc.EditBox)
    newRePasswordEditBox: cc.EditBox = null;

    @property(cc.EditBox)
    importPasswordEditBox: cc.EditBox = null;

    @property(cc.Label)
    addressLabel: cc.Label = null;

    @property(cc.Node)
    accountHolder: cc.Node = null;

    @property([AccountEntry])
    accountEntries: AccountEntry[] = [];

    @property(cc.Node)
    inputPasswordNode: cc.Node = null;

    // LIFE-CYCLE CALLBACKS:
    show(){
        this.node.active = true;    
        this.inputPasswordNode.active = false;
        this.fillAccounts();
        
        if(!this.accountEntries[0].node.active){
            
            this.tabButtons[1].node.active = false;
            this.onChangeTab(null, 0);
        } else{
            this.tabButtons[1].node.active = true;
            //this.addressLabel.string = ZilliqaNetwork.getInstance().getUserAddress();
            this.onChangeTab(null, 1);
        }
        
    }

    hide(){
        this.node.active = false;
    }

    onCreateAccount(){
        if(this.newPasswordEditBox.string.length == 0){
            this.node.emit('error', 'Password was empty!');
            return;
        }

        if(this.newPasswordEditBox.string != this.newRePasswordEditBox.string){
            this.node.emit('error', 'Password not matched!');
            return;
        }

        var that = this;
        ZilliqaNetwork.getInstance().generateNewAccount(this.newPasswordEditBox.string, function(err, data) {
            if (err || data.error) {
                that.node.emit('error', err || data.error);
            } else {                
                that.node.emit('authorized', null);
            }            
        });
    }

    fillAccounts() {
        let sampleAccount = this.accountEntries[0].node;

        var accounts = ZilliqaNetwork.getInstance().getAllAccounts();

        var size = 0, addr;
        for (addr in accounts) {            
            var entry = null;
            if(size < this.accountEntries.length){
                entry = this.accountEntries[size];
            } else{
                let acc = cc.instantiate(sampleAccount);                
                this.accountHolder.addChild(acc);  
                entry = acc.getComponent(AccountEntry);
                this.accountEntries.push(entry);
            }

            entry.node.targetOff(this);
            entry.node.on('select', this.onSelectAccount, this);

            entry.setInfo(addr);
            size++;
        }

        for(let i=0;i<this.accountEntries.length;i++){
            this.accountEntries[i].node.active = (i < size);
        }
    }

    onSelectAccount(addr: string){
        this.inputPasswordNode.active = true;
        this.addressLabel.string = addr;
        this.importPasswordEditBox.string = "";
    }

    onCloseInputPassword(){
        this.inputPasswordNode.active = false;
    }

    onLogin(){
        if(this.importPasswordEditBox.string.length == 0){
            this.node.emit('error', 'Password was empty!');
            return;
        }

        var that = this;
        ZilliqaNetwork.getInstance().authorizeAccount(this.addressLabel.string, this.importPasswordEditBox.string, function(err, data) {
            if (err || data.error) {
                that.node.emit('error', err || data.error);                
            } else {
                that.node.emit('authorized', null);
            }            
        });
    }
    
    onChangeTab(event, idx){        
        for(var i=0;i<this.tabButtons.length;i++){
            this.tabButtons[i].interactable = (idx != i);
            this.panelNodes[i].active = (idx == i);
        }

        if(idx == 0){
            
        } else{

        }
    }

    onLoad () {
        
    }

    start () {
        
    }

    // update (dt) {}
}
