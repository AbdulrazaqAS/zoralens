interface IZoraFactory {
    function deploy(
            address payoutRecipient,
                address[] memory owners,
                    string memory uri,
                        string memory name,
                            string memory symbol,
                                bytes memory poolConfig,
                                    address platformReferrer,
                                        address postDeployHook,
                                            bytes calldata postDeployHookData,
                                                bytes32 coinSalt
    ) external payable returns (address coin, bytes memory postDeployHookDataOut);
}

interface ISplitWareHouse {

}