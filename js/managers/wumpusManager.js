
const WumpusManager = {
  constants: {
    clear: 0,
    pit: 1,
    wumpus: 2,
    gold: 3,
    breeze: 4,
    stench: 5,
    glitter: 6,
  },

  generate: (width, height) => {
    const rows = [];
    const pits = [];
    let wumpus = { x: 0, y: height - 1 };
    let gold = { x: 0, y: height - 1 };
    let attempts;

    // Choose location for the gold (not on the player starting location).
    attempts = 0;
    while (gold.x === 0 && gold.y === height - 1 && attempts++ < 1000) {
      gold = { x: Math.floor(Math.random() * (width - 1)), y: Math.floor(Math.random() * (height - 1)) };
    }

    if (attempts >= 1000) {
      const msg = `Failed to generate gold location, due to grid size ${width},${height}`;
      console.error(msg);
      throw new Error(msg)
    }

    // Choose location for the wumpus (not on the player starting location, not the gold).
    attempts = 0;
    while (((wumpus.x === 0 && wumpus.y === height - 1) || (wumpus.x === gold.x && wumpus.y === gold.y)) && attempts++ < 1000) {
      wumpus = { x: Math.floor(Math.random() * (width - 1)), y: Math.floor(Math.random() * (height - 1)) };
    }

    if (attempts >= 1000) {
      const msg = `Failed to generate wumpus location, due to grid size ${width},${height}`;
      console.error(msg);
      throw new Error(msg)
    }

    for (let y=0; y<height; y++) {
      const cols = [];

      for (let x=0; x<width; x++) {
        if (x === wumpus.x && y === wumpus.y) {
          // Wumpus room.
          cols[x] = [ WumpusManager.constants.wumpus ];
        }
        else if (x === gold.x && y === gold.y) {
          // Gold room.
          cols[x] = [ WumpusManager.constants.gold ];
        }
        else if (x !== 0 && y !== height - 1) {
          // Pit room (not on the player starting location).
          const isPit = Math.random() <= 0.2;
          cols[x] = [ isPit ? WumpusManager.constants.pit : WumpusManager.constants.clear ];
          isPit && pits.push({ x, y });
        }
        else {
          // Empty room.
          cols[x] = [ WumpusManager.constants.clear ];
        }
      }

      rows[y] = cols;
    }

    // Assign hints.
    pits.forEach(pit => {
      WumpusManager.addHint(pit, WumpusManager.constants.breeze, rows, width, height);
    });
    WumpusManager.addHint(wumpus, WumpusManager.constants.stench, rows, width, height);
    WumpusManager.addHint(gold, WumpusManager.constants.glitter, rows, width, height);

    return rows;
  },

  addHint: (entity, hint, rows, width, height) => {
    if (entity.x - 1 >= 0) {
      rows[entity.y][entity.x - 1].push(hint);
    }
    if (entity.x + 1 < width) {
      rows[entity.y][entity.x + 1].push(hint);
    }
    if (entity.y - 1 >= 0) {
      rows[entity.y - 1][entity.x].push(hint);
    }
    if (entity.y + 1 < height) {
      rows[entity.y + 1][entity.x].push(hint);
    }

    return rows;
  },
};
