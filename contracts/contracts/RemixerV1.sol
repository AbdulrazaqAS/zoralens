// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

interface IZoraCoinV4 {
    //function setPayoutRecipient(address newPayoutRecipient) external;
    function burn(uint256 amount) external;
    function setContractURI(string memory newURI) external;
}

interface SplitsWallet {
    struct Split {
        address[] recipients;
        uint256[] allocations;
        uint256 totalAllocation;
        uint16 distributionIncentive;
    }

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

    function initialize(address owner) external initializer {
        __Ownable_init(owner);
    }

    // New/root coins have an address as payout recipient not a split contract
    function addCoin(address coin, address _payoutRecipient, uint16 _revenueShare, address[] memory _owners) external {
        CoinData memory data = CoinData({
            exist: true,
            parent: address(0),  // address zero as parent indicates coin is root not remix
            splitsAddress: _payoutRecipient,
            owners: _owners,
            revenueShare: _revenueShare,
            revenueStack: 0,  // zero for new coin
            descendants: 0
        });

        coins[coin] = data;
        totalCoins++;

        emit CoinAdded(coin);
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
