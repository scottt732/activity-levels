# Presence dashboard card

Approved through the interactive mockup and follow-up changes on September 7.

A compact room/floor card shows tracked people with their Home Assistant person images.
Solid borders and full-color images mark likely presence; dashed borders and translucent,
desaturated images mark possible presence. No visible name or confidence labels under
avatars. Accessible names and the correction dialog retain that information. Initials
are a fallback when no image exists or loading fails.

Round device controls start over the avatar's lower-right corner; further devices sit
beside the first. Person/device groups have a small gap. Only devices supporting the
selected room/floor appear. Explicit active false carrying corrections hide the device.
Watch actions say Wearing / Not wearing; all others say Carrying / Not carrying.

A same-size plus control follows the last person and lists only people not shown. Hide
it when every tracked person is displayed. A person dialog offers definite/probable
here, not here, room/floor selection, and automatic estimation. Device controls have
independent targets and device-specific correction dialogs. Report request failures.

Room, floor, tentative, and exclusion feedback must have distinct estimator semantics.
Only confirmed specific rooms can become room training labels. Feedback is temporary
and yields according to the estimator's evidence policy. Existing administrative
permissions remain: all authenticated dashboard viewers may read estimates, only admins
can correct them. This is an explicit initial access boundary, not a promise that all
household users can edit.

Ship one HACS integration containing a separate dashboard JavaScript entry, automatically
register a versioned resource for storage dashboards, and document manual YAML setup.
Multiple room cards share one polling source. Stop polling when no cards remain connected;
ignore stale requests and preserve useful content during refresh with explicit errors.
