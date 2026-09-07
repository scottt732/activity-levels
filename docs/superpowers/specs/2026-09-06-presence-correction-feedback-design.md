# Presence corrections that yield to new evidence

## Goal

A person can correct their room, a device's room, or whether they carry a device.
The correction takes effect at once. Later evidence can weaken it, but repeated
Bluetooth readings must not immediately undo it. The panel explains what happened
and links to the Home Assistant entities, devices, and areas that supply the evidence.

The motivating case is Scott sitting in Den while his unworn watch remains in Office.
A person correction must not snap back to Office on the next Bluetooth update. If
the watch later moves through the house, the estimator must reconsider whether it
is carried without requiring Scott to clear the correction manually.

## What the code does today

- `PersonEstimator.locate` concentrates the room belief once. The next `update`
  applies the ordinary transition and emission model again. There is no correction hold.
- Room transitions use the configured graph, with a small escape probability. They
  do not require a sequence of motion events.
- The coordinator supplies activity, steps, charging, and distance variation. Its
  current frames do not distinguish new evidence from evidence read again.
- Person corrections save scanner frames and inferred carrying probabilities.
  The signature learner excludes devices below its carrying threshold.
- Device chips do not accept corrections. Scanner payloads already contain HA device
  and area IDs, but the table does not link to them.

## User controls

Selecting a person opens room correction controls. Selecting a device opens its own
controls: **Device room**, **Carrying**, **Not carrying**, and **Use automatic estimate**.
Person and device corrections are separate. Placing a watch in Office does not place
its owner there. Saying the watch is not carried does not claim to know its room.

The person correction controls also show the current carrying choices, so the user
can submit “Den, watch not carried” together. Apply all parts before saving a training
label. Do not train from the old inferred carrying state when the same submission
corrects it.

Show correction status beside the estimate, including its time and a short reason:

- “Den — confirmed by you”
- “Not carrying — confirmed by you”
- “Possible pickup — movement detected”
- “Automatic — correction released after movement”

Keep **Use automatic estimate** available while a correction applies. Report API
failures next to the control; show success only after the server accepts the change.

## Carrying corrections

A correction starts strong. It constrains the joint filter's carrying belief rather
than changing only the displayed percentage. A confirmed parked device contributes
no location evidence about its owner while the correction has full strength. This
also disables the normal assumption that a parked device may be near its owner.

Time alone does not weaken a carrying correction. Fresh evidence must contradict it.
Track the correction time, the last confirmed device room, recent evidence, and a
strength between zero and one. At strength zero, remove the constraint and let the
ordinary joint model decide; do not force the opposite carrying state.

For **Not carrying**, evidence can weaken the correction when:

- The device has sustained movement evidence from available companion sensors, such
  as new steps or a fresh moving activity report.
- Its distance pattern changes and its room estimate follows a possible directed
  route in the configured house graph.

Use a bounded evidence window. Initial defaults are a 120-second window, at least
30 seconds of sustained support, and three distinct fresh observations. A single
room jump, distance jitter alone, or one old activity value is insufficient. Repeated
reads of the same source sample do not advance support. Count elapsed support time,
not the number of unrelated coordinator callbacks. Source loss or a long observation
gap cannot stand in for movement.

A sustained adjacent-room change can support pickup. A jump across several rooms
needs intermediate device observations or fresh activity along a directed route.
The mere existence of a path is not evidence that the device followed it. Respect
one-way edges. Do not infer the user's actual room graph from the screenshot.

Once support qualifies, reduce the correction strength over a further 60 seconds
of supported movement. Stop the reduction when support disappears. An isolated
excursion that returns to the parked room before qualifying leaves the correction
at full strength. Continued movement can release it without user action.

Charging contradicts pickup and must be considered with movement, rather than
allowing room jitter to win by itself. Missing companion sensors remain unknown.
Bluetooth route evidence must still work for a watch with no companion tracker.

For **Carrying**, use the same evidence-based release policy in the opposite
direction. Charging or a stationary device left behind while other reliable evidence
places the owner elsewhere supports release. Stationary readings alone do not:
the owner may be sitting still while wearing the watch.

Device movement does not prove that its owner carries it. As a correction fades,
the normal joint model weighs whether the device agrees with the person's other
evidence. Do not use movement of that same discounted device both to relocate the
person and to claim independent agreement with the person.

## Person and device room corrections

A person-room correction gets a visible 15-minute protection period with manual
release. During this period, unchanged or conflicting Bluetooth readings alone
cannot move the person. Fresh route evidence and an independently credible carried
device can release protection sooner. Activity from another occupant alone cannot.

After 15 minutes, fade the protection over two minutes, then use the automatic
estimate. Show that the correction is expiring. Keep the original correction as a
training label. This bounds stale room assertions without undoing a correction on
the next frame.

A device-room correction anchors the device estimate and records its scanner frame.
Give it the same bounded room protection, but use that device's fresh movement
evidence for early release. It does not require owner movement. Observe raw evidence
separately from the protected estimate so the protection cannot hide real movement.

Missing motion along a route reduces support for early release. It does not make
movement impossible. Sensor gaps must not create permanent room locks. Unknown or
unavailable tracker states are not, by themselves, evidence that the person left.

## Training and persistence

Store three explicit label types: person room, device room, and carrying state.
Each label includes a stable ID, timestamp, source, target, and the evidence available
at that instant. Accept existing stored person labels without migration loss.

- Person labels train room signatures only from devices believed or explicitly
  confirmed carried at that moment. An active not-carried correction excludes the device.
- Device-room labels train the room signature from that device directly, including
  parked devices. They do not claim that the person occupied that room.
- Carrying labels record the available signals and corrected state separately.
  They do not create room labels without a room assertion.

Automatic fading and estimated rooms are not new ground-truth labels. Preserve the
existing signature learner's sample minimum and prior. This change records carrying
feedback and uses it in the live correction policy; it does not fit new global sensor
weights or change Bermuda settings automatically.

Persist active corrections with the presence state. Restore their strength and
timestamps, but discard unfinished movement support after restart. Recheck room and
device identities after rediscovery. Remove corrections for deleted targets and
expire room protection by wall-clock time. Old snapshots with no corrections remain valid.

## Navigation and companion fields

From device controls and the people editor, provide **Open Bermuda device** and
**Open tracker** actions. Link scanner names to their HA devices and area names to
their HA areas. Link activity-level stimuli to entity details, with a device link
when a registry device exists. Link area and zone groups to their mapped HA area or
entity when one exists. Groups with no HA counterpart keep their local editor.

Use registry IDs and the project's HA element patterns. Do not construct device IDs
from names. Keep navigation separate from correction clicks, with keyboard-accessible
labels. Missing targets must not produce broken links.

Companion sensors are optional. The editor must distinguish “not configured” from
“configured but unavailable.” Do not show an error for a watch merely because it has
no companion tracker. Show available signal status and explain how it affects the estimate.

## Optional notification follow-up

Ship automatic fading and panel explanations first. Phone notifications are an
optional follow-up, not required for corrections to release. They remain off unless
the user configures a recipient and enables them.

The follow-up can ask “Did you pick up your watch?” when evidence supports movement
but ownership remains uncertain. Actions are **Yes** and **No**. Each prompt binds a
unique token to the current person, device, and correction. Expire it after ten
minutes; consume it once; invalidate it after a newer correction. Ignore stale or
duplicate callbacks. Limit prompts to one per device per hour and one outstanding
prompt per device. No answer leaves automatic estimation running.

## Implementation boundaries

Add a pure correction-policy module under `presence/`. It owns support windows,
strength, release reasons, and serializable state. Keep HA reads, source timestamps,
notifications, and registry resolution in the integration layer. Apply constraints
inside the person and device estimation flow, including reset paths, so a stuck-filter
reset cannot silently erase a correction.

Extend the correction WebSocket API and services with validated device and carrying
targets while preserving existing person-room calls. Return correction state in
presence snapshots and subscriptions. Validate the full request before changing any
belief or label. Bound room, device, and correction histories.

## Acceptance and verification

Focused tests must cover:

1. Den remains selected through several minutes of Office-favoring Bluetooth updates
   after a person correction, including a parked watch in Office and a filter reset.
2. Correcting a watch's room affects the watch and its training label, not the person.
3. Stationary parked devices retain their carrying correction despite elapsed time,
   frequent callbacks, stale moving values, missing sensors, and restart.
4. One adjacent-room jump or an impossible directed route does not release a correction.
5. Sustained fresh sensor movement or observed route progression fades the correction
   and returns to automatic estimation without a manual clear.
6. A device moving separately from the owner's other evidence does not establish
   carrying by that owner. Charging conflicts and interrupted support remain stable.
7. Person/device room holds release on qualified movement, expire as specified, and
   can be cleared manually. Removed targets and old snapshots remain safe to load.
8. Combined person/carrying corrections create labels from the corrected state.
   Carrying-only labels never contaminate room signatures.
9. API validation is atomic; panel controls handle success and failure; links resolve
   from IDs; missing companion sensors are optional; correction status is accessible.

Run only new or changed tests and the smallest affected regression tests locally.
Use focused lint/type checks and rebuild the committed panel bundle. CI owns broad
Python and frontend regression runs on the exact pushed commit. Perform one inline
diff review; do not dispatch duplicate review agents. The implementation report must
separate local checks from CI evidence. This design document itself needs no runtime tests.
