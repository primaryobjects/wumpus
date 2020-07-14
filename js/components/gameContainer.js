class GameContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      width: props.width || 4,
      height: props.height || 4,
      arrows: 1,
      reset: 0,
      cheat: false,
    };

    this.game = React.createRef();
    this.onWidth = this.onWidth.bind(this);
    this.onHeight = this.onHeight.bind(this);
    this.onReset = this.onReset.bind(this);
    this.onCheat = this.onCheat.bind(this);
    this.onShoot = this.onShoot.bind(this);
    this.onUpdateArrows = this.onUpdateArrows.bind(this);
  }

  onWidth(e) {
    this.setState({ width: e.currentTarget.value });
  }

  onHeight(e) {
    this.setState({ height: e.currentTarget.value });
  }

  onReset() {
    this.setState({ reset: this.state.reset + 1 });
  }

  onCheat() {
    this.setState({ cheat: !this.state.cheat });
  }

  onShoot() {
    this.state.arrows && this.game.current.shoot();
  }

  onUpdateArrows(arrows) {
    this.setState({ arrows });
  }

  render() {
    return (
      <div>
        <Game width={ this.state.width } height={ this.state.height } updateArrows={ this.onUpdateArrows } reset={ this.state.reset } cheatMode={ this.state.cheat } ref={ this.game }></Game>

        <div class="gamePlayOptions mt-3">
            <div class='row'>
              <div class='col text-muted'>
                Grid Size
              </div>
            </div>
            <div class='row no-gutters'>
              <div class='col-auto'>
                <input type="number" id="width" name="width" min="3" value={ this.state.width } onChange={ this.onWidth }/>
              </div>
              <div class='col-auto'>
                <input type="number" id="height" name="height" min="3" value={ this.state.height } onChange={ this.onHeight }/>
              </div>
              <div class='col-auto'>
                <input type="button" id="reset" name="reset" value="Reset" onClick={ this.onReset }/>
              </div>
              <div class='col-auto'>
                <button type="button" class={ `btn btn-${ this.state.arrows ? 'primary' : 'secondary disabled' } btn-sm` } data-toggle="button" aria-pressed="false" autocomplete="off" onClick={ this.onShoot }>
                  <i class="fas fa-bullseye mr-1" />
                  Shoot <span class="badge badge-light ml-1 mr-0">{this.state.arrows}</span>
                </button>
              </div>
              <div class='col-auto'>
                <button type="button" class="btn btn-secondary btn-sm" data-toggle="button" aria-pressed="false" autocomplete="off" onClick={ this.onCheat }>
                  <i class="fas fa-theater-masks mr-1" />
                  Cheat
                </button>
              </div>
            </div>
        </div>
      </div>
    );
  }
}