import {expect,it} from 'vitest';
import {expandSpaces,collapseSpaces} from '../src/floorplan-spaces';
import {newGroup,walkGroups} from '../src/model';
import {floorplanModel} from '../src/floorplan-model';
import {roomsConfig} from './fixtures';
it('round-trips editable geometry without adding activity groups',()=>{
 const config=roomsConfig();config.groups=[{...newGroup('floor','floor'),children:[newGroup('room','area')]}];
 config.spaces=[{id:'closet',name:'Coat closet',parent_id:'floor',bounds:[[0,0,0],[1,2,3]]}];
 const expanded=expandSpaces(config),closet=walkGroups(expanded).find(e=>e.group.id==='closet')!.group;
 expect(closet.geometry_only).toBe(true);expect(walkGroups(config).map(e=>e.group.id)).toEqual(['floor','room']);
 expect(collapseSpaces(expanded)).toEqual(config);
 const edited=structuredClone(expanded);walkGroups(edited).find(e=>e.group.id==='closet')!.group.name='Linen closet';
 const saved=collapseSpaces(edited);expect(saved.spaces![0]!.name).toBe('Linen closet');expect(saved.groups).toEqual(config.groups);
 expect(JSON.stringify(saved)).not.toContain('geometry_only');
 const model=floorplanModel(saved),part=model.parts.find(p=>p.id==='closet')!;
 expect(part.geometry_only).toBe(true);expect(part.ancestors).toEqual(['floor']);
});
