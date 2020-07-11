class Game extends React.Component {
  constructor(props) {
    super(props);

    this.state = this.getState(this.props);

    this.grid = React.createRef();
    this.hint = this.hint.bind(this);
    this.reset = this.reset.bind(this);
    this.cheat = this.cheat.bind(this);
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
    });
  }

  cheat() {
    this.setState({ cheat: !this.state.cheat });
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

  onGrid(x, y, values) {
    if (this.state.gameOver) {
      // When the game is over, the next click resets the game.
      this.reset();
    }
    else if (GameManager.isValidMove(x, y, this.state.x, this.state.y, this.grid.current.props.width, this.grid.current.props.height)) {
      // Display a hint.
      this.hint(x, y);

      // Update state and play opponent's turn.
      this.setState({ x, y, moves: this.state.moves+1 });

      return true;
    }
  }

  render() {
    // Generate objects in the dungeon, starting with the player and any percepts.
    const entities = [
      <Entity width="50" height="50" x={ this.state.x } y={ this.state.y } cellStyle="player fas fa-female" color="deeppink">
        <div class="percept-container">
          { this.state.dungeon[this.state.y][this.state.x].includes(WumpusManager.constants.breeze) &&
              <Entity width="50" height="50" x={ this.state.x } y={ this.state.y } cellStyle="small percept fas fa-water" color="blue"></Entity>
          }
          { this.state.dungeon[this.state.y][this.state.x].includes(WumpusManager.constants.stench) &&
              <Entity width="50" height="50" x={ this.state.x } y={ this.state.y } cellStyle="small percept fas fa-skull-crossbones" color="darkred"></Entity>
          }
          { this.state.dungeon[this.state.y][this.state.x].includes(WumpusManager.constants.glitter) &&
              <Entity width="50" height="50" x={ this.state.x } y={ this.state.y } cellStyle="small percept fas fa-gem" color="gold"></Entity>
          }
        </div>
      </Entity>,
    ];

    // Add mobs to the dungeon.
    for (let y=0; y<this.state.height; y++) {
      for (let x=0; x<this.state.width; x++) {
        this.state.dungeon[y][x].forEach(entity => {
          if (entity === WumpusManager.constants.pit) {
            entities.push(<Entity width="50" height="50" x={x} y={y} cellStyle={`anchor fas fa-square ${this.state.cheat ? '' : 'd-none'}`} color="black"></Entity>);
          }
          else if (entity === WumpusManager.constants.wumpus) {
            entities.push(<Entity width="50" height="50" x={x} y={y} cellStyle={`anchor fab fa-optin-monster ${this.state.cheat ? '' : 'd-none'}`} color="red"></Entity>);
          }
          else if (entity === WumpusManager.constants.gold) {
            entities.push(<Entity width="50" height="50" x={x} y={y} cellStyle={`anchor fas fa-gem ${this.state.cheat ? '' : 'd-none'}`} color="gold"></Entity>);
          }
        });
      }
    }

    return (
      <div id='app' ref={ this.container }>
        <Grid width={ this.state.width } height={ this.state.height } grid={ this.props.grid } cellStyle={ this.props.cellStyle } onClick={ this.onGrid } ref={ this.grid }>
          { entities }
        </Grid>

        { this.state.dungeon[this.state.y][this.state.x].includes(WumpusManager.constants.gold) &&
            <div class="mt-1 pl-2 alert alert-warning show" role="alert" style={{width: '400px'}}>
            <div style={{float: 'left'}}>
              <i class="fa fa-gem mr-2" style={{fontSize: '30px', color: 'gold'}}></i>
            </div>
            <div>
              <strong>You win!</strong> You found the treasure in { this.state.moves } moves!
            </div>
          </div>
        }

        { this.state.dungeon[this.state.y][this.state.x].includes(WumpusManager.constants.wumpus) &&
            <div class="mt-1 pl-2 alert alert-danger show" role="alert" style={{width: '400px'}}>
            <div style={{float: 'left'}}>
              <i class="fab fa-optin-monster mr-2" style={{fontSize: '30px', color: 'red'}}></i>
            </div>
            <div>
              <strong>You lose!</strong> You were eaten by the Wumpus!
            </div>
          </div>
        }

        { this.state.dungeon[this.state.y][this.state.x].includes(WumpusManager.constants.pit) &&
            <div class="mt-1 pl-2 alert alert-danger show" role="alert" style={{width: '400px'}}>
              <div style={{float: 'left'}}>
                <i class="fas fa-skull-crossbones mr-2" style={{fontSize: '30px', paddingTop: '8px', color: 'black'}}></i>
              </div>
              <div>
                <strong>You lose!</strong> You fall into a deep dark pit, never to be seen again.
              </div>
            </div>
        }
      </div>
    );
  }
}