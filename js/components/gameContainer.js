class GameContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      width: props.width || 4,
      height: props.height || 4,
    };

    this.game = React.createRef();
    this.onWidth = this.onWidth.bind(this);
    this.onHeight = this.onHeight.bind(this);
    this.onReset = this.onReset.bind(this);
    this.onCheat = this.onCheat.bind(this);
  }

  onWidth(e) {
    this.setState({ width: e.currentTarget.value });
  }

  onHeight(e) {
    this.setState({ height: e.currentTarget.value });
  }

  onReset() {
    this.game.current.reset();
  }

  onCheat() {
    this.game.current.cheat();
  }

  render() {
    return (
      <div>
        <Game width={ this.state.width } height={ this.state.height } ref={ this.game }></Game>

        <div class="gamePlayOptions mt-3">
            <div class='row'>
              <div class='col text-muted'>
                Grid Size
              </div>
            </div>
            <div class='row'>
              <div class='col-auto'>
                <input type="number" id="width" name="width" min="3" value={this.state.width} onChange={ this.onWidth }/>
              </div>
              <div class='col-auto'>
                <input type="number" id="height" name="height" min="3" value={this.state.height} onChange={ this.onHeight }/>
              </div>
              <div class='col-auto'>
                <input type="button" id="reset" name="reset" value="Reset" onClick={ this.onReset }/>
              </div>
              <div class='col-auto'>
                <button type="button" class="btn btn-secondary btn-sm" data-toggle="button" aria-pressed="false" autocomplete="off" onClick={this.onCheat}>
                  <i class="fas fa-theater-masks mr-1" />
                  Cheat Mode
                </button>
              </div>
            </div>
        </div>
      </div>
    );
  }
}