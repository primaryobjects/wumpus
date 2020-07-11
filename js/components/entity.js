class Entity extends React.Component {
  constructor(props) {
    super(props);
  }

  offset() {
    // Adjust offset to position icon on grid.
    let left = 25;
    let top = 5;
    const container = $('#app');
    if (container.length) {
      const rect = container[0].getBoundingClientRect();
      left = rect.left + 15;
      top = rect.top + 5;
    }

    return { top, left };
  }

  render() {
    const offset = this.offset();
    return (
      <div class="entity-container">
        <i class={ `entity ${this.props.cellStyle || ''}` } style={{ top: `${this.props.y * this.props.height + offset.top}px`, left: `${this.props.x * this.props.width + offset.left}px`, color: this.props.color }}></i>
        { this.props.children }
      </div>
    );
  }
}