/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from '@workadventure/scripting-api-extra';
import { AxiosResponse } from 'axios';
import { API, PolyglotNodeValidation } from './data/api';
import { ActionMessage } from '@workadventure/iframe-api-typings';
import { getQuest, levelUp } from '@workadventure/quests';
import {
  AnalyticsActionBody,
  GradeAction,
  Platform,
  ZoneId,
} from './types/PolyglotFlow';
import { LevelUpResponse } from '@workadventure/quests/dist/LevelUpResponse';
import {
  keyMapping,
  manageExit,
  managePrivateRoomsAccess,
  managePrivateRoomsDisplay,
  mappingActivity,
  privateRooms,
} from './mapping/mappingElements';
//import { messagesPopup } from './components/userInteraction';

console.log('Script started successfully');

let ctx: string | undefined; //to be remove after becoming obsolete, global ctx to keep tracks of this execution
//let flow: string;
let actualActivity: PolyglotNodeValidation;
let menuPopup: any;
let webSite: any = undefined;
let wrongPopup: any = undefined;
let instructionPopup: any = undefined;
//let narrativePopup: any = undefined;
let road: { x: number; y: number }[] = [{ x: 0, y: 0 }];
let roadRun: Boolean = false;
let projectIdPapy: string;
let representationPapy: string;
let triggerMessage: ActionMessage;

function closeWebsite() {
  if (webSite !== undefined) {
    webSite.close();
    webSite = undefined;
  }
}

function closeMenuPopup() {
  if (menuPopup !== undefined) {
    menuPopup.close();
    menuPopup = undefined;
  }
}

function closePopup() {
  if (wrongPopup !== undefined) {
    wrongPopup.close();
    wrongPopup = undefined;
  }
}

function closeInstruction() {
  if (instructionPopup !== undefined) {
    instructionPopup.close();
    instructionPopup = undefined;
  }
}
/*
function closeNarrative() {
  if (narrativePopup !== undefined) {
    narrativePopup.close();
    narrativePopup = undefined;
  }
}*/

function wrongAreaFunction(where: string, activity: string) {
  closePopup();
  wrongPopup = WA.ui.openPopup(
    where,
    'Wrong area, here you are able to make activity connected to ' + activity,
    [
      {
        label: 'Close',
        className: 'normal',
        callback: () => {
          // Close the popup when the "Close" button is pressed.
          closePopup();
        },
      },
    ]
  );
  setTimeout(function () {
    closePopup();
  }, 3000);
}

//async function narrativeMessage() {
/*
    let tiledMap = await WA.room.getTiledMap();
    
    // Add the new layer to the map
    tiledMap.layers.push({
      name: "bannerNarrative",
      width: 50, 
      height: 50, 
      y: 80,
      visible: true,
      opacity: 1,
      properties: [],
      type: 'tilelayer'
    });
    await WA.room.area.create({
      name: "bannerNarrative", 
      x: 10,      // X position
      y: 10,      // Y position
      width: 10,  // Width size
      height: 10, // Height size
  });
  */
//points for player interaction
//  const playerPos = await WA.player.getPosition();
//  console.log(playerPos.y);
//  const bannerPosition =
//    playerPos.y > 300 ? 'bannerNarrative2' : 'bannerNarrative1';
//
//  let narration =
//    "The city of Technopolis is falling apart. Its digital infrastructure, once the envy of the world, is now in chaos due to a centuries-old, corrupted system architecture. As an appointed Architect of Code, your task is to restore stability. But this mission is not yours alone—there are others, racing against you to solve Technopolis' problems and earn the title of Grand Architect. \nYou'll traverse a sprawling digital city using a 2D map to navigate through different rooms where critical missions await. Every room contains learning challenges related to UML Modeling and in particular Class diagrams. Along the way, you'll collect points, badges, and level up, but only the top three learners will appear on the final Leaderboard, earning the ultimate rewards.";
//  if (actualActivity) narration = actualActivity.description;
//  triggerMessage = WA.ui.displayActionMessage({
//    message: "press 'space' or click here to open the narrative",
//    callback: async () => {
//      closeInstruction();
//      narrativePopup = WA.ui.openPopup(bannerPosition, narration, [
//        {
//          label: 'Close',
//          className: 'normal',
//          callback: () => {
//            // Close the popup when the "Close" button is pressed.
//            //narrativeMessage();
//              try {
//
//                triggerMessage.remove();
//                } catch (error) {
//                  console.log(error);
//                }
//            closeNarrative();
//          },
//        },
//      ]);
//      setTimeout(function () {
//        closeInstruction();
//        //narrativeMessage();
//          try {
//
//        triggerMessage.remove();
//        } catch (error) {
//          console.log(error);
//        }
//      }, 8000);
//    },
//  });
//}

let nextPos = { x: 0, y: 0 };

function clearRoad() {
  //refactor: si potrebbe fare in modo che al posto di cancellarli tutti cancella solo il primo creato (più vicino al player) e ne aggiunge uno in fondo
  //=> codice più veloce e leggero in runtime
  let toCancel;
  do {
    toCancel = road.pop();
    if (toCancel)
      WA.room.setTiles([
        {
          x: toCancel.x,
          y: toCancel.y,
          tile: null,
          layer: 'arrows/Type2',
        },
      ]);
  } while (toCancel);
}

async function nextActivityBannerV2(areaPopup: string) {
  let platform = '';
  if (actualActivity) platform = actualActivity.platform;
  await getActualActivity(platform);
  closePopup();
  if (WA.player.state.actualFlow == '') {
    wrongPopup = WA.ui.openPopup(
      areaPopup,
      'You have no more activities to execute, go to the main console at the start of the map to choose a new Learning Path.',
      [
        {
          label: 'Close',
          className: 'normal',
          callback: () => {
            // Close the popup when the "Close" button is pressed.
            closePopup();
          },
        },
      ]
    );
    setTimeout(function () {
      closePopup();
    }, 3000);
    return;
  }
  wrongPopup = WA.ui.openPopup(
    areaPopup,
    'Your next activity is in "' +
      actualActivity.platform +
      '", go to the correct area.',
    [
      {
        label: 'Close',
        className: 'normal',
        callback: () => {
          // Close the popup when the "Close" button is pressed.
          closePopup();
        },
      },
    ]
  );
  setTimeout(function () {
    closePopup();
  }, 3000);

  mappingActivity.map((map) => {
    if (map.platform.includes(actualActivity.platform))
      nextPos = { x: map.pos.x, y: map.pos.y };
    WA.room.setTiles([
      {
        x: map.pos.x,
        y: map.pos.y,
        tile: map.platform.includes(actualActivity.platform)
          ? 'arrowBase'
          : null,
        layer: 'arrows/Type2',
      },
    ]);
  });

  let actualPos = await WA.player.getPosition();

  clearRoad();
  roadRun = true;
  actualPos = {
    x: Math.floor(actualPos.x / 33),
    y: Math.floor(actualPos.y / 33),
  };

  let i = 0; //debugger
  let again;
  if (nextPos.x != 0)
    do {
      i++;
      again =
        Math.abs(actualPos.y - nextPos.y) < 3 &&
        Math.abs(actualPos.x - nextPos.x) < 3
          ? false
          : true;

      if (Math.abs(actualPos.y - nextPos.y) > 1) {
        const tilePosX = actualPos.x;
        const tilePosY = actualPos.y + (actualPos.y < nextPos.y ? 2 : -2);

        WA.room.setTiles([
          {
            x: tilePosX,
            y: tilePosY,
            tile: 'pointerBase',
            layer: 'arrows/Type2',
          },
        ]);
        road.push({ x: tilePosX, y: tilePosY });
        actualPos = { x: tilePosX, y: tilePosY };
      } else if (Math.abs(actualPos.x - nextPos.x) > 1) {
        const tilePosX = actualPos.x + (actualPos.x < nextPos.x ? 2 : -2);
        const tilePosY = actualPos.y;

        WA.room.setTiles([
          {
            x: tilePosX,
            y: tilePosY,
            tile: 'pointerBase',
            layer: 'arrows/Type2',
          },
        ]);
        road.push({ x: tilePosX, y: tilePosY });
        actualPos = { x: tilePosX, y: tilePosY };
      }
    } while (again && i < 20);
}
/*
let startingMeetingTime: Date;

WA.player.proximityMeeting.onJoin().subscribe(async () => {
  startingMeetingTime = new Date();
});

WA.player.proximityMeeting.onLeave().subscribe(async () => {
  const endMeetingTime = new Date();
  const milliDiff: number =
    endMeetingTime.getTime() - startingMeetingTime.getTime();

  const totalPoints = Math.floor(Math.floor(milliDiff / 1000) / 60) * 10;
  const keyEvent =
    WA.player.state.actualFlow == '6c7867a1-389e-4df6-b1d8-68250ee4cacb'
      ? 'challenge45Aquila2025'
      : 'challenge23Aquila2025';
  if (
    WA.player.state.actualFlow == '6c7867a1-389e-4df6-b1d8-68250ee4cacb' ||
    WA.player.state.actualFlow == '6614ff6b-b7eb-423d-b896-ef994d9af097'
  )
    levelUp(keyEvent, totalPoints);
});
*/
/*
function debounce(func: (...args: any[]) => void, timeout = 2000) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), timeout);
  };
}

function saveInput() {
  const keyEvent =
    WA.player.state.actualFlow == '6c7867a1-389e-4df6-b1d8-68250ee4cacb'
      ? 'challenge45Aquila2025'
      : 'challenge23Aquila2025';
  if (
    WA.player.state.actualFlow == '6c7867a1-389e-4df6-b1d8-68250ee4cacb' ||
    WA.player.state.actualFlow == '6614ff6b-b7eb-423d-b896-ef994d9af097'
  )
    levelUp(keyEvent, 1);
}

const processChange = debounce(saveInput, 3000);*/

WA.player.onPlayerMove(async () => {
  //processChange();

  if (nextPos.x == 0) return; //means has no next edge
  if (!roadRun) return; //no display needed
  clearRoad();

  let actualPos = await WA.player.getPosition();
  actualPos = {
    x: Math.floor(actualPos.x / 33),
    y: Math.floor(actualPos.y / 33) - 1,
  };
  let i = 0; //debugger
  let again;
  if (nextPos.x != 0)
    do {
      i++;
      again =
        Math.abs(actualPos.y - nextPos.y) < 3 &&
        Math.abs(actualPos.x - nextPos.x) < 3
          ? false
          : true;

      if (Math.abs(actualPos.y - nextPos.y) > 1) {
        const tilePosX = actualPos.x;
        const tilePosY = actualPos.y + (actualPos.y < nextPos.y ? 2 : -2);
        WA.room.setTiles([
          {
            x: tilePosX,
            y: tilePosY,
            tile: 'pointerBase',
            layer: 'arrows/Type2',
          },
        ]);
        road.push({ x: tilePosX, y: tilePosY });
        actualPos = { x: tilePosX, y: tilePosY };
      } else if (Math.abs(actualPos.x - nextPos.x) > 1) {
        const tilePosX = actualPos.x + (actualPos.x < nextPos.x ? 2 : -2);
        const tilePosY = actualPos.y;

        WA.room.setTiles([
          {
            x: tilePosX,
            y: tilePosY,
            tile: 'pointerBase',
            layer: 'arrows/Type2',
          },
        ]);
        road.push({ x: tilePosX, y: tilePosY });
        actualPos = { x: tilePosX, y: tilePosY };
      }
    } while (again && i < 20);
});

function registerAnalyticsAction<T extends AnalyticsActionBody>(
  action: T
): void {
  if ('actionType' in action) {
    switch (action.actionType) {
      case 'gradeAction':
        if (!('flow' in action.action && 'grade' in action.action)) {
          throw new Error('Invalid GradeAction structure');
        }
        break;
      default:
        throw new Error(`Unknown actionType: ${action.actionType}`);
    }
  }
  API.registerAction(action);
}

async function getActualActivity(playerPlatform: string) {
  //per mondo execution
  try {
    if (!ctx) throw 'No ctx detected';
    await API.getActualNode({ ctxId: ctx })
      .then(async (response) => {
        if (actualActivity)
          if (
            (response.data as PolyglotNodeValidation).platform !=
            actualActivity.platform
          ) {
            //activity completed
            /*const keyEvent =
              WA.player.state.actualFlow ==
              '6c7867a1-389e-4df6-b1d8-68250ee4cacb'
                ? 'challenge45Aquila2025'
                : 'challenge23Aquila2025';
            if (
              WA.player.state.actualFlow ==
                '6c7867a1-389e-4df6-b1d8-68250ee4cacb' ||
              WA.player.state.actualFlow ==
                '6614ff6b-b7eb-423d-b896-ef994d9af097'
            )
              levelUp(keyEvent, 100);*/
            if (actualActivity.platform == 'PapyrusWeb' && projectIdPapy) {
              const points = (await API.userPapyPoints(projectIdPapy)).data;
              const index = (points.Grade as string).indexOf(' out');
              const grade = parseInt(
                (points.Grade as string).substring(0, index)
              );
              console.log(grade);
              await levelUp('demo2024event', grade * 10)
                .then(async (response: LevelUpResponse) => {
                  console.log(response);
                  if (response.awardedBadges != null)
                    await levelUp(
                      'generalKey',
                      keyMapping.find((map) => map.key == 'demo2024event')
                        ?.generalPoints ?? 0
                    );
                })
                .catch((e) => console.log(e));
            } else {
              try {
                await levelUp(
                  keyMapping.find((map) =>
                    map.cases.includes(actualActivity.platform)
                  )?.key ?? '',
                  50
                )
                  .then(async (response: LevelUpResponse) => {
                    if (response.awardedBadges != null)
                      await levelUp(
                        'generalKey',
                        keyMapping.find((map) =>
                          map.cases.includes(actualActivity.platform)
                        )?.generalPoints ?? 0
                      );
                  })
                  .catch((e) => console.log(e));
              } catch (error) {
                console.log(error);
              }
            }
          }
        actualActivity = response.data;
        if (
          !actualActivity.validation[0] &&
          playerPlatform == actualActivity.platform
        ) {
          //LP completed
          /*const keyEvent =
            WA.player.state.actualFlow == '6c7867a1-389e-4df6-b1d8-68250ee4cacb'
              ? 'challenge45Aquila2025'
              : 'challenge23Aquila2025';
          if (
            WA.player.state.actualFlow ==
              '6c7867a1-389e-4df6-b1d8-68250ee4cacb' ||
            WA.player.state.actualFlow == '6614ff6b-b7eb-423d-b896-ef994d9af097'
          )
            await levelUp(keyEvent, 100).catch((e) => console.log(e));*/
          const action: GradeAction = {
            timestamp: new Date(),
            userId: WA.player.name,
            actionType: 'GradeAction',
            zoneId: ZoneId.FreeZone,
            platform: Platform.WorkAdventure,
            action: {
              flow: 'test',
              grade: 5,
            },
          };
          registerAnalyticsAction(action);

          WA.player.state.actualFlow = '';
          ctx = undefined;
        }
      })
      .catch(async (error: any) => {
        console.log(error);
        if (error.response.status)
          if (error.response.status == 400) {
            //means the educator resetted the player context
            console.log('ctx reset');

            console.log(String(WA.player.state.actualFlow));
            await startActivity(String(WA.player.state.actualFlow)).then(
              async () => {
                await getActualActivity('reset');
              }
            );
            return;
          }
        console.error(
          'Error:',
          error.response.status,
          error.response.statusText
        );
        throw new Error(`HTTP error! Status: ${error.response.status}`);
      });
  } catch (error: any) {
    // Handle network errors or other exceptions
    console.error('Error:', error);
    throw error; // Rethrow the error for the caller to handle
  }
}

async function startActivity(flowId: string): Promise<any> {
  try {
    const username = WA.player.playerId.toString();
    const response: AxiosResponse = await API.startExecution({
      flowId,
      username,
    });
    // Handle error responses
    if (response.status != 200) {
      console.error('Error:', response.status, response.statusText);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    ctx = response.data.ctx;
    let flowsUser = WA.player.state.flows as [any];

    if (flowsUser != undefined)
      if (
        (flowsUser as [{ flowId: string; ctx: string }]).find((flow) => {
          if (flow != null) return flowId == flow.flowId;
          return false;
        })
      )
        flowsUser.find((flow) => {
          if (flow) return flowId == flow.flowId;
          return false;
        }).ctx = ctx;
      //update ctx of a already started LP
      else flowsUser[flowsUser.length + 1] = { flowId: flowId, ctx: ctx };
    //add the new flowId and ctx to the array
    else flowsUser = [{ flowId: flowId, ctx: ctx }]; //case where there are no ctx-> create the first one

    WA.player.state.flows = flowsUser;
    return;
  } catch (error) {
    // Handle network errors or other exceptions
    console.error('Error:', error);
    throw error; // Rethrow the error for the caller to handle
  }
}

// Waiting for the API to be ready
WA.onInit()
  .then(async () => {
    WA.player.state.sectorName = 'EntryPoint';
    console.log('Scripting API ready');
    privateRooms.map((rooms) => managePrivateRoomsDisplay(rooms.state));
    WA.room.website.create({
      name: 'logo',
      url: './images/solo_logo_32.png',
      position: {
        x: 606,
        y: 1520,
        width: 64,
        height: 64,
      },
      visible: true,
      origin: 'map',
      scale: 1,
    });
    console.log('playerid:' + WA.player.playerId);
    WA.room.website.create({
      name: 'scritta',
      url: './images/solo_scritta_32.png',
      position: {
        x: 960,
        y: 1520,
        width: 418,
        height: 64,
      },
      visible: true,
      origin: 'map',
      scale: 1,
    });
    //disable until rooms working
    
    /*WA.ui.website.open({
      url: 'http://localhost:3000/gamifiedUI',
      allowApi: true,
      position: {
        vertical: 'top',
        horizontal: 'right',
      },
      size: {
        height: 'auto',
        width: 'min(300px, 90vw)',
      },
      visible: true,
    });*/
    //narrativeMessage();
    WA.room.area.onLeave('Outside').subscribe(async () => {
      WA.room.showLayer('roof');
      nextPos = { x: 0, y: 0 };
      let toCancel;
      do {
        toCancel = road.pop();
        if (toCancel)
          WA.room.setTiles([
            {
              x: toCancel.x,
              y: toCancel.y,
              tile: null,
              layer: 'arrows/Type2',
            },
          ]);
      } while (toCancel);
    });

    WA.room.area.onLeave('Outside2').subscribe(async () => {
      WA.room.showLayer('roof');
      nextPos = { x: 0, y: 0 };
      let toCancel;
      do {
        toCancel = road.pop();
        if (toCancel)
          WA.room.setTiles([
            {
              x: toCancel.x,
              y: toCancel.y,
              tile: null,
              layer: 'arrows/Type2',
            },
          ]);
      } while (toCancel);
    });

    WA.room.area.onEnter('Entry').subscribe(async () => {
      try {
        WA.room.hideLayer('roof');
        closeInstruction();

        if (!WA.player.state.actualFlow) {
          WA.room.setTiles([
            {
              x: 37,
              y: 40,
              tile: 'arrowBase',
              layer: 'arrows/Type1',
            },
          ]);
          instructionPopup = WA.ui.openPopup(
            'EntryBanner',
            'You have not selected a Learning Path, please go to the menu area to choose a path.',
            [
              {
                label: 'Close',
                className: 'normal',
                callback: () => {
                  // Close the popup when the "Close" button is pressed.
                  closeInstruction();
                },
              },
            ]
          );
          setTimeout(function () {
            closeInstruction();
          }, 3000);
          return;
        }

        //@ts-ignore
        const flowsUser = WA.player.state.flows;

        if (flowsUser != undefined)
          if (
            (flowsUser as [{ flowId: string; ctx: string }]).find(
              (flow: { flowId: string }) =>
                flow?.flowId == WA.player.state.actualFlow
            ) != undefined
          ) {
            ctx = (flowsUser as [{ flowId: string; ctx: string }]).find(
              (flow: { flowId: string }) =>
                flow?.flowId == WA.player.state.actualFlow
            )!.ctx;
            console.log('ctx already created, continue activity');
            nextActivityBannerV2('EntryBanner');
            return;
          }
        console.log('starting activity');
        await startActivity(String(WA.player.state.actualFlow));

        await getActualActivity('EntryBanner');

        nextActivityBannerV2('EntryBanner');
        //fine per mondo execution
      } catch (error) {
        // Handle errors if the API call fails
        console.error('Failed to get API response:', error);
      }
    });

    WA.room.area.onEnter('Entry2').subscribe(async () => {
      try {
        WA.room.hideLayer('roof');
        closeInstruction();
        if (!WA.player.state.actualFlow) {
          WA.room.setTiles([
            {
              x: 37,
              y: 40,
              tile: 'arrowBase',
              layer: 'arrows/Type1',
            },
          ]);
          instructionPopup = WA.ui.openPopup(
            'instructions',
            'You have not selected a Learning Path, please go to the menu area to choose a path.',
            [
              {
                label: 'Close',
                className: 'normal',
                callback: () => {
                  // Close the popup when the "Close" button is pressed.
                  closeInstruction();
                },
              },
            ]
          );
          setTimeout(function () {
            closeInstruction();
          }, 3000);
          return;
        }
      } catch (error) {
        // Handle errors if the API call fails
        console.error('Failed to get API response:', error);
      }
    });

    WA.room.area.onEnter('FlowsMenu').subscribe(async () => {
      try {
        WA.room.setTiles([
          {
            x: 37, // da cambiare per mondo execution
            y: 40,
            tile: null,
            layer: 'arrows/Type1',
          },
        ]);
        clearRoad();
        roadRun = false;
        menuPopup = await WA.ui.openPopup(
          'MenuBanner',
          'Here you can choose which learning path you want to do, access the console to see the possibilities',
          [
            {
              label: 'Close',
              className: 'normal',
              callback: () => {
                // Close the popup when the "Close" button is pressed.
                closeMenuPopup();
              },
            },
          ]
        );
        setTimeout(function () {
          closeMenuPopup();
        }, 3000);
        closeWebsite();
        webSite = await WA.nav.openCoWebSite(
          //@ts-ignore
          import.meta.env.VITE_WEBAPP_URL + '/flowMenu',
          true,
          undefined,
          55
        );
        //open a timed popup to send the user to the right location
      } catch (error) {
        // Handle errors if the API call fails
      }
    });
    WA.room.area.onLeave('FlowsMenu').subscribe(async () => {
      //wrongAreaPopup.close();
      await startActivity(String(WA.player.state.actualFlow));

      await getActualActivity('MenuBanner');

      nextActivityBannerV2('MenuBanner');
      closeWebsite();
    });

    WA.room.area.onEnter('activityManager').subscribe(async () => {
      try {
        //put the disable of the roof
        menuPopup = WA.ui.openPopup(
          'MenuBanner',
          'Here you can choose which learning path you want to do, access the console to see the possibilities',
          [
            {
              label: 'Close',
              className: 'normal',
              callback: () => {
                // Close the popup when the "Close" button is pressed.
                closeMenuPopup();
              },
            },
          ]
        );
        setTimeout(function () {
          closeMenuPopup();
        }, 3000);

        closeWebsite();
        webSite = await WA.nav.openCoWebSite(
          //@ts-ignore
          import.meta.env.VITE_FRONTEND_URL + '/waEducator',
          true,
          undefined,
          55
        );
        //open a timed popup to send the user to the right location
      } catch (error) {
        // Handle errors if the API call fails
      }
    });
    WA.room.area.onLeave('activityManager').subscribe(async () => {
      //wrongAreaPopup.close();
      closeWebsite();
    });

    // creativeArea
    WA.room.area.onEnter('creativeArea').subscribe(async () => {
      // If you need to send data from the first call
      try {
        wrongPopup = WA.ui.openPopup(
          'CreativeBanner',
          'This room is a creative area, here you can access the Learning Path editor to create your personal path',
          [
            {
              label: 'Close',
              className: 'normal',
              callback: () => {
                // Close the popup when the "Close" button is pressed.
                closePopup();
              },
            },
          ]
        );
        setTimeout(function () {
          closePopup();
        }, 3000);
        closeWebsite();

        webSite = await WA.nav.openCoWebSite(
          //@ts-ignore
          import.meta.env.VITE_FRONTEND_URL + '/flows',
          true,
          undefined,
          55
        );
      } catch (error) {
        // Handle errors if the API call fails
        console.error('Failed to get API response:', error);
      }
    });

    WA.room.area.onLeave('creativeArea').subscribe(async () => {
      //wrongAreaPopup.close();
      nextActivityBannerV2('BannerA5');
      closeWebsite();
    });

    WA.room.area.onEnter('instructions').subscribe(() => {
      try {
        try {
          triggerMessage.remove();
        } catch (error) {
          console.log(error);
        }
        triggerMessage = WA.ui.displayActionMessage({
          message:
            "press 'space' or click here to open the instruction WebPage",
          callback: async () => {
            closeWebsite();
            webSite = await WA.nav.openCoWebSite(
              //@ts-ignore
              import.meta.env.VITE_WEBAPP_URL +
                '/flowShower/' +
                WA.player.state.actualFlow,
              true,
              undefined,
              55
            );
          },
        });
      } catch (error) {
        console.log(error);
      }
    });

    WA.room.area.onLeave('instructions').subscribe(async () => {
      try {
        triggerMessage.remove();
      } catch (error) {
        console.log(error);
      }
      //narrativeMessage();
      closeWebsite();
    });

    WA.room.area.onEnter('instructions2').subscribe(() => {
      try {
        try {
          triggerMessage.remove();
        } catch (error) {
          console.log(error);
        }
        triggerMessage = WA.ui.displayActionMessage({
          message:
            "press 'space' or click here to open the instruction WebPage",
          callback: async () => {
            closeWebsite();
            webSite = await WA.nav.openCoWebSite(
              //@ts-ignore
              import.meta.env.VITE_WEBAPP_URL +
                '/flowShower/' +
                WA.player.state.actualFlow,
              true,
              undefined,
              55
            );
          },
        });
      } catch (error) {
        console.log(error);
      }
    });

    WA.room.area.onLeave('instructions2').subscribe(async () => {
      try {
        triggerMessage.remove();
      } catch (error) {
        console.log(error);
      }
      //narrativeMessage();
      closeWebsite();
    });

    WA.player.state.onVariableChange('actualFlow').subscribe(() => {
      if (WA.player.state.actualFlow == 'null') WA.state.door = false;
      closeWebsite();
      closeMenuPopup();
      menuPopup = WA.ui.openPopup(
        'MenuBanner',
        WA.player.state.actualFlow
          ? 'Path successfully chosen — enter the school zone to begin'
          : 'Path selection removed, enjoy your staying and come back whenever you want to start a new journey.',
        [
          {
            label: 'Close',
            className: 'normal',
            callback: () => {
              // Close the popup when the "Close" button is pressed.
              closeMenuPopup();
            },
          },
        ]
      );
      setTimeout(function () {
        closeMenuPopup();
      }, 3000);

      return;
    });

    WA.player.state.onVariableChange('platform').subscribe((value) => {
      if (value != 'WebApp') {
        closeWebsite();
        nextActivityBannerV2('BannerA1');
      }
      return;
    });

    //per mondo execution
    WA.room.area.onEnter('PolyGloTWebAppTool').subscribe(async () => {
      try {
        if (actualActivity.platform != 'WebApp') {
          wrongAreaFunction('BannerPolyGloTWebAppTool', 'WebApp');
          return;
        }
        clearRoad();
        roadRun = false;
        const URL =
          //@ts-ignore
          import.meta.env.VITE_WEBAPP_URL + '/tools/' + ctx;

        closeWebsite();
        webSite = await WA.nav.openCoWebSite(URL, true);
        //open a timed popup to send the user to the right location
      } catch (error) {
        // Handle errors if the API call fails
      }
    });

    WA.room.area.onLeave('PolyGloTWebAppTool').subscribe(async () => {
      closeWebsite();
      nextActivityBannerV2('BannerPolyGloTWebAppTool');
    });

    //per mondo execution
    // generic tool space
    WA.room.area.onEnter('PapyrusWebTool').subscribe(async () => {
      // If you need to send data from the first call
      try {
        if (actualActivity.platform != 'PapyrusWeb') {
          wrongAreaFunction('BannerPapyrusWebTool', 'PapyrusWeb');
          return;
        }

        clearRoad();
        roadRun = false;
        const waitingPopup = WA.ui.openPopup(
          'BannerPapyrusWebTool',
          'Loading your assignment inside PapyrusWeb, wait a moment',
          []
        );
        setTimeout(function () {
          waitingPopup.close();
        }, 3000);

        await API.createAssigmentPapyrus({
          ctxId: ctx || '',
          assignment_id: actualActivity.data.idUML,
          nomeUtente: WA.player.name,
        })
          .then(async (response) => {
            projectIdPapy = response.data.project_id;
            representationPapy = response.data.representation_id;

            closeWebsite();
            webSite = await WA.nav.openCoWebSite(
              'https://papygame.tech/projects/' +
                projectIdPapy +
                '/edit/' +
                representationPapy +
                '?ctxId=' +
                ctx,
              true
            );
          })
          .catch(async (error: any) => {
            console.log(error);
            throw new Error(`HTTP error! Status: ${error.response.status}`);
          });
      } catch (error) {
        // Handle errors if the API call fails
        console.error('Failed to get API response:', error);
      }
    });

    WA.room.area.onLeave('PapyrusWebTool').subscribe(async () => {
      closeWebsite();
      nextActivityBannerV2('BannerPapyrusWebTool');
    });

    // ACTIVITY TYPE 3
    WA.room.area.onEnter('CollaborativeTool').subscribe(async () => {
      // If you need to send data from the first call
      try {
        if (
          actualActivity.platform != 'Collaborative' &&
          actualActivity.platform != 'Eraser'
        ) {
          wrongAreaFunction('BannerCollaborativeTool', 'CollaborativeTool');
          return;
        }

        clearRoad();
        roadRun = false;

        const collaborativeAssignemt = WA.ui.openPopup(
          'BannerCollaborativeTool',
          actualActivity.data.assignment ||
            'Draw some comments and suggestions =D',
          [
            {
              label: 'Close',
              className: 'normal',
              callback: () => {
                // Close the popup when the "Close" button is pressed.
                collaborativeAssignemt.close();
              },
            },
          ]
        );
        closeWebsite();
        webSite = await WA.nav.openCoWebSite(
          'https://app.eraser.io/workspace/JVoolrO5JJucnQkr1tK7?origin=share',
          true
        );
      } catch (error) {
        // Handle errors if the API call fails
        console.error('Failed to get API response:', error);
      }
    });

    WA.room.area.onLeave('CollaborativeTool').subscribe(async () => {
      if (
        (!ctx && actualActivity.platform == 'Collaborative') ||
        actualActivity.platform == 'Eraser'
      ) {
        const satisfiedConditions = actualActivity.validation.filter(
          (validation) => validation.data.conditionKind == 'pass'
        );
        const satisfiedConditionsId = satisfiedConditions.map(
          (item) => item.id
        );
        await API.getNextNode({
          ctxId: ctx || '',
          satisfiedConditions: satisfiedConditionsId,
        });
      }
      nextActivityBannerV2('BannerCollaborativeTool');
      closeWebsite();
    });

    // ACTIVITY TYPE 4
    WA.room.area.onEnter('VSCodeTool').subscribe(async () => {
      // If you need to send data from the first call
      try {
        if (actualActivity.platform != 'VSCode') {
          wrongAreaFunction('BannerVSCodeTool', 'VSCode');
          return;
        }

        clearRoad();
        roadRun = false;

        closePopup();
        WA.ui.openPopup(
          'BannerVSCodeTool',
          'Your next activity is coding assessment. Click Open Notebook to open the notebook directly on your VSCode Editor',
          [
            {
              label: 'Open Notebook',
              className: 'normal',
              callback: () => {
                // Close the popup when the "Close" button is pressed.
                WA.nav.openTab(
                  'vscode://ms-dotnettools.dotnet-interactive-vscode/openNotebook?url=' + //@ts-ignore
                    import.meta.env.VITE_BACK_URL +
                    '/api/flows/' +
                    ctx +
                    '/run/notebook.dib'
                );
              },
            },
            {
              label: 'Close',
              className: 'normal',
              callback: (popup) => {
                // Close the popup when the "Close" button is pressed.
                popup.close();
              },
            },
          ]
        );

        triggerMessage = WA.ui.displayActionMessage({
          message:
            "press 'space' or click here to open the instruction WebPage",
          callback: async () => {
            window.open(
              'vscode://ms-dotnettools.dotnet-interactive-vscode/openNotebook?url=' + //@ts-ignore
                import.meta.env.VITE_BACK_URL +
                '/api/flows/' +
                ctx +
                '/run/notebook.dib',
              '_blank'
            );
          },
        });
      } catch (error) {
        // Handle errors if the API call fails
        console.error('Failed to get API response:', error);
      }
    });

    WA.room.area.onLeave('VSCodeTool').subscribe(async () => {
      nextActivityBannerV2('BannerVSCodeTool');
    });

    //cheat way to remove point from the player
    WA.room.area.onEnter('cleaningArea').subscribe(() => {
      try {
        triggerMessage = WA.ui.displayActionMessage({
          message:
            "Attention, if you press 'space' or click here to clean your points",
          callback: async () => {
            keyMapping.map(async (item) => {
              const playerQuest = await getQuest(item.key);
              if (playerQuest) await levelUp(item.key, -playerQuest.xp);
            });
            console.log('Points removed from the player');
          },
        });

        return;
      } catch (error) {
        console.log(error);
      }
    });

    WA.room.area.onLeave('cleaningArea').subscribe(async () => {
      try {
        triggerMessage.remove();
      } catch (error) {
        console.log(error);
      }
      closeWebsite();
    });

    //studyRooms
    //domanda da fare:
    //?????????????????????????????????????????????????????????
    //appesantisce tanto il runtime mettere un listener per ogni state?
    //alternativa fare una variabile array string che contiene tutte gli stati
    //WA.state.onVariableChange('studyRoomCodesState').subscribe((value) => {
    //  managePrivateRoomsDisplay(value as string);
    //});

    WA.room.area.onEnter('StudyArea').subscribe(async () => {
      try {
        console.log('last sectorName Enter ' + WA.player.state.sectorName);
        WA.player.state.sectorName = 'StudyArea';
        console.log('new sectorName Enter ' + WA.player.state.sectorName);
        return;
      } catch (error) {
        console.log(error);
      }
    });
    WA.room.area.onLeave('StudyArea').subscribe(async () => {
      try {
        console.log('studyarea leave');
        WA.player.state.sectorName = 'other';
        return;
      } catch (error) {
        console.log(error);
      }
    });
    //handler for access of players
    //sbagliato ragiona nell'accesso null quando uno entra -> tramite UI cambia in un codice-> stateUpdate -> capire l'uscita
    WA.state.onVariableChange('studyRoomState').subscribe(() => {
      managePrivateRoomsDisplay('studyRoomState');
    });
    WA.state.onVariableChange('studyRoom2State').subscribe(() => {
      managePrivateRoomsDisplay('studyRoom2State');
    });
    WA.state.onVariableChange('privateSession1State').subscribe(() => {
      managePrivateRoomsDisplay('privateSession1State');
    });
    WA.state.onVariableChange('privateSession2State').subscribe(() => {
      managePrivateRoomsDisplay('privateSession1State');
    });
    WA.state.onVariableChange('privateSession3State').subscribe(() => {
      managePrivateRoomsDisplay('privateSession1State');
    });
    WA.state.onVariableChange('privateSession4State').subscribe(() => {
      managePrivateRoomsDisplay('privateSession1State');
    });
    WA.state.onVariableChange('privateSession5State').subscribe(() => {
      managePrivateRoomsDisplay('privateSession1State');
    });
    WA.state.onVariableChange('privateSession6State').subscribe(() => {
      managePrivateRoomsDisplay('privateSession1State');
    });

    WA.player.state.onVariableChange('studyRoomCode').subscribe((value) => {
      if (value == 'Error' || value == 'True') return;
      if (value == 'Exit'){
        console.log(WA.player.state.sectorName);
        manageExit((WA.player.state.sectorName as string) || '');return}
      managePrivateRoomsAccess(value as string);
    });

    WA.room.area.onEnter('StudyRoom').subscribe(async () => {
      try {
        managePrivateRoomsDisplay('studyRoomState');
        WA.player.state.sectorName = 'studyRoomState';
        return;
      } catch (error) {
        console.log(error);
      }
    });
    WA.room.area.onLeave('StudyRoom').subscribe(async () => {
      try {
        WA.player.state.sectorName = 'StudyArea';
        return;
      } catch (error) {
        console.log(error);
      }
    });
    WA.room.area.onEnter('privateSession1').subscribe(async () => {
      try {
        WA.player.state.sectorName = 'privateSession1State';
        WA.player.state.studyRoomCode = WA.state.privateSession1State;
        managePrivateRoomsDisplay('privateSession1State');
        return;
      } catch (error) {
        console.log(error);
      }
    });

    //back to entryPoint
    WA.room.area.onEnter('GoToEntryPoint').subscribe(() => {
      try {
        WA.nav.goToRoom('https://play.workadventu.re/@/fondazione-bruno-kessler/encore/entrypoint'); //addURL for EntryPoint
        return;
      } catch (error) {
        console.log(error);
      }
    });

    // The line below bootstraps the Scripting API Extra library that adds a number of advanced properties/features to WorkAdventure
    bootstrapExtra()
      .then(() => {
        console.log('Scripting API Extra ready');
      })
      .catch((e) => console.error(e));
  })
  .catch((e) => console.error(e));

export {};
