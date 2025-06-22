const { ethers, upgrades } = require('hardhat');

async function main() {
    const [admin] = await ethers.getSigners();

    const RemixerV1 = await ethers.getContractFactory('RemixerV1');
    const proxy = await upgrades.deployProxy(RemixerV1, [admin.address]);
    await proxy.waitForDeployment();

    const proxyAddress = await proxy.getAddress();
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(
        proxyAddress
    );

    console.log('Proxy contract address: ' + proxyAddress);
    console.log('Implementation contract address: ' + implementationAddress);
}

main();