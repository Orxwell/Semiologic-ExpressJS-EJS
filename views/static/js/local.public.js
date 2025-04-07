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

