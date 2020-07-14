class Game extends React.Component {
  constructor(props) {
    super(props);

    this.state = this.getState(this.props);

    this.grid = React.createRef();
    this.reset = this.reset.bind(this);
    this.shoot = this.shoot.bind(this);
    this.print = this.print.bind(this);
    this.onGrid = this.onGrid.bind(this);
  }

  getState(props) {
    const width = props.width;
    const height = props.height;
    const arrows = 1;

    // Callback handler for parent container to update arrow count.
    this.props.updateArrows(arrows);

    return {
      width,
      height,
      x: 0,
      y: props.height - 1,
      moves: 0,
      arrows,
      arrowLocation: null,
      readyArrow: false,
      gameOver: false,
      message: null,
      dungeon: WumpusManager.generate(props.width, props.height),
    }
  }

  componentDidUpdate(nextProps) {
    const { width, height, reset } = this.props;

    if ((width && nextProps.width !== width) ||
        (height && nextProps.height !== height) ||
        (reset && nextProps.reset !== reset)) {
      this.reset();
    }
  }

  reset() {
    this.setState(this.getState(this.props));
  }

  shoot() {
    const readyArrow = !this.state.readyArrow;
    this.setState({ readyArrow, message: null }, () => {
      this.update(this.state.dungeon[this.state.y][this.state.x]);
    });
  }

  update(room) {
    let gameOk = true;

    // Check percepts.
    if (room.includes(WumpusManager.constants.breeze)) {
      console.log('You feel a breeze.');
    }

    if (room.includes(WumpusManager.constants.stench)) {
      console.log('You smell a stench.');
    }

    if (room.includes(WumpusManager.constants.glitter)) {
      console.log('You see a glitter.');
    }

    if (this.state.readyArrow) {
      console.log('Bow ready. Click the direction to shoot.');
      this.print('Bow ready.', `Click the direction to shoot.`, 'black', WumpusManager.constants.question, -2);
    }
    else if (this.state.arrowLocation) {
      console.log('You shoot! You fire your arrow.');
      this.print('You Shoot!', `You fire your arrow.`, 'black', WumpusManager.constants.arrow, -2);
    }

    // Check end game conditions.
    if (room.includes(WumpusManager.constants.gold)) {
      console.log('You found the gold! You win!');
      this.print('You win!', `You found the treasure in ${this.state.moves} moves!`, 'gold', WumpusManager.constants.gold, 0, 'alert-warning');
      gameOk = false;
    }
    else if (room.includes(WumpusManager.constants.wumpus)) {
      console.log('You are eaten by the Wumpus! You lose!');
      this.print('You lose!', 'You were eaten by the Wumpus!', 'red', WumpusManager.constants.wumpus, -5, 'alert-danger');
      gameOk = false;
    }
    else if (room.includes(WumpusManager.constants.pit)) {
      console.log('You fall in a pit! You lose!');
      this.print('You lose!', 'You fall into a deep dark pit.', 'black', WumpusManager.constants.crossbones, -2, 'alert-danger');
      gameOk = false;
    }

    return gameOk;
  }

  onGrid(x, y) {
    if (!this.state.gameOver) {
      let playerLocation = { x: this.state.x, y: this.state.y };
      let arrowLocation = null;
      let arrows = this.state.arrows;
      let message = null;

      if (this.state.gameOver) {
        // When the game is over, the next click resets the game.
        this.reset();
      }
      else if (this.state.readyArrow) {
        // This click fires an arrow in the direction.
        arrows--;
        message = null;
        arrowLocation = { x, y };

        //
        // TODO: Calculate if cell is up, right, down, left of player and then fire arrow.
        // Calculate if wumpus is in same direction from player, if so, mark the wumpus as dead.
        //

        // Callback handler for parent container to disable the shoot button.
        this.props.updateArrows(arrows);
      }
      else if (GameManager.isValidMove(x, y, this.state.x, this.state.y, this.grid.current.props.width, this.grid.current.props.height)) {
        // Update player location with new move.
        playerLocation = { x, y };
      }

      // Update state.
      this.setState({ arrows, arrowLocation, message, x: playerLocation.x, y: playerLocation.y, moves: this.state.moves + 1, readyArrow: false }, () => {
        if (!this.update(this.state.dungeon[playerLocation.y][playerLocation.x])) {
          // Game over.
          this.setState({ gameOver: true });

          // Fade out player and reset the game.
          setTimeout(() => {
            // Game over.
            this.reset();
          }, 3000);
        }
      });
    }
    else {
      console.log('Tilt!');
    }
  }

  print(title, text, color = 'black', icon = WumpusManager.constants.clear, offset = 0, className = null) {
    this.setState({ message:
      <div class={`mt-1 pl-2 alert ${className} show`} role="alert" style={{width: '400px'}}>
        <div style={{float: 'left'}}>
          <i class={`${WumpusManager.icon(icon)} mr-2`} style={{fontSize: '30px', marginTop: `${offset}px`, color}}></i>
        </div>
        <div>
          <strong>{title}</strong> {text}
        </div>
      </div>
    });
  }

  renderEntity(x, y, className, color) {
    return (
      <Entity width="50" height="50" x={x} y={y} cellStyle={className} color={color}></Entity>
    );
  }

  renderPlayer(x, y, map) {
    // Find all unique percepts for the player on this tile. Note, the spread operator filters out duplicates.
    const percepts = [...new Set(map[y][x].filter(p =>
      [ WumpusManager.constants.breeze,
        WumpusManager.constants.stench,
        WumpusManager.constants.glitter ]
      .includes(p)
    ))];

    // Render the player and percept indicators (go through each percept found in this cell and render the corresponding icon and color).
    return (
      <Entity width="50" height="50" x={x} y={y} cellStyle={`player fas fa-female ${this.state.gameOver ? 'fade' : '' }`} color="deeppink">
        { !this.state.gameOver && <div class="percept-container">
            { percepts.map(percept => {
                return (this.renderEntity(x, y, `small percept ${WumpusManager.percept(percept).icon}`, WumpusManager.percept(percept).color))
              })
            }
          </div>
        }
      </Entity>
    );
  }

  renderObjects(map) {
    const objects = [];
    const height = map.length;
    const width = map[0].length;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        map[y][x].forEach(entity => {
          if (entity === WumpusManager.constants.pit) {
            objects.push(this.renderEntity(x, y, `anchor ${WumpusManager.icon(WumpusManager.constants.pittile)} ${this.props.cheatMode ? '' : 'd-none'}`, 'black'));
          }
          else if (entity === WumpusManager.constants.wumpus) {
            objects.push(this.renderEntity(x, y, `anchor ${WumpusManager.icon(WumpusManager.constants.wumpus)} ${this.props.cheatMode ? '' : 'd-none'}`, 'red'));
          }
          else if (entity === WumpusManager.constants.gold) {
            objects.push(this.renderEntity(x, y, `anchor ${WumpusManager.icon(WumpusManager.constants.gold)} ${this.props.cheatMode ? '' : 'd-none'}`, 'gold'));
          }
        });
      }
    }

    return objects;
  }

  render() {
    // Generate objects in the dungeon, starting with the player and any percepts.
    const entities = [ this.renderPlayer(this.state.x, this.state.y, this.state.dungeon) ].concat(
      this.renderObjects(this.state.dungeon)
    );

    return (
      <div id='app' ref={ this.container }>
        <Grid width={ this.state.width } height={ this.state.height } grid={ this.props.grid } cellStyle={ this.props.cellStyle } onClick={ this.onGrid } ref={ this.grid }>
          { entities }
        </Grid>
        { this.state.message }
      </div>
    );
  }
}