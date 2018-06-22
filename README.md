# web3-ssl-ext-lib
Enable to use SSL web.js for ethereum.

## Pre required - Test Node
ethereum client that is modified to accept https 

or

https proxy server for ethereum client

## Dependancy
web3.js 1.0.0-X 

## Install 
```bash
npm install web3-ssl-ext-lib
```

## Use
```javascript
const fs = require('fs');

var Web3 = require('web3');
var httpsProvider = require('web3-ssl-ext-lib');

var key = fs.readFileSync('ssl/client.key'); // client tls key
var cert = fs.readFileSync('ssl/client.crt'); // client tls certificate
var ca = fs.readFileSync('ssl/rootca.crt'); // root ca certificate for server tls authentication
var rejectUnauthorized = true; // If false, ignore server cert verification 

var web3 = new Web3(new httpsProvider('https://localhost:8545/',key ,cert, ca, rejectUnauthorized));

// get Accounts
web3.eth.getAccounts(function(error, result){
    if(!error)
        console.log("Accounts: ", JSON.stringify(result));
    else
        console.error("Accounts Error: ", error);
});
```

