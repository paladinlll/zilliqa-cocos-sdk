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
import ZilliqaNetwork from '../ZilliqaNetwork';
import ZilliqaPopup from '../popups/ZilliqaPopup/ZilliqaPopup';
import LobbyPopup from '../popups/LobbyPopup/LobbyPopup';

@ccclass
export default class MainMenu extends cc.Component {

    @property(ZilliqaPopup)
    zilliqaPopup: ZilliqaPopup = null;

    @property(LobbyPopup)
    lobbyPopup: LobbyPopup = null;

    // LIFE-CYCLE CALLBACKS:
    onActiveTictactoeContract(address:string) {
        this.lobbyPopup.refresh();
    }
    //onLoad () { }

    start () {        
        var that = this;

        this.zilliqaPopup.node.active = true;
        if(ZilliqaNetwork.getInstance().wasAuthenticated()){                        
            this.lobbyPopup.node.active = true;
        } else{            
            this.lobbyPopup.node.active = false;
        }
        

        this.zilliqaPopup.node.on('loggedin', () => {            
            that.lobbyPopup.node.active = true;
            that.lobbyPopup.refresh();
        });

        this.zilliqaPopup.node.on('loggedout', () => {            
            that.lobbyPopup.node.active = false;
        });

        this.zilliqaPopup.node.on('minimize', () => {            
            that.lobbyPopup.refresh();
        });

        this.zilliqaPopup.node.on('activecontract', this.onActiveTictactoeContract, this);
    }

    // update (dt) {}
}
