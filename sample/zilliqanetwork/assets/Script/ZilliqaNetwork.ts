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
import {Zilliqa} from './zilliqa-sdk/zilliqa.cocos';
import * as BN from './bn'
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
    private address: string = null;//'8DF0010571B2142329E13D80D530407E298FDE8E';
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
            this.zilliqaClient = new Zilliqa({
                nodeUrl: URL
            });            
            try {
                this.zilliqaClient.node.isConnected(cb);    
            } catch (error) {
                cb(error, null);
            }            
        }  
    }

    sendFaucetRequest(cb: callback) {
        if(this.zilliqaClient == null){            	
            cb('Please connect to network first!', null);		
        } else if(this.address == null){            	
            cb('Please login first!', null);		
        } else{
            var that = this;
            this.zilliqaClient.node.getBalance({address: '8DF0010571B2142329E13D80D530407E298FDE8E'}, function(err, data) {
                if(err){
                    cb(err, null);
                    return;                
                }  
                if(data.result.balance < 200){
                    cb('Master account has not enough balance', null);
                    return;                
                }                
                const txnDetails = {
                    version: 0,
                    nonce: data.result.nonce + 1,
                    to: that.address,
                    amount: new BN(200),
                    gasPrice: 1,
                    gasLimit: 1
                };
                
                // sign the transaction using util methods
                let txn = that.zilliqaClient.util.createTransactionJson('79A965ED6F516933838C4EC94D3B9512EB888DC02DC84115C40D274B7B76C99D', txnDetails);
                
                // send the transaction to the node
                that.zilliqaClient.node.createTransaction(txn, cb);
            });
        } 
    }
    generateNewAccount(password:string, cb: callback){
        if(this.zilliqaClient == null){            	
            cb('Please connect to network first!', null);		
        }
        this.privateKey = this.zilliqaClient.util.generatePrivateKey();
        this.address = this.zilliqaClient.util.getAddressFromPrivateKey(this.privateKey);

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
        } catch (exception) {
            return cb(exception.message, null);               
        }
        
        cb(null, this.address);
    }

    getBalance(cb: callback){
        if(this.zilliqaClient == null){            	
            cb('Please connect to network first!', null);		
        } else if(this.address == null){            	
            cb('Please login first!', null);		
        } else{
            this.zilliqaClient.node.getBalance({ address: this.address}, cb);
        }  
    }

    getNetworkId(cb: callback){
        if(this.zilliqaClient == null){            	
            cb('Please connect to network first!', null);		
        } else{
            this.zilliqaClient.node.getNetworkId(cb);
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
        if(this.zilliqaClient == null){            	
            cb('Please connect to network first!', null);		
        } else if(this.address == null || this.privateKey == null){            	
            cb('Please login first!', null);		
        } else{
            var that = this;
            this.getBalance(function(err, data) {
                if(err){
                    cb(err, null);
                    return;                
                }                
                var url = cc.url.raw('resources/HelloWorld.scilla');                
                cc.loader.load(url, function(err, code){
                    if(err){
                        cb(err, null);
                        return;                
                    }
                    //console.log('code', code);
                    let initParams = [
                        {
                            "vname" : "owner",
                            "type" : "ByStr20", 
                            "value" : that.address//"0x1234567890123456789012345678901234567890"
                        },
                        {
                            "vname" : "_creation_block",
                            "type" : "BNum",
                            "value" : "1"
                        }
                    ];

                    let txnDetails = {
                        version: 0,
                        nonce: data.result.nonce + 1,
                        to: '0000000000000000000000000000000000000000',
                        amount: new BN(0),
                        gasPrice: 1,
                        gasLimit: 50,
                        code: code,
                        data: JSON.stringify(initParams).replace(/\\"/g, '"')
                    };

                    // sign the transaction using util methods
                    let txn = that.zilliqaClient.util.createTransactionJson(that.privateKey, txnDetails);
                    
                    // send the transaction to the node
                    that.zilliqaClient.node.createTransaction(txn, cb);
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
