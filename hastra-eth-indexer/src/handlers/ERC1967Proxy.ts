/*
 * Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features
 */
import { indexer } from "envio";
import type {
  ERC1967Proxy_AccountFrozen,
  ERC1967Proxy_AccountThawed,
  ERC1967Proxy_Approval,
  ERC1967Proxy_Deposit,
  ERC1967Proxy_EIP712DomainChanged,
  ERC1967Proxy_Initialized,
  ERC1967Proxy_MaxPeriodRewardsUpdated,
  ERC1967Proxy_MaxRewardPercentUpdated,
  ERC1967Proxy_MaxTotalRewardsUpdated,
  ERC1967Proxy_NavOracleUpdated,
  ERC1967Proxy_Paused,
  ERC1967Proxy_RewardPeriodSecondsUpdated,
  ERC1967Proxy_RewardsDistributed,
  ERC1967Proxy_RoleAdminChanged,
  ERC1967Proxy_RoleGranted,
  ERC1967Proxy_RoleRevoked,
  ERC1967Proxy_Transfer,
  ERC1967Proxy_Unpaused,
  ERC1967Proxy_Upgraded,
  ERC1967Proxy_Withdraw,
  ERC1967Proxy_YieldVaultUpdated,
} from "envio";

indexer.onEvent({ contract: "ERC1967Proxy", event: "AccountFrozen" }, async ({ event, context }) => {
  const entity: ERC1967Proxy_AccountFrozen = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    account: event.params.account,
  };

  context.ERC1967Proxy_AccountFrozen.set(entity);
});

indexer.onEvent({ contract: "ERC1967Proxy", event: "AccountThawed" }, async ({ event, context }) => {
  const entity: ERC1967Proxy_AccountThawed = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    account: event.params.account,
  };

  context.ERC1967Proxy_AccountThawed.set(entity);
});

indexer.onEvent({ contract: "ERC1967Proxy", event: "Approval" }, async ({ event, context }) => {
  const entity: ERC1967Proxy_Approval = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    owner: event.params.owner,
    spender: event.params.spender,
    value: event.params.value,
  };

  context.ERC1967Proxy_Approval.set(entity);
});

indexer.onEvent({ contract: "ERC1967Proxy", event: "Deposit" }, async ({ event, context }) => {
  const entity: ERC1967Proxy_Deposit = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    sender: event.params.sender,
    owner: event.params.owner,
    assets: event.params.assets,
    shares: event.params.shares,
  };

  context.ERC1967Proxy_Deposit.set(entity);
});

indexer.onEvent({ contract: "ERC1967Proxy", event: "EIP712DomainChanged" }, async ({ event, context }) => {
  const entity: ERC1967Proxy_EIP712DomainChanged = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
  };

  context.ERC1967Proxy_EIP712DomainChanged.set(entity);
});

indexer.onEvent({ contract: "ERC1967Proxy", event: "Initialized" }, async ({ event, context }) => {
  const entity: ERC1967Proxy_Initialized = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    version: event.params.version,
  };

  context.ERC1967Proxy_Initialized.set(entity);
});

indexer.onEvent({ contract: "ERC1967Proxy", event: "MaxPeriodRewardsUpdated" }, async ({ event, context }) => {
  const entity: ERC1967Proxy_MaxPeriodRewardsUpdated = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    oldValue: event.params.oldValue,
    newValue: event.params.newValue,
  };

  context.ERC1967Proxy_MaxPeriodRewardsUpdated.set(entity);
});

indexer.onEvent({ contract: "ERC1967Proxy", event: "MaxRewardPercentUpdated" }, async ({ event, context }) => {
  const entity: ERC1967Proxy_MaxRewardPercentUpdated = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    oldValue: event.params.oldValue,
    newValue: event.params.newValue,
  };

  context.ERC1967Proxy_MaxRewardPercentUpdated.set(entity);
});

indexer.onEvent({ contract: "ERC1967Proxy", event: "MaxTotalRewardsUpdated" }, async ({ event, context }) => {
  const entity: ERC1967Proxy_MaxTotalRewardsUpdated = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    oldValue: event.params.oldValue,
    newValue: event.params.newValue,
  };

  context.ERC1967Proxy_MaxTotalRewardsUpdated.set(entity);
});

indexer.onEvent({ contract: "ERC1967Proxy", event: "NavOracleUpdated" }, async ({ event, context }) => {
  const entity: ERC1967Proxy_NavOracleUpdated = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    oldOracle: event.params.oldOracle,
    newOracle: event.params.newOracle,
    feedId: event.params.feedId,
  };

  context.ERC1967Proxy_NavOracleUpdated.set(entity);
});

indexer.onEvent({ contract: "ERC1967Proxy", event: "Paused" }, async ({ event, context }) => {
  const entity: ERC1967Proxy_Paused = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    account: event.params.account,
  };

  context.ERC1967Proxy_Paused.set(entity);
});

indexer.onEvent({ contract: "ERC1967Proxy", event: "RewardPeriodSecondsUpdated" }, async ({ event, context }) => {
  const entity: ERC1967Proxy_RewardPeriodSecondsUpdated = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    oldValue: event.params.oldValue,
    newValue: event.params.newValue,
  };

  context.ERC1967Proxy_RewardPeriodSecondsUpdated.set(entity);
});

indexer.onEvent({ contract: "ERC1967Proxy", event: "RewardsDistributed" }, async ({ event, context }) => {
  const entity: ERC1967Proxy_RewardsDistributed = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    amount: event.params.amount,
    timestamp: event.params.timestamp,
  };

  context.ERC1967Proxy_RewardsDistributed.set(entity);
});

indexer.onEvent({ contract: "ERC1967Proxy", event: "RoleAdminChanged" }, async ({ event, context }) => {
  const entity: ERC1967Proxy_RoleAdminChanged = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    role: event.params.role,
    previousAdminRole: event.params.previousAdminRole,
    newAdminRole: event.params.newAdminRole,
  };

  context.ERC1967Proxy_RoleAdminChanged.set(entity);
});

indexer.onEvent({ contract: "ERC1967Proxy", event: "RoleGranted" }, async ({ event, context }) => {
  const entity: ERC1967Proxy_RoleGranted = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    role: event.params.role,
    account: event.params.account,
    sender: event.params.sender,
  };

  context.ERC1967Proxy_RoleGranted.set(entity);
});

indexer.onEvent({ contract: "ERC1967Proxy", event: "RoleRevoked" }, async ({ event, context }) => {
  const entity: ERC1967Proxy_RoleRevoked = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    role: event.params.role,
    account: event.params.account,
    sender: event.params.sender,
  };

  context.ERC1967Proxy_RoleRevoked.set(entity);
});

indexer.onEvent({ contract: "ERC1967Proxy", event: "Transfer" }, async ({ event, context }) => {
  const entity: ERC1967Proxy_Transfer = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    from: event.params.from,
    to: event.params.to,
    value: event.params.value,
  };

  context.ERC1967Proxy_Transfer.set(entity);
});

indexer.onEvent({ contract: "ERC1967Proxy", event: "Unpaused" }, async ({ event, context }) => {
  const entity: ERC1967Proxy_Unpaused = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    account: event.params.account,
  };

  context.ERC1967Proxy_Unpaused.set(entity);
});

indexer.onEvent({ contract: "ERC1967Proxy", event: "Upgraded" }, async ({ event, context }) => {
  const entity: ERC1967Proxy_Upgraded = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    implementation: event.params.implementation,
  };

  context.ERC1967Proxy_Upgraded.set(entity);
});

indexer.onEvent({ contract: "ERC1967Proxy", event: "Withdraw" }, async ({ event, context }) => {
  const entity: ERC1967Proxy_Withdraw = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    sender: event.params.sender,
    receiver: event.params.receiver,
    owner: event.params.owner,
    assets: event.params.assets,
    shares: event.params.shares,
  };

  context.ERC1967Proxy_Withdraw.set(entity);
});

indexer.onEvent({ contract: "ERC1967Proxy", event: "YieldVaultUpdated" }, async ({ event, context }) => {
  const entity: ERC1967Proxy_YieldVaultUpdated = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    oldVault: event.params.oldVault,
    newVault: event.params.newVault,
  };

  context.ERC1967Proxy_YieldVaultUpdated.set(entity);
});
