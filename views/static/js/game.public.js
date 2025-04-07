function forceCanvasResize() {
  if (game && game.scale) {
    game.scale.refresh();
  }
}

function isMobile() {
  return (
    /Mobi|Android|iPhone/i.test(navigator.userAgent) ||
    (navigator.userAgentData && navigator.userAgentData.mobile) ||
    (window.innerWidth <= 800 && 'ontouchstart' in window)
  );
}

function requestFullScreen() {
  if (!LOCAL.is_fullscreen) {
    const elem = document.documentElement;

    try {
      if (elem.requestFullscreen) elem.requestFullscreen();
      else if (elem.mozRequestFullScreen)    elem.mozRequestFullScreen();
      else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
      else if (elem.msRequestFullscreen)     elem.msRequestFullscreen();
      
    } catch (err) { console.warn('Fullscreen error:', err); }
  }
}

function handleOrientation() {
  const isPortrait = window.innerHeight > window.innerWidth;
  const warningDiv = document.getElementById('mobile-warning');

  if (isPortrait) {
    if (!warningDiv) {
      const div = document.createElement('div');
      div.id        = 'mobile-warning';
      div.innerHTML = '🔁 Gira tu dispositivo para jugar en modo horizontal';

      document.body.appendChild(div);
    }

    document.body.classList.add('rotate-screen');
  } else {
    warningDiv?.remove();
    document.body.classList.remove('rotate-screen');
  }
}


class Player extends Phaser.Physics.Arcade.Sprite {
  constructor (scene, x, y) {
    super(scene, x, y, 'playerIdle');

    this.scene = scene;

    this.looking = 'right';

    this.cursors = this.scene.input.keyboard.createCursorKeys();
  }

  static preload (scene) {
    // Precargar la música y sonidos
    scene.load.audio('backgroundMusic', '/api/audio/background.mp3');

    scene.load.audio('typingSound', '/api/audio/typewriter_taps.mp3');

    // Precargar spritesheets desde el servidor
    scene.load.spritesheet('playerIdle', '/api/img/characters/player.png', {
      frameWidth : 128,
      frameHeight: 128
    });
    scene.load.spritesheet('playerWalking', '/api/img/characters/player_walking.png', {
      frameWidth : 128,
      frameHeight: 128
    });
  }

  create () {
    // Agregar el jugador a la escena actual y configurar físicas
    this.scene.add.existing(this)        ;
    this.scene.physics.add.existing(this);

    // Configurar las propiedades del body
    this.setScale(4);
    this.setSize(22, 68);
    this.setOffset(50, 60);
    this.setCollideWorldBounds(true);

    // Crear animaciones si aún no existen en la escena
    if (!this.scene.anims.exists('idle')) {
      this.scene.anims.create({
        key: 'idle',
        frames: this.scene.anims.generateFrameNumbers('playerIdle', { start: 0, end: 6 }),
        frameRate: 5,
        repeat: -1
      });
    }
    
    if (!this.scene.anims.exists('walk')) {
      this.scene.anims.create({
        key: 'walk',
        frames: this.scene.anims.generateFrameNumbers('playerWalking', { start: 0, end: 9 }),
        frameRate: 15,
        repeat: -1
      });
    }
  }

