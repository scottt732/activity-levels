import { formatDuration } from "./duration";

/** The envelope shape a sketch draws, after inheritance has been resolved. */
export interface SketchEnvelope {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  impulse: boolean;
}

export interface SketchPoint {
  x: number;
  y: number;
}

/** A caption for one segment, placed at the segment's midpoint on the x axis. */
export interface SketchLabel {
  text: string;
  x: number;
}

/**
 * The envelope as a polyline in a unit box: x runs 0..1 over time, y runs 0 (silence)
 * to 1 (peak). The sustain plateau has no duration of its own, so it is drawn as
 * `hold` of the total width; when every real duration is zero the whole box is the
 * plateau, which reads as a note that snaps on and stays on.
 */
export function envelopePoints(e: SketchEnvelope, hold = 0.25): SketchPoint[] {
  if (e.impulse) {
    return [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 0 },
    ];
  }
  const timed = e.attack + e.decay + e.release;
  const holdLen = timed > 0 ? (timed * hold) / (1 - hold) : 1;
  const total = timed + holdLen;
  let t = 0;
  const pts: SketchPoint[] = [{ x: 0, y: 0 }];
  t += e.attack;
  pts.push({ x: t / total, y: 1 });
  t += e.decay;
  pts.push({ x: t / total, y: e.sustain });
  t += holdLen;
  pts.push({ x: t / total, y: e.sustain });
  t += e.release;
  pts.push({ x: t / total, y: 0 });
  return pts;
}

const round2 = (n: number): number => Math.round(n * 100) / 100;

/** Captions under the sketch. Zero-length segments get none: there is nothing to point at. */
export function envelopeLabels(e: SketchEnvelope, hold = 0.25): SketchLabel[] {
  const pts = envelopePoints(e, hold);
  const mid = (i: number): number => ((pts[i]?.x ?? 0) + (pts[i + 1]?.x ?? 0)) / 2;
  if (e.impulse) {
    const out: SketchLabel[] = [{ text: "impulse", x: 0 }];
    if (e.release > 0) out.push({ text: `R ${formatDuration(e.release)}`, x: mid(1) });
    return out;
  }
  const out: SketchLabel[] = [];
  if (e.attack > 0) out.push({ text: `A ${formatDuration(e.attack)}`, x: mid(0) });
  if (e.decay > 0) out.push({ text: `D ${formatDuration(e.decay)}`, x: mid(1) });
  out.push({ text: `S ${round2(e.sustain)}`, x: mid(2) });
  if (e.release > 0) out.push({ text: `R ${formatDuration(e.release)}`, x: mid(3) });
  return out;
}
