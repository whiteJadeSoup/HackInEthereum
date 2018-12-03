const ethTx = require('ethereumjs-tx');

const txData = {
  nonce: 78,
  gasPrice: '0x020eaa8c7a',
  gasLimit: '0x07a120',
  to: "0x003be5Df5FeF651EF0C59cD175c73ca1415f53eA",
  value: '0x853a0d2313c0000',
  data: '0x',
  v: 41, // Ethereum mainnet chainID
  r: 0,
  s: 0
};

tx = new ethTx(txData);
console.log('RLP-Encoded Tx: 0x' + tx.serialize().toString('hex'))

txHash = tx.hash(); // This step encodes into RLP and calculates the hash
console.log('Tx Hash: 0x' + txHash.toString('hex'))

// Sign transaction
const privKey = Buffer.from(
    '614f5e36cd55ddab0947d1723693fef5456e5bee24738ba90bd33c0c6e68e269', 'hex');
tx.sign(privKey);

serializedTx = tx.serialize();
rawTx = 'Signed Raw Transaction: 0x' + serializedTx.toString('hex');
console.log(rawTx)
