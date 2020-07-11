const GameManager = {
  isValidMove: (x, y, playerX, playerY, width, height) => {
    let isValid = false;

    // Valid moves are adjacent squares, no diagonals.
    if (x >= 0 && x < width && y >= 0 && y < height) {
      const distance = Math.abs(x - playerX) + Math.abs(y - playerY);
      if (distance === 1 && (x !== playerX || y !== playerY)) {
        isValid = true;
      }
    }

    return isValid;
  }
};
