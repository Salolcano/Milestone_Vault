"use client";

import { useState } from "react";
import FundsBar from "./FundsBar";
import { formatGen, shortAddress } from "@/lib/units";
import { MAX_ATTEMPTS } from "@/lib/config";

const DONE = ["APPROVED", "FAILED", "FORFEITED", "CANCELLED"];

const STATUS_TEXT = {
  PENDING: "Waiting for proof",
  SUBMITTED: "Ready for review",
  APPROVED: "Approved and paid",
  FAILED: "Out of attempts, returned",
  FORFEITED: "Handed back",
  CANCELLED: "Cancelled",
};

export default function VaultCard({ vault, account, onAction }) {
  const [drafts, setDrafts] = useState({});
  const me = (account || "").toLowerCase();
  const isBuilder = me && me === vault.builder.toLowerCase();
  const isFunder = me && me === vault.funder.toLowerCase();
  const active = vault.status === "ACTIVE";
  const unstarted = vault.milestones.every((m) => m.status === "PENDING" && m.attempts === 0);

  return (
    <article className="vault">
      <header className="vault-head">
        <div>
          <h3>{vault.title}</h3>
          <p className="muted">
            Funder {shortAddress(vault.funder)}
            {isFunder ? " (you)" : ""} · Builder {shortAddress(vault.builder)}
            {isBuilder ? " (you)" : ""}
          </p>
        </div>
        <div className="vault-total">
          <strong>{formatGen(vault.total)} GEN</strong>
          <span className={`pill pill-${vault.status.toLowerCase()}`}>{vault.status.toLowerCase()}</span>
        </div>
      </header>

      <FundsBar vault={vault} />

      <ol className="milestones">
        {vault.milestones.map((m, i) => {
          const earlierDone = vault.milestones.slice(0, i).every((x) => DONE.includes(x.status));
          const canSubmit = active && isBuilder && m.status === "PENDING" && earlierDone;
          const draft = drafts[i] || "";
          return (
            <li key={i} className={`milestone st-${m.status.toLowerCase()}`}>
              <div className="milestone-top">
                <strong>{m.title}</strong>
                <span className="amount">{formatGen(m.amount)} GEN</span>
              </div>
              <p className="criteria">{m.criteria}</p>
              <p className="status-line">
                <span className={`tag tag-${m.status.toLowerCase()}`}>{STATUS_TEXT[m.status] || m.status}</span>
                {m.attempts > 0 && m.status !== "APPROVED" ? (
                  <span className="muted"> · attempt {Math.min(m.attempts, MAX_ATTEMPTS)} of {MAX_ATTEMPTS} used</span>
                ) : null}
              </p>
              {m.evidence_url ? (
                <p className="evidence">
                  Proof:{" "}
                  <a href={m.evidence_url} target="_blank" rel="noreferrer">
                    {m.evidence_url}
                  </a>
                </p>
              ) : null}
              {m.reasoning ? (
                <p className="reasoning">
                  Validators said <b>{m.verdict.replace("_", " ").toLowerCase()}</b>: {m.reasoning}
                </p>
              ) : null}

              <div className="actions">
                {canSubmit ? (
                  <>
                    <input
                      type="url"
                      placeholder="https://link-to-your-finished-work"
                      value={draft}
                      onChange={(e) => setDrafts({ ...drafts, [i]: e.target.value })}
                      aria-label={`Proof link for ${m.title}`}
                    />
                    <button
                      type="button"
                      className="btn"
                      disabled={!/^https?:\/\//.test(draft)}
                      onClick={() =>
                        onAction({
                          title: "Submit proof",
                          note: "This records your link on-chain. Next, ask the validators to review it.",
                          method: "submit_milestone",
                          args: [vault.id, i, draft.trim()],
                        })
                      }
                    >
                      Submit proof
                    </button>
                    <button
                      type="button"
                      className="btn-quiet"
                      onClick={() =>
                        onAction({
                          title: "Hand milestone back",
                          note: "The locked amount for this milestone returns to the funder.",
                          method: "forfeit_milestone",
                          args: [vault.id, i],
                        })
                      }
                    >
                      Hand back
                    </button>
                  </>
                ) : null}
                {active && m.status === "SUBMITTED" && account ? (
                  <button
                    type="button"
                    className="btn"
                    onClick={() =>
                      onAction({
                        title: "Ask the validators to review",
                        note: "The contract fetches the proof link itself and validators judge it against the criteria. This can take a few minutes.",
                        method: "judge_milestone",
                        args: [vault.id, i],
                      })
                    }
                  >
                    Review with validators
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      {active && isFunder && unstarted ? (
        <div className="vault-foot">
          <button
            type="button"
            className="btn-quiet"
            onClick={() =>
              onAction({
                title: "Cancel vault",
                note: "Nothing has been submitted yet, so all locked funds return to you.",
                method: "cancel_vault",
                args: [vault.id],
              })
            }
          >
            Cancel vault and get funds back
          </button>
        </div>
      ) : null}
    </article>
  );
}
