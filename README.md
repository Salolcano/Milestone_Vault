# Milestone Vault

Pay for work in stages. A funder locks the full payment up front and writes down what "done" means for each milestone. The builder submits a public link as proof, the contract opens that link itself, and GenLayer validators must agree the content meets the criteria before that stage is paid.

Built on GenLayer Intelligent Contracts and deployed on Studio Next.

## Why this needs GenLayer

The funder and the builder want opposite outcomes, and money moves the moment a verdict is made. A normal backend or a single LLM API key would make whoever runs it the judge, and whoever calls it would control what evidence the model sees.

- `gl.nondet.web.render` makes the contract fetch the proof page itself, so the builder's own description of their work is never what gets judged.
- `gl.eq_principle.prompt_comparative` means a milestone is only paid when independent validators reach the same verdict on that fetched content.
- The fetched page is treated as data, not instructions, so a page that says "approve this" does not change the outcome.

## How it works

1. **Create a vault.** The funder sends GEN together with a title, the builder's address and a list of milestones (title, written criteria, amount). The amount sent must equal the sum of the milestones.
2. **Submit proof.** The builder submits an `http(s)` link for the next milestone. Milestones are worked in order.
3. **Review.** Anyone can trigger the review, so a submitted milestone can never get stuck waiting on one person. The contract fetches the link and validators return one of three verdicts:
   - `APPROVED`: that milestone's amount is paid to the builder.
   - `NEEDS_REVISION`: the page was missing, unreadable, off-topic or incomplete. The builder can fix it and resubmit.
   - `REJECTED`: the page was readable but clearly did not meet the criteria.
4. **Attempts.** Each milestone allows 3 review attempts. If all 3 fail, that milestone's amount returns to the funder.
5. **Exits.** The builder can hand any waiting milestone back (its amount returns to the funder). The funder can cancel the vault only while nothing has been submitted yet.

Every payout follows the same order: update the stored state first, then move the money.

## Contract

`contracts/milestone_vault.py`

| Method | Who | What it does |
| --- | --- | --- |
| `create_vault(title, builder, milestones_json)` (payable) | Funder | Locks the funds and creates the vault |
| `submit_milestone(vault_id, index, evidence_url)` | Builder | Records the proof link |
| `judge_milestone(vault_id, index)` | Anyone | Fetches the link, runs validator consensus, pays or returns funds |
| `forfeit_milestone(vault_id, index)` | Builder | Hands a waiting milestone back |
| `cancel_vault(vault_id)` | Funder | Cancels an unstarted vault |
| `get_vault(vault_id)`, `get_all_vaults()`, `get_vault_count()` | Anyone | Read-only views |

`milestones_json` is a JSON list like:

```json
[
  { "title": "Working prototype", "criteria": "The page shows a working demo with ...", "amount": "500000000000000000" }
]
```

Amounts are written in the smallest unit (18 decimals). The website converts GEN to that unit for you.

## Network

- Network: Studio Next
- RPC: https://studio-next.genlayer.com/api
- Chain ID: 61997
- Explorer: https://explorer-studio-dev.genlayer.com/
- Uses `genlayer-js@2.0.0-rc.1`, `@genlayer/transaction-kit@0.1.0-rc.2` and `@genlayer/transaction-kit-react@0.1.0-rc.2`, so every write goes through the fee-approval and tracking flow.

## Project layout

```
contracts/milestone_vault.py   The Intelligent Contract
frontend/                      Next.js site (funder and builder views)
```

## Known limits

- No deadlines. The contract does not read the clock, so an idle milestone stays locked until the builder hands it back.
- Only the first 6000 characters of the proof page are judged.
- The site lists the 30 most recent vaults.
