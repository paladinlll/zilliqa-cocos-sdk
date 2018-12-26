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
import ZilliqaNetwork from '../zilliqa/ZilliqaNetwork';
import ZilliqaPopup from '../popups/ZilliqaPopup/ZilliqaPopup';
import LobbyPopup from '../popups/LobbyPopup/LobbyPopup';

@ccclass
export default class MainMenu extends cc.Component {

    zilliqaPopup: ZilliqaPopup = null;
    
    lobbyPopup: LobbyPopup = null;

    // LIFE-CYCLE CALLBACKS:
    onActiveTictactoeContract(address:string) {
        this.lobbyPopup.refresh();
    }
    onLoad () {
		var that = this;		
				
		cc.loader.loadRes('LobbyPopup', cc.Prefab, (err, prefab) => {
            if (err) {
                cc.error(err.message || err);
                return;
            }
            var lp = cc.instantiate(prefab);
			that.node.addChild(lp);      
			that.lobbyPopup = lp.getComponent(LobbyPopup);			
			
			cc.loader.loadRes('ZilliqaPopup', cc.Prefab, (err, prefab) => {
				if (err) {
					cc.error(err.message || err);
					return;
				}
				var zp = cc.instantiate(prefab);
				that.node.addChild(zp);      
				that.zilliqaPopup = zp.getComponent(ZilliqaPopup);
				that.checkLoadDone();
			});
        });
	}
	
	checkLoadDone(){
		if(this.zilliqaPopup == null || this.lobbyPopup == null){
			return;
		}
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

    start () {        
        
    }

    // update (dt) {}
}
