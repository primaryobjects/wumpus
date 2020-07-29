class Game extends React.Component {
  constructor(props) {
    super(props);

    this.state = this.getState(this.props);

    this.grid = React.createRef();
    this.reset = this.reset.bind(this);
    this.print = this.print.bind(this);
    this.onGrid = this.onGrid.bind(this);
    this.displayMoves = this.displayMoves.bind(this);
  }

  getState(props) {
    const width = props.width;
    const height = props.height;

    // Callback handler for parent container to update the arrow count and disable the shoot button.
    this.props.updateArrows();

    // Initialize the AI agent.
    AiManager.initialize(0, props.height - 1, width, height);

    return {
      width,
      height,
      x: 0,
      y: props.height - 1,
      moves: 0,
      gameOver: false,
      message: null,
      arrow: null,
      dungeon: WumpusManager.generate(props.width, props.height),
    }
  }

  componentDidMount() {
    this.props.cheatMode && this.displayMoves();
  }

  componentDidUpdate(nextProps) {
    const { width, height, arrowState, reset, cheatMode } = this.props;

    if ((width && nextProps.width !== width) ||
        (height && nextProps.height !== height) ||
        (reset && nextProps.reset !== reset)) {
      this.reset();
    }

    if (nextProps.cheatMode !== cheatMode) {
      this.displayMoves();
    }

    if (nextProps.arrowState !== arrowState) {
      this.update();
    }
  }

  reset() {
    this.setState(this.getState(this.props), () => {
      // Display available player moves, if cheat mode is enabled.
      this.props.cheatMode && this.displayMoves();

      // Update the AI agent.
      AiManager.update(this.state.x, this.state.y, this.state.dungeon.map[this.state.y][this.state.x]);
    });
  }

  displayMoves() {
    // Clear moves.
    this.state && this.state.availableMoves && this.state.availableMoves.forEach(move => {
      this.grid.current.setValue(move.x, move.y, null);
    });

    if (this.props.cheatMode) {
      // Calculate available moves for player.
      const availableMoves = GameManager.moves(this.state.x, this.state.y, this.props.width, this.props.height);
      availableMoves.forEach(move => {
        this.grid.current.setValue(move.x, move.y, 'aliceblue');
      });

      this.setState({ availableMoves });
    }
  }

  update(room) {
    let gameOk = true;

    if (this.props.arrowState === WumpusManager.constants.arrowState.armed) {
      console.log('Bow ready. Click the direction to shoot.');
      this.print('Bow ready.', `Click the direction to shoot.`, 'black', WumpusManager.constants.question, -2);
    }
    else if (this.props.arrowState === WumpusManager.constants.arrowState.fired) {
      console.log('You shoot! You fire your arrow.');
      this.print('You Shoot!', `You fire your arrow.`, 'black', WumpusManager.constants.arrow, -2);
    }
    else if (this.props.arrowState === WumpusManager.constants.arrowState.kill) {
      console.log('You shoot! You hear a thump on the ground.');
      this.print('You shoot!', `You hear a thump on the ground.`, 'black', WumpusManager.constants.arrow, -2);
    }
    else if (this.props.arrowState === WumpusManager.constants.arrowState.none) {
      this.print();
    }

    if (room) {
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
    }

    // Update the AI agent.
    const bestMove = AiManager.update(this.state.x, this.state.y, room);
    bestMove && console.log(bestMove);

    return gameOk;
  }

  onGrid(x, y) {
    if (!this.state.gameOver) {
      const dungeon = this.state.dungeon;
      let playerLocation = { x: this.state.x, y: this.state.y };
      let message = null;

      if (this.state.gameOver) {
        // When the game is over, the next click resets the game.
        this.reset();
      }
      else {
        let isMove = true;

        if (this.props.arrowState === WumpusManager.constants.arrowState.fired) {
          this.print();

          // Callback handler for parent container to update the arrow state to none.
          this.props.updateArrows(this.props.arrows);
        }
        else if (this.props.arrowState === WumpusManager.constants.arrowState.armed) {
          // This click fires an arrow in the direction.
          isMove = false;
          let direction = 'up';

          if (x > playerLocation.x) {
            // Shoot right.
            direction = 'right';
          }
          else if (x < playerLocation.x) {
            // Shoot left.
            direction = 'left';
          }
          else if (y > playerLocation.y) {
            // Shoot down.
            direction = 'down'
          }
          else {
            // Shoot up.
            direction = 'up';
          }

          // Draw the arrow being fired and check if we've killed the wumpus.
          const arrowState = this.shootArrow(playerLocation, direction);

          // Remove a dead wumpus from the map.
          if (arrowState === WumpusManager.constants.arrowState.kill) {
            const index = dungeon.map[this.state.dungeon.wumpus.y][this.state.dungeon.wumpus.x]
                            .indexOf(WumpusManager.constants.wumpus);
            dungeon.map[this.state.dungeon.wumpus.y][this.state.dungeon.wumpus.x].splice(index);
          }

          // Callback handler for parent container to update the arrow count and disable the shoot button.
          this.props.updateArrows(this.props.arrows - 1, arrowState);
        }

        if (isMove && GameManager.isValidMove(x, y, this.state.x, this.state.y, this.grid.current.props.width, this.grid.current.props.height)) {
          // Update player location with new mofve.
          playerLocation = { x, y };
        }

        // Update state.
        this.setState({ dungeon, message, x: playerLocation.x, y: playerLocation.y, moves: this.state.moves + 1 }, () => {
          if (!this.update(this.state.dungeon.map[playerLocation.y][playerLocation.x])) {
            // Game over.
            this.setState({ gameOver: true });

            // Fade out player and reset the game.
            setTimeout(() => {
              // Game over.
              this.reset();
            }, 3000);
          }

          // Update available player moves.
          this.props.cheatMode && this.displayMoves();
        });
      }
    }
    else {
      console.log('Tilt!');
    }
  }

  shootArrow(player, direction) {
    this.setState({ arrow: this.renderEntity(player.x, player.y, `arrow fas fa-arrow-${direction}`) }, () => {
      setTimeout(() => {
        switch (direction) {
          case 'up':
            $('.arrow').css('top', '0px');
            break;
          case 'right':
            $('.arrow').css('left', '500px');
            break;
          case 'down':
            $('.arrow').css('top', '500px');
            break;
          case 'left':
            $('.arrow').css('left', '0px');
            break;
          default:
            break;
        }
      }, 5);

      setTimeout(() => {
        this.setState({ arrow: null });
      }, 1000);
    });

    // Calculate if wumpus is in same direction from player as the arrow direction, if so, mark the wumpus as dead.
    return direction === GameManager.direction(player, this.state.dungeon.wumpus) ?
            WumpusManager.constants.arrowState.kill :
            WumpusManager.constants.arrowState.fired;
  }

  print(title, text, color = 'black', icon = WumpusManager.constants.clear, offset = 0, className = null) {
    const message = title ?
      <div class={`mt-1 pl-0 alert ${className} show`} role="alert" style={{width: '400px'}}>
        <div style={{float: 'left'}}>
          <i class={`${WumpusManager.icon(icon)} mr-2`} style={{fontSize: '30px', marginTop: `${offset}px`, color}}></i>
        </div>
        <div>
          <strong>{title}</strong> {text}
        </div>
      </div> : null;

    this.setState({ message });
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
    const entities = [ this.renderPlayer(this.state.x, this.state.y, this.state.dungeon.map) ].concat(
      this.renderObjects(this.state.dungeon.map)
    );

    return (
      <div id='app' ref={ this.container }>
        <Grid width={ this.state.width } height={ this.state.height } grid={ this.props.grid } cellStyle={ this.props.cellStyle } onClick={ this.onGrid } ref={ this.grid }>
          { entities }
        </Grid>
        { this.state.message }
        { this.state.arrow }
      </div>
    );
  }
}