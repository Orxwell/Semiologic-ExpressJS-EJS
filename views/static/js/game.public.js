function forceCanvasResize() {
  if (game && game.scale) {
    game.scale.refresh();
  }
}

// instancia del juego
const game = new Phaser.Game(CONFIG);
