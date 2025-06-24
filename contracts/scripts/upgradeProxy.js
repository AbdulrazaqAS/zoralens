const { ethers, upgrades } = require('hardhat');

const proxyAddress = '0xf34f5A0044BCdBe38B1E5a74ED412302c8e24fb0';

async function main() {
    const RemixerV2 = await ethers.getContractFactory('RemixerV2');
    const upgraded = await upgrades.upgradeProxy(proxyAddress, RemixerV2);
    await upgraded.waitForDeployment();

    console.log('Proxy contract upgraded successfully!');
}

main();