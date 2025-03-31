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
