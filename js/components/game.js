class Game extends React.Component {
  constructor(props) {
    super(props);

    this.state = this.getState(this.props);

    this.grid = React.createRef();
    this.hint = this.hint.bind(this);
    this.reset = this.reset.bind(this);
    this.cheat = this.cheat.bind(this);
    this.shoot = this.shoot.bind(this);
    this.onGrid = this.onGrid.bind(this);
  }

  getState(props) {
    const width = props.width;// || this.state.width;
    const height = props.height;// || this.state.height;

    return {
      width,
      height,
      x: 0,
      y: props.height - 1,
      moves: 0,
      arrows: 1,
      arrowLocation: null,
      readyArrow: false,
      cheat: false,
      gameOver: false,
      dungeon: WumpusManager.generate(props.width, props.height),
    }
  }

  componentDidUpdate(nextProps) {
    const { width, height } = this.props;

    if (width && nextProps.width !== width) {
      this.reset();
    }

    if (height && nextProps.height !== height) {
      this.reset();
    }
  }

  reset() {
    this.setState(this.getState(this.props), () => {
      this.hint(this.state.x, this.state.y);
      this.props.onArrow(this.state.arrows);
    });
  }

  cheat() {
    this.setState({ cheat: !this.state.cheat });
  }

  shoot() {
    this.setState({ readyArrow: !this.state.readyArrow });
  }

  hint(x, y) {
    // Check percepts.
    if (this.state.dungeon[y][x].includes(WumpusManager.constants.breeze)) {
      console.log('You feel a breeze.');
    }

    if (this.state.dungeon[y][x].includes(WumpusManager.constants.stench)) {
      console.log('You smell a stench.');
    }

    if (this.state.dungeon[y][x].includes(WumpusManager.constants.glitter)) {
      console.log('You see a glitter.');
    }

    // Check end game conditions.
    if (this.state.dungeon[y][x].includes(WumpusManager.constants.gold)) {
      console.log('You found the gold! You win!');
      this.setState({ gameOver: true });
    }
    else if (this.state.dungeon[y][x].includes(WumpusManager.constants.wumpus)) {
      console.log('You are eaten by the Wumpus! You lose!');
      this.setState({ gameOver: true });
    }
    else if (this.state.dungeon[y][x].includes(WumpusManager.constants.pit)) {
      console.log('You fall in a pit! You lose!');
      this.setState({ gameOver: true });
    }
  }

  onGrid(x, y) {
    if (this.state.gameOver) {
      // When the game is over, the next click resets the game.
      this.reset();
    }
    else if (this.state.readyArrow) {
      // This click fires an arrow in the direction.
      const arrowLocation = { x: this.state.x, y: this.state.y };
      const arrows = this.state.arrows - 1;

      // Add the arrow to the player cell in order to render the status message.
      const dungeon = this.state.dungeon;
      dungeon[arrowLocation.y][arrowLocation.x].push(WumpusManager.constants.arrow);

      this.setState({ arrows, dungeon, arrowLocation, readyArrow: false });

      //
      // TODO: Calculate if cell is up, right, down, left of player and then fire arrow.
      //

      // Callback handler for parent container to disable the shoot button.
      this.props.onArrow(arrows);
    }
    else if (GameManager.isValidMove(x, y, this.state.x, this.state.y, this.grid.current.props.width, this.grid.current.props.height)) {
      // Display a hint.
      this.hint(x, y);

      const dungeon = this.state.dungeon;
      if (this.state.arrowLocation) {
        // If the player just fired an arrow, on this move remove the arrow from the cell to hide the message.
        const objects = dungeon[this.state.arrowLocation.y][this.state.arrowLocation.x];
        objects.splice(objects.indexOf(WumpusManager.constants.arrow));
        dungeon[this.state.arrowLocation.y][this.state.arrowLocation.x] = objects;
      }

      // Update state and play opponent's turn.
      this.setState({ x, y, dungeon, arrowLocation: null, moves: this.state.moves+1 });

      return true;
    }
  }

  renderEntity(x, y, className, color) {
    return (
      <Entity width="50" height="50" x={x} y={y} cellStyle={className} color={color}></Entity>
    );
  }

  renderPlayer(x, y, map) {
    return (
      <Entity width="50" height="50" x={x} y={y} cellStyle="player fas fa-female" color="deeppink">
        <div class="percept-container">
          {map[y][x].includes(WumpusManager.constants.breeze) && this.renderEntity(x, y, 'small percept fas fa-water', 'blue')}
          {map[y][x].includes(WumpusManager.constants.stench) && this.renderEntity(x, y, 'small percept fas fa-skull-crossbones', 'darkred')}
          {map[y][x].includes(WumpusManager.constants.glitter) && this.renderEntity(x, y, 'small percept fas fa-gem', 'gold')}
        </div>
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
            objects.push(this.renderEntity(x, y, `anchor fas fa-square ${this.state.cheat ? '' : 'd-none'}`, 'black'));
          }
          else if (entity === WumpusManager.constants.wumpus) {
            objects.push(this.renderEntity(x, y, `anchor fab fa-optin-monster ${this.state.cheat ? '' : 'd-none'}`, 'red'));
          }
          else if (entity === WumpusManager.constants.gold) {
            objects.push(this.renderEntity(x, y, `anchor fas fa-gem ${this.state.cheat ? '' : 'd-none'}`, 'gold'));
          }
        });
      }
    }

    return objects;
  }

  renderGoal(x, y, map, goal, color, title, text, offset = 0, className = 'alert-danger') {
    return (
      map[y][x].includes(goal) ?
        <div class={`mt-1 pl-2 alert ${className} show`} role="alert" style={{width: '400px'}}>
          <div style={{float: 'left'}}>
            <i class={`${WumpusManager.icon(goal)} mr-2`} style={{fontSize: '30px', marginTop: `${offset}px`, color}}></i>
          </div>
          <div>
            <strong>{title}</strong> {text}
          </div>
        </div> : null
    );
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

        { this.renderGoal(this.state.x, this.state.y, this.state.dungeon, WumpusManager.constants.gold, 'gold', 'You win!', `You found the treasure in ${this.state.moves} moves!`, 0, 'alert-warning') }
        { this.renderGoal(this.state.x, this.state.y, this.state.dungeon, WumpusManager.constants.wumpus, 'red', 'You lose!', 'You were eaten by the Wumpus!', -5) }
        { this.renderGoal(this.state.x, this.state.y, this.state.dungeon, WumpusManager.constants.pit, 'black', 'You lose!', 'You fall into a deep dark pit.', -2) }
        { this.renderGoal(this.state.x, this.state.y, this.state.dungeon, WumpusManager.constants.arrow, 'black', 'You Shoot!', `You fire your arrow.`, -2, null) }
      </div>
    );
  }
}