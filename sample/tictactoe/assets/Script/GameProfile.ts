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
            this.instance.loadProfile();          
        }
        return this.instance;
    }

    activeTicTacToeBinding:TicTacToeBinding = null;    
    tictactoeCode:string = '';
    userData = {};

    setActiveTicTacToeAddress(address:string){
        var userAddress = ZilliqaNetwork.getInstance().getUserAddress();
        if(this.userData[userAddress] == null){
            this.userData[userAddress] = {};
        }
        this.userData[userAddress].activeTicTacToeAddress = address;
        this.saveProfile();
    }

    getActiveTicTacToeAddress(){
        var userAddress = ZilliqaNetwork.getInstance().getUserAddress();        
        if(this.userData[userAddress] != null){
            return this.userData[userAddress].activeTicTacToeAddress || '';
        }
        return '';
    }

    addchallengedAddresses(tag:string, address:string){        
        var userAddress = ZilliqaNetwork.getInstance().getUserAddress();
        if(this.userData[userAddress] == null){
            this.userData[userAddress] = {};
        }

        if(this.userData[userAddress].challengedAddresses == null){
            this.userData[userAddress].challengedAddresses = {};
        }
        if(this.userData[userAddress].challengedAddresses[tag] != null){
            return false;
        }
        this.userData[userAddress].challengedAddresses[tag] = address;
        this.saveProfile();
        return true;
    }

    getChallengedAddressList(){
        var userAddress = ZilliqaNetwork.getInstance().getUserAddress();        
        if(this.userData[userAddress] != null && this.userData[userAddress].challengedAddresses != null){
            return this.userData[userAddress].challengedAddresses;
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
    loadProfile() {
        if (cc.sys.isNative)
        {        
            var path = jsb.fileUtils.getWritablePath();
            if (jsb.fileUtils.isFileExist(path + GameProfile.s_dataFileName))
            {
                var temp = jsb.fileUtils.getValueMapFromFile(path + GameProfile.s_dataFileName);                
                var file = JSON.parse(temp.data);
                if (file && file.version == GameProfile.version) {                                        
                    this.userData = file.userData;
                }                
            }
        }
        else
        {            
            var data = cc.sys.localStorage.getItem(GameProfile.s_dataFileName);
            if (data != null) {                
                var file = JSON.parse(data);
                if(file && file.version == GameProfile.version){
                    this.userData = file.userData;
                }
            }
        }        
        
        if(this.userData == null){
            this.userData = {};
        }
    }

    saveProfile() {   
        var file = {
            version: GameProfile.version,
            userData: this.userData
        }     
        if (cc.sys.isNative)
        {
            var path = jsb.fileUtils.getWritablePath();
            
            if (jsb.fileUtils.writeToFile({data:JSON.stringify(file)}, path + GameProfile.s_dataFileName)) {
            } else {
                console.log('save FAILED');
            }
        } else {            
            cc.sys.localStorage.setItem(GameProfile.s_dataFileName, JSON.stringify(file));
        }
    }
}
