// Smart contract templates for various use cases

// ERC-20 Token Template
export const erc20TokenTemplate = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract {{tokenName}} is ERC20, Ownable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address initialOwner
    ) ERC20(name, symbol) Ownable(initialOwner) {
        _mint(initialOwner, initialSupply * 10 ** decimals());
    }

    /**
     * @notice Mint new tokens
     * @param to The address that will receive the minted tokens
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /**
     * @notice Burn tokens from the caller's account
     * @param amount The amount of tokens to burn
     */
    function burn(uint256 amount) public {
        _burn(_msgSender(), amount);
    }
}`;

// ERC-721 NFT Template
export const erc721NFTTemplate = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract {{nftName}} is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    string public baseURI;
    uint256 public maxSupply;
    uint256 public mintPrice;
    bool public paused = false;

    constructor(
        string memory name,
        string memory symbol,
        string memory _baseURI,
        uint256 _maxSupply,
        uint256 _mintPrice,
        address initialOwner
    ) ERC721(name, symbol) Ownable(initialOwner) {
        baseURI = _baseURI;
        maxSupply = _maxSupply;
        mintPrice = _mintPrice;
    }

    /**
     * @notice Mint a new NFT
     * @param recipient The address that will receive the minted NFT
     * @param tokenURI The URI for the token metadata
     * @return The ID of the newly minted token
     */
    function mint(address recipient, string memory tokenURI) public payable returns (uint256) {
        require(!paused, "Minting is paused");
        require(_tokenIds.current() < maxSupply, "Max supply reached");
        
        if (msg.sender != owner()) {
            require(msg.value >= mintPrice, "Insufficient payment");
        }
        
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }

    /**
     * @notice Set the base URI for all token metadata
     * @param _baseURI The new base URI
     */
    function setBaseURI(string memory _baseURI) public onlyOwner {
        baseURI = _baseURI;
    }

    /**
     * @notice Set the mint price for NFTs
     * @param _mintPrice The new mint price in wei
     */
    function setMintPrice(uint256 _mintPrice) public onlyOwner {
        mintPrice = _mintPrice;
    }

    /**
     * @notice Pause or unpause minting
     * @param _paused Whether minting should be paused
     */
    function setPaused(bool _paused) public onlyOwner {
        paused = _paused;
    }

    /**
     * @notice Withdraw all ETH from the contract to the owner
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        payable(owner()).transfer(balance);
    }
}`;

// Document Attestation Contract Template
export const documentAttestationTemplate = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract DocumentAttestation is Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _attestationIds;
    
    struct Attestation {
        address attester;
        string documentHash;
        string documentName;
        string encryptedCID;
        uint256 timestamp;
    }
    
    mapping(uint256 => Attestation) public attestations;
    mapping(address => uint256[]) public userAttestations;
    
    event DocumentAttested(uint256 attestationId, address attester, string documentHash, uint256 timestamp);
    
    constructor(address initialOwner) Ownable() {}
    
    /**
     * @notice Create a new document attestation
     * @param documentHash The hash of the document being attested
     * @param documentName The name of the document
     * @param encryptedCID The encrypted IPFS CID of the document
     * @return attestationId The ID of the newly created attestation
     */
    function attestDocument(
        string memory documentHash,
        string memory documentName,
        string memory encryptedCID
    ) public returns (uint256) {
        _attestationIds.increment();
        uint256 attestationId = _attestationIds.current();
        
        attestations[attestationId] = Attestation({
            attester: msg.sender,
            documentHash: documentHash,
            documentName: documentName,
            encryptedCID: encryptedCID,
            timestamp: block.timestamp
        });
        
        userAttestations[msg.sender].push(attestationId);
        
        emit DocumentAttested(attestationId, msg.sender, documentHash, block.timestamp);
        
        return attestationId;
    }
    
    /**
     * @notice Get attestation details by ID
     * @param attestationId The ID of the attestation to retrieve
     * @return attester The address that created the attestation
     * @return documentHash The hash of the attested document
     * @return documentName The name of the attested document
     * @return encryptedCID The encrypted IPFS CID of the document
     * @return timestamp The time when the attestation was created
     */
    function getAttestation(uint256 attestationId) public view returns (
        address attester,
        string memory documentHash,
        string memory documentName,
        string memory encryptedCID,
        uint256 timestamp
    ) {
        Attestation memory attestation = attestations[attestationId];
        return (
            attestation.attester,
            attestation.documentHash,
            attestation.documentName,
            attestation.encryptedCID,
            attestation.timestamp
        );
    }
    
    /**
     * @notice Get all attestation IDs created by a specific user
     * @param user The address of the user
     * @return An array of attestation IDs created by the user
     */
    function getUserAttestations(address user) public view returns (uint256[] memory) {
        return userAttestations[user];
    }
}`;

// Lending and Borrowing Contract Template
export const lendingBorrowingTemplate = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract LendingPool is Ownable, ReentrancyGuard {
    struct LendingToken {
        IERC20 token;
        uint256 totalDeposited;
        uint256 totalBorrowed;
        uint256 interestRate; // Annual interest rate in basis points (1% = 100)
        uint256 collateralRatio; // Collateral ratio in basis points (150% = 15000)
        bool enabled;
    }
    
    struct UserDeposit {
        uint256 amount;
        uint256 lastUpdateTime;
    }
    
    struct UserBorrow {
        uint256 amount;
        uint256 collateralAmount;
        uint256 lastUpdateTime;
    }
    
    mapping(address => LendingToken) public supportedTokens;
    mapping(address => mapping(address => UserDeposit)) public userDeposits;
    mapping(address => mapping(address => UserBorrow)) public userBorrows;
    address[] public tokenAddresses;
    
    event Deposit(address indexed user, address indexed token, uint256 amount);
    event Withdraw(address indexed user, address indexed token, uint256 amount);
    event Borrow(address indexed user, address indexed token, uint256 amount, address collateralToken, uint256 collateralAmount);
    event Repay(address indexed user, address indexed token, uint256 amount);
    event LiquidatePosition(address indexed user, address indexed debtToken, address indexed liquidator, uint256 debtAmount, uint256 collateralAmount);
    
    constructor(address initialOwner) Ownable() {}
    
    /**
     * @notice Add a new token to the supported tokens list
     * @param tokenAddress The address of the ERC20 token to support
     * @param interestRate The annual interest rate for this token (in basis points, 1% = 100)
     * @param collateralRatio The collateral ratio required for borrowing (in basis points, 150% = 15000)
     */
    function addSupportedToken(
        address tokenAddress,
        uint256 interestRate,
        uint256 collateralRatio
    ) external onlyOwner {
        require(tokenAddress != address(0), "Invalid token address");
        require(!supportedTokens[tokenAddress].enabled, "Token already supported");
        
        supportedTokens[tokenAddress] = LendingToken({
            token: IERC20(tokenAddress),
            totalDeposited: 0,
            totalBorrowed: 0,
            interestRate: interestRate,
            collateralRatio: collateralRatio,
            enabled: true
        });
        
        tokenAddresses.push(tokenAddress);
    }
    
    /**
     * @notice Deposit tokens into the lending pool
     * @param tokenAddress The address of the token to deposit
     * @param amount The amount of tokens to deposit
     */
    function deposit(address tokenAddress, uint256 amount) external nonReentrant {
        require(supportedTokens[tokenAddress].enabled, "Token not supported");
        require(amount > 0, "Amount must be greater than 0");
        
        LendingToken storage lendingToken = supportedTokens[tokenAddress];
        UserDeposit storage userDeposit = userDeposits[msg.sender][tokenAddress];
        
        // Update user's deposit with interest
        if (userDeposit.amount > 0) {
            userDeposit.amount = calculateDepositWithInterest(
                userDeposit.amount,
                lendingToken.interestRate,
                userDeposit.lastUpdateTime
            );
        }
        
        // Transfer tokens from user to contract
        lendingToken.token.transferFrom(msg.sender, address(this), amount);
        
        // Update user's deposit
        userDeposit.amount += amount;
        userDeposit.lastUpdateTime = block.timestamp;
        
        // Update total deposited
        lendingToken.totalDeposited += amount;
        
        emit Deposit(msg.sender, tokenAddress, amount);
    }
    
    /**
     * @notice Withdraw tokens from the lending pool
     * @param tokenAddress The address of the token to withdraw
     * @param amount The amount of tokens to withdraw
     */
    function withdraw(address tokenAddress, uint256 amount) external nonReentrant {
        require(supportedTokens[tokenAddress].enabled, "Token not supported");
        
        LendingToken storage lendingToken = supportedTokens[tokenAddress];
        UserDeposit storage userDeposit = userDeposits[msg.sender][tokenAddress];
        
        // Update user's deposit with interest
        userDeposit.amount = calculateDepositWithInterest(
            userDeposit.amount,
            lendingToken.interestRate,
            userDeposit.lastUpdateTime
        );
        
        require(userDeposit.amount >= amount, "Insufficient balance");
        require(lendingToken.totalDeposited - lendingToken.totalBorrowed >= amount, "Insufficient liquidity");
        
        // Update user's deposit
        userDeposit.amount -= amount;
        userDeposit.lastUpdateTime = block.timestamp;
        
        // Update total deposited
        lendingToken.totalDeposited -= amount;
        
        // Transfer tokens from contract to user
        lendingToken.token.transfer(msg.sender, amount);
        
        emit Withdraw(msg.sender, tokenAddress, amount);
    }
    
    /**
     * @notice Borrow tokens using another token as collateral
     * @param tokenAddress The address of the token to borrow
     * @param amount The amount of tokens to borrow
     * @param collateralTokenAddress The address of the token to use as collateral
     */
    function borrow(
        address tokenAddress,
        uint256 amount,
        address collateralTokenAddress
    ) external nonReentrant {
        require(supportedTokens[tokenAddress].enabled, "Borrow token not supported");
        require(supportedTokens[collateralTokenAddress].enabled, "Collateral token not supported");
        require(amount > 0, "Amount must be greater than 0");
        
        LendingToken storage borrowToken = supportedTokens[tokenAddress];
        LendingToken storage collateralToken = supportedTokens[collateralTokenAddress];
        
        // Calculate required collateral
        uint256 requiredCollateral = (amount * borrowToken.collateralRatio) / 10000;
        
        // Check user's collateral balance
        UserDeposit storage userCollateral = userDeposits[msg.sender][collateralTokenAddress];
        
        // Update user's collateral with interest
        userCollateral.amount = calculateDepositWithInterest(
            userCollateral.amount,
            collateralToken.interestRate,
            userCollateral.lastUpdateTime
        );
        
        require(userCollateral.amount >= requiredCollateral, "Insufficient collateral");
        require(borrowToken.totalDeposited - borrowToken.totalBorrowed >= amount, "Insufficient liquidity");
        
        // Update user's borrow
        UserBorrow storage userBorrow = userBorrows[msg.sender][tokenAddress];
        userBorrow.amount += amount;
        userBorrow.collateralAmount += requiredCollateral;
        userBorrow.lastUpdateTime = block.timestamp;
        
        // Update user's collateral
        userCollateral.amount -= requiredCollateral;
        userCollateral.lastUpdateTime = block.timestamp;
        
        // Update total borrowed
        borrowToken.totalBorrowed += amount;
        
        // Transfer tokens from contract to user
        borrowToken.token.transfer(msg.sender, amount);
        
        emit Borrow(msg.sender, tokenAddress, amount, collateralTokenAddress, requiredCollateral);
    }
    
    /**
     * @notice Repay borrowed tokens
     * @param tokenAddress The address of the token to repay
     * @param amount The amount of tokens to repay
     */
    function repay(address tokenAddress, uint256 amount) external nonReentrant {
        require(supportedTokens[tokenAddress].enabled, "Token not supported");
        
        LendingToken storage lendingToken = supportedTokens[tokenAddress];
        UserBorrow storage userBorrow = userBorrows[msg.sender][tokenAddress];
        
        require(userBorrow.amount > 0, "No outstanding loan");
        
        // Calculate interest
        uint256 amountWithInterest = calculateBorrowWithInterest(
            userBorrow.amount,
            lendingToken.interestRate,
            userBorrow.lastUpdateTime
        );
        
        // Determine repay amount
        uint256 repayAmount = amount > amountWithInterest ? amountWithInterest : amount;
        
        // Transfer tokens from user to contract
        lendingToken.token.transferFrom(msg.sender, address(this), repayAmount);
        
        // Calculate collateral to return
        uint256 collateralToReturn = (repayAmount * userBorrow.collateralAmount) / amountWithInterest;
        
        // Update user's borrow
        if (repayAmount == amountWithInterest) {
            // Full repayment
            userBorrow.amount = 0;
            userBorrow.collateralAmount = 0;
        } else {
            // Partial repayment
            userBorrow.amount = amountWithInterest - repayAmount;
            userBorrow.collateralAmount -= collateralToReturn;
            userBorrow.lastUpdateTime = block.timestamp;
        }
        
        // Update total borrowed
        lendingToken.totalBorrowed -= repayAmount;
        
        emit Repay(msg.sender, tokenAddress, repayAmount);
    }
    
    /**
     * @notice Calculate deposit amount with accrued interest
     * @param amount The original deposit amount
     * @param interestRate The annual interest rate (in basis points, 1% = 100)
     * @param lastUpdateTime The timestamp when the deposit was last updated
     * @return The deposit amount with accrued interest
     */
    function calculateDepositWithInterest(
        uint256 amount,
        uint256 interestRate,
        uint256 lastUpdateTime
    ) internal view returns (uint256) {
        uint256 timeElapsed = block.timestamp - lastUpdateTime;
        uint256 interest = (amount * interestRate * timeElapsed) / (365 days * 10000);
        return amount + interest;
    }
    
    /**
     * @notice Calculate borrow amount with accrued interest
     * @param amount The original borrow amount
     * @param interestRate The annual interest rate (in basis points, 1% = 100)
     * @param lastUpdateTime The timestamp when the borrow was last updated
     * @return The borrow amount with accrued interest
     */
    function calculateBorrowWithInterest(
        uint256 amount,
        uint256 interestRate,
        uint256 lastUpdateTime
    ) internal view returns (uint256) {
        uint256 timeElapsed = block.timestamp - lastUpdateTime;
        uint256 interest = (amount * interestRate * timeElapsed) / (365 days * 10000);
        return amount + interest;
    }
}`;

// Smart contract templates map
export const contractTemplates = {
  'erc20': {
    name: 'ERC-20 Token',
    description: 'Standard fungible token with minting and burning capabilities',
    template: erc20TokenTemplate,
    parameters: [
      { name: 'tokenName', label: 'Token Name', type: 'string', placeholder: 'MyToken' },
      { name: 'name', label: 'Token Name', type: 'string', placeholder: 'My Token' },
      { name: 'symbol', label: 'Token Symbol', type: 'string', placeholder: 'MTK' },
      { name: 'initialSupply', label: 'Initial Supply', type: 'number', placeholder: '1000000' },
    ]
  },
  'erc721': {
    name: 'ERC-721 NFT Collection',
    description: 'Non-fungible token collection with minting and metadata support',
    template: erc721NFTTemplate,
    parameters: [
      { name: 'nftName', label: 'Contract Name', type: 'string', placeholder: 'MyNFTCollection' },
      { name: 'name', label: 'Collection Name', type: 'string', placeholder: 'My NFT Collection' },
      { name: 'symbol', label: 'Collection Symbol', type: 'string', placeholder: 'MNFT' },
      { name: 'baseURI', label: 'Base URI', type: 'string', placeholder: 'ipfs://QmYourCID/' },
      { name: 'maxSupply', label: 'Maximum Supply', type: 'number', placeholder: '10000' },
      { name: 'mintPrice', label: 'Mint Price (in wei)', type: 'number', placeholder: '50000000000000000' },
    ]
  },
  'attestation': {
    name: 'Document Attestation',
    description: 'Contract for attesting documents on the blockchain',
    template: documentAttestationTemplate,
    parameters: []
  },
  'lending': {
    name: 'Lending Pool',
    description: 'Lending and borrowing platform with collateral',
    template: lendingBorrowingTemplate,
    parameters: []
  }
}; 