"use client";

import { useState } from "react";
import { parseGen, formatGen } from "@/lib/units";

const blank = () => ({ title: "", criteria: "", amount: "" });

export default function CreateVaultForm({ account, onAction }) {
  const [title, setTitle] = useState("");
  const [builder, setBuilder] = useState("");
  const [items, setItems] = useState([blank()]);
  const [error, setError] = useState("");

  const update = (i, field, value) =>
    setItems(items.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)));

  const amounts = items.map((it) => parseGen(it.amount));
  const total = amounts.every((a) => a !== null && a > 0n) ? amounts.reduce((s, a) => s + a, 0n) : null;

  function submit(e) {
    e.preventDefault();
    setError("");
    if (!account) return setError("Connect your wallet first.");
    if (!title.trim()) return setError("Give the vault a title.");
    if (!/^0x[0-9a-fA-F]{40}$/.test(builder.trim()))
      return setError("The builder address must start with 0x and be 42 characters long.");
    for (const [i, it] of items.entries()) {
      if (!it.title.trim()) return setError(`Milestone ${i + 1} needs a title.`);
      if (it.criteria.trim().length < 10)
        return setError(`Milestone ${i + 1} needs criteria of at least 10 characters.`);
      if (amounts[i] === null || amounts[i] <= 0n)
        return setError(`Milestone ${i + 1} needs an amount above zero, like 0.5.`);
    }
    const payload = items.map((it, i) => ({
      title: it.title.trim(),
      criteria: it.criteria.trim(),
      amount: amounts[i].toString(),
    }));
    onAction({
      title: "Lock funds and create vault",
      note: `You are locking ${formatGen(total)} GEN. It is released one milestone at a time as proof is approved.`,
      method: "create_vault",
      args: [title.trim(), builder.trim(), JSON.stringify(payload)],
      value: total,
    });
  }

  return (
    <form className="create" onSubmit={submit}>
      <h2>Start a vault</h2>
      <label>
        What is being built?
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="Landing page for the spring campaign" />
      </label>
      <label>
        Builder wallet address
        <input value={builder} onChange={(e) => setBuilder(e.target.value)} placeholder="0x…" spellCheck={false} />
      </label>

      <div className="items">
        {items.map((it, i) => (
          <fieldset key={i} className="item">
            <legend>Milestone {i + 1}</legend>
            <input
              value={it.title}
              onChange={(e) => update(i, "title", e.target.value)}
              placeholder="Working prototype"
              maxLength={120}
              aria-label={`Milestone ${i + 1} title`}
            />
            <textarea
              value={it.criteria}
              onChange={(e) => update(i, "criteria", e.target.value)}
              placeholder="What must the public page show for this to count as done?"
              rows={3}
              maxLength={1000}
              aria-label={`Milestone ${i + 1} criteria`}
            />
            <div className="item-row">
              <input
                value={it.amount}
                onChange={(e) => update(i, "amount", e.target.value)}
                placeholder="Amount in GEN, e.g. 0.5"
                inputMode="decimal"
                aria-label={`Milestone ${i + 1} amount in GEN`}
              />
              {items.length > 1 ? (
                <button type="button" className="btn-quiet" onClick={() => setItems(items.filter((_, idx) => idx !== i))}>
                  Remove
                </button>
              ) : null}
            </div>
          </fieldset>
        ))}
      </div>

      {items.length < 8 ? (
        <button type="button" className="btn-quiet" onClick={() => setItems([...items, blank()])}>
          Add another milestone
        </button>
      ) : null}

      <div className="create-foot">
        <p className="muted">{total ? `Total to lock: ${formatGen(total)} GEN` : "Enter an amount for every milestone."}</p>
        <button type="submit" className="btn">
          Review and lock funds
        </button>
      </div>
      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
