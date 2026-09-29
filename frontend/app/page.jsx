"use client";

import { useCallback, useEffect, useState } from "react";
import CreateVaultForm from "@/components/CreateVaultForm";
import VaultCard from "@/components/VaultCard";
import TxDialog from "@/components/TxDialog";
import { connectWallet } from "@/lib/wallet";
import { readAllVaults } from "@/lib/chain-read";
import { CONTRACT_ADDRESS, EXPLORER_URL } from "@/lib/config";
import { shortAddress } from "@/lib/units";

export default function Home() {
  const [account, setAccount] = useState("");
  const [kit, setKit] = useState(null);
  const [vaults, setVaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [walletError, setWalletError] = useState("");
  const [request, setRequest] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const list = await readAllVaults();
      setVaults(list);
      setLoadError("");
    } catch (err) {
      setLoadError("Could not read vaults from the network. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 20000);
    return () => clearInterval(timer);
  }, [refresh]);

  async function connect() {
    setWalletError("");
    try {
      const result = await connectWallet();
      setAccount(result.account);
      setKit(result.kit);
    } catch (err) {
      setWalletError(err && err.message ? err.message : "Could not connect the wallet.");
    }
  }

  return (
    <main>
      <header className="top">
        <div className="brand">
          <span className="mark" aria-hidden="true" />
          <span>Milestone Vault</span>
        </div>
        <div className="top-right">
          {CONTRACT_ADDRESS ? (
            <a className="muted" href={`${EXPLORER_URL}/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noreferrer">
              Contract {shortAddress(CONTRACT_ADDRESS)}
            </a>
          ) : null}
          {account ? (
            <span className="wallet-on">{shortAddress(account)}</span>
          ) : (
            <button type="button" className="btn" onClick={connect}>
              Connect wallet
            </button>
          )}
        </div>
      </header>
      {walletError ? (
        <p className="banner" role="alert">
          {walletError}
        </p>
      ) : null}

      <section className="intro">
        <h1>Pay for work in stages, and let validators decide when each stage is done.</h1>
        <p>
          A funder locks the full payment up front and writes down what &ldquo;done&rdquo; means for each milestone. The
          builder submits a public link as proof. The contract opens that link itself, and GenLayer validators must agree
          that what they see meets the criteria before the money moves.
        </p>
        <ol className="steps">
          <li>Funder locks the payment and sets the criteria for every milestone.</li>
          <li>Builder submits a proof link for the next milestone.</li>
          <li>Validators read the page and vote. Approved means that stage is paid.</li>
          <li>Not approved means the builder can fix it and try again, up to three attempts.</li>
        </ol>
      </section>

      <div className="layout">
        <aside>
          <CreateVaultForm account={account} onAction={setRequest} />
        </aside>

        <section className="list" aria-live="polite">
          <div className="list-head">
            <h2>Vaults</h2>
            <button type="button" className="btn-quiet" onClick={refresh}>
              Refresh
            </button>
          </div>
          {!CONTRACT_ADDRESS ? (
            <p className="empty">This site is not connected to a contract yet. Set the contract address and redeploy.</p>
          ) : loading ? (
            <p className="empty">Loading vaults…</p>
          ) : loadError ? (
            <p className="empty">{loadError}</p>
          ) : vaults.length === 0 ? (
            <p className="empty">No vaults yet. Connect your wallet and start the first one.</p>
          ) : (
            vaults.map((v) => <VaultCard key={v.id} vault={v} account={account} onAction={setRequest} />)
          )}
        </section>
      </div>

      <TxDialog
        kit={kit}
        request={account ? request : null}
        onClose={() => {
          setRequest(null);
          refresh();
        }}
        onDone={refresh}
      />
    </main>
  );
}