  update () {
    // Lógica para manejar el teclado
    if (this.cursors.right.isDown || this.scene.isButtonRightPressed) {
      if (!this.scene.music) {
        this.scene.music = this.scene.sound.add('backgroundMusic', { 
            volume: LOCAL.is_mobil ? 0.06 : 0.02,
            loop: true
        });
        this.scene.music.play(); 
      }

      if (LOCAL.movement_enabled) {
        this.setVelocityX(400);
        this.setFlipX(false);
        this.setSize(17, 68);
        this.setOffset(50, 60);

        this.anims.play('walk', true);

        this.looking = 'right';
      }

    } else if (this.cursors.left.isDown || this.scene.isButtonLeftPressed) {
      if (LOCAL.movement_enabled) {
        this.setVelocityX(-400);
        this.setFlipX(true);
        this.setSize(17, 68);
        this.setOffset(60, 60);

        this.anims.play('walk', true);

        this.looking = 'left';
      }
      
    } else {
      this.setVelocityX(0);
      this.setSize(22, 68);
      this.setOffset(this.looking === 'right' ? 50 : 55, 60);

      this.anims.play('idle', true);
    }

    // Lógica para cambiar de escenas desde la derecha
    if (
      this.x >= CONFIG.scale.width - (this.width / 2) &&
      LOCAL.current_scene_index < (LOCAL.avaliable_scenes.length-1) &&
      LOCAL.movement_enabled
    ) {
      this.changeScene('right');
    }

    // Lógica para cambiar de escenas desde la izquierda
    if (
      this.x <= (this.width / 2) &&
      LOCAL.current_scene_index > 0 &&
      LOCAL.movement_enabled
    ) {
      this.changeScene('left');
    }
  }

  changeScene (to) {
    LOCAL.movement_enabled = false;

    this.setVelocity(0);
    this.anims.play('idle', true);

    if (to === 'right') LOCAL.current_scene_index++;
    else LOCAL.current_scene_index--;

    const searched_scene = LOCAL.avaliable_scenes[LOCAL.current_scene_index];
    const to_scene = searched_scene.scene.key;

    this.scene.events.emit('changeLevel',
      { level: to_scene, flag: to }
    );
  }
}

class Cartel extends Phaser.GameObjects.Container {
  constructor(scene, x, y, imageKey, proximityText, interactText) {
    super(scene, x, y);
    this.scene                = scene       ;
    this.interactText         = interactText;
    this.in_range             = false       ;
    this.is_buttonA_pressed   = false       ;
    this.is_animation_running = false       ;
    
    // Agregar la imagen del cartel
    this.image = scene.add.image(0, 0, imageKey);
    this.image.setScale(0.45);
    this.add(this.image);
    
    // Crear el contenedor de interacción con texto
    this.textContainer = this.createInteractionContainer(proximityText, {
      font: "35px Arial",
      fill: "#ffffff"
    }, {
      backgroundColor: "#000000",
      padding: { left: 10, right: 10, top: 10, bottom: 10 },
      radius: 10
    }, {
      x: this.scene.cameras.main.width / 2,
      y: this.scene.cameras.main.height - 300,
      forced: false
    }, false);

    if (LOCAL.is_mobil) {
      // Crearar el botón "A" para interactuar
      this.buttonA = this.scene.add.image(
        this.scene.cameras.main.width - 200,
        this.scene.cameras.main.height - 300,
        'buttonA'
      ).setScale(2.5).setInteractive();

      // Asignar el evento para cuando se toque el botón "A"
      this.buttonA.on('pointerdown', () => this.is_buttonA_pressed = true);
      
    } else {
      this.textContainer_E = this.createInteractionContainer('Presiona E para interactuar', {
        font: "30px Arial",
        fill: "#000000"
      }, {
        backgroundColor: "#ffffff",
        padding: { left: 10, right: 10, top: 10, bottom: 10 },
        radius: 10
      }, {
        x: 50,
        y: 50,
        forced: true
      }, false);
    }

    this.interactedContainer = this.createInteractionContainer(interactText, {
      font: "38px Arial",
      fill: "#ffffff"
    }, {
      backgroundColor: "#000000",
      padding: { left: 10, right: 10, top: 10, bottom: 10 },
      radius: 10
    }, {
      x: this.scene.cameras.main.width / 2,
      y: this.scene.cameras.main.height - 900,
      forced: false
    }, true);

    // Inicialmente ocultar los textos
    this.textContainer.setVisible(false);
    if (LOCAL.is_mobil) this.buttonA.setVisible(false);
    else this.textContainer_E.setVisible(false);
    this.interactedContainer.setVisible(false);
    
    // Tecla de interacción (se puede compartir entre carteles o crearse individualmente)
    this.keyE = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    
    // Bandera para el efecto de "brillo"
    this.glowing = false;
    
    // Agregar este contenedor al display list de la escena
    scene.add.existing(this);
  }
  
  createInteractionContainer(text, textStyle, containerStyle, relPos, isAnimated) {
    // Definir un valor máximo para el ancho del texto
    const maxWidth = 1600;

    // Crear el texto con wordWrap ajustable
    const txt = this.scene.add.text(0, 0, text, {
      ...textStyle,
      wordWrap: { width: maxWidth, useAdvancedWrap: true }
    });

    // Si el texto es más corto que maxWidth, ajustar wordWrap.width dinámicamente
    const realWidth = txt.width < maxWidth ? txt.width : maxWidth;

    // Extraer padding y calcular dimensiones
    const padding = containerStyle.padding || { left: 0, right: 0, top: 0, bottom: 0 };
    const width   = realWidth  + padding.left + padding.right ;
    const height  = txt.height + padding.top  + padding.bottom;
    
    // Crear un gráfico para el fondo redondeado
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(Phaser.Display.Color.HexStringToColor(containerStyle.backgroundColor).color, 1);
    graphics.fillRoundedRect(0, 0, width, height, containerStyle.radius || 0);
    
    // Generar textura con identificador único
    const textureKey = `interactionBG_${Phaser.Math.RND.uuid()}`;
    graphics.generateTexture(textureKey, width, height);
    graphics.destroy();
    
    // Crear la imagen de fondo a partir de la textura generada
    const bg = this.scene.add.image(0, 0, textureKey).setOrigin(0);
    
    let abs_pos_x = relPos.x - (width / 2);
    let abs_pos_y = relPos.y;

    // Crear un contenedor que agrupe el fondo y el texto
    const container = this.scene.add.container(
      relPos.forced ? relPos.x : abs_pos_x, 
      relPos.forced ? relPos.y : abs_pos_y,
      [bg, txt]
    );
    
    // Posicionar el texto dentro del contenedor
    txt.setPosition(padding.left, padding.top);

    // Agregar a la escena
    this.scene.add.existing(container);

    // Animar el texto
    if (isAnimated) {
      container.txt = txt;

      container.animateText = (newText, speed=50) => {
        txt.setText(''); // Reiniciar texto

        if (!container.typingSound) {
          container.typingSound = this.scene.sound.add('typingSound');
        }

        container.typingSound.play({ loop: true, volume: 0.5 });

        let index = 0;
        const interval = this.scene.time.addEvent({
          delay: speed,
          callback: () => {
            txt.setText(txt.text + newText[index]);

            index++;
            if (index >= newText.length || !this.in_range) {
              interval.remove();
              if (container.typingSound) container.typingSound.stop(); 
            }
          },
          repeat: newText.length-1
        });
      };
    }

    return container;
  }
  
  update(player) {
    // Calcular la distancia entre el jugador y este cartel (se usa la posición global del contenedor)
    const dist = Phaser.Math.Distance.Between(
      player.x, player.y,
      this.x  , this.y
    );
    
    if (dist < 190) {
      // Activar el efecto de brillo si no está activo
      if (!this.glowing) {
        this.glowing = true;
        this.scene.tweens.add({
          targets: this.image,
          tint: { from: 0xffff00, to: 0xffffff },
          ease: 'Sine.easeInOut',
          duration: 500,
          yoyo: true,
          repeat: -1
        });
      }
      
      // Mostrar los contenedores
      this.textContainer.setVisible(true);
      if (LOCAL.is_mobil) this.buttonA.setVisible(true);
      else this.textContainer_E.setVisible(true);
      
      // Si se presiona la tecla E o el botón A, mostrar un mensaje o realizar la interacción
      if (
        (Phaser.Input.Keyboard.JustDown(this.keyE) || this.is_buttonA_pressed) &&
        !this.is_animation_running
      ) {
        this.in_range           = true ;
        this.is_buttonA_pressed = false;

        this.interactedContainer.setVisible(true);
        this.interactedContainer.animateText(this.interactText, 50);

        this.is_animation_running = true;
      }
    } else {
      this.in_range           = false;
      this.is_buttonA_pressed = false;

      if (this.glowing) {
        this.glowing = false;
        this.image.clearTint();
        this.scene.tweens.killTweensOf(this.image);
      }
      this.textContainer.setVisible(false);
      if (LOCAL.is_mobil) this.buttonA.setVisible(false);
      else this.textContainer_E.setVisible(false);
      this.interactedContainer.setVisible(false);

      this.is_animation_running = false;
    }
  }
}

class GlobalScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GlobalScene', active: true });
  }

  preload() {
    // Precargar los assets del jugador
    Player.preload(this);

    // Precargar las imágenes de los botones si está en móvil
    if (LOCAL.is_mobil) {
      this.load.image('buttonLeft' , '/api/img/controlers/button_left.png' );
      this.load.image('buttonRight', '/api/img/controlers/button_right.png');

      this.load.image('buttonA', '/api/img/controlers/button_a.png');
    }
  }

  create() {
    // Crear el jugador y agregarlo a esta escena global
    LOCAL.player = new Player(this, 250, CONFIG.scale.height);
    LOCAL.player.create();

    // Crear los botones si está en móvil
    if (LOCAL.is_mobil) this.createMobileControls();

    // Configurar fondo transparente
    this.cameras.main.setBackgroundColor('rgba(0,0,0,0)');

    this.scene.launch('LevelOne');

    // Escuchar el evento para cambiar de nivel
    this.events.on('changeLevel', ({ level: newLevelKey, flag }={}) => {
      this.transitionToLevel(newLevelKey, flag);
    });

    this.scene.bringToTop('GlobalScene');

    // Inicia el fade-in de la escena
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  update() { LOCAL.player.update(); }

  createMobileControls () {
    // Posiciones y escala de los botones, ajusta según tu diseño
    const buttonScale = 2;
    const margin = 50;

    const rel_pos = margin * buttonScale;
  
    // Botón izquierdo
    this.button_left = this.add.image(
      rel_pos,
      this.cameras.main.height - rel_pos - margin,
      'buttonLeft'
    ).setScale(buttonScale).setInteractive();
    this.isButtonLeftPressed = false;
  
    // Botón derecho
    this.button_right = this.add.image(
      this.cameras.main.width - this.button_left.width,
      this.cameras.main.height - rel_pos - margin,
      'buttonRight'
    ).setScale(buttonScale).setInteractive();
    this.isButtonRightPressed = false;

    // Asignar eventos para el botón izquierdo
    this.button_left.on('pointerdown', () => this.isButtonLeftPressed = true );
    this.button_left.on('pointerup'  , () => this.isButtonLeftPressed = false);
    this.button_left.on('pointerout' , () => this.isButtonLeftPressed = false);

    // Asignar eventos para el botón derecho
    this.button_right.on('pointerdown', () => this.isButtonRightPressed = true );
    this.button_right.on('pointerup'  , () => this.isButtonRightPressed = false);
    this.button_right.on('pointerout' , () => this.isButtonRightPressed = false);
  }

  transitionToLevel(newLevelKey, flag) {
    // Inicia fade-out de la escena
    this.cameras.main.fadeOut(500, 0, 0, 0);

    this.cameras.main.once('camerafadeoutcomplete', () => {
      // Detener todas las escenas
      LOCAL.avaliable_scenes.forEach(scene => {
        if (this.scene.isActive(scene.scene.key)) {
          this.scene.stop(scene.scene.key);
        }
      });
  
      // Lanzar la nueva escena de nivel
      this.scene.launch(newLevelKey);

      // Posicionamos GlobalScene
      this.scene.bringToTop('GlobalScene');

      // Reposicionar al jugador y rehabilitamos su movimiento
      LOCAL.player.setPosition(
        flag === 'right'
          ? 250
          : CONFIG.scale.width - 250,
        CONFIG.scale.height
      );
      LOCAL.movement_enabled = true;
    });

    this.time.delayedCall(1000, () => {
      // Inicia el fade-in de la escena
      this.cameras.main.fadeIn(500, 0, 0, 0);
    });
  }
}

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


