# Hastra ETH Indexer + Dashboard

Full-stack analytics for the Hastra ERC4626 yield vault on Ethereum mainnet.

## Structure

```
envio-dev/
├── hastra-eth-indexer/   # Envio event indexer for the vault contract
└── hastra-dashboard/     # Next.js analytics dashboard
```

## hastra-eth-indexer

Indexes the Hastra vault (`0x19ebb35279A16207Ec4ba82799CC64715065F7F6`) on Ethereum mainnet using [Envio](https://envio.dev). Exposes a Hasura GraphQL API at `http://localhost:8080/v1/graphql`.

```bash
cd hastra-eth-indexer
pnpm install
pnpm exec envio dev
```

## hastra-dashboard

Next.js 15 dashboard with live vault analytics: TVL, deposit/withdrawal flows, daily fees, top depositors, and on-chain NAV oracle USD prices.

```bash
cd hastra-dashboard
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

> Requires the indexer to be running first.

## Vault

| | |
|---|---|
| Contract | `0x19ebb35279A16207Ec4ba82799CC64715065F7F6` |
| Type | ERC4626 Yield Vault (ERC1967 Proxy) |
| Underlying | wYLDS (`0x6aD038cA6C04e885630851278ca0a856Ad9a66Cc`) |
| NAV Oracle | `0xdF4ab20fA7752Be52E41e42F1FD667f37964d6a3` |
| Network | Ethereum Mainnet |
