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

LOCAL.scenes.push(new GlobalScene());
