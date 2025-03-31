class SceneCredits extends Phaser.Scene {
  constructor () { super({ key: 'LevelCredits' }); } // Nombre de la escena

  // Eeta función precarga propiedades de la escena antes de crearla
  preload () { }

  // Esta función carga la escena en el juego
  create () {
    // Añadir los créditos del juego
    //this.add.text();

    // Inicia el fade-in de la escena
    this.cameras.main.fadeIn(4000, 255, 255, 255);
  }

  // Lógica de las escenas
  update () { }
};

const scene_credits = new SceneCredits();

LOCAL.scenes.push(scene_credits);
LOCAL.avaliable_scenes.push(scene_credits);
