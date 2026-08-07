# Hastra ETH Indexer + Dashboard

Full-stack analytics for the Hastra ERC4626 yield vault on Ethereum mainnet.

<img width="1868" height="968" alt="Screenshot 2026-08-07 at 04 38 42" src="https://github.com/user-attachments/assets/1d5f9c94-69c5-4b28-b1f0-32173679008e" />

<img width="1868" height="968" alt="Screenshot 2026-08-07 at 04 39 29" src="https://github.com/user-attachments/assets/82f42722-193f-4dce-b036-911567e0c856" />

<img width="1395" height="518" alt="Screenshot 2026-08-07 at 04 40 34" src="https://github.com/user-attachments/assets/6091a6c3-3e1f-4e3c-b22d-f5b3217f329f" />




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
