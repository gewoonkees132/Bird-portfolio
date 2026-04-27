# CSS Audit — Design

**Date:** 2026-04-27
**Target files:** `style.css` (1591 lines), `index.html` (805 lines, only where supporting CSS findings)
**Browser-support floor:** Baseline Widely Available
**Output:** findings report + prioritized remediation queue feeding `writing-plans`

## Purpose

Produce a deep, one-time code audit of `style.css` that surfaces structural and modern-CSS improvements following best practices, and stages them as a triaged punch list ready for remediation. The audit treats the file as the system of record for the brand — improvements must respect the workspace's "no build, single file, definitive now" constraints.

## Scope

**In scope.**
- All of `style.css`: token discipline, file organization, naming conventions, selector specificity & cascade hygiene, dead code & duplication, comment signal-to-noise, modern-CSS leverage (Baseline Widely Available features only).
- `index.html` only where a CSS finding's recommendation requires or is supported by a corresponding HTML change. The HTML is not audited on its own merit.

**Out of scope.**
- Re-litigation of Phase 3 close-out work (WCAG-AA contrast, skip-link, heading order, focus rings). The audit assumes these correct unless a regression is tripped over incidentally.
- Runtime / browser verification. This is a code audit; render-correctness checks belong to the post-remediation phase.
- Build tooling, framework adoption, file splitting. Workspace explicitly forbids.
- Brand-naming changes to identity tokens (`--field`, `--blue`, `--charcoal`) or DNA concepts (`Munich '72`, `hand-crafted`) without surfacing as a tension. Renames of derived/structural tokens are in scope.

## Constraints

- **No build step.** Single `style.css` file; recommendations must work without preprocessing.
- **Baseline Widely Available** features only. Rules out `@scope` (Chromium-only). In bounds: `@layer`, `:is()`, `:where()`, `:has()`, `@container`, `color-mix()`, `clamp()`, logical properties, custom properties.
- **Per-phase CHANGELOG cadence.** The remediation phase produces one rolled-up CHANGELOG entry per phase, not per individual change (per relaxed governance in `CLAUDE.md`).
- **Tension-surface gate.** Before acting on a finding whose recommendation (a) renames or removes a brand-named concept (`--field`, `--blue`, `--charcoal`, `Munich '72`, `hand-crafted`) or (b) has two materially different aesthetic outcomes, the agent surfaces the trade-off for Kees's call. Otherwise, the agent proceeds under the "plausibly positive" bar. Cross-workspace impact (e.g., the bird-portfolio runtime) is not part of this gate — per the workspace isolation rule, downstream consumers are out of scope.

---

## §1 · Audit axes (the rubric)

Seven axes. Each finding cites exactly one axis, with a `see also: §N` cross-reference for cross-axis observations.

| # | Axis | Scope | Critical-finding example |
|---|------|-------|------|
| **1** | **Token discipline** | The two `:root` blocks (L14–29 grid; L31–87 palette / type / motion / overlay / placeholder / viewport-edge); naming consistency; single-source-of-truth | A hex literal in a rule that duplicates an existing token; a defined token never referenced anywhere |
| **2** | **File organization & structural narrative** | Banner-comment structure; the `RUNTIME · BEGIN SPECIMEN` divider; ordering and contiguity of related rules; **file preamble quality (does the file open with a usable introduction explaining what's in it and how it's organized?); structural narrative across the whole file** | A runtime rule living in the specimen block; a banner header that no longer matches the rules under it; absence of a top-of-file map for a 1591-line single-file document |
| **3** | **Naming conventions** | `sr-*` prefix discipline; BEM `block__element--modifier` uniformity; runtime classes (`.stage`, `.plane`, `.photo`) vs. specimen classes (`sr-*`) | A specimen class without the `sr-` prefix; a class using `sr-foo-bar` where BEM convention says `sr-foo__bar` |
| **4** | **Selector specificity & cascade hygiene** | The lone `!important`; descendant chains; source-order dependencies | A `!important` that exists only to defeat another selector that could be flattened with `:where()`; a 4-level descendant chain that could collapse to a single class |
| **5** | **Dead code & duplication** | Unused selectors (cross-referenced against `index.html`); near-duplicate rule blocks; magic numbers off the cell / gutter / stride ladder | A selector that doesn't match any element rendered on the page; a margin value that breaks the spacing ladder for no documented reason |
| **6** | **Comment signal-to-noise** | Explanations vs. restating-the-code; outdated rationales; banner-comment density | A comment whose math or assertion is now wrong; a banner-comment that contradicts the rules below it |
| **7** | **Modern CSS leverage (Baseline Widely Available)** | Opportunities for `@layer`, `:is()` / `:where()`, logical properties, `clamp()`, `color-mix()`, `:has()`, `@container`; progressive-enhancement wrapping where needed | The runtime/specimen split currently maintained by source order + comment is a textbook `@layer runtime, specimen` case |

---

## §2 · Severity definitions

Three tiers. Calibrated for consistency across all 7 axes.

**Critical** — *fix before the next version bump*
- Demonstrably wrong: code contradicts its own comment/intent, or a comment's claim is now false
- Functional regression risk under common edits
- Accessibility or correctness defect newly discovered (not Phase 3 re-litigation)
- Token discipline breaks with active drift risk (e.g., a hex literal whose value has diverged from the token it duplicates)

**Recommended** — *clear net-positive change, not a bug*
- High-payoff modern-CSS adoptions implied by current code structure
- Naming or structural inconsistencies that confuse but don't break
- Duplicate or near-duplicate rule blocks
- Stale or redundant comments
- Magic numbers that should be tokens
- Confirmed-unused dead selectors

**Polish** — *nits and taste calls; ship-or-skip*
- Minor formatting, comment wording, ordering for readability
- Speculative modern-CSS adoptions where the current code is already idiomatic
- Stylistic consistency with no functional payoff

**Calibration rules.**
- **Ties go to *Recommended*.** Matches the "plausibly positive" governance bar.
- **Single-axis tagging.** Cross-axis findings get the most-actionable axis plus `see also: §N`; severity from the chosen axis's lens.
- **Intent-respect override.** A finding contradicting a deliberate choice already documented (in code comments or `CLAUDE.md`) is downgraded to *Polish* with a note.

---

## §3 · Execution method

Three passes. Each produces a concrete artifact feeding the next.

### Pass 1 — Structural read

Read `style.css` end-to-end once. Outputs:
- **Section map:** every banner-comment header → line range → purpose, in a single table (~30–40 rows).
- **Raw observation list:** unclassified notes captured during the read.

### Pass 2 — Axis sweeps

For each of the 7 axes, run a targeted check against the section map.

| Axis | Tactic |
|------|--------|
| **1. Token discipline** | Grep hex/rgba literals outside `:root` blocks; grep `var(--…)` usages; cross-tab defined-vs-referenced |
| **2. File organization & narrative** | Verify each section's rules match its banner header; check the `RUNTIME · BEGIN SPECIMEN` divider for leakage in either direction; evaluate file preamble against the "best-practice introduction" criteria below |
| **3. Naming conventions** | Enumerate all class selectors; partition into runtime / specimen / other; sort `sr-*` by structure to surface BEM anomalies |
| **4. Specificity & cascade** | Locate the lone `!important`; flag descendant chains ≥ 3 levels; identify same-selector overrides relying on source order |
| **5. Dead code & duplication** | For each class selector in `style.css`, grep `index.html` for usage → "unused" list; spot identical or near-identical declaration blocks; flag magic numbers not on the spacing-token ladder (`--tick` 2px / `--page-edge` 8px / `--gutter` 24px / `--cell` 120px / `--stride` 144px, and integer multiples thereof) |
| **6. Comments** | Spot-check banner comments against the code below them; flag restate-the-code comments; flag references to removed tokens/classes |
| **7. Modern CSS leverage** | Score the runtime/specimen split for `@layer`; scan for selector chains collapsible via `:is()`/`:where()`; spot `color-mix()` candidates (e.g., `--field-overlay` and `--blue-soft` are derived rgba); spot logical-property and `clamp()` opportunities; check `:has()` / `@container` use cases |

**File-preamble criteria (axis 2).** A best-practice preamble for a 1591-line single-file specimen should answer, in 10-30 lines at the top:
1. What this file is (one line)
2. What lives in it, in order (a section index — banner names + line ranges or anchors)
3. How to navigate it (the runtime/specimen split convention; the banner-comment style)
4. Edit rules (e.g., "edit only the grid `:root` to retune the system" — already present at L13)

The audit will assess presence and quality of each, and propose a concrete preamble shape if absent.

### Pass 3 — Synthesize & triage

- Merge axis findings; deduplicate; apply cross-axis tagging
- Apply calibration rules from §2
- Sort by severity, then by axis
- Write the report (template in §4)

---

## §4 · Report template

Written to `docs/audits/2026-04-27-css-audit.md`.

```markdown
# CSS Audit — Style Reference (2026-04-27)

**Target:** style.css (1591 lines), index.html (where supporting CSS)
**Spec:** docs/specs/2026-04-27-css-audit-design.md
**Browser-support floor:** Baseline Widely Available
**Triage:** Critical / Recommended / Polish (see spec §2)

## Executive summary
- Findings: N Critical · N Recommended · N Polish
- Headline observations (3-5 bullets — patterns, not individual findings)

## Section map (Pass 1 artifact)
| Lines | Banner header | Purpose |
| ----- | ------------- | ------- |
| ...   | ...           | ...     |

## Findings

### Critical

#### C-1 · [one-line title]
- **Axis:** §N (axis name)
- **Location:** style.css:LXXX-LYYY
- **Observation:** what's there now
- **Why it matters:** rationale tied to the rubric
- **Recommendation:** what to change
- **See also:** C-N / R-N (if cross-axis)

#### C-2 · ...

### Recommended

#### R-1 · ...

### Polish

#### P-1 · ...

## Out-of-scope log
Things noticed but not filed (with reason).

## Next steps
Run `writing-plans` against this report → phased remediation plan in `docs/plans/`.
```

**Finding ID scheme.** `C-1`, `C-2`, … (Critical); `R-1`, `R-2`, … (Recommended); `P-1`, `P-2`, … (Polish). Stable across remediation — `writing-plans` and CHANGELOG entries reference findings by ID.

---

## §5 · Remediation handoff

**Trigger.** Once the report is written, run `writing-plans` against it. Input: the report's findings list. Output: phased implementation plan at `docs/plans/2026-04-27-css-audit-remediation.md`.

**Remediation-phase mapping (default).** These are remediation phases (`R-Phase`) — distinct from the existing v1 close-out's Phase 1/2/3 already named in `CHANGELOG.md`. Naming this way prevents collision in CHANGELOG and commit messages.
- **R-Phase 1:** all *Critical* findings — must land before any other phase.
- **R-Phase 2:** all *Recommended* findings, grouped by axis so per-phase CHANGELOG entries are coherent.
- **R-Phase 3:** all *Polish* findings — optional; skip-or-batch into a future close-out.

`writing-plans` may resequence within an R-Phase if a dependency order requires it (e.g., a `@layer` adoption should precede a specificity flattening that relies on it).

**Commit & CHANGELOG cadence.**
- One CHANGELOG entry per phase, not per finding.
- Commits within a phase can be granular for clean rollback, but the CHANGELOG rolls them up.
- Each finding ID resolved (`C-1`, `R-3`, …) is named in the entry's prose for traceability.
- Format mirrors existing CHANGELOG entries: dated header, prose paragraph, references to spec/plan.

**Tension-surface gate (residual brand-decision check).**
A finding triggers a pre-action surface if either of:
- The recommendation renames or removes a brand-named concept (`--field`, `--blue`, `--charcoal`, `Munich '72`, `hand-crafted`).
- Two valid recommendations exist with materially different aesthetic outcomes.

Otherwise, the agent proceeds under the "plausibly positive" bar. Cross-workspace consumers (the bird-portfolio runtime) are not part of this gate — see the Constraints section.

**Definition of done.**
- All Critical findings resolved.
- Recommended findings resolved or explicitly deferred (deferred ones noted in CHANGELOG).
- Polish findings: ship-or-skip, no obligation.
- CHANGELOG has one entry per R-Phase executed.
- Spec, report, and plan all committed.

---

## Deliverables

1. **This spec** at `docs/specs/2026-04-27-css-audit-design.md` — the methodology for this audit. Per workspace conventions ("definitive now; deprecation lists become drift"), it is dated and one-time; future audits author their own spec, borrowing structure from this one if useful.
2. **The report** at `docs/audits/2026-04-27-css-audit.md` — produced by executing this spec.
3. **The remediation plan** at `docs/plans/2026-04-27-css-audit-remediation.md` — produced by running `writing-plans` against the report.
4. **CHANGELOG entries** — one per R-Phase executed.
