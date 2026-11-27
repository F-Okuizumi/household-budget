import {daysInMonth} from './calculator.js';
export {localToday} from './db.js';
export function shiftMonth(month, delta){daysInMonth(month);if(!Number.isSafeInteger(delta))throw new RangeError('delta');const [y,m]=month.split('-').map(Number);const i=y*12+m-1+delta;const year=Math.floor(i/12);if(year<1||year>9999)throw new RangeError('year');return `${String(year).padStart(4,'0')}-${String(i%12+1).padStart(2,'0')}`;}
export function dateKey(month,day){if(!Number.isInteger(day)||day<1||day>daysInMonth(month))throw new RangeError('day');return `${month}-${String(day).padStart(2,'0')}`;}
export function monthLabel(month){daysInMonth(month);const [y,m]=month.split('-').map(Number);return `${y}年${m}月`;}
export function weekday(month,day=1){const d=new Date(0);d.setUTCFullYear(...[Number(month.slice(0,4)),Number(month.slice(5))-1,Number(dateKey(month,day).slice(8))]);return d.getUTCDay();}
export function formatYen(value,{signed=false,unit=true}={}){const n=typeof value==='object'?value.display:Math.floor(value);if(!Number.isSafeInteger(n))throw new RangeError('amount');return (n<0?'−':signed&&n>0?'+':'')+Math.abs(n).toLocaleString('ja-JP')+(unit?'円':'');}
export function parseYen(raw,{min=0}={}){if(typeof raw!=='string'||!/^\d+$/.test(raw))throw new RangeError('整数の金額を入力してください');const n=Number(raw);if(!Number.isSafeInteger(n)||n<min)throw new RangeError('金額が範囲外です');return n;}
