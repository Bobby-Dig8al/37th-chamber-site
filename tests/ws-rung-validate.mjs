// ws-rung-validate.mjs — engine-level validator for the Washington Square chamber.
//
// Extracts the `Ladder 0 · The Board` rungs array from the chamber HTML, then for
// each rung asks the live chess.js engine whether the authored content is honest:
//
//   click rungs   — builds the FEN from `setup`, asks chess.js for legal moves
//                   of the demonstrated white piece, asserts targets[] matches
//                   exactly (no missing legal squares, no impossible ones).
//   wsb0          — kings-only setup; just asserts targets are valid algebraic.
//   move rungs    — builds the FEN, attempts the solution move, asserts legal.
//   `goal:'mate'` — additionally asserts isCheckmate() after the move.
//   `belt:true`   — additionally asserts the pre-move position IS in check and
//                   that the solution removes it; surfaces (informational) when
//                   "exactly one legal move" doesn't hold.
//
// Run from repo root:
//     node tests/ws-rung-validate.mjs
//
// Exit code: 0 = all pass · 1 = any rung failed.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import vm from 'node:vm';
import { Chess } from 'chess.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const CHAMBER_HTML = resolve(REPO_ROOT, 'chambers/washington-square/index.html');

const html = readFileSync(CHAMBER_HTML, 'utf8');

// Match the Ladder 0 block and capture its rungs array literal.
// The block opens with `{ name: 'Ladder 0 · The Board', rungs: [` and the array
// closes with `] }` before the next form (`{ name: 'Ladder I ...`). The lazy
// match against the next `\n   ] }` keeps us inside the first form only.
const ladder0Match = html.match(/\{\s*name:\s*'Ladder 0 · The Board',\s*rungs:\s*(\[[\s\S]*?\n\s*\])\s*\}/);
if (!ladder0Match) {
  console.error('FAIL: Could not locate Ladder 0 rungs array in ' + CHAMBER_HTML);
  process.exit(1);
}

let rungs;
try {
  // Trusted in-repo source — eval the JS literal in an isolated VM context.
  // Wrap in parens to disambiguate object/block syntax.
  rungs = vm.runInNewContext('(' + ladder0Match[1] + ')', {}, { timeout: 1000 });
} catch (err) {
  console.error('FAIL: Could not parse Ladder 0 rungs as JS literal: ' + err.message);
  process.exit(1);
}

console.log('Ladder 0: extracted ' + rungs.length + ' rung(s) from ' + CHAMBER_HTML.replace(REPO_ROOT, '<repo>'));
console.log('');

// ─── helpers ────────────────────────────────────────────────────────────────

const FILES = ['a','b','c','d','e','f','g','h'];

// {a1:'K', h8:'k', d4:'R'} → "7k/8/8/8/8/3R4/8/K7 w - - 0 1"
function setupToFen(setup, turn = 'w') {
  let fen = '';
  for (let rank = 8; rank >= 1; rank--) {
    let empty = 0;
    for (let f = 0; f < 8; f++) {
      const sq = FILES[f] + rank;
      const piece = setup[sq];
      if (piece) {
        if (empty > 0) { fen += String(empty); empty = 0; }
        fen += piece;
      } else {
        empty++;
      }
    }
    if (empty > 0) fen += String(empty);
    if (rank > 1) fen += '/';
  }
  return fen + ' ' + turn + ' - - 0 1';
}

// Pick the demonstrated WHITE piece in a click rung's setup — heuristic:
// the highest-value non-king white piece. Returns null if only kings present.
function findDemonstratedPieceSquare(setup) {
  for (const pieceChar of ['Q','R','B','N','P']) {
    for (const sq of Object.keys(setup)) {
      if (setup[sq] === pieceChar) return sq;
    }
  }
  return null;
}

function arrayDiff(a, b) {
  const bSet = new Set(b);
  return a.filter(x => !bSet.has(x));
}

// ─── validation loop ────────────────────────────────────────────────────────

let passes = 0;
let failures = 0;
let warnings = 0;

