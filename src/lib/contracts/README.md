# KeyshiBros Smart Contract Architecture

## Contract 1: PresaleVault

**Purpose**: Accept presale contributions (crypto + bridged fiat), track allocations.

### State
```solidity
mapping(address => uint256) public contributions;
mapping(address => uint256) public tokenAllocations;
uint256 public totalRaised;
uint256 public currentTier;

struct Tier {
    uint256 pricePerToken;  // in wei per token
    uint256 allocation;     // total tokens in tier
    uint256 sold;           // tokens sold in tier
}
Tier[4] public tiers;
```

### Functions
```solidity
function contribute() external payable;
function contributeStable(uint256 amount, address stablecoin) external;
function claimTokens() external; // After TGE
function refund() external; // If soft cap not reached
```

### Events
```solidity
event Contribution(address indexed user, uint256 amount, uint256 tokensAllocated, uint256 tier);
event TierAdvanced(uint256 newTier, uint256 newPrice);
event TokensClaimed(address indexed user, uint256 amount);
```

### Security
- Reentrancy guard on all state-changing functions
- Pausable by owner (emergency)
- Soft cap / hard cap enforcement
- Whitelist optional (KYC integration)

---

## Contract 2: RewardsDistributor

**Purpose**: Distribute revenue from app to token holders proportionally.

### Revenue Pipeline
```
App Store Purchase → Stripe → Backend (Shadow Layer) → Treasury Wallet → Contract 2
In-app Crypto Purchase → Direct to Contract 2
```

### State
```solidity
uint256 public totalRevenueDeposited;
uint256 public rewardsPerTokenStored;
mapping(address => uint256) public userRewardsPerTokenPaid;
mapping(address => uint256) public rewards;
```

### Distribution Logic
```solidity
// Revenue Pool → Allocation Engine →
//   → 65% Holder Distribution (proportional to stake)
//   → 25% Treasury retention
//   → 5% GROWSZ infra fee
//   → 5% MEMELinked routing (referral/social)
```

### Functions
```solidity
function depositRevenue() external payable; // Treasury deposits
function claimRewards() external; // Holders claim
function earned(address account) external view returns (uint256);
function getHolderShare(address account) external view returns (uint256);
```

### Events
```solidity
event RevenueDeposited(uint256 amount, uint256 timestamp);
event RewardsClaimed(address indexed user, uint256 amount);
event DistributionUpdated(uint256 rewardsPerToken);
```

### Security
- All splits via Commerce OS policy pack (no hardcoded percentages in contract)
- Receipt-gated success (LAW-UI-PROOF-001)
- Auditable on-chain logs
- Fail-closed on partial settlement

---

## Stripe → On-chain Bridge (Backend)

```
User pays via Stripe (card/Apple Pay)
    ↓
Stripe webhook → Backend validates payment
    ↓
Backend converts USD → stablecoin amount
    ↓
Backend sends from treasury wallet → PresaleVault.contributeStable()
    ↓
Contract records contribution for user address
    ↓
User sees allocation in dashboard
```

### Shadow Pattern Requirements
- No exposed private keys (HSM or KMS for treasury wallet)
- Auditable logs for every fiat→crypto bridge
- Idempotency keys to prevent double processing
- Webhook signature verification (Stripe)
