import { type Contract } from '@midnight-ntwrk/compact-js';

/**
 * This type definition represents the shape of the Token contract 
 * as compiled by the Compact compiler.
 */
export interface TokenContract extends Contract.Any {
  readonly circuits: {
    readonly mintUnshieldedToken: (amount: bigint) => void;
    readonly sendUnshielded: (recipient: string, amount: bigint) => void;
    readonly receiveUnshielded: () => void;
  };
  readonly state: {
    readonly balances: Map<string, bigint>;
  };
}
