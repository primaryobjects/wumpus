class Cell extends React.Component {
  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  onClick(e) {
    // Callback handler for cell click event.
    this.props.onClick(this, this.props.x, this.props.y);
  }

  render() {
    return (
      <div id={ `cell-${this.props.x}-${this.props.y}` } className={`cell ${this.props.cellStyle || ''}`} style={{width: this.props.width || '', height: this.props.height || '', backgroundColor: this.props.color }} onClick={ this.onClick }>
        { this.props.children }
      </div>
    );
  };
};