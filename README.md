# Base Guestbook

A small lab specimen for **visitor notes**. The app is intentionally narrow: one wallet-facing action, one visible outcome, one trail that a reviewer can inspect without asking for private email proof.

### Experiment note

Input: a user wants to leaving a public hello.  
Output: a `guest note`.  
Control surface: Base, Vercel, GitHub, Builder Wallet.

### Public coordinates

| Field | Value |
| --- | --- |
| Base Developer Dashboard | Registered |
| Build ID / Base App ID | `6a031502f8601f8d21fe6b66` |
| Builder Wallet | `0x9f0901d81aF16B7504F189D16a973c47f9Df1059` |
| Builder Code | `bc_mcmhhajg` |
| Live Demo | https://base-guestbook-seven.vercel.app |
| GitHub Repository | https://github.com/unbridled0011/base-guestbook-base-dapp |
| Network | Base |
| Deployment | Vercel |

### Running the specimen

```bash
npm install
npm run dev
```

### Materials

TypeScript frontend, Base wallet flow, public proof metadata.

### Handling rule

Do not commit `.env`, private keys, seed phrases, RPC keys, GitHub tokens, or Vercel tokens. Use `.env.example` only for placeholders.

MIT License.
