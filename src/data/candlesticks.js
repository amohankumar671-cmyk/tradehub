export const PATTERN_TYPES = {
  bull: { label: 'Bullish Reversal', color: '#00D68F', bg: 'rgba(0,214,143,0.1)',   border: 'rgba(0,214,143,0.25)'  },
  bear: { label: 'Bearish Reversal', color: '#FF4D6A', bg: 'rgba(255,77,106,0.1)',  border: 'rgba(255,77,106,0.25)' },
  cont: { label: 'Continuation',     color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)' },
};

const G = '#00D68F';
const R = '#FF4D6A';
const W = '#8A9BB5';
const A = '#F59E0B';
const B = '#3D8EF0';

// SVG path builder helpers — all return SVG string fragments
// Candle: x=cx, y=top of body, w=width, h=body height, wick_top, wick_bot, color
function bullCandle(cx, bodyTop, bodyH, wickTop, wickBot, w = 12) {
  const x = cx - w / 2;
  return `
    <line x1="${cx}" y1="${bodyTop - wickTop}" x2="${cx}" y2="${bodyTop}" stroke="${G}" stroke-width="1.5"/>
    <rect x="${x}" y="${bodyTop}" width="${w}" height="${bodyH}" fill="none" stroke="${G}" stroke-width="1.5" rx="1"/>
    <line x1="${cx}" y1="${bodyTop + bodyH}" x2="${cx}" y2="${bodyTop + bodyH + wickBot}" stroke="${G}" stroke-width="1.5"/>`;
}

function bearCandle(cx, bodyTop, bodyH, wickTop, wickBot, w = 12) {
  const x = cx - w / 2;
  return `
    <line x1="${cx}" y1="${bodyTop - wickTop}" x2="${cx}" y2="${bodyTop}" stroke="${R}" stroke-width="1.5"/>
    <rect x="${x}" y="${bodyTop}" width="${w}" height="${bodyH}" fill="${R}" stroke="${R}" stroke-width="1.5" rx="1"/>
    <line x1="${cx}" y1="${bodyTop + bodyH}" x2="${cx}" y2="${bodyTop + bodyH + wickBot}" stroke="${R}" stroke-width="1.5"/>`;
}

function dojiCandle(cx, bodyY, wickTop, wickBot, w = 14) {
  const x = cx - w / 2;
  return `
    <line x1="${cx}" y1="${bodyY - wickTop}" x2="${cx}" y2="${bodyY}" stroke="${W}" stroke-width="1.5"/>
    <rect x="${x}" y="${bodyY}" width="${w}" height="3" fill="none" stroke="${W}" stroke-width="1.5" rx="1"/>
    <line x1="${cx}" y1="${bodyY + 3}" x2="${cx}" y2="${bodyY + 3 + wickBot}" stroke="${W}" stroke-width="1.5"/>`;
}

// Card preview SVG (compact, 100×90 viewBox)
function previewSVG(inner) {
  return `<svg viewBox="0 0 100 90" width="100" height="90" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}

// Detail chart SVG (larger, 340×140 viewBox)
function detailSVG(inner) {
  return `<svg viewBox="0 0 340 140" width="100%" height="140" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}

const patterns = [
  // ────────────── BULLISH ──────────────
  {
    id: 'hammer',
    name: 'Hammer',
    type: 'bull',
    shortDesc: 'Long lower wick at support — buyers absorbed all selling',
    winRate: 69,
    rr: '1:2.5',
    timeframe: 'All TFs',
    candles: 1,
    previewSVG: previewSVG(
      bullCandle(50, 18, 14, 4, 50, 14)
    ),
    detailSVG: detailSVG(`
      ${bearCandle(20, 38, 22, 4, 5)}
      ${bearCandle(44, 34, 24, 4, 5)}
      ${bearCandle(68, 32, 22, 4, 5)}
      ${bullCandle(92, 56, 14, 4, 50, 14)}
      ${bullCandle(116, 42, 20, 4, 6)}
      ${bullCandle(140, 28, 22, 4, 5)}
      <line x1="76" y1="110" x2="260" y2="110" stroke="rgba(0,214,143,0.35)" stroke-width="1" stroke-dasharray="4,3"/>
      <text x="265" y="113" fill="${G}" font-size="9" font-family="monospace">Support</text>
      <circle cx="92" cy="106" r="5" fill="none" stroke="${A}" stroke-width="1.5"/>
      <text x="78" y="128" fill="${W}" font-size="9" font-family="monospace">Hammer at support</text>
    `),
    description: 'A Hammer forms after a downtrend when sellers push price sharply lower during the session but buyers step in and drive it back up near the open. The long lower wick (at least 2× the body) proves buyer strength at the tested level.',
    context: 'Must form at a key support zone, Fibonacci level, or moving average. The location is more important than the candle shape itself.',
    rules: [
      'Small body at the TOP of the candle range (open ≈ close)',
      'Lower wick at least 2–3× the length of the body',
      'Little to no upper wick',
      'Appears after a clear downtrend of 3+ candles',
      'Next candle must close above the Hammer high — always wait for confirmation',
    ],
    confirmation: 'Enter at open of the candle after the confirmation close, or on break above the Hammer high.',
    stopLoss: 'Below the low of the Hammer\'s wick',
    relatedIds: ['bullish-engulfing', 'morning-star', 'pin-bar'],
  },
  {
    id: 'bullish-engulfing',
    name: 'Bullish Engulfing',
    type: 'bull',
    shortDesc: 'Large green candle fully swallows prior red body',
    winRate: 69,
    rr: '1:2.1',
    timeframe: 'Daily/Weekly',
    candles: 2,
    previewSVG: previewSVG(`
      ${bearCandle(36, 24, 26, 5, 6, 12)}
      ${bullCandle(62, 14, 50, 5, 6, 16)}
    `),
    detailSVG: detailSVG(`
      ${bearCandle(20, 42, 22, 4, 5)}
      ${bearCandle(44, 38, 26, 4, 5)}
      ${bearCandle(68, 50, 24, 4, 6)}
      ${bearCandle(92, 52, 26, 4, 5)}
      ${bullCandle(116, 44, 46, 5, 6, 18)}
      ${bullCandle(146, 32, 26, 4, 5)}
      ${bullCandle(170, 20, 24, 4, 5)}
      <line x1="76" y1="115" x2="270" y2="115" stroke="rgba(0,214,143,0.3)" stroke-width="1" stroke-dasharray="4,3"/>
      <text x="275" y="118" fill="${G}" font-size="9" font-family="monospace">Support</text>
      <text x="84" y="130" fill="${W}" font-size="9" font-family="monospace">Red  Engulfs →  Continuation</text>
    `),
    description: 'A large green candle opens below the prior red candle\'s close and closes above its open — completely engulfing the red body. This shows an overwhelming wave of buyers absorbing all available selling pressure in a single session.',
    context: 'Most powerful at a clear support level. Volume on the green candle should be noticeably higher than the prior red candle.',
    rules: [
      'Green candle opens below prior red candle\'s close',
      'Green candle closes above prior red candle\'s open (full body engulf)',
      'Green body must be larger than the red body',
      'Appears after a downtrend or at a key support zone',
      'Higher volume on the green candle significantly strengthens the signal',
    ],
    confirmation: 'Enter at the close of the engulfing candle itself — no separate confirmation needed if volume is high.',
    stopLoss: 'Below the low of the engulfing green candle',
    relatedIds: ['hammer', 'morning-star', 'three-white-soldiers'],
  },
  {
    id: 'morning-star',
    name: 'Morning Star',
    type: 'bull',
    shortDesc: '3-candle bottom: large red, doji, large green',
    winRate: 71,
    rr: '1:2.4',
    timeframe: 'Daily/Weekly',
    candles: 3,
    previewSVG: previewSVG(`
      ${bearCandle(28, 20, 28, 5, 5)}
      ${dojiCandle(50, 54, 10, 10)}
      ${bullCandle(72, 22, 28, 5, 6)}
    `),
    detailSVG: detailSVG(`
      ${bearCandle(20, 34, 22, 4, 5)}
      ${bearCandle(44, 30, 24, 4, 5)}
      ${bearCandle(68, 26, 30, 5, 6)}
      ${dojiCandle(95, 62, 10, 10)}
      ${bullCandle(122, 28, 36, 5, 6, 14)}
      ${bullCandle(150, 18, 24, 4, 5)}
      ${bullCandle(174, 10, 22, 4, 5)}
      <text x="60" y="128" fill="${W}" font-size="9" font-family="monospace">1 (red)</text>
      <text x="86" y="128" fill="${W}" font-size="9" font-family="monospace">2 (doji)</text>
      <text x="112" y="128" fill="${W}" font-size="9" font-family="monospace">3 (green)</text>
    `),
    description: 'Three candles form a decisive bottom. Candle 1: large bearish red continuing the downtrend. Candle 2: small doji or spinning top — perfect indecision at the low. Candle 3: large bullish green closing back above the midpoint of Candle 1, confirming buyer control.',
    context: 'Most reliable on Daily and Weekly charts at significant support zones or after extended downtrends. The smaller Candle 2 is, the more compressed the battle.',
    rules: [
      'Candle 1: Large bearish red candle continuing the downtrend',
      'Candle 2: Small body (doji or spinning top) — indecision at the bottom',
      'Candle 3: Large bullish green closing above the midpoint of Candle 1',
      'The three candles must be clearly distinct — no overlapping Candle 2',
      'Volume ideally increases on Candle 3',
    ],
    confirmation: 'Enter at close of Candle 3. No additional confirmation needed.',
    stopLoss: 'Below the low of Candle 2 (the doji)',
    relatedIds: ['hammer', 'bullish-engulfing', 'evening-star'],
  },
  {
    id: 'pin-bar',
    name: 'Pin Bar',
    type: 'bull',
    shortDesc: 'Wick rejection at key level — works both directions',
    winRate: 67,
    rr: '1:2.3',
    timeframe: 'All TFs',
    candles: 1,
    previewSVG: previewSVG(`
      ${bullCandle(50, 62, 10, 4, 50, 14)}
    `),
    detailSVG: detailSVG(`
      <line x1="20" y1="28" x2="220" y2="28" stroke="rgba(255,77,106,0.35)" stroke-width="1" stroke-dasharray="4,3"/>
      <text x="225" y="31" fill="${R}" font-size="9" font-family="monospace">Resistance</text>
      ${bearCandle(36, 36, 20, 4, 5)}
      ${bearCandle(60, 30, 22, 4, 5)}
      <line x1="84" y1="10" x2="84" y2="18" stroke="${R}" stroke-width="2"/>
      <rect x="78" y="18" width="12" height="10" fill="${R}" stroke="${R}" stroke-width="1.5" rx="1"/>
      <line x1="84" y1="28" x2="84" y2="36" stroke="${R}" stroke-width="1.5"/>
      <text x="66" y="55" fill="${W}" font-size="8" font-family="monospace">Bear pin</text>
      <line x1="130" y1="110" x2="320" y2="110" stroke="rgba(0,214,143,0.35)" stroke-width="1" stroke-dasharray="4,3"/>
      <text x="220" y="108" fill="${G}" font-size="9" font-family="monospace">Support</text>
      <line x1="160" y1="72" x2="160" y2="78" stroke="${G}" stroke-width="1.5"/>
      <rect x="154" y="78" width="12" height="10" fill="none" stroke="${G}" stroke-width="1.5" rx="1"/>
      <line x1="160" y1="88" x2="160" y2="120" stroke="${G}" stroke-width="2.5"/>
      <text x="142" y="134" fill="${W}" font-size="8" font-family="monospace">Bull pin</text>
      ${bullCandle(192, 66, 20, 4, 5)}
      ${bullCandle(216, 54, 22, 4, 5)}
    `),
    description: 'A pin bar has a tiny body at one end and an extremely long wick at the other — showing decisive price rejection at a key level. Bullish pin bars (long lower wick) reject support. Bearish pin bars (long upper wick) reject resistance. The location is everything.',
    context: 'Works on all timeframes. The key S/R level validates the setup — a pin bar at a random level is meaningless. Higher timeframe pin bars carry more weight.',
    rules: [
      'Wick must be at least 2/3 of the total candle length',
      'Small body at the opposite end of the wick',
      'Must form at a key S/R level, Fibonacci, or moving average',
      'The longer and cleaner the wick, the stronger the rejection signal',
      'Works as bullish (lower wick rejects support) or bearish (upper wick rejects resistance)',
    ],
    confirmation: 'Enter at open of next candle (aggressive) or on break beyond the body (conservative).',
    stopLoss: 'Just beyond the tip of the rejection wick',
    relatedIds: ['hammer', 'shooting-star', 'bullish-engulfing'],
  },
  {
    id: 'three-white-soldiers',
    name: 'Three White Soldiers',
    type: 'bull',
    shortDesc: '3 consecutive strong green candles — sustained institutional buying',
    winRate: 72,
    rr: '1:2.6',
    timeframe: 'Daily/Weekly',
    candles: 3,
    previewSVG: previewSVG(`
      ${bullCandle(30, 54, 24, 4, 5)}
      ${bullCandle(52, 38, 24, 4, 5)}
      ${bullCandle(74, 20, 26, 4, 5)}
    `),
    detailSVG: detailSVG(`
      ${bearCandle(20, 34, 22, 4, 5)}
      ${bearCandle(44, 30, 24, 4, 5)}
      ${bullCandle(68, 52, 26, 4, 5)}
      ${bullCandle(94, 36, 26, 4, 5)}
      ${bullCandle(120, 20, 28, 4, 5)}
      ${bullCandle(150, 10, 24, 4, 5)}
      ${bullCandle(174, 6, 20, 4, 5)}
      <text x="56" y="128" fill="${W}" font-size="9" font-family="monospace">1st soldier  2nd  3rd → continuation</text>
    `),
    description: 'Three consecutive long bullish candles, each opening within the prior candle\'s body and closing near its own high — a perfect staircase of persistent buying. Shows organised, institutional accumulation with no significant retracement.',
    context: 'Most reliable after a period of consolidation or a reversal from support. Each candle should have small wicks — large upper wicks signal weakening conviction.',
    rules: [
      'Three consecutive green candles with substantial bodies',
      'Each candle opens within the prior candle\'s body (overlap)',
      'Each candle closes near its high — small upper wicks only',
      'Each candle\'s body is equal to or larger than the prior',
      'Volume should be increasing across the three candles',
    ],
    confirmation: 'Enter on close of the 3rd candle or on a brief pullback to the 2nd candle\'s midpoint.',
    stopLoss: 'Below the low of the first soldier candle',
    relatedIds: ['bullish-engulfing', 'morning-star', 'three-black-crows'],
  },

  // ────────────── BEARISH ──────────────
  {
    id: 'shooting-star',
    name: 'Shooting Star',
    type: 'bear',
    shortDesc: 'Long upper wick at resistance — sellers reject the highs',
    winRate: 65,
    rr: '1:2.1',
    timeframe: 'All TFs',
    candles: 1,
    previewSVG: previewSVG(`
      ${bearCandle(50, 60, 10, 52, 4, 14)}
    `),
    detailSVG: detailSVG(`
      ${bullCandle(20, 84, 22, 4, 5)}
      ${bullCandle(44, 72, 24, 4, 5)}
      ${bullCandle(68, 60, 22, 4, 5)}
      <line x1="84" y1="10" x2="84" y2="52" stroke="${R}" stroke-width="2.5"/>
      <rect x="78" y="52" width="12" height="12" fill="${R}" stroke="${R}" stroke-width="1.5" rx="1"/>
      <line x1="84" y1="64" x2="84" y2="70" stroke="${R}" stroke-width="1.5"/>
      <line x1="60" y1="10" x2="250" y2="10" stroke="rgba(255,77,106,0.3)" stroke-width="1" stroke-dasharray="4,3"/>
      <text x="255" y="13" fill="${R}" font-size="9" font-family="monospace">Resistance</text>
      <circle cx="84" cy="10" r="5" fill="none" stroke="${A}" stroke-width="1.5"/>
      ${bearCandle(112, 72, 24, 4, 5)}
      ${bearCandle(136, 80, 26, 4, 5)}
      <text x="50" y="128" fill="${W}" font-size="9" font-family="monospace">Uptrend → Shooting star → Reversal</text>
    `),
    description: 'The bearish mirror of the Hammer. A small body at the bottom of the range with a very long upper wick — sellers aggressively pushed price back down from intraday highs, wiping out all the gains buyers made during the session.',
    context: 'Must form at a key resistance zone, prior swing high, or Fibonacci level after a clear uptrend.',
    rules: [
      'Small body at the BOTTOM of the candle range',
      'Upper wick at least 2–3× the length of the body',
      'Little to no lower wick',
      'Appears after a clear uptrend of 3+ candles',
      'Next candle must close below the Shooting Star low — always confirm',
    ],
    confirmation: 'Wait for next candle to close bearish and below the Shooting Star low. Short on next open.',
    stopLoss: 'Above the high of the Shooting Star\'s upper wick',
    relatedIds: ['bearish-engulfing', 'evening-star', 'pin-bar'],
  },
  {
    id: 'bearish-engulfing',
    name: 'Bearish Engulfing',
    type: 'bear',
    shortDesc: 'Large red candle swallows prior green — sellers take control',
    winRate: 67,
    rr: '1:2.2',
    timeframe: 'Daily/Weekly',
    candles: 2,
    previewSVG: previewSVG(`
      ${bullCandle(36, 26, 24, 5, 6, 12)}
      ${bearCandle(62, 14, 50, 5, 6, 16)}
    `),
    detailSVG: detailSVG(`
      ${bullCandle(20, 86, 22, 4, 5)}
      ${bullCandle(44, 74, 24, 4, 5)}
      ${bullCandle(68, 60, 22, 4, 5)}
      ${bullCandle(92, 58, 24, 4, 5)}
      ${bearCandle(118, 46, 48, 5, 6, 18)}
      ${bearCandle(148, 66, 26, 4, 5)}
      ${bearCandle(172, 74, 24, 4, 5)}
      <line x1="60" y1="46" x2="250" y2="46" stroke="rgba(255,77,106,0.3)" stroke-width="1" stroke-dasharray="4,3"/>
      <text x="255" y="49" fill="${R}" font-size="9" font-family="monospace">Resistance</text>
      <text x="82" y="128" fill="${W}" font-size="9" font-family="monospace">Green  Engulfed →  Reversal down</text>
    `),
    description: 'A large red candle opens above the prior green candle\'s close and closes below its open — completely engulfing the green body. Sellers overwhelmed buyers in a single session, signalling a decisive shift from bulls to bears.',
    context: 'Must occur at a clear resistance level or prior swing high. Higher volume on the red candle strengthens the signal significantly.',
    rules: [
      'Red candle opens above prior green candle\'s close',
      'Red candle closes below prior green candle\'s open (full body engulf)',
      'Red body is larger than the green body',
      'Appears after an uptrend or at a key resistance zone',
      'Higher volume on the red candle = stronger signal',
    ],
    confirmation: 'Enter short at the close of the engulfing candle. Aggressive: enter at open of the next candle.',
    stopLoss: 'Above the high of the bearish engulfing candle',
    relatedIds: ['shooting-star', 'evening-star', 'three-black-crows'],
  },
  {
    id: 'evening-star',
    name: 'Evening Star',
    type: 'bear',
    shortDesc: '3-candle top: large green, doji, large red',
    winRate: 69,
    rr: '1:2.3',
    timeframe: 'Daily/Weekly',
    candles: 3,
    previewSVG: previewSVG(`
      ${bullCandle(28, 40, 28, 5, 5)}
      ${dojiCandle(50, 32, 10, 10)}
      ${bearCandle(72, 42, 28, 5, 6)}
    `),
    detailSVG: detailSVG(`
      ${bullCandle(20, 84, 22, 4, 5)}
      ${bullCandle(44, 72, 24, 4, 5)}
      ${bullCandle(68, 26, 34, 5, 6)}
      ${dojiCandle(95, 18, 8, 8)}
      ${bearCandle(122, 30, 36, 5, 6, 14)}
      ${bearCandle(150, 56, 26, 4, 5)}
      ${bearCandle(174, 68, 24, 4, 5)}
      <text x="60" y="128" fill="${W}" font-size="9" font-family="monospace">1 (green)</text>
      <text x="86" y="128" fill="${W}" font-size="9" font-family="monospace">2 (doji)</text>
      <text x="113" y="128" fill="${W}" font-size="9" font-family="monospace">3 (red)</text>
    `),
    description: 'The bearish counterpart to the Morning Star. Three candles form a decisive top. Candle 1: large bullish green. Candle 2: small doji/spinning top — indecision at the high. Candle 3: large bearish red closing back below the midpoint of Candle 1.',
    context: 'Most reliable at clear resistance zones, Fibonacci levels, or after extended uptrends. Watch for lower volume on Candle 2.',
    rules: [
      'Candle 1: Large bullish green candle continuing the uptrend',
      'Candle 2: Small body (doji or spinning top) — indecision at the top',
      'Candle 3: Large bearish red closing below the midpoint of Candle 1',
      'Candle 2 should ideally gap away from both Candle 1 and Candle 3',
      'Volume increases on Candle 3 for strongest confirmation',
    ],
    confirmation: 'Enter short at the close of Candle 3. Target the start of the prior uptrend.',
    stopLoss: 'Above the high of Candle 2 (the doji)',
    relatedIds: ['bearish-engulfing', 'shooting-star', 'morning-star'],
  },
  {
    id: 'three-black-crows',
    name: 'Three Black Crows',
    type: 'bear',
    shortDesc: '3 consecutive strong red candles — persistent institutional selling',
    winRate: 70,
    rr: '1:2.4',
    timeframe: 'Daily/Weekly',
    candles: 3,
    previewSVG: previewSVG(`
      ${bearCandle(30, 18, 24, 5, 5)}
      ${bearCandle(52, 32, 26, 5, 5)}
      ${bearCandle(74, 50, 26, 5, 5)}
    `),
    detailSVG: detailSVG(`
      ${bullCandle(20, 78, 20, 4, 5)}
      ${bullCandle(44, 68, 22, 4, 5)}
      ${bearCandle(68, 18, 28, 4, 5)}
      ${bearCandle(94, 36, 28, 4, 5)}
      ${bearCandle(120, 54, 28, 4, 5)}
      ${bearCandle(150, 70, 24, 4, 5)}
      ${bearCandle(174, 80, 22, 4, 5)}
      <text x="56" y="128" fill="${W}" font-size="9" font-family="monospace">1st crow   2nd   3rd → continuation ↓</text>
    `),
    description: 'Three consecutive long bearish candles, each opening within the prior candle\'s body and closing near its own low — a descending staircase of relentless selling. The bearish equivalent of Three White Soldiers, signalling organised institutional distribution.',
    context: 'Most powerful when forming at a significant resistance level or at the end of a long uptrend. Increasing volume across the three candles strengthens the signal.',
    rules: [
      'Three consecutive red candles with substantial bodies',
      'Each candle opens within the prior candle\'s body (overlap)',
      'Each candle closes near its low — small lower wicks only',
      'Each candle\'s body is equal to or larger than the prior',
      'Volume should be increasing across the three candles',
    ],
    confirmation: 'Enter short on close of the 3rd candle or on a pullback to the 2nd candle\'s midpoint.',
    stopLoss: 'Above the high of the first crow candle',
    relatedIds: ['bearish-engulfing', 'evening-star', 'three-white-soldiers'],
  },

  // ────────────── CONTINUATION ──────────────
  {
    id: 'doji',
    name: 'Doji',
    type: 'cont',
    shortDesc: 'Open = close — perfect standoff, direction from context',
    winRate: 60,
    rr: '1:1.8',
    timeframe: 'All TFs',
    candles: 1,
    previewSVG: previewSVG(`
      ${dojiCandle(50, 42, 32, 32)}
    `),
    detailSVG: detailSVG(`
      <text x="40" y="14" fill="${W}" font-size="9" font-family="monospace">At resistance (bearish context)</text>
      ${dojiCandle(80, 30, 18, 12)}
      <line x1="50" y1="12" x2="200" y2="12" stroke="rgba(255,77,106,0.35)" stroke-width="1" stroke-dasharray="4,3"/>
      <text x="58" y="78" fill="${W}" font-size="9" font-family="monospace">At support (bullish context)</text>
      ${dojiCandle(210, 95, 12, 18)}
      <line x1="170" y1="113" x2="320" y2="113" stroke="rgba(0,214,143,0.35)" stroke-width="1" stroke-dasharray="4,3"/>
      <text x="50" y="128" fill="${A}" font-size="9" font-family="monospace">Context is everything. Next candle confirms direction.</text>
    `),
    description: 'A Doji forms when the open and close are virtually equal, creating a cross or plus-sign shape. This represents a perfect standoff between buyers and sellers — neither side won the session. Context determines the likely direction: at support it leans bullish, at resistance it leans bearish.',
    context: 'Context is everything with a Doji. A Doji alone is never tradeable. Always require the NEXT candle to confirm the direction before entry.',
    rules: [
      'Open and close are virtually equal — tiny or no body',
      'Upper and lower wicks can be any length',
      'By itself it is completely neutral — direction depends entirely on location',
      'At support = potentially bullish — wait for next candle to break above',
      'At resistance = potentially bearish — wait for next candle to break below',
    ],
    confirmation: 'NEVER trade a Doji alone. Enter only after the next candle confirms the direction.',
    stopLoss: 'Beyond the opposite extreme of the Doji\'s wick from the direction of your trade',
    relatedIds: ['morning-star', 'evening-star', 'inside-bar'],
  },
  {
    id: 'inside-bar',
    name: 'Inside Bar',
    type: 'cont',
    shortDesc: 'Small candle within prior candle — energy coiling for breakout',
    winRate: 64,
    rr: '1:2.0',
    timeframe: 'Daily/Weekly',
    candles: 2,
    previewSVG: previewSVG(`
      <line x1="34" y1="12" x2="34" y2="20" stroke="${W}" stroke-width="1.5" opacity="0.5"/>
      <rect x="28" y="20" width="12" height="50" fill="rgba(138,155,181,0.2)" stroke="${W}" stroke-width="1.5" rx="1" opacity="0.6"/>
      <line x1="34" y1="70" x2="34" y2="78" stroke="${W}" stroke-width="1.5" opacity="0.5"/>
      ${bullCandle(62, 30, 24, 5, 6, 12)}
    `),
    detailSVG: detailSVG(`
      ${bullCandle(20, 78, 20, 4, 5)}
      ${bullCandle(44, 66, 22, 4, 5)}
      <line x1="68" y1="14" x2="68" y2="22" stroke="${G}" stroke-width="2"/>
      <rect x="62" y="22" width="14" height="50" fill="none" stroke="${G}" stroke-width="2" rx="1"/>
      <line x1="68" y1="72" x2="68" y2="80" stroke="${G}" stroke-width="2"/>
      <line x1="95" y1="30" x2="95" y2="36" stroke="${W}" stroke-width="1.5"/>
      <rect x="89" y="36" width="12" height="24" fill="rgba(138,155,181,0.12)" stroke="${W}" stroke-width="1.5" rx="1"/>
      <line x1="95" y1="60" x2="95" y2="66" stroke="${W}" stroke-width="1.5"/>
      <line x1="50" y1="22" x2="240" y2="22" stroke="rgba(0,214,143,0.4)" stroke-width="1" stroke-dasharray="4,3"/>
      <line x1="50" y1="80" x2="240" y2="80" stroke="rgba(255,77,106,0.4)" stroke-width="1" stroke-dasharray="4,3"/>
      <text x="245" y="25" fill="${G}" font-size="8" font-family="monospace">Buy above</text>
      <text x="245" y="83" fill="${R}" font-size="8" font-family="monospace">Sell below</text>
      ${bullCandle(130, 8, 24, 4, 5)}
      ${bullCandle(154, 2, 20, 4, 5)}
      <text x="40" y="128" fill="${W}" font-size="9" font-family="monospace">Mother candle  Inside bar  Breakout</text>
    `),
    description: 'An Inside Bar\'s high and low are completely contained within the prior candle\'s (mother candle\'s) range — the market is compressing energy. The breakout from the mother candle\'s range signals the next directional move. Trade in the direction of the prevailing trend.',
    context: 'Most reliable when the mother candle is a strong trend candle. The smaller the inside bar relative to the mother, the more compressed the energy — and the more explosive the breakout.',
    rules: [
      'Inside bar\'s high is LOWER than the mother candle\'s high',
      'Inside bar\'s low is HIGHER than the mother candle\'s low',
      'Mother candle should be a strong trend candle for context',
      'Place buy stop above mother candle\'s high (bullish) OR sell stop below low (bearish)',
      'Trade in the direction of the prevailing trend for highest probability',
    ],
    confirmation: 'Breakout of the mother candle\'s high (bullish) or low (bearish) is the entry trigger.',
    stopLoss: 'At the opposite end of the mother candle from your direction',
    relatedIds: ['doji', 'pin-bar', 'hammer'],
  },
];

export default patterns;

export function getPatternById(id) {
  return patterns.find(p => p.id === id) || null;
}

export function filterPatterns(type) {
  if (!type || type === 'all') return patterns;
  return patterns.filter(p => p.type === type);
}
