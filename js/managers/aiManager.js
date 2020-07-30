const AiManager = {
  knowledge: [],

  initialize: (playerX, playerY, width, height) => {
    AiManager.knowledge = [];

    for (let y=0; y<height; y++) {
      const row = [];

      for (let x=0; x<width; x++) {
        row.push({ pit: 0, wumpus: 0, gold: 0 });
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

      return AiManager.move(x, y);
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
    let adjRoom;

    // If this is the first time we've entered this room, update knowledge for adjacent rooms.
    if (x >= 0 && x < AiManager.knowledge[0].length && y >= 0 && y < AiManager.knowledge.length && !knowledge.visited) {
      adjRoom = AiManager.knowledge[y][x];

      if (knowledge.breeze) {
        adjRoom.pit += 0.25;
      }

      if (knowledge.stench) {
        adjRoom.wumpus += 0.25;
      }

      if (knowledge.glitter) {
        adjRoom.gold += 0.25;
      }
    }

    return adjRoom;
  },

  move: (x, y) => {
    // Determines the next best move from starting point x, y.
    let room;

    const rooms = AiManager.availableRooms(x, y);

    // Does an unvisited room contain a probability of gold >= 0.5?
    room = rooms.find(room => !room.knowledge.visited && room.knowledge.gold >= 0.5);
    if (!room) {
      room = rooms.find(room => !room.knowledge.visited && room.knowledge.gold >= 0.25 && room.knowledge.pit < 0.5 && room.knowledge.wumpus < 0.5);
    }

    // Does a visited room contain a glitter?
    if (!room) {
      room = rooms.find(room => room.knowledge.glitter);
    }

    // Does an unvisited room contain a probability of a pit < 0.5 and no wumpus?
    if (!room) {
      room = rooms.find(room => !room.knowledge.visited && room.knowledge.pit < 0.5 && room.knowledge.wumpus === 0);
    }

    // Does an unvisited room contain a probability of a wumpus < 0.5 and no pit?
    if (!room) {
      room = rooms.find(room => !room.knowledge.visited && room.knowledge.wumpus < 0.5 && room.knowledge.pit === 0);
    }

    // Does an unvisited room contain a probability of pit and wumpus < 0.5?
    if (!room) {
      room = rooms.find(room => !room.knowledge.visited && room.knowledge.pit < 0.5 && room.knowledge.wumpus < 0.5);
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
  }
};
