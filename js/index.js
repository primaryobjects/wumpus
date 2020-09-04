// Main React render hook.
$(function() {
  const gameCtrl = ReactDOM.render(
    <div>
      <GameContainer width="4" height="4"></GameContainer>
    </div>,
    document.getElementById('root')
  );
});