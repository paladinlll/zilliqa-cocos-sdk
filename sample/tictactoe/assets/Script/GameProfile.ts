import TicTacToeBinding from './contracts/TicTacToeBinding'
import ZilliqaNetwork from './ZilliqaNetwork'

export default class GameProfile{
    private static instance: GameProfile = null;
    private static s_dataFileName: string = 'GameProfileData';
    private static version: number = 1;

    private constructor() {    
    }

    public static getInstance() {
        if (this.instance === null || this.instance === undefined) {
            this.instance = new GameProfile();                 
        }
        return this.instance;
    }

    activeTicTacToeBinding:TicTacToeBinding = null;    
    tictactoeCode:string = '';
    userData = {
        activeTicTacToeAddress: '',
        challengedAddresses: {}
    };

    setActiveTicTacToeAddress(address:string){        
        this.userData.activeTicTacToeAddress = address;
        this.saveProfile();
    }

    getActiveTicTacToeAddress(){
        return this.userData.activeTicTacToeAddress || '';
    }

    addchallengedAddresses(tag:string, address:string){        
        if(this.userData.challengedAddresses[tag] != null){
            return false;
        }
        this.userData.challengedAddresses[tag] = address;
        this.saveProfile();
        return true;
    }

    removeChallengedAddresses(address:string){            
        var challengedAddresses = this.userData.challengedAddresses;
        var tag;
        for (tag in challengedAddresses) {
            if(challengedAddresses[tag] == address){
                delete this.userData.challengedAddresses[tag];
                this.saveProfile();
                return true;
            }
        }
       return false;
    }

    getChallengedAddressList(){        
        if(this.userData != null && this.userData.challengedAddresses != null){
            return this.userData.challengedAddresses;
        }
        return {};
    }
    

    getTictactoeCode(cb:any){
        var that = this;
        if(this.tictactoeCode != ''){
            cb(this.tictactoeCode);
            return;
        }
        var url = cc.url.raw('resources/contracts/tictactoe.scilla');
        cc.loader.load(url, function(err, code){
            if(err){                    
                cb('');
                return;                
            }
            that.tictactoeCode = code;
            cb(code);
        });
    }
    loadProfile(userAddress: string) {
        var keyTag = GameProfile.s_dataFileName + '_' + userAddress;

        this.userData = null;
        if (cc.sys.isNative)
        {        
            var path = jsb.fileUtils.getWritablePath();
            if (jsb.fileUtils.isFileExist(path + keyTag))
            {
                var temp = jsb.fileUtils.getValueMapFromFile(path + keyTag);                
                var file = JSON.parse(temp.data);
                if (file && file.version == GameProfile.version) {                                        
                    this.userData = file.userData;
                }                
            }
        }
        else
        {            
            var data = cc.sys.localStorage.getItem(keyTag);
            if (data != null) {                
                var file = JSON.parse(data);
                if(file && file.version == GameProfile.version){
                    this.userData = file.userData;
                }
            }
        }        
        
        if(this.userData == null){
            this.userData = {
                activeTicTacToeAddress: '',
                challengedAddresses: {}
            };
        }
    }

    saveProfile() {
        var userAddress = ZilliqaNetwork.getInstance().getUserAddress();
        var file = {
            version: GameProfile.version,
            userData: this.userData
        }     
        var keyTag = GameProfile.s_dataFileName + '_' + userAddress;
        if (cc.sys.isNative)
        {
            var path = jsb.fileUtils.getWritablePath();
            
            if (jsb.fileUtils.writeToFile({data:JSON.stringify(file)}, path + keyTag)) {
            } else {
                console.log('save FAILED');
            }
        } else {            
            cc.sys.localStorage.setItem(keyTag, JSON.stringify(file));
        }
    }
}
