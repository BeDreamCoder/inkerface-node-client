/**
 * Created by zhangtailin on 2018/6/11.
 */

// var _ccProto = require('../protos/chaincode_pb');
// var textEncoding = require('text-encoding');
// var textEncoder = new textEncoding.TextEncoder("utf-8");
// var textDecoder = new textEncoding.TextDecoder("utf-8");
var ethUtils = require('ethereumjs-util');
var ProtoBuf = require('protobufjs');
var settingsConfig = require('./config');
var Wallet = require('./wallet').Wallet;
var Long = require('long');
var path = require('path');

var builder = ProtoBuf.loadProtoFile(path.join(__dirname + "/../protos/chaincode.proto"));
var protos = builder.build("protos");
var SignContent = protos.SignContent;

var createAccount = function () {
    Wallet.generate();
    return {"address": Wallet.getAddress(), "public_key": Wallet.getPubKey(), "private_key": Wallet.getPriKey()};
};

var addressFromPrivateKey = function (prikey) {
    var address = ethUtils.privateToAddress(Buffer.from(prikey, "hex"));
    return settingsConfig.AddressPrefix + address.toString("hex");
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
    for (var i = 0; i < arg.length; i++) {
        args.push(Buffer.from(arg[i], 'utf8'));
    }
    var invokeSpec = {
        type: protos.ChaincodeSpec.Type.GOLANG,
        chaincode_id: {
            name: ccId
        },
        input: {
            args: args
        }
    };

    var signContent = new SignContent();
    signContent.setChaincodeSpec(invokeSpec);
    signContent.setSenderSpec(senderSpec);
    var signHash = ethUtils.sha256(signContent.toBuffer());
    var sigrsv = ethUtils.ecsign(signHash, new Buffer(priKey, "hex"));

    return Buffer.concat([
        ethUtils.setLengthLeft(sigrsv.r, 32),
        ethUtils.setLengthLeft(sigrsv.s, 32),
        ethUtils.toBuffer(sigrsv.v - 27)
    ]).toString("hex");
};

var isValidAddress = function (address) {
    if (typeof address !== 'string') {
        return false;
    }
    if (address.slice(0, 1) !== settingsConfig.AddressPrefix) {
        return false;
    }
    return ethUtils.isValidAddress(ethUtils.addHexPrefix(address.slice(1)));
};

var isValidPrivate = function (prikey) {
    return ethUtils.isValidPrivate(Buffer.from(prikey, "hex"));
};

/* use google-protobuf */
// var signTX = function (ccId, fcn, arg, msg, counter, inkLimit, priKey) {
//     var args = [];
//     args.push(textEncoder.encode(fcn ? fcn : 'invoke'));
//     for (var i = 0; i < arg.length; i++) {
//         args.push(textEncoder.encode(arg[i]));
//     }
//
//     var signContent = new _ccProto.SignContent();
//
//     var senderSpec = new _ccProto.SenderSpec();
//     var senderAddress = ethUtils.privateToAddress(new Buffer(priKey, "hex"));
//     senderSpec.setSender(textEncoder.encode(settingsConfig.AddressPrefix + senderAddress.toString("hex")));
//     senderSpec.setCounter(Long.fromString(counter.toString(), true));
//     senderSpec.setInkLimit(textEncoder.encode(inkLimit));
//     senderSpec.setMsg(textEncoder.encode(msg));
//     signContent.setSenderSpec(senderSpec);
//
//     var invokeSpec = new _ccProto.ChaincodeSpec();
//     invokeSpec.setType(_ccProto.ChaincodeSpec.Type.GOLANG);
//     var chaincde_id = new _ccProto.ChaincodeID();
//     chaincde_id.setName(ccId);
//     invokeSpec.setChaincodeId(chaincde_id);
//     var input = new _ccProto.ChaincodeInput();
//     input.setArgsList(args);
//     invokeSpec.setInput(input);
//     signContent.setChaincodeSpec(invokeSpec);
//     var bytes = signContent.serializeBinary();
//     var signHash = ethUtils.sha256(textDecoder.decode(bytes));
//     var sigrsv = ethUtils.ecsign(signHash, new Buffer(priKey, "hex"));
//
//     return Buffer.concat([
//         ethUtils.setLengthLeft(sigrsv.r, 32),
//         ethUtils.setLengthLeft(sigrsv.s, 32),
//         ethUtils.toBuffer(sigrsv.v - 27)
//     ]).toString("hex");
// };

module.exports.createAccount = createAccount;
module.exports.addressFromPrivateKey = addressFromPrivateKey;
module.exports.signTX = signTX;
module.exports.isValidAddress = isValidAddress;
module.exports.isValidPrivate = isValidPrivate;
