/**
 * Mock API layer for external data
 */
export async function fetchTokenPrice() {
  return 1.25;
}

export async function getNetworkStats() {
  return {
    tps: 50,
    blockHeight: 124050,
    activeNodes: 120
  };
}
