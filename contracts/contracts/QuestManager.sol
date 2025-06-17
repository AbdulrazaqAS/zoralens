// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract QuestManager {
    enum QuestType { LIKE, REPOST, SHARE, REMIX }

    struct Quest {
        address creator;
        string metadataUri;
        address tokenAddress;
        uint256 rewardAmount;
        QuestType questType;
        bool isActive;
    }

    uint256 public totalQuests;
    mapping(uint256 => Quest) public quests;
    mapping(uint256 => mapping(address => bool)) public canClaim;
    mapping(uint256 => mapping(address => bool)) public hasClaimed;
    
    event QuestCreated(uint256 questId, address creator);
    event SubmissionApproved(uint256 questId, address user);

    error QuestNotFound(uint256 questId);
    error QuestNotActive(uint256 questId);
    error UserAlreadyApproved(uint256 questId, address user);
    error UserAlreadyClaimed(uint256 questId, address user);
    error UserNotApproved(uint256 questId, address user);

    modifier onlyCreator(uint256 questId) {
        require(msg.sender == quests[questId].creator, "Not the quest creator");
        _;
    }

    function createLikeQuest(
        string memory metadataUri,
        address tokenAddress,
        uint256 rewardAmount
    ) external returns (uint256) {
        require(rewardAmount > 0, "Reward must be greater than 0");

        uint256 questId = totalQuests++;
        quests[questId] = Quest({
            creator: msg.sender,
            metadataUri: metadataUri,
            tokenAddress: tokenAddress,
            rewardAmount: rewardAmount,
            questType: QuestType.LIKE,
            isActive: true
        });

        emit QuestCreated(questId, msg.sender);
        return questId;
    }

    function approveQuest(uint256 questId, address user) external onlyCreator(questId) {
        if (questId >= totalQuests) revert QuestNotFound(questId);
        if (!quests[questId].isActive) revert QuestNotActive(questId);
        if (canClaim[questId][user]) revert UserAlreadyApproved(questId, user);

        canClaim[questId][user] = true;
        emit SubmissionApproved(questId, user);
    }

    function claimReward(uint256 questId) external {
        if (questId >= totalQuests) revert QuestNotFound(questId);
        if (!quests[questId].isActive) revert QuestNotActive(questId);
        if(canClaim[questId][msg.sender]) revert UserAlreadyApproved(questId, user);
        require(!hasClaimed[questId][msg.sender], "User has already claimed this quest");

        hasClaimed[questId][msg.sender] = true;

        emit SubmissionApproved(questId, msg.sender);
    }
}
