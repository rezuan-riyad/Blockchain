const sha256 = require("crypto-js/sha256");
const EC = require("elliptic").ec;
var ec = new EC("secp256k1");

class Block {
  constructor(timestap, transactions, previousHash) {
    this.timestap = timestap;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  mineBlock(difficulty) {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
    ) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log("Mining Done: ", this.hash);
  }

  calculateHash() {
    return sha256(
      this.timestap +
        JSON.stringify(this.transactions) +
        this.previousHash +
        this.nonce
    ).toString();
  }

  hasValidTransation() {
    for (const tx of this.transactions) {
      if (!tx.isValid()) return false;
    }
    return true;
  }
}

class Transaction {
  constructor(from, to, amount) {
    this.from = from;
    this.to = to;
    this.amount = amount;
  }

  calculateHash() {
    return sha256(this.from + this.to + this.amount).toString();
  }

  signTransaction(signingKey) {
    if (signingKey.getPublic("hex") !== this.from) {
      throw new Error("You can not sign transaction for other wallets.");
    }

    const hashTx = this.calculateHash();
    const signature = signingKey.sign(hashTx);
    this.signature = signature.toDER("hex");
  }

  isValid() {
    if (this.from === null) return true;
    if (!this.signature || this.signature.length === 0) {
      throw new Error("No signature found.");
    }
    const publicKey = ec.keyFromPublic(this.from, "hex");
    return publicKey.verify(this.calculateHash(), this.signature);
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.generateGenesisBlock()];
    this.difficulty = 3;
    this.pendingTransactions = [];
    this.miningReward = 10;
  }
  generateGenesisBlock() {
    return new Block("2021-20-09", "GENESIS", "GENESIS_HASH");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addTransaction(transaction) {
    if (!transaction.from || !transaction.to) {
      throw new Error("Can not process transaction.");
    }
    if (!transaction.isValid()) {
      throw new Error("Invalid transaction.");
    }
    if (transaction.amount < 0) {
      throw new Error("Invalid Amount");
    }
    this.pendingTransactions.push(transaction);
  }

  minePendingTransaction(miner) {
    let block = new Block(Date.now(), this.pendingTransactions);
    block.previousHash = this.getLatestBlock().hash;
    block.mineBlock(this.difficulty);
    this.chain.push(block);
    this.pendingTransactions = [
      new Transaction(null, miner),
      this.miningReward,
    ];
  }

  // adding new block to chain
  /*
  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
  }
  */

  isBlockchainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) return false;
      if (currentBlock.previousHash !== previousBlock.hash) return false;
      if (!currentBlock.hasValidTransation()) return false;
    }
    return true;
  }

  getBalanceOfAddress(address) {
    let balance = 0;
    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.from === address) balance -= trans.amount;
        if (trans.to === address) balance += trans.amount;
      }
    }
    return balance;
  }
}

module.exports = {
  Block,
  Transaction,
  Blockchain,
};
