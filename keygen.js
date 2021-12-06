const EC = require("elliptic").ec;
var ec = new EC("secp256k1");

var key = ec.genKeyPair();

const privateKey = key.getPrivate("hex");
const publicKey = key.getPublic("hex");
