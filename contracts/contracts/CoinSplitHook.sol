// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

//import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

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
    )
        external
        payable
        returns (address coin, bytes memory postDeployHookDataOut);
}

interface IZoraCoin {
    function setPayoutRecipient(address newPayoutRecipient) external;
}

struct Split {
    address[] recipients;
    uint256[] allocations;
    uint256 totalAllocation;
    uint16 distributionIncentive;
}

interface ISplitv2Factory {
    /**
     *      * @notice Predict the address of a new split based on the nonce of the hash of the params and owner.
     * @param _splitParams Params to create split with.
     * @param _owner Owner of created split.
     */
    function predictDeterministicAddress(
        Split calldata _splitParams,
        address _owner
    ) external view returns (address);

    /**
     *      * @notice Create a new split with params and owner.
     * @dev Uses a hash-based incrementing nonce over params and owner.
     * @dev designed to be used with integrating contracts to avoid salt management and needing to handle the potential
     * for griefing via front-running. See docs for more information.
     * @param _splitParams Params to create split with.
     * @param _owner Owner of created split.
     * @param _creator Creator of created split.
     */
    function createSplit(
        Split calldata _splitParams,
        address _owner,
        address _creator
    ) external returns (address split);
}

contract CoinRemixer {
    IZoraFactory public immutable COINS_FACTORY;
    ISplitv2Factory public immutable SPLITS;
    address public coinSplitHook;

    constructor(address _coinsFactory, address _splitFactory, address _coinSplitHook) {
        COINS_FACTORY = IZoraFactory(_coinsFactory);
        SPLITS = ISplitv2Factory(_splitFactory);
        coinSplitHook = _coinSplitHook;
    }

    function deploy(
        address parentPayoutRecipient,
        address payoutRecipient,
        string memory uri,
        string memory name,
        string memory symbol,
        bytes memory poolConfig,
        bytes32 coinSalt
    ) external {
        // Split memory split = Split(
        //     [parentPayoutRecipient, payoutRecipient],
        //     [10_00, 90_00],
        //     100_00,
        //     30 // 
        // );
        // address splitAddress = SPLITS.predictDeterministicAddress(split, address(this));
        address[] memory owners = new address[](1);
        owners[0] = address(this);

        COINS_FACTORY.deploy(
            address(this),
            owners,
            uri,
            name,
            symbol,
            poolConfig,
            address(this),
            coinSplitHook,
            "",
            coinSalt
        );
    }
}

contract CoinSplitHook {
    ISplitv2Factory public immutable splits;

    constructor(address _splitFactory) {
        splits = ISplitv2Factory(_splitFactory);
    }

    // Called after the coin deploy; factory provides encoded data
    function afterDeploy(bytes calldata data) external {
        (
            address parentPayoutRecipient,
            address childPayoutRecipient,
            address splitOwner,
            address spliCreator,
            uint256 parentSharePct,
            uint256 childSharePct,
            uint16 distributionIncentive
        ) = abi.decode(
                data,
                (address, address, address, address, uint256, uint256, uint16)
            );

        uint256 totalAllocation = parentSharePct + childSharePct;
        require(totalAllocation == 100_000, "Shares must sum to 100%");

        address[] memory recipients = new address[](2);
        recipients[0] = parentPayoutRecipient;
        recipients[1] = childPayoutRecipient;

        uint256[] memory allocations = new uint256[](2);
        allocations[0] = parentSharePct;
        allocations[1] = childSharePct;

        // deploy a fixed Split contract
        Split memory split = Split(
            recipients,
            allocations,
            totalAllocation,
            distributionIncentive
        );

        address splitAddress = splits.createSplit(split, splitOwner, spliCreator);
        return splitAddress;
        // configure the new coin to pay through the split
        //IZoraFactory(msg.sender).configurePayout(newCoin, splitAddress);
    }
}