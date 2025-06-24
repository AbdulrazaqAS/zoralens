const { ethers, upgrades } = require('hardhat');
require("dotenv").config();

async function main() {
    const [admin] = await ethers.getSigners();
    const coinsFactory = process.env.CoinsFactory;
    const splitFactory = process.env.PullSplitFactory;

    const RemixerV1 = await ethers.getContractFactory('RemixerV1');
    const proxy = await upgrades.deployProxy(RemixerV1, [admin.address, coinsFactory, splitFactory]);
    await proxy.waitForDeployment();

    const proxyAddress = await proxy.getAddress();
    console.log('Proxy contract address: ' + proxyAddress);
}

main();