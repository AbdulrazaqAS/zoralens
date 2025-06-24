const { upgrades } = require('hardhat');

const proxyAddress = '0x26d67A01A09ab63960bdD9A1d815c52e9BB2d93E';

async function main() {
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(
        proxyAddress
    );

    console.log('Implementation contract address: ' + implementationAddress);
}

main();