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
  const warningDiv = document.getElementById('mobile-warning');

  if (window.innerHeight > window.innerWidth) {
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


class Cartel extends Phaser.GameObjects.Container {
  constructor(scene, x, y, imageKey, proximityText, interactText) {
    super(scene, x, y);
    this.scene                = scene       ;
    this.interactText         = interactText;
    this.in_range             = false       ;
    this.is_buttonA_pressed   = false       ;
    this.is_animation_running = false       ;
    
    // Agregar la imagen del cartel
    this.image = scene.add.image(0, 0, imageKey)
      .setScale(0.45);
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
    const bg = this.scene.add.image(0, 0, textureKey)
      .setOrigin(0);
    
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

        if (!container.typingSound) container.typingSound = this.scene.sound.add('typingSound');

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
  scene: {
    preload,
    create ,
    update ,
  },
  parent: 'game-container',
  backgroundColor: '#444', // rgb(81, 120, 145)
};

const LOCAL = {
  is_mobil     : false,
  is_fullscreen: false,

  current_stage_index: 0 ,
  phases: [
    {
      background: 'backgroundOne',
      cartels: [
        { x: 450 , y: CONFIG.scale.height - 105, asset: 'cartelV1', proximityText: 'Instrucciones'                , interactText: '¡Sigue avanzando y recuerda interactuar con los carteles!' },
        { x: 800 , y: CONFIG.scale.height - 105, asset: 'cartelV2', proximityText: 'Heraclito (535a.C - 470a.C)'  , interactText: 'Pierce argumentó que el signo tendría tres partes, esto viene desde Heraclito: <<Logos>>, <<Epos>> y <<Ergon>>. El logos crea el epos, el cual a su vez designa al ergon (...)' },
        { x: 1100, y: CONFIG.scale.height - 105, asset: 'cartelV2', proximityText: 'Platón (427a.C - 347a.C)'     , interactText: '\"Signo, significado del signo y el objeto. tres miembros que hace parte de un todo\". El signo es creado por la necesidad de expresión, ayuda o comunicación. \"(...) Los objetos del mundo son estímulos sensoriales que ayudan a reconstruir la verdad a través del recuerdo (...)\". Platón habla del mito de la caverna, para explicar el proceso de conocimiento. Para aquellos hombres en la caverna, las sobras eran su único referente del mundo. El término referente será clave para la comprensión del signo.' },
        { x: 1400, y: CONFIG.scale.height - 105, asset: 'cartelV2', proximityText: 'Aristóteles (348a.C - 322a.C)', interactText: '\"Doctrina de los signos\", \"Teoría de los signos\", \"Arte de los signos\", \"Estudiosos de los signos\" eran términos conocidos en el tiempo de Aristóteles que antecedieron al término \"Semiótica\". Yo, cosa y palabra, una unidad tripartita cuando se habla del signo. Aristóteles llama símbolos a las palabras, y las palabras en si mismas no son ni verdaderas ni falsas, sólo designan cosas. Aristóteles se da cuenta de que los signos pueden ser de diversas clases, los entimemas constan de una oración antecedente y otra consecuente.' },
      ]
    },
    {
      background: 'backgroundTwo',
      cartels: [
        { x: 600 , y: CONFIG.scale.height - 105, asset: 'cartelV2', proximityText: 'Los Estoicos (301 a.C)'          , interactText: 'En los siglos I y II antes de Cristo, se desarrolló nueva luz sobre la compresión del signo, se ve la primera distinción entre significado, significante y objeto, o referente. \"Para los estoicos el significante, o palabra, y el objeto, o referente, eran cuerpos, mientras que el significado no, pues al estar este en relación de referencia al objeto real no puede ser considerado como un cuerpo sino como atributo.\"' },
        { x: 1000, y: CONFIG.scale.height - 105, asset: 'cartelV2', proximityText: 'Los estoicos...'                 , interactText: 'Los estoicos tenían un ejemplo que nos ayuda a comprender de mejor manera la relación entre significado, significante y referente: \"Un griego y un bárbaro escuchan una misma palabra, y aunque ambos tienen la representación del objeto referido por esa palabra, uno la entiende y el otro no. Sólo para el griego el objeto tiene un atributo [un lécton, un expresable que le permite volver legible un significado] que le permite que, en su lengua, ese objeto sea significado por la palabra en cuestión.\"' },
        { x: 1400, y: CONFIG.scale.height - 105, asset: 'cartelV2', proximityText: 'Sexto Empírico (160d.C - 210d.C)', interactText: 'Su texto famoso explica la doctrina estóica: \"Tres cosas se juntan: la cosa significada, el significante y la cosa que existe. De estas la cosa significante es la voz; la cosa significada es el mismo objeto que se indica, objeto que nosotros percibimos en su presentación real a través de nuestro pensamiento (...)\".' },
      ]
    },
    {
      background: 'backgroundThree',
      cartels: [
        { x: 600 , y: CONFIG.scale.height - 105, asset: 'cartelV2', proximityText: 'San Agustín (354d.C - 430d.C)', interactText: '\"De Magistro\" y \"De Doctrina Christiana\", fueron obras de San Agustín en las que trató el tema del signo. El lenguaje humano verbal consta de tres partes: la locución o la palabra que se manifiesta, la palabra interior y la fuerza recursiva mediante la cual la palabra hace venir a la memoria las cosas mismas.' },
        { x: 1000, y: CONFIG.scale.height - 105, asset: 'cartelV2', proximityText: 'Agustín...'                   , interactText: 'Agustín estableció la distinción entre signos naturales y signos convencionales: \"(...) los naturales son aquellos que sin elección ni deseo alguno, hacen que se conozca mediante ellos (...) El humo es señal de fuego, (...) Los signos convencionales son los que mutuamente se dan todos los vivientes para manifestar los movimientos del alma (...)\".' },
        { x: 1400, y: CONFIG.scale.height - 105, asset: 'cartelV2', proximityText: 'John Locke (1623 - 1704)'     , interactText: 'John Locke (1623 - 1704): Usó el término semiótica en su \"Neuen Organon\" para indicar lo que él denomina <<Conocimiento Simbólico>>. Para Locke, el punto de arranque para cualquier conocimiento proviene de la experiencia “Nada hay en el priori, todo brota de los datos que nos proporcionan los sentidos, y sólo a través de ellos es posible acceder a las ideas.\"' },
      ]
    },
    {
      background: 'backgroundFour',
      cartels: [
        { x: 600 , y: CONFIG.scale.height - 105, asset: 'cartelV2', proximityText: 'Lock...'  , interactText: 'Locke reconoce que el ser humano usa las palabras \"como signos de sus concepciones internas\", para poder nombrar la realidad.' },
        { x: 1000, y: CONFIG.scale.height - 105, asset: 'cartelV2', proximityText: 'Pierce...', interactText: 'Pierce concibió la semiótica como un campo científico articulado en otro a flexiones de carácter lógico-filosófico que tuviera como objeto específico de su investigación la \"semiosis\", es decir, el significado profundo de \"Un signo, su objeto y su interpretante\". Pierce concibió la semiótica como un campo científico articulado entorno a reflexiones de carácter lógico-filosófico que tuvieran como objeto específico de su investigación la \"semiósis\", es decir, el proceso de significiación donde participan \"un signo, su objeto y su interpretante.\"' },
        { x: 1600, y: CONFIG.scale.height - 105, asset: 'cartelV1', proximityText: '¡Final!'  , interactText: '¡Hemos llegado al final del recorrido, has encontrado al signo!' },
      ]
    },
  ],
};

function preload () {
  // Precargar la música, y sonidos, desde el servidor
  this.load.audio('backgroundMusic', '/api/audio/background.mp3'     );
  this.load.audio('typingSound'    , '/api/audio/typewriter_taps.mp3');

  // Precargar spritesheets desde el servidor
  this.load.spritesheet('playerIdle', '/api/img/characters/player.png', {
    frameWidth : 128,
    frameHeight: 128,
  });
  this.load.spritesheet('playerWalking', '/api/img/characters/player_walking.png', {
    frameWidth : 128,
    frameHeight: 128,
  });

  // Precargar las imágenes de los botones si está en móvil
  if (LOCAL.is_mobil) {
    this.load.image('buttonLeft' , '/api/img/controllers/button_left.png' );
    this.load.image('buttonRight', '/api/img/controllers/button_right.png');

    this.load.image('buttonA', '/api/img/controllers/button_a.png');
  }

  // Precargar imágenes desde el servidor
  this.load.image('backgroundOne'  , '/api/img/backgrounds/background_one.png'  );
  this.load.image('backgroundTwo'  , '/api/img/backgrounds/background_two.png'  );
  this.load.image('backgroundThree', '/api/img/backgrounds/background_three.png');
  this.load.image('backgroundFour' , '/api/img/backgrounds/background_four.png' );

  this.load.image('cartelV1', '/api/img/properties/cartel_v1.png');
  this.load.image('cartelV2', '/api/img/properties/cartel_v2.png');
}

function create () {
  this.cartels = [];

  const props = LOCAL.phases[0];

  // Crear el fondo y agregarlo a la escena
  this.background = this.add.image(
    CONFIG.scale.width  / 2,
    CONFIG.scale.height / 2,
    props.background
  );
  this.background.setScale(Math.max(
    CONFIG.scale.width  / this.background.width ,
    CONFIG.scale.height / this.background.height,
  ));

  // Crear los carteles correspondientes y agregarlos a la escena
  props.cartels.forEach(cartel => {
    this.cartels.push(new Cartel(this,
      cartel.x, cartel.y,
      cartel.asset,
      cartel.proximityText, cartel.interactText
    ));
  });

  // Escuchar el evento para cambiar de nivel
  this.events.on('changeLevel', (flag) => {
    const index = LOCAL.current_stage_index;

    // Inicia fade-out de la escena
    this.cameras.main.fadeOut(500, 0, 0, 0);
  
    this.cameras.main.once('camerafadeoutcomplete', () => {
      const props = LOCAL.phases[index];

      // Reposicionar al jugador y rehabilitamos su movimiento
      this.player.setPosition(
        flag === 'right'
          ? 250
          : CONFIG.scale.width - 250,
        CONFIG.scale.height
      );
      this.player.movement_enabled = true;

      // Cambiar la textura del fondo
      this.background.setTexture(props.background);

      // Destruir los carteles existentes
      if (this.cartels.length > 0) {
        this.cartels.forEach(cartel => cartel.destroy());
      }

      // Crear los carteles y agregarlos a la escena
      this.cartels = [];
      props.cartels.forEach(cartel => {
        this.cartels.push(new Cartel(this,
          cartel.x, cartel.y,
          cartel.asset,
          cartel.proximityText, cartel.interactText
        ));
      });

      // Poner al jugador al frente del todo
      this.children.bringToTop(this.player);

      // Poner los controles adelante, si está en móvil
      if (LOCAL.is_mobil) {
        this.children.bringToTop(this.button_left) ;
        this.children.bringToTop(this.button_right);

        this.children.bringToTop(this.buttonA);
      }
    });
  
    this.time.delayedCall(1000, () => {
      // Inicia el fade-in de la escena
      this.cameras.main.fadeIn(500, 0, 0, 0);
    });
  });

  // Crear el jugador y agregarlo a la escena
  this.player = this.physics.add.sprite(250, CONFIG.scale.height, 'playerIdle')
    .setScale(4)
    .setSize(22, 68)
    .setOffset(50, 60)
    .setCollideWorldBounds(true);

  this.player.looking          = 'right';
  this.player.cursors          = this.input.keyboard.createCursorKeys();
  this.player.movement_enabled = true;

  // Crear animaciones en la escena
  this.anims.create({
    key: 'idle',
    frames: this.anims.generateFrameNumbers('playerIdle', { start: 0, end: 6 }),
    frameRate: 5,
    repeat: -1
  });
  
  this.anims.create({
    key: 'walk',
    frames: this.anims.generateFrameNumbers('playerWalking', { start: 0, end: 9 }),
    frameRate: 15,
    repeat: -1
  });

  if (LOCAL.is_mobil) {
    // Margenes y escala de los botones
    const buttonScale = 2;
    const margin      = 50;

    const rel_pos = margin * buttonScale;

    // Botón izquierdo
    this.button_left = this.add.image(
      rel_pos + margin,
      this.cameras.main.height - rel_pos,
      'buttonLeft'
    ).setScale(buttonScale).setInteractive();
    this.isButtonLeftPressed = false;

    // Botón derecho
    this.button_right = this.add.image(
      this.cameras.main.width - rel_pos - margin,
      this.cameras.main.height - rel_pos,
      'buttonRight'
    ).setScale(buttonScale).setInteractive();
    this.isButtonRightPressed = false;

    // Asignar eventos para el botón derecho
    this.button_right.on('pointerdown', () => this.isButtonRightPressed = true );
    this.button_right.on('pointerup'  , () => this.isButtonRightPressed = false);
    this.button_right.on('pointerout' , () => this.isButtonRightPressed = false);

    // Asignar eventos para el botón izquierdo
    this.button_left.on('pointerdown', () => this.isButtonLeftPressed = true );
    this.button_left.on('pointerup'  , () => this.isButtonLeftPressed = false);
    this.button_left.on('pointerout' , () => this.isButtonLeftPressed = false);
  }

  // Inicia el fade-in de la escena
  this.cameras.main.fadeIn(4000, 0, 0, 0);
}

function update () {
  // Lógica para manejar el movimiento del jugador
  if (this.player.cursors.right.isDown || this.isButtonRightPressed) {
    if (!this.music) {
      this.music = this.sound.add('backgroundMusic', { 
        volume: LOCAL.is_mobil ? 0.06 : 0.02,
        loop: true
      });
      this.music.play(); 
    }

    if (this.player.movement_enabled) {
      this.player
        .setVelocityX(400)
        .setFlipX(false)
        .setSize(17, 68)
        .setOffset(50, 60)
        .anims.play('walk', true);

      this.player.looking = 'right';
    }

  } else if (this.player.cursors.left.isDown || this.isButtonLeftPressed) {
    if (this.player.movement_enabled) {
      this.player
        .setVelocityX(-400)
        .setFlipX(true)
        .setSize(17, 68)
        .setOffset(60, 60)
        .anims.play('walk', true)
        
      this.player.looking = 'left';
    }
    
  } else {
    this.player
      .setVelocityX(0)
      .setSize(22, 68)
      .setOffset(this.player.looking === 'right' ? 50 : 55, 60)
      .anims.play('idle', true);
  }

  // Lógica para cambiar de escenas desde la derecha
  if (
    this.player.x >= CONFIG.scale.width - (this.player.width / 2) &&
    LOCAL.current_stage_index < 3 &&
    this.player.movement_enabled
  ) {
    this.player.movement_enabled = false;
  
    this.player
      .setVelocity(0)
      .anims.play('idle', true);
  
    LOCAL.current_stage_index++;
  
    this.events.emit('changeLevel', 'right');
  }

  // Lógica para cambiar de escenas desde la izquierda
  if (
    this.player.x <= (this.player.width / 2) &&
    LOCAL.current_stage_index > 0 &&
    this.player.movement_enabled
  ) {
    this.player.movement_enabled = false;
  
    this.player
      .setVelocity(0)
      .anims.play('idle', true);
  
    LOCAL.current_stage_index--;
  
    this.events.emit('changeLevel', 'left');
  }

  // Actualizar cada cartel
  this.cartels.forEach(cartel => cartel.update(this.player));
}

if (
  /Mobi|Android|iPhone/i.test(navigator.userAgent) ||
  (navigator.userAgentData && navigator.userAgentData.mobile) ||
  (window.innerWidth <= 800 && 'ontouchstart' in window)
) {
  LOCAL.is_mobil = true;

  window.addEventListener('load', handleOrientation);
  window.addEventListener('resize', () => {
    handleOrientation();
    setTimeout(game && game.scale ? game.scale.refresh() : undefined, 100);
  });
  window.addEventListener('orientationchange', () => {
    handleOrientation();
    setTimeout(game && game.scale ? game.scale.refresh() : undefined, 300);
  });
}

// Pantalla completa al primer click, o toque
window.addEventListener('click'     , requestFullScreen);
window.addEventListener('touchstart', requestFullScreen);

document.addEventListener('fullscreenchange', () => {
  LOCAL.is_fullscreen = !!document.fullscreenElement;
});

// instancia del juego
const game = new Phaser.Game(CONFIG);
