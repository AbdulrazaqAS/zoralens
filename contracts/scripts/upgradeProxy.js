const { ethers, upgrades } = require('hardhat');

const proxyAddress = '0x4113a9ce25693bb45ac21155c1fdb9309e259e81';

async function main() {
    const RemixerV2 = await ethers.getContractFactory('RemixerV2');
    const upgraded = await upgrades.upgradeProxy(proxyAddress, RemixerV2);
    await upgraded.waitForDeployment();

    console.log('Proxy contract upgraded successfully!');
}

main();