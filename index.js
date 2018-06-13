var sign = require('./src/sign');

var account = sign.createAccount();
console.log("account: ", account);

var address = sign.addressFromPrivateKey(account.private_key);
console.log("address: ", address);

console.log("isValidAddress: ", sign.isValidAddress("i3c97f146e8de9807ef723538521fcecd5f64c79a"));
console.log("isValidPrivate: ", sign.isValidPrivate('bab0c1204b2e7f344f9d1fbe8ad978d5355e32b8fa45b10b600d64ca970e0dc9'));

var sig = sign.signTX("token", "transfer", ["i3c97f146e8de9807ef723538521fcecd5f64c79a", "INK", "1000"],
    "test", 1, "100000000000", 'bab0c1204b2e7f344f9d1fbe8ad978d5355e32b8fa45b10b600d64ca970e0dc9');
console.log("sign: ", sig);