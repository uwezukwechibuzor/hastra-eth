import { describe, it } from "vitest";
import { createTestIndexer, type ERC1967Proxy_AccountFrozen } from "envio";
import { TestHelpers } from "envio";

describe("ERC1967Proxy contract AccountFrozen event tests", () => {
  it("ERC1967Proxy_AccountFrozen is created correctly", async (t) => {
    const indexer = createTestIndexer();

    // Creating mock for ERC1967Proxy contract AccountFrozen event
    const event = {
      contract: "ERC1967Proxy" as const,
      event: "AccountFrozen" as const,
      params: {
        account: TestHelpers.Addresses.defaultAddress,
      },
    };

    await indexer.process({
      chains: {
        1: {
          simulate: [event],
        },
      },
    });

    // Getting the actual entity from the test indexer
    let actualERC1967ProxyAccountFrozen = await indexer.ERC1967Proxy_AccountFrozen.getOrThrow("1_0_0");

    // Creating the expected entity
    const expectedERC1967ProxyAccountFrozen: ERC1967Proxy_AccountFrozen = {
      id: "1_0_0",
      account: event.params.account,
    };
    // Asserting that the entity in the mock database is the same as the expected entity
    t.expect(actualERC1967ProxyAccountFrozen, "Actual ERC1967ProxyAccountFrozen should be the same as the expected ERC1967ProxyAccountFrozen").toEqual(expectedERC1967ProxyAccountFrozen);
  });
});

describe("Indexer smoke test", () => {
  it("processes the first block with events on chain 1", async (t) => {
    const indexer = createTestIndexer();

    const result = await indexer.process({ chains: { 1: {} } });

    t.expect(result.changes.length, "Should have at least one change").toBeGreaterThan(0);
    const firstChange = result.changes[0]!;
    t.expect(firstChange.chainId).toBe(1);
    t.expect(firstChange.eventsProcessed).toBeGreaterThan(0);
  }, 60_000);
});
