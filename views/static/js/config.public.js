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
