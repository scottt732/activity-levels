import { describe, expect, it } from "vitest";
import { anomalySensorId, expectedSensorId, simSwitchId } from "../src/entities";

describe("entity ids", () => {
  it("names the entities the integration creates for a group", () => {
    expect(simSwitchId("house")).toBe("switch.house_presence_simulation");
    expect(expectedSensorId("house")).toBe("sensor.house_expected_activity");
    expect(anomalySensorId("house")).toBe("sensor.house_activity_anomaly");
  });
});
