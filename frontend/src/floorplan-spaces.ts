import {newGroup} from './model';
import type {Config,FloorplanSpace,Group} from './types';

/** Existing geometry editors work with groups; adapters never put spaces in the saved activity tree. */
const editors=new WeakMap<Config,Config>();
export function expandSpaces(config:Config):Config {
  if(!config.spaces?.length)return config;
  const cached=editors.get(config);if(cached)return cached;
  const expanded=structuredClone(config), groups=new Map<string,Group>();
  const visit=(g:Group)=>{groups.set(g.id,g);g.children.forEach(visit);};
  expanded.groups.forEach(visit);
  const unresolved:FloorplanSpace[]=[];
  for(const space of expanded.spaces??[]) {
    const parent=groups.get(space.parent_id);
    if(!parent || groups.has(space.id)){unresolved.push(space);continue;}
    const {parent_id:parentId,...geometry}=space;void parentId;
    const group={...newGroup(space.id,'area'),...geometry,geometry_only:true};
    parent.children.push(group);groups.set(space.id,group);
  }
  if(unresolved.length)expanded.spaces=unresolved;else delete expanded.spaces;
  editors.set(config,expanded);return expanded;
}
export function collapseSpaces(config:Config):Config {
  const spaces:FloorplanSpace[]=[...(config.spaces??[])];
  const visit=(groups:Group[],parent?:Group):Group[]=>groups.flatMap(group=>{
    if(group.geometry_only && parent && group.bounds) {
      spaces.push({id:group.id,name:group.name??'Space',parent_id:parent.id,bounds:group.bounds,
        ...(group.points?{points:group.points}:{}),...(group.fixtures?{fixtures:group.fixtures}:{}),
        ...(group.openings?{openings:group.openings}:{}),...(group.architecture?{architecture:group.architecture}:{})});
      return [];
    }
    return [{...group,children:visit(group.children,group)}];
  });
  const groups=visit(config.groups);
  const next={...config,groups};
  if(spaces.length)next.spaces=spaces;else delete next.spaces;
  return next;
}
