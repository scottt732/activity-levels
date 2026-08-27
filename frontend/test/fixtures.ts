import { newGroup, newPresenceOverrides, newStimulus } from "../src/model";
import type { Config, PresenceSettings } from "../src/types";

/**
 * TypeScript mirrors of `tests/fixtures.py`. Kept in step by hand - there is no generator,
 * and the panel's copy only needs the fields the panel reads.
 */

const defaults: Config["defaults"] = {
  envelope: "default",
  max_value: 5,
  precision: 1,
  unavailable: "hold",
  retrigger: "only_in_release",
  debounce: 0,
  safety_refresh: 60,
  min_wake_interval: 1,
};

const houseEnvelopes: Config["envelopes"] = [
  { id: "default", attack: 0, decay: 0, sustain: 1, release: 1800, impulse: false, retrigger: null, unavailable: null, debounce: null },
  { id: "momentary", attack: 0, decay: 0, sustain: 1, release: 600, impulse: true, retrigger: null, unavailable: null, debounce: null },
  { id: "media", attack: 10, decay: 300, sustain: 0.6, release: 900, impulse: false, retrigger: null, unavailable: null, debounce: null },
];

/** Mirrors `house_config`: House > (Living Room, Kitchen), with no adjacency at all. */
export const houseConfig = (): Config => ({
  version: 1,
  defaults,
  envelopes: houseEnvelopes,
  groups: [
    {
      ...newGroup("house"),
      name: "House",
      mix: "max",
      stimuli: [{ ...newStimulus("binary_sensor.front_door"), envelope: "momentary" }],
      children: [
        {
          ...newGroup("living_room"),
          name: "Living Room",
          area: "living_room",
          stimuli: [
            { ...newStimulus("binary_sensor.living_motion"), gain: 2.0 },
            { ...newStimulus("media_player.tv"), to: ["playing"], envelope: "media" },
          ],
        },
        {
          ...newGroup("kitchen"),
          name: "Kitchen",
          gain: 0.5,
          stimuli: [{ ...newStimulus("binary_sensor.kitchen_motion"), release: 300 }],
        },
      ],
    },
  ],
});

const roomsEnvelopes: Config["envelopes"] = [
  { id: "default", attack: 0, decay: 0, sustain: 1, release: 1800, impulse: false, retrigger: null, unavailable: null, debounce: null },
  { id: "hour", attack: 0, decay: 0, sustain: 1, release: 3600, impulse: false, retrigger: null, unavailable: null, debounce: null },
];

/**
 * Mirrors `rooms_config`: a house with a real adjacency graph - two rooms, a hall, a patio
 * you can leave by. `house` and `downstairs` declare no edges, so they are branches, not
 * rooms, which is what every topology test needs to have something to drop.
 */
export const roomsConfig = (): Config => ({
  version: 1,
  defaults,
  envelopes: roomsEnvelopes,
  groups: [
    {
      ...newGroup("house"),
      name: "House",
      mix: "max",
      children: [
        {
          ...newGroup("downstairs"),
          name: "Downstairs",
          mix: "max",
          children: [
            {
              ...newGroup("kitchen"),
              name: "Kitchen",
              area: "kitchen_area",
              adjacent: ["dining_room", "back_patio"],
              stimuli: [newStimulus("binary_sensor.kitchen_motion")],
            },
            {
              ...newGroup("dining_room"),
              name: "Dining Room",
              area: "dining_room_area",
              adjacent: ["hall"],
              stimuli: [newStimulus("binary_sensor.dining_motion")],
            },
            {
              ...newGroup("hall"),
              name: "Hall",
              area: "hall_area",
              adjacent: [{ id: "bedroom", one_way: true }],
              stimuli: [newStimulus("binary_sensor.hall_motion")],
            },
            {
              ...newGroup("bedroom"),
              name: "Bedroom",
              area: "bedroom_area",
              stimuli: [newStimulus("binary_sensor.bedroom_motion")],
            },
            {
              ...newGroup("back_patio"),
              name: "Back Patio",
              area: "back_patio_area",
              exit: true,
              stimuli: [newStimulus("binary_sensor.patio_motion")],
            },
          ],
        },
      ],
    },
  ],
});

const PRESENCE_SETTINGS: PresenceSettings = {
  enabled: true,
  devices: [{ device: "device_tracker.scotts_phone", name: "Scott" }],
  envelope: "hour",
  threshold: 0.6,
  stay: 0.9,
  escape: 0.001,
  scale: 3,
  floor: 0.05,
  stuck_after: 60,
  scanner_areas: {},
};

/** Mirrors `presence_config`: `roomsConfig` with presence switched on and one tracked phone. */
export const presenceConfig = (): Config => {
  const config = roomsConfig();
  const downstairs = config.groups[0]!.children[0]!;
  return {
    ...config,
    presence: PRESENCE_SETTINGS,
    groups: [
      {
        ...config.groups[0]!,
        children: [
          {
            ...downstairs,
            children: downstairs.children.map((g) =>
              g.id === "kitchen" ? { ...g, presence: { ...newPresenceOverrides(), gain: 2.0 } } : g,
            ),
          },
        ],
      },
    ],
  };
};
