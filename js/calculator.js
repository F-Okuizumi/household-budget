// Pure budget calculation. Monetary inputs are integer yen.
const integer = (v, name, min = 0) => {
  if (!Number.isSafeInteger(v) || v < min) throw new RangeError(name);
  return v;
};
const safe = v => { if (!Number.isSafeInteger(v)) throw new RangeError('Amount overflow'); return v; };
export function daysInMonth(month) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new RangeError('month');
  const [y,m] = month.split('-').map(Number);
  return m === 2 ? (y%4===0 && (y%100!==0 || y%400===0) ? 29 : 28) : [4,6,9,11].includes(m) ? 30 : 31;
}
// Exact rational values are represented by integer numerator / days.
const money = (numerator, denominator) => ({numerator, denominator, value:numerator/denominator, display:Math.floor(numerator/denominator)});
export function calculateMonth(settings, expenses = [], previousEnd = 0) {
  const {month, income, fixedCosts, carryMode='auto', manualCarry=null} = settings;
  const n = daysInMonth(month);
  const fixed = fixedCosts.reduce((s,x)=>safe(s+integer(x.amount,'fixed cost')),0);
  const budget = safe(integer(income,'income')-fixed);
  if (!['auto','manual'].includes(carryMode)) throw new RangeError('carryMode');
  const carry = carryMode==='manual' ? integer(manualCarry,'manualCarry',Number.MIN_SAFE_INTEGER) : Math.min(0,integer(previousEnd,'previousEnd',Number.MIN_SAFE_INTEGER));
  if (carry>0) throw new RangeError('Positive carry');
  const totals = Array(n).fill(0);
  for (const e of expenses) {
    if (typeof e.date!=='string' || !/^\d{4}-\d{2}-\d{2}$/.test(e.date) || e.date.slice(0,7)!==month) throw new RangeError('expense date');
    const d=Number(e.date.slice(8));
    if(d<1||d>n) throw new RangeError('expense day');
    totals[d-1]=safe(totals[d-1]+integer(e.amount,'expense',1));
  }
  let cumulative=0;
  const days=totals.map((spent,i)=>{
    const d=i+1;
    const prior=safe(safe(carry*n)+safe(budget*i)-safe(cumulative*n));
    const before=safe(prior+budget);
    cumulative=safe(cumulative+spent);
    const balance=safe(before-safe(spent*n));
    return {day:d, spent, prior:money(prior,n), dailyBalance:money(safe(budget-safe(spent*n)),n), available:money(safe(Math.max(0,before)-safe(spent*n)),n), balance:money(balance,n)};
  });
  const end=safe(budget+carry-cumulative);
  return {month, fixed, budget, carry, dailyBudget:money(budget,n), days, totalSpent:cumulative, monthEnd:end, nextCarry:Math.min(0,end)};
}
export function calculateMonths(settings, expenses=[], initialPreviousEnd=0) {
  const sorted=[...settings].sort((a,b)=>a.month.localeCompare(b.month));
  const results=[];
  let previous=initialPreviousEnd;
  for(const s of sorted){
    const last=results.at(-1);
    if(last){const [y,m]=last.month.split('-').map(Number);const next=`${m===12?y+1:y}-${String(m===12?1:m+1).padStart(2,'0')}`;if(s.month!==next)throw new RangeError('Months must be consecutive');}
    const r=calculateMonth(s,expenses.filter(e=>e.date.slice(0,7)===s.month),previous);
    results.push(r);previous=r.monthEnd;
  }
  return results;
}
