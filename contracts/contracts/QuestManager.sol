// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract QuestManager {
    enum QuestType { LIKE, REPOST, SHARE, REMIX }

    struct Quest {
        address creator;
        address coin;
        address rewardToken;
        uint256 rewardAmount;
        string questUri;
        bool isActive;
        QuestType questType;
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
        address coin,
        string memory questUri,
        address rewardToken,
        uint256 rewardAmount,
    ) external returns (uint256) {
        require(rewardAmount > 0, "Reward must be greater than 0");

        uint256 questId = totalQuests++;
        quests[questId] = Quest({
            creator: msg.sender,
            coin: coin,
            rewardToken: rewardToken,
            rewardAmount: rewardAmount,
            questUri: questUri,
            isActive: true
            questType: QuestType.LIKE,
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
