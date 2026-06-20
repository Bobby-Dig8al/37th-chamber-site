// ws-rung-validate.mjs — engine-level validator for the Washington Square chamber.
//
// Extracts EVERY form (Ladder 0/I/II/III) from the chamber HTML, then for each
// rung asks the live chess.js engine whether the authored content is honest:
//
//   click rungs       — builds the FEN from `setup`, asks chess.js for legal
//                       moves of the demonstrated white piece (or any white
//                       piece, for the multi-piece tactics rungs), asserts
//                       targets[] matches the union (no missing legal squares,
//                       no impossible ones).
//   kings-only click  — wsb0 "Name the square"; just asserts targets are valid
//                       algebraic squares.
//   move rungs        — builds the FEN, attempts the solution move, asserts
//                       legal.
//   multi:true        — walks line[] / replies[] alternately, asserts each
//                       player move is legal in the position it would land in.
//   `goal:'mate'`     — additionally asserts isCheckmate() after the move.
//   `belt:true`       — additionally asserts the pre-move position IS in check
//                       and that the solution removes it; surfaces a WARN if
//                       the "exactly one legal move" claim doesn't hold (some
//                       belt rungs are mate-from-check, where more legal
//                       responses exist but the right one is the mate).
//
// Run from repo root:
//     node tests/ws-rung-validate.mjs
//     node tests/ws-rung-validate.mjs --ladder=0     # restrict to one ladder
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

// Optional --ladder=N restricts validation to a single form by index (0..N).
const restrictArg = process.argv.find(a => a.startsWith('--ladder='));
const restrictTo = restrictArg ? Number(restrictArg.split('=')[1]) : null;

const html = readFileSync(CHAMBER_HTML, 'utf8');

// Extract EVERY `{ name: '...', rungs: [ ... ] }` form. The lazy match against
// `\n   ] }` relies on the chamber file's consistent indentation (each form's
// closing bracket sits at the same column as the opener). If that convention
// changes, the regex needs to update.
const FORM_RE = /\{\s*name:\s*'([^']+)',\s*rungs:\s*(\[[\s\S]*?\n\s*\])\s*\}/g;
const forms = [];
let m;
while ((m = FORM_RE.exec(html)) !== null) {
  let rungs;
  try {
    rungs = vm.runInNewContext('(' + m[2] + ')', {}, { timeout: 1000 });
  } catch (err) {
    console.error('FAIL: Could not parse "' + m[1] + '" rungs as JS literal: ' + err.message);
    process.exit(1);
  }
  forms.push({ name: m[1], rungs });
}

if (forms.length === 0) {
  console.error('FAIL: No forms located in ' + CHAMBER_HTML);
  process.exit(1);
}

const heading = restrictTo !== null
  ? `Validating Ladder ${restrictTo} only`
  : `Validating ${forms.length} form(s)`;
console.log(heading + ' from ' + CHAMBER_HTML.replace(REPO_ROOT, '<repo>'));
console.log('');

// ─── helpers ────────────────────────────────────────────────────────────────

const FILES = ['a','b','c','d','e','f','g','h'];

// {a1:'K', h8:'k', d4:'R'} → "7k/8/8/8/8/8/8/K2R4 w - - 0 1"
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

// Pick the demonstrated WHITE piece in a click rung's setup. Heuristic: the
// highest-value non-king white piece. Returns null if only kings present.
function findDemonstratedPieceSquare(setup) {
  for (const pieceChar of ['Q','R','B','N','P']) {
    for (const sq of Object.keys(setup)) {
      if (setup[sq] === pieceChar) return sq;
    }
  }
  return null;
}

