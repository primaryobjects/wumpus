
const WumpusManager = {
  constants: {
    clear: 0,
    pit: 1,
    wumpus: 2,
    gold: 3,
    breeze: 4,
    stench: 5,
    glitter: 6,
    question: 7,
    arrow: 8,
    pittile: 9,
    crossbones: 10,
    arrowState: {
      none: 0,
      armed: 1,
      fired: 2,
      kill: 3,
    },
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

    return { map: rows, gold, wumpus };
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

  icon(goal) {
    let icon = null;

    switch (goal) {
      case WumpusManager.constants.pit:
        icon = 'fas fa-skull-crossbones';
        break;
      case WumpusManager.constants.pittile:
        icon = 'fas fa-square';
        break;
      case WumpusManager.constants.wumpus:
        icon = 'fab fa-optin-monster';
        break;
      case WumpusManager.constants.gold:
        icon = 'fa fa-gem';
        break;
      case WumpusManager.constants.question:
        icon = 'fas fa-question-circle';
        break;
      case WumpusManager.constants.arrow:
        icon = 'fas fa-bullseye';
        break;
        case WumpusManager.constants.crossbones:
        icon = 'fas fa-skull-crossbones';
        break;
      case WumpusManager.constants.breeze:
        icon = 'fas fa-water';
        break;
      default:
        break;
    }

    return icon;
  },

  percept(type) {
    let indicator = null;

    switch (type) {
      case WumpusManager.constants.breeze:
        indicator = { icon: WumpusManager.icon(WumpusManager.constants.breeze), color: 'blue' };
        break;
      case WumpusManager.constants.stench:
        indicator = { icon: WumpusManager.icon(WumpusManager.constants.crossbones), color: 'darkred' };
        break;
      case WumpusManager.constants.glitter:
        indicator = { icon: WumpusManager.icon(WumpusManager.constants.gold), color: 'gold' };
        break;
      default:
        break;
    }

    return indicator;
  }
};
