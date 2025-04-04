document.addEventListener("DOMContentLoaded", function() {
  const fadeIn = document.getElementById("fadeIn");
  
  function preloadFiles() {
    const files = ['index/logo.png', 'index/discord-logo.png', 'index/tiktok-logo.png', 'index/main-theme.mp3', 'index/tap.mp3'];
    const totalFiles = files.length;
    let loadedFiles = 0;

    files.forEach(file => {
      const fileType = file.split('.').pop();
      const preloadElement = fileType === 'mp3' ? new Audio() : new Image();

      if (fileType === 'mp3') {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', file, true);
        xhr.responseType = 'blob';

        xhr.onload = function() {
          if (this.status === 200) {
            const blob = this.response;
            preloadElement.src = URL.createObjectURL(blob);
            loadedFiles++;
            updateLoadingProgress(loadedFiles, totalFiles);
          }
        };

        xhr.onerror = function() {
          console.error(`Error: Failed to load ${file}`);
        };

        xhr.send();
      } else {
        preloadElement.onload = () => {
          loadedFiles++;
          updateLoadingProgress(loadedFiles, totalFiles);
        };
        preloadElement.src = file;
      }
    });
  }

  function updateLoadingProgress(loadedFiles, totalFiles) {
    const loadingScreen = document.getElementById('loadingScreen');
  
    if (loadedFiles === totalFiles) {
      loadingScreen.style.display = 'none';
      playTheme();
      fadeIn.classList.add('fadeout');
      fadeIn.addEventListener("animationend", function() {
        fadeIn.style.display = "none";
      });
    }
  }

  preloadFiles();
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