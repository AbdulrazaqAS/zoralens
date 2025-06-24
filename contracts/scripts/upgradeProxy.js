const { ethers, upgrades } = require('hardhat');

const proxyAddress = '0x26d67A01A09ab63960bdD9A1d815c52e9BB2d93E';

async function main() {
    const RemixerV2 = await ethers.getContractFactory('RemixerV2');
    const upgraded = await upgrades.upgradeProxy(proxyAddress, RemixerV2);
    await upgraded.waitForDeployment();

    console.log('Proxy contract upgraded successfully!');
}

main();