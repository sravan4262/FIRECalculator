# Early Retirement Planner Calculation Spec

This document organizes the calculations needed for an early retirement planner into MVP, advanced, and pro tiers, and explicitly includes kids' education as a modeled expense stream.

## Calculation modes

The planner supports two calculation modes:
- **Annual mode**: year-by-year projections — simpler and good for a quick overview
- **Monthly mode**: month-by-month projections — more precise, handles EMI end dates, date-specific events, and savings-rate changes accurately

Monthly mode is the preferred default. Annual rates are converted to monthly equivalents when monthly mode is active.

## MVP calculations

### Identity and timeline
- Current age
- Date of birth (for month-precise calculations in monthly mode)
- Target retirement age
- Planning end age / life expectancy
- Years until retirement = target retirement age - current age
- Retirement duration = end age - retirement age

### Income and savings
- Gross annual income
- After-tax annual income
- Current annual spending
- Annual savings = after-tax income - annual spending
- Savings rate = annual savings / after-tax income
- Annual savings growth assumption
- Salary growth assumption
- Multiple savings streams supported, each with a label, amount, appreciation rate, annual increase rate, start date, and end date

### Portfolio starting point
- Current invested portfolio balance
- Net worth across multiple asset classes, each with its own appreciation rate:
  - **Indian context:** real estate, gold, FDs/bonds/MFs/stocks, SIP, LIC/insurance savings, chits, savings account, others (user-editable)
  - **US context:** real estate, taxable brokerage/stocks, 401(k)/traditional IRA, Roth 401(k)/Roth IRA, HSA, savings/HYSA, others (user-editable)
- Cash reserve if included separately
- Expected annual return (single blended rate, or per asset class)
- Inflation assumption
- Real return approximation = $$(1 + nominal\ return) / (1 + inflation) - 1$$
- Weighted net worth appreciation = sum(asset_value × asset_net_return) / total_net_worth

### FIRE target math
- Annual or monthly income / salary required after retirement
- Withdrawal rate assumption
- FIRE number = annual retirement spending / withdrawal rate
- Rule-of-25 shortcut for 4% withdrawal rate = annual retirement spending x 25
- Required corpus via PV formula = -PV(real_return_per_period, total_periods, spending_per_period)
- Implied spending supported = portfolio x withdrawal rate
- Implied withdrawal rate = annual retirement spending / portfolio

### Accumulation projection
**Annual mode:**
- End-of-year portfolio = previous portfolio x (1 + growth rate) + annual savings

**Monthly mode:**
- Month-end net worth = month-start net worth × (1 + weighted_net_monthly_return) + net_monthly_cash_flow
- Monthly inflation = (1 + annual_inflation)^(1/12) - 1
- Net monthly return per asset = ((1 + monthly_asset_return) / (1 + monthly_inflation)) - 1

- Year-by-year (or month-by-month) projection until retirement target is reached
- Estimated FIRE age = first period net worth reaches FIRE target
- Years to FIRE = FIRE age - current age
- Gap to goal at target age = projected portfolio - required portfolio

### Basic outputs
- FIRE number
- Estimated retirement age
- Years until FIRE
- "Money lasts until" age (corpus depletion age)
- Portfolio balance by year (or month)
- Required annual savings to hit target age
- Required spending cut to hit target age

## Advanced calculations

### Retirement spending details
- Current spending versus retirement spending
- Inflation-adjusted retirement spending by year
- Temporary retirement expenses with start and end ages
- One-time expenses at specific ages
- One-time income events at specific ages
- Recurring income streams with start and end ages
- Recurring expense streams with start and end ages
- Unplanned annual expenses budget (furniture, phone, laptop, irregular spend)
- Annual travel / holiday expense budget

### EMI management
- Up to N EMI streams (home loan, car loan, personal loan, other), each with:
  - Monthly EMI amount
  - EMI end date
  - Option: "redirect EMI to monthly savings after EMI ends" — freed cash automatically increases monthly savings from the month after end date
- EMI deducted from monthly net cash flow while active
- In annual mode: EMIs modeled as annual outflows ending at the specified year

### Future investments
For each planned future purchase (new home, second property, car, etc.):
- Investment value and expected annual appreciation (asset grows in net worth after purchase)
- Down payment amount with option to deduct from current net worth at purchase date
- EMI amount, EMI start date, EMI end date, with option to deduct from monthly savings while active
- The purchased asset is added to net worth and appreciates from the purchase date onward

### Other future expenses
For each planned future expense stream (travel budget, insurance, other loans):
- Expense label, monthly amount, start date, end date
- Down payment if any, with option to deduct from net worth
- Option to deduct monthly expense from savings while active

### Kids' education expense
- Child name or label
- Existing vs future child distinction:
  - Existing child: expenses apply from now until end date
  - Future child: expenses apply between a future start date and end date
- Child current age
- Monthly child living expenses (groceries, clothing, activities) with start/end dates
- Education start age
- Education duration in years
- Annual school fees with start/end ages
- Annual college fees with start/end ages
- Annual education cost in today's dollars
- Education inflation assumption
- Education cost by year = base education cost x $$(1 + education\ inflation)^{years}$$
- Total education funding need across all children
- One-time college funding lump sum option
- Annual college cash flow option
- Split between savings goal before retirement and post-retirement expense stream
- Separate modeling for tuition, housing, books, and other school costs if desired
- One-time kids expenses (wedding, gifts, etc.) with specific date

### Taxes
- Effective tax rate during accumulation
- Effective tax rate during retirement
- Pre-tax withdrawal needed = after-tax spending target / (1 - effective tax rate)
- Tax drag on taxable accounts
- Capital gains tax assumption
- Dividend and interest tax assumption
- State tax assumption

**US-specific:** Traditional vs Roth withdrawal treatment, RMDs after age 73, FICA on earned income

**India-specific:** LTCG/STCG on equity and debt funds, LTCG on real estate with indexation, tax on FD interest as ordinary income

### Other retirement income
- Social Security (US) / NPS / government pension (India) annual benefit
- Social Security / NPS claiming age
- Pension annual benefit and start age
- Rental income stream
- Annuity or trust income stream
- Annual COLA for each income source
- Net portfolio withdrawal need = retirement spending - guaranteed income sources

### Housing and large obligations
- Mortgage / home loan payment and payoff age
- Property tax
- Home insurance
- Maintenance reserve
- Rent and rent inflation if renting
- Home sale proceeds at a future age
- Downsizing proceeds or reduced housing costs

### Healthcare
- Pre-Medicare / pre-employer-coverage healthcare premium
- Healthcare out-of-pocket spending
- Medicare transition age (US: 65)
- Healthcare inflation assumption
- Late-life care reserve / stress-case healthcare expense
- Annual medical insurance premium as a separate tracked line item

### Withdrawal and drawdown math
- Annual gross spending need in retirement
- Less other retirement income sources
- Net withdrawal from portfolio
- Inflation-adjusted withdrawals each year
- Remaining portfolio after annual withdrawal and annual return
- Portfolio depletion age if assets run out

### Portfolio structure
- Taxable balance
- Traditional 401(k) / IRA / EPF / PPF balance
- Roth / tax-free balance
- Cash allocation
- Asset allocation percentages
- Weighted expected return based on allocation
- Weighted volatility based on allocation if modeled
- Annual fee drag
- Net return after fees

### Sensitivity analysis
- Retirement age sensitivity to return changes
- Retirement age sensitivity to spending changes
- Retirement age sensitivity to savings changes
- Retirement age sensitivity to withdrawal rate changes
- Retirement age sensitivity to inflation changes
- Best case / base case / conservative case outputs
- Corpus required at different target retirement ages (e.g., 40, 45, 50, 55, 60 — sensitivity table)

## Pro calculations

### Monte Carlo and uncertainty
- Volatility assumptions for each asset class
- Correlation assumptions if multi-asset modeling is used
- Randomized annual return paths
- Randomized inflation paths if modeled
- Success rate = successful simulations / total simulations
- Failure rate = failed simulations / total simulations
- Median ending portfolio
- Percentile ending portfolios
- Failure age distribution
- Worst-case depletion year

### Sequence-of-returns risk
- Historical sequence testing
- Monte Carlo sequence testing
- Early bad-return stress case
- Safe withdrawal stress testing under poor first-decade returns

### Detailed account access for early retirees
- Taxable bridge years before retirement account access
- Roth contribution basis withdrawals
- Roth conversion ladder timing
- 72(t) / SEPP distributions if modeled
- Early withdrawal penalty calculations where applicable
- Required minimum distributions later in retirement

**India-specific:** EPF/PPF lock-in and partial withdrawal rules, NPS annuity purchase requirement at 60, SCSS/PMVVY income stream modeling

### Contribution system details

**US:**
- 401(k) employee contribution and employer match
- IRA contribution (traditional and Roth)
- HSA contribution
- Catch-up contributions by age
- Contribution limits by year
- Bonus income and bonus savings rate
- Mega backdoor or after-tax contribution paths if supported

**India:**
- EPF / VPF contribution and employer match
- PPF annual contribution
- NPS Tier-1 and Tier-2 contributions
- LIC / ULIP premium amounts
- SIP amounts per fund
- Chit fund installments

### Cash flow timing precision
- Monthly contributions instead of annual contributions
- Beginning-of-period versus end-of-period contributions
- Monthly retirement withdrawals instead of annual withdrawals
- Timing of lump sums
- Timing of Social Security and pension start dates

### FIRE variants
- Lean FIRE target using lower spending
- Standard FIRE target
- Fat FIRE target using higher spending
- Coast FIRE, where current invested assets are projected to a later retirement age without further contributions
- Barista FIRE, where part-time income offsets retirement spending

### Risk and safety metrics
- Margin of safety = projected portfolio / required portfolio
- Probability of depletion before selected age
- Spending flexibility required in failure scenarios
- Safe withdrawal rate estimate under the chosen assumptions
- Required return to hit target age
- Required savings rate to hit target age

## Savings tracking module

Tracks planned vs actual savings month by month so the user can monitor whether they are on track.

### Savings categories

**Indian context:** Chits, stocks/equities, SIP, LIC/insurance savings, gold, FDs/bonds/debt MFs, savings account, others

**US context:** Brokerage/stocks, 401(k), IRA/Roth IRA, HSA, savings/HYSA, others

### Tracking fields per month
- Planned savings amount per category
- Actual savings amount entered by user
- Difference = actual − planned
- Cumulative planned vs actual

### Outputs
- Planned vs actual savings graph by month
- Total planned vs total actual
- Deviation percentage by category

## Goal vs trending dashboard

Compares the planned retirement trajectory to the actual trajectory based on real savings entered.

- Planned retirement net worth path by year
- Actual / trending net worth path based on real savings entered
- Projected retirement age based on actual savings rate
- Projected retirement age based on planned savings rate
- Gap between planned and trending retirement age
- Insights table: per category — planned, actual, difference

## Recommended data model

### Person and household
- Current age
- Date of birth (for monthly mode)
- Retirement age target
- End age
- Filing status / household status
- Number of adults
- Number of children
- Country / tax context (India or US, for category defaults)

### Income fields
- Salary (annual or monthly)
- Bonus
- Other earned income
- Passive income
- Tax rate assumptions

### Spending fields
- Current spending (annual or monthly)
- Retirement spending (annual or monthly)
- Fixed expenses
- Variable expenses
- Healthcare expenses
- Housing expenses
- Travel / lifestyle expenses
- Unplanned annual expenses budget

### Education fields
- Child label
- Existing or future child
- Child current age
- Monthly child living expenses with start/end dates
- School start age, school end age
- Annual school fees
- College start age, college end age
- Annual college fees
- Annual education cost today
- Education inflation rate
- Funding method: annual cash flow or lump sum
- One-time child expense amount and date

### Savings stream fields
- Stream label
- Monthly or annual contribution amount
- Annual appreciation / return rate
- Annual increase rate
- Start date
- End date

### EMI fields
- EMI label
- Monthly EMI amount
- EMI end date
- Redirect to savings after end (yes/no)

### Future investment fields
- Investment label
- Purchase date
- Investment value at purchase
- Annual appreciation rate
- Down payment amount
- Deduct down payment from net worth (yes/no)
- EMI amount, EMI start date, EMI end date
- Deduct EMI from savings (yes/no)

### Future expense fields
- Expense label
- Start date, end date
- Monthly expense / EMI amount
- Down payment if any
- Deduct EMI from savings (yes/no)

### Account fields
- Asset class balances with individual appreciation rates
- Taxable balance
- Traditional balance (401k / IRA / EPF / PPF)
- Roth / tax-free balance
- Cash balance
- Employer match settings
- Contribution settings
- Fee assumptions
- Allocation settings

### Scenario fields
- Expected return (single or per asset class)
- Conservative return
- Inflation
- Withdrawal rate
- Stress-test toggles
- Monte Carlo settings

## Minimum outputs the planner should show
- FIRE number
- Projected retirement age
- Years to FIRE
- "Money lasts until" age (corpus depletion age)
- Year (or month) portfolio first reaches target
- Year-by-year portfolio balance (or month-by-month in monthly mode)
- Year-by-year spending need
- Year-by-year income sources
- Year-by-year withdrawals
- Taxes by year if modeled
- Education expenses by year
- EMI schedule and payoff dates
- Savings tracking: planned vs actual by category
- Success probability if Monte Carlo is enabled
- Gap or cushion versus target retirement age
- Corpus required at retirement ages 40, 45, 50, 55, 60 (sensitivity table)

## Build order recommendation
1. Build the MVP calculator (annual mode first): portfolio with blended return, savings streams, FIRE target, FIRE age and depletion age outputs.
2. Add monthly mode: convert all rates to monthly equivalents, run month-by-month engine.
3. Add EMI management: active EMIs, end dates, redirect-to-savings option.
4. Add future investments and future expenses: date-gated activation, down payment deductions, per-asset appreciation.
5. Add advanced cash flow streams, taxes, healthcare, housing, and kids' education (with monthly child expenses and existing/future child distinction).
6. Add savings tracking (planned vs actual) and goal vs trending dashboard.
7. Add account-type detail and withdrawal sequencing.
8. Add Monte Carlo, sequence risk, and probability outputs.
9. Add FIRE variants like Coast FIRE and Barista FIRE.