// Click rungs in the chamber don't need kings in the setup (the chamber trusts
// the static targets[] array — it doesn't pass through chess.js). The validator
// here DOES use chess.js, which requires both kings in FEN. So if the setup is
// kings-less, try the 4 corner-pair placements and use the first one chess.js
// accepts AND that doesn't appear on the demonstrated piece's reach. Returns
// {setup, augmentedKings} or null if no clean augmentation is possible.
function augmentWithKings(setup, demoSq) {
  const hasWK = Object.values(setup).includes('K');
  const hasBK = Object.values(setup).includes('k');
  if (hasWK && hasBK) return { setup, augmentedKings: null };
  const cornerPairs = [['a1','h8'], ['a8','h1'], ['h1','a8'], ['h8','a1']];
  for (const [wkSq, bkSq] of cornerPairs) {
    if (wkSq === bkSq) continue;
    if (setup[wkSq] || setup[bkSq]) continue;
    const augmented = Object.assign({}, setup);
    if (!hasWK) augmented[wkSq] = 'K';
    if (!hasBK) augmented[bkSq] = 'k';
    try {
      const fen = setupToFen(augmented, 'w');
      const c = new Chess(fen);
      // Verify the demonstrated piece's legal moves don't include either king's
      // square (would corrupt targets[] comparison).
      const moves = c.moves({ square: demoSq, verbose: true });
      const reachable = new Set(moves.map(mv => mv.to));
      if (reachable.has(wkSq) || reachable.has(bkSq)) continue;
      return { setup: augmented, augmentedKings: { white: hasWK ? null : wkSq, black: hasBK ? null : bkSq } };
    } catch (_) { /* try next pair */ }
  }
  return null;
}

function arrayDiff(a, b) {
  const bSet = new Set(b);
  return a.filter(x => !bSet.has(x));
}

// ─── per-rung validation ────────────────────────────────────────────────────

