/**
 * The entities the integration creates for a group. The ids follow from the group id, so
 * the panel can address them without waiting for an entity registry lookup - and one file
 * holds the convention, rather than each component spelling it out again.
 */

/** The switch that runs a group's presence simulation. */
export const simSwitchId = (gid: string): string => `switch.${gid}_presence_simulation`;

/** What the pattern profile expects the group's activity to be right now. */
export const expectedSensorId = (gid: string): string => `sensor.${gid}_expected_activity`;

/** How far the group's activity is from what the profile expected. */
export const anomalySensorId = (gid: string): string => `sensor.${gid}_activity_anomaly`;
