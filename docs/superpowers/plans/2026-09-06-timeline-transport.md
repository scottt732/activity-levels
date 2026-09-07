# Timeline transport and mixer

Approved interaction design: hover previews, click pins, drag scrubs, horizontal wheel
pans, pinch and buttons zoom. Relative day steps move the transport; Now returns live.
Historical and forecast mixer values are read-only and show missing data explicitly.
Collapsed groups keep one summary strip with an expand control. Faders ignore wheel
input. The mixer page contains only timeline and mixer; Groups retains settings and
unique simulation status actions.

Implementation tasks:
- Timeline worker: bounded viewport, transport event, future cursor, labels and tooltip.
- Mixer worker: summary-only collapse, safe faders, preview presentation and settings link.
- Parent: cached and bounded preview data requests; shell integration; move unique status
  actions into Groups; focused tests; committed bundle; PR and exact-head CI.

Transport event: `al-transport`, detail `{time: number|null, window: {start,end}|null}`.
Time is epoch seconds. Null returns live. Preview requests are debounced and cached;
only the latest selection can publish results. Missing or failed data never uses live
values. No backend or runtime dependencies are required.

Run changed tests locally, plus focused lint and the panel build. CI owns full suites.