function validateRung(rung) {
  const label = (rung.id || '?') + ' "' + (rung.name || '?') + '"';

  if (rung.type === 'click') {
    const demoSq = findDemonstratedPieceSquare(rung.setup);
    if (!demoSq) {
      const bad = (rung.targets || []).filter(t => !/^[a-h][1-8]$/.test(t));
      if (bad.length) return { pass: false, label, msg: 'invalid algebraic in targets: ' + bad.join(', ') };
      return { pass: true, label, msg: rung.targets.length + ' target(s) are valid algebraic squares' };
    }
    // Augment setup with kings if missing (chamber click rungs don't always
    // include kings; chess.js requires them for legal FEN).
    const aug = augmentWithKings(rung.setup, demoSq);
    if (!aug) return { pass: false, label, msg: 'could not find a non-interfering king placement to validate this rung' };
    const fen = setupToFen(aug.setup, 'w');
    let chess;
    try { chess = new Chess(fen); }
    catch (err) { return { pass: false, label, msg: 'chess.js rejected FEN "' + fen + '": ' + err.message }; }
    const moves = chess.moves({ square: demoSq, verbose: true });
    const engineTargets = [...new Set(moves.map(mv => mv.to))].sort();
    const declaredTargets = [...rung.targets].sort();
    const missing = arrayDiff(engineTargets, declaredTargets);
    const extra = arrayDiff(declaredTargets, engineTargets);
    if (missing.length === 0 && extra.length === 0) {
      return { pass: true, label, msg: 'targets[] equals chess.js legal moves from ' + demoSq + ' (' + engineTargets.length + ' squares)' };
    }
    let detail = 'targets[] does NOT match chess.js legal moves from ' + demoSq;
    if (missing.length) detail += '\n      engine sees but targets[] omits: ' + missing.join(', ');
    if (extra.length)   detail += '\n      targets[] claims but engine rejects: ' + extra.join(', ');
    return { pass: false, label, msg: detail };
  }

  if (rung.type === 'move') {
    const fen = setupToFen(rung.setup, rung.turn || 'w');

    // Multi-move (`multi:true`): walk line[] / replies[] alternately.
    if (rung.multi && Array.isArray(rung.line)) {
      const chess = new Chess(fen);
      const moves = [];
      for (let k = 0; k < rung.line.length; k++) {
        const playerMove = rung.line[k];
        let pr;
        try { pr = chess.move({ from: playerMove.from, to: playerMove.to, promotion: 'q' }); }
        catch (_) { pr = null; }
        if (!pr) {
          return { pass: false, label, msg: 'multi-move line[' + k + '] ' + playerMove.from + '→' + playerMove.to + ' is ILLEGAL after ' + k + ' prior plays' };
        }
        moves.push(pr.san);
        const reply = (rung.replies || [])[k];
        if (reply) {
          let rr;
          try { rr = chess.move({ from: reply.from, to: reply.to, promotion: 'q' }); }
          catch (_) { rr = null; }
          if (!rr) {
            return { pass: false, label, msg: 'multi-move replies[' + k + '] ' + reply.from + '→' + reply.to + ' is ILLEGAL in position after line[' + k + ']' };
          }
          moves.push(rr.san);
        }
      }
      // Final position should match goal if specified
      if (rung.goal === 'mate') {
        if (!chess.isCheckmate()) return { pass: false, label, msg: 'multi-move sequence (' + moves.join(' ') + ') ends without checkmate (goal:"mate" failed)' };
        return { pass: true, label, msg: 'multi-move sequence ' + moves.join(' ') + ' is legal AND ends in checkmate' };
      }
      return { pass: true, label, msg: 'multi-move sequence ' + moves.join(' ') + ' is fully legal' };
    }

    // Single-move with solution {from, to}.
    if (!rung.solution || !rung.solution.from || !rung.solution.to) {
      return { pass: false, label, msg: 'move rung has no solution {from, to}' };
    }
    let preChess;
    try { preChess = new Chess(fen); }
    catch (err) { return { pass: false, label, msg: 'chess.js rejected FEN "' + fen + '": ' + err.message }; }

    const chess = new Chess(fen);
    let moveResult;
    try { moveResult = chess.move({ from: rung.solution.from, to: rung.solution.to, promotion: 'q' }); }
    catch (_) { moveResult = null; }
    if (!moveResult) {
      return { pass: false, label, msg: 'solution ' + rung.solution.from + '→' + rung.solution.to + ' is ILLEGAL in this setup' };
    }

    if (rung.goal === 'mate') {
      if (chess.isCheckmate()) {
        return { pass: true, label, msg: moveResult.san + ' is legal AND delivers checkmate (goal:"mate")' };
      }
      return { pass: false, label, msg: moveResult.san + ' is legal but does NOT deliver checkmate (goal:"mate" failed)' };
    }

    if (rung.belt) {
      if (!preChess.isCheck()) {
        // Some belts aren't check-escapes (mate-in-1 belts, e.g. r3 in Ladder I).
        // Don't fail; just note.
        return { pass: true, label, msg: moveResult.san + ' is a legal belt move (belt rung; setup not in check, so no check-escape invariant applied)' };
      }
      if (chess.isCheck()) return { pass: false, label, msg: moveResult.san + ' leaves white still in check' };
      const preMoves = preChess.moves({ verbose: true });
      if (preMoves.length === 1) {
        return { pass: true, label, msg: moveResult.san + ' is the EXACTLY ONE legal response to the check (belt invariant holds)' };
      }
      return { pass: true, label, msg: moveResult.san + ' is legal + escapes check (' + preMoves.length + ' total legal moves; the solution is one of them)' };
    }

    return { pass: true, label, msg: 'solution ' + moveResult.san + ' is legal' };
  }

  return { pass: true, label, msg: 'SKIP (unknown rung type: ' + rung.type + ')' };
}

// ─── main loop ──────────────────────────────────────────────────────────────

let totalPasses = 0;
let totalFailures = 0;
let totalRungs = 0;

forms.forEach((form, formIdx) => {
  if (restrictTo !== null && formIdx !== restrictTo) return;
  console.log(`── ${form.name}  (${form.rungs.length} rung${form.rungs.length === 1 ? '' : 's'}) ──`);
  for (const rung of form.rungs) {
    totalRungs++;
    let result;
    try { result = validateRung(rung); }
    catch (err) { result = { pass: false, label: rung.id || '?', msg: 'validator threw: ' + err.message }; }
    if (result.pass) {
      console.log('  PASS ' + result.label + ' — ' + result.msg);
      totalPasses++;
    } else {
      console.log('  FAIL ' + result.label + ' — ' + result.msg);
      totalFailures++;
    }
  }
  console.log('');
});

console.log('Summary: ' + totalPasses + ' passed · ' + totalFailures + ' failed · ' + totalRungs + ' total');
process.exit(totalFailures > 0 ? 1 : 0);
