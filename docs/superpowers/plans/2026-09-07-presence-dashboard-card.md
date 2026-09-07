# Presence Dashboard Card Implementation Plan

**Goal:** Ship the approved photo-avatar room and floor dashboard card in the integration.

**Architecture:** A shared frontend source reads an authenticated compact dashboard API.
Pure selectors map room beliefs and device evidence to avatars. Lit handles the card,
editor, and native correction dialog. Python owns feedback semantics and resource setup.

**Tech Stack:** Lit, TypeScript, Vite, Home Assistant, Python, Vitest, pytest.

- [x] Backend feedback: extend `schema.py`, `websocket_api.py`, presence coordinator and
  pure estimators for `{room?, floor?, certainty: definite|probable, exclude?}`. Reject
  conflicting targets and device-only combinations. Test negative/floor/tentative belief,
  serialization, expiry, API validation, and no false training labels.
- [x] Dashboard read API: `activity_levels/presence/dashboard` returns existing state,
  full per-person `probabilities`, and `groups: {id,name,kind,rooms:string[]}[]`.
  Test non-admin read and admin-only correction.
- [x] `frontend/src/presence-card-model.ts`: pure `roomPeople` and `visibleDevices`
  selectors with configurable probability threshold. Test floor sum, zero/missing
  estimates, active false carrying exclusion, and watch language.
- [x] `frontend/src/presence-card-store.ts`: shared subscription per HA connection;
  one request loop, unsubscribe cleanup, stale-response guard and retry on refresh.
  Test two subscribers share requests and teardown stops the timer.
- [x] `frontend/src/al-presence-card.ts` and `cards.ts`: setConfig validation, card picker
  metadata, editor, avatar image fallback, independent circular device buttons, add picker,
  native dialog, pending/error states, room/floor/negative/device request wiring. Test
  all-four add hiding, absent-only choices, watch wording, image use and request payloads.
- [x] `panel.py` and Vite entries: serve a separate cards module, register the versioned
  Lovelace storage resource without duplicates, leave YAML resources user-managed.
  Test new resource and repeated setup. Rebuild all committed frontend modules.
- [x] README: setup YAML, group selection, permissions, photos, confidence, corrections,
  and YAML resource fallback. Run changed Vitest/pytest tests and frontend lint/build.
- [ ] Concise self-review, conventional commit, push and open PR. Full test suites and
  canonical review belong to exact-head CI. Do not claim deployed before merge/release.
