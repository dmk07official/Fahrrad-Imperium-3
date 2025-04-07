document.addEventListener("DOMContentLoaded", function() {
  const fadeIn = document.getElementById("fadeIn");
  const loadingScreen = document.getElementById("loadingScreen"); // Falls du 'loadingScreen' ansprechen willst

  loadingScreen.style.display = 'none'; // Hier wird der Ladebildschirm ausgeblendet
  playTheme(); // Wenn das eine Funktion ist, die du schon hast und Musik startet

  fadeIn.classList.add('fadeout'); // 'fadeout' animiert den fadeIn Effekt
  fadeIn.addEventListener("animationend", function() {
    fadeIn.style.display = "none"; // Versteckt den FadeIn-Element, wenn die Animation endet
  });
});


function playTheme() {
  var sound = new Howl({
    src: "index/main-theme.mp3",
    autoplay: true,
    onend: playTheme 
  });
}

function openPopup(popupId) {
  var sound = new Howl({
    src: "index/tap.mp3",
    autoplay: true,
  });
  
  const popupElement = document.getElementById(popupId);
  popupElement.style.display = 'flex';
  popupElement.style.opacity = 1;  
              
  const blur = document.getElementById("blur");
  blur.style.display = 'block';
}

function closePopup(popupId) {
  var sound = new Howl({
    src: "index/tap.mp3",
    autoplay: true,
  });
  
  const popupElement = document.getElementById(popupId);
  
  let opacity = 1;
  const fadeOutInterval = setInterval(() => {
    if (opacity <= 0) {
      clearInterval(fadeOutInterval);
      popupElement.style.display = 'none';
    } else {
      opacity -= 0.05;
      popupElement.style.opacity = opacity;
    }
  }, 20);
  
  const blur = document.getElementById("blur");
  blur.style.display = 'none';
}

function addPopupEventListener(popupId) {
  const popupElement = document.getElementById(popupId);
  popupElement.addEventListener('click', function(e) {
    if (e.target === popupElement) {
      closePopup(popupId);
    }
  });
}

addPopupEventListener('popupNews');

particlesJS("particles-js", {
  "particles": {
    "number": {
      "value": 300,
      "density": {
        "enable": true,
        "value_area": 1000
      }
    },
    "color": {
      "value": "#D4AF37"
    },
    "shape": {
      "type": "circle"
    },
    "opacity": {
      "value": 0.7,
      "random": true
    },
    "size": {
      "value": 7,
      "random": true
    },
    "move": {
      "enable": true,
      "speed": 0.6,
      "direction": "bottom",
      "random": false,
      "straight": true,
      "out_mode": "out",
      "bounce": false,
      "attract": {
        "enable": false,
        "rotateX": 600,
        "rotateY": 1200
      }
    },
    "line_linked": {
      "enable": false,
      "distance": 150,
      "color": "#ffffff",
      "opacity": 0.4,
      "width": 1
    }
  },
  "interactivity": {
    "detect_on": "canvas",
    "events": {
      "onhover": {
        "enable": false,
        "mode": "repulse"
      },
      "onclick": {
        "enable": false,
        "mode": "push"
      },
      "resize": true
    }
  },
  "retina_detect": true
});
            
function startGame() {
  var sound = new Howl({
    src: "index/tap.mp3",
    autoplay: true,
  });
  window.open('game/game.html', '_self');
}

function openDiscord() {
  var sound = new Howl({
    src: "index/tap.mp3",
    autoplay: true,
  });
  window.open('https://discord.gg/RSVE3fyQ5Y', '_blank');
}

function openTiktok() {
  var sound = new Howl({
    src: "index/tap.mp3",
    autoplay: true,
  });
  window.open('', '_blank');
}
