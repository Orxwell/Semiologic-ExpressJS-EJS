class Cartel extends Phaser.GameObjects.Container {
  constructor(scene, x, y, imageKey, proximityText, interactText) {
    super(scene, x, y);
    this.scene            = scene       ;
    this.interactText     = interactText;
    this.in_range         = false       ;
    this.isButtonAPressed = false       ;
    
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
      this.buttonA.on('pointerdown', () => this.isButtonAPressed = true);
      
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
      if (Phaser.Input.Keyboard.JustDown(this.keyE) || this.isButtonAPressed) {
        this.in_range         = true ;
        this.isButtonAPressed = false;

        this.interactedContainer.setVisible(true);
        this.interactedContainer.animateText(this.interactText, 50);
      }
    } else {
      this.in_range = false;
      this.isButtonAPressed = false;

      if (this.glowing) {
        this.glowing = false;
        this.image.clearTint();
        this.scene.tweens.killTweensOf(this.image);
      }
      this.textContainer.setVisible(false);
      if (LOCAL.is_mobil) this.buttonA.setVisible(false);
      else this.textContainer_E.setVisible(false);
      this.interactedContainer.setVisible(false);
    }
  }
}
