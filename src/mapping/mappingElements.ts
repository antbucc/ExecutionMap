export const keyMapping = [
  { key: 'keyLP', cases: ['learningPath'], generalPoints: 100 },
  { key: 'codingKey', cases: ['VSCode'], generalPoints: 100 },
  { key: 'collaborativeKey', cases: ['Eraser'], generalPoints: 100 },
  { key: 'demo2024event', cases: ['PapyrusWeb'], generalPoints: 100 },
  { key: 'knowledgeKey', cases: ['WebApp'], generalPoints: 100 },
  { key: 'generalKey', cases: [], generalPoints: 100 },
  { key: 'challenge45Aquila2025', cases: [], generalPoints: 100 },
  { key: 'challenge23Aquila2025', cases: [], generalPoints: 100 },
];

export const mappingActivity = [
  {
    platform: ['VSCode'],
    pos: {
      x: 11,
      y: 19,
    },
  },
  {
    platform: ['WebApp'],
    pos: {
      x: 11,
      y: 31,
    },
  },
  {
    platform: ['Eraser'],
    pos: {
      x: 38,
      y: 31,
    },
  },
  {
    platform: ['PapyrusWeb'],
    pos: {
      x: 38,
      y: 19,
    },
  },
];

export const privateRooms = [
  { state: 'studyRoomState', x: 38, y: 7, door: 'wood' },
  { state: 'studyRoom2State', x: 11, y: 7, door: 'wood' },
  { state: 'privateSession1State', x: 17, y: 6, door: 'glass' },
  { state: 'privateSession2State', x: 22, y: 6, door: 'glass' },
  { state: 'privateSession3State', x: 31, y: 6, door: 'glass' },
  { state: 'privateSession4State', x: 17, y: 9, door: 'glass' },
  { state: 'privateSession5State', x: 22, y: 9, door: 'glass' },
  { state: 'privateSession6State', x: 31, y: 9, door: 'glass' },
];

export function managePrivateRoomsDisplay(name: string) {
  const room = privateRooms.find((item) => item.state == name);
  if (!room) return;
  const actualState = WA.state.loadVariable(room.state as string);
  if (!actualState) {
    WA.room.setTiles([
      {
        x: room.x,
        y: room.y + 1,
        tile: null,
        layer: 'arrows/Type1',
      },
      {
        x: room.x,
        y: room.y,
        tile: null,
        layer: 'walls/walls2',
      },
      {
        x: room.x,
        y: room.y - 1,
        tile: null,
        layer: room.door == 'wood' ? 'walls/walls2' : 'walls/wallsGlass',
      },
    ]);
  } else {
    if (room.state.includes('study')) {
      WA.room.setTiles([
        {
          x: room.x,
          y: room.y + 1,
          tile: null,
          layer: 'arrows/Type1',
        },
        {
          x: room.x,
          y: room.y - 1,
          tile: 'woodDoor2',
          layer: 'walls/walls2',
        },
        {
          x: room.x,
          y: room.y,
          tile: 'woodDoor',
          layer: 'walls/walls2',
        },
        {
          x: room.x,
          y: room.y + 1,
          tile: 'woodDoor',
          layer: 'walls/walls2',
        },
      ]);
    } else {
      WA.room.setTiles([
        {
          x: room.x,
          y: room.y + 1,
          tile: null,
          layer: 'arrows/Type1',
        },
        {
          x: room.x,
          y: room.y,
          tile: 'glassDoor',
          layer: 'walls/wallsGlass',
        },
      ]);
    }
  }
}
export function managePrivateRoomsAccess(code: string) {
  const room = privateRooms.find(
    (room) => WA.state.loadVariable(room.state as string) == code
  );
  if (!room) {
    WA.player.state.studyRoomCode = 'Error';
    console.log('check error manage');
    return;
  }

  WA.player.state.studyRoomCode = 'True';

  const actualState = WA.state.loadVariable(room.state as string);
  if (!actualState)
    WA.room.setTiles([
      {
        x: room.x,
        y: room.y + 1,
        tile: 'arrowBase',
        layer: 'arrows/Type1',
      },
      {
        x: room.x,
        y: room.y,
        tile: null,
        layer: 'walls/walls2',
      },
      {
        x: room.x,
        y: room.y - 1,
        tile: null,
        layer: room.door == 'wood' ? 'walls/walls2' : 'walls/wallsGlass',
      },
    ]);
  console.log('check display manage');
}

export function manageExit(areaName: string) {
  
  console.log('exit WA');
  const room = privateRooms.find(
    (room) => WA.state.loadVariable(room.state as string) == areaName
  );
  console.log(room+"     "+ areaName)
  if (!room) {
    WA.player.state.studyRoomCode = 'Error';
    console.log('check error manage exit');
    return;
  }
  console.log('exit');
  const actualState = WA.state.loadVariable(room.state as string);
  if (!actualState)
    WA.room.setTiles([
      {
        x: room.x,
        y: room.y,
        tile: null,
        layer: 'walls/walls2',
      },
      {
        x: room.x,
        y: room.y - 1,
        tile: null,
        layer: room.door == 'wood' ? 'walls/walls2' : 'walls/wallsGlass',
      },
    ]);
}
