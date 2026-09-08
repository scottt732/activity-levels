import "./al-presence-card";
import "./al-presence-card-editor";

const registry = window as unknown as { customCards?: { type: string; name: string; description: string; preview: boolean }[] };
registry.customCards ??= [];
if (!registry.customCards.some(card => card.type === "activity-levels-presence-card")) {
  registry.customCards.push({ type: "activity-levels-presence-card", name: "Activity Levels Presence", description: "People and device evidence for a room or floor.", preview: true });
}

import "./al-floorplan-card";
if (!registry.customCards.some(card => card.type === "activity-levels-floorplan-card")) {
  registry.customCards.push({type:"activity-levels-floorplan-card",name:"Activity Levels Floorplan",description:"Live 3D room activity and lights, with an optional ambient display.",preview:true});
}
