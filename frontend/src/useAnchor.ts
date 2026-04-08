// ─── GrainChain KZ — Anchor + Phantom wallet hook ─────────────────────────────
import { useState, useEffect, useCallback } from "react";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { AnchorProvider, Program, Idl } from "@coral-xyz/anchor";
import IDL from "./idl.json";

const CLUSTER_URL = "https://api.devnet.solana.com";
const PROGRAM_ID  = new PublicKey("4NutBXSNJ9tJLFueRwRd6PjQPzgricziys9uTBLuP8n7");

export interface AnchorState {
  connected:  boolean;
  publicKey:  PublicKey | null;
  program:    Program | null;
  provider:   AnchorProvider | null;
  connection: Connection;
  connect:    () => Promise<void>;
  disconnect: () => Promise<void>;
  balance:    number; // SOL
}

const connection = new Connection(CLUSTER_URL, "confirmed");

// Minimal wallet adapter shim wrapping window.solana (Phantom)
function makeWalletAdapter(publicKey: PublicKey) {
  const phantom = (window as any).solana;
  return {
    publicKey,
    signTransaction:     (tx: any) => phantom.signTransaction(tx),
    signAllTransactions: (txs: any) => phantom.signAllTransactions(txs),
  };
}

export function useAnchor(): AnchorState {
  const [publicKey,  setPublicKey]  = useState<PublicKey | null>(null);
  const [program,    setProgram]    = useState<Program | null>(null);
  const [provider,   setProvider]   = useState<AnchorProvider | null>(null);
  const [balance,    setBalance]    = useState(0);

  // Re-initialise Anchor whenever the connected key changes
  useEffect(() => {
    if (!publicKey) { setProgram(null); setProvider(null); return; }
    const wallet   = makeWalletAdapter(publicKey);
    const prov     = new AnchorProvider(connection, wallet as any, { commitment: "confirmed" });
    const prog     = new Program(IDL as Idl, prov);
    setProvider(prov);
    setProgram(prog);
    // Fetch SOL balance
    connection.getBalance(publicKey).then(b => setBalance(b / 1e9)).catch(() => {});
  }, [publicKey?.toBase58()]);

  const connect = useCallback(async () => {
    const phantom = (window as any).solana;
    if (!phantom?.isPhantom) {
      alert("Phantom wallet not found. Install it at phantom.app");
      return;
    }
    try {
      const resp = await phantom.connect();
      setPublicKey(new PublicKey(resp.publicKey.toString()));
    } catch (e) {
      console.error("connect error", e);
    }
  }, []);

  const disconnect = useCallback(async () => {
    const phantom = (window as any).solana;
    if (phantom) await phantom.disconnect().catch(() => {});
    setPublicKey(null);
  }, []);

  // Auto-reconnect if wallet already approved this site
  useEffect(() => {
    const phantom = (window as any).solana;
    if (phantom?.isPhantom) {
      phantom.connect({ onlyIfTrusted: true })
        .then((resp: any) => setPublicKey(new PublicKey(resp.publicKey.toString())))
        .catch(() => {}); // not connected yet — silently skip
    }
    // Listen for account changes
    phantom?.on?.("accountChanged", (pk: any) => {
      if (pk) setPublicKey(new PublicKey(pk.toString()));
      else    setPublicKey(null);
    });
    return () => { phantom?.removeAllListeners?.("accountChanged"); };
  }, []);

  return {
    connected:  !!publicKey,
    publicKey,
    program,
    provider,
    connection,
    connect,
    disconnect,
    balance,
  };
}
