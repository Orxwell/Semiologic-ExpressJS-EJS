class SceneTwo extends Phaser.Scene {
  constructor () { super({ key: 'LevelTwo' }); } // Nombre de la escena

  // Eeta función precarga propiedades de la escena antes de crearla
  preload () { }

  // Esta función carga la escena en el juego
  create () {
    // Fondo de la escena agregada, centrada
    this.background = this.add.image(
      CONFIG.scale.width  / 2,
      CONFIG.scale.height / 2,
      'backgroundTwo'
    );
    this.background.setScale(Math.max(
      CONFIG.scale.width  / this.background.width ,
      CONFIG.scale.height / this.background.height,
    ));

    // Agregar los props (carteles)
    this.cartel_five = new Cartel(this, 600, CONFIG.scale.height - 105, 'cartelV2',
      'Los Estoicos (301 a.C)', LOCAL.cartel_info[3]
    );
    this.cartel_six = new Cartel(this, 1000, CONFIG.scale.height - 105, 'cartelV2',
      'Los estoicos...', LOCAL.cartel_info[4]
    );
    this.cartel_seven = new Cartel(this, 1400, CONFIG.scale.height - 105, 'cartelV2',
      'Sexto Empírico (160d.C - 210d.C)', LOCAL.cartel_info[5]
    );

    // Inicia el fade-in de la escena
    this.cameras.main.fadeIn(4000, 0, 0, 0);
  }

  // Lógica de las escenas
  update () {
    // Actualizar cada cartel
    this.cartel_five.update(LOCAL.player) ;
    this.cartel_six.update(LOCAL.player)  ;
    this.cartel_seven.update(LOCAL.player);
  }
};

const scene_two = new SceneTwo();

LOCAL.scenes.push(scene_two);
LOCAL.avaliable_scenes.push(scene_two);