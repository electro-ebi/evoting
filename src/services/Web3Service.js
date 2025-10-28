import Web3 from 'web3';
import API_CONFIG from '../utils/apiConfig';

class Web3Service {
  constructor() {
    this.web3 = null;
    this.contract = null;
    this.account = null;
    this.contractAddress = null;
    this.contractABI = null;
  }

  // Connect to MetaMask wallet
  async connectWallet() {
    if (window.ethereum) {
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Create Web3 instance
        this.web3 = new Web3(window.ethereum);
        this.account = (await this.web3.eth.getAccounts())[0];
        
        console.log('🔗 Connected to wallet:', this.account);
        
        // Check network
        const networkId = await this.web3.eth.net.getId();
        console.log('🌐 Network ID:', networkId);
        
        // Load contract if address is available
        if (this.contractAddress && this.contractABI) {
          this.contract = new this.web3.eth.Contract(
            this.contractABI,
            this.contractAddress
          );
        }
        
        // Listen for account changes
        window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length > 0) {
            this.account = accounts[0];
            console.log('🔄 Account changed to:', this.account);
          } else {
            this.account = null;
            console.log('🔌 Wallet disconnected');
          }
        });
        
        // Listen for network changes
        window.ethereum.on('chainChanged', (chainId) => {
          console.log('🔄 Network changed to:', chainId);
          window.location.reload(); // Reload to reset state
        });
        
        return { success: true, account: this.account };
      } catch (error) {
        console.error('❌ Wallet connection failed:', error);
        return { success: false, error: error.message };
      }
    } else {
      return { 
        success: false, 
        error: 'MetaMask not installed. Please install MetaMask to continue.' 
      };
    }
  }

  // Load contract from backend
  async loadContract() {
    try {
      const response = await fetch(API_CONFIG.getAPIURL('/contract-info.json'));
      if (!response.ok) {
        throw new Error(`Failed to fetch contract info: ${response.status}`);
      }
      const contractInfo = await response.json();
      
      this.contractAddress = contractInfo.address;
      
      // Load contract ABI (you'll need to get this from Hardhat compilation)
      const abiResponse = await fetch(API_CONFIG.getAPIURL('/artifacts/contracts/VotingContract.sol/VotingContract.json'));
      if (!abiResponse.ok) {
        throw new Error(`Failed to fetch contract ABI: ${abiResponse.status}`);
      }
      const abiData = await abiResponse.json();
      this.contractABI = abiData.abi;
      
      if (this.web3 && this.contractAddress && this.contractABI) {
        this.contract = new this.web3.eth.Contract(
          this.contractABI,
          this.contractAddress
        );
      }
      
      return { success: true, contractAddress: this.contractAddress };
    } catch (error) {
      console.error('❌ Contract loading failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Create new election (Admin only)
  async createElection(title, description, startTime, endTime) {
    if (!this.contract) {
      return { success: false, error: 'Contract not loaded' };
    }

    try {
      const result = await this.contract.methods
        .createElection(title, description, startTime, endTime)
        .send({ from: this.account });
      
      console.log('✅ Election created:', result.transactionHash);
      return { 
        success: true, 
        transactionHash: result.transactionHash,
        electionId: result.events.ElectionCreated.returnValues.electionId
      };
    } catch (error) {
      console.error('❌ Create election failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Add candidate to election (Admin only)
  async addCandidate(electionId, name, party) {
    if (!this.contract) {
      return { success: false, error: 'Contract not loaded' };
    }

    try {
      const result = await this.contract.methods
        .addCandidate(electionId, name, party)
        .send({ from: this.account });
      
      console.log('✅ Candidate added:', result.transactionHash);
      return { 
        success: true, 
        transactionHash: result.transactionHash,
        candidateId: result.events.CandidateAdded.returnValues.candidateId
      };
    } catch (error) {
      console.error('❌ Add candidate failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Cast vote
  async castVote(electionId, candidateId) {
    if (!this.contract) {
      return { success: false, error: 'Contract not loaded' };
    }

    try {
      const result = await this.contract.methods
        .castVote(electionId, candidateId)
        .send({ from: this.account });
      
      console.log('✅ Vote cast:', result.transactionHash);
      return { 
        success: true, 
        transactionHash: result.transactionHash
      };
    } catch (error) {
      console.error('❌ Cast vote failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get election results
  async getElectionResults(electionId) {
    if (!this.contract) {
      return { success: false, error: 'Contract not loaded' };
    }

    try {
      const result = await this.contract.methods
        .getElectionResults(electionId)
        .call();
      
      return { 
        success: true, 
        results: {
          title: result.title,
          totalVotes: result.totalVotes,
          candidateCount: result.candidateCount,
          names: result.names,
          parties: result.parties,
          voteCounts: result.voteCounts
        }
      };
    } catch (error) {
      console.error('❌ Get results failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if user has voted
  async hasUserVoted(electionId, userAddress = null) {
    if (!this.contract) {
      return { success: false, error: 'Contract not loaded' };
    }

    try {
      const address = userAddress || this.account;
      const result = await this.contract.methods
        .hasUserVoted(electionId, address)
        .call();
      
      return { success: true, hasVoted: result };
    } catch (error) {
      console.error('❌ Check vote status failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get election details
  async getElectionDetails(electionId) {
    if (!this.contract) {
      return { success: false, error: 'Contract not loaded' };
    }

    try {
      const result = await this.contract.methods
        .getElectionDetails(electionId)
        .call();
      
      return { 
        success: true, 
        details: {
          title: result.title,
          description: result.description,
          startTime: result.startTime,
          endTime: result.endTime,
          isActive: result.isActive,
          totalVotes: result.totalVotes
        }
      };
    } catch (error) {
      console.error('❌ Get election details failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get candidate details
  async getCandidate(electionId, candidateId) {
    if (!this.contract) {
      return { success: false, error: 'Contract not loaded' };
    }

    try {
      const result = await this.contract.methods
        .getCandidate(electionId, candidateId)
        .call();
      
      return { 
        success: true, 
        candidate: {
          name: result.name,
          party: result.party,
          voteCount: result.voteCount
        }
      };
    } catch (error) {
      console.error('❌ Get candidate failed:', error);
      return { success: false, error: error.message };
    }
  }

  // End election (Admin only)
  async endElection(electionId) {
    if (!this.contract) {
      return { success: false, error: 'Contract not loaded' };
    }

    try {
      const result = await this.contract.methods
        .endElection(electionId)
        .send({ from: this.account });
      
      console.log('✅ Election ended:', result.transactionHash);
      return { 
        success: true, 
        transactionHash: result.transactionHash
      };
    } catch (error) {
      console.error('❌ End election failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get current account
  getCurrentAccount() {
    return this.account;
  }

  // Get contract address
  getContractAddress() {
    return this.contractAddress;
  }

  // Check if wallet is connected
  isConnected() {
    return this.web3 !== null && this.account !== null;
  }

  // Check if contract is loaded
  isContractLoaded() {
    return this.contract !== null;
  }
}

export default new Web3Service();
