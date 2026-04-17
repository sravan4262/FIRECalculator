# Retirement Planner Math Formulas by Scenario

This document lists the math formulas a robust early retirement planner should consider, including conditional formulas that activate only when the user provides specific scenarios like medical expenses, kids' education, Social Security, pensions, taxes, housing changes, or part-time income.

## Modeling framework

A complete planner should model annual or monthly cash flows over time.

For each period `t`:

- `Age_t = CurrentAge + t`
- `StartBalance_t = EndBalance_(t-1)`
- `NetCashFlow_t = TotalIncome_t - TotalExpenses_t - Taxes_t + OneTimeInflows_t - OneTimeOutflows_t`
- `EndBalance_t = StartBalance_t * (1 + PortfolioReturn_t) + NetCashFlow_t`

If retirement starts at `RetireAge`, then:

- If `Age_t < RetireAge`, earned income and savings contributions usually apply
- If `Age_t >= RetireAge`, withdrawals usually replace earned income

The retirement-period drawdown form is covered in the Post-retirement monthly drawdown section below.

## Core FIRE formulas

### FIRE target
- `FIRETarget = AnnualRetirementSpending / WithdrawalRate`
- If using the 4% rule: `FIRETarget = AnnualRetirementSpending * 25`
- `SupportedSpending = Portfolio * WithdrawalRate`
- `ImpliedWithdrawalRate = AnnualRetirementSpending / Portfolio`

### Savings formulas
- `AnnualSavings = AfterTaxIncome - CurrentAnnualExpenses`
- `SavingsRate = AnnualSavings / AfterTaxIncome`
- `MonthlySavings = AnnualSavings / 12`

### Accumulation formulas
- Annual version: `Portfolio_(t+1) = Portfolio_t * (1 + Return_t) + Contributions_t`
- Monthly version: `Portfolio_(m+1) = Portfolio_m * (1 + MonthlyReturn_m) + MonthlyContribution_m`

Monthly rate conversion is covered in the Monthly mode section below, applied per asset class.

### Real return formula
- `RealReturn = ((1 + NominalReturn) / (1 + Inflation)) - 1`

### Retirement date solving
Find the earliest `t` where:

- `Portfolio_t >= FIRETarget_t`

If spending inflates over time:

- `FIRETarget_t = AnnualRetirementSpending_t / WithdrawalRate`
- `AnnualRetirementSpending_t = BaseRetirementSpending * (1 + Inflation)^t`

## Expense formulas by category

A good planner should separate expenses into categories and only activate formulas for categories the user supplies.

### Base total expense formula
- `TotalExpenses_t = EssentialExpenses_t + LifestyleExpenses_t + HousingExpenses_t + HealthcareExpenses_t + EducationExpenses_t + DebtPayments_t + TaxesOnGoods_t + TravelExpenses_t + MiscExpenses_t`

If a category is not provided, its value is zero.

### Essential expenses
- `EssentialExpenses_t = Food_t + Utilities_t + Insurance_t + Transportation_t + BasicHousing_t + CoreLiving_t`

### Lifestyle / discretionary expenses
- `LifestyleExpenses_t = Travel_t + Hobbies_t + Dining_t + Entertainment_t + Gifting_t`

### Variable expense escalation
For any expense category with its own inflation assumption:

- `ExpenseCategory_t = BaseCategoryCost * (1 + CategoryInflation)^t`

## Medical expense formulas

If the user says they have medical expenses, use a dedicated healthcare module instead of burying it inside general spending.

### Basic healthcare expense
- `HealthcareExpenses_t = Premiums_t + OutOfPocket_t + Prescriptions_t + DentalVision_t + LongTermCare_t`

### Healthcare inflation
- `HealthcareExpenses_t = BaseHealthcareExpense * (1 + HealthcareInflation)^t`

### Medicare transition
If a user retires before Medicare age and then transitions later:

- If `Age_t < MedicareAge`: `HealthcareExpenses_t = PreMedicareCost_t`
- If `Age_t >= MedicareAge`: `HealthcareExpenses_t = MedicareCost_t + SupplementCost_t + OutOfPocket_t`

### HSA offset if modeled
- `NetHealthcareExpense_t = max(0, HealthcareExpenses_t - HSAWithdrawals_t)`

