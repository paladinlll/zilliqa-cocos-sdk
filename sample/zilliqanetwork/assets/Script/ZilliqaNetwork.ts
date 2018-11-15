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
import * as Crypto from 'crypto'


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
    private privateKey: string = null;//'79A965ED6F516933838C4EC94D3B9512EB888DC02DC84115C40D274B7B76C99D';
    private address: string = null;//'8df0010571b2142329e13d80d530407e298fde8e';
    private encryptedData: string = null;
    
    private static s_dataFileName: string = 'UserKeyStore';

    getUserAddress() {return this.address;}
    wasAuthenticated() {return this.privateKey != null;}

    logOut() {
        this.privateKey = null;
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
                    amount: new BN(120),
                    gasPrice: new BN(1),
                    gasLimit: new BN(10),
                });                
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
        this.privateKey = this.zilliqaClient.util.generatePrivateKey();
        this.address = this.zilliqaClient.util.getAddressFromPrivateKey(this.privateKey);
        this.zilliqaClient.wallet.addByPrivateKey(this.privateKey);
        this.zilliqaClient.wallet.setDefault(this.address.toLowerCase());
        try {
            const cipher = Crypto.createCipher('aes192', password);

            let encrypted = cipher.update(this.privateKey, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            this.encryptedData = encrypted;
                        
            this.saveKeyStore();
        } catch (exception) {
            return cb(exception.message, null);            
        }

        cb(null, this.address);
    }

    authorizeAccount(password:string, cb: callback){
        try {            
            const decipher = Crypto.createDecipher('aes192', password);        
            let decrypted = decipher.update(this.encryptedData, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            this.privateKey = decrypted;

            this.zilliqaClient.wallet.addByPrivateKey(this.privateKey);
            this.zilliqaClient.wallet.setDefault(this.address.toLowerCase());
        } catch (exception) {
            return cb(exception.message, null);               
        }
        
        cb(null, this.address);
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
            this.zilliqaClient.node.getSmartContracts({ address: this.address}, cb);
        }  
    }

    deployHelloWorld(cb: callback){
        return this.deployHelloWorldb(cb);
        if(this.zilliqaClient == null){            	
            cb('Please connect to network first!', null);		
        } else if(this.address == null || this.privateKey == null){            	
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
                    contract.deploy(new BN(1), new BN(2500))
                        .then((contract) => {
                            console.log('contract', JSON.stringify(contract));
                            if (contract.isDeployed()) {
                                // do something with your contract
                                return contract.call('setHello', [
                                    {
                                    vname: 'owner',
                                    type: 'ByStr20',
                                    value: that.address
                                    }
                                ]);
                                //cb(null, contract);
                            }

                            if (contract.isRejected()) {
                                cb(contract, null);
                                // throw an error, or somehow handle the failed deployment
                            }
                        })
                        .then((contract) => {
                            return contract.getState();
                        })
                        .then((state) => {
                            // do something
                            cb(null, state);
                        })
                        .catch((err) => {
                            // handle the error
                            console.log(JSON.stringify(err));
                            cb(err, null);
                        });

                });
            });     
        }  
    }

    deployHelloWorldb(cb: callback){
        if(this.zilliqaClient == null){            	
            cb('Please connect to network first!', null);		
        } else if(this.address == null || this.privateKey == null){            	
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
            this.zilliqaClient.node.getSmartContractState({ address: contractAddress}, cb);
        }  
    }

    getSmartContractCode(contractAddress: string, cb: callback){
        if(this.zilliqaClient == null){            	
            cb('Please connect to network first!', null);		
        } else{
            this.zilliqaClient.node.getSmartContractState({ address: contractAddress}, cb);
        }  
    }

    getSmartContractInit(contractAddress: string, cb: callback){
        if(this.zilliqaClient == null){            	
            cb('Please connect to network first!', null);		
        } else{
            this.zilliqaClient.node.getSmartContractState({ address: contractAddress}, cb);
        }  
    }

}
