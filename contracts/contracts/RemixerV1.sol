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
    ) external returns (address);
}

interface IZoraCoinV4 {
    function setPayoutRecipient(address newPayoutRecipient) external;
    function burn(uint256 amount) external;
    function setContractURI(string memory newURI) external;
}

interface ISplitsWallet {
    struct Call {
        address to;
        uint256 value;
        bytes data;
    }

    function updateSplit(Split calldata _split) external;
    function setPaused(bool _paused) external;
    function transferOwnership(address _owner) external;

    /**
     * @notice Execute a batch of calls.
     * @dev The calls are executed in order, reverting if any of them fails. Can
     * only be called by the owner.
     * @param _calls The calls to execute
     */
    function execCalls(Call[] calldata _calls)
        external
        payable
        returns (uint256 blockNumber, bytes[] memory returnData);
}

contract RemixerV1 is Initializable, OwnableUpgradeable {
    struct CoinData {
        bool exist;
        address parent;
        address splitAddress;
        address[] owners;
        uint16 revenueShare;
        uint16 revenueStack;
        uint256 children;
    }
    
    uint256 public constant TOTAL_ALLOCATION = 100000;
    uint16 public constant DISTRIBUTOR_INCENTIVE = 500;  // 0.5% of TOTAL_ALLOCATION
    uint8 public constant MAX_OWNERS = 100; // 111 (approx 100) Zora
    
    IZoraFactory public COINS_FACTORY;
    ISplitv2Factory public SPLITS_FACTORY;

    uint256 public totalCoins;
    mapping(address coin => CoinData) public coins;

    event CoinAdded(address indexed coin);
    event CoinRemixed(address indexed parent, address child);
    event OwnerAdded(address indexed coin, address owner);
    event OwnerRemoved(address indexed coin, address owner);

    error NotACoinOwner(address coin, address owner);
    error CoinNotExist(address coin);
    error MaxOwnersReached(address coin);

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
        uint256[] memory allocations
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

        (address coin, bytes memory postDeployHookDataOut) = COINS_FACTORY.deploy(
            payoutRecipient,
            owners,
            uri,
            name,
            symbol,
            "",
            address(this),
            address(0),
            "",
            coinSalt
        );
        
        return coin;
    }
    
    function remixCoin(
        address _parent,
        address _payoutRecipient,
        address[] memory _owners,
        string memory uri,
        string memory name,
        string memory symbol,
        uint16 _revenueShare,
        bytes32 coinSalt
    ) external {
        _checkCoinExist(_parent);
        CoinData storage parentCoin = coins[_parent];
        uint16 parentRevenueShare = parentCoin.revenueStack + parentCoin.revenueShare;
        
        address[] memory recipients = new address[](2);
        recipients[0] = _payoutRecipient;
        recipients[1] = parentCoin.splitAddress;
        
        uint256[] memory allocations = new uint256[](2);
        allocations[0] = TOTAL_ALLOCATION - DISTRIBUTOR_INCENTIVE - parentRevenueShare;
        allocations[1] = parentRevenueShare;
        
        address split = _createSplit(recipients, allocations);
        address coin = _deployCoin(split, uri, name, symbol, coinSalt);
        
        CoinData memory data = CoinData({
            exist: true,
            parent: _parent,
            splitAddress: split,
            owners: _owners,
            revenueShare: _revenueShare,
            revenueStack: parentRevenueShare,
            children: 0
        });

        coins[coin] = data;
        totalCoins++;
        parentCoin.children++;

        emit CoinRemixed(_parent, coin);
    }

    function createCoin(
        address _payoutRecipient,
        address[] memory _owners,
        string memory uri,
        string memory name,
        string memory symbol,
        uint16 _revenueShare,
        bytes32 coinSalt
    ) external {
        address coin = _deployCoin(_payoutRecipient, uri, name, symbol, coinSalt);
        
        CoinData memory data = CoinData({
            exist: true,
            parent: address(0),
            splitAddress: _payoutRecipient,
            owners: _owners,
            revenueShare: _revenueShare,
            revenueStack: 0,
            children: 0
        });

        coins[coin] = data;
        totalCoins++;

        emit CoinAdded(coin);
    }

    function setCoinUri(
         address coin,
         string memory uri
    ) external onlyCoinOwners(coin) {
         _checkCoinExist(coin);
         IZoraCoinV4 coinContract = IZoraCoinV4(coin);
         coinContract.setContractURI(uri);
    }

    function setCoinPayoutRecipient(address coin, address recipient) external onlyCoinOwners(coin) {
        _checkCoinExist(coin);
        CoinData storage coinData = coins[coin];
        if (coinData.parent == address(0)) {
            IZoraCoinV4 coinContract = IZoraCoinV4(coin);
            coinContract.setPayoutRecipient(recipient);
        } else {
            ISplitsWallet split = ISplitsWallet(coinData.splitAddress);
            address parentPayoutRecipient = coins[coinData.parent].splitAddress;
        
            address[] memory recipients = new address[](2);
            recipients[0] = recipient;
            recipients[1] = parentPayoutRecipient;
            
            uint256[] memory allocations = new uint256[](2);
            allocations[0] = TOTAL_ALLOCATION - DISTRIBUTOR_INCENTIVE - coinData.revenueStack;
            allocations[1] = coinData.revenueStack;

            Split memory splitData = Split(
                recipients,
                allocations,
                TOTAL_ALLOCATION,
                DISTRIBUTOR_INCENTIVE
            );
            split.updateSplit(splitData);
        }

    }

    function burn(address coin, uint256 amount) external onlyCoinOwners(coin) {
         _checkCoinExist(coin);
         IZoraCoinV4 coinContract = IZoraCoinV4(coin);
         coinContract.burn(amount);
    }

    function addOwner(address coin, address owner) external onlyCoinOwners(coin) {
        _checkCoinExist(coin);
        CoinData storage coinData = coins[coin];
        if (coinData.owners.length >= MAX_OWNERS) revert MaxOwnersReached(coin);
        coinData.owners.push(owner);

        emit OwnerAdded(coin, owner);
    }

    function removeOwner(address coin, address owner) external onlyCoinOwners(coin) {
        _checkCoinExist(coin);
        CoinData storage coinData = coins[coin];
        address[] memory owners = coinData.owners;

        for (uint8 i=0; i<owners.length; i++){
            if (owners[i] == owner) {
                address lastOwner = owners[owners.length - 1];

                if (lastOwner == owner) break;
                owners[owners.length - 1] = owner;
                owners[i] = lastOwner;
            }
        }
        coinData.owners.pop();

        emit OwnerRemoved(coin, owner);
    }

    function execute(address to, uint256 value, bytes calldata data) external onlyOwner {
        (bool success,) = to.call{value: value}(data);
        require(success, "Execution failed");
    }

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

    function getCoinRevenueStack(address coin) external view returns (uint16) {
        _checkCoinExist(coin);
        return coins[coin].revenueStack;
    }

    function getCoinRevenueShare(address coin) external view returns (uint16) {
        _checkCoinExist(coin);
        return coins[coin].revenueShare;
    }

    function getCoinChildrenCount(address coin) external view returns (uint256) {
        _checkCoinExist(coin);
        return coins[coin].children;
    }

    function getCoinOwners(address coin) external view returns (address[] memory) {
        _checkCoinExist(coin);
        return coins[coin].owners;
    }
}
