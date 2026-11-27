import {test} from 'node:test';import assert from 'node:assert/strict';import {shiftMonth,dateKey,weekday,formatYen,parseYen,monthLabel} from '../js/utils.js';
test('month shifts',()=>{assert.equal(shiftMonth('2026-12',1),'2027-01');assert.equal(shiftMonth('2026-01',-1),'2025-12');});
test('dates and weekday',()=>{assert.equal(dateKey('2028-02',29),'2028-02-29');assert.throws(()=>dateKey('2026-02',29));assert.equal(weekday('2026-11',26),4);assert.equal(monthLabel('2026-11'),'2026年11月');});
test('signed amounts and rounding',()=>{assert.equal(formatYen(-2.1),'−3円');assert.equal(formatYen(2000,{signed:true}),'+2,000円');assert.equal(formatYen(0,{signed:true}),'0円');assert.equal(formatYen({display:6096}),'6,096円');});
test('input validation',()=>{assert.equal(parseYen('0012'),12);for(const s of ['','-1','1.2','1e3','9007199254740992'])assert.throws(()=>parseYen(s));assert.throws(()=>parseYen('0',{min:1}));});
