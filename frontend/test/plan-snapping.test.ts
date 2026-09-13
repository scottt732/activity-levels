import {expect,it} from 'vitest';
import {newGroup} from '../src/model';
import {newOpening} from '../src/room-openings';
import {moveRoomWall,snapPlanPoint} from '../src/plan-snapping';
it('snaps shared corners before axes and constrains polygon walls to right angles',()=>{
 const corners:[number,number][][]=[[[2,3],[5,3],[5,6],[2,6]]];
 expect(snapPlanPoint([2.06,3.07],corners,.15)).toEqual([2,3]);
 expect(snapPlanPoint([4.96,3.05],corners,.15,[2,3])).toEqual([5,3]);
 expect(snapPlanPoint([4,4],corners,.1,[2,3])).toEqual([4,3]);
});
it('extends a wall to a nearby parallel boundary and carries openings without moving the neighbor',()=>{
 const room={...newGroup('r','area'),bounds:[[0,0,0],[4,4,3]] as [[number,number,number],[number,number,number]],openings:[{...newOpening('window'),position:[2,0,1] as [number,number,number]}]};
 const neighbor:[number,number][][]=[[[0,-2],[4,-2],[4,-5],[0,-5]]];
 const moved=moveRoomWall(room,0,[.5,-1.94],neighbor,.1);
 expect(moved.points).toEqual([[0,-2],[4,-2],[4,4],[0,4]]);
 expect(moved.openings![0]!.position).toEqual([2,-2,1]);
 expect(room.openings[0]!.position).toEqual([2,0,1]);
 expect(neighbor[0]![0]).toEqual([0,-2]);
});
