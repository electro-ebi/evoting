/**
 * =====================================================
 * 🗳️ Secure E-Voting System
 * =====================================================
 * 
 * @project     Blockchain-Powered Electronic Voting System
 * @author      Ebi
 * @github      https://github.com/electro-ebi
 * @description A secure, transparent, and tamper-proof voting
 *              system with cryptographic authentication, face
 *              verification, and blockchain integration.
 * 
 * @features    - Multi-layer cryptographic security
 *              - Blockchain vote recording
 *              - Face verification
 *              - Real-time results
 *              - Admin dashboard
 * 
 * @license     MIT
 * @year        2025
 * =====================================================
 */


import sharedBlockchainService from '../services/sharedBlockchain.js';

// Middleware to automatically sync votes to blockchain after database save
export const syncToBlockchain = async (req, res, next) => {
  // Store original res.json to intercept response
  const originalJson = res.json;
  
  res.json = function(data) {
    // If this is a successful vote response, sync to blockchain
    if (res.statusCode === 201 && data.vote && data.candidate) {
      // Don't wait for blockchain sync to complete - do it async
      setImmediate(async () => {
        try {
          console.log(`\n🔄 [Blockchain Sync] Starting sync for vote ${data.vote.id}...`);
          
          // Get election data (we need this for blockchain)
          const Vote = (await import('../models/Vote.js')).default;
          const Candidate = (await import('../models/Candidate.js')).default;
          const Election = (await import('../models/Election.js')).default;
          
          const vote = await Vote.findByPk(data.vote.id);
          const candidate = await Candidate.findByPk(data.vote.candidateId);
          const election = await Election.findByPk(data.vote.electionId);
          
          if (!vote || !candidate || !election) {
            console.log(`⚠️ [Blockchain Sync] Missing data for vote ${data.vote.id} - skipping blockchain sync`);
            return;
          }
          
          // Skip if already synced
          if (vote.blockchainTxHash) {
            console.log(`✅ [Blockchain Sync] Vote ${data.vote.id} already synced to blockchain`);
            return;
          }
          
          console.log(`🔍 [Blockchain Sync] Processing vote for election ${election.id}, candidate ${candidate.id}`);
          
          try {
            // 1. Ensure election is deployed to blockchain
            console.log(`🔄 [Blockchain Sync] Ensuring election ${election.id} is deployed...`);
            const deployResult = await sharedBlockchainService.deployElectionContract({
              id: election.id,
              title: election.title,
              description: election.description,
              startDate: election.startDate,
              endDate: election.endDate,
              candidates: []
            });
            
            if (!deployResult.success) {
              console.error(`❌ [Blockchain Sync] Failed to deploy election: ${deployResult.message}`);
              return;
            }
            
            // 2. Add candidate to blockchain
            console.log(`👤 [Blockchain Sync] Adding candidate ${candidate.id} to election ${election.id}...`);
            const candidateResult = await sharedBlockchainService.addCandidateToElection(election.id, {
              id: candidate.id,
              name: candidate.name,
              party: candidate.party
            });
            
            if (!candidateResult.success) {
              console.error(`❌ [Blockchain Sync] Failed to add candidate: ${candidateResult.message}`);
              // Continue anyway, as the candidate might already exist
            }
            
            // 3. Cast vote on blockchain
            console.log(`🗳️ [Blockchain Sync] Casting vote for user ${vote.userId}...`);
            const blockchainResult = await sharedBlockchainService.castVoteOnBlockchain({
              electionId: election.id,
              candidateId: candidate.id,
              userId: vote.userId,
              voterAddress: `voter-${vote.userId}`
            });
            
            if (blockchainResult && blockchainResult.success) {
              // Update vote with blockchain transaction hash
              await vote.update({
                blockchainTxHash: blockchainResult.transactionHash,
                blockchainBlockHash: blockchainResult.blockHash,
                blockchainBlockNumber: blockchainResult.blockNumber
              });
              
              console.log(`✅ [Blockchain Sync] Vote ${data.vote.id} successfully recorded on blockchain`);
              console.log(`   Transaction Hash: ${blockchainResult.transactionHash}`);
              console.log(`   Block Hash: ${blockchainResult.blockHash}`);
              console.log(`   Block Number: ${blockchainResult.blockNumber}`);
              console.log(`   Total Votes: ${blockchainResult.blockchainVotes || 'N/A'}`);
              
              // Log blockchain statistics
              const stats = sharedBlockchainService.getBlockchainStatistics();
              console.log(`📊 [Blockchain Stats] ${stats.statistics?.totalVotes || 0} total votes across ${stats.statistics?.totalBlocks || 0} blocks`);
            } else {
              const errorMsg = blockchainResult?.message || 'Unknown error';
              console.error(`❌ [Blockchain Sync] Failed to record vote: ${errorMsg}`);
              
              // Log detailed error information
              if (blockchainResult?.error) {
                console.error(`   Error details:`, blockchainResult.error);
              }
            }
          } catch (blockchainError) {
            console.error(`❌ [Blockchain Sync] Critical error during blockchain operations:`, blockchainError);
            console.error('Stack trace:', blockchainError.stack);
          }
          
        } catch (error) {
          console.error(`❌ [Blockchain Sync] Error in blockchain sync middleware:`, error);
          console.error('Stack trace:', error.stack);
        }
      });
    }
    
    // Call original res.json with the data
    return originalJson.call(this, data);
  };
  
  next();
};

// Export a function to manually trigger blockchain sync for a vote
export const manualSyncVoteToBlockchain = async (voteId) => {
  try {
    console.log(`\n🔄 [Manual Sync] Starting manual blockchain sync for vote ${voteId}...`);
    
    const Vote = (await import('../models/Vote.js')).default;
    const vote = await Vote.findByPk(voteId);
    
    if (!vote) {
      console.error(`❌ [Manual Sync] Vote ${voteId} not found`);
      return { success: false, message: 'Vote not found' };
    }
    
    if (vote.blockchainTxHash) {
      console.log(`ℹ️ [Manual Sync] Vote ${voteId} already synced with tx: ${vote.blockchainTxHash}`);
      return { 
        success: true, 
        message: 'Vote already synced to blockchain',
        transactionHash: vote.blockchainTxHash,
        blockHash: vote.blockchainBlockHash,
        blockNumber: vote.blockchainBlockNumber
      };
    }
    
    const Candidate = (await import('../models/Candidate.js')).default;
    const Election = (await import('../models/Election.js')).default;
    
    const candidate = await Candidate.findByPk(vote.candidateId);
    const election = await Election.findByPk(vote.electionId);
    
    if (!candidate || !election) {
      console.error(`❌ [Manual Sync] Missing data for vote ${voteId}`);
      return { success: false, message: 'Missing candidate or election data' };
    }
    
    // Proceed with blockchain operations
    const result = await sharedBlockchainService.castVoteOnBlockchain({
      electionId: election.id,
      candidateId: candidate.id,
      userId: vote.userId,
      voterAddress: `voter-${vote.userId}`
    });
    
    if (result.success) {
      await vote.update({
        blockchainTxHash: result.transactionHash,
        blockchainBlockHash: result.blockHash,
        blockchainBlockNumber: result.blockNumber
      });
      
      console.log(`✅ [Manual Sync] Successfully synced vote ${voteId} to blockchain`);
      console.log(`   Transaction: ${result.transactionHash}`);
      
      return {
        success: true,
        message: 'Vote successfully synced to blockchain',
        transactionHash: result.transactionHash,
        blockHash: result.blockHash,
        blockNumber: result.blockNumber
      };
    } else {
      console.error(`❌ [Manual Sync] Failed to sync vote ${voteId}: ${result.message}`);
      return {
        success: false,
        message: result.message || 'Failed to sync vote to blockchain',
        error: result.error
      };
    }
  } catch (error) {
    console.error(`❌ [Manual Sync] Error during manual sync:`, error);
    return {
      success: false,
      message: 'Error during manual sync',
      error: error.message
    };
  }
};
