
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



async function doNow() {
	var result = 0;
	while (result == 0) {
        const count = await web3.eth.getTransactionCount('0x003be5Df5FeF651EF0C59cD175c73ca1415f53eA');

        const privKey = Buffer.from('126d3a0efc10b7e8c6902654e26890a6d76e5e9b4d6fe7c131c97768fb5730f2', 'hex');

        
        const rawTx = signTx(generateTxData({_nonce: count, 
            _recipient: '0x1962619499c4ddc6f7a9394714a15d4c19208749',
            _data: "0x3b73a5950000000000000000000000000000000000000000000000000000000000000000"} ), privKey);
		var receipt = await web3.eth.sendSignedTransaction(rawTx);
		console.log("send rawtx: , receipt: ", rawTx, receipt)


		//send tx
		result = await web3.eth.call({ to: "0x1962619499c4ddc6f7a9394714a15d4c19208749", data: "0xb2fa1c9e" });
		result = parseInt(result);
	}
};

async function doGuess() {


    const recipient = '0xd7cfedbe9e7ca2fe55629f4aacd8d726e9bde61b';
    const count = await web3.eth.getTransactionCount('0x003be5Df5FeF651EF0C59cD175c73ca1415f53eA');
    const privKey = Buffer.from('126d3a0efc10b7e8c6902654e26890a6d76e5e9b4d6fe7c131c97768fb5730f2', 'hex');


    const rawTx1 = signTx(generateTxData({_nonce: count, 
        _recipient: recipient,
        _data: "0xd40a71fb", _value: 114505734321864704} ), privKey);
    var receipt = await web3.eth.sendSignedTransaction(rawTx1);
    console.log("send rawtx1: , receipt: ", rawTx1, receipt);


    const count1 = await web3.eth.getTransactionCount('0x003be5Df5FeF651EF0C59cD175c73ca1415f53eA');
    const rawTx2 = signTx(generateTxData({_nonce: count1, 
        _recipient: recipient,
        _data: "0x8f4ed333"} ), privKey);

    receipt = await web3.eth.sendSignedTransaction(rawTx2);
    console.log("send rawtx2: , receipt: ", rawTx2, receipt);


    const count2 = await web3.eth.getTransactionCount('0x003be5Df5FeF651EF0C59cD175c73ca1415f53eA');
    const rawTx3 = signTx(generateTxData({_nonce: count2, 
        _recipient: recipient,
        _data: "0x41c0e1b5"} ), privKey);

    receipt = await web3.eth.sendSignedTransaction(rawTx3);
    console.log("send rawtx3: , receipt: ", rawTx3, receipt);

}



async function doWhale() {
  
    const exploit_addr = '0x1691e78ae71b3a965a4f296e54cf2292135884d9';
    const privKey = Buffer.from('126d3a0efc10b7e8c6902654e26890a6d76e5e9b4d6fe7c131c97768fb5730f2', 'hex');
    
    
    const count1 = await web3.eth.getTransactionCount('0x003be5Df5FeF651EF0C59cD175c73ca1415f53eA');
    const rawTx1 = signTx(generateTxData({_nonce: count1, 
        _recipient: exploit_addr,
        _data: web3.utils.keccak256("step1()").slice(0, 10),
        _value: 1000000000000000}), privKey);

    var receipt = await web3.eth.sendSignedTransaction(rawTx1);
    console.log("send rawtx1: , receipt: ", rawTx1, receipt);


    const count2 = await web3.eth.getTransactionCount('0x003be5Df5FeF651EF0C59cD175c73ca1415f53eA');
    const rawTx2 = signTx(generateTxData({_nonce: count2, 
        _recipient: exploit_addr,
        _data: web3.utils.keccak256("step2()").slice(0, 10)}), privKey);

    receipt = await web3.eth.sendSignedTransaction(rawTx2);
    console.log("send rawtx2: , receipt: ", rawTx2, receipt);


    const count3 = await web3.eth.getTransactionCount('0x003be5Df5FeF651EF0C59cD175c73ca1415f53eA');
    const rawTx3 = signTx(generateTxData({_nonce: count3, 
        _recipient: exploit_addr,
        _data: web3.utils.keccak256("step3()").slice(0, 10) }), privKey);

    receipt = await web3.eth.sendSignedTransaction(rawTx3);
    console.log("send rawtx3: , receipt: ", rawTx3, receipt);
} 

doWhale();