const { Block, Transaction, Blockchain } = require("./index");
const EC = require("elliptic").ec;
var ec = new EC("secp256k1");

// generate keys
var key = ec.genKeyPair();
const privateKey = key.getPrivate("hex");
const walletNo = key.getPublic("hex");

const mycoin = new Blockchain();
const tx1 = new Transaction(walletNo, "randomAddress", -100);
tx1.signTransaction(key);
mycoin.addTransaction(tx1);
mycoin.minePendingTransaction(walletNo);

console.log(mycoin.getBalanceOfAddress(walletNo));
