
Web3 = require('web3');
web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/af6a8f666b5146a4a8735a48d6a1ad31"));

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

    const abi = [
        {
            "constant": false,
            "inputs": [
                {
                    "name": "owner_",
                    "type": "address"
                }
            ],
            "name": "setOwner",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "src",
                    "type": "address"
                },
                {
                    "name": "dst",
                    "type": "address"
                },
                {
                    "name": "sig",
                    "type": "bytes32"
                }
            ],
            "name": "forbid",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "src",
                    "type": "bytes32"
                },
                {
                    "name": "dst",
                    "type": "bytes32"
                },
                {
                    "name": "sig",
                    "type": "bytes32"
                }
            ],
            "name": "forbid",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "authority_",
                    "type": "address"
                }
            ],
            "name": "setAuthority",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "owner",
            "outputs": [
                {
                    "name": "",
                    "type": "address"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "ANY",
            "outputs": [
                {
                    "name": "",
                    "type": "bytes32"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "src_",
                    "type": "address"
                },
                {
                    "name": "dst_",
                    "type": "address"
                },
                {
                    "name": "sig",
                    "type": "bytes4"
                }
            ],
            "name": "canCall",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "authority",
            "outputs": [
                {
                    "name": "",
                    "type": "address"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "src",
                    "type": "address"
                },
                {
                    "name": "dst",
                    "type": "address"
                },
                {
                    "name": "sig",
                    "type": "bytes32"
                }
            ],
            "name": "permit",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "src",
                    "type": "bytes32"
                },
                {
                    "name": "dst",
                    "type": "bytes32"
                },
                {
                    "name": "sig",
                    "type": "bytes32"
                }
            ],
            "name": "permit",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "src",
                    "type": "bytes32"
                },
                {
                    "indexed": true,
                    "name": "dst",
                    "type": "bytes32"
                },
                {
                    "indexed": true,
                    "name": "sig",
                    "type": "bytes32"
                }
            ],
            "name": "LogPermit",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "src",
                    "type": "bytes32"
                },
                {
                    "indexed": true,
                    "name": "dst",
                    "type": "bytes32"
                },
                {
                    "indexed": true,
                    "name": "sig",
                    "type": "bytes32"
                }
            ],
            "name": "LogForbid",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "authority",
                    "type": "address"
                }
            ],
            "name": "LogSetAuthority",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "owner",
                    "type": "address"
                }
            ],
            "name": "LogSetOwner",
            "type": "event"
        }
    ];

    const exploit_addr = '0x315cBb88168396D12e1a255f9Cb935408fe80710';
    var my_contract = new web3.eth.Contract(abi, exploit_addr);
    
    // my_contract.getPastEvents('LogPermit', {
    //    fromBlock: 4752020,
    //    toBlock: 'latest'
    // }, function(error, events){ if (!error) {console.log("len:" + events.length + events)} else console.log(error); })
    // .then(function(events){
    //    console.log(events) // same results as the optional callback above
    // });
    const events = await my_contract.getPastEvents('LogPermit', {
        fromBlock: 	4752020,
        toBlock: 'latest'});

    console.log(events);

} 

doWhale();