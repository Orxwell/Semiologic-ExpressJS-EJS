class SceneOne extends Phaser.Scene {
  constructor() { 
    super({ key: 'LevelOne' }); 
  }

  preload() {
    // Cargando imágenes desde la fuente de la web
    this.load.image('backgroundOne'  , '/api/img/scenes/scene_one.png'  );
    this.load.image('backgroundTwo'  , '/api/img/scenes/scene_two.png'  );
    this.load.image('backgroundThree', '/api/img/scenes/scene_three.png');
    this.load.image('backgroundFour' , '/api/img/scenes/scene_four.png' );

    this.load.image('cartelV1', '/api/img/properties/cartel_v1.png');
    this.load.image('cartelV2', '/api/img/properties/cartel_v2.png');
  }

  create() {
    // Fondo de la escena agregada, centrada
    this.background = this.add.image(
      CONFIG.scale.width  / 2,
      CONFIG.scale.height / 2,
      'backgroundOne'
    );
    this.background.setScale(Math.max(
      CONFIG.scale.width  / this.background.width ,
      CONFIG.scale.height / this.background.height
    ));

    // Agregar los props (carteles)
    this.cartel_one = new Cartel(this, 450, CONFIG.scale.height - 105, 'cartelV1',
      'Instrucciones', '¡Sigue avanzando y recuerda interactuar con los carteles!'
    );
    this.cartel_two = new Cartel(this, 800, CONFIG.scale.height - 105, 'cartelV2',
      'Heraclito (535a.C - 470a.C)', LOCAL.cartel_info[0]
    );
    this.cartel_three = new Cartel(this, 1100, CONFIG.scale.height - 105, 'cartelV2',
      'Platón (427a.C - 347a.C)', LOCAL.cartel_info[1]
    );
    this.cartel_four = new Cartel(this, 1400, CONFIG.scale.height - 105, 'cartelV2',
      'Aristóteles (348a.C - 322a.C)', LOCAL.cartel_info[2]
    );

    // Inicia el fade-in de la escena
    this.cameras.main.fadeIn(4000, 0, 0, 0);
  }

  update() {
    // Actualizar cada cartel
    this.cartel_one.update(LOCAL.player)  ;
    this.cartel_two.update(LOCAL.player)  ;
    this.cartel_three.update(LOCAL.player);
    this.cartel_four.update(LOCAL.player) ;
  }
}

const scene_one = new SceneOne();

LOCAL.scenes.push(scene_one);
LOCAL.avaliable_scenes.push(scene_one);
