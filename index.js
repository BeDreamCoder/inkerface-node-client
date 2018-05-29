var sign = require('./src/sign');

var account = sign.createAccount();
console.log("account: ", account);

var pubkey = sign.publicKeyFromPrivate(account.private_key);
console.log("pubkey: ", pubkey);

var sig = sign.signTX("token", "transfer", ["i3c97f146e8de9807ef723538521fcecd5f64c79a", "INK", "1000"],
    "test", 0, "100000000000", 'bab0c1204b2e7f344f9d1fbe8ad978d5355e32b8fa45b10b600d64ca970e0dc9"}');
console.log("sign: ", sig);