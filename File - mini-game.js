function checkOrientation() {
  if (window.innerHeight > window.innerWidth) {
    document.getElementById('customAlert').style.display = 'flex';
  } else {
    document.getElementById('customAlert').style.display = 'none';
  }
}

window.addEventListener('resize', checkOrientation);
window.addEventListener('orientationchange', checkOrientation);

checkOrientation();

document.addEventListener("DOMContentLoaded", function() {
    const loadingOverlay = document.getElementById("loadingOverlay");
    
    let progress = 0;

    const powerupBar = document.getElementById('powerupBar');
  
    powerupBar.style.width = '0%';
    
    function updateLoadingProgress(progress) {
      const progressBar = document.querySelector('.loading-progress-bar');
      progressBar.style.width = progress + '%';
    }
    
    let canvas = document.getElementById("gameCanvas");
    let ctx = canvas.getContext('2d');
            
    let touchX = null;
    let mouseX = null;
    
    function screenToCanvasCoordinates(x, canvasWidth, screenWidth) {
        return (x - (screenWidth - canvasWidth) / 2) * (canvas.width / canvasWidth);
    }
    
    function adjustCanvasSize() {
      const aspectRatio = 5 / 3;
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const screenAspectRatio = screenWidth / screenHeight;
      
      if (screenAspectRatio > aspectRatio) {
        const newWidth = screenHeight * aspectRatio;
        canvas.width = newWidth;
        canvas.height = screenHeight;
        canvas.style.display = "block";
        const inputArea = document.getElementById("ui");
        const canvasOffsetLeft = (screenWidth - newWidth) / 2;
        inputArea.style.left = canvasOffsetLeft + "px";
      } else if (screenAspectRatio < aspectRatio) {
        canvas.width = screenWidth;
        canvas.height = screenHeight;
        canvas.style.display = "block"; 
        const inputArea = document.getElementById("ui");
        inputArea.style.left = "0";
      }
    }
    
    window.addEventListener("resize", function() {
        adjustCanvasSize();
        if (touchX !== null || mouseX !== null) {
            adjustTouchAndMouseCoordinates();
        }
    });
    
    canvas.addEventListener("touchstart", function(event) {
        touchX = event.touches[0].clientX;
        adjustTouchAndMouseCoordinates();
    });

    canvas.addEventListener("touchmove", function(event) {
        event.preventDefault();
        touchX = event.touches[0].clientX;
        adjustTouchAndMouseCoordinates();
    });

    canvas.addEventListener("touchend", function(event) {
        touchX = null;
    });
    
    canvas.addEventListener("mousedown", function(event) {
        if (event.button === 0) {
            mouseX = event.clientX;
            adjustTouchAndMouseCoordinates();
        }
    });
    
    canvas.addEventListener("mouseup", function(event) {
        if (event.button === 0) {
            mouseX = null;
        }
    });
        
     canvas.addEventListener("mousemove", function(event) {
    if (event.buttons === 1) {
        mouseX = event.clientX;
        adjustTouchAndMouseCoordinates();
        player.x = mouseX - player.width / 2;
    }
});

    
    function adjustTouchAndMouseCoordinates() {
        const screenWidth = window.innerWidth;
        if (touchX !== null) {
            touchX = screenToCanvasCoordinates(touchX, canvas.width, screenWidth);
        }
        if (mouseX !== null) {
            mouseX = screenToCanvasCoordinates(mouseX, canvas.width, screenWidth);
        }
    }
    
    // Initialisierung
    adjustCanvasSize();

            let obstacleSpeed = 0;
            let imagesLoaded = 0;
            const totalImages = 6;

            function checkImagesLoaded() {
                imagesLoaded++;
                progress += 16,66;
                updateLoadingProgress(progress);
                if (imagesLoaded === totalImages) {
                    document.querySelector(".loading-screen").style.display = "none";

                    // Starte das Spiel
                    obstacleSpeed = canvas.height * 0.2;
                    spawnObstacle();
                    draw();
                }
            }
            
            function preloadImages() {
                const imageSources = [
                    'obstacle1.png',
                    'obstacle2.png',
                    'point1.png',
                    'point2.png',
                    'powerup1.png'
                ];

                imageSources.forEach(source => {
                    const image = new Image();
                    image.onload = checkImagesLoaded;
                    image.src = source;
                });
            }

            preloadImages();
  
            
var ratioCanvas = canvas.width / canvas.height;

var objectSize;

if (ratioCanvas === 1 && ratioCanvas < 4/3) {

    objectSize = canvas.height * 0.125;
} else if (ratioCanvas >= 4/3 && ratioCanvas < 5/3) {
    
    objectSize = canvas.height * 0.15;
} else if (ratioCanvas >= 5/3) {
    
    objectSize = canvas.height * 0.175;
}

const player = {
    x: canvas.width / 2,
    y: canvas.height - objectSize,
    width: objectSize,
    height: objectSize,    
    image: new Image()
};

player.image.onload = checkImagesLoaded;
player.image.src = "farmer-m.png";

            
            const obstacles = [];
            const obstacleWidth = objectSize;
            const obstacleHeight = objectSize;            
            obstacleSpeed = canvas.height * 0.2;

            const obstacleImages = [
                'obstacle1.png',
                'obstacle2.png'
            ];

            const pointImages = [
                'point1.png',
                'point2.png'
            ];
            
            const powerupImages = [
                'powerup1.png'
            ];
                        

            let gameOver = false;
            
            let spawnSpeed = canvas.height * 0.0001;
            
            let timeStopSlow = false;
            
            let score = 0;

            document.getElementById("highScore").textContent = highScore;
            
    const collisionDistance = canvas.height * 0.175;
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!gameOver) {
            if (touchX !== null) {
                const targetX = touchX - player.width / 2;
                if (targetX >= 0 && targetX <= canvas.width - player.width) {
                    player.x = targetX;
                }
            }
        }

        ctx.drawImage(player.image, player.x, player.y, player.width, player.height);

        for (let i = 0; i < obstacles.length; i++) {
            if (obstacles[i].y < canvas.height + collisionDistance) {
                obstacles[i].y += obstacleSpeed / 30;

                ctx.drawImage(obstacles[i].image, obstacles[i].x, obstacles[i].y, obstacleWidth, obstacleHeight);

                let playerRadius = player.width / 2;
                let obstacleRadius = obstacleHeight / 2;
                let playerCenterX = player.x + playerRadius;
                let playerCenterY = player.y + playerRadius;
                let obstacleCenterX = obstacles[i].x + obstacleRadius;
                let obstacleCenterY = obstacles[i].y + obstacleRadius;

                let dx = playerCenterX - obstacleCenterX;
                let dy = playerCenterY - obstacleCenterY;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < playerRadius + obstacleRadius) {
                    if (obstacles[i].isPoint) {
                        score++;
                        document.getElementById("score").textContent = score;

                        obstacles.splice(i, 1);
                        i--;
                    } else if (obstacles[i].isPowerup) {
                        timeStop();

                        obstacles.splice(i, 1);
                        i--;
                    } else {
                        endGame();
                    }
                }
            }
        }

        if (!gameOver && !timeStopSlow) {
            obstacleSpeed += spawnSpeed;
            if (obstacleSpeed > canvas.height * 0.85) {
                obstacleSpeed = canvas.height * 0.85;
            }
        }
        requestAnimationFrame(draw);
    }


function timeStop() {
    timeStopSlow = true;
    obstacleSpeed *= 0.5;  
    startPowerupBar();

    obstacles.forEach(obstacle => {
        if (obstacle.isPowerup) {
            obstacle.isPowerup = false;
            obstacle.isPoint = true;

            const pointImage = new Image();
            pointImage.src = pointImages[Math.floor(Math.random() * pointImages.length)];
            obstacle.image = pointImage;
        }
    });

    setTimeout(() => {       
        timeStopSlow = false;
        obstacleSpeed *= 2;
    }, 6000);
}

let powerupDuration = 6000;
let powerupRemainingTime = 0;
let powerupInterval;

function startPowerupBar() {
    powerupRemainingTime = powerupDuration;
    clearInterval(powerupInterval);

    const powerupBar = document.getElementById('powerupBar');

    if (powerupBar) {
        powerupBar.style.width = '100%';
        
        powerupInterval = setInterval(() => {
            powerupRemainingTime -= 25;
            const progressPercentage = (powerupRemainingTime / powerupDuration) * 100;
            
            powerupBar.style.width = progressPercentage + '%'; 
            const marginLeftPercentage = ((100 - progressPercentage) * 0.5);
            powerupBar.style.marginLeft = marginLeftPercentage + '%'; 

            if (powerupRemainingTime <= 0) {
                clearInterval(powerupInterval);
                powerupBar.style.width = '0%';
                powerupBar.style.marginLeft = '0';
            }
        }, 25);
    } 
}

             function spawnObstacle() {
  const x = Math.random() * (canvas.width - obstacleWidth);
  const y = -obstacleHeight * 3;
  const obstacleImage = new Image();
  obstacleImage.onload = checkImagesLoaded;
  obstacleImage.src = obstacleImages[Math.floor(Math.random() * obstacleImages.length)];

  const obstacle = { x, y, image: obstacleImage, isPoint: false, isPowerup: false };
  obstacles.push(obstacle);

  const shouldSpawnPoint = Math.random() < calculateSpawnProbability(score, 'point');
  const shouldSpawnSecondObstacle = !shouldSpawnPoint && Math.random() < 0.25;
  const shouldSpawnPowerup = !shouldSpawnPoint && !shouldSpawnSecondObstacle && Math.random() < calculateSpawnProbability(score, 'powerup');

  if (shouldSpawnPoint) spawnEntity(pointImages, 'point');
  if (shouldSpawnSecondObstacle) spawnEntity(obstacleImages, 'obstacle');
  if (shouldSpawnPowerup) spawnEntity(powerupImages, 'powerup');

  if (timeStopSlow) {
        setTimeout(spawnObstacle, Math.max(200, 1400 - score * 7.5));
    } else {
        setTimeout(spawnObstacle, Math.max(200, 1400 - score * 20));
    }
}

