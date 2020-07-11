class Player extends Entity {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      super.create(this.props, super.offset())
    );
  }
}