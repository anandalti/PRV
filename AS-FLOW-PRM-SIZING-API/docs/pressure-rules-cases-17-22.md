Cases 17–22 are defined in `KT_Docs/Copy of PRVPA_FRS_V2.0 (2024.07.26) 2.xlsx`, sheet `Table10-OverPressureRules`, rows 26–37. They apply when ASME Section VIII is enabled, Sizing Basis is Fire Case, and multiple valves are selected. All pressures below are gauge pressures in psig. `P` is the low-set pressure; `M` is System MAWP; `H` is the high-set pressure.

| Case | Source rows | MAWP and set-pressure conditions | Default overpressure | Minimum | Maximum | High-set pressure range |
| --- | --- | --- | --- | --- | --- | --- |
| 17 | 26–27 | M blank or P = M; P ≤ 4/0.21 | 0.21P | 3 | 4 | P ≤ H ≤ 1.10P |
| 18 | 28–29 | M blank or P = M; 4/0.21 < P < 30 | 0.21P | 3 | 0.21P | P ≤ H ≤ 1.10P |
| 19 | 30–31 | M blank or P = M; P ≥ 30 | 0.21P | 0.10P | 0.21P | P ≤ H ≤ 1.10P |
| 20 | 32–33 | P < M; M ≤ 4/0.21; P < 30 | 0.21P | 3 | 4 + M − P | P ≤ H ≤ 1.10M |
| 21 | 34–35 | P < M; M > 4/0.21; P < 30 | 0.21P | 3 | 0.21M + M − P | P ≤ H ≤ 1.10M |
| 22 | 36–37 | P < M; M > 4/0.21; P ≥ 30 | 0.21P | 0.10P | 0.21M + M − P | P ≤ H ≤ 1.10M |

For every high-set row, the documented expression is `Pover,H = P + Pover,L − H`. It uses the selected low-set overpressure, including a permitted manual value. The default does not derive from an existing percentage. The six existing fire defaults of `0.21 * SetPressure` already match column K and are retained.

The workbook includes equality at `4/0.21` in both cases 17 and 18. Case 17 owns equality in the expressions so only one case matches; both rows give the same default and limits at that point. Case 20 owns MAWP equality at this threshold, as specified in J32. Nonpositive set pressures do not activate these rules; general required/pressure validation remains responsible for them. Empty overpressure does not activate range errors.

`v2/data/SectionVIIIFireMultiValveRules.json` stores the conditions, defaults, limits, and high-set expressions with source row numbers. `v2/service/fieldCalculations/SectionVIIIFireMultiValveRules.js` evaluates them through the application's existing expression parser; callers must first convert pressure values to psig. The low-set range and total-pressure validations are synchronized into `SectionVIIIOverPressureRules.json`, `workflowSections27.json`, and `workflowSectionFields/FieldExpressions.json`. Existing generic range-message IDs remain compatible. The high-set runtime in `MultiValveSection.js` uses the same case definitions.

Apply the same idempotent migration to an existing database, then restart the API to clear cached field expressions:

```powershell
node scripts/sync-pressure-rule-expressions.js --database --env .env.local
node --test test/section-viii-fire-rules.test.js test/section-viii-fire-multivalve-runtime.test.js
```

The migration updates existing `FieldExpression.Expression` values by exact previous-expression match and preserves record IDs. Fresh local database setup uses the updated snapshot automatically. `--database` is optional; without it only repository snapshots are synchronized.

The newer `05.9066.034 PRV2SIZE Design Spec (2026.05.22) - ras 1.xlsx`, sheet `Part IV`, N58–N60 confirms the high-set pressure range and formula and adds the high-set minimum `POVER,H ≥ 10% PSET,H`. Notes I99–I106 require equal flowing pressures for all valves and state that high-set overpressure and its percentage are always calculated. For enabled Section VIII applications, the service therefore preserves the calculated value, reports violations, and disables Proceed; it no longer clamps the fire high-set overpressure or silently clears the resulting error. Its overpressure and percentage columns are read-only. For example, Pset,L=18, Pover,L=3.78 and Pset,H=19 give Pover,H=2.78 psig; clamping that value to 3 psig would violate the shared relieving-pressure requirement. The existing fire behavior is retained when Section VIII is disabled or unspecified; these numbered code cases do not establish requirements for that separate path.

High-set pressure limits are compared at full calculation precision using a relative tolerance of `1e-9` (with a 1-psig reference minimum), before display formatting. This prevents false errors from independently rounded values and unit round-trips at an exact limit. Numeric zero and string `"0"` overpressure still trigger the documented positive minimum; null/undefined values normalize to blank before expression evaluation, including a directly edited field.

There is an internal default inconsistency in the 2026 design sheet: K87 describes `MAWP − Pset,L + 21% MAWP`, while section 4.1.2, I131–I133 and I139–I140 explicitly specifies `21% Pset` for fire and multiple-valve fire defaults. The numbered FRS cases and the dedicated 2026 default section agree, so the implementation retains `21% Pset`. The MAWP-dependent expression remains the permitted maximum for cases 21–22, as explicitly specified in the FRS. The 2026 N56 general low-set range omits the detailed 3/4-psig thresholds in the FRS; the requested numbered cases govern those low-pressure boundaries.
