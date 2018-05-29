/**
 * Created by wangh09 on 2018/1/15.
 */

var grpc = require('grpc');
var _ccProto = grpc.load('protos/peer/chaincode.proto').protos;
var ethUtils = require('ethereumjs-util');
var settingsConfig = require('./config');
var Long = require('long');
var Wallet = require('./wallet').Wallet;

var createAccount = function () {
    Wallet.generate();
   return {"address": Wallet.getAddress(), "public_key": Wallet.getPubKey(), "private_key": Wallet.getPriKey()};
};

var publicKeyFromPrivate = function (prikey) {
    var pubkey = ethUtils.privateToPublic(Buffer.from(prikey, "hex"));
    return pubkey.toString("hex");
};

var signTX = function (ccId, fcn, arg, msg, counter, inkLimit, priKey) {
    var args = [];
    var senderAddress = ethUtils.privateToAddress(new Buffer(priKey, "hex"));
    var senderSpec = {
        sender: Buffer.from(settingsConfig.AddressPrefix + senderAddress.toString("hex")),
        counter: Long.fromString(counter.toString()),
        ink_limit: Buffer.from(inkLimit),
        msg: Buffer.from(msg)
    };
    args.push(Buffer.from(fcn ? fcn : 'invoke', 'utf8'));
    for (var i=0; i<arg.length; i++) {
        args.push(Buffer.from(arg[i], 'utf8'));
    }
    var invokeSpec = {
        type: _ccProto.ChaincodeSpec.Type.GOLANG,
        chaincode_id: {
            name: ccId
        },
        input: {
            args: args
        }
    };
    var cciSpec = new _ccProto.ChaincodeInvocationSpec();
    var signContent = new _ccProto.SignContent();
    signContent.setChaincodeSpec(invokeSpec);
    signContent.setSenderSpec(senderSpec);
    signContent.id_generation_alg = cciSpec.id_generation_alg;
    var signHash = ethUtils.sha256(signContent.toBuffer());
    var sigrsv = ethUtils.ecsign(signHash, new Buffer(priKey, "hex"));

    return Buffer.concat([
        ethUtils.setLengthLeft(sigrsv.r, 32),
        ethUtils.setLengthLeft(sigrsv.s, 32),
        ethUtils.toBuffer(sigrsv.v - 27)
    ]).toString("hex");
};

module.exports.createAccount = createAccount;
module.exports.publicKeyFromPrivate = publicKeyFromPrivate;
module.exports.signTX = signTX;
