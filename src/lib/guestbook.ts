import type { Address } from "viem";

export const MAX_NAME_LENGTH = 24;
export const MAX_MESSAGE_LENGTH = 140;

export const guestbookAbi = [
  {
    type: "function",
    name: "signGuestbook",
    stateMutability: "nonpayable",
    inputs: [
      { name: "name", type: "string" },
      { name: "message", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getRecentEntries",
    stateMutability: "view",
    inputs: [{ name: "limit", type: "uint256" }],
    outputs: [
      {
        components: [
          { name: "writer", type: "address" },
          { name: "name", type: "string" },
          { name: "message", type: "string" },
          { name: "timestamp", type: "uint256" },
        ],
        name: "",
        type: "tuple[]",
      },
    ],
  },
] as const;

export type GuestbookEntry = {
  writer: Address;
  name: string;
  message: string;
  timestamp: bigint;
};

export const guestbookContractAddress = process.env
  .NEXT_PUBLIC_GUESTBOOK_CONTRACT_ADDRESS as Address | undefined;
