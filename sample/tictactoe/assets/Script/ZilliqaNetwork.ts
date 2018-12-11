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
import {Zilliqa, BN, Long} from './zilliqa-sdk/zilliqa.cocos'


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

    public zilliqaClient: Zilliqa = null;
    //private privateKey: string = null;//'79A965ED6F516933838C4EC94D3B9512EB888DC02DC84115C40D274B7B76C99D';
    private address: string = null;//'8df0010571b2142329e13d80d530407e298fde8e';
    private encryptedData: string = null;

    private accounts = {};
    
    private static s_dataFileName: string = 'UserKeyStores';

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
                //console.log('loadKeyStore:', temp.data);
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
                //console.log('loadKeyStore:', data);
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
            this.zilliqaClient.wallet.addByPrivateKey('3375F915F3F9AE35E6B301B7670F53AD1A5BE15D8221EC7FD5E503F21D3450C8');            
            var that = this;
            this.getBalance('8254b2c9acdf181d5d6796d63320fbb20d4edd12', function(err, data) {
                if(err){
                    that.zilliqaClient.wallet.remove('8254b2c9acdf181d5d6796d63320fbb20d4edd12');                    
                    cb(err, null);
                    return;                
                }                  
                if(data.result.balance < 1000000){
                    that.zilliqaClient.wallet.remove('8254b2c9acdf181d5d6796d63320fbb20d4edd12');                    
                    cb('Master account has not enough balance', null);
                    return;                
                }  
                
                                
                that.zilliqaClient.wallet.setDefault('8254b2c9acdf181d5d6796d63320fbb20d4edd12'.toLowerCase());                
                
                const tx = that.zilliqaClient.transactions.new({
                    version: 1,
                    toAddr: that.address,
                    amount: new BN(2000000),
                    gasPrice: new BN(100),
                    gasLimit: Long.fromNumber(100),
                });  
                console.log('createTransaction');
                console.log(JSON.stringify(tx));
                that.zilliqaClient.blockchain
                    .createTransaction(tx)
                    .then((tx) => {                        
                        // do something with then confirmed tx
                        that.zilliqaClient.wallet.remove('8254b2c9acdf181d5d6796d63320fbb20d4edd12');
                        that.zilliqaClient.wallet.setDefault(that.address.toLowerCase());
                        cb(null, tx);
                    })
                    .catch((err) => {                   
                        // handle the error
                        that.zilliqaClient.wallet.remove('8254b2c9acdf181d5d6796d63320fbb20d4edd12');
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
                console.log('encryptJson', encryptJson);
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
        } else if(this.address == null){            	
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
            //cb('Obsolete function', null);	
            this.zilliqaClient.provider.send('GetSmartContracts', this.address).then(function(data) {                    
                if(!data){                        
                    cb('unknown error', null);
                    return;                
                }                   
                cb(null, data);
            }).catch((e) => cb(e, null));
        }  
    }

    deployHelloWorld(cb: callback){
        //return this.deployHelloWorldb(cb);
        if(this.zilliqaClient == null){            	
            cb('Please connect to network first!', null);		
        } else if(this.zilliqaClient.wallet.defaultAccount == null){            	
            cb('Please login first!', null);		
        } else{
            var that = this;
            var url = cc.url.raw('resources/contracts/HelloWorld.scilla');
            this.getBalance(this.address, function(err, data){
                if(err){                    
                    cb(err, null);
                    return;                
                }
                if(data.result.balance < 1000000){
                    cb('Require 1000000 ZILs or more!', null);
                    return; 
                }
                cc.loader.load(url, function(err, code){
                    if(err){                    
                        cb(err, null);
                        return;                
                    }
                                                    
                    const init = [
                        {
                            vname: 'owner',
                            type: 'ByStr20',
                            value: '0x' + that.address.toLowerCase()
                        },
                    ];

                    const contract = that.zilliqaClient.contracts.new(code, init);                
                    // if you are in a function, you can also use async/await
                    contract.deploy(new BN(100), Long.fromNumber(10000))
                    .then((hello) => {                                            
                        if (hello.isDeployed()) {
                            return cb(null, hello);
                        }
                        cb('Rejected', null);                    
                    })                       
                    .catch((err) => {                                  
                        cb(err, null);
                    });
                });
            });
        }  
    }

    callSetHello(hello: any, cb: any){
        hello.call('setHello', [
            {
                vname: 'msg',
                type: 'String',
                value: 'Hello World',
            }
        ]).then((_) => {                            
            cb(null, 'Done');
        }).catch((err) => {                                                  
            cb(err, null);
        });
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
                if(data.result.balance < 2000000){
                    cb('Require 2000000 ZILs or more!', null);
                    return; 
                }                

                const contract = that.zilliqaClient.contracts.new(code, init);                
                // if you are in a function, you can also use async/await
                contract.deploy(new BN(100), Long.fromNumber(20000))
                .then((hello) => {                                            
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


            // this.zilliqaClient.blockchain.getTransaction(contractAddress)
            // .then((tx) => {      
            //     console.log(JSON.stringify(tx));                      
            //     cb(null, tx);
            // })
            // .catch((err) => {
            //     console.log(JSON.stringify(err));                      
            //     cb(err, null);
            // });    
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
