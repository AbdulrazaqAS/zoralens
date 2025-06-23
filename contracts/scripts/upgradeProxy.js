const { ethers, upgrades } = require('hardhat');

const proxyAddress = '0xc5B77F18d6488D86d99F9A68fC79eA4230BA62d6';

async function main() {
    const RemixerV2 = await ethers.getContractFactory('RemixerV2');
    const upgraded = await upgrades.upgradeProxy(proxyAddress, RemixerV2);
    await upgraded.waitForDeployment();

    console.log('Proxy contract upgraded successfully!');
}

main();