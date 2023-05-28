const Web3 = require('web3');

const ZKSYNC_ERA_URL = "https://mainnet.era.zksync.io"
const web3 = new Web3(ZKSYNC_ERA_URL);

const privateFile = 'private.txt'
const fs = require('fs');
const pdata = fs.readFileSync(privateFile, 'utf8');
const pdata_array = pdata.split("\n");
const wallet_keys = pdata_array.filter(Boolean)

const tokens = [
    '0x0e97c7a0f8b2c9885c8ac9fc6136e829cbc21d42',
    '0x3355df6d4c9c3035724fd0e3914de96a5a83aaf4',
    '0x47260090ce5e83454d5f05a0abbb2c953835f777',
    '0xd0ea21ba66b67be636de1ec4bd9696eb8c61e9aa',
    '0x533b5f887383196c6bc642f83338a69596465307',
    '0x2039bb4116b4efc145ec4f0e2ea75012d6c0f181',
    '0x8e86e46278518efc1c5ced245cba2c7e3ef11557',
    '0x503234f203fc7eb888eec8513210612a43cf6115',
    '0x6068ad384b4d330d4de77f47041885956c9f32a3',
    '0x28a487240e4d45cff4a2980d334cc933b7483842',
    '0x7400793aad94c8ca801aa036357d10f5fd0ce08f',
    '0x6a5279e99ca7786fb13f827fc1fb4f61684933d6',
    '0x85d84c774cf8e9ff85342684b0e795df72a24908',
    '0xbfb4b5616044eded03e5b1ad75141f0d9cb1499b',
    '0x2b64237277c605d07f17b96f9627712340c32981',
    '0xfc7e56298657b002b3e656400e746b7212912757',
    '0xc8ec5b0627c794de0e4ea5d97ad9a556b361d243',
    '0x5e38cb3e6c0faafaa5c32c482864fcef5a0660ad',
    '0x5aea5775959fbc2557cc8789bc1bf90a239d9a91'
    //'0xa59af353e423f54d47f2ce5f85e3e265d95282cd'
    ]
function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandom(min, max) {
    const num = Math.floor(Math.random() * (max - min + 1)) + min; // 随机生成 min 到 max 的整数
    return num; 
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function deleteLineWithContentSync(filepath, content) {
    // 同步读取文件内容
    let data;
    try {
      data = fs.readFileSync(filepath, 'utf8');
    } catch (err) {
      throw err;
    }
  
    // 将文件内容按行分割为数组
    const lines = data.split('\n');
  
    // 查找包含指定内容的行号
    const lineIndex = lines.findIndex(line => line.includes(content));
  
    if (lineIndex !== -1) {
      // 删除包含指定内容的行
      lines.splice(lineIndex, 1);
  
      // 将剩余行重新组合成一个字符串
      const newContent = lines.join('\n');
  
      // 同步写入新的文件内容
      try {
        fs.writeFileSync(filepath, newContent, 'utf8');
        console.log(`删除成功！🍺`);
      } catch (err) {
        throw err;
      }
    } else {
      console.log(`删除失败！❌`);
    }
  }

async function randomApprove(index, accountAddress, privateKey) {
    console.log(index, `钱包地址: ${accountAddress}`)
    const syncswapRouterAddr = "0x2da10a1e27bf85cedd8ffb1abbe97e53391c0295"
    // 修改区
    const etherValue = '0'
    let gaslimit = getRandom(1000000, 1010000)
    let to = getRandomElement(tokens)
    let inputData = "0x095ea7b3"
    inputData += "0000000000000000000000002da10a1e27bf85cedd8ffb1abbe97e53391c0295"
    inputData += "0000000000000000000000000000000000000000000000000000000000000001"


    let gasPrice= await web3.eth.getGasPrice()
    let tx = {
        from: accountAddress,
        to: to,
        value: web3.utils.toWei(etherValue, 'ether'),
        gas: gaslimit,
        gasPrice: gasPrice,
        nonce: await web3.eth.getTransactionCount(accountAddress),
        data: inputData,
        chainId: 324,
        //type: 2,
    };
    let gasEstimate = await web3.eth.estimateGas(tx)
    let gas_fee = gasEstimate * gasPrice
    let eth_fee = web3.utils.fromWei(gas_fee.toString(), 'ether')
    let eth_price = 1800 // 1800U
    let usd_fee = eth_price * eth_fee
    console.log(`预估 gas fee: ${eth_fee} ETH, ${usd_fee} USD`);

    const signed_tx = await web3.eth.accounts.signTransaction(tx, privateKey);
    const tx_receipt = await web3.eth.sendSignedTransaction(signed_tx.rawTransaction);
    console.log('交易已发送，交易哈希值：', `https://explorer.zksync.io/tx/${tx_receipt.transactionHash}`);
    //deleteLineWithContentSync(privateFile, privateKey)
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }

async function runRandomized(){
    const shuffledKeys = shuffle(wallet_keys);
    const executedAddresses = [];
  
    for(var i = 0; i < shuffledKeys.length; i++){
      const accountAddress = web3.eth.accounts.privateKeyToAccount(shuffledKeys[i]).address;
      if(executedAddresses.indexOf(accountAddress) === -1){
        randomApprove(i, accountAddress, shuffledKeys[i]);
        executedAddresses.push(accountAddress);
      }
      await sleep(10*1000)
    }
}

runRandomized()
