# Changelog

## [0.5.1](https://github.com/scottt732/activity-levels/compare/v0.5.0...v0.5.1) (2026-08-30)


### Fixed

* **coordinator:** read Bermuda's real entity contract ([#9](https://github.com/scottt732/activity-levels/issues/9)) ([8cdb3c5](https://github.com/scottt732/activity-levels/commit/8cdb3c52c748ae2075c24219a7e5324126622b35))

## [0.5.0](https://github.com/scottt732/activity-levels/compare/v0.4.0...v0.5.0) (2026-08-28)


### Added

* **mixer:** read-only strips with an edit switch and collapsible hierarchy bands ([80c52a4](https://github.com/scottt732/activity-levels/commit/80c52a464344981b1315ad96083c90e2385b43d2))

## [0.4.0](https://github.com/scottt732/activity-levels/compare/v0.3.0...v0.4.0) (2026-08-28)


### Added

* **config:** publish a JSON Schema for the configuration document ([7c7e660](https://github.com/scottt732/activity-levels/commit/7c7e66007b6e013922b863c512960b4a0df498bc))
* **engine:** split retrigger into when and stacking, free the sustain multiplier ([db5be48](https://github.com/scottt732/activity-levels/commit/db5be4800dcfe3ce1d7867f6a2c8a16ec212ac5f))
* **panel:** edit the whole configuration as YAML in a Code tab ([d91f4f7](https://github.com/scottt732/activity-levels/commit/d91f4f713ee9171857fc38815495ef455e908047))
* **panel:** name and reorder envelope presets, split the retrigger controls ([689f933](https://github.com/scottt732/activity-levels/commit/689f933d9dcdba8c8b9deea12dbcd97e824e34a3))


### Documentation

* say trigger where the project said note and voice ([eade7c9](https://github.com/scottt732/activity-levels/commit/eade7c91749a577678dc7c8a4f1d95cc173806e5))

## [0.3.0](https://github.com/scottt732/activity-levels/compare/v0.2.0...v0.3.0) (2026-08-28)


### Added

* **api:** report whether Bermuda is loaded from presence/state ([1209a52](https://github.com/scottt732/activity-levels/commit/1209a52aed934b92830010453592ba9293d34a6d))
* **config:** group kinds, floor and area binding, and connection types ([a8d689a](https://github.com/scottt732/activity-levels/commit/a8d689ac623cc8aaa89c88a52ce681f320f5b10e))
* **config:** kinds decide the topology, the device model and config/get ([e6ed96d](https://github.com/scottt732/activity-levels/commit/e6ed96de2c534cd3cd06608c79d3ea54fa145305))
* **panel:** flat groups tree with drag-and-drop and Alt+arrow moves ([30f8a93](https://github.com/scottt732/activity-levels/commit/30f8a93e77cd7378a1b448adb93a10da9e8d4c9c))
* **panel:** kind vocabulary and pure move/drop reducers ([bb70f44](https://github.com/scottt732/activity-levels/commit/bb70f448ee96f3d33583159091f8e2e4f15eca0a))
* **panel:** paneled group editor with an adjacency table ([21eb82b](https://github.com/scottt732/activity-levels/commit/21eb82b1f0f2372a6a3e7f36238f67f49ac09d96))
* **panel:** paneled stimulus editor with a collapsed override preset ([bbb1cc2](https://github.com/scottt732/activity-levels/commit/bbb1cc294acf1bf67ef53231cdf1e197cd656b0f))
* **panel:** presence setup card on an always-reachable tab ([ba40696](https://github.com/scottt732/activity-levels/commit/ba406964e60420104a4f7e8d9c18090452382835))


### Fixed

* **config:** amnesty inferred kinds on both ends of a rule, drop the unreachable null-kind branch ([809eec9](https://github.com/scottt732/activity-levels/commit/809eec9b3710f53f51fee0b1a142d64554ce651c))
* **config:** let migrated documents save back, keep evidence-based kinds to leaves, warn on root rooms, suggest areas by name ([ee747b8](https://github.com/scottt732/activity-levels/commit/ee747b8ec48b5e718f98db7abf8aef7d8c2bb7b7))
* **panel:** give the mixer's stimulus view the shared paneled editor ([dc1a8ce](https://github.com/scottt732/activity-levels/commit/dc1a8ce27a112505fae50d7bb4bcf2b25f9c3321))
* **panel:** make tree drag-and-drop work in real browsers, roving tabindex, stimulus drop targets ([669f2fb](https://github.com/scottt732/activity-levels/commit/669f2fb3d59b87bce9b3f3b83390922dfbe8bcaf))
* **panel:** prefill ids from the registry id, share the presence overrides panel and the panel chrome ([8cc1e9a](https://github.com/scottt732/activity-levels/commit/8cc1e9a23bc59aa7ce2cfcf34627b7360742690f))
* **panel:** rebase the drop target after removal, open a new group, show migration warnings ([5f58587](https://github.com/scottt732/activity-levels/commit/5f585878efdebd58ed961dfd5df6a499bf571203))


### Documentation

* design spec for group kinds, adjacency table, tree UX and paneled editor ([2c86eca](https://github.com/scottt732/activity-levels/commit/2c86eca07d9effc556afa5ac0f452cc0c9e5f65d))
* group kinds, the adjacency table and the example house ([ee872a3](https://github.com/scottt732/activity-levels/commit/ee872a34b60af22f787d9de1ba1c3aa59e9b37bc))
* implementation plan for group kinds, tree UX and paneled editors ([d74a2f8](https://github.com/scottt732/activity-levels/commit/d74a2f8dbd98a911ce29d3c40fd1cc09d8a77f9b))
* plan 8 group kinds, tree and editor ledger ([6089eed](https://github.com/scottt732/activity-levels/commit/6089eed5f7d16f0ad3795b8b83bc800fc6a6bf7f))

## [0.2.0](https://github.com/scottt732/activity-levels/compare/v0.1.0...v0.2.0) (2026-08-27)


### Added

* **engine:** give every room a visible presence channel driven by set_occupied ([f1ea556](https://github.com/scottt732/activity-levels/commit/f1ea5568920e1b80050d2e91775166244feb4200))
* **frontend:** adjacency and exit fields, presence types and the presence channel row ([f9d4c16](https://github.com/scottt732/activity-levels/commit/f9d4c16f541b48b78acb905d46405b13bec1a2dd))
* **frontend:** Presence tab with a room map, device rows, scanner table and settings ([91e6a6a](https://github.com/scottt732/activity-levels/commit/91e6a6aa1fd6452a1c468e018fbb5e4cf06abe38))
* **presence:** Bermuda-backed presence coordinator with repair issues and occupancy ([f7a3cc6](https://github.com/scottt732/activity-levels/commit/f7a3cc6d11350ba5b58bd21d27178c0ca87815df))
* **presence:** hidden Markov room estimator with a stuck detector and bounded Viterbi ([ba7f629](https://github.com/scottt732/activity-levels/commit/ba7f6291a7dfe385f5bb9dccef8d5c5ef02115e7))
* **presence:** room, moving and occupants entities ([a1be4c1](https://github.com/scottt732/activity-levels/commit/a1be4c127382e6c5343b0d24bf6a35de1b5bb019))
* **schema:** room adjacency, exits and the opt-in presence block ([13967d2](https://github.com/scottt732/activity-levels/commit/13967d294a7291dafe24de4694c91dc3cee32cc7))
* **topology:** room graph with one-way edges, bounded paths and a transition matrix ([54e1972](https://github.com/scottt732/activity-levels/commit/54e1972d94dbac53bcb86539f878ad5f06153596))


### Fixed

* **frontend:** keep stale adjacency for validation, add adjacency to the controls row, badge one-way edges ([7694455](https://github.com/scottt732/activity-levels/commit/76944551a9a1cfbcff38026b2072c1524b4b2fc5))
* **frontend:** keep the tab list valid on undo, draw one-way arrows on node borders, expose map nodes to AT ([c8a762c](https://github.com/scottt732/activity-levels/commit/c8a762c96c4fd7aad5f053e2befd5de81f569046))
* **panel:** bound the presence sliders to what the schema accepts ([581697b](https://github.com/scottt732/activity-levels/commit/581697b77769df330f51b19d62c5ec26db89d5b3))
* **presence:** detect Bermuda through its config entry and clear stale repair issues ([5dccdf9](https://github.com/scottt732/activity-levels/commit/5dccdf90cb79bc706107f64dc6282e9df01092e1))
* **presence:** freeze the stuck threshold for the duration of a low run ([fb32c50](https://github.com/scottt732/activity-levels/commit/fb32c50cd37bb6f71b571effc4837c9a37349e04))
* **presence:** keep the pure packages free of homeassistant, refuse a malformed belief store, release gates when every tracker vanishes ([28a962e](https://github.com/scottt732/activity-levels/commit/28a962eaa19bc539cf88c2669c3ec99367634030))


### Documentation

* AGENTS.md guides, with CLAUDE.md symlinked to each ([0bf3219](https://github.com/scottt732/activity-levels/commit/0bf32193bee6b5dffa62ca420b7a7585ee739593))
* design spec for room topology and Bermuda-constrained presence ([99cf438](https://github.com/scottt732/activity-levels/commit/99cf4382fcb78834ab1dc11b7d1c3c99836e281c))
* implementation plan for topology and presence ([ddce588](https://github.com/scottt732/activity-levels/commit/ddce5881926d5d26abe916bb64d847a9725a16b9))
* plan 7 topology and presence ledger ([d372bc0](https://github.com/scottt732/activity-levels/commit/d372bc02deaa90d8d9e6f7a94189e1d4004fecb4))
* room adjacency and presence, with adjacency for the example house ([28d6c2f](https://github.com/scottt732/activity-levels/commit/28d6c2f9f272a2860414dc2f38f68a79b5c1127e))

## 0.1.0 (2026-08-27)


### Added

* **api:** expose mute, level override and reset over websocket and services ([c435058](https://github.com/scottt732/activity-levels/commit/c435058e0d0ff533437d4fc9a62b9d920bf3cf15))
* build engine tree from config ([1cd0211](https://github.com/scottt732/activity-levels/commit/1cd021172bdb6975f5c4cf4b3505881c2f626a85))
* config entry setup, devices, config flow, services ([abeafce](https://github.com/scottt732/activity-levels/commit/abeafce79a0beb2515c68f87ad577dce127bcfff))
* config schema with pathed validation errors ([9390083](https://github.com/scottt732/activity-levels/commit/939008313c3e025d816d9ea760f3db81a6c05ccf))
* **config:** default retrigger to stack and give every voice its group's ceiling ([dce276a](https://github.com/scottt732/activity-levels/commit/dce276a81a758796703aebeb1c1f4fcbffae7d62))
* coordinator with state listener, timers, persistence ([3e6ba3b](https://github.com/scottt732/activity-levels/commit/3e6ba3bee9947dfa2e1ce716510eb9330ac801a3))
* **coordinator:** mute groups and override their level ([74d2f82](https://github.com/scottt732/activity-levels/commit/74d2f82055cc314effce680cbae43102d6b388ef))
* **coordinator:** report the hidden trigger voice in voice_states ([a03c8e8](https://github.com/scottt732/activity-levels/commit/a03c8e883d3df24feba10e79f4d79c16e1f79e91))
* **engine:** add the `stack` retrigger mode and make it the default ([d2bbb92](https://github.com/scottt732/activity-levels/commit/d2bbb9242a14007a2966c1e069e88e0ee5e35721))
* **engine:** envelope config types and enums ([4036387](https://github.com/scottt732/activity-levels/commit/4036387e6a0755d07c74f1139d3d05f3a87a6a77))
* **engine:** group aggregates, slope and next-display-change scheduling helpers ([062715e](https://github.com/scottt732/activity-levels/commit/062715e3fc39a6890bec98ef7172465f310c250e))
* **engine:** Group mixer with sum/max/mean and limiter ([96cecaa](https://github.com/scottt732/activity-levels/commit/96cecaa7d48900cdbb3c8c83357638fbf4699225))
* **engine:** invert the mix to size one channel for a target level ([7d85b90](https://github.com/scottt732/activity-levels/commit/7d85b90424cc7ee0390bccf20ab56527418b07ba))
* **engine:** let a channel be muted out of its group's mix ([b7db937](https://github.com/scottt732/activity-levels/commit/b7db937a21319230bddc92ab8d317003b8839775))
* **engine:** reference the release slope to full scale, not gain ([4deea7c](https://github.com/scottt732/activity-levels/commit/4deea7cf3286a7937ad2593752de7d4393caa096))
* **engine:** Voice state machine with linear release ([3b6280a](https://github.com/scottt732/activity-levels/commit/3b6280a732dbd7f95da7fdee27861168a49efa8e))
* **frontend:** envelope presets, defaults and ADSR sketch ([6e87ebb](https://github.com/scottt732/activity-levels/commit/6e87ebbc7a111949e43db5535e5325b90037c26e))
* **frontend:** live view, empty states, docs ([ed51b0d](https://github.com/scottt732/activity-levels/commit/ed51b0dc516e79782d0790b07b72ab39ae947472))
* **frontend:** panel shell with draft store, loader, toolbar and tabs ([5aaef74](https://github.com/scottt732/activity-levels/commit/5aaef74986c5fdf40a85e797785d18636680d693))
* **frontend:** scaffold Lit/Vite/pnpm panel build with CI ([1c80332](https://github.com/scottt732/activity-levels/commit/1c80332a1ac6a42ac55c2f1e2baafddb3e75eafa))
* **frontend:** tree pane, group and stimulus editors ([526b706](https://github.com/scottt732/activity-levels/commit/526b7061948a8d67886c69078758a7f71bd173d0))
* **mixer:** controls row for the selected strip ([90c029f](https://github.com/scottt732/activity-levels/commit/90c029fbeb5914f9937f12a6b60ab398c33b2c85))
* **mixer:** data layer and pure math for timeline, navigation, fader ([b5cd168](https://github.com/scottt732/activity-levels/commit/b5cd168270f4b9b0f155056eb7e82c6c21fa67f0))
* **mixer:** drill-down mixer with master strip ([a7ac44a](https://github.com/scottt732/activity-levels/commit/a7ac44a93e9fe8f62071def078fea32e5500d95a))
* **mixer:** empty states, a11y pass, docs ([b3005ec](https://github.com/scottt732/activity-levels/commit/b3005eca58e6c8389e55f7b63b5dbb0167efadf6))
* **mixer:** fader, meter and strip components ([4a6d970](https://github.com/scottt732/activity-levels/commit/4a6d9706f19046b48247b134ff30ff55bbc7946a))
* **mixer:** Mixer landing tab, Patterns tab, shell wiring ([8efdd9e](https://github.com/scottt732/activity-levels/commit/8efdd9e896132b52045e861d157c310bb25db189))
* **mixer:** overlay timeline with history, forecast, lights and plan ([855768a](https://github.com/scottt732/activity-levels/commit/855768ae166858e6ff77c207f1a6218ca2eb255b))
* **mixer:** root selector at the head of the breadcrumb for multi-root configs ([b8de8dc](https://github.com/scottt732/activity-levels/commit/b8de8dc7892896260768973dc70d8c4689bf5569))
* **panel:** offer stack as the first retrigger mode and draw release to scale ([faec5e1](https://github.com/scottt732/activity-levels/commit/faec5e1e66f9406107766ea095ca29f724f371d7))
* **panel:** print levels at the group's precision ([c15bda3](https://github.com/scottt732/activity-levels/commit/c15bda38893db10980ebb9e6e38cf55b23103de4))
* **panel:** report each group's light count in the live state ([ba603c1](https://github.com/scottt732/activity-levels/commit/ba603c18e1890e64efc371a48de475171a2fcae7))
* **patterns:** config schema and day-type labelling ([c1fe799](https://github.com/scottt732/activity-levels/commit/c1fe799b17e487fe66a501e637831c06e0b49bcc))
* **patterns:** follow the registries for a group's light membership ([e499e72](https://github.com/scottt732/activity-levels/commit/e499e723c48082c9d78252d169827359eb5054ff))
* **patterns:** light transition log and group light membership ([c800488](https://github.com/scottt732/activity-levels/commit/c800488da8d04133da30fff73d77519a564cbc79))
* **patterns:** numpy Fourier/ridge learner and light profile ([69618ac](https://github.com/scottt732/activity-levels/commit/69618ac8289f828a00e948058a0b06fc6f0ca946))
* **patterns:** patterns coordinator, expected/anomaly sensors, hub device ([0e5878e](https://github.com/scottt732/activity-levels/commit/0e5878e73302da0eac85e5bf9df2f7527446de3e))
* **patterns:** presence simulation runtime and switches ([2937213](https://github.com/scottt732/activity-levels/commit/293721333034c21d4bcad1da97e155df951a6b51))
* **patterns:** profile document schema and helpers ([4848e54](https://github.com/scottt732/activity-levels/commit/4848e54276ee47748b5cc74e034bb31657a9ca12))
* **patterns:** seeded light plan sampler ([6540d5c](https://github.com/scottt732/activity-levels/commit/6540d5c5f603f3f9c5bfb8c52cd911248b4e687f))
* **patterns:** websocket profile/timeseries/simulation endpoints; docs ([a497788](https://github.com/scottt732/activity-levels/commit/a49778831226a1712fc4562016cfda6a8846914c))
* register the sidebar panel and serve the bundle ([10c1cc7](https://github.com/scottt732/activity-levels/commit/10c1cc78fab15da64a689f6ce6958114e74f9873))
* sensor, binary_sensor and button entities per group ([4543b14](https://github.com/scottt732/activity-levels/commit/4543b149e5a9d0a4750b11fe1f8398b37a57c85b))
* **switch:** add a mute switch to every group device ([90ea74c](https://github.com/scottt732/activity-levels/commit/90ea74c8b3fc47689b016756a9b48c4c63643019))
* **timeline:** draw the live tail ([505a8ba](https://github.com/scottt732/activity-levels/commit/505a8baefd859693407e04287961727ba47c96ac))
* **timeline:** refetch once the live value has really moved ([6afd55a](https://github.com/scottt732/activity-levels/commit/6afd55a0e5769950d2ad36376b04035d84874fbb))
* websocket API for the panel and diagnostics ([8d6164f](https://github.com/scottt732/activity-levels/commit/8d6164f1b2425d20c28df5095b33261ca79723d0))
* **ws:** richer state payload for the panel ([ed080e3](https://github.com/scottt732/activity-levels/commit/ed080e3b24591f6c23d2dddf0332653662cee4e4))


### Fixed

* **config_flow:** store normalized options on entry creation ([d340633](https://github.com/scottt732/activity-levels/commit/d34063345db3925f3f1d3c81340cb138e54046b2))
* **coordinator:** drop contributors that round away to zero ([236d0e3](https://github.com/scottt732/activity-levels/commit/236d0e334533c996165f26f2480b4ae3522b143a))
* **coordinator:** release voices whose entity has vanished ([6538bc0](https://github.com/scottt732/activity-levels/commit/6538bc0963062be4f520296bae935656cee4a08e))
* **coordinator:** schedule wakes across the whole subtree; hardening ([757691d](https://github.com/scottt732/activity-levels/commit/757691dbead10154c6551eb88beb21644cf9dcc0))
* **engine:** MAX crossover wake and zero-value gated restore ([0ebc321](https://github.com/scottt732/activity-levels/commit/0ebc32156dd91e1f9f893203d834d2c7fc46139d))
* **engine:** mix channels, not the id-keyed contributions dict ([af3f8b6](https://github.com/scottt732/activity-levels/commit/af3f8b653ee916813c4f936c7fee82ec098e8eb2))
* **engine:** reset clears debounce history ([075c737](https://github.com/scottt732/activity-levels/commit/075c737aa471a6778e5420a094a178d8d46f7259))
* **engine:** schedule display changes in display space ([34860c0](https://github.com/scottt732/activity-levels/commit/34860c071bdd9e1f6f3c8e96b3e7be1a485a7148))
* **engine:** schedule the limiter un-pin crossing ([5ecbdd4](https://github.com/scottt732/activity-levels/commit/5ecbdd413605fd616b7d7739ec2699a03e07205e))
* **engine:** settle phase on note events and reject non-finite config ([95fff98](https://github.com/scottt732/activity-levels/commit/95fff98ee814fda39b09f21c38cc6840c493a277))
* **engine:** tolerance guard for next_display_change at rounding edges ([0d43dd6](https://github.com/scottt732/activity-levels/commit/0d43dd6e7fcf89a091db4482d492a16d2df3962c))
* **frontend:** drop stale validation errors after a structural edit ([87b43ee](https://github.com/scottt732/activity-levels/commit/87b43ee1f6ef2136b97967db23c61ad7b836d4be))
* **frontend:** harden save flow and loader; drop inert menu-button props ([4468723](https://github.com/scottt732/activity-levels/commit/44687236fd8175a547868edfe152aff731f4ed12))
* **frontend:** keep override selectors optional ([e2fbcf0](https://github.com/scottt732/activity-levels/commit/e2fbcf01ad549f361a49411dc5b928d701d55edf))
* **frontend:** keep the selection put when an unrelated node is reordered ([30dc4f5](https://github.com/scottt732/activity-levels/commit/30dc4f508dfc52e93f09c41bcc5b22401980f50b))
* **frontend:** pass narrow through to the top app bar ([1893775](https://github.com/scottt732/activity-levels/commit/189377524233ee7fcc6575357bb78c86ca4952e7))
* **frontend:** rename presets by index; sub-second durations; envelopes tab polish ([6b52e01](https://github.com/scottt732/activity-levels/commit/6b52e01d968979cd9abb579bd2552e663a36f0a5))
* **frontend:** safe path lookup, keyboard focus nesting, undo coalescing ([961abcc](https://github.com/scottt732/activity-levels/commit/961abcc5a8f75fb07fcdd8a1a26d2d0304269063))
* **frontend:** size icon buttons with --ha-icon-button-size ([3b8b7af](https://github.com/scottt732/activity-levels/commit/3b8b7af5351fb06717eb4e64246d434c103c452d))
* **frontend:** stimulus 'to' field keeps raw text while typing ([9aa1792](https://github.com/scottt732/activity-levels/commit/9aa17923cd27dfeeb0227bb5c24f21cd8a65102d))
* **init:** stop the coordinator through async_on_unload ([b786933](https://github.com/scottt732/activity-levels/commit/b7869334dea42fc0ec234558047fff3d6a383b53))
* keep the panel registered across reloads so Save does not refresh the UI ([345f254](https://github.com/scottt732/activity-levels/commit/345f2542920223c0aa9ba3f9a9ed9655d4f32b91))
* **mixer:** arrow-left from no selection lands on MASTER; empty bus path guards ([e245a8c](https://github.com/scottt732/activity-levels/commit/e245a8c14494a4600823fb7de2d3e6cc4b31161f))
* **mixer:** keep Groups tab behavior — no frozen live frame, null selection preserved; hygiene ([5a67787](https://github.com/scottt732/activity-levels/commit/5a67787705b28e437edcb041b87b2ac1ed4cc0f3))
* **mixer:** keyboard navigation ignores keys typed into master strip controls ([49e8e11](https://github.com/scottt732/activity-levels/commit/49e8e11d776d730dfcb445570634a9ef363bd264))
* **mixer:** limiter input rejects values below 0.1; icon branch test ([0d8af75](https://github.com/scottt732/activity-levels/commit/0d8af75b9d29915cd1bce666c38cd04960c32bcd))
* **mixer:** the roving tabindex gates a strip's own controls too ([1ddf440](https://github.com/scottt732/activity-levels/commit/1ddf4407358e1b643c1b95eab2758f40d5f79144))
* **mixer:** timeline cache keys quantized to the minute; eviction; decimate band ([91d4de6](https://github.com/scottt732/activity-levels/commit/91d4de662cdd68090618d46c6786753c6aa3cd84))
* **panel:** do not register the panel when the bundle is missing ([ff63906](https://github.com/scottt732/activity-levels/commit/ff63906bbf34dea8def7d940a3d09903670cfa73))
* **patterns:** a coalesced rebuild reports the rebuild it waited for ([9643693](https://github.com/scottt732/activity-levels/commit/9643693b4040a8d492e8f46471a80190c6934b2d))
* **patterns:** cap a forecast at 2000 points and say when it was cut ([5c71fcf](https://github.com/scottt732/activity-levels/commit/5c71fcfad72054069e5cd5220ff2cfe90644a1e3))
* **patterns:** DST-correct times, ON-only quiet hours, trend origin, robustness ([646cb9c](https://github.com/scottt732/activity-levels/commit/646cb9c790b9993d04876cc9e8fe3ef6c4c839d7))
* **patterns:** plans start now, is_active semantics, re-plan tests, simulate_now feedback ([1724ce3](https://github.com/scottt732/activity-levels/commit/1724ce35e05fc80ef5cdcbc9dafa5273895addfa))
* **patterns:** record unknown light states instead of pretending they are off ([baef6cc](https://github.com/scottt732/activity-levels/commit/baef6cc7c68f8020ac78269ea5062c1aea8680c2))
* **patterns:** resolve statistic ids through the entity registry ([b373746](https://github.com/scottt732/activity-levels/commit/b373746ff010c8c10f132f96d2c880667d62edb9))
* **schema:** keep inherited group fields as None ([fa273ee](https://github.com/scottt732/activity-levels/commit/fa273ee191c3772e7b66d0e29489fa6609351c05))
* **simulation:** hold plans back for a minute after Home Assistant starts ([9cb852c](https://github.com/scottt732/activity-levels/commit/9cb852cd20bd183f545ecc58d1b262a1c10bcb45))
* **simulation:** the plan is what will run, and a forced plan expires at midnight ([273a689](https://github.com/scottt732/activity-levels/commit/273a689af137fae7659f4e9528e766e8e2ded911))
* **timeline:** a new group starts from an empty chart, not the last one's ([0c0e1f9](https://github.com/scottt732/activity-levels/commit/0c0e1f942d89c59a3c655f9fcd5b563d2dd80246))
* **timeline:** the refetch tick respects visibility and a save in flight ([1f947e4](https://github.com/scottt732/activity-levels/commit/1f947e4506bac007b6ffe3dea8018eca7dfc90c5))
* **translations:** carry the mute and set_level strings into en.json ([dc630ee](https://github.com/scottt732/activity-levels/commit/dc630ee6bff5c4fcc43ec8589f88b11d92d286b3))
* **voice:** reconcile phase and gate on restore ([40a78b4](https://github.com/scottt732/activity-levels/commit/40a78b45e77bc8e898e02cb3d4caa3f2fb426d84))
* **websocket:** keep pathed errors on config/save ([8a8ad7f](https://github.com/scottt732/activity-levels/commit/8a8ad7f9cf2f092065b1fd8a1d5f1cdc3383ace6))
* **ws:** build one state frame from a single timestamp ([6115bf8](https://github.com/scottt732/activity-levels/commit/6115bf8c9ab0fc64eb0341844ed33a147f8bcd8f))


### Performance

* **patterns:** batch light-log writes for five minutes and prune on load ([51ef0e1](https://github.com/scottt732/activity-levels/commit/51ef0e1dfb869e9ebaba5f047a4a0c813b8353e1))
* **sensor:** keep the contributors attribute out of the recorder ([764ebfe](https://github.com/scottt732/activity-levels/commit/764ebfea211419cf85a722f879af3a9b99cb5a96))


### Changed

* **frontend:** drop the unreachable read-only banner ([bac9908](https://github.com/scottt732/activity-levels/commit/bac9908acef853796c260d4af8eb326afdacf29c))
* **frontend:** one DEFAULT_MIN_DAYS in src/constants.ts ([e9a508f](https://github.com/scottt732/activity-levels/commit/e9a508f18b5229ea77f11b06236bc740b54d0680))
* **mixer:** stable simState, one group walk, timeline heading ([a1f0fb7](https://github.com/scottt732/activity-levels/commit/a1f0fb74e17220e0dbf555230551fb999bedd145))
* **patterns:** one day-type list, a named trend column, no empty precedence ([5660536](https://github.com/scottt732/activity-levels/commit/5660536453d87cbb33589b4c9cb26d9c8e4fe9ed))
* **schema:** drop the no-op exception reconstruction in _group_schema ([dd61d8a](https://github.com/scottt732/activity-levels/commit/dd61d8ad8131fe415c563ba59ba07ce10e057a01))
* **websocket:** use the package-level websocket_api names ([6046cde](https://github.com/scottt732/activity-levels/commit/6046cde1b7553f95bf6adb26a54217e1363ed975))


### Documentation

* add LICENSE and CHANGELOG; note id/area semantics ([e5d0a80](https://github.com/scottt732/activity-levels/commit/e5d0a8073b854715d18ae82ee00618c6b22ddd83))
* add the community files a public repository is expected to have ([8f9bfe1](https://github.com/scottt732/activity-levels/commit/8f9bfe1f7ae2e11d032dee741531f92b4eeb502e))
* **changelog:** record the stack mode and the full-scale release slope ([e2e08c0](https://github.com/scottt732/activity-levels/commit/e2e08c0b5c95b4291d085db11ec03e297234ac5d))
* describe stacking and the full-scale release slope ([c6923ac](https://github.com/scottt732/activity-levels/commit/c6923ac994c90620ea42fa358cad3ff0ec349355))
* **engine:** state the monotonic-t and wake-floor contracts; harden CI ([dc22510](https://github.com/scottt732/activity-levels/commit/dc22510e10441c75be79c45efef477ed9d4b6002))
* example config uses current entity ids ([6864ac8](https://github.com/scottt732/activity-levels/commit/6864ac878edb28d40a36514fe4caacee03108127))
* example house config and websocket loader script ([90bbcba](https://github.com/scottt732/activity-levels/commit/90bbcbac2ef5edcb718c5a69bf115a59502c6389))
* note intermittent area selector report ([965bb32](https://github.com/scottt732/activity-levels/commit/965bb328fab025fdaab37c9a622cfeef470079d9))
* plan 1 execution ledger (rulings and deferred items) ([ec49204](https://github.com/scottt732/activity-levels/commit/ec49204b7b0ecae1adb76e2990ddec389185a2e2))
* plan 2 (HA integration layer) ([b34a9f2](https://github.com/scottt732/activity-levels/commit/b34a9f23b6e175f0d4f046f1be089d716e61c53d))
* plan 2 execution ledger (rulings and deferred items) ([a66fd6b](https://github.com/scottt732/activity-levels/commit/a66fd6bad579d05a47e45ef5c1ba0c318db9febd))
* plan 3 (sidebar panel) ([16c9139](https://github.com/scottt732/activity-levels/commit/16c9139f9f5e5092050ec14734db07030ef6791a))
* plan 3 execution ledger (rulings and deferred items) ([4419b87](https://github.com/scottt732/activity-levels/commit/4419b87995f53c264e653b81fc6f7a62c202a083))
* plan 4 (patterns and presence simulation) ([73fa2e2](https://github.com/scottt732/activity-levels/commit/73fa2e286383458f819fbef8dbdb392f25d02cc1))
* plan 4 execution ledger (rulings and deferred items) ([8e42381](https://github.com/scottt732/activity-levels/commit/8e423815a2237b75c6412077880c3a821674d3b4))
* plan 4 ledger — parked re-review minors ([1a0f332](https://github.com/scottt732/activity-levels/commit/1a0f3320b1846659cdb8a208021b525f4376a68b))
* plan 5 (mixer landing page) ([3ff9c14](https://github.com/scottt732/activity-levels/commit/3ff9c149b3bbb542cc41e1c14538478f2ea4631d))
* plan 5 execution ledger (rulings and deferred items) ([ab40afa](https://github.com/scottt732/activity-levels/commit/ab40afa90f12bb476d9562a0a6470653eeac36f3))
* plan 6 mixer v2 ledger ([16b1154](https://github.com/scottt732/activity-levels/commit/16b11544eaf791e3b95afd7d2616a650165f0f63))
* **readme:** badges, and sections on releases and contributing ([6d5a72c](https://github.com/scottt732/activity-levels/commit/6d5a72cc433110981e23efe52cfa2546e6afb0d2))
* specs for patterns/simulation (plan 4) and mixer landing page (plan 5) ([da3165b](https://github.com/scottt732/activity-levels/commit/da3165b6ba78bc39a84a5172647f882e0abfe836))
* spell out every simulation precondition and what quiet hours do ([04bc281](https://github.com/scottt732/activity-levels/commit/04bc281695a4c4cb57b46dadacb43bd18e256d92))


### Miscellaneous

* manage releases with release-please ([2793164](https://github.com/scottt732/activity-levels/commit/2793164578c4b04bfcd50ed28e574f16c063a2c9))

## Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Pre-release notes (before 0.1.0)

Everything below landed before the first tagged release; from 0.1.0 onwards
release-please writes the sections above this one from the commit history.

### Changed
- New `stack` retrigger mode, now the default, restores the original additive behaviour:
  each trigger adds its stimulus `gain` on top of whatever is already sounding — while
  the note is held as well as while it is fading — up to the group's `max_value`. The
  previous default, `only_in_release`, is still available and unchanged, as is `always`.
  A stacked note decays to `sustain` times the peak it actually reached.
- `release` now means "time to fall from full scale (the group's `max_value`) to zero"
  rather than from the stimulus `gain`. Every level falls at that one slope, so lower
  levels empty proportionally faster: with `max_value: 5` and `release: 2h`, a voice at
  5.0 takes 2h and a voice at 1.0 takes 24 minutes. Existing configurations will see
  low-gain stimuli fade noticeably faster; raise `release` to keep the old timing.

### Fixed
- Saving from the panel no longer refreshes the whole UI: the sidebar panel stays registered across integration reloads and is removed only when the integration is deleted.
- A light going `unavailable`, or Home Assistant restarting, is recorded as *unknown*
  rather than as the light being switched off. The gap closes any open interval, is left
  out of that light's observed minutes, and produces no learned switch-on or switch-off
  times, so restarts no longer teach the profile a nightly habit.
- Long-term statistics are located through the entity registry, so renaming a group's
  `sensor.<id>_activity_level` no longer hides its history from the learner. A rebuild
  that finds no rows for a group warns, naming the statistic id it looked for.
- Presence simulation waits for Home Assistant to be running, plus a minute to settle,
  before driving anything: restored switches used to arm while the away entity and every
  stimulus were still unavailable, which reads as an empty, quiet house.
- Light membership follows the entity and device registries, so a light added, moved or
  removed after setup joins or leaves its group without a reload. The group's switch is
  created by the switch platform at setup and still needs one; that is logged.
- `plan_for` no longer reports actions the clock had already passed when the plan was
  sampled, and a plan forced by `simulate_now` expires at midnight instead of overriding
  the switches for a second day.
- Forecasts are capped at 2000 points: a request past the cap comes back truncated and
  says so, and the day-type ribbon stops where the forecast does.
- The light log batches its writes over five minutes instead of ten seconds, and prunes
  to `history_days` when it is loaded as well as nightly.
- A rebuild that waited out a concurrent one reports success rather than "declined".
- An empty `day_type_precedence` is rejected instead of validating into a configuration
  that can never label a day.

### Added

- **Engine** — an ADSR voice/group mixer with per-voice attack, decay, sustain and
  release, retrigger and unavailable policies, debounce, impulse voices, and groups
  that mix their channels with `sum`, `max` or `mean` under a per-group limiter.
  Groups expose their display value, the next instant that value can change, active
  voice counts, cooldown projections and per-channel contributions.
- **Integration layer** — config entry with the whole configuration held in options,
  a validating and normalizing schema with path-addressed errors, a device per group
  wired up via `via_device`, per-group `sensor`, `binary_sensor` and `button`
  entities, the `activity_levels.trigger` and `activity_levels.reset` services,
  state restored across restarts, and diagnostics.
- **Websocket API** — `activity_levels/config/get`, `config/validate`,
  `config/save` and `state` for the sidebar panel, all admin-only.
- **Panel** — sidebar panel for editing groups, stimuli, envelopes and defaults; live
  view. Edits are a draft with undo, redo and discard; saving validates first and shows
  problems on the fields that caused them, then reloads the integration. The live view
  overlays each group's level and gate, and each voice's envelope phase and countdown,
  onto the tree and the stimulus editor.
- **Patterns** — learned expected-activity/anomaly sensors, presence simulation switches,
  profile/timeseries websocket API. The live state reports how many lights each group
  owns, so the panel can tell "cannot be simulated" from "not armed".
- **Mixer landing page** (timeline, drill-down mixer, controls), Patterns tab — the panel
  now opens on a DAW-style Mixer: a timeline of history and forecast for the selected
  strip, a drill-down mixer of channel and bus strips with faders, meters and a MASTER
  strip (mix, limiter, presence-simulation switch), and a controls row for whatever is
  selected. Groups remains the structure editor and shares its selection with the Mixer.
  A new Patterns tab shows profile status, per-group readiness and the simulation log.
