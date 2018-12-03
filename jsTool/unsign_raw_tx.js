

const {unsign} = require('@warren-bank/ethereumjs-tx-sign')


const raw_tx = Buffer.from(
'f87080843b9aca0083015f90946b477781b0e68031109f21887e6b5afeaaeb002b808c5468616e6b732c206d616e2129a0a5522718c0f95dde27f0827f55de836342ceda594d20458523dd71a539d52ad7a05710e64311d481764b5ae8ca691b05d14054782c7d489f3511a7abf2f5078962', 'hex')

let {txData, msgHash, signature, publicKey} = unsign(raw_tx)

console.log('msgHash: ' + msgHash)
console.log('pk: ' + publicKey)
