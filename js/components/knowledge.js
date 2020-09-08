class Knowledge extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
      x: props.x,
      y: props.y
    };
  }

  componentDidUpdate(nextProps) {
    const { x, y, value } = this.props;

    if (value && nextProps.value !== value) {
      this.setState({ value });
    }

    if (nextProps.x !== x || nextProps.y !== y) {
      this.setState({ x, y });
    }
  }

  render() {
    const rows = [];
    if (this.state.value) {
      for (let y=0; y<this.state.value.length; y++) {
        const cols = []

        for (let x=0; x<this.state.value[0].length; x++) {
          const room = this.state.value[y][x];

          cols.push(
          <span className={`room ${x === this.state.x && y === this.state.y ? 'active' : ''}`}>
            v:<span className='value'>{room.visited}</span>
            p:<span className={`value ${room.pit >= 0.5 ? 'text-danger high' : room.pit >= 0.25 ? 'text-danger low': ''}`}>{room.pit} </span>
            w:<span className={`value ${room.wumpus >= 0.5 ? 'text-danger high' : room.wumpus >= 0.25 ? 'text-danger low' : ''}`}>{room.wumpus} </span>
            g:<span className={`value ${room.gold >= 0.5 ? 'text-success high' : room.gold >= 0.25 ? 'text-success low' : ''}`}>{room.gold} </span>
          </span>
          );
        }

        rows.push(<div className='rooms'>{cols}</div>);
      }
    }

    return (
      <div class='knowledge'>
        {rows}
      </div>
    )
  }
}