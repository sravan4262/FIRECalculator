"use client";

const STEPS = [
  { title: "Check Your Credit & Finances", body: "Pull your credit report, check your score, and resolve any errors before applying. Most conventional loans require a 620+ score; the best rates start at 740+." },
  { title: "Set a Realistic Budget", body: "Use the 28/36 DTI rule as a ceiling, not a target. Factor in property taxes, insurance, maintenance (budget 1% of home value per year), and HOA fees." },
  { title: "Save for Down Payment & Closing Costs", body: "Aim for 20% down to avoid PMI. On top of that, budget 2–5% for closing costs — origination fees, title insurance, appraisal, and prepaid items." },
  { title: "Get Pre-Approved for a Mortgage", body: "A lender reviews your income, assets, and credit, then issues a pre-approval letter. This tells sellers you're serious and shows exactly how much you can borrow." },
  { title: "Find a Buyer's Real Estate Agent", body: "A good buyer's agent represents your interests, knows the local market, and is typically compensated by the seller — so this usually costs you nothing." },
  { title: "Search for Homes", body: "Define your must-haves vs. nice-to-haves before touring. Visit at different times of day. Research school districts, flood zones, and future development plans." },
  { title: "Make an Offer", body: "Your agent drafts a purchase offer with a price, contingencies (inspection, financing, appraisal), and earnest money deposit (typically 1–3% of purchase price)." },
  { title: "Schedule a Home Inspection", body: "Hire a licensed inspector to examine the structure, roof, systems, and appliances. Use findings to negotiate repairs or a price reduction — never skip this step." },
  { title: "Secure Final Mortgage Approval", body: "Your lender's underwriter verifies all your documents and issues a final \"clear to close.\" Avoid major purchases, new credit, or job changes during this period." },
  { title: "Close on Your Home", body: "Sign the closing documents, pay your down payment and closing costs, and receive the keys. The title officially transfers — you're a homeowner." },
];

const KEY_NUMBERS = [
  { val: "20%",    label: "Ideal Down Payment",    desc: "Avoids PMI and keeps monthly payments lower." },
  { val: "28/36",  label: "Conservative DTI Rule", desc: "Front-end / back-end debt-to-income limits." },
  { val: "620+",   label: "Min Credit Score",       desc: "For most conventional loans. Best rates at 740+." },
  { val: "2–5%",   label: "Closing Costs",          desc: "Percentage of purchase price due at settlement." },
  { val: "1%",     label: "Annual Maintenance",     desc: "Rule-of-thumb budget for repairs and upkeep." },
  { val: "3–6 mo", label: "Emergency Fund",         desc: "Keep liquid savings after closing for surprises." },
  { val: "3.5%",   label: "FHA Min Down",            desc: "FHA loans allow lower down payments (score 580+)." },
  { val: "5 yrs",  label: "Typical Horizon",        desc: "Stay at least 5 years for buying to often make sense." },
];

const GLOSSARY = [
  { term: "APR (Annual Percentage Rate)", def: "The true yearly cost of borrowing, including interest and fees. Always compare APR — not just interest rate — when shopping lenders." },
  { term: "DTI (Debt-to-Income Ratio)", def: "Monthly debt obligations divided by gross monthly income. Front-end covers housing only; back-end includes all debts." },
  { term: "LTV (Loan-to-Value)", def: "Loan amount divided by the appraised value. LTV above 80% usually triggers PMI. Lower LTV = lower risk for lenders = better rates." },
  { term: "PMI (Private Mortgage Insurance)", def: "Monthly premium required when your down payment is under 20%. Protects the lender, not you. Typically 0.5–1.5% of the loan per year." },
  { term: "Escrow", def: "A third-party account that holds funds for taxes and insurance, collected monthly as part of your mortgage payment and disbursed when bills are due." },
  { term: "Closing Costs", def: "Fees paid at settlement: loan origination, appraisal, title search, title insurance, prepaid interest, and more. Budget 2–5% of purchase price." },
  { term: "Earnest Money", def: "A good-faith deposit (1–3% of purchase price) submitted with your offer. Applied to your down payment at closing or forfeited if you back out without cause." },
  { term: "Pre-Approval vs Pre-Qualification", def: "Pre-qualification is a quick estimate. Pre-approval involves verified income and credit — it's a much stronger signal to sellers that you can close." },
  { term: "Contingency", def: "A condition in the purchase contract that must be satisfied to proceed. Common contingencies: home inspection, financing approval, appraisal value." },
  { term: "Title Insurance", def: "Protects against ownership disputes, outstanding liens, or errors in public records that could threaten your ownership after purchase." },
  { term: "Appraisal", def: "An independent valuation of the home, ordered by the lender. If the appraised value comes in below the purchase price, you may need to renegotiate." },
  { term: "Amortization", def: "The gradual payoff of a loan through regular payments. Early payments are mostly interest; later payments shift toward principal as the balance falls." },
];

