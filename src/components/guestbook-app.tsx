"use client";

import {
  CheckCircle2,
  Feather,
  Loader2,
  MessageSquareText,
  NotebookPen,
  PenLine,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { Address } from "viem";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { base } from "wagmi/chains";
import {
  guestbookAbi,
  guestbookContractAddress,
  MAX_MESSAGE_LENGTH,
  MAX_NAME_LENGTH,
  type GuestbookEntry,
} from "@/lib/guestbook";

function shortAddress(address?: Address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function timeLabel(timestamp: bigint) {
  const value = Number(timestamp) * 1000;
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const noteColors = [
  "bg-[#f9df8f]",
  "bg-[#f6c8db]",
  "bg-[#bfdcf6]",
  "bg-[#cde8c9]",
];

export function GuestbookApp() {
  const [name, setName] = useState("Base Friend");
  const [message, setMessage] = useState("Love seeing builders leave a mark on Base.");
  const [status, setStatus] = useState(
    "Write a short note, connect your wallet, and sign the guestbook on Base.",
  );
  const [walletStatus, setWalletStatus] = useState("");

  const { address, chainId, connector, isConnected } = useAccount();
  const { connectors, connectAsync, isPending: connecting } = useConnect();
  const { disconnectAsync, isPending: disconnecting } = useDisconnect();
  const { switchChain, isPending: switching } = useSwitchChain();
  const {
    data: hash,
    writeContract,
    isPending: signing,
    error: writeError,
  } = useWriteContract();

  const { isLoading: confirming, isSuccess: confirmed } =
    useWaitForTransactionReceipt({ hash });

  const entriesQuery = useReadContract({
    abi: guestbookAbi,
    address: guestbookContractAddress,
    functionName: "getRecentEntries",
    args: [BigInt(8)],
    query: {
      enabled: Boolean(guestbookContractAddress),
      refetchInterval: 12000,
    },
  });

  const availableConnectors = useMemo(
    () =>
      connectors
        .filter((item) => item.type !== "mock")
        .sort((a, b) => {
          const score = (item: (typeof connectors)[number]) => {
            if (item.id === "baseAccount" || item.name === "Base Account") {
              return 0;
            }
            if (item.type === "injected") return 1;
            return 2;
          };

          return score(a) - score(b);
        }),
    [connectors],
  );
  const trimmedName = name.trim();
  const trimmedMessage = message.trim();
  const canSign =
    Boolean(guestbookContractAddress) &&
    Boolean(trimmedName) &&
    Boolean(trimmedMessage) &&
    trimmedName.length <= MAX_NAME_LENGTH &&
    trimmedMessage.length <= MAX_MESSAGE_LENGTH &&
    isConnected &&
    chainId === base.id;

  function submitEntry() {
    if (!guestbookContractAddress || !trimmedName || !trimmedMessage) return;

    setStatus("Wallet signature requested. Confirm the guestbook entry.");
    writeContract({
      address: guestbookContractAddress,
      abi: guestbookAbi,
      functionName: "signGuestbook",
      args: [trimmedName, trimmedMessage],
      chainId: base.id,
    });
  }

  async function connectWallet() {
    const errors: string[] = [];
    setWalletStatus("Opening wallet...");

    for (const item of availableConnectors) {
      try {
        await connectAsync({ connector: item, chainId: base.id });
        setWalletStatus("");
        return;
      } catch (error) {
        errors.push(
          error instanceof Error
            ? `${item.name}: ${error.message}`
            : `${item.name}: connection failed`,
        );
      }
    }

    setWalletStatus(
      errors[0] ??
        "No wallet connector is available. Open this app inside Base App or install a wallet.",
    );
  }

  async function disconnectWallet() {
    try {
      if (connector) {
        await disconnectAsync({ connector });
      } else {
        await disconnectAsync();
      }
      setWalletStatus("Wallet disconnected. Tap Connect to reconnect.");
    } catch (error) {
      setWalletStatus(
        error instanceof Error ? error.message : "Could not disconnect wallet.",
      );
    }
  }

  const entries = (entriesQuery.data as GuestbookEntry[] | undefined) ?? [];
  const statusText = confirmed
    ? "Guestbook entry confirmed on Base. Your note is now onchain."
    : writeError
      ? writeError.message
      : status;

  return (
    <main className="min-h-screen bg-[#fbf7ef] text-[#1f1305]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between border-b border-[#1f1305] pb-3">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full border border-[#1f1305] bg-[#f9df8f]">
              <NotebookPen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#7d4f11]">
                Base Guestbook
              </p>
              <h1 className="font-serif text-xl font-bold sm:text-2xl">
                Leave an onchain note.
              </h1>
            </div>
          </div>

          {isConnected ? (
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-[#1f1305] bg-white px-3 py-2 text-sm font-semibold">
                {shortAddress(address)}
              </span>
              <button
                className="rounded-full border border-[#1f1305] bg-[#1f1305] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                disabled={disconnecting}
                onClick={disconnectWallet}
              >
                {disconnecting ? "Disconnecting" : "Disconnect"}
              </button>
            </div>
          ) : (
            <button
              className="inline-flex items-center gap-2 rounded-full border border-[#1f1305] bg-[#1f1305] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              disabled={availableConnectors.length === 0 || connecting}
              onClick={connectWallet}
            >
              {connecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wallet className="h-4 w-4" />
              )}
              Connect
            </button>
          )}
          {walletStatus ? (
            <p className="w-full text-right text-xs font-semibold text-[#6f5b43]">
              {walletStatus}
            </p>
          ) : null}
        </div>

        <div className="grid flex-1 gap-4 py-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.75fr)]">
          <section className="rounded-[28px] border border-[#1f1305] bg-[radial-gradient(circle_at_top_left,_rgba(249,223,143,0.75),_transparent_42%),linear-gradient(180deg,#fff7e5_0%,#fffaf4_100%)] p-4 shadow-[0_20px_50px_rgba(31,19,5,0.08)] sm:p-6">
            <div className="max-w-2xl">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#1f1305] bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.18em]">
                <Feather className="h-3.5 w-3.5" />
                Public wall
              </p>
              <h2 className="max-w-xl font-serif text-4xl leading-tight sm:text-6xl">
                Sign a living guestbook built on Base.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-[#5b4630] sm:text-lg">
                Each note is a simple onchain signature: wallet, name, message,
                and timestamp. No minting detour, just a clear social action.
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[22px] border border-[#1f1305] bg-white/80 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7d4f11]">
                  Step 1
                </p>
                <p className="mt-2 text-lg font-semibold">Write a short note</p>
              </div>
              <div className="rounded-[22px] border border-[#1f1305] bg-white/80 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7d4f11]">
                  Step 2
                </p>
                <p className="mt-2 text-lg font-semibold">Confirm on Base</p>
              </div>
              <div className="rounded-[22px] border border-[#1f1305] bg-white/80 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7d4f11]">
                  Step 3
                </p>
                <p className="mt-2 text-lg font-semibold">Show up on the wall</p>
              </div>
            </div>

            <div className="mt-8">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-serif text-2xl">Recent notes</h3>
                <span className="text-sm font-semibold text-[#7d4f11]">
                  {entries.length ? `${entries.length} loaded` : "Waiting for first notes"}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {entries.length ? (
                  entries.map((entry, index) => (
                    <article
                      className={`rounded-[24px] border border-[#1f1305] p-4 shadow-[0_12px_30px_rgba(31,19,5,0.06)] ${noteColors[index % noteColors.length]}`}
                      key={`${entry.writer}-${entry.timestamp.toString()}-${index}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-serif text-2xl leading-none">
                            {entry.name}
                          </p>
                          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#5b4630]">
                            {shortAddress(entry.writer)}
                          </p>
                        </div>
                        <span className="rounded-full border border-[#1f1305] bg-white/80 px-3 py-1 text-xs font-semibold">
                          {timeLabel(entry.timestamp)}
                        </span>
                      </div>
                      <p className="mt-4 text-base leading-7 text-[#2e2011]">
                        {entry.message}
                      </p>
                    </article>
                  ))
                ) : (
                  <div className="col-span-full rounded-[24px] border border-dashed border-[#1f1305] bg-white/70 p-6 text-[#5b4630]">
                    <p className="font-serif text-2xl">The wall starts with you.</p>
                    <p className="mt-2 text-base leading-7">
                      Once the contract is deployed and your first note is signed,
                      recent guestbook entries will appear here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="flex flex-col gap-4">
            <section className="rounded-[28px] border border-[#1f1305] bg-white p-4 shadow-[0_20px_50px_rgba(31,19,5,0.08)] sm:p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-[#f6c8db]">
                  <PenLine className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl">Write your note</h3>
                  <p className="text-sm text-[#6b5640]">
                    Keep it short, readable, and worth putting onchain.
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                <label className="grid gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-[#7d4f11]">
                    Display name
                  </span>
                  <input
                    className="rounded-[18px] border border-[#1f1305] bg-[#fffaf4] px-4 py-3 text-base outline-none"
                    maxLength={MAX_NAME_LENGTH}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                  <span className="text-right text-xs font-semibold text-[#7d4f11]">
                    {name.length}/{MAX_NAME_LENGTH}
                  </span>
                </label>

                <label className="grid gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-[#7d4f11]">
                    Message
                  </span>
                  <textarea
                    className="min-h-36 rounded-[18px] border border-[#1f1305] bg-[#fffaf4] px-4 py-3 text-base outline-none"
                    maxLength={MAX_MESSAGE_LENGTH}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                  />
                  <span className="text-right text-xs font-semibold text-[#7d4f11]">
                    {message.length}/{MAX_MESSAGE_LENGTH}
                  </span>
                </label>
              </div>
            </section>

            <section className="rounded-[28px] border border-[#1f1305] bg-[#1f1305] p-4 text-white shadow-[0_20px_50px_rgba(31,19,5,0.16)] sm:p-5">
              <div className="flex items-center gap-3">
                <MessageSquareText className="h-5 w-5 text-[#f9df8f]" />
                <h3 className="font-serif text-2xl">Sign on Base</h3>
              </div>

              <div className="mt-4 grid gap-2 text-sm text-[#f6ead5]">
                <p className="flex items-center gap-2">
                  {trimmedName ? (
                    <CheckCircle2 className="h-4 w-4 text-[#f9df8f]" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-[#d8c3a9]" />
                  )}
                  Name added
                </p>
                <p className="flex items-center gap-2">
                  {trimmedMessage ? (
                    <CheckCircle2 className="h-4 w-4 text-[#f9df8f]" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-[#d8c3a9]" />
                  )}
                  Message ready
                </p>
                <p className="flex items-center gap-2">
                  {guestbookContractAddress ? (
                    <CheckCircle2 className="h-4 w-4 text-[#f9df8f]" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-[#d8c3a9]" />
                  )}
                  Contract configured
                </p>
              </div>

              {chainId !== base.id && isConnected ? (
                <button
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#f9df8f] px-4 py-3 font-semibold text-[#1f1305] disabled:opacity-60"
                  disabled={switching}
                  onClick={() => switchChain({ chainId: base.id })}
                >
                  {switching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wallet className="h-4 w-4" />
                  )}
                  Switch to Base
                </button>
              ) : (
                <button
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#f9df8f] px-4 py-3 font-semibold text-[#1f1305] disabled:opacity-60"
                  disabled={!canSign || signing || confirming}
                  onClick={submitEntry}
                >
                  {signing || confirming ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <NotebookPen className="h-4 w-4" />
                  )}
                  Sign guestbook
                </button>
              )}

              <p className="mt-4 min-h-14 text-sm leading-6 text-[#f6ead5]">
                {statusText}
              </p>

              {!guestbookContractAddress ? (
                <p className="rounded-[18px] border border-white/25 bg-white/10 p-3 text-xs leading-6 text-[#f6ead5]">
                  Add `NEXT_PUBLIC_GUESTBOOK_CONTRACT_ADDRESS` after deploying
                  the guestbook contract, then redeploy Vercel.
                </p>
              ) : null}

              {hash ? (
                <a
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#f9df8f] underline underline-offset-4"
                  href={`https://basescan.org/tx/${hash}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  View transaction
                </a>
              ) : null}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
