
import { GraphQLClient } from 'graphql-request';

export const client = new GraphQLClient('http://localhost:8080/v1/graphql');

export const QUERIES = {
  overview: `{
    deposits: ERC1967Proxy_Deposit(limit: 5000) {
      id sender owner assets shares
    }
    withdrawals: ERC1967Proxy_Withdraw(limit: 5000) {
      id sender receiver owner assets shares
    }
    transfers: ERC1967Proxy_Transfer(limit: 5000) {
      id from to value
    }
    rewards: ERC1967Proxy_RewardsDistributed(limit: 5000, order_by: {timestamp: asc}) {
      id amount timestamp
    }
    rolesGranted: ERC1967Proxy_RoleGranted(limit: 200) {
      id role account sender
    }
    rolesRevoked: ERC1967Proxy_RoleRevoked(limit: 200) {
      id role account sender
    }
    frozenAccounts: ERC1967Proxy_AccountFrozen {
      id account
    }
    thawedAccounts: ERC1967Proxy_AccountThawed {
      id account
    }
    upgrades: ERC1967Proxy_Upgraded {
      id implementation
    }
    yieldVaultUpdates: ERC1967Proxy_YieldVaultUpdated {
      id oldVault newVault
    }
    navOracleUpdates: ERC1967Proxy_NavOracleUpdated {
      id oldOracle newOracle feedId
    }
    approvals: ERC1967Proxy_Approval(limit: 500) {
      id owner spender value
    }
  }`,
};

export type RawData = {
  deposits: { id: string; sender: string; owner: string; assets: string; shares: string }[];
  withdrawals: { id: string; sender: string; receiver: string; owner: string; assets: string; shares: string }[];
  transfers: { id: string; from: string; to: string; value: string }[];
  rewards: { id: string; amount: string; timestamp: string }[];
  rolesGranted: { id: string; role: string; account: string; sender: string }[];
  rolesRevoked: { id: string; role: string; account: string; sender: string }[];
  frozenAccounts: { id: string; account: string }[];
  thawedAccounts: { id: string; account: string }[];
  upgrades: { id: string; implementation: string }[];
  yieldVaultUpdates: { id: string; oldVault: string; newVault: string }[];
  navOracleUpdates: { id: string; oldOracle: string; newOracle: string; feedId: string }[];
  approvals: { id: string; owner: string; spender: string; value: string }[];
};

export const KNOWN_ROLES: Record<string, string> = {
  '0x0000000000000000000000000000000000000000000000000000000000000000': 'DEFAULT_ADMIN',
  '0x189ab7a9244df0848122154315af71fe140f3db0fe014031783b0946b8c9d2e3': 'PAUSER',
  '0x5b1d514dc7939e180020b5e45c6b4b0b997babf2832f415121a45e9091b5b54b': 'UPGRADER',
  '0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a': 'FREEZER',
  '0x543dd7347cde3308f4ca610f3d5b513c0c1ce692b559bf3b9637d9557d3aede9': 'REWARDS_MANAGER',
  '0x8c05f61760c0f173f6ac4249c7cb7cb780b3447e46ec8c842d5198905761e0cf': 'OPERATOR',
};

export function formatRole(role: string): string {
  return KNOWN_ROLES[role] ?? `${role.slice(0, 8)}…`;
}

export function formatAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function toWYLDS(raw: string | number): number {
  return Number(raw) / 1_000_000;
}

export function blockToApproxDate(id: string): Date {
  const block = parseInt(id.split('_')[1]);
  const GENESIS_BLOCK = 24_981_323;
  const GENESIS_TS = new Date('2026-05-04T20:00:00Z').getTime();
  const MS_PER_BLOCK = 12_000;
  return new Date(GENESIS_TS + (block - GENESIS_BLOCK) * MS_PER_BLOCK);
}
