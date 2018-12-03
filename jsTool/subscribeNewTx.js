
Web3 = require('web3');
var httpW3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/af6a8f666b5146a4a8735a48d6a1ad31"));
var web3 = new Web3('wss://mainnet.infura.io/_ws');



async function doWhale() {
    var subscription = web3.eth.subscribe('pendingTransactions', function (error, result) {})
    .on("data", async function (transactionHash) {
        //console.log(transactionHash)
        tx = await httpW3.eth.getTransaction(transactionHash)

        if (tx) {
            //do things here
            console.log("from : ", tx.from, " to: ", tx.to)
        }
            
    })
} 



doWhale()


