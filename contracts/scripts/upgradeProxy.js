const { ethers, upgrades } = require('hardhat');

const proxyAddress = '0x039b76E8fDEE9e674257e421EAcb03eD1aE9378D';

async function main() {
    const RemixerV2 = await ethers.getContractFactory('RemixerV2');
    const upgraded = await upgrades.upgradeProxy(proxyAddress, RemixerV2);
    await upgraded.waitForDeployment();

    console.log('Proxy contract upgraded successfully!');
}

main();