const AiManager = {
  knowledge: [],
  path: [],
  foundLoop: false,
  foundWumpus: false,
  foundGold: false,
  recommendedMove: {},

  initialize: (x, y, width, height) => {
    AiManager.knowledge = [];
    AiManager.path = [];
    AiManager.foundWumpus = false;
    AiManager.foundGold = false;
    AiManager.foundLoop = false;
    AiManager.recommendedMove = {};

    for (let y=0; y<height; y++) {
      const row = [];

      for (let x=0; x<width; x++) {
        row.push({ x, y, visited: 0, pit: 0, wumpus: 0, gold: 0 });
      }

      AiManager.knowledge.push(row);
    }
  },

  update: (x, y, room) => {
    // Adds perceptions about this room to the knowledge base.
    if (room) {
      // Check percepts.
      if (room.includes(WumpusManager.constants.breeze)) {
        AiManager.knowledge[y][x].breeze = true;
      }

      if (room.includes(WumpusManager.constants.stench)) {
        AiManager.knowledge[y][x].stench = true;
      }

      if (room.includes(WumpusManager.constants.glitter)) {
        AiManager.knowledge[y][x].glitter = true;
      }

      // Deduce knowledge about adjacent rooms.
      AiManager.deduce(x, y);

      // Set this room as visited and safe.
      AiManager.knowledge[y][x].visited = AiManager.knowledge[y][x].visited ? AiManager.knowledge[y][x].visited + 1 : 1;
      AiManager.knowledge[y][x].pit = 0;
      AiManager.knowledge[y][x].wumpus = 0;
      AiManager.knowledge[y][x].gold = 0;

      // Choose the next move.
      AiManager.recommendedMove = AiManager.move(x, y);

      /*if (AiManager.recommendedMove.knowledge.visited > 1) {
        !AiManager.foundLoop && console.log('Risky business!');
        AiManager.foundLoop = true;
      }
      else if (!AiManager.recommendedMove.knowledge.visited) {
        AiManager.foundLoop && console.log('Playing it safe.');
        AiManager.foundLoop = false;
      }*/

      return AiManager.recommendedMove;
    }
  },

  deduce: (x, y) => {
    // Updates adjacent rooms with knowledge.
    const knowledge = AiManager.knowledge[y][x];
    AiManager.think(x, y - 1, knowledge);
    AiManager.think(x + 1, y, knowledge);
    AiManager.think(x, y + 1, knowledge);
    AiManager.think(x - 1, y, knowledge);
  },

  think: (x, y, knowledge) => {
    // x,y = adjacent room to think about.
    // knowledge = perceptions from the current room
    let adjRoom;

    // If this is the first time we've entered this room, update knowledge for adjacent rooms.
    if (x >= 0 && x < AiManager.knowledge[0].length && y >= 0 && y < AiManager.knowledge.length && !knowledge.visited) {
      adjRoom = AiManager.knowledge[y][x];

      if (knowledge.breeze && !adjRoom.visited) {
        adjRoom.pit += 0.25;
      }

      if (!knowledge.breeze) {
        // If the room has no breeze, update all adjacent rooms to set pit to 0.
        AiManager.knowledge[y][x].pit = 0;
      }

      if (knowledge.stench) {
        if (!adjRoom.visited && !AiManager.foundWumpus) {
          adjRoom.wumpus += 0.25;
          if (adjRoom.wumpus >= 0.5) {
            AiManager.foundWumpus = true;

            // We found the wumpus room. Find all adjacent rooms and update their adjacent rooms to no wumpus (except for adjRoom, which of course, has the wumpus).
            const adjRooms = AiManager.availableRooms(adjRoom.x, adjRoom.y);
            // Go through each adjacent room of the wumpus, where we would perceive a stench.
            adjRooms.forEach(room => {
              // Find all adjacent rooms to the stench and set wumpus to 0, except for adjRoom, which is the actual wumpus.
              const adjRooms2 = AiManager.availableRooms(room.x, room.y);
              adjRooms2.forEach(room2 => {
                if (room2.x !== adjRoom.x && room2.y !== adjRoom.y) {
                  AiManager.knowledge[room2.y][room2.x].wumpus = 0;
                }
              })
            });
          }
        }
      }
      else {
        // No stench in the originating room, so all adjacent rooms will not be the wumpus.
        AiManager.knowledge[adjRoom.y][adjRoom.x].wumpus = 0;
      }

      if (knowledge.glitter && !adjRoom.visited) {
        adjRoom.gold += 0.25;

        // Did we find the gold?
        AiManager.foundGold = AiManager.foundGold || (adjRoom.gold >= 0.5 ? {x, y} : false);
        if (AiManager.foundGold) {
          // Since there is only 1 gold, we can now eliminate all other gold probabilities.
          for (let ry=0; ry<AiManager.knowledge.length; ry++) {
            for (let rx=0; rx<AiManager.knowledge[ry].length; rx++) {
              // Set all other gold probabilities to 0.
              AiManager.knowledge[ry][rx].gold = AiManager.knowledge[ry][rx].gold >= 0.5 ? AiManager.knowledge[ry][rx].gold : 0;
            }
          };
        }
      }
    }

    return adjRoom;
  },

  move: (x, y) => {
    // Determines the next best move from starting point x, y.
    /*
    Rules:
    R = Room, P = Pit, W = Wumpus, T = Treasure
    B = Breeze, S = Stench, G = Glitter, O = OK

    Adj(R)^B(R) => P(R)
    Adj(R)^S(R) => W(R)
    Adj(R)^G(R) => T(R)
    !P(R)^!W(R) => O(R)

    Example: Is R(2,1) safe?

    Satisfy: O(R21) = True

    !P(R)^!W(R) => O(R21)
    !(Adj(R)^B(R)) ^ !(Adj(R)^S(R)) => O(R21)

    ^^ This will check all adjacent rooms for breeze or stench. If none, the room is OK.
    Additionally, when a loop is detected in AI hints, we relax the logical constraints to take more risky moves.
    */
    let room;

    const rooms = AiManager.availableRooms(x, y);

    // Does a room contain a probability of gold > 0? Select the highest probability room.
    //room = rooms.filter(room => room.knowledge.gold && room.knowledge.gold === Math.max(...rooms.map(room => room.knowledge.gold)) && (room.knowledge.gold >= 0.5 || (!AiManager.foundLoop ? (!room.knowledge.pit && !room.knowledge.wumpus) : (room.knowledge.pit < 0.5 && room.knowledge.wumpus < 0.5))))[0];
    room = rooms.filter(room => room.knowledge.gold && room.knowledge.gold === Math.max(...rooms.map(room => room.knowledge.gold)) && (room.knowledge.gold >= 0.5 || (!room.knowledge.pit && !room.knowledge.wumpus)))[0];

    // Does a room contain a glitter?
    if (!room) {
      room = rooms.find(room => room.knowledge.glitter && !room.knowledge.pit && !room.knowledge.wumpus);
    }

    // All adjacent rooms are either visited or contain a possible enemy. Is there another unvisited room that is safe?
    if (!room || AiManager.foundGold) {
      const closestSafeRooms = [];

      if (AiManager.foundGold) {
        closestSafeRooms.push(AiManager.knowledge[AiManager.foundGold.y][AiManager.foundGold.x]);
      }
      else {
        for (let ry=0; ry<AiManager.knowledge.length; ry++) {
          // Find all least visited safe rooms in this row.
          //const potentialSafeRooms = AiManager.knowledge[ry].filter(knowledge => (knowledge.x !== x || knowledge.y !== y) && (!AiManager.foundLoop ? (!knowledge.pit && !knowledge.wumpus) : (knowledge.pit < 0.5 && knowledge.wumpus < 0.5)));
          const potentialSafeRooms = AiManager.knowledge[ry].filter(knowledge => (knowledge.x !== x || knowledge.y !== y) && !knowledge.visited && !knowledge.pit && !knowledge.wumpus);
          closestSafeRooms.push.apply(closestSafeRooms, potentialSafeRooms);
        }
      }

      // Sort by least visited, then by distance.
      closestSafeRooms.sort((a, b) => {
        // If the number of visits are equal sort by distance instead.
        return (b.visited - a.visited) || (AStarManager.manhattan({ x, y }, { x: b.x, y: b.y }) - AStarManager.manhattan({ x, y }, { x: a.x, y: a.y }));
      });

      const originalSafeRooms = Object.assign([], closestSafeRooms);

      // Finally, move in the safest direction of the room found.
      let target = {};
      while (target) {
        target = closestSafeRooms.pop();
        if (target) {
          // Find a safe path from the current position to the target room, avoid all potential wumpus or pits.
          AiManager.path = AStarManager.search(AiManager.knowledge, AiManager.knowledge[y][x], target, room => { return room.pit || room.wumpus });
          if (AiManager.path.length) {
            const next = AiManager.path[0];
            room = { x: next.x, y: next.y, knowledge: AiManager.knowledge[next.y][next.x] };
            break;
          }
        }
      }

      if (!room) {
        // No safe path available, relax the constraints.
        console.log('Risky business!');
        target = {};
        while (target) {
          target = originalSafeRooms.pop();
          if (target) {
            // Find a safe path from the current position to the target room, avoid all certain wumpus or pits.
            AiManager.path = AStarManager.search(AiManager.knowledge, AiManager.knowledge[y][x], target, room => { return room.pit >= 0.5 || room.wumpus >= 0.5 });
            if (AiManager.path.length) {
              const next = AiManager.path[0];
              room = { x: next.x, y: next.y, knowledge: AiManager.knowledge[next.y][next.x] };
              break;
            }
          }
        }
      }
    }

    // If all else fails, backtrack to a previously visited room.
    if (!room) {
      room = rooms.sort((a, b) => { return a.knowledge.visited - b.knowledge.visited; })[0];
    }

    return room;
  },

  availableRooms: (x, y) => {
    const rooms = [];

    if (x >= 0 && x < AiManager.knowledge[0].length && y - 1 >= 0 && y - 1 < AiManager.knowledge.length)
      rooms.push({ x, y: y - 1, knowledge: AiManager.knowledge[y-1][x] });
    if (x + 1 >= 0 && x + 1 < AiManager.knowledge[0].length && y >= 0 && y < AiManager.knowledge.length)
      rooms.push({ x: x + 1, y, knowledge: AiManager.knowledge[y][x+1] });
    if (x >= 0 && x < AiManager.knowledge[0].length && y + 1 >= 0 && y + 1 < AiManager.knowledge.length)
      rooms.push({ x, y: y + 1, knowledge: AiManager.knowledge[y+1][x] });
    if (x - 1 >= 0 && x - 1 < AiManager.knowledge[0].length && y >= 0 && y < AiManager.knowledge.length)
      rooms.push({ x: x - 1, y, knowledge: AiManager.knowledge[y][x-1] });

    return rooms;
  },

  isPit: (x, y) => {
    if (x >= 0 && x < AiManager.knowledge[0].length && y >= 0 && y < AiManager.knowledge.length)
      return AiManager.knowledge[y][x].pit >= 0.5;
    else
      return false;
  },

  isWumpus: (x, y) => {
    if (x >= 0 && x < AiManager.knowledge[0].length && y >= 0 && y < AiManager.knowledge.length)
      return AiManager.knowledge[y][x].wumpus >= 0.5;
    else
      return false;
  },

  isGold: (x, y) => {
    if (x >= 0 && x < AiManager.knowledge[0].length && y >= 0 && y < AiManager.knowledge.length)
      return AiManager.knowledge[y][x].gold >= 0.5;
    else
      return false;
  },

  pad: (pad, str, padLeft) => {
    if (typeof str === 'undefined')
      return pad;
    if (padLeft) {
      return (pad + str).slice(-pad.length);
    } else {
      return (str + pad).substring(0, pad.length);
    }
  },

  toString: (playerX, playerY) => {
    let result = '';

    for (let y=0; y < AiManager.knowledge.length; y++) {
      result += '|';

      for (let x=0; x < AiManager.knowledge[y].length; x++) {
        result += `${AiManager.knowledge[y][x].wumpus >= 0.5? '^^^' : ''}${AiManager.knowledge[y][x].wumpus === 0.25? '^' : ''}${AiManager.knowledge[y][x].pit >= 0.5 ? '@@@' : ''}${AiManager.knowledge[y][x].pit === 0.25 ? '@' : ''}${(x === AiManager.recommendedMove.x && y === AiManager.recommendedMove.y) ? '$' : ''}${(x === playerX && y === playerY) ? '*' : ''} v:${AiManager.pad('    ', AiManager.knowledge[y][x].visited)} p:${AiManager.pad('    ', AiManager.knowledge[y][x].pit)} w:${AiManager.pad('    ', AiManager.knowledge[y][x].wumpus)} g:${AiManager.pad('    ', AiManager.knowledge[y][x].gold)}${x === AiManager.recommendedMove.x && y === AiManager.recommendedMove.y ? '$$' : ''}${x === playerX && y === playerY ? '**' : ''}${AiManager.knowledge[y][x].pit >= 0.5 ? '@@@@' : ''}${AiManager.knowledge[y][x].pit === 0.25 ? '@@' : ''}${AiManager.knowledge[y][x].wumpus >= 0.5 ? '^^^^' : ''}${AiManager.knowledge[y][x].wumpus === 0.25 ? '^^' : ''}|`;
      }
      result += '\n';
    }

    return result;
  }
};
