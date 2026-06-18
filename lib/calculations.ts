// ============================================================
// CALCULATION ENGINE
// Each function receives a Record<string, string> of field values
// and returns a CalcResult with labelled outputs.
// ============================================================

export interface CalcResult {
  outputs: { label: string; value: string; highlight?: boolean }[];
  error?: string;
}

type CalcFn = (inputs: Record<string, string>) => CalcResult;

/* ─── helpers ─── */
const n = (v: string | undefined) => parseFloat(v ?? '0');
const round = (x: number, d = 2) => Math.round(x * 10 ** d) / 10 ** d;
const fmt = (x: number) => x.toLocaleString(undefined, { maximumFractionDigits: 2 });

function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a)); b = Math.abs(Math.round(b));
  return b === 0 ? a : gcd(b, a % b);
}
function factorial(n: number): bigint {
  if (n < 0) return BigInt(0);
  let r = BigInt(1);
  for (let i = BigInt(2); i <= BigInt(n); i++) r *= i;
  return r;
}

/* ─── HEALTH ─── */
const bmi: CalcFn = (i) => {
  const w = n(i.weight), h = n(i.height) / 100;
  if (!w || !h) return { outputs: [], error: 'Enter weight and height.' };
  const bmi = w / (h * h);
  const cat = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal weight' : bmi < 30 ? 'Overweight' : 'Obese';
  return { outputs: [
    { label: 'BMI', value: round(bmi).toString(), highlight: true },
    { label: 'Category', value: cat },
    { label: 'Healthy weight range', value: `${round(18.5 * h * h)} – ${round(24.9 * h * h)} kg` },
  ]};
};

const bmr: CalcFn = (i) => {
  const w = n(i.weight), h = n(i.height), a = n(i.age);
  if (!w || !h || !a) return { outputs: [], error: 'Fill all fields.' };
  const v = i.gender === 'female'
    ? 10 * w + 6.25 * h - 5 * a - 161
    : 10 * w + 6.25 * h - 5 * a + 5;
  return { outputs: [
    { label: 'BMR (calories/day)', value: round(v).toString(), highlight: true },
    { label: 'Lightly active (×1.375)', value: `${round(v * 1.375)} cal/day` },
    { label: 'Moderately active (×1.55)', value: `${round(v * 1.55)} cal/day` },
    { label: 'Very active (×1.725)', value: `${round(v * 1.725)} cal/day` },
  ]};
};

const calories: CalcFn = (i) => {
  const w = n(i.weight), h = n(i.height), a = n(i.age), act = n(i.activity);
  if (!w || !h || !a) return { outputs: [], error: 'Fill all fields.' };
  const bmrVal = i.gender === 'female' ? 10*w+6.25*h-5*a-161 : 10*w+6.25*h-5*a+5;
  const tdee = bmrVal * act;
  return { outputs: [
    { label: 'TDEE (Maintenance)', value: `${round(tdee)} cal/day`, highlight: true },
    { label: 'Weight loss (−500 cal)', value: `${round(tdee - 500)} cal/day` },
    { label: 'Weight gain (+500 cal)', value: `${round(tdee + 500)} cal/day` },
    { label: 'BMR', value: `${round(bmrVal)} cal/day` },
  ]};
};

const bodyFat: CalcFn = (i) => {
  const h = n(i.height), waist = n(i.waist), neck = n(i.neck), hip = n(i.hip);
  if (!h || !waist || !neck) return { outputs: [], error: 'Fill all fields.' };
  let bf: number;
  if (i.gender === 'female') {
    bf = 163.205 * Math.log10(waist + hip - neck) - 97.684 * Math.log10(h) - 78.387;
  } else {
    bf = 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(h) + 36.76;
  }
  bf = Math.max(0, bf);
  const fatMass = round(n(i.weight || '70') * bf / 100);
  const leanMass = round(n(i.weight || '70') - fatMass);
  return { outputs: [
    { label: 'Body Fat Percentage', value: `${round(bf)}%`, highlight: true },
    { label: 'Fat Mass (estimated)', value: `${fatMass} kg` },
    { label: 'Lean Mass (estimated)', value: `${leanMass} kg` },
    { label: 'Category', value: i.gender === 'female'
      ? (bf < 14 ? 'Essential fat' : bf < 21 ? 'Athletic' : bf < 25 ? 'Fitness' : bf < 32 ? 'Average' : 'Obese')
      : (bf < 6 ? 'Essential fat' : bf < 14 ? 'Athletic' : bf < 18 ? 'Fitness' : bf < 25 ? 'Average' : 'Obese') },
  ]};
};

const idealWeight: CalcFn = (i) => {
  const h = n(i.height);
  if (!h) return { outputs: [], error: 'Enter height.' };
  const hIn = h / 2.54;
  let base: number;
  if (i.gender === 'female') base = 45.5 + 2.3 * (hIn - 60);
  else base = 50 + 2.3 * (hIn - 60);
  const bmiLow = round(18.5 * (h/100) ** 2);
  const bmiHigh = round(24.9 * (h/100) ** 2);
  return { outputs: [
    { label: 'Hamwi Ideal Weight', value: `${round(base)} kg`, highlight: true },
    { label: 'Healthy BMI Range', value: `${bmiLow} – ${bmiHigh} kg` },
    { label: 'In Pounds', value: `${round(base * 2.205)} lb` },
  ]};
};

const waterIntake: CalcFn = (i) => {
  const w = n(i.weight);
  if (!w) return { outputs: [], error: 'Enter weight.' };
  const base = w * 35;
  const mult = i.activity === 'active' ? 1.4 : i.activity === 'sedentary' ? 1.0 : 1.2;
  const total = base * mult;
  return { outputs: [
    { label: 'Daily Water Intake', value: `${round(total)} ml`, highlight: true },
    { label: 'In Liters', value: `${round(total/1000, 1)} L` },
    { label: 'In Cups (240ml)', value: `${round(total/240, 1)} cups` },
    { label: 'In Glasses (250ml)', value: `${round(total/250, 1)} glasses` },
  ]};
};

const pregnancyDueDate: CalcFn = (i) => {
  if (!i.lmp) return { outputs: [], error: 'Enter last menstrual period date.' };
  const lmp = new Date(i.lmp);
  const cycle = n(i.cycleLength) || 28;
  const adjust = cycle - 28;
  const due = new Date(lmp.getTime() + (280 + adjust) * 86400000);
  const trimester2 = new Date(lmp.getTime() + 98 * 86400000);
  const trimester3 = new Date(lmp.getTime() + 196 * 86400000);
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  return { outputs: [
    { label: 'Estimated Due Date', value: fmt(due), highlight: true },
    { label: 'Day of Week', value: due.toLocaleDateString('en-US', { weekday: 'long' }) },
    { label: '2nd Trimester Begins', value: fmt(trimester2) },
    { label: '3rd Trimester Begins', value: fmt(trimester3) },
  ]};
};

const ovulation: CalcFn = (i) => {
  if (!i.lmp) return { outputs: [], error: 'Enter last menstrual period date.' };
  const lmp = new Date(i.lmp);
  const cycle = n(i.cycleLength) || 28;
  const ovDay = new Date(lmp.getTime() + (cycle - 14) * 86400000);
  const fertStart = new Date(ovDay.getTime() - 5 * 86400000);
  const fertEnd = new Date(ovDay.getTime() + 1 * 86400000);
  const nextPeriod = new Date(lmp.getTime() + cycle * 86400000);
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return { outputs: [
    { label: 'Ovulation Date', value: fmt(ovDay), highlight: true },
    { label: 'Fertile Window', value: `${fmt(fertStart)} – ${fmt(fertEnd)}` },
    { label: 'Next Period (expected)', value: fmt(nextPeriod) },
  ]};
};

const bloodPressure: CalcFn = (i) => {
  const sys = n(i.systolic), dia = n(i.diastolic);
  if (!sys || !dia) return { outputs: [], error: 'Enter both values.' };
  let cat: string;
  if (sys > 180 || dia > 120) cat = '🚨 Hypertensive Crisis';
  else if (sys >= 140 || dia >= 90) cat = '⚠️ High (Stage 2)';
  else if (sys >= 130 || dia >= 80) cat = '⚠️ High (Stage 1)';
  else if (sys >= 120 && dia < 80) cat = '⚡ Elevated';
  else if (sys < 90 || dia < 60) cat = '💙 Low (Hypotension)';
  else cat = '✅ Normal';
  const map = round((sys + 2 * dia) / 3);
  return { outputs: [
    { label: 'Category', value: cat, highlight: true },
    { label: 'Reading', value: `${sys}/${dia} mmHg` },
    { label: 'Mean Arterial Pressure', value: `${map} mmHg` },
    { label: 'Pulse Pressure', value: `${sys - dia} mmHg` },
  ]};
};

const heartRateZone: CalcFn = (i) => {
  const age = n(i.age), rhr = n(i.restingHR);
  if (!age) return { outputs: [], error: 'Enter age.' };
  const maxHR = 220 - age;
  const hrr = maxHR - rhr;
  const zone = (lo: number, hi: number) => `${round(rhr + hrr * lo)} – ${round(rhr + hrr * hi)} bpm`;
  return { outputs: [
    { label: 'Maximum Heart Rate', value: `${maxHR} bpm`, highlight: true },
    { label: 'Zone 1 — Warm Up (50–60%)', value: zone(0.5, 0.6) },
    { label: 'Zone 2 — Fat Burn (60–70%)', value: zone(0.6, 0.7) },
    { label: 'Zone 3 — Aerobic (70–80%)', value: zone(0.7, 0.8) },
    { label: 'Zone 4 — Threshold (80–90%)', value: zone(0.8, 0.9) },
    { label: 'Zone 5 — VO₂ Max (90–100%)', value: zone(0.9, 1.0) },
  ]};
};

/* ─── FINANCE ─── */
const loanEmi: CalcFn = (i) => {
  const p = n(i.principal), r = n(i.rate) / 1200, t = n(i.tenure);
  if (!p || !r || !t) return { outputs: [], error: 'Fill all fields.' };
  const emi = p * r * (1 + r) ** t / ((1 + r) ** t - 1);
  const total = emi * t;
  return { outputs: [
    { label: 'Monthly EMI', value: `$${fmt(emi)}`, highlight: true },
    { label: 'Total Payment', value: `$${fmt(total)}` },
    { label: 'Total Interest', value: `$${fmt(total - p)}` },
    { label: 'Principal', value: `$${fmt(p)}` },
  ]};
};

const simpleInterest: CalcFn = (i) => {
  const p = n(i.principal), r = n(i.rate), t = n(i.time);
  const si = (p * r * t) / 100;
  return { outputs: [
    { label: 'Simple Interest', value: `$${fmt(si)}`, highlight: true },
    { label: 'Total Amount', value: `$${fmt(p + si)}` },
    { label: 'Principal', value: `$${fmt(p)}` },
  ]};
};

const compoundInterest: CalcFn = (i) => {
  const p = n(i.principal), r = n(i.rate) / 100, t = n(i.time), freq = n(i.frequency);
  const amount = p * (1 + r / freq) ** (freq * t);
  return { outputs: [
    { label: 'Final Amount', value: `$${fmt(amount)}`, highlight: true },
    { label: 'Interest Earned', value: `$${fmt(amount - p)}` },
    { label: 'Principal', value: `$${fmt(p)}` },
    { label: 'Effective Annual Rate', value: `${round((Math.pow(1 + r / freq, freq) - 1) * 100, 3)}%` },
  ]};
};

const savings: CalcFn = (i) => {
  const p = n(i.initial), m = n(i.monthly), r = n(i.rate) / 100 / 12, y = n(i.years);
  const months = y * 12;
  const futureInitial = p * (1 + r) ** months;
  const futureMonthly = m * ((1 + r) ** months - 1) / r;
  const total = futureInitial + (r ? futureMonthly : m * months);
  const contributed = p + m * months;
  return { outputs: [
    { label: 'Final Balance', value: `$${fmt(total)}`, highlight: true },
    { label: 'Total Contributed', value: `$${fmt(contributed)}` },
    { label: 'Interest Earned', value: `$${fmt(total - contributed)}` },
  ]};
};

const investmentReturn: CalcFn = (i) => {
  const init = n(i.initial), fin = n(i.final), y = n(i.years);
  if (!init || !fin || !y) return { outputs: [], error: 'Fill all fields.' };
  const roi = (fin - init) / init * 100;
  const cagr = (Math.pow(fin / init, 1 / y) - 1) * 100;
  return { outputs: [
    { label: 'Total ROI', value: `${round(roi)}%`, highlight: true },
    { label: 'Annualized Return (CAGR)', value: `${round(cagr)}%` },
    { label: 'Profit / Loss', value: `$${fmt(fin - init)}` },
  ]};
};

const salary: CalcFn = (i) => {
  const amt = n(i.amount), per = i.period;
  const hourly = per === 'hourly' ? amt : per === 'daily' ? amt / 8 : per === 'weekly' ? amt / 40 : per === 'monthly' ? amt * 12 / 52 / 40 : amt / 52 / 40;
  const annual = hourly * 2080;
  return { outputs: [
    { label: 'Hourly', value: `$${fmt(hourly)}`, highlight: true },
    { label: 'Daily (8h)', value: `$${fmt(hourly * 8)}` },
    { label: 'Weekly (40h)', value: `$${fmt(hourly * 40)}` },
    { label: 'Monthly', value: `$${fmt(annual / 12)}` },
    { label: 'Annual', value: `$${fmt(annual)}` },
  ]};
};

const discount: CalcFn = (i) => {
  const orig = n(i.originalPrice), disc = n(i.discount);
  const saving = orig * disc / 100;
  const final = orig - saving;
  return { outputs: [
    { label: 'Final Price', value: `$${fmt(final)}`, highlight: true },
    { label: 'You Save', value: `$${fmt(saving)}` },
    { label: 'Discount Amount', value: `$${fmt(saving)} (${disc}%)` },
    { label: 'Original Price', value: `$${fmt(orig)}` },
  ]};
};

const profitMargin: CalcFn = (i) => {
  const cost = n(i.cost), rev = n(i.revenue);
  if (!rev) return { outputs: [], error: 'Revenue must be greater than 0.' };
  const profit = rev - cost;
  const margin = (profit / rev) * 100;
  const markup = cost ? (profit / cost) * 100 : 0;
  return { outputs: [
    { label: 'Gross Profit Margin', value: `${round(margin)}%`, highlight: true },
    { label: 'Markup', value: `${round(markup)}%` },
    { label: 'Gross Profit', value: `$${fmt(profit)}` },
    { label: 'Revenue', value: `$${fmt(rev)}` },
  ]};
};

const TAX_BRACKETS: Record<string, [number, number][]> = {
  single: [[10275,0.10],[41775,0.12],[89075,0.22],[170050,0.24],[215950,0.32],[539900,0.35],[Infinity,0.37]],
  married: [[20550,0.10],[83550,0.12],[178150,0.22],[340100,0.24],[431900,0.32],[647850,0.35],[Infinity,0.37]],
  head: [[14650,0.10],[55900,0.12],[89050,0.22],[170050,0.24],[215950,0.32],[539900,0.35],[Infinity,0.37]],
};
const tax: CalcFn = (i) => {
  const income = n(i.income);
  const brackets = TAX_BRACKETS[i.filingStatus ?? 'single'];
  let taxAmt = 0, prev = 0;
  for (const [limit, rate] of brackets) {
    if (income <= prev) break;
    taxAmt += (Math.min(income, limit) - prev) * rate;
    prev = limit;
  }
  const effective = (taxAmt / income) * 100;
  return { outputs: [
    { label: 'Estimated Tax', value: `$${fmt(taxAmt)}`, highlight: true },
    { label: 'Effective Tax Rate', value: `${round(effective)}%` },
    { label: 'After-Tax Income', value: `$${fmt(income - taxAmt)}` },
    { label: 'Monthly Take-Home', value: `$${fmt((income - taxAmt) / 12)}` },
  ]};
};

const FX_RATES: Record<string, number> = { USD:1, EUR:0.92, GBP:0.79, JPY:149.5, INR:83.1, CAD:1.36, AUD:1.53, CHF:0.89, CNY:7.24, SGD:1.34, BDT:110.5 };
const currency: CalcFn = (i) => {
  const amt = n(i.amount), fromRate = FX_RATES[i.from], toRate = FX_RATES[i.to];
  if (!fromRate || !toRate) return { outputs: [], error: 'Unknown currency.' };
  const result = (amt / fromRate) * toRate;
  return { outputs: [
    { label: 'Converted Amount', value: `${fmt(result)} ${i.to}`, highlight: true },
    { label: 'Exchange Rate', value: `1 ${i.from} = ${round(toRate / fromRate, 4)} ${i.to}` },
    { label: 'Reverse Rate', value: `1 ${i.to} = ${round(fromRate / toRate, 4)} ${i.from}` },
    { label: 'Note', value: 'Static reference rates — for illustration only.' },
  ]};
};

const mortgage: CalcFn = (i) => {
  const price = n(i.homePrice), down = n(i.downPayment), r = n(i.rate) / 1200, y = n(i.years);
  const p = price - down;
  const t = y * 12;
  const emi = p * r * (1 + r) ** t / ((1 + r) ** t - 1);
  return { outputs: [
    { label: 'Monthly Payment', value: `$${fmt(emi)}`, highlight: true },
    { label: 'Total Paid', value: `$${fmt(emi * t)}` },
    { label: 'Total Interest', value: `$${fmt(emi * t - p)}` },
    { label: 'Loan Amount', value: `$${fmt(p)}` },
    { label: 'Down Payment', value: `$${fmt(down)} (${round(down/price*100)}%)` },
  ]};
};

const retirement: CalcFn = (i) => {
  const curr = n(i.currentSavings), mo = n(i.monthlyContribution), r = n(i.annualReturn)/100/12, y = n(i.years);
  const months = y * 12;
  const futCurr = curr * (1 + r) ** months;
  const futContr = r ? mo * ((1 + r) ** months - 1) / r : mo * months;
  const total = futCurr + futContr;
  return { outputs: [
    { label: 'Retirement Nest Egg', value: `$${fmt(total)}`, highlight: true },
    { label: 'Total Contributions', value: `$${fmt(curr + mo * months)}` },
    { label: 'Investment Growth', value: `$${fmt(total - curr - mo * months)}` },
  ]};
};

const breakEven: CalcFn = (i) => {
  const fixed = n(i.fixedCosts), price = n(i.pricePerUnit), varCost = n(i.variableCostPerUnit);
  const contrib = price - varCost;
  if (contrib <= 0) return { outputs: [], error: 'Price must exceed variable cost.' };
  const units = fixed / contrib;
  const revenue = units * price;
  return { outputs: [
    { label: 'Break-Even Units', value: `${fmt(Math.ceil(units))} units`, highlight: true },
    { label: 'Break-Even Revenue', value: `$${fmt(revenue)}` },
    { label: 'Contribution Margin', value: `$${fmt(contrib)} per unit` },
    { label: 'Margin Ratio', value: `${round(contrib/price*100)}%` },
  ]};
};

const netWorth: CalcFn = (i) => {
  const assets = n(i.cash)+n(i.investments)+n(i.realEstate)+n(i.vehicles)+n(i.otherAssets);
  const liabilities = n(i.mortgageDebt)+n(i.carLoans)+n(i.creditCards)+n(i.studentLoans)+n(i.otherDebt);
  const nw = assets - liabilities;
  return { outputs: [
    { label: 'Net Worth', value: `$${fmt(nw)}`, highlight: true },
    { label: 'Total Assets', value: `$${fmt(assets)}` },
    { label: 'Total Liabilities', value: `$${fmt(liabilities)}` },
    { label: 'Debt-to-Asset Ratio', value: assets ? `${round(liabilities/assets*100)}%` : 'N/A' },
  ]};
};

const inflation: CalcFn = (i) => {
  const amt = n(i.amount), from = n(i.fromYear), to = n(i.toYear), rate = n(i.rate)/100;
  const years = to - from;
  const result = amt * (1 + rate) ** years;
  return { outputs: [
    { label: `Value in ${to}`, value: `$${fmt(result)}`, highlight: true },
    { label: 'Purchasing Power Change', value: `${round((result/amt-1)*100)}%` },
    { label: 'Original Amount', value: `$${fmt(amt)} in ${from}` },
    { label: 'Years', value: `${Math.abs(years)} years` },
  ]};
};

/* ─── MATH ─── */
const percentage: CalcFn = (i) => {
  const v = n(i.value), t = n(i.total);
  if (!t) return { outputs: [], error: 'Total cannot be zero.' };
  const pct = v / t * 100;
  const pctOf = t * v / 100;
  return { outputs: [
    { label: `${v} is what % of ${t}`, value: `${round(pct)}%`, highlight: true },
    { label: `${v}% of ${t} is`, value: `${round(pctOf)}` },
    { label: '% change from value to total', value: `${round((t-v)/v*100)}%` },
  ]};
};

const average: CalcFn = (i) => {
  const nums = i.numbers.split(',').map(x => parseFloat(x.trim())).filter(x => !isNaN(x));
  if (!nums.length) return { outputs: [], error: 'Enter valid numbers.' };
  const mean = nums.reduce((a,b) => a+b, 0) / nums.length;
  const sorted = [...nums].sort((a,b) => a-b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 ? sorted[mid] : (sorted[mid-1] + sorted[mid]) / 2;
  const freq: Record<number, number> = {};
  nums.forEach(x => freq[x] = (freq[x] || 0) + 1);
  const maxFreq = Math.max(...Object.values(freq));
  const modes = Object.entries(freq).filter(([,f]) => f === maxFreq).map(([v]) => v);
  return { outputs: [
    { label: 'Mean (Average)', value: round(mean).toString(), highlight: true },
    { label: 'Median', value: round(median).toString() },
    { label: 'Mode', value: maxFreq > 1 ? modes.join(', ') : 'No mode (all unique)' },
    { label: 'Range', value: round(sorted[sorted.length-1] - sorted[0]).toString() },
    { label: 'Count', value: nums.length.toString() },
    { label: 'Sum', value: round(nums.reduce((a,b)=>a+b,0)).toString() },
  ]};
};

const ratio: CalcFn = (i) => {
  const a = n(i.a), b = n(i.b);
  const g = gcd(a, b);
  return { outputs: [
    { label: 'Simplified Ratio', value: `${a/g} : ${b/g}`, highlight: true },
    { label: 'As Decimal', value: round(a/b).toString() },
    { label: 'As Percentage', value: `${round(a/(a+b)*100)}% : ${round(b/(a+b)*100)}%` },
  ]};
};

const fraction: CalcFn = (i) => {
  const n1 = Math.round(n(i.num1)), d1 = Math.round(n(i.den1));
  const n2 = Math.round(n(i.num2)), d2 = Math.round(n(i.den2));
  if (!d1 || !d2) return { outputs: [], error: 'Denominators cannot be zero.' };
  let rn: number, rd: number;
  if (i.operation === 'add') { rn = n1*d2 + n2*d1; rd = d1*d2; }
  else if (i.operation === 'subtract') { rn = n1*d2 - n2*d1; rd = d1*d2; }
  else if (i.operation === 'multiply') { rn = n1*n2; rd = d1*d2; }
  else { if (!n2) return { outputs: [], error: 'Cannot divide by zero.' }; rn = n1*d2; rd = d1*n2; }
  const g = gcd(Math.abs(rn), Math.abs(rd));
  return { outputs: [
    { label: 'Result', value: rd/g === 1 ? `${rn/g}` : `${rn/g}/${rd/g}`, highlight: true },
    { label: 'As Decimal', value: round(rn/rd).toString() },
    { label: 'Unsimplified', value: `${rn}/${rd}` },
  ]};
};

const exponent: CalcFn = (i) => {
  const base = n(i.base), exp = n(i.exponent);
  const result = Math.pow(base, exp);
  return { outputs: [
    { label: `${base}^${exp}`, value: fmt(result), highlight: true },
    { label: 'Scientific Notation', value: result.toExponential(4) },
  ]};
};

const squareRoot: CalcFn = (i) => {
  const num = n(i.number), root = n(i.root) || 2;
  if (num < 0 && root % 2 === 0) return { outputs: [], error: 'Cannot take even root of negative number.' };
  const result = Math.pow(num, 1/root);
  return { outputs: [
    { label: `${root === 2 ? '√' : `${root}√`}${num}`, value: round(result, 6).toString(), highlight: true },
    { label: 'Verification', value: `${round(result,4)}^${root} = ${round(Math.pow(result,root),4)}` },
  ]};
};

const logarithm: CalcFn = (i) => {
  const num = n(i.number), base = n(i.base);
  if (num <= 0) return { outputs: [], error: 'Number must be positive.' };
  const ln = Math.log(num);
  const log10 = Math.log10(num);
  const logBase = base ? ln / Math.log(base) : ln;
  return { outputs: [
    { label: base ? `log_${base}(${num})` : `ln(${num})`, value: round(logBase, 6).toString(), highlight: true },
    { label: 'Natural Log ln(x)', value: round(ln, 6).toString() },
    { label: 'Log base 10 log(x)', value: round(log10, 6).toString() },
  ]};
};

const prime: CalcFn = (i) => {
  const num = Math.floor(n(i.number));
  if (num < 2) return { outputs: [{ label: 'Result', value: `${num} is not prime.` }] };
  const isPrime = (n: number) => { if (n < 2) return false; for (let j=2; j<=Math.sqrt(n); j++) if (n%j===0) return false; return true; };
  const factors: number[] = [];
  let temp = num;
  for (let f = 2; f * f <= temp; f++) { while (temp % f === 0) { factors.push(f); temp /= f; } }
  if (temp > 1) factors.push(temp);
  return { outputs: [
    { label: `${num} is`, value: isPrime(num) ? '✅ Prime' : '❌ Not Prime (Composite)', highlight: true },
    { label: 'Prime Factors', value: isPrime(num) ? `${num}` : factors.join(' × ') },
    { label: 'Number of Factors', value: isPrime(num) ? '2 (1 and itself)' : factors.length.toString() },
  ]};
};

const quadratic: CalcFn = (i) => {
  const a = n(i.a), b = n(i.b), c = n(i.c);
  if (!a) return { outputs: [], error: 'Coefficient a cannot be zero.' };
  const disc = b*b - 4*a*c;
  if (disc < 0) {
    const re = round(-b/(2*a), 4), im = round(Math.sqrt(-disc)/(2*a), 4);
    return { outputs: [
      { label: 'Discriminant', value: round(disc, 4).toString() },
      { label: 'Root 1', value: `${re} + ${im}i`, highlight: true },
      { label: 'Root 2', value: `${re} − ${im}i` },
      { label: 'Root Type', value: 'Complex (no real roots)' },
    ]};
  }
  const x1 = (-b + Math.sqrt(disc)) / (2*a);
  const x2 = (-b - Math.sqrt(disc)) / (2*a);
  return { outputs: [
    { label: 'x₁', value: round(x1, 6).toString(), highlight: true },
    { label: 'x₂', value: round(x2, 6).toString(), highlight: true },
    { label: 'Discriminant', value: round(disc, 4).toString() },
    { label: 'Vertex x', value: round(-b/(2*a), 4).toString() },
    { label: 'Vertex y', value: round(c - b*b/(4*a), 4).toString() },
  ]};
};

const variance: CalcFn = (i) => {
  const nums = i.numbers.split(',').map(x => parseFloat(x.trim())).filter(x => !isNaN(x));
  if (nums.length < 2) return { outputs: [], error: 'Enter at least 2 numbers.' };
  const mean = nums.reduce((a,b) => a+b) / nums.length;
  const popVar = nums.reduce((s,x) => s + (x-mean)**2, 0) / nums.length;
  const sampVar = nums.reduce((s,x) => s + (x-mean)**2, 0) / (nums.length-1);
  return { outputs: [
    { label: 'Population Std Dev (σ)', value: round(Math.sqrt(popVar), 4).toString(), highlight: true },
    { label: 'Sample Std Dev (s)', value: round(Math.sqrt(sampVar), 4).toString() },
    { label: 'Population Variance (σ²)', value: round(popVar, 4).toString() },
    { label: 'Sample Variance (s²)', value: round(sampVar, 4).toString() },
    { label: 'Mean', value: round(mean, 4).toString() },
    { label: 'Count', value: nums.length.toString() },
  ]};
};

const factorial_calc: CalcFn = (i) => {
  const num = Math.floor(n(i.number));
  if (num < 0 || num > 170) return { outputs: [], error: 'Enter a number between 0 and 170.' };
  const result = factorial(num);
  return { outputs: [
    { label: `${num}!`, value: result.toLocaleString(), highlight: true },
    { label: 'Scientific Notation', value: Number(result).toExponential(4) },
    { label: 'Number of digits', value: result.toString().length.toString() },
  ]};
};

const binary: CalcFn = (i) => {
  const val = i.value?.trim() ?? '';
  let dec: number;
  try {
    dec = i.from === 'decimal' ? parseInt(val, 10) : i.from === 'binary' ? parseInt(val, 2) : i.from === 'octal' ? parseInt(val, 8) : parseInt(val, 16);
  } catch { return { outputs: [], error: 'Invalid input for selected base.' }; }
  if (isNaN(dec)) return { outputs: [], error: 'Invalid input for selected base.' };
  return { outputs: [
    { label: 'Decimal (base 10)', value: dec.toString(), highlight: i.from !== 'decimal' },
    { label: 'Binary (base 2)', value: dec.toString(2), highlight: i.from === 'decimal' },
    { label: 'Octal (base 8)', value: dec.toString(8) },
    { label: 'Hexadecimal (base 16)', value: dec.toString(16).toUpperCase() },
  ]};
};

const permComb: CalcFn = (i) => {
  const nv = Math.floor(n(i.n)), rv = Math.floor(n(i.r));
  if (rv > nv) return { outputs: [], error: 'r cannot exceed n.' };
  const npr = Number(factorial(nv)) / Number(factorial(nv - rv));
  const ncr = npr / Number(factorial(rv));
  return { outputs: [
    { label: `C(${nv},${rv}) — Combinations`, value: fmt(ncr), highlight: true },
    { label: `P(${nv},${rv}) — Permutations`, value: fmt(npr) },
    { label: 'n!', value: factorial(nv).toLocaleString() },
  ]};
};

const triangle: CalcFn = (i) => {
  const a = n(i.a), b = n(i.b), c = n(i.c);
  if (a+b<=c || a+c<=b || b+c<=a) return { outputs: [], error: 'Invalid triangle: sides do not satisfy triangle inequality.' };
  const s = (a+b+c)/2;
  const area = Math.sqrt(s*(s-a)*(s-b)*(s-c));
  const cosA = (b*b+c*c-a*a)/(2*b*c);
  const cosB = (a*a+c*c-b*b)/(2*a*c);
  const cosC = (a*a+b*b-c*c)/(2*a*b);
  return { outputs: [
    { label: 'Area', value: round(area, 4).toString(), highlight: true },
    { label: 'Perimeter', value: round(a+b+c, 4).toString() },
    { label: 'Angle A (opposite side a)', value: `${round(Math.acos(cosA)*180/Math.PI, 2)}°` },
    { label: 'Angle B (opposite side b)', value: `${round(Math.acos(cosB)*180/Math.PI, 2)}°` },
    { label: 'Angle C (opposite side c)', value: `${round(Math.acos(cosC)*180/Math.PI, 2)}°` },
    { label: 'Type', value: a===b && b===c ? 'Equilateral' : a===b||b===c||a===c ? 'Isosceles' : 'Scalene' },
  ]};
};

const circle: CalcFn = (i) => {
  const val = n(i.value);
  let r: number;
  if (i.inputType === 'radius') r = val;
  else if (i.inputType === 'diameter') r = val/2;
  else if (i.inputType === 'circumference') r = val/(2*Math.PI);
  else r = Math.sqrt(val/Math.PI);
  return { outputs: [
    { label: 'Radius', value: round(r, 4).toString(), highlight: i.inputType !== 'radius' },
    { label: 'Diameter', value: round(r*2, 4).toString() },
    { label: 'Circumference', value: round(2*Math.PI*r, 4).toString() },
    { label: 'Area', value: round(Math.PI*r*r, 4).toString() },
  ]};
};

/* ─── TIME & DATE ─── */
const age: CalcFn = (i) => {
  if (!i.birthdate) return { outputs: [], error: 'Enter date of birth.' };
  const birth = new Date(i.birthdate);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();
  if (days < 0) { months--; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
  if (months < 0) { years--; months += 12; }
  const totalDays = Math.floor((now.getTime() - birth.getTime()) / 86400000);
  const nextBday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
  if (nextBday <= now) nextBday.setFullYear(now.getFullYear() + 1);
  const daysToNext = Math.ceil((nextBday.getTime() - now.getTime()) / 86400000);
  return { outputs: [
    { label: 'Age', value: `${years} years, ${months} months, ${days} days`, highlight: true },
    { label: 'Total Days Lived', value: totalDays.toLocaleString() },
    { label: 'Total Hours Lived', value: (totalDays * 24).toLocaleString() },
    { label: 'Days Until Next Birthday', value: daysToNext.toString() },
  ]};
};

const dateDifference: CalcFn = (i) => {
  if (!i.startDate || !i.endDate) return { outputs: [], error: 'Select both dates.' };
  const s = new Date(i.startDate), e = new Date(i.endDate);
  const diff = Math.abs(e.getTime() - s.getTime());
  const days = Math.floor(diff / 86400000);
  return { outputs: [
    { label: 'Days', value: days.toLocaleString(), highlight: true },
    { label: 'Weeks', value: round(days/7, 2).toString() },
    { label: 'Months (approx)', value: round(days/30.44, 2).toString() },
    { label: 'Years (approx)', value: round(days/365.25, 2).toString() },
    { label: 'Hours', value: (days*24).toLocaleString() },
    { label: 'Minutes', value: (days*24*60).toLocaleString() },
  ]};
};

const timeDuration: CalcFn = (i) => {
  const total = n(i.hours1)*3600 + n(i.minutes1)*60 + n(i.seconds1) + n(i.hours2)*3600 + n(i.minutes2)*60;
  const h = Math.floor(total/3600), m = Math.floor((total%3600)/60), s = Math.floor(total%60);
  return { outputs: [
    { label: 'Total Duration', value: `${h}h ${m}m ${s}s`, highlight: true },
    { label: 'In Decimal Hours', value: round(total/3600, 4).toString() },
    { label: 'In Minutes', value: round(total/60, 2).toString() },
    { label: 'In Seconds', value: total.toString() },
  ]};
};

const workHours: CalcFn = (i) => {
  const startMins = n(i.startHour)*60 + n(i.startMin);
  let endMins = n(i.endHour)*60 + n(i.endMin);
  if (endMins <= startMins) endMins += 24*60;
  const worked = (endMins - startMins - n(i.breakMinutes)) / 60;
  const pay = worked * n(i.hourlyRate);
  return { outputs: [
    { label: 'Hours Worked', value: `${round(worked, 2)} hours`, highlight: true },
    { label: 'Gross Pay', value: `$${fmt(pay)}` },
    { label: 'Start Time', value: `${String(n(i.startHour)).padStart(2,'0')}:${String(n(i.startMin)).padStart(2,'0')}` },
    { label: 'End Time', value: `${String(n(i.endHour)).padStart(2,'0')}:${String(n(i.endMin)).padStart(2,'0')}` },
  ]};
};

const timeZone: CalcFn = (i) => {
  const h = n(i.hour), m = n(i.minute);
  const from = n(i.fromOffset), to = n(i.toOffset);
  const diff = to - from;
  let totalMin = h*60 + m + diff*60;
  while (totalMin < 0) totalMin += 1440;
  totalMin = totalMin % 1440;
  const nh = Math.floor(totalMin/60), nm = totalMin%60;
  const pad = (x: number) => String(x).padStart(2,'0');
  return { outputs: [
    { label: 'Converted Time', value: `${pad(nh)}:${pad(nm)}`, highlight: true },
    { label: 'Original Time', value: `${pad(h)}:${pad(m)} (UTC${from >= 0 ? '+' : ''}${from})` },
    { label: 'Time Difference', value: `${diff >= 0 ? '+' : ''}${diff} hours` },
    { label: 'Date Change', value: (h*60 + m + diff*60) < 0 ? '−1 day' : (h*60 + m + diff*60) >= 1440 ? '+1 day' : 'Same day' },
  ]};
};

const birthday: CalcFn = (i) => {
  if (!i.birthdate) return { outputs: [], error: 'Enter birthdate.' };
  const birth = new Date(i.birthdate);
  const now = new Date();
  const thisYear = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
  const nextBday = thisYear <= now ? new Date(now.getFullYear()+1, birth.getMonth(), birth.getDate()) : thisYear;
  const days = Math.ceil((nextBday.getTime()-now.getTime())/86400000);
  const age = nextBday.getFullYear() - birth.getFullYear();
  return { outputs: [
    { label: 'Days Until Birthday', value: days === 0 ? '🎉 Today!' : `${days} days`, highlight: true },
    { label: 'Next Birthday Date', value: nextBday.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}) },
    { label: 'Upcoming Age', value: `${age} years old` },
    { label: 'Day of Week', value: nextBday.toLocaleDateString('en-US',{weekday:'long'}) },
    { label: 'Weeks Away', value: `${round(days/7,1)} weeks` },
  ]};
};

/* ─── CONVERSION ─── */
const METERS: Record<string, number> = { mm:0.001, cm:0.01, meter:1, km:1000, in:0.0254, ft:0.3048, yd:0.9144, mi:1609.344, nm:1852 };
const length: CalcFn = (i) => {
  const val = n(i.value), fromM = METERS[i.from], toM = METERS[i.to];
  if (!fromM || !toM) return { outputs: [], error: 'Unknown unit.' };
  const result = val * fromM / toM;
  return { outputs: [{ label: `${val} ${i.from} =`, value: `${round(result, 6)} ${i.to}`, highlight: true }, { label: 'In meters', value: `${round(val*fromM,6)} m` }] };
};

const KG: Record<string, number> = { mg:0.000001, g:0.001, kg:1, mt:1000, oz:0.0283495, lb:0.453592, ton:907.185 };
const weight: CalcFn = (i) => {
  const val = n(i.value), fromK = KG[i.from], toK = KG[i.to];
  const result = val * fromK / toK;
  return { outputs: [{ label: `${val} ${i.from} =`, value: `${round(result, 6)} ${i.to}`, highlight: true }, { label: 'In grams', value: `${round(val*fromK*1000,4)} g` }] };
};

const temperature: CalcFn = (i) => {
  const val = n(i.value);
  let celsius: number;
  if (i.from === 'celsius') celsius = val;
  else if (i.from === 'fahrenheit') celsius = (val - 32) * 5/9;
  else celsius = val - 273.15;
  let result: number;
  if (i.to === 'celsius') result = celsius;
  else if (i.to === 'fahrenheit') result = celsius * 9/5 + 32;
  else result = celsius + 273.15;
  return { outputs: [
    { label: `${val}° ${i.from} =`, value: `${round(result, 2)} ${i.to === 'celsius' ? '°C' : i.to === 'fahrenheit' ? '°F' : 'K'}`, highlight: true },
    { label: 'Celsius', value: `${round(celsius, 2)}°C` },
    { label: 'Fahrenheit', value: `${round(celsius*9/5+32, 2)}°F` },
    { label: 'Kelvin', value: `${round(celsius+273.15, 2)} K` },
  ]};
};

const MS_PER: Record<string, number> = { kmh:1/3.6, mph:0.44704, ms:1, knots:0.514444, fts:0.3048 };
const speed: CalcFn = (i) => {
  const val = n(i.value);
  const mps = val * MS_PER[i.from];
  const result = mps / MS_PER[i.to];
  return { outputs: [
    { label: `${val} ${i.from} =`, value: `${round(result, 4)} ${i.to}`, highlight: true },
    { label: 'In m/s', value: `${round(mps, 4)} m/s` },
    { label: 'In km/h', value: `${round(mps*3.6, 4)} km/h` },
    { label: 'In mph', value: `${round(mps/0.44704, 4)} mph` },
  ]};
};

const SQM: Record<string, number> = { sqm:1, sqkm:1e6, sqft:0.092903, sqmi:2589988.11, acre:4046.86, hectare:10000 };
const area: CalcFn = (i) => {
  const val = n(i.value);
  const sqm = val * SQM[i.from];
  const result = sqm / SQM[i.to];
  return { outputs: [{ label: `${val} ${i.from} =`, value: `${round(result, 6)} ${i.to}`, highlight: true }, { label: 'In square meters', value: `${round(sqm, 4)} m²` }] };
};

const ML: Record<string, number> = { ml:1, liter:1000, cbm:1e6, floz:29.5735, cup:236.588, pint:473.176, quart:946.353, gallon:3785.41, ukgallon:4546.09 };
const volume: CalcFn = (i) => {
  const val = n(i.value);
  const ml = val * ML[i.from];
  const result = ml / ML[i.to];
  return { outputs: [{ label: `${val} ${i.from} =`, value: `${round(result, 6)} ${i.to}`, highlight: true }, { label: 'In milliliters', value: `${round(ml, 4)} ml` }] };
};

const BYTES: Record<string, number> = { bit:0.125, B:1, KB:1000, MB:1e6, GB:1e9, TB:1e12, PB:1e15, KiB:1024, MiB:1048576, GiB:1073741824 };
const dataStorage: CalcFn = (i) => {
  const val = n(i.value);
  const bytes = val * BYTES[i.from];
  const result = bytes / BYTES[i.to];
  return { outputs: [{ label: `${val} ${i.from} =`, value: `${round(result, 6)} ${i.to}`, highlight: true }, { label: 'In bytes', value: `${round(bytes, 0).toLocaleString()} B` }] };
};

const PA: Record<string, number> = { Pa:1, kPa:1000, bar:100000, psi:6894.76, atm:101325, mmHg:133.322 };
const pressure: CalcFn = (i) => {
  const val = n(i.value);
  const pa = val * PA[i.from];
  const result = pa / PA[i.to];
  return { outputs: [{ label: `${val} ${i.from} =`, value: `${round(result, 6)} ${i.to}`, highlight: true }, { label: 'In Pascal', value: `${round(pa, 4)} Pa` }] };
};

const COOK_ML: Record<string, number> = { tsp:4.92892, tbsp:14.7868, cup:236.588, floz:29.5735, ml:1, liter:1000 };
const cooking: CalcFn = (i) => {
  const val = n(i.value), ml = val * COOK_ML[i.from], result = ml / COOK_ML[i.to];
  return { outputs: [{ label: `${val} ${i.from} =`, value: `${round(result, 4)} ${i.to}`, highlight: true }] };
};

const shoeSize: CalcFn = (i) => {
  const size = n(i.size);
  let usMen: number;
  if (i.fromSystem === 'us_men') usMen = size;
  else if (i.fromSystem === 'us_women') usMen = size - 1.5;
  else if (i.fromSystem === 'uk') usMen = size + 0.5;
  else if (i.fromSystem === 'eu') usMen = (size - 31) / 1.5;
  else usMen = (size - 16) / 0.667;
  return { outputs: [
    { label: 'US Men', value: round(usMen, 1).toString(), highlight: true },
    { label: 'US Women', value: round(usMen + 1.5, 1).toString() },
    { label: 'UK', value: round(usMen - 0.5, 1).toString() },
    { label: 'EU', value: round(usMen * 1.5 + 31, 1).toString() },
    { label: 'Japan (cm)', value: round(usMen * 0.667 + 16, 1).toString() },
  ]};
};

/* ─── DAILY LIFE ─── */
const tip: CalcFn = (i) => {
  const bill = n(i.bill), pct = n(i.tipPercent), people = n(i.people) || 1;
  const tipAmt = bill * pct / 100;
  const total = bill + tipAmt;
  return { outputs: [
    { label: 'Tip Amount', value: `$${fmt(tipAmt)}`, highlight: true },
    { label: 'Total Bill', value: `$${fmt(total)}` },
    { label: `Per Person (${people})`, value: `$${fmt(total/people)}` },
    { label: 'Tip per Person', value: `$${fmt(tipAmt/people)}` },
  ]};
};

const fuelCost: CalcFn = (i) => {
  const dist = n(i.distance), eff = n(i.efficiency), price = n(i.fuelPrice);
  if (!eff) return { outputs: [], error: 'Enter fuel efficiency.' };
  const liters = dist / eff;
  const cost = liters * price;
  return { outputs: [
    { label: 'Total Fuel Cost', value: `$${fmt(cost)}`, highlight: true },
    { label: 'Fuel Needed', value: `${round(liters, 2)} liters` },
    { label: 'Cost per km', value: `$${round(cost/dist, 4)}` },
    { label: 'Distance', value: `${dist} km` },
  ]};
};

const GRADES: Record<string, number> = { 'A+':4.0,'A':4.0,'A-':3.7,'B+':3.3,'B':3.0,'B-':2.7,'C+':2.3,'C':2.0,'C-':1.7,'D+':1.3,'D':1.0,'D-':0.7,'F':0.0 };
const gpa: CalcFn = (i) => {
  const grades = i.grades.split(',').map(g => g.trim().toUpperCase());
  const credits = i.credits.split(',').map(c => parseFloat(c.trim()));
  if (grades.length !== credits.length) return { outputs: [], error: 'Number of grades and credits must match.' };
  let totalPts = 0, totalCredits = 0;
  const invalid: string[] = [];
  grades.forEach((g, idx) => {
    if (GRADES[g] !== undefined) { totalPts += GRADES[g] * credits[idx]; totalCredits += credits[idx]; }
    else invalid.push(g);
  });
  if (invalid.length) return { outputs: [], error: `Unknown grades: ${invalid.join(', ')}. Use A, B+, C-, etc.` };
  const gpaVal = totalPts / totalCredits;
  return { outputs: [
    { label: 'GPA', value: round(gpaVal, 3).toString(), highlight: true },
    { label: 'Letter Grade', value: gpaVal >= 3.7 ? 'A' : gpaVal >= 3.3 ? 'A-/B+' : gpaVal >= 3.0 ? 'B' : gpaVal >= 2.0 ? 'C' : 'Below C' },
    { label: 'Total Credit Hours', value: totalCredits.toString() },
    { label: 'Quality Points', value: round(totalPts, 2).toString() },
  ]};
};

const sleep: CalcFn = (i) => {
  const h = n(i.hour), m = n(i.minute);
  const totalMin = h*60 + m;
  const times: string[] = [];
  for (let cycles = 3; cycles <= 6; cycles++) {
    const minOffset = i.mode === 'wakeup' ? cycles * 90 : -cycles * 90;
    let t = (totalMin + minOffset + 1440) % 1440;
    const th = Math.floor(t/60), tm = t%60;
    const ampm = th < 12 ? 'AM' : 'PM';
    const h12 = th % 12 || 12;
    times.push(`${h12}:${String(tm).padStart(2,'0')} ${ampm} (${cycles} cycles)`);
  }
  return { outputs: [
    { label: i.mode === 'wakeup' ? 'Best Wake-Up Times' : 'Best Bedtimes', value: times[0], highlight: true },
    ...times.slice(1).map(t => ({ label: '', value: t })),
    { label: 'Note', value: '90-minute cycle + ~14 min to fall asleep' },
  ]};
};

const MET: Record<string, number> = { walking_slow:3.5, walking_fast:5.0, running:8.0, running_fast:11.5, cycling:7.0, swimming:8.0, jumprope:11.0, yoga:2.5, weights:5.0, hiit:10.0 };
const calorieBurn: CalcFn = (i) => {
  const w = n(i.weight), dur = n(i.duration), met = MET[i.activity] ?? 5;
  const cals = met * w * dur / 60;
  return { outputs: [
    { label: 'Calories Burned', value: `${round(cals)} kcal`, highlight: true },
    { label: 'Duration', value: `${dur} minutes` },
    { label: 'MET Value', value: met.toString() },
    { label: 'Per Hour Rate', value: `${round(cals/dur*60)} kcal/hour` },
  ]};
};

const electricity: CalcFn = (i) => {
  const w = n(i.watts), h = n(i.hours), d = n(i.days), rate = n(i.rate);
  const kwh = w/1000 * h * d;
  const cost = kwh * rate;
  return { outputs: [
    { label: 'Total Cost', value: `$${fmt(cost)}`, highlight: true },
    { label: 'Energy Used', value: `${round(kwh, 3)} kWh` },
    { label: 'Daily Cost', value: `$${fmt(w/1000*h*rate)}` },
    { label: 'Monthly Cost (30 days)', value: `$${fmt(w/1000*h*30*rate)}` },
  ]};
};

const concrete: CalcFn = (i) => {
  const l = n(i.length), w = n(i.width), d = n(i.depth)/12;
  const cubicFt = l * w * d;
  const cubicYd = cubicFt / 27;
  const bags60 = Math.ceil(cubicFt * 0.45 / 0.45);
  const bags80 = Math.ceil(cubicFt * 0.45 / 0.60);
  return { outputs: [
    { label: 'Cubic Yards', value: round(cubicYd, 2).toString(), highlight: true },
    { label: 'Cubic Feet', value: round(cubicFt, 2).toString() },
    { label: '60-lb Bags Needed', value: `${Math.ceil(cubicYd / 0.011)} bags` },
    { label: '80-lb Bags Needed', value: `${Math.ceil(cubicYd / 0.015)} bags` },
  ]};
};

const paint: CalcFn = (i) => {
  const l = n(i.length), w = n(i.width), h = n(i.height), coats = n(i.coats), doors = n(i.doors), windows = n(i.windows);
  const wallArea = 2*(l+w)*h - doors*21 - windows*15;
  const totalArea = wallArea * coats;
  const gallons = totalArea / 350;
  return { outputs: [
    { label: 'Gallons Needed', value: `${round(gallons, 2)} gallons`, highlight: true },
    { label: 'Quarts Needed', value: `${round(gallons*4, 1)} quarts` },
    { label: 'Wall Area', value: `${round(wallArea)} sq ft` },
    { label: 'Total Area (with coats)', value: `${round(totalArea)} sq ft` },
  ]};
};

const carpet: CalcFn = (i) => {
  const l = n(i.length), w = n(i.width), price = n(i.pricePerSqYd);
  const sqFt = l * w;
  const sqYd = sqFt / 9;
  const withWaste = sqYd * 1.10;
  const cost = withWaste * price;
  return { outputs: [
    { label: 'Carpet Needed (with 10% waste)', value: `${round(withWaste, 2)} sq yd`, highlight: true },
    { label: 'Room Area', value: `${round(sqFt, 1)} sq ft / ${round(sqYd, 2)} sq yd` },
    { label: 'Estimated Cost', value: `$${fmt(cost)}` },
  ]};
};

const grade: CalcFn = (i) => {
  const curr = n(i.currentGrade)/100, fw = n(i.finalWeight)/100, desired = n(i.desiredGrade)/100;
  const needed = (desired - curr * (1-fw)) / fw * 100;
  return { outputs: [
    { label: 'Score Needed on Final', value: `${round(needed, 2)}%`, highlight: true },
    { label: 'Current Grade', value: `${round(curr*100, 1)}%` },
    { label: 'Final Exam Weight', value: `${round(fw*100, 1)}%` },
    { label: 'Desired Grade', value: `${round(desired*100, 1)}%` },
    { label: 'Achievable?', value: needed <= 100 ? '✅ Yes' : '❌ Need more than 100% — adjust goal' },
  ]};
};

const billSplit: CalcFn = (i) => {
  const bill = n(i.bill), tip_pct = n(i.tip), people = n(i.people)||1;
  const tipAmt = bill * tip_pct/100;
  const total = bill + tipAmt;
  return { outputs: [
    { label: 'Each Person Pays', value: `$${fmt(total/people)}`, highlight: true },
    { label: 'Total Bill (with tip)', value: `$${fmt(total)}` },
    { label: 'Tip Amount', value: `$${fmt(tipAmt)}` },
    { label: 'Tip per Person', value: `$${fmt(tipAmt/people)}` },
  ]};
};

const FOOD_CALS: Record<string, number> = { rice_cooked:130, white_bread:80, egg_boiled:78, chicken_breast:165, salmon:208, banana:89, apple:95, milk_whole:149, cheddar:113, olive_oil:119, avocado_half:161, sweet_potato:130, oats:150, greek_yogurt:100, almonds:164 };
const foodCalories: CalcFn = (i) => {
  const cals = (FOOD_CALS[i.food] ?? 100) * n(i.servings);
  return { outputs: [
    { label: 'Calories', value: `${round(cals)} kcal`, highlight: true },
    { label: 'Servings', value: i.servings },
    { label: 'Per Serving', value: `${FOOD_CALS[i.food] ?? 100} kcal` },
    { label: 'Note', value: 'Approximate values; actual calories vary.' },
  ]};
};

/* ─── HEALTH: more ─── */
const macro: CalcFn = (i) => {
  const cal = n(i.calories);
  let pct = i.goal === 'lose' ? [0.40, 0.30, 0.30] : i.goal === 'build' ? [0.30, 0.40, 0.30] : [0.30, 0.35, 0.35];
  const protein = round(cal * pct[0] / 4);
  const carbs = round(cal * pct[1] / 4);
  const fat = round(cal * pct[2] / 9);
  return { outputs: [
    { label: 'Protein', value: `${protein}g (${round(cal*pct[0])} cal)`, highlight: true },
    { label: 'Carbohydrates', value: `${carbs}g (${round(cal*pct[1])} cal)` },
    { label: 'Fat', value: `${fat}g (${round(cal*pct[2])} cal)` },
    { label: 'Total Calories', value: `${cal} kcal` },
  ]};
};

const protein_calc: CalcFn = (i) => {
  const w = n(i.weight);
  const mult = i.activityLevel === 'sedentary' ? 0.8 : i.activityLevel === 'light' ? 1.0 : i.activityLevel === 'moderate' ? 1.2 : i.activityLevel === 'active' ? 1.6 : 2.0;
  const g = round(w * mult);
  return { outputs: [
    { label: 'Daily Protein Target', value: `${g}g`, highlight: true },
    { label: 'Range', value: `${round(w*0.8)}g – ${round(w*mult*1.1)}g` },
    { label: 'Calories from Protein', value: `${g*4} kcal` },
  ]};
};

const menstrualCycle: CalcFn = (i) => {
  if (!i.lastPeriod) return { outputs: [], error: 'Enter last period date.' };
  const last = new Date(i.lastPeriod), cycle = n(i.cycleLength)||28, dur = n(i.periodDuration)||5;
  const fmt = (d: Date) => d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  const next1 = new Date(last.getTime() + cycle*86400000);
  const next2 = new Date(next1.getTime() + cycle*86400000);
  const next3 = new Date(next2.getTime() + cycle*86400000);
  const fertStart = new Date(next1.getTime() - 19*86400000);
  const fertEnd = new Date(next1.getTime() - 12*86400000);
  return { outputs: [
    { label: 'Next Period', value: fmt(next1), highlight: true },
    { label: 'Fertile Window', value: `${fmt(fertStart)} – ${fmt(fertEnd)}` },
    { label: '2nd Next Period', value: fmt(next2) },
    { label: '3rd Next Period', value: fmt(next3) },
    { label: 'Period Duration', value: `${dur} days` },
  ]};
};

const bac: CalcFn = (i) => {
  const drinks = n(i.drinks), hours = n(i.hours), w = n(i.weight);
  const r = i.gender === 'female' ? 0.55 : 0.68;
  const raw = (drinks * 14 * 0.789) / (w * 1000 * r) * 100;
  const bacVal = Math.max(0, raw - hours * 0.015);
  let status: string;
  if (bacVal === 0) status = 'Sober';
  else if (bacVal < 0.04) status = '😊 Slight relaxation';
  else if (bacVal < 0.08) status = '😌 Mild impairment';
  else if (bacVal < 0.15) status = '⚠️ Legally impaired in most countries — DO NOT drive';
  else if (bacVal < 0.30) status = '🚨 Dangerous — severe impairment';
  else status = '⛔ Life-threatening';
  return { outputs: [
    { label: 'Estimated BAC', value: `${round(bacVal, 3)}%`, highlight: true },
    { label: 'Status', value: status },
    { label: 'Time to reach 0.00%', value: `~${round(bacVal/0.015, 1)} hours` },
    { label: 'Safe to drive?', value: bacVal >= 0.05 ? '❌ NO' : '✅ Likely (but vary by location)' },
  ]};
};

const childBmi: CalcFn = (i) => {
  const w = n(i.weight), h = n(i.height)/100;
  const bmiVal = w / (h*h);
  return { outputs: [
    { label: 'BMI', value: round(bmiVal, 1).toString(), highlight: true },
    { label: 'Interpretation', value: 'Compare against CDC BMI-for-age percentile charts for accurate classification.' },
    { label: 'Note', value: 'Child BMI is age- and sex-specific — consult a pediatrician for proper assessment.' },
  ]};
};

const bmiPrime: CalcFn = (i) => {
  const w = n(i.weight), h = n(i.height)/100;
  const bmiVal = w/(h*h);
  const prime = round(bmiVal/25, 3);
  return { outputs: [
    { label: 'BMI Prime', value: prime.toString(), highlight: true },
    { label: 'BMI', value: round(bmiVal, 1).toString() },
    { label: 'Interpretation', value: prime < 1 ? '✅ Below upper limit of normal' : prime === 1 ? '⚡ At upper limit of normal' : '⚠️ Above normal range' },
  ]};
};

const braSize: CalcFn = (i) => {
  const ub = n(i.underbust), bust = n(i.bust);
  let band = Math.round(ub/2.54);
  if (band % 2 !== 0) band++;
  const diff = round((bust - ub)/2.54, 0);
  const CUPS = ['','AA','A','B','C','D','DD','DDD/F','G'];
  const cup = CUPS[Math.max(0, Math.min(diff, CUPS.length-1))];
  return { outputs: [
    { label: 'Estimated Bra Size (US)', value: `${band}${cup}`, highlight: true },
    { label: 'Band Size', value: `${band}" (${round(band*2.54)} cm)` },
    { label: 'Cup Size', value: cup },
    { label: 'Note', value: 'Sizes vary by brand — try a professional fitting for accuracy.' },
  ]};
};

const pace: CalcFn = (i) => {
  const pMin = n(i.paceMin), pSec = n(i.paceSec);
  const paceInSec = pMin*60 + pSec;
  const dist = n(i.distance);
  const tH = n(i.timeHour), tM = n(i.timeMin);
  const timeInSec = tH*3600 + tM*60;
  let outputs: CalcResult['outputs'] = [];
  if (i.solve === 'time') {
    const totalSec = paceInSec * dist;
    const h = Math.floor(totalSec/3600), m = Math.floor((totalSec%3600)/60), s = Math.floor(totalSec%60);
    outputs = [{ label: 'Finish Time', value: `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`, highlight: true }, { label: 'Pace', value: `${pMin}:${String(Math.round(pSec)).padStart(2,'0')} /km` }];
  } else if (i.solve === 'pace') {
    const sec = timeInSec / dist;
    outputs = [{ label: 'Pace', value: `${Math.floor(sec/60)}:${String(Math.round(sec%60)).padStart(2,'0')} /km`, highlight: true }];
  } else {
    const km = timeInSec / paceInSec;
    outputs = [{ label: 'Distance', value: `${round(km, 2)} km`, highlight: true }, { label: 'Approx Miles', value: `${round(km/1.609, 2)} mi` }];
  }
  return { outputs };
};

const speedDistTime: CalcFn = (i) => {
  const sp = n(i.speed), dist = n(i.distance), time = n(i.time);
  if (i.solve === 'time') return { outputs: [{ label: 'Time', value: `${round(dist/sp, 4)} hours`, highlight: true }, { label: 'In hours:min', value: (() => { const t=dist/sp; return `${Math.floor(t)}h ${Math.round((t%1)*60)}m`; })() }] };
  if (i.solve === 'speed') return { outputs: [{ label: 'Speed', value: `${round(dist/time, 4)} km/h`, highlight: true }] };
  return { outputs: [{ label: 'Distance', value: `${round(sp*time, 4)} km`, highlight: true }] };
};

/* ─── FUN ─── */
const love: CalcFn = (i) => {
  if (!i.name1 || !i.name2) return { outputs: [], error: 'Enter both names.' };
  const combined = (i.name1 + i.name2).toUpperCase();
  let hash = 0;
  for (let j = 0; j < combined.length; j++) hash = ((hash << 5) - hash) + combined.charCodeAt(j);
  const pct = Math.abs(hash % 71) + 30;
  const msg = pct > 90 ? '💕 Soulmates!' : pct > 75 ? '❤️ Great match!' : pct > 60 ? '😊 Good compatibility' : pct > 45 ? '🤞 Could work with effort' : '😅 Opposites attract?';
  return { outputs: [
    { label: 'Love Compatibility', value: `${pct}%`, highlight: true },
    { label: 'Verdict', value: msg },
    { label: 'Fun Disclaimer', value: 'For entertainment only 😄' },
  ]};
};

const password: CalcFn = (i) => {
  const len = Math.min(128, Math.max(4, Math.floor(n(i.length))));
  let chars = 'abcdefghijklmnopqrstuvwxyz';
  if (i.uppercase !== 'no') chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (i.numbers !== 'no') chars += '0123456789';
  if (i.symbols !== 'no') chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  const pwd = Array.from(arr).map(x => chars[x % chars.length]).join('');
  const entropy = Math.floor(len * Math.log2(chars.length));
  return { outputs: [
    { label: 'Generated Password', value: pwd, highlight: true },
    { label: 'Entropy', value: `${entropy} bits` },
    { label: 'Strength', value: entropy > 80 ? '💪 Very Strong' : entropy > 60 ? '✅ Strong' : entropy > 40 ? '⚡ Moderate' : '⚠️ Weak' },
    { label: 'Character Pool', value: chars.length.toString() },
  ]};
};

const randomNumber: CalcFn = (i) => {
  const min = Math.floor(n(i.min)), max = Math.floor(n(i.max)), count = Math.min(50, Math.floor(n(i.count))||1);
  if (min > max) return { outputs: [], error: 'Min must be less than or equal to max.' };
  const arr = new Uint32Array(count);
  crypto.getRandomValues(arr);
  const nums = Array.from(arr).map(x => min + (x % (max - min + 1)));
  return { outputs: [
    { label: `Random Number${count > 1 ? 's' : ''}`, value: nums.join(', '), highlight: true },
    { label: 'Range', value: `${min} – ${max}` },
    { label: 'Count', value: count.toString() },
  ]};
};

const namePicker: CalcFn = (i) => {
  const names = i.names.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
  if (!names.length) return { outputs: [], error: 'Enter at least one name.' };
  const count = Math.min(n(i.count), names.length);
  const shuffled = [...names].sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, count);
  return { outputs: [
    { label: `Selected Name${count > 1 ? 's' : ''}`, value: picked.join(', '), highlight: true },
    { label: 'Total Names in Pool', value: names.length.toString() },
    { label: 'Remaining Names', value: shuffled.slice(count).join(', ') || 'None' },
  ]};
};

const ageInSeconds: CalcFn = (i) => {
  if (!i.birthdate) return { outputs: [], error: 'Enter date of birth.' };
  const ms = Date.now() - new Date(i.birthdate).getTime();
  const secs = Math.floor(ms/1000);
  return { outputs: [
    { label: 'Seconds Lived', value: secs.toLocaleString(), highlight: true },
    { label: 'Minutes Lived', value: Math.floor(secs/60).toLocaleString() },
    { label: 'Hours Lived', value: Math.floor(secs/3600).toLocaleString() },
    { label: 'Days Lived', value: Math.floor(secs/86400).toLocaleString() },
    { label: 'Weeks Lived', value: Math.floor(secs/604800).toLocaleString() },
  ]};
};

const coinFlip: CalcFn = (i) => {
  const count = Math.min(1000, Math.floor(n(i.flips))||1);
  const arr = new Uint32Array(count);
  crypto.getRandomValues(arr);
  const heads = Array.from(arr).filter(x => x%2===0).length;
  const tails = count - heads;
  if (count === 1) return { outputs: [{ label: 'Result', value: heads ? '🪙 Heads' : '🪙 Tails', highlight: true }] };
  return { outputs: [
    { label: 'Heads', value: `${heads} (${round(heads/count*100)}%)`, highlight: true },
    { label: 'Tails', value: `${tails} (${round(tails/count*100)}%)` },
    { label: 'Total Flips', value: count.toString() },
  ]};
};

const diceRoller: CalcFn = (i) => {
  const num = Math.min(20, Math.floor(n(i.numDice))||1), sides = Math.floor(n(i.sides))||6;
  const arr = new Uint32Array(num);
  crypto.getRandomValues(arr);
  const rolls = Array.from(arr).map(x => (x % sides) + 1);
  const total = rolls.reduce((a,b)=>a+b,0);
  return { outputs: [
    { label: 'Total', value: total.toString(), highlight: true },
    { label: 'Individual Rolls', value: rolls.join(', ') },
    { label: 'Dice', value: `${num}d${sides}` },
    { label: 'Average', value: round(total/num, 2).toString() },
  ]};
};

const numerology: CalcFn = (i) => {
  if (!i.birthdate) return { outputs: [], error: 'Enter birthdate.' };

  const d = new Date(i.birthdate);

  const dateStr =
    d.getFullYear().toString() +
    (d.getMonth() + 1).toString() +
    d.getDate().toString();

  let sum = dateStr
    .split('')
    .reduce((s, c) => s + parseInt(c), 0);

  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum
      .toString()
      .split('')
      .reduce((s, c) => s + parseInt(c), 0);
  }

  const MEANINGS: Record<number, string> = {
    1: 'The Leader — independent, ambitious',
    2: 'The Peacemaker — cooperative, sensitive',
    3: 'The Creative — expressive, optimistic',
    4: 'The Builder — practical, disciplined',
    5: 'The Freedom Seeker — adventurous, versatile',
    6: 'The Nurturer — caring, responsible',
    7: 'The Seeker — analytical, introspective',
    8: 'The Achiever — ambitious, powerful',
    9: 'The Humanitarian — compassionate, global',
    11: 'Master Number — intuitive, inspirational',
    22: 'Master Builder — practical idealism',
    33: 'Master Teacher — devoted, compassionate'
  };

  return {
    outputs: [
      { label: 'Life Path Number', value: sum.toString(), highlight: true },
      { label: 'Meaning', value: MEANINGS[sum] ?? 'Unique path' },
      { label: 'Note', value: 'For entertainment purposes only.' }
    ]
  };
};

const chineseZodiac: CalcFn = (i) => {
  const year = Math.floor(n(i.year));
  const ANIMALS = ['Rat','Ox','Tiger','Rabbit','Dragon','Snake','Horse','Goat','Monkey','Rooster','Dog','Pig'];
  const ELEMENTS = ['Metal','Metal','Water','Water','Wood','Wood','Fire','Fire','Earth','Earth'];
  const animal = ANIMALS[(year - 4) % 12];
  const element = ELEMENTS[(year - 4) % 10];
  const TRAITS: Record<string, string> = { Rat:'Clever, resourceful, adaptable', Ox:'Diligent, dependable, strong', Tiger:'Brave, confident, competitive', Rabbit:'Quiet, elegant, kind', Dragon:'Confident, intelligent, enthusiastic', Snake:'Enigmatic, intuitive, wise', Horse:'Animated, active, energetic', Goat:'Calm, gentle, sympathetic', Monkey:'Sharp, smart, curious', Rooster:'Observant, hardworking, courageous', Dog:'Loyal, reliable, kind', Pig:'Compassionate, generous, diligent' };
  return { outputs: [
    { label: 'Chinese Zodiac', value: `${animal} (${year})`, highlight: true },
    { label: 'Element', value: element },
    { label: 'Traits', value: TRAITS[animal] ?? '' },
    { label: 'Next Year of the ' + animal, value: `${year + 12}` },
  ]};
};

const readingTime: CalcFn = (i) => {
  const words = n(i.wordCount), wpm = n(i.wpm)||230;
  const mins = words / wpm;
  const h = Math.floor(mins/60), m = Math.floor(mins%60), s = Math.round((mins%1)*60);
  return { outputs: [
    { label: 'Reading Time', value: h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`, highlight: true },
    { label: 'Words', value: words.toLocaleString() },
    { label: 'Reading Speed', value: `${wpm} WPM` },
    { label: 'Pages (250 words/page)', value: round(words/250, 1).toString() },
  ]};
};

/* ─── REGISTRY ─── */
export const CALCULATIONS: Record<string, CalcFn> = {
  bmi, bmr, calories, bodyFat, idealWeight, waterIntake, pregnancyDueDate, ovulation,
  bloodPressure, heartRateZone, macro, protein: protein_calc, menstrualCycle, bac, childBmi, bmiPrime, braSize, pace,
  loanEmi, simpleInterest, compoundInterest, savings, investmentReturn, salary, discount,
  profitMargin, tax, currency, mortgage, retirement, breakEven, netWorth, inflation,
  percentage, average, ratio, fraction, exponent, squareRoot, logarithm, prime, quadratic, variance,
  factorial: factorial_calc, binary, permComb, triangle, circle,
  age, dateDifference, timeDuration, workHours, timeZone, birthday, speedDistTime,
  length, weight, temperature, speed, area, volume, dataStorage, pressure, cooking, shoeSize,
  tip, fuelCost, gpa, sleep, calorieBurn, electricity, concrete, paint, carpet, grade, billSplit, foodCalories,
  love, password, randomNumber, namePicker, ageInSeconds, coinFlip, diceRoller, numerology, chineseZodiac, readingTime,
};

export function calculate(formula: string, inputs: Record<string, string>): CalcResult {
  const fn = CALCULATIONS[formula];
  if (!fn) return { outputs: [], error: `Calculator "${formula}" not found.` };
  try { return fn(inputs); }
  catch (e) { return { outputs: [], error: 'Calculation error. Please check your inputs.' }; }
}
