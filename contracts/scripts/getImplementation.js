const { upgrades } = require('hardhat');

const proxyAddress = '0x4113a9ce25693bb45ac21155c1fdb9309e259e81';

async function main() {
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(
        proxyAddress
    );

    console.log('Implementation contract address: ' + implementationAddress);
}

main();