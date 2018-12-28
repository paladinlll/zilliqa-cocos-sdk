// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

//const {ccclass, property} = cc._decorator;
//import {Zilliqa} from './zilliqa-sdk/zilliqa.cocos';
//import Zilliqa from './zilliqa-sdk/zilliqa';
import {Zilliqa, BN, Long} from './zilliqa.cocos'


declare type callback = (error: any, data: any) => any;
//@ccclass
export default class ZilliqaNetwork{
   
    private static instance: ZilliqaNetwork = null;
    
    private constructor() {    
    }

    public static getInstance() {
        if (this.instance === null || this.instance === undefined) {
            this.instance = new ZilliqaNetwork();
            this.instance.loadKeyStore();
        }
        return this.instance;
    } 

    public zilliqaClient: any = null;
    //private privateKey: string = null;//'79A965ED6F516933838C4EC94D3B9512EB888DC02DC84115C40D274B7B76C99D';
    private address: string = null;//'8df0010571b2142329e13d80d530407e298fde8e';
    private encryptedData: string = null;

    private accounts = {};
    
    private static s_dataFileName: string = 'UserKeyStores';

    
    public static GAS_MULTIPLIER = new BN(1000000000);
    public static BALANCE_REQUIRE = new BN(20000).mul(ZilliqaNetwork.GAS_MULTIPLIER);

    public static DEFAULT_CALL_PARAMS = {        
        amount: new BN(0),
        gasPrice: new BN(1).mul(ZilliqaNetwork.GAS_MULTIPLIER),
        gasLimit: Long.fromNumber(2500),
    }
    
    getAllAccounts() {return this.accounts;}
    getUserAddress() {return this.address;}
    wasAuthenticated() {return this.zilliqaClient && this.zilliqaClient.wallet.defaultAccount;}

    logOut() {
        if(this.zilliqaClient.wallet.defaultAccount != null){
            this.zilliqaClient.wallet.remove(this.zilliqaClient.wallet.defaultAccount.address);
            this.zilliqaClient.wallet.defaultAccount = null;
            this.address = null;
        }        
    }

    loadKeyStore() {
        if (cc.sys.isNative)
        {        
            var path = jsb.fileUtils.getWritablePath();
            if (jsb.fileUtils.isFileExist(path + ZilliqaNetwork.s_dataFileName))
            {
                var temp = jsb.fileUtils.getValueMapFromFile(path + ZilliqaNetwork.s_dataFileName);                
                var file = JSON.parse(temp.data);
                if (file) {                                        
                    this.accounts = file.accounts;
                }                
            }
        }
        else
        {            
            var data = cc.sys.localStorage.getItem(ZilliqaNetwork.s_dataFileName);
            if (data != null) {                
                var file = JSON.parse(data);

                if(file){
                    this.accounts = file.accounts;
                }
            }
        }
        
        if(this.accounts == null){
            this.accounts = {};
        }
    }

    saveKeyStore() {   
        var file = {
            accounts: this.accounts
        }     
        console.log('saveKeyStore', JSON.stringify(this.accounts));
        if (cc.sys.isNative)
        {
            var path = jsb.fileUtils.getWritablePath();
            
            if (jsb.fileUtils.writeToFile({data:JSON.stringify(file)}, path + ZilliqaNetwork.s_dataFileName)) {
            } else {
                console.log('save FAILED');
            }
        } else {            
            cc.sys.localStorage.setItem(ZilliqaNetwork.s_dataFileName, JSON.stringify(file));
        }
    }

    connect(URL:string, cb: callback){
        if(Zilliqa == null){            
            cb('Zilliqa is undefined!', null);		
        } else{
            //greet();            
            this.zilliqaClient = new Zilliqa(URL);
            var that = this;
            this.getNetworkId(function(err, data) {
                if (err || data.error) {                         
                    that.zilliqaClient = null;
                }
                cb(err, data);
            });      
        }  
    }

    sendFaucetRequest(cb: callback) {
        if(this.zilliqaClient == null){            	
            cb('Please connect to network first!', null);		
        } else if(this.address == null){            	
            cb('Please login first!', null);		
        } else{
            var genesiskey = 'b3ccf5a3acbcb6081a8f48968e32fe88ee6358cdbb069c7f6ea8036594b95ceb'
	        var genesisAddr = this.zilliqaClient.wallet.addByPrivateKey(genesiskey);
            var that = this;
            this.getBalance(genesisAddr, function(err, data) {
                if(err){
                    that.zilliqaClient.wallet.remove(genesisAddr);                    
                    cb(err, null);
                    return;                
                }
                if(data.error){
                    that.zilliqaClient.wallet.remove(genesisAddr);                    
                    cb('Invalid genesis account', null);
                    return; 
                }
                if(data.result.balance < ZilliqaNetwork.BALANCE_REQUIRE){
                    that.zilliqaClient.wallet.remove(genesisAddr);                    
                    cb('Master account has not enough balance', null);
                    return;                
                }  
                
                                
                that.zilliqaClient.wallet.setDefault(genesisAddr.toLowerCase());                
                
                const tx = that.zilliqaClient.transactions.new({
                    version: 1,
                    toAddr: that.address,
                    amount: ZilliqaNetwork.BALANCE_REQUIRE,
                    gasPrice: new BN(1).mul(ZilliqaNetwork.GAS_MULTIPLIER),                    
                    gasLimit: Long.fromNumber(100)
                });  
                
                that.zilliqaClient.blockchain
                    .createTransaction(tx)
                    .then((tx) => {                        
                        // do something with then confirmed tx
                        that.zilliqaClient.wallet.remove(genesisAddr);
                        that.zilliqaClient.wallet.setDefault(that.address.toLowerCase());
                        cb(null, tx);
                    })
                    .catch((err) => {                   
                        // handle the error
                        that.zilliqaClient.wallet.remove(genesisAddr);
                        that.zilliqaClient.wallet.setDefault(that.address.toLowerCase());
                        cb(err, null);
                    });                                
            });
        } 
    }
    generateNewAccount(password:string, cb: callback){
        if(this.zilliqaClient == null){            	
            cb('Please connect to network first!', null);		
        }

        this.address = this.zilliqaClient.wallet.create();        
        this.zilliqaClient.wallet.setDefault(this.address.toLowerCase());
        var that = this;
        try {
            
            this.zilliqaClient.wallet.export(this.address.toLowerCase(), password, 'scrypt')
            .then((encryptJson) => {                                                        
                that.accounts[this.address.toLowerCase()] = encryptJson;                
                that.saveKeyStore();
                cb(null, that.address);
            })
            .catch((err) => {                                   
                console.log('encryptJson', err);
                cb(err, null);
            });          
        } catch (exception) {
            return cb(exception.message, null);            
        }        
    }

    authorizeAccount(addr:string, password:string, cb: callback){
        var encryptedData = null;
        var that = this;

        if(this.accounts[addr] != null){
            encryptedData = this.accounts[addr];
        } else{
            cb('Invalid address', null);
            return;
        }

        // this.zilliqaClient.wallet.addByPrivateKey('3375F915F3F9AE35E6B301B7670F53AD1A5BE15D8221EC7FD5E503F21D3450C8');
        // this.address = this.zilliqaClient.wallet.defaultAccount.address;
        // cb(null, this.address);
        // return;
        
        this.zilliqaClient.wallet.addByKeystore(encryptedData, password)
        .then((retAddr) => {
            that.address = addr;
            cb(null, that.address);
            that.zilliqaClient.wallet.setDefault(that.address.toLowerCase());
        })
        .catch((err) => {                                                       
            cb(err, null);
        });        
    }

    getBalance(address:string, cb: callback){
        if(address == null || address == ''){
            address = this.address;
        }
        if(this.zilliqaClient == null){            	
            cb('Please connect to network first!', null);		
        } else if(address == null){            	
            cb('Please login first!', null);		
        } else{
            this.zilliqaClient
                .blockchain.getBalance(address)
                .then(function(data) {                    
                    cb(null, data);
                }).catch((e) => cb(e, null));       
        }  
    }

    getNetworkId(cb: callback){
        if(this.zilliqaClient == null){            	
            cb('Please connect to network first!', null);		
        } else{
            this.zilliqaClient.network.GetNetworkId().then(function(data) {                    
                if(!data){                        
                    cb('unknown error', null);
                    return;                
                }                   
                cb(null, data);
            }).catch((e) => cb(e, null));
        }  
    }

    getSmartContracts(cb: callback){
        if(this.zilliqaClient == null){            	
            cb('Please connect to network first!', null);		
        } else if(this.address == null){            	
            cb('Please login first!', null);		
        } else{            
            this.zilliqaClient.provider.send('GetSmartContracts', this.address).then(function(data) {                    
                if(!data){                        
                    cb('unknown error', null);
                    return;                
                }                   
                cb(null, data);
            }).catch((e) => cb(e, null));
        }  
    }

    deployContract(code: any, init: any, cb: callback){
        //return this.deployHelloWorldb(cb);
        if(this.zilliqaClient == null){            	
            cb('Please connect to network first!', null);		
        } else if(this.zilliqaClient.wallet.defaultAccount == null){            	
            cb('Please login first!', null);		
        } else{
            var that = this;            
            this.getBalance(this.address, function(err, data){
                if(err){                    
                    cb(err, null);
                    return;                
                }
                if(data.error){                    
                    cb(data.error.message, null);
                    return; 
                }
                if(data.result.balance < ZilliqaNetwork.BALANCE_REQUIRE){
                    cb('Require ' + ZilliqaNetwork.BALANCE_REQUIRE.toString() +  'Qa or more!', null);
                    return; 
                }                

                const contract = that.zilliqaClient.contracts.new(code, init);                
                
                contract.deploy({
                    gasPrice: new BN(1).mul(ZilliqaNetwork.GAS_MULTIPLIER),
                    gasLimit: Long.fromNumber(20000)
                }).then(([deployTx, hello]) => {                                            
                    if (hello.isDeployed()) {
                        return cb(null, hello);
                    }
                    cb('Rejected', null);                    
                })                       
                .catch((err) => {                                  
                    cb(err, null);
                });                
            });
        }  
    }

    loadContractFromAddress(address:string){
        return this.zilliqaClient.contracts.at(address);
    }

    getSmartContractState(contractAddress: string, cb: callback){
        if(this.zilliqaClient == null){            	
            cb('Please connect to network first!', null);		
        } else{
            this.zilliqaClient.provider.send('GetSmartContractState', contractAddress).then(function(data) {                    
                if(!data){                        
                    cb('unknown error', null);
                    return;                
                }                   
                cb(null, data);
            }).catch((e) => cb(e, null));   
        }  
    }

    getSmartContractCode(contractAddress: string, cb: callback){
        if(this.zilliqaClient == null){            	
            cb('Please connect to network first!', null);		
        } else{
            this.zilliqaClient.provider.send('GetSmartContractCode', contractAddress).then(function(data) {                    
                if(!data){                        
                    cb('unknown error', null);
                    return;                
                }                   
                cb(null, data);
            }).catch((e) => cb(e, null));
        }  
    }

    getSmartContractInit(contractAddress: string, cb: callback){
        if(this.zilliqaClient == null){            	
            cb('Please connect to network first!', null);		
        } else{
            this.zilliqaClient.provider.send('GetSmartContractInit', contractAddress).then(function(data) {                    
                if(!data){                        
                    cb('unknown error', null);
                    return;                
                }                   
                cb(null, data);
            }).catch((e) => cb(e, null));
        }  
    }

}
