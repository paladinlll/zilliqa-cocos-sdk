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
import {Zilliqa, BN} from './zilliqa-sdk/zilliqa.cocos'


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
    
    private static s_dataFileName: string = 'UserKeyStore';

    getUserAddress() {return this.address;}
    wasAuthenticated() {return this.zilliqaClient && this.zilliqaClient.wallet.defaultAccount;}

    logOut() {
        if(this.zilliqaClient.wallet.defaultAccount != null){
            this.zilliqaClient.wallet.remove(this.zilliqaClient.wallet.defaultAccount.address);
            this.zilliqaClient.wallet.defaultAccount = null;
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
                    this.address = file.address;
                    this.encryptedData = file.encryptedData;
                }                
            }
        }
        else
        {            
            var data = cc.sys.localStorage.getItem(ZilliqaNetwork.s_dataFileName);
            if (data != null) {
                var file = JSON.parse(data);

                if(file){
                    this.address = file.address;
                    this.encryptedData = file.encryptedData;
                }
            }
        }
    }

    saveKeyStore() {
        var file = {
            address: this.address,
            encryptedData: this.encryptedData
        };

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

    connect(cb: callback){
        if(Zilliqa == null){            
            cb('Zilliqa is undefined!', null);		
        } else{
            //greet();
            //let URL = 'https://dev-test-api.aws.z7a.xyz'
            let URL = 'https://api-scilla.zilliqa.com'
            this.zilliqaClient = new Zilliqa('https://api-scilla.zilliqa.com');
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
            this.zilliqaClient.wallet.addByPrivateKey('79A965ED6F516933838C4EC94D3B9512EB888DC02DC84115C40D274B7B76C99D');            
            var that = this;
            this.getBalance('8df0010571b2142329e13d80d530407e298fde8e', function(err, data) {
                if(err){
                    that.zilliqaClient.wallet.remove('8df0010571b2142329e13d80d530407e298fde8e');                    
                    cb(err, null);
                    return;                
                }                  
                if(data.result.balance < 200){
                    that.zilliqaClient.wallet.remove('8df0010571b2142329e13d80d530407e298fde8e');                    
                    cb('Master account has not enough balance', null);
                    return;                
                }  
                
                                
                that.zilliqaClient.wallet.setDefault('8df0010571b2142329e13d80d530407e298fde8e'.toLowerCase());                
                
                const tx = that.zilliqaClient.transactions.new({
                    version: 1,
                    toAddr: that.address,
                    amount: new BN(2510),
                    gasPrice: new BN(1),
                    gasLimit: new BN(10),
                });  
                console.log('createTransaction');
                console.log(JSON.stringify(tx));
                that.zilliqaClient.blockchain
                    .createTransaction(tx)
                    .then((tx) => {                        
                        // do something with then confirmed tx
                        that.zilliqaClient.wallet.remove('8df0010571b2142329e13d80d530407e298fde8e');
                        that.zilliqaClient.wallet.setDefault(that.address.toLowerCase());
                        cb(null, tx);
                    })
                    .catch((err) => {                   
                        // handle the error
                        that.zilliqaClient.wallet.remove('8df0010571b2142329e13d80d530407e298fde8e');
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
                that.encryptedData = encryptJson;
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

    authorizeAccount(password:string, cb: callback){
        var isJson = false;
        try {
            JSON.parse(this.encryptedData);
            isJson = true;
        } catch (e) {
            return cb('Keystore corrupted!', null); 
        }   

        var that = this;
        this.zilliqaClient.wallet.addByKeystore(this.encryptedData, password)
        .then((adr) => {                                                            
            cb(null, that.address);
            this.zilliqaClient.wallet.setDefault(that.address.toLowerCase());
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
            cb('Obsolete function', null);	
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
            this.getBalance(this.address, function(err, data) {
                if(err){
                    cb(err, null);
                    return;                
                }                
                var url = cc.url.raw('resources/HelloWorld.scilla');                
                cc.loader.load(url, function(err, code){
                    if(err){
                        console.log('deployHelloWorld.load', err);
                        cb(err, null);
                        return;                
                    }
                                                    
                    const init = [
                        {
                          vname: 'welcome_msg',
                          type: 'String',
                          value: 'Hello World',
                        },
                    ];
                    const contract = that.zilliqaClient.contracts.new(code, init);
                    console.log(that.address);
                    // if you are in a function, you can also use async/await
                    contract.deploy(new BN(1), new BN(1000))
                        .then((hello) => {
                            console.log('contract.address', contract.address);
                            console.log('hello.address', hello.address);
                            if (hello.isDeployed()) {
                                // do something with your contract
                                hello.call('setHello', [
                                    {
                                    vname: 'owner',
                                    type: 'ByStr20',
                                    value: that.address
                                    }
                                ]).then((callTx) => {
                                    console.log('callTx', JSON.stringify(callTx));
                                    callTx.getState().then((state) => {
                                        // do something
                                        console.log('state', JSON.stringify(state));
                                        cb(null, state);
                                    }).catch((err) => {
                                        // handle the error
                                        console.log('callTx.getState err', JSON.stringify(err));
                                        cb(err, null);
                                    });
                                }).catch((err) => {
                                    // handle the error
                                    console.log('hello.call err', JSON.stringify(err));
                                    cb(err, null);
                                });
                                return;                             
                            }

                            cb('Rejected', null);
                            //if (hello.isRejected()) {
                                
                                // throw an error, or somehow handle the failed deployment
                            //}
                        })                       
                        .catch((err) => {
                            // handle the error
                            console.log('contract.deploy err', JSON.stringify(err));
                            cb(err, null);
                        });

                });
            });     
        }  
    }

    deployHelloWorldb(cb: callback){
        if(this.zilliqaClient == null){            	
            cb('Please connect to network first!', null);		
        } else if(this.zilliqaClient.wallet.defaultAccount == null){            	
            cb('Please login first!', null);		
        } else{
            var that = this;
            this.getBalance(this.address, function(err, data) {
                if(err){
                    cb(err, null);
                    return;                
                }                
                var url = cc.url.raw('resources/HelloWorld.scilla');                
                cc.loader.load(url, function(err, code){
                    if(err){
                        console.log('deployHelloWorld.load', err);
                        cb(err, null);
                        return;                
                    }
                    
                                
                    const init = [
                        {
                          vname: 'welcome_msg',
                          type: 'String',
                          value: 'Hello World',
                        },
                    ];
                    
                    const tx = that.zilliqaClient.transactions.new({
                        version: 1,
                        toAddr: '0000000000000000000000000000000000000000',
                        amount: new BN(0),
                        gasPrice: new BN(1),
                        gasLimit: new BN(2500),
                        code: code,
                        data: JSON.stringify(init).replace(/\\"/g, '"'),
                    });                
                    console.log('deployHelloWorldb', JSON.stringify(tx));                      
                    that.zilliqaClient.blockchain
                        .createTransaction(tx)
                        .then((tx) => {      
                            console.log(JSON.stringify(tx));                      
                            cb(null, tx);
                        })
                        .catch((err) => {                                               
                            cb(err, null);
                        });    
                });
            });     
        }  
    }

    
    getSmartContractState(contractAddress: string, cb: callback){
        if(this.zilliqaClient == null){            	
            cb('Please connect to network first!', null);		
        } else{
            //cb('Obsolete function', null);	
            this.zilliqaClient.blockchain.getTransaction(contractAddress)
            .then((tx) => {      
                console.log(JSON.stringify(tx));                      
                cb(null, tx);
            })
            .catch((err) => {
                console.log(JSON.stringify(err));                      
                cb(err, null);
            });    
        }  
    }

    getSmartContractCode(contractAddress: string, cb: callback){
        if(this.zilliqaClient == null){            	
            cb('Please connect to network first!', null);		
        } else{
            cb('Obsolete function', null);	
        }  
    }

    getSmartContractInit(contractAddress: string, cb: callback){
        if(this.zilliqaClient == null){            	
            cb('Please connect to network first!', null);		
        } else{
            cb('Obsolete function', null);	
        }  
    }

}
