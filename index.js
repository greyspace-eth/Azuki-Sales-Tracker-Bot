require('dotenv').config();
const eth_api_key = process.env.eth_api_key;
const eth_web_socket = process.env.eth_web_socket;
const axios = require('axios');
const Web3 = require('web3');
const provider = new Web3.providers.WebsocketProvider(eth_web_socket,{clientConfig:{maxReceivedFrameSize: 10000000000,maxReceivedMessageSize: 10000000000,}});
const web3 = new Web3(provider);

const ERC1155_TRANSFER_TOPIC_SIGNATURE = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
const AZUKI_CONTRACT_ADDRESS = '0xed5af388653567af2f388e6224dc7c4b3241c544';
let exchanges = [
    {
        contract_address: '0x000000000000ad05ccc4f10045630fb830b95127',
        name: 'Blur io'
    },
    {
        contract_address: '0x74312363e45DCaBA76c59ec49a7Aa8A65a67EeD3',
        name: 'x2xy io'
    },
    {
        contract_address: '0x00000000006c3852cbef3e08e8df289169ede581', //0x00000000006c3852cbEf3e08E8dF289169EdE581
        name: 'Opensea'
    },
    {
        contract_address: '0x59728544B08AB483533076417FbBB2fD0B17CE3a',
        name: 'Looksrare'
    }
]

// NOTES:
// topic[0] = method in hex signature
// topic[1] = input parameters
// topic[2] = input parameters
// .data = value

async function getTransactionInformation(transactionhash){ 
    //three types of NFT transfer, if this topics in logs are detected, means nft transfers detected
    var transaction = await web3.eth.getTransactionReceipt(transactionhash);
    var transaction2 = await web3.eth.getTransaction(transactionhash);
    let amountSoldForInEther;
    var name_nftId;
    var soldToAddress;
    var imgUrl;
    var attributes;
    for (var logNo = 0; logNo < transaction.logs.length; logNo++){
        const firstTopic = transaction.logs[logNo].topics[0] //view the first Topic in each logs in the transaction
        const logsContractAddress = transaction.logs[logNo].address //get the log's addresses to compare
        if(firstTopic === ERC1155_TRANSFER_TOPIC_SIGNATURE){ //transfer method
            console.log('this is the transaction receipt: ',transaction);
            console.log('this is the transaction : ',transaction2);
            console.log('this is log no :', logNo);
            console.log('this is log information',transaction.logs[logNo]);
            if(logsContractAddress.toLowerCase() === AZUKI_CONTRACT_ADDRESS.toLowerCase()){
                console.log('trans hash ',transactionhash);
                soldToAddress = transaction.to.toLowerCase();
                const tokenIndex = transaction.logs[logNo].topics[3]
                var reqUrl = 'https://api.etherscan.io/api?module=contract&action=getabi&address='+ AZUKI_CONTRACT_ADDRESS +'&apikey='+ eth_api_key;
                var response = await axios.get(reqUrl);
                if(response.data.status === 1 || response.data.status === '1'){
                    var contractABI = JSON.parse(response.data.result);
                    var nftCon = await new web3.eth.Contract(contractABI, AZUKI_CONTRACT_ADDRESS);
                    try{
                        var nftId = await nftCon.methods.tokenByIndex(tokenIndex).call(); 
                        var nftUri = await nftCon.methods.tokenURI(nftId).call(); 
                        var ipfsUrl = `https://alchemy.mypinata.cloud/ipfs/${nftUri.substring(7)}`; //get metadata
                        var nftMetaData = await axios.get(ipfsUrl);
                        if(nftMetaData.status === 200 || nftMetaData.status === '200'){
                            imgUrl = `https://alchemy.mypinata.cloud/ipfs/${nftMetaData.data.image.substring(7)}`;
                            name_nftId = nftMetaData.data.name;
                            attributes = nftMetaData.data.attributes;
                        }
                    }catch(err){
                            console.log('cant get method : ',err);
                    }
                }else{
                    console.log('response not success');
                }
            }
            else{ // same Transfer method topic, but this is value of the nft sold
                if(transaction.logs[logNo].data.toLowerCase() != '0x'){
                    var amountSoldForInWei = await web3.eth.abi.decodeParameter('uint256',transaction.logs[logNo].data);
                    amountSoldForInEther += parseFloat(Web3.utils.fromWei(amountSoldForInWei,'ether'));
                }
            }
            if(logsContractAddress.toLowerCase() === AZUKI_CONTRACT_ADDRESS.toLowerCase()){
                for(let i=0;i<exchanges.length;i++){
                    if(soldToAddress===exchanges[i].contract_address){
                        console.log(name_nftId,' sold for ',Math.trunc(amountSoldForInEther*Math.pow(10, 2))/Math.pow(10, 2), ' on ', exchanges[i].name,);
                        break;
                    }else{
                        console.log(name_nftId,' sold for ',Math.trunc(amountSoldForInEther*Math.pow(10, 2))/Math.pow(10, 2), ' on ', soldToAddress,);
                        break;
                    }
                }
                console.log('imgurl : ',imgUrl);
                console.log('attributes : ',attributes);
            }
        }
    } 
    // after the log come out calculate and send 
}

    //ws to receive new token information (new blockheaders)
    const scan_newblock = web3.eth.subscribe('newBlockHeaders'); //this is listening to new blocks mined on the blockchain
    scan_newblock.on("error ", console.error);
    scan_newblock.on("data", async function(blockHeader){
    var block = await web3.eth.getBlock(blockHeader.hash);
    var transactions = block.transactions;
    for (var tIndex = 0; tIndex < transactions.length; tIndex++){
        var transactionhash = transactions[tIndex];
        await getTransactionInformation(transactionhash); 
    }
    });
