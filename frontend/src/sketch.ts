import { formatMultiplier } from "./convert";
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
 * How long the release actually takes, drawn to scale. `release` is the time to fall
 * from full scale, and the box's y = 1 is full scale, so a note leaving from the
 * sustain level covers that fraction of the drop in that fraction of the time --
 * same slope, shorter segment.
 */
const releaseSpan = (e: SketchEnvelope): number => e.release * e.sustain;

/**
 * The top of the drawn box, in peaks. Sustain is a multiplier, so above 1 the highest
 * point of the envelope is the sustain plateau rather than the attack's peak, and the
 * whole curve is scaled down to fit. At or below 1 this is 1 and nothing moves.
 */
const topOf = (e: SketchEnvelope): number => Math.max(1, e.sustain);

/** Where the sustain plateau sits in the unit box, after {@link topOf} has scaled it. */
export const sustainY = (e: SketchEnvelope): number => e.sustain / topOf(e);

/**
 * The envelope as a polyline in a unit box: x runs 0..1 over time, y runs 0 (silence)
 * to 1 (the envelope's highest point, which a sustain above 1 moves to the plateau).
 * The sustain plateau has no duration of its own, so it is drawn as
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
  const fall = releaseSpan(e);
  const timed = e.attack + e.decay + fall;
  const holdLen = timed > 0 ? (timed * hold) / (1 - hold) : 1;
  const total = timed + holdLen;
  const peak = 1 / topOf(e);
  const sustain = sustainY(e);
  let t = 0;
  const pts: SketchPoint[] = [{ x: 0, y: 0 }];
  t += e.attack;
  pts.push({ x: t / total, y: peak });
  t += e.decay;
  pts.push({ x: t / total, y: sustain });
  t += holdLen;
  pts.push({ x: t / total, y: sustain });
  t += fall;
  pts.push({ x: t / total, y: 0 });
  return pts;
}

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
  out.push({ text: `S ${formatMultiplier(e.sustain)}`, x: mid(2) });
  if (releaseSpan(e) > 0) out.push({ text: `R ${formatDuration(e.release)}`, x: mid(3) });
  return out;
}
