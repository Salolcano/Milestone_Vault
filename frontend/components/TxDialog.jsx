"use client";

import { GenLayerTransactionPanel } from "@genlayer/transaction-kit-react";
import "@genlayer/transaction-kit-react/styles.css";
import { CONTRACT_ADDRESS, KIT_NETWORK } from "@/lib/config";

export default function TxDialog({ kit, request, onClose, onDone }) {
  if (!request || !kit) return null;

  const tx = {
    kind: "write",
    address: CONTRACT_ADDRESS,
    method: request.method,
    args: request.args,
  };
  if (request.value !== undefined) tx.value = request.value;

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label={request.title}>
      <div className="dialog">
        <div className="dialog-head">
          <h2>{request.title}</h2>
          <button type="button" className="btn-quiet" onClick={onClose}>
            Close
          </button>
        </div>
        {request.note ? <p className="dialog-note">{request.note}</p> : null}
        <GenLayerTransactionPanel
          kit={kit}
          tx={tx}
          network={KIT_NETWORK}
          trackUntil="decided"
          onDone={() => onDone && onDone()}
        />
      </div>
    </div>
  );
}