### Long-term care scenario
If long-term care is included for certain late ages:

- If `Age_t >= LTCStartAge`: `LongTermCare_t = AnnualLTCBase * (1 + LTCInflation)^(t - LTCStartAge)`
- Else: `LongTermCare_t = 0`

## Kids' education formulas

If the user says they have children or future education expenses, use a separate education module.

### Per-child annual education expense
For child `i`:

- `EducationExpense_(i,t) = Tuition_(i,t) + Housing_(i,t) + Books_(i,t) + Fees_(i,t) + MiscSchoolCost_(i,t)`

### Education inflation
- `Tuition_(i,t) = BaseTuition_i * (1 + EducationInflation_i)^YearsFromNow`

### Education active years
If education is only paid during a range of ages or years:

- If `EducationStartAge_i <= ChildAge_t <= EducationEndAge_i`, then include `EducationExpense_(i,t)`
- Else: `EducationExpense_(i,t) = 0`

### Total education expense
- `EducationExpenses_t = sum(EducationExpense_(i,t) for all children i)`

### Lump-sum college funding goal
If the user wants to pre-fund education:

- `FutureCollegeCost_i = sum(EducationExpense_(i,t) over school years)`
- `PresentValueCollegeGoal_i = FutureCollegeCost_i / (1 + DiscountRate)^(YearsUntilCollege)`

### Monthly saving needed for future education
If saving over `n` months for a future target:

- `MonthlyEducationSaving = TargetFV * r / ((1 + r)^n - 1)`

where `r` is monthly expected return.

## Housing formulas

### Mortgage scenario
- `HousingExpenses_t = MortgagePayment_t + PropertyTax_t + HomeInsurance_t + Maintenance_t + HOA_t`

If mortgage ends at a future date:

- If `Age_t > MortgageEndAge`: `MortgagePayment_t = 0`

### Rent scenario
- `Rent_t = BaseRent * (1 + RentInflation)^t`

### Home sale scenario
If the user says they will sell or downsize:

- `NetHomeSaleProceeds_t = SalePrice_t - SellingCosts_t - RemainingMortgageBalance_t`
- `OneTimeInflows_t += NetHomeSaleProceeds_t`
- New future housing cost can then reset to a different base

## Income formulas by source

### Earned income before retirement
- `EarnedIncome_t = Salary_t + Bonus_t + Freelance_t + BusinessIncome_t`
- `Salary_t = BaseSalary * (1 + SalaryGrowth)^t`

### Part-time / Barista FIRE income
If the user expects part-time work after retirement:

- If `RetireAge <= Age_t <= PartTimeEndAge`: `PartTimeIncome_t = BasePartTimeIncome * (1 + PartTimeGrowth)^YearsInPartTime`
- Else: `PartTimeIncome_t = 0`

### Social Security
If included:

- If `Age_t >= SSClaimAge`: `SocialSecurity_t = SSBenefitAtClaim * (1 + SSCOLA)^YearsSinceClaim`
- Else: `SocialSecurity_t = 0`

The claiming amount itself changes based on claim age, so the model should allow a lookup or factor for early, full, or delayed claiming.

### Pension
- If `Age_t >= PensionStartAge`: `Pension_t = BasePension * (1 + PensionCOLA)^YearsSinceStart`
- Else: `Pension_t = 0`

### Rental income
- `RentalIncome_t = GrossRent_t - Vacancy_t - Maintenance_t - PropertyManagement_t - Taxes_t - Insurance_t`

### Annuity or trust income
- If `Age_t >= IncomeStartAge`: `FixedIncome_t = PaymentAmount * (1 + COLA)^YearsSinceStart`
- Else: `FixedIncome_t = 0`

### Total guaranteed / other income
- `GuaranteedIncome_t = SocialSecurity_t + Pension_t + Annuity_t + TrustIncome_t`
- `OtherIncome_t = RentalIncome_t + PartTimeIncome_t + Royalties_t + OtherCashFlow_t`

## Tax formulas

A planner should ideally model taxes by account type and withdrawal source.

### Simple effective-tax approach
- `Taxes_t = TaxableIncome_t * EffectiveTaxRate_t`

### Gross-up spending for taxes
If the user enters after-tax spending needs:

- `RequiredPretaxWithdrawal_t = AfterTaxSpendingNeed_t / (1 - EffectiveTaxRate_t)`

### Taxable account withdrawals
A simple approximation is:

- `CapitalGainPortion_t = max(0, WithdrawalFromTaxable_t - CostBasisRecovered_t)`
- `CapitalGainsTax_t = CapitalGainPortion_t * CapitalGainsRate_t`

### Traditional account withdrawals
- `OrdinaryIncomeTax_t += TraditionalWithdrawal_t * MarginalOrEffectiveOrdinaryRate_t`

### Roth withdrawals
- `RothTax_t = 0` for qualified withdrawals

### Total taxes
- `Taxes_t = FederalIncomeTax_t + StateIncomeTax_t + CapitalGainsTax_t + NIIT_t + OtherTaxes_t`

## Withdrawal formulas

### Static withdrawal rule
- `Withdrawal_t = InitialRetirementPortfolio * InitialWithdrawalRate * (1 + Inflation)^t`

### Dynamic spending need approach
- `Withdrawal_t = max(0, TotalExpenses_t + Taxes_t - GuaranteedIncome_t - OtherIncome_t)`

### Percentage-of-portfolio withdrawal
- `Withdrawal_t = CurrentPortfolio_t * DynamicWithdrawalRate_t`

### Floor-and-upside framework
If the planner separates essential and discretionary expenses:

- `EssentialNeed_t = EssentialExpenses_t - GuaranteedIncome_t`
- `DiscretionaryNeed_t = LifestyleExpenses_t + TravelExpenses_t + OtherOptionalExpenses_t`
- `TotalWithdrawal_t = max(0, EssentialNeed_t) + OptionalSpendingRule_t`

## Account contribution formulas

### 401(k)
- `Employee401kContribution_t = min(UserChosenContribution_t, IRSLimit_t)`
- `EmployerMatch_t = min(MatchPercent * Salary_t, MatchCap_t)`

### IRA
- `IRAContribution_t = min(UserChosenIRAContribution_t, IRALimit_t)`

### HSA
- `HSAContribution_t = min(UserChosenHSAContribution_t, HSALimit_t)`

### Total retirement contributions
- `Contributions_t = 401k_t + Match_t + IRA_t + HSA_t + TaxableInvesting_t + OtherAccountContributions_t`

## Early-retirement access formulas

If the user retires before standard retirement account access ages, the planner should model account sequencing.

### Taxable bridge
- `BridgeNeed_t = max(0, SpendingNeed_t - AccessibleNonPenaltyIncome_t)`
- Withdraw bridge years from taxable accounts first if desired

### Roth contribution basis access
- `AvailableRothBasis_t = SumOfPriorContributions - PriorBasisWithdrawals`

### Roth conversion ladder tracking
For each conversion year `k`:

- `ConversionAvailable_(k,t) = ConversionAmount_k` only if `t - k >= 5 years`

### Early withdrawal penalty
If a user pulls from a traditional account before qualified access and no exception applies:

- `Penalty_t = EarlyTraditionalWithdrawal_t * PenaltyRate`

## Scenario-based conditional formulas

A flexible planner should use conditional rules so formulas activate only when relevant.

### If user has healthcare expenses
- Include `HealthcareExpenses_t`
- Apply healthcare inflation separately from general inflation
- Apply pre-Medicare and Medicare phase rules if age-based

### If user has kids' education expenses
- Include `EducationExpenses_t`
- Apply child-specific years and education inflation
- Optionally compute separate required savings plan for education

### If user has mortgage
- Include mortgage cash flow until payoff age
- Remove it after payoff date

### If user expects Social Security
- Add `SocialSecurity_t` only at or after claim age

### If user expects pension
- Add `Pension_t` only at or after pension start age

### If user will work part-time in retirement
- Add `PartTimeIncome_t` for the chosen years

### If user plans large one-time expenses
- Add one-time outflow in that specific period

### If user expects inheritance or windfall
- Add one-time inflow in that specific period

### If user downsizes home
- Add one-time sale proceeds and reduce future housing expense base

### If user wants essential spending protected first
- Use floor-and-upside or essential-vs-discretionary withdrawal math

## Monte Carlo formulas

When modeling uncertainty:

### Random return path
- `PortfolioReturn_t ~ Distribution(mu, sigma)`

### Random inflation path
- `Inflation_t ~ Distribution(mu_inflation, sigma_inflation)`

### Monte Carlo balance update
Same as the base accumulation formula with `PortfolioReturn_t` replaced by `RandomReturn_t` for each simulated path.

### Success rate
- `SuccessRate = NumberOfScenariosWithBalanceNeverBelowZero / TotalScenarios`

### Failure probability
- `FailureProbability = 1 - SuccessRate`

### Percentile balances
- `P10`, `P50`, `P90` balances from simulation outcomes

## Historical sequence formulas

If using historical annual returns:

- Apply real or nominal return sequence year by year from a chosen historical window, using the base accumulation formula with `HistoricalReturn_t` as the return for that period
- Repeat for all rolling historical periods

## Sensitivity formulas

A planner should also recalculate outputs under changed assumptions.

### Return sensitivity
- Recompute retirement age for `Return +/- delta`

### Inflation sensitivity
- Recompute retirement age and success rate for `Inflation +/- delta`

### Spending sensitivity
- Recompute for `RetirementSpending +/- delta`

### Withdrawal-rate sensitivity
- Recompute FIRE target and success rates for different withdrawal rates

### Healthcare sensitivity
- Recompute for low, base, and high healthcare inflation

### Education sensitivity
- Recompute for public/private school paths, low/high tuition inflation, and different child counts

## Scenario templates

### Standard FIRE
- Earned income until retirement
- No part-time income after retirement
- Portfolio funds retirement
- Optional Social Security at later age

### Lean FIRE
- Lower retirement spending base
- Usually lower discretionary category totals

### Fat FIRE
- Higher lifestyle spending and discretionary categories

### Coast FIRE
- Set future contributions to zero after coast point
- Solve whether current portfolio compounds enough to hit target by traditional retirement age

### Barista FIRE
- Add part-time income after early retirement
- Lower withdrawal need accordingly

## Output formulas

The planner should compute at least these outputs:

- `ProjectedRetirementAge = earliest age where success condition is met`
- `YearsToFIRE = ProjectedRetirementAge - CurrentAge`
- `Shortfall_t = RequiredPortfolio_t - ActualPortfolio_t`
- `Cushion_t = ActualPortfolio_t - RequiredPortfolio_t`
- `MarginOfSafety_t = ActualPortfolio_t / RequiredPortfolio_t`
- `EndingBalance = Balance at final modeled age`
- `DepletionAge = CurrentAge + DepletionMonth / 12` — see Corpus depletion section for the precise monthly formula
- `RequiredMonthlySavings` solved from future value formulas when user asks "how much do I need to save?"

## Formula design principle

The best way to support "all possible scenarios" is not one giant formula. It is a modular cash-flow engine where each category becomes a conditional component:

- income module
- expense module
- healthcare module
- education module
- housing module
- tax module
- withdrawal module
- account-access module
- risk engine

Then each period is calculated as:

- `EndingBalance = StartingBalance * growth + active inflows - active outflows`

with each inflow and outflow activated only when the scenario applies.

## Monthly mode conversion formulas

When running monthly instead of annual:

### Monthly rate conversion
- `MonthlyReturn_asset = (1 + AnnualReturn_asset)^(1/12) - 1`
- `MonthlyInflation = (1 + AnnualInflation)^(1/12) - 1`

Apply these conversions **per asset class independently**, not once globally.

### Net monthly appreciation after inflation per asset
- `NetMonthlyReturn_asset = ((1 + MonthlyReturn_asset) / (1 + MonthlyInflation)) - 1`

### Weighted net worth appreciation
When the portfolio has multiple asset classes each with their own return:

- `WeightedNetReturn_t = SUM(AssetValue_i * NetMonthlyReturn_i) / TotalNetWorth_t`

### Monthly net worth update (master equation)
- `NetWorth_end_t = NetWorth_start_t * (1 + WeightedNetReturn_t) + MonthlySavings_t + EMItoSavings_t - ActiveEMIs_t - DownPaymentDeductions_t - FutureExpenseEMIs_t`

## PV-based required corpus formula

A more precise alternative to the withdrawal-rate formula when the user inputs a monthly retirement salary target:

- `RequiredCorpus = -PV(RealReturnAfterRetirement / 12, RetirementMonths, MonthlyRetirementSalary)`

where `RetirementMonths = (LifeExpectancy - RetirementAge) * 12` and `RealReturnAfterRetirement` is the real annual return during drawdown, divided by 12 for monthly.

This produces the corpus needed **in today's dollars**.

### Inflation-adjusted retirement salary at retirement age
- `SalaryAtRetirement_nominal = FV(AnnualInflation, YearsToRetirement, 0, -TodayMonthlySalary)`

This converts today's monthly target into what it will cost in nominal terms at retirement.

## EMI formulas

### EMI active during its term
- `EMI_t = IF(CurrentDate <= EMIEndDate, EMIValue, 0)`

### EMI redirect to savings after payoff
If the user opts to redirect the freed EMI cash to savings:

- `EMItoSavings_t = IF(RedirectOption = "Yes" AND CurrentDate > EMIEndDate, EMIValue, 0)`
- `TotalMonthlySavings_t += EMItoSavings_t`

### Total EMI deduction
- `TotalEMIs_t = SUM(EMI_i_t for all active EMIs i)`

## Future investment formulas

### Asset activation (date-gated)
- `FutureInvestmentActive_t = IF(StartDate <= CurrentDate <= EndDate, 1, 0)`

### Down payment deduction from net worth
Deducted once at the purchase month if the user opts in:

- `DownPaymentDeduction_t = IF(DeductFromNetWorth = "Yes" AND CurrentDate == StartDate, DownPayment, 0)`

### Future investment EMI deduction from savings
- `FutureEMIDeduction_t = IF(DeductFromSavings = "Yes" AND StartDate <= CurrentDate <= EndDate, EMIValue, 0)`

### Asset appreciation after purchase
The purchased asset is added to net worth at `StartDate` and appreciates at its own annual rate from that point:

- `FutureAssetValue_t = PurchaseValue * (1 + MonthlyAssetReturn)^MonthsSincePurchase`

### Net savings reduction from all future investments
- `TotalSavingsReduction_t = SUM(FutureEMIDeduction_i_t for all active future investments i)`

## Savings growth formula

Each savings stream grows at its own annual increase rate:

- `MonthlySavings_stream_t = BaseMonthlySavings * (1 + AnnualIncreaseRate)^YearsElapsed`

### Savings at retirement age (FV approach)
- `MonthlySavingsAtRetirement = FV(AnnualSavingsGrowthRate, YearsToRetirement - 1, 0, -CurrentMonthlySavings)`

## Post-retirement monthly drawdown formula

Once retired, the corpus funds the monthly salary need:

- `NetWorth_end_t = NetWorth_start_t * (1 + WeightedNetMonthlyReturn_t) - MonthlyRetirementSalaryNeed_t`

If there are other income sources (pension, Social Security, rental):

- `MonthlyRetirementSalaryNeed_t = MAX(0, MonthlySpendingNeed_t - GuaranteedIncome_t)`

## Corpus depletion / "money lasts until" formulas

### Depletion month
Find the first month where corpus would fall to zero or below:

- `DepletionMonth = MINIFS(all_months, corpus > 0)`

### Depletion age
- `DepletionAge = CurrentAge + DepletionMonth / 12`

This is the "money lasts until" output — distinct from FIRE age (when you stop working) and the primary safety metric in the drawdown phase.

## Retirement age sensitivity table

Compute required corpus at each candidate retirement age using the PV formula:

- For each `CandidateRetireAge` in {40, 45, 50, 55, 60, ...}:
  - `RetirementMonths = (LifeExpectancy - CandidateRetireAge) * 12`
  - `RequiredCorpus_at_age = -PV(RealReturnAfterRetirement / 12, RetirementMonths, MonthlyRetirementSalary)`

Display as a table: retirement age → required corpus (in today's dollars).

## Savings tracking formulas

### Monthly deviation per category
- `Deviation_category_t = ActualSavings_category_t - PlannedSavings_category_t`

### Cumulative deviation
- `CumulativeDeviation_category = SUM(Deviation_category_t over all past months)`

### Total planned vs actual
- `TotalPlanned_t = SUM(PlannedSavings_category_t for all categories)`
- `TotalActual_t = SUM(ActualSavings_category_t for all categories)`