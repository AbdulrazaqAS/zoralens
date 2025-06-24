// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

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

interface IZoraCoinV4 {
    //function setPayoutRecipient(address newPayoutRecipient) external;
    function burn(uint256 amount) external;
    function setContractURI(string memory newURI) external;
}

interface SplitsWallet {
    function updateSplit(Split calldata _split) external;
}

contract RemixerV1 is Initializable, OwnableUpgradeable {
    struct CoinData {
        bool exist;
        address parent;
        address splitsAddress;
        address[] owners;
        uint16 revenueShare;
        uint16 revenueStack;
        uint256 descendants;
    }
    
    uint256 public constant TOTAL_ALLOCATION = 100000;
    uint256 public constant DISTRIBUTOR_INCENTIVE = 500;  // 0.5% of TOTAL_ALLOCATION
    
    IZoraFactory public immutable COINS_FACTORY;
    ISplitv2Factory public immutable SPLITS_FACTORY;

    uint256 public totalCoins;
    mapping(address coin => CoinData) public coins;

    event CoinAdded(address indexed coin);
    event CoinRemixed(address indexed parent, address indexed child);

    error NotACoinOwner(address coin, address owner);
    error CoinNotExist(address coin);

    modifier onlyCoinOwners(address coin) {
        if (!isCoinOwner(coin, msg.sender))
            revert NotACoinOwner(coin, msg.sender);
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address owner, address _coinsFactory, address _splitFactory) external initializer {
        __Ownable_init(owner);
        COINS_FACTORY = IZoraFactory(_coinsFactory);
        SPLITS_FACTORY = ISplitv2Factory(_splitFactory);
    }
    
    function _createSplit(
        address[] memory recipients,
        uint256[] memory allocations,
    ) internal returns (address) {
        Split memory split = Split(
            recipients,
            allocations,
            TOTAL_ALLOCATION,
            DISTRIBUTOR_INCENTIVE
        );

        address splitAddress = SPLITS_FACTORY.createSplit(split, address(this), address(this));
        return splitAddress;
    }

    function _deployCoin(
        address payoutRecipient,
        string memory uri,
        string memory name,
        string memory symbol,
        bytes32 coinSalt
    ) internal returns (address) {
        address[] memory owners = new address[](1);
        owners[0] = address(this);

        address coin = COINS_FACTORY.deploy(
            payoutRecipient,
            owners,
            uri,
            name,
            symbol,
            "",
            address(this),
            "",
            "",
            coinSalt
        );
        
        return coin;
    }
    
    // New/root coins have an address as payout recipient not a split contract
    function remixCoin(address _parent, address _payoutRecipient, uint16 _revenueShare, address[] memory _owners) external {
        _checkCoinExist(_parent);
        CoinData storage parentCoin = coins[_parent];
        uint16 revenueStack = parentCoin.revenueStack + parentCoin.revenueShare;
        
        address[] recipients = new address[](2);
        recipients[0] = _payoutRecipient;
        recipients[1] = parentCoin.payoutRecipient;
        
        uint256[] allocations = new uint256[](2);
        allocations[0] = ;
        allocations[1] = revenueStack;
        
        address split = _createSplit(recipients, allocations);
        address coin = _deployCoin();
        
        
        CoinData memory data = CoinData({
            exist: true,
            parent: address(0),  // address zero as parent indicates coin is root not remix
            splitsAddress: _payoutRecipient,
            owners: _owners,
            revenueShare: _revenueShare,
            revenueStack: 0,  // zero for new coin
            descendants: 0
        });

        coins[_coin] = data;
        totalCoins++;

        emit CoinAdded(_coin);
    }

    // New/root coins have an address as payout recipient not a split contract
    function addRemix(address _parent, address _child, address _splitsAddress, uint16 _revenueShare, address[] memory _owners) external {
        _checkCoinExist(_parent);
        CoinData storage parentCoin = coins[_parent];
        uint16 revenueStack = parentCoin.revenueStack + parentCoin.revenueShare;
        
        CoinData memory data = CoinData({
            exist: true,
            parent: _parent,
            splitsAddress: _splitsAddress,
            owners: _owners,
            revenueShare: _revenueShare,
            revenueStack: revenueStack,
            descendants: 0
        });

        coins[_child] = data;
        totalCoins++;
        parentCoin.descendants++;

        emit CoinRemixed(_parent, _child);
    }

    // New/root coins have an address as payout recipient not a split contract
    function addCoin(address _coin, address _payoutRecipient, uint16 _revenueShare, address[] memory _owners) external {
        CoinData memory data = CoinData({
            exist: true,
            parent: address(0),  // address zero as parent indicates coin is root not remix
            splitsAddress: _payoutRecipient,
            owners: _owners,
            revenueShare: _revenueShare,
            revenueStack: 0,  // zero for new coin
            descendants: 0
        });

        coins[_coin] = data;
        totalCoins++;

        emit CoinAdded(_coin);
    }

    // New/root coins have an address as payout recipient not a split contract
    function addRemix(address _parent, address _child, address _splitsAddress, uint16 _revenueShare, address[] memory _owners) external {
        _checkCoinExist(_parent);
        CoinData storage parentCoin = coins[_parent];
        uint16 revenueStack = parentCoin.revenueStack + parentCoin.revenueShare;
        
        CoinData memory data = CoinData({
            exist: true,
            parent: _parent,
            splitsAddress: _splitsAddress,
            owners: _owners,
            revenueShare: _revenueShare,
            revenueStack: revenueStack,
            descendants: 0
        });

        coins[_child] = data;
        totalCoins++;
        parentCoin.descendants++;

        emit CoinRemixed(_parent, _child);
    }

    function setCoinUri(
        address coin,
        string memory uri
    ) external onlyCoinOwners(coin) {
        _checkCoinExist(coin);
        IZoraCoinV4 coinContract = IZoraCoinV4(coin);
        coinContract.setContractURI(uri);
    }

    function burn(address coin, uint256 amount) external onlyCoinOwners(coin) {
        _checkCoinExist(coin);
        IZoraCoinV4 coinContract = IZoraCoinV4(coin);
        coinContract.burn(amount);
    }

    // Add/remove owners
    // Change real coin owner. Maybe for transferring ownership to another contract.

    function isCoinOwner(
        address coin,
        address user
    ) public view returns (bool) {
        _checkCoinExist(coin);
        address[] memory owners = coins[coin].owners;

        for (uint8 i = 0; i < owners.length; i++) {
            if (owners[i] == user) return true;
        }

        return false;
    }

    function _checkCoinExist(address coin) internal view {
        if (!coins[coin].exist) revert CoinNotExist(coin);
    }

    // function getCoinRevenueStack(address coin) external view returns (uint16) {
    //     _checkCoinExist();
    //     return coins[coin].revenueStack;
    // }

    // function getCoinRevenueShare(address coin) external view returns (uint16) {
    //     _checkCoinExist();
    //     return coins[coin].revenueShare;
    // }

    function getCoinOwners(address coin) external view returns (address[] memory) {
        _checkCoinExist(coin);
        return coins[coin].owners;
    }
}
