class Game extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      width: props.width,
      height: props.height,
      x: 0,
      y: props.height - 1,
      cheat: false,
      dungeon: WumpusManager.generate(props.width, props.height),
    };

    this.grid = React.createRef();
    this.hint = this.hint.bind(this);
    this.reset = this.reset.bind(this);
    this.cheat = this.cheat.bind(this);
    this.onGrid = this.onGrid.bind(this);
  }

  componentDidUpdate(nextProps) {
    const { width, height } = this.props;

    if (width && nextProps.width !== width) {
      this.reset({ width });
    }

    if (height && nextProps.height !== height) {
      this.reset({ height });
    }
  }

  reset(params = {}) {
    const width = params.width || this.state.width;
    const height = params.height || this.state.height;

    this.setState({
      width,
      height,
      x: 0,
      y: height - 1,
      dungeon: WumpusManager.generate(width, height),
    }, () => {
      this.hint(this.state.x, this.state.y);
    });
  }

  cheat() {
    this.setState({ cheat: !this.state.cheat });
  }

  hint(x, y) {
    if (this.state.dungeon[y][x].includes(WumpusManager.constants.breeze)) {
      console.log('You feel a breeze.');
    }

    if (this.state.dungeon[y][x].includes(WumpusManager.constants.stench)) {
      console.log('You smell a stench.');
    }

    if (this.state.dungeon[y][x].includes(WumpusManager.constants.glitter)) {
      console.log('You see a glitter.');
    }

    if (this.state.dungeon[y][x].includes(WumpusManager.constants.gold)) {
      console.log('You found the gold! You win!');
    }
  }

  onGrid(x, y, values) {
    if (GameManager.isValidMove(x, y, this.state.x, this.state.y, this.grid.current.props.width, this.grid.current.props.height)) {
      // Display a hint.
      this.hint(x, y);

      // Update state and play opponent's turn.
      this.setState({ x, y });

      return true;
    }
  }

  render() {
    // Generate objects in the dungeon, starting with the player.
    const entities = [
      <Entity width="50" height="50" x={ this.state.x } y={ this.state.y } cellStyle="player fas fa-female" color="deeppink"></Entity>,
    ];

    // Add additional objects to the dungeon.
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
      </div>
    );
  }
}