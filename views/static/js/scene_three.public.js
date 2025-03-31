class SceneThree extends Phaser.Scene {
  constructor () { super({ key: 'LevelThree' }); } // Nombre de la escena

  // Eeta función precarga propiedades de la escena antes de crearla
  preload () { }

  // Esta función carga la escena en el juego
  create () {
    // Fondo de la escena agregada, centrada
    this.background = this.add.image(
      CONFIG.scale.width  / 2,
      CONFIG.scale.height / 2,
      'backgroundThree'
    );
    this.background.setScale(Math.max(
      CONFIG.scale.width  / this.background.width ,
      CONFIG.scale.height / this.background.height,
    ));

    // Agregar los props (carteles)
    this.cartel_eight = new Cartel(this, 600, CONFIG.scale.height - 105, 'cartelV2',
      'San Agustín (354d.C - 430d.C)', LOCAL.cartel_info[6]
    );
    this.cartel_nine = new Cartel(this, 1000, CONFIG.scale.height - 105, 'cartelV2',
      'Agustín...', LOCAL.cartel_info[7]
    );
    this.cartel_ten = new Cartel(this, 1400, CONFIG.scale.height - 105, 'cartelV2',
      'John Locke (1623 - 1704)', LOCAL.cartel_info[8]
    );

    // Inicia el fade-in de la escena
    this.cameras.main.fadeIn(4000, 0, 0, 0);
  }

  // Lógica de las escenas
  update () {
    // Actualizar cada cartel
    this.cartel_eight.update(LOCAL.player);
    this.cartel_nine.update(LOCAL.player) ;
    this.cartel_ten.update(LOCAL.player)  ;
  }
};

const scene_three = new SceneThree();

LOCAL.scenes.push(scene_three);
LOCAL.avaliable_scenes.push(scene_three);