function spawnEntity(imageArray, type) {
  const x = Math.random() * (canvas.width - obstacleWidth);
  const y = -obstacleHeight * 3;
  const image = new Image();
  image.onload = checkImagesLoaded;
  image.src = imageArray[Math.floor(Math.random() * imageArray.length)];

  const entity = { x, y, image, isPoint: type === 'point', isPowerup: type === 'powerup' };

  if (Math.abs(entity.x - obstacles[obstacles.length - 1].x) >= canvas.height * 0.175) {
    obstacles.push(entity);
  }
}

function calculateSpawnProbability(score, type) {
  if (type === 'point') {
    if (timeStopSlow) {
      if (score >= 50) return 0.7;
      if (score >= 20) return 0.7;
      if (score >= 5) return 0.7;
      return 1;
    } else {
      if (score >= 50) return 0.4;
      if (score >= 20) return 0.5;
      if (score >= 5) return 0.6;
      return 0.6;
    }
  }

  else if (type === 'powerup') {
    if (timeStopSlow) {
      return 0;
    } else {
      if (score >= 75) return 0.3;
      if (score >= 25) return 0.2;
      if (score >= 10) return 0.1;
      return 0.1;
    }
  }
}

            
let timerElement = document.getElementById("timer");
let timer, seconds = 0;

function startTimer() {
    timer = setInterval(updateTimer, 1000);
}

function updateTimer() {
  if (timeStopSlow) {
    seconds += 0.5;
  } else {
    seconds++;
  }
  let minutes = Math.floor(seconds / 60);
  let remainingSeconds = (seconds % 60).toString().padStart(2, '0');
  timerElement.textContent = `${minutes}:${remainingSeconds}`;
}

function stopTimer() {
  clearInterval(timer);
}

function resetTimer() {
  clearInterval(timer);
  seconds = 0;
  timerElement.textContent = "0:00";
}

startTimer();

function endGame() {
  gameOver = true;
  obstacleSpeed = 0;
  stopTimer();

  const highScore = localStorage.getItem("highScore");
  if (score > highScore || highScore === null) {
    localStorage.setItem("highScore", score);
  }

  document.getElementById("endOverlay").style.display = "flex";
  document.getElementById("highScoreDisplay").textContent = "High Score: " + (highScore || 0);
  document.getElementById("endScore").textContent = "Punktestand: " + score;

  let minutes = Math.floor(seconds / 60);
  let remainingSeconds = (seconds % 60).toString().padStart(2, '0');
  document.getElementById("time").textContent = `Überlebt: ${minutes}:${remainingSeconds} Minuten`;

  document.getElementById("ui").style.display = "none";
  document.getElementById("gameCanvas").classList.add("blur");
}

function restartGame() {
  document.getElementById("endOverlay").style.display = "none";
  gameOver = false;
  obstacleSpeed = canvas.height * 0.2;
  score = 0;
  document.getElementById("highScore").textContent = highScore;
  resetTimer();
  startTimer();
  obstacles.length = 0;

  document.getElementById("score").textContent = score;
  document.getElementById("ui").style.display = "flex";
  document.getElementById("gameCanvas").classList.remove("blur");
}

document.getElementById("restartButton").addEventListener("click", restartGame);

function backToMenu() {
  window.location.href = "index.html";
}

document.getElementById("menuButton").addEventListener("click", backToMenu);
});