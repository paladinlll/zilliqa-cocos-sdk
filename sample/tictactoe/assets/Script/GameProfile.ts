import TicTacToeBinding from './contracts/TicTacToeBinding'

export default class GameProfile{
    private static instance: GameProfile = null;
    private static s_dataFileName: string = 'GameProfile';

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
    activeTicTacToeAddress:string = '';
    tictactoeCode:string = '';

    setActiveTicTacToeAddress(address:string){
        this.activeTicTacToeAddress = address;
        this.saveProfile();
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
                if (file) {                                        
                    this.activeTicTacToeAddress = file.activeTicTacToeAddress;
                }                
            }
        }
        else
        {            
            var data = cc.sys.localStorage.getItem(GameProfile.s_dataFileName);
            if (data != null) {                
                var file = JSON.parse(data);
                if(file){
                    this.activeTicTacToeAddress = file.activeTicTacToeAddress;
                }
            }
        }
        
        if(this.activeTicTacToeAddress == null){
            this.activeTicTacToeAddress = '';
        }
    }

    saveProfile() {   
        var file = {
            activeTicTacToeAddress: this.activeTicTacToeAddress
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
