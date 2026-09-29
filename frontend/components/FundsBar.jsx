"use client";

import { formatGen } from "@/lib/units";

const LABEL = {
  APPROVED: "Paid to builder",
  SUBMITTED: "Proof under review",
  PENDING: "Locked, waiting for proof",
  FAILED: "Returned to funder",
  FORFEITED: "Returned to funder",
  CANCELLED: "Returned to funder",
};

export default function FundsBar({ vault }) {
  const total = vault.milestones.reduce((sum, m) => sum + Number(m.amount), 0) || 1;
  return (
    <div className="funds" role="img" aria-label={`Funds for ${vault.title}`}>
      <div className="funds-bar">
        {vault.milestones.map((m, i) => (
          <div
            key={i}
            className={`seg seg-${m.status.toLowerCase()}`}
            style={{ flexGrow: Math.max(Number(m.amount) / total, 0.06) }}
            title={`${m.title}: ${formatGen(m.amount)} GEN – ${LABEL[m.status] || m.status}`}
          />
        ))}
      </div>
      <div className="funds-legend">
        <span>
          <i className="dot seg-approved" /> Paid {formatGen(vault.released)} GEN
        </span>
        <span>
          <i className="dot seg-pending" /> Still locked{" "}
          {formatGen(
            vault.milestones
              .filter((m) => m.status === "PENDING" || m.status === "SUBMITTED")
              .reduce((s, m) => s + BigInt(m.amount), 0n)
          )}{" "}
          GEN
        </span>
        <span>
          <i className="dot seg-failed" /> Returned {formatGen(vault.refunded)} GEN
        </span>
      </div>
    </div>
  );
}
