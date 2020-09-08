class GameContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      width: props.width || 4,
      height: props.height || 4,
      arrowState: WumpusManager.constants.arrowState.none,
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
    this.onKnowledge = this.onKnowledge.bind(this);
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
    if (this.state.arrows) {
      let arrowState = this.state.arrowState;

      switch (arrowState) {
        case WumpusManager.constants.arrowState.none:
          arrowState = WumpusManager.constants.arrowState.armed;
          break;
        case WumpusManager.constants.arrowState.armed:
          arrowState = WumpusManager.constants.arrowState.none;
          break;
        default:
          break;
      }

      this.setState({ arrowState });
    }
  }

  onUpdateArrows(arrows = 1, arrowState = WumpusManager.constants.arrowState.none) {
    // Callback handler to update arrow count and state from child.
    this.setState({ arrows, arrowState });
  }

  onKnowledge(x, y, knowledge) {
    this.setState({ x, y, knowledge });
  }

  render() {
    return (
      <div>
        <Game width={ this.state.width } height={ this.state.height } arrows={ this.state.arrows } arrowState={ this.state.arrowState } updateArrows={ this.onUpdateArrows } cheatMode={ this.state.cheat } reset={ this.state.reset } updateKnowledge={ this.onKnowledge }></Game>

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
              <button type="button" id="btn-shoot" class={ `btn btn-${ this.state.arrows ? 'primary' : 'secondary disabled' } btn-sm ${ this.state.arrowState === WumpusManager.constants.arrowState.armed ? 'active' : ''}` } data-toggle="button" aria-pressed="false" autocomplete="off" onClick={ this.onShoot }>
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
          <div id='knowledgebase' class='row no-guggers'>
            <div class='col-auto'>
              <div class='panel panel-default'>
                <div class='panel-heading collapsed' data-toggle='collapse' data-target='#knowledgebaseContainer'>
                  <i class='fa fa-chevron fa-fw' ></i> AI Knowledge
                </div>
                <div id='knowledgebaseContainer' class='collapse in'>
                  <Knowledge value={this.state.knowledge} x={this.state.x} y={this.state.y} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}