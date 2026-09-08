import { afterEach, expect, it, vi } from "vitest";
import { FloorplanSource } from "../src/floorplan-store";
import type { HomeAssistant } from "../src/types";
afterEach(()=>vi.useRealTimers());
it("shares polling, preserves geometry identity, retains errors and stops on unsubscribe", async()=>{
  vi.useFakeTimers();const callWS=vi.fn().mockResolvedValue({entry_id:"a",config:{groups:[]},lights:{},live:{now:1,groups:{},voices:{}}});
  const source=new FloorplanSource({callWS} as unknown as HomeAssistant), listener=vi.fn();
  const stop=source.subscribe(listener);await Promise.resolve();await Promise.resolve();
  const config=listener.mock.calls.at(-1)![0].data.config;
  callWS.mockResolvedValue({entry_id:"a",config:{groups:[]},lights:{},live:{now:2,groups:{},voices:{}}});
  await vi.advanceTimersByTimeAsync(2000);
  expect(listener.mock.calls.at(-1)![0].data.config).toBe(config);
  callWS.mockRejectedValue(new Error("offline"));await vi.advanceTimersByTimeAsync(2000);
  expect(listener.mock.calls.at(-1)![0].error).toBe("offline");
  stop();expect(vi.getTimerCount()).toBe(0);
});
