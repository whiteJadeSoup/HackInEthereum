

const util = require('ethereumjs-util');
const rlp = require('rlp');
const generate = require('ethjs-account').generate;



seed = '892h@fsdf11ks8sk^2h8s8shfs.jk39hsoi@hohskd'
flag = false


function fuzz() {

	while (flag == false) {
		seed = seed + Math.random().toString(36).substring(12);

		res = generate(seed)

		for(var i = 0; i < 50; i++) {
		    encodeRlp = rlp.encode([res.address, i]);
		    buf = util.sha3(encodeRlp)
		    contract_addr = buf.slice(12).toString('hex');

		    if (contract_addr.match("000000")) {
		        console.log(res);
			console.log(i);
			flag = true;
			return;
		    }
		}

	}
}




function generateAddr () {
	while (flag == false) {
		seed = seed + Math.random().toString(36).substring(12);

		res = generate(seed)

		if (res.address.match("000000")) {
			console.log("found!!-----");
			console.log("private key: --" + res.privateKey);
			console.log("address: --" + res.address);
			break;
		}
	}	
}


generateAddr();

