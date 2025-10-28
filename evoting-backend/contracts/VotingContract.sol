//
// =====================================================
// 🗳️ Secure E-Voting System
// =====================================================
// 
// @project     Blockchain-Powered Electronic Voting System
// @author      Ebi
// @github      https://github.com/electro-ebi
// @description Smart contract for secure voting
// 
// @license     MIT
// @year        2025
// =====================================================


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract VotingContract is Ownable, ReentrancyGuard {
    struct Candidate {
        string name;
        string party;
        uint256 voteCount;
        bool exists;
    }
    
    struct Election {
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        mapping(uint256 => Candidate) candidates;
        uint256 candidateCount;
        mapping(address => bool) hasVoted;
        uint256 totalVotes;
    }
    
    mapping(uint256 => Election) public elections;
    uint256 public electionCount;
    
    event ElectionCreated(uint256 indexed electionId, string title);
    event CandidateAdded(uint256 indexed electionId, uint256 indexed candidateId, string name);
    event VoteCast(uint256 indexed electionId, uint256 indexed candidateId, address voter);
    event ElectionEnded(uint256 indexed electionId);
    
    modifier validElection(uint256 _electionId) {
        require(_electionId < electionCount, "Election does not exist");
        _;
    }
    
    modifier electionActive(uint256 _electionId) {
        require(elections[_electionId].isActive, "Election is not active");
        require(block.timestamp >= elections[_electionId].startTime, "Election has not started");
        require(block.timestamp <= elections[_electionId].endTime, "Election has ended");
        _;
    }
    
    // Create new election (Admin only)
    function createElection(
        string memory _title,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime
    ) external onlyOwner {
        require(_startTime < _endTime, "Invalid time range");
        require(_startTime > block.timestamp, "Start time must be in future");
        
        elections[electionCount].title = _title;
        elections[electionCount].description = _description;
        elections[electionCount].startTime = _startTime;
        elections[electionCount].endTime = _endTime;
        elections[electionCount].isActive = true;
        elections[electionCount].candidateCount = 0;
        elections[electionCount].totalVotes = 0;
        
        emit ElectionCreated(electionCount, _title);
        electionCount++;
    }
    
    // Add candidate to election (Admin only)
    function addCandidate(
        uint256 _electionId,
        string memory _name,
        string memory _party
    ) external onlyOwner validElection(_electionId) {
        require(elections[_electionId].isActive, "Election is not active");
        
        uint256 candidateId = elections[_electionId].candidateCount;
        elections[_electionId].candidates[candidateId] = Candidate({
            name: _name,
            party: _party,
            voteCount: 0,
            exists: true
        });
        elections[_electionId].candidateCount++;
        
        emit CandidateAdded(_electionId, candidateId, _name);
    }
    
    // Cast vote
    function castVote(uint256 _electionId, uint256 _candidateId) 
        external 
        validElection(_electionId) 
        electionActive(_electionId) 
        nonReentrant 
    {
        require(!elections[_electionId].hasVoted[msg.sender], "Already voted");
        require(_candidateId < elections[_electionId].candidateCount, "Invalid candidate");
        require(elections[_electionId].candidates[_candidateId].exists, "Candidate does not exist");
        
        elections[_electionId].hasVoted[msg.sender] = true;
        elections[_electionId].candidates[_candidateId].voteCount++;
        elections[_electionId].totalVotes++;
        
        emit VoteCast(_electionId, _candidateId, msg.sender);
    }
    
    // Get election results
    function getElectionResults(uint256 _electionId) 
        external 
        view 
        validElection(_electionId) 
        returns (
            string memory title,
            uint256 totalVotes,
            uint256 candidateCount,
            string[] memory names,
            string[] memory parties,
            uint256[] memory voteCounts
        ) 
    {
        Election storage election = elections[_electionId];
        title = election.title;
        totalVotes = election.totalVotes;
        candidateCount = election.candidateCount;
        
        names = new string[](candidateCount);
        parties = new string[](candidateCount);
        voteCounts = new uint256[](candidateCount);
        
        for (uint256 i = 0; i < candidateCount; i++) {
            names[i] = election.candidates[i].name;
            parties[i] = election.candidates[i].party;
            voteCounts[i] = election.candidates[i].voteCount;
        }
    }
    
    // End election (Admin only)
    function endElection(uint256 _electionId) 
        external 
        onlyOwner 
        validElection(_electionId) 
    {
        elections[_electionId].isActive = false;
        emit ElectionEnded(_electionId);
    }
    
    // Check if user has voted
    function hasUserVoted(uint256 _electionId, address _user) 
        external 
        view 
        validElection(_electionId) 
        returns (bool) 
    {
        return elections[_electionId].hasVoted[_user];
    }
    
    // Get election details
    function getElectionDetails(uint256 _electionId) 
        external 
        view 
        validElection(_electionId) 
        returns (
            string memory title,
            string memory description,
            uint256 startTime,
            uint256 endTime,
            bool isActive,
            uint256 totalVotes
        ) 
    {
        Election storage election = elections[_electionId];
        return (
            election.title,
            election.description,
            election.startTime,
            election.endTime,
            election.isActive,
            election.totalVotes
        );
    }
    
    // Get candidate details
    function getCandidate(uint256 _electionId, uint256 _candidateId) 
        external 
        view 
        validElection(_electionId) 
        returns (
            string memory name,
            string memory party,
            uint256 voteCount
        ) 
    {
        require(_candidateId < elections[_electionId].candidateCount, "Invalid candidate");
        Candidate storage candidate = elections[_electionId].candidates[_candidateId];
        return (candidate.name, candidate.party, candidate.voteCount);
    }
}

