export enum Platform {
  PolyGloT = 'PolyGloT',
  VirtualStudio = 'VirtualStudio',
  Papyrus = 'Papyrus',
  WebApp = 'WebApp',
  WorkAdventure = 'WorkAdventure',
}
export enum ZoneId {
  FreeZone = 'FreeZone',
  OutsideZone = 'OutsideZone',
  SilentZone = 'SilentZone',
  LearningPathSelectionZone = 'LearningPathSelectionZone',
  InstructionWebpageZone = 'InstructionWebpageZone',
  WebAppZone = 'WebAppZone',
  MeetingRoomZone = 'MeetingRoomZone',
  PolyGloTLearningZone = 'PolyGloTLearningZone',
  PolyGloTLearningPathCreationZone = 'PolyGloTLearningPathCreationZone',
  PapyrusWebZone = 'PapyrusWebZone',
  VirtualStudioZone = 'VirtualStudioZone',
}

//Action Body
export type AnalyticsActionBody = {
  timestamp: Date;
  userId: string;
  actionType: string;
  zoneId: ZoneId;
  platform: Platform;
  action: any;
};