for (const rung of rungs) {
  const label = rung.id + ' "' + rung.name + '"';

  if (rung.type === 'click') {
    const demoSq = findDemonstratedPieceSquare(rung.setup);
    if (!demoSq) {
      // wsb0 — "Name the square" — kings-only setup; verify algebraic-string sanity.
      const bad = (rung.targets || []).filter(t => !/^[a-h][1-8]$/.test(t));
      if (bad.length) {
        console.log('  FAIL ' + label + ' — invalid algebraic in targets: ' + bad.join(', '));
        failures++;
      } else {
        console.log('  PASS ' + label + ' — ' + rung.targets.length + ' target(s) are valid algebraic squares');
        passes++;
      }
      continue;
    }
    const fen = setupToFen(rung.setup, 'w');
    let chess;
    try { chess = new Chess(fen); }
    catch (err) {
      console.log('  FAIL ' + label + ' — chess.js rejected FEN "' + fen + '": ' + err.message);
      failures++;
      continue;
    }
    const moves = chess.moves({ square: demoSq, verbose: true });
    const engineTargets = [...new Set(moves.map(m => m.to))].sort();
    const declaredTargets = [...rung.targets].sort();
    const missing = arrayDiff(engineTargets, declaredTargets);
    const extra = arrayDiff(declaredTargets, engineTargets);
    if (missing.length === 0 && extra.length === 0) {
      console.log('  PASS ' + label + ' — targets[] equals chess.js legal moves from ' + demoSq
        + ' (' + engineTargets.length + ' squares)');
      passes++;
    } else {
      console.log('  FAIL ' + label + ' — targets[] does NOT match chess.js legal moves from ' + demoSq);
      if (missing.length) console.log('    engine sees but targets[] omits: ' + missing.join(', '));
      if (extra.length)   console.log('    targets[] claims but engine rejects: ' + extra.join(', '));
      failures++;
    }
    continue;
  }

  if (rung.type === 'move') {
    const fen = setupToFen(rung.setup, 'w');
    let preChess;
    try { preChess = new Chess(fen); }
    catch (err) {
      console.log('  FAIL ' + label + ' — chess.js rejected FEN "' + fen + '": ' + err.message);
      failures++;
      continue;
    }
    if (!rung.solution || !rung.solution.from || !rung.solution.to) {
      console.log('  FAIL ' + label + ' — move rung has no solution {from, to}');
      failures++;
      continue;
    }
    // Work on a separate Chess so preChess remains untouched for belt checks.
    const chess = new Chess(fen);
    let moveResult;
    try {
      moveResult = chess.move({ from: rung.solution.from, to: rung.solution.to, promotion: 'q' });
    } catch (_) {
      moveResult = null;
    }
    if (!moveResult) {
      console.log('  FAIL ' + label + ' — solution ' + rung.solution.from + '→' + rung.solution.to
        + ' is ILLEGAL in this setup');
      failures++;
      continue;
    }

    if (rung.goal === 'mate') {
      if (chess.isCheckmate()) {
        console.log('  PASS ' + label + ' — ' + moveResult.san + ' is legal AND delivers checkmate (goal:"mate")');
        passes++;
      } else {
        console.log('  FAIL ' + label + ' — ' + moveResult.san + ' is legal but does NOT deliver checkmate'
          + ' (goal:"mate" failed)');
        failures++;
      }
      continue;
    }

    if (rung.belt) {
      // Belt: pre-move position must be IN CHECK; post-move must NOT be in check.
      if (!preChess.isCheck()) {
        console.log('  FAIL ' + label + ' — belt rung claims a check-escape but setup position is not in check');
        failures++;
        continue;
      }
      if (chess.isCheck()) {
        console.log('  FAIL ' + label + ' — ' + moveResult.san + ' leaves white still in check');
        failures++;
        continue;
      }
      const preMoves = preChess.moves({ verbose: true });
      if (preMoves.length === 1) {
        console.log('  PASS ' + label + ' — ' + moveResult.san
          + ' is the EXACTLY ONE legal response to the check (belt invariant holds)');
      } else {
        console.log('  WARN ' + label + ' — ' + moveResult.san
          + ' is legal + escapes check, but ' + preMoves.length + ' total legal moves exist'
          + ' (spec claimed exactly one)');
        warnings++;
      }
      passes++;
      continue;
    }

    console.log('  PASS ' + label + ' — solution ' + moveResult.san + ' is legal');
    passes++;
    continue;
  }

  console.log('  SKIP ' + label + ' — unknown rung type: ' + rung.type);
}

console.log('');
console.log('Summary: ' + passes + ' passed · ' + failures + ' failed · ' + warnings + ' warning(s) · ' + rungs.length + ' total');
process.exit(failures > 0 ? 1 : 0);
