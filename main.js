const fs = require('fs');
const axios = require('axios');
const chalk = require('chalk');
const { ethers } = require('ethers');
const { faker } = require('@faker-js/faker');

const privateKeys = readPrivateKeysFromFile('data.txt');
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function readPrivateKeysFromFile(filePath) {
    const data = fs.readFileSync(filePath, 'utf-8');
    return data.split('\n').filter(line => line.trim() !== '');
}

function getAddressFromPrivateKey(privateKey) {
    const wallet = new ethers.Wallet(privateKey);
    return wallet.address;
}

function signMessage(privateKey, message) {
    const wallet = new ethers.Wallet(privateKey);
    return wallet.signMessage(message);
}

function generateRandomUserAgent() {
    const os = faker.helpers.arrayElement(['Windows NT 10.0', 'Windows NT 6.1', 'Macintosh; Intel Mac OS X', 'Linux x86_64']);
    const browser = faker.helpers.arrayElement(['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera']);
    const version = faker.helpers.arrayElement(['91.0.4472.124', '89.0.4389.82', '12.1.1', '100.0.4896.60']);
    return `Mozilla/5.0 (${os}) AppleWebKit/537.36 (KHTML, like Gecko) ${browser}/${version} Safari/537.36`;
}

async function startBot(privateKeys) {
    console.clear();
    const targetChainId = 56;

    for (let i = 0; i < privateKeys.length; i++) {
        const privateKey = privateKeys[i];
        const address = getAddressFromPrivateKey(privateKey);

        const userAgent = generateRandomUserAgent();

        const headers = {
            'authority': 'api-vercel-avalon-server.avalonfinance.xyz',
            'method': 'GET',
            'scheme': 'https',
            'accept': '*/*',
            'accept-encoding': 'gzip, deflate, br, zstd',
            'accept-language': 'id-ID,id;q=0.9',
            'cookie': 'cf_clearance=HN.8h6kC036Y0UEnNPcZ0FdLLYMuJihLnWq02Q_Xj5Y-1738684515-1.2.1.1-U2oyqhDNXTySVv9LMLszWsl63v84MWElOiQASxCJdy3Y0WD4zq13beYg7nRR9tJyUytteLykc8XVFJ6p876bE6yTkkATtCkTA98mZ9deiA0FnsBlioOF5pHHG1oQVMOCRypMSyxuxdjJKSfBxMYHStGiGbTbI7m4u5YiRzcPY5yDsoQbtvjV2dBmFALNUqqiC4xsggEpGJDap_4niTHqguKKr5xyhGOPoxiQu82f1yZJ3gL7pa9OtmtQV6mXDe4QUNq5BKPYuo4DN2zCqSHUsZKotJFrvQm4ZXlHW02F6jE',
            'origin': 'https://avl.avalonfinance.xyz',
            'priority': 'u=1, i',
            'referer': 'https://avl.avalonfinance.xyz/',
            'sec-ch-ua': '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'user-agent': userAgent,
            'x-api-key': 'rose-lobster-help-fix'
        };

        try {
            const responseGet = await axios.get(`https://api-vercel-avalon-server.avalonfinance.xyz/airdrop/address/get?account=${address}`, { headers });
        } catch (error) {
            console.error("Error saat mengambil data:", error.response ? error.response.data : error.message);
        }

        const message = `Set airdrop address: ${address} on chain ${targetChainId}`;
        const signature = await signMessage(privateKey, message);

        const dataPost = {
            source_address: address,
            target_address: address,
            target_chain_id: targetChainId,
            signature: signature
        };

        try {
            const responsePost = await axios.post('https://api-vercel-avalon-server.avalonfinance.xyz/airdrop/address/set', dataPost, { headers });
            if (responsePost.data && responsePost.data.message === 'Airdrop address set successfully') {
                console.log(chalk.green(`Akun ke-${i + 1} ${address}: Success`));
            } else {
                console.log(chalk.red(`Akun ke-${i + 1} ${address} : Gagal - ${responsePost.data.message || 'Unknown error'}`));
            }
        } catch (error) {
            console.error(`Error saat mengatur alamat airdrop untuk private key ke-${i + 1} dengan alamat ${address}:`, error.response ? error.response.data : error.message);
        }

        console.log();
        await delay(10000);
    }
}

startBot(privateKeys);
