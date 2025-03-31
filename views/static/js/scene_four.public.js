class SceneFour extends Phaser.Scene {
  constructor () { super({ key: 'LevelFour' }); } // Nombre de la escena

  // Eeta función precarga propiedades de la escena antes de crearla
  preload () { }

  // Esta función carga la escena en el juego
  create () {
    // Fondo de la escena agregada, centrada
    this.background = this.add.image(
      CONFIG.scale.width  / 2,
      CONFIG.scale.height / 2,
      'backgroundFour'
    );
    this.background.setScale(Math.max(
      CONFIG.scale.width  / this.background.width ,
      CONFIG.scale.height / this.background.height,
    ));

    // Agregar los props (carteles)
    this.cartel_eleven = new Cartel(this, 600, CONFIG.scale.height - 105, 'cartelV2',
      'Lock...', LOCAL.cartel_info[9]
    );
    this.cartel_twelve = new Cartel(this, 1000, CONFIG.scale.height - 105, 'cartelV2',
      'Pierce...', LOCAL.cartel_info[10]
    );
    this.cartel_thirteen = new Cartel(this, 1600, CONFIG.scale.height - 105, 'cartelV1',
      '¡Final!', LOCAL.cartel_info[11]
    );

    // Inicia el fade-in de la escena
    this.cameras.main.fadeIn(4000, 0, 0, 0);
  }

  // Lógica de las escenas
  update () {
    // Actualizar cada cartel
    this.cartel_eleven.update(LOCAL.player)  ;
    this.cartel_twelve.update(LOCAL.player)  ;
    this.cartel_thirteen.update(LOCAL.player);
  }
};

const scene_four = new SceneFour();

LOCAL.scenes.push(scene_four);
LOCAL.avaliable_scenes.push(scene_four);