const LOCAL = {
  player          : null,
  movement_enabled: true,

  is_mobil     : false,
  is_fullscreen: false,

  scenes             : [],
  avaliable_scenes   : [],
  current_scene_index: 0 ,

  cartel_info: [
    'Pierce argumentó que el signo tendría tres partes, esto viene ' +
    'desde Heraclito: <<Logos>>, <<Epos>> y <<Ergon>>. El logos crea ' +
    'el epos, el cual a su vez designa al ergon (...)',

    '\"Signo, significado del signo y el objeto. tres miembros que ' +
    'hace parte de un todo\". El signo es creado por la necesita de ' +
    'expresión, ayuda o comunicación. \"(...) Los objetos del mundo ' +
    'son estímulos sensoriales que ayudan a reconstruir la verdad a ' +
    'través del recuerdo (...)\". Platón habla del mito de la ' +
    'caverna, para explicar el proceso de conocimiento. Para ' +
    'aquellos hombres en la caverna, las sobras eran su único ' +
    'referente del mundo. El término referente será clave para la ' +
    'comprensión del signo.',

    '\"Doctrina de los signos\", \"Teoría de los signos\", \"Arte de ' +
    'los signos\", \"Estudiosos de los signos\" eran términos ' +
    'conocidos en el tiempo de Aristóteles que antecedieron al ' +
    'término \"Semiótica\". Yo, cosa y palabra, una unidad tripartita ' +
    'cuando se habla del signo. Aristóteles llama símbolos a las ' +
    'palabras, y las palabras en si mismas no son ni verdaderas ni ' +
    'falsas, sólo designan cosas. Aristóteles se da cuenta de que los ' +
    'signos pueden ser de diversas clases, los entimemas constan de ' +
    'una oración antecedente y otra consecuente.',

    'En los siglos I y II antes de Cristo, se desarrolló nueva luz ' +
    'sobre la compresión del signo, se ve la primera distinción ' +
    'entre significado, significante y objeto, o referente. \"Para ' +
    'los estoicos el significante, o palabra, y el objeto, o ' +
    'referente, eran cuerpos, mientras que el significado no, pues ' +
    'al estar este en relación de referencia al objeto real no puede ' +
    'ser considerado como un cuerpo sino como atributo.\"',

    'Los estoicos tenían un ejemplo que nos ayuda a comprender de ' +
    'mejor manera la relación entre significado, significante y ' +
    'referente: \"Un griego y un bárbaro escuchan una misma palabra, ' +
    'y aunque ambos tienen la representación del objeto referido por ' +
    'esa palabra, uno la entiende y el otro no. Sólo para el griego ' +
    'el objeto tiene un atributo [un lécton, un expresable que le ' +
    'permite volver legible un significado] que le permite que, en ' +
    'su lengua, ese objeto sea significado por la palabra en cuestión.\"',

    'Su texto famoso explica la doctrina estóica: \"Tres cosas se ' +
    'juntan: la cosa significada, el significante y la cosa que ' +
    'existe. De estas la cosa significante es la voz; la cosa ' +
    'significada es el mismo objeto que se indica, objeto que ' +
    'nosotros percibimos en su presentación real a través de nuestro ' +
    'pensamiento (...)\".',

    '\"De Magistro\" y \"De Doctrina Christiana\", fueron obras de ' +
    'San Agustín en las que trató el tema del signo. El lenguaje ' +
    'humano verbal consta de tres partes: la locución o la palabra ' +
    'que se manifiesta, la palabra interior y la fuerza recursiva ' +
    'mediante la cual la palabra hace venir a la memoria las cosas ' +
    'mismas.',

    'Agustín estableció la distinción entre signos naturales y ' +
    'signos convencionales: \"(...) los naturales son aquellos que ' +
    'sin elección ni deseo alguno, hacen que se conozca mediante ' +
    'ellos (...) El humo es señal de fuego, (...) Los signos ' +
    'convencionales son los que mutuamente se dan todos los vivientes ' +
    'para manifestar los movimientos del alma (...)\".',

    'John Locke (1623 - 1704): Usó el término semiótica en su ' +
    '\"Neuen Organon\" para indicar lo que él denomina ' +
    '<<Conocimiento Simbólico>>. Para Locke, el punto de arranque ' +
    'para cualquier conocimiento proviene de la experiencia “Nada ' +
    'hay en el priori, todo brota de los datos que nos proporcionan ' +
    'los sentidos, y sólo a través de ellos es posible acceder a las ' +
    'ideas.\"',

    'Locke reconoce que el ser humano usa las palabras \"como signos ' +
    'de sus concepciones internas\", para poder nombrar la realidad. ' +
    'De manera paralela, Ferdinand de Saussure (1857 - 1913) y ' +
    'Charles Sanders Pierce (1839 - 1914) introdujeron términos como ' +
    'la semiología y la semiótica para indicar el estado de los ' +
    'signos.',

    'Pierce concibió la semiótica como un campo científico ' +
    'articulado en otro a flexiones de carácter lógico-filosófico ' +
    'que tuviera como objeto específico de su investigación la ' +
    '\"semiosis\", es decir, el significado profundo de \"Un signo, ' +
    'su objeto y su interpretante\". Pierce concibió la semiótica ' +
    'como un campo científico articulado entorno a reflexiones de ' +
    'carácter lógico-filosófico que tuvieran como objeto específico ' +
    'de su investigación la \"semiósis\", es decir, el proceso de ' +
    'significiación donde participan \"un signo, su objeto y su ' +
    'interpretante.\"',

    '¡Hemos llegado al final del recorrido, has encontrado al signo!'
  ],
};

if (isMobile()) {
  LOCAL.is_mobil = true;

  window.addEventListener('load', handleOrientation);
  window.addEventListener('resize', () => {
    handleOrientation();
    setTimeout(forceCanvasResize, 100);
  });
  window.addEventListener('orientationchange', () => {
    handleOrientation();
    setTimeout(forceCanvasResize, 300);
  });
}

// Pantalla completa al primer click, o toque
window.addEventListener('click'     , requestFullScreen);
window.addEventListener('touchstart', requestFullScreen);

document.addEventListener('fullscreenchange', () => {
  LOCAL.is_fullscreen = !!document.fullscreenElement;
});

LOCAL.scenes.push(new GlobalScene());
[new SceneOne(), new SceneTwo(), new SceneThree(), new SceneFour()]
  .forEach(scene => {
    LOCAL.scenes.push(scene);
    LOCAL.avaliable_scenes.push(scene);
  }
);

// Configuraciones generales
const CONFIG = {
  type   : Phaser.AUTO,
  scale  : {
    mode      : Phaser.Scale.FIT        , // Escalado automático
    autoCenter: Phaser.Scale.CENTER_BOTH, // Centrado automático
    
    width : 1920, // 800 o 1920 (ancho en pixeles)
    height: 1080, // 600 o 1080 (alto en pixeles)
  },
  physics: {
    default: 'arcade', // Tipo de motor
    arcade: {
      gravity: { y: 0 }, // Aceleración G
      debug  : false   , // (por defecto: false)
    }
  },
  audio: {
    disableWebAudio: false
  },
  scene: LOCAL.scenes,
};

// instancia del juego
const game = new Phaser.Game(CONFIG);