const TIPS = [
  "Don't buy to the max the bank approves. Lenders assess risk, not lifestyle. Build in breathing room for job changes, repairs, or family shifts.",
  "Get pre-approved before house hunting. It anchors your search, speeds up offers, and signals seriousness to sellers in competitive markets.",
  "Shop at least 3 lenders. Even a 0.25% rate difference on a $500k loan saves over $25,000 in interest across 30 years.",
  "Factor in all costs before deciding. Property taxes, insurance, maintenance, utilities, and HOA can add $1,500–$3,000+ per month beyond the mortgage.",
  "Lock your rate when you have a contract. Rate lock periods typically run 30–60 days. Monitor rates and lock when favorable after your offer is accepted.",
  "Visit the neighborhood at different times. Morning, evening, and weekend visits reveal traffic, noise, and neighbor patterns you won't see during a daytime open house.",
  "Look past cosmetics. Ugly paint and bad carpeting are cheap to fix. Foundation issues, roof problems, and water damage are not.",
  "Think about resale even before you buy. Location, school district, and floor plan flexibility affect your future buyer pool more than interior finishes.",
];

const MISTAKES = [
  "Waiving the home inspection. In competitive markets it's tempting, but one missed issue — mold, foundation crack, old wiring — can cost more than the house gained.",
  "Buying at your pre-approval ceiling. Pre-approval is a maximum, not a recommendation. Leaving 10–15% below max gives you far more financial stability.",
  "Making large purchases before closing. A new car or furniture financing between offer and closing can tank your DTI and kill loan approval.",
  "Underestimating maintenance costs. Budget at least 1% of home value annually — more for older homes.",
  "Using only one lender. Independent mortgage brokers and online lenders are worth a comparison, especially on larger loans.",
  "Letting emotion override budget. Falling in love with a home 20% above budget leads to buyer's remorse or getting outbid and walking away empty-handed.",
  "Ignoring HOA rules and finances. Restrictive bylaws, underfunded reserves, and pending special assessments can create significant costs and lifestyle constraints.",
  "Moving cash around before applying. Large unexplained deposits can trigger underwriting scrutiny. Keep your finances stable and document any large transfers.",
];

export function BuyingGuide() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Steps + Key Numbers */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
        {/* Steps */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div>
            <h3 className="font-semibold text-sm">The 10-Step Buying Process</h3>
            <p className="text-xs text-muted-foreground mt-0.5">From first glance at listings to handing over the keys.</p>
          </div>
          <div className="space-y-2">
            {STEPS.map((step, i) => (
              <div
                key={i}
                className="flex gap-3 items-start p-3 rounded-lg border border-border hover:border-border/80 hover:bg-muted/20 transition-all"
              >
                <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[11px] font-bold text-primary">
                  {i + 1}
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{step.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key numbers */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div>
            <h3 className="font-semibold text-sm">Key Numbers to Know</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Benchmarks that guide every lender decision.</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {KEY_NUMBERS.map((n) => (
              <div key={n.label} className="rounded-lg border border-border bg-muted/20 p-3 text-center hover:bg-muted/40 transition-colors">
                <p className="text-xl font-bold text-primary font-mono">{n.val}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mt-0.5">{n.label}</p>
                <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{n.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Glossary */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <div>
          <h3 className="font-semibold text-sm">Key Terms Glossary</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Words every buyer needs to understand before signing anything.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {GLOSSARY.map((g) => (
            <div key={g.term} className="rounded-lg border border-border bg-muted/20 p-3 hover:bg-muted/40 transition-colors">
              <p className="text-xs font-semibold text-foreground">{g.term}</p>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{g.def}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tips + Mistakes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div>
            <h3 className="font-semibold text-sm">First-Time Buyer Tips</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Advice that saves money and avoids regret.</p>
          </div>
          <div className="space-y-2">
            {TIPS.map((tip, i) => (
              <div key={i} className="flex gap-2.5 items-start p-2.5 rounded-lg border border-border bg-muted/10 hover:bg-muted/30 text-[11px] text-muted-foreground leading-relaxed transition-colors">
                <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span dangerouslySetInnerHTML={{ __html: tip.replace(/^([^.]+\.)/, '<strong class="text-foreground">$1</strong>') }} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div>
            <h3 className="font-semibold text-sm">Common Mistakes to Avoid</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Errors that cost thousands — or kill the deal entirely.</p>
          </div>
          <div className="space-y-2">
            {MISTAKES.map((mistake, i) => (
              <div key={i} className="flex gap-2.5 items-start p-2.5 rounded-lg border border-border bg-muted/10 hover:bg-muted/30 text-[11px] text-muted-foreground leading-relaxed transition-colors">
                <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-red-500" />
                <span dangerouslySetInnerHTML={{ __html: mistake.replace(/^([^.]+\.)/, '<strong class="text-foreground">$1</strong>') }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground pb-4">
        Planning tool only — not financial, tax, or legal advice. Consult a licensed professional before making real estate decisions.
      </p>
    </div>
  );
}
