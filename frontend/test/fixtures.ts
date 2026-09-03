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
  retrigger: "release",
  stack: false,
  debounce: 0,
  safety_refresh: 60,
  min_wake_interval: 1,
};

const houseEnvelopes: Config["envelopes"] = [
  { id: "default", label: null, attack: 0, decay: 0, sustain: 1, release: 1800, impulse: false, retrigger: null, stack: null, unavailable: null, debounce: null },
  { id: "momentary", label: null, attack: 0, decay: 0, sustain: 1, release: 600, impulse: true, retrigger: null, stack: null, unavailable: null, debounce: null },
  { id: "media", label: null, attack: 10, decay: 300, sustain: 0.6, release: 900, impulse: false, retrigger: null, stack: null, unavailable: null, debounce: null },
];

/**
 * Mirrors `house_config`: House > (Living Room, Kitchen), with no adjacency at all. The
 * kinds are the ones the backend infers for this document - `living_room` and `kitchen`
 * bottom out as `structure`, not `area`, because neither declares an edge and a bare
 * property/structure/structure has nothing else to go on.
 */
export const houseConfig = (): Config => ({
  version: 1,
  defaults,
  envelopes: houseEnvelopes,
  groups: [
    {
      ...newGroup("house", "property"),
      name: "House",
      mix: "max",
      stimuli: [{ ...newStimulus("binary_sensor.front_door"), envelope: "momentary" }],
      children: [
        {
          ...newGroup("living_room", "structure"),
          name: "Living Room",
          area_id: "living_room",
          stimuli: [
            { ...newStimulus("binary_sensor.living_motion"), gain: 2.0 },
            { ...newStimulus("media_player.tv"), to: ["playing"], envelope: "media" },
          ],
        },
        {
          ...newGroup("kitchen", "structure"),
          name: "Kitchen",
          gain: 0.5,
          stimuli: [{ ...newStimulus("binary_sensor.kitchen_motion"), release: 300 }],
        },
      ],
    },
  ],
});

const roomsEnvelopes: Config["envelopes"] = [
  { id: "default", label: null, attack: 0, decay: 0, sustain: 1, release: 1800, impulse: false, retrigger: null, stack: null, unavailable: null, debounce: null },
  { id: "hour", label: null, attack: 0, decay: 0, sustain: 1, release: 3600, impulse: false, retrigger: null, stack: null, unavailable: null, debounce: null },
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
      ...newGroup("house", "property"),
      name: "House",
      mix: "max",
      children: [
        {
          ...newGroup("downstairs", "structure"),
          name: "Downstairs",
          mix: "max",
          children: [
            {
              ...newGroup("kitchen", "area"),
              name: "Kitchen",
              area_id: "kitchen_area",
              adjacent: ["dining_room", "back_patio"],
              stimuli: [newStimulus("binary_sensor.kitchen_motion")],
            },
            {
              ...newGroup("dining_room", "area"),
              name: "Dining Room",
              area_id: "dining_room_area",
              adjacent: ["hall"],
              stimuli: [newStimulus("binary_sensor.dining_motion")],
            },
            {
              ...newGroup("hall", "area"),
              name: "Hall",
              area_id: "hall_area",
              adjacent: [{ id: "bedroom", connection: "door", one_way: true }],
              stimuli: [newStimulus("binary_sensor.hall_motion")],
            },
            {
              ...newGroup("bedroom", "area"),
              name: "Bedroom",
              area_id: "bedroom_area",
              stimuli: [newStimulus("binary_sensor.bedroom_motion")],
            },
            {
              ...newGroup("back_patio", "area"),
              name: "Back Patio",
              area_id: "back_patio_area",
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
  activity: { floor: 0.05 },
  scanner_areas: {},
};

const kindsEnvelopes: Config["envelopes"] = [
  { id: "default", label: null, attack: 0, decay: 0, sustain: 1, release: 1800, impulse: false, retrigger: null, stack: null, unavailable: null, debounce: null },
];

/** Mirrors `kinds_config`: property > structure > floor > area, with an outside area beside it. */
export const kindsConfig = (): Config => ({
  version: 1,
  defaults,
  envelopes: kindsEnvelopes,
  groups: [
    {
      ...newGroup("property", "property"),
      name: "Property",
      mix: "max",
      children: [
        {
          ...newGroup("house", "structure"),
          name: "House",
          mix: "max",
          children: [
            {
              ...newGroup("downstairs", "floor"),
              name: "Downstairs",
              floor_id: "downstairs",
              mix: "max",
              children: [
                {
                  ...newGroup("kitchen", "area"),
                  name: "Kitchen",
                  area_id: "kitchen",
                  adjacent: [
                    { id: "hall", connection: "open", one_way: false },
                    { id: "back_patio", connection: "exterior_door", one_way: false },
                  ],
                  stimuli: [newStimulus("binary_sensor.kitchen_motion")],
                },
                {
                  ...newGroup("hall", "area"),
                  name: "Hall",
                  area_id: "hall",
                  stimuli: [newStimulus("binary_sensor.hall_motion")],
                },
              ],
            },
          ],
        },
        {
          ...newGroup("back_patio", "outside"),
          name: "Back Patio",
          exit: true,
          stimuli: [newStimulus("binary_sensor.patio_motion")],
        },
      ],
    },
  ],
});

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
