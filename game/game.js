//Cache Erstellen

const CACHE_NAME = 'site-assets-v1';
const REQUIRED_FILES = [
    'green-arrow.png',
    'background-game.mp3',
];

async function checkAndInstallFiles() {
    const cache = await caches.open(CACHE_NAME);
    const cachedRequests = await cache.keys();
    
    const cachedUrls = cachedRequests.map(request => new URL(request.url).pathname);
    const missingFiles = REQUIRED_FILES.filter(file => !cachedUrls.includes(file));
    
    if (missingFiles.length === 0) {
        loadProgress();        
    } else {
        await Promise.all(missingFiles.map(async (file) => {
            const response = await fetch(file);
            if (response.ok) {
                await cache.put(file, response);
            } else {
            }
        }));
        loadProgress();
    }
}

window.addEventListener('load', () => {
    checkAndInstallFiles().catch(error => {
        console.error("Fehler beim Überprüfen/Installieren der Dateien:", error);
    });
});

//Speichern, Laden, Variablen
let coins = 0;
let prestigeCount = 0, prestigeMultiplier = 1, prestigeCost = 1000;
let upgradeCoinsPlayer = 1, upgradeCoinsPlayerCost = 10;
let upgradeCoinsWorker = 1, upgradeCoinsWorkerCost = 10;
let upgradeCoins = 1, upgradeCoinsCost = 50;
let upgradeStrength = 1, upgradeStrengthCost = 100;
let upgradeJob = 10, upgradeJobCost = 250;
let day = 1, month = 1, year = 2050;
let qualityValue = 1, costValue = 1;
let loyalCustomerActivated = false;
let loyalCustomerCounter = 0;       
let buttonCooldown = false;
let supplierName = "BikeParts GmbH";
let probabilitySuccess = 80;
const minimumProbability = 70;

const workerIntervals = {
  worker1: 665, worker2: 665, worker3: 665, worker4: 665, worker5: 665,
};

const workerUpgradeCost = {
  worker1: 100, worker2: 100, worker3: 100, worker4: 100, worker5: 100,
};

function saveProgress() {
  const progress = {
    coins,
    prestigeCount, prestigeMultiplier, prestigeCost,
    upgradeCoinsPlayer, upgradeCoinsPlayerCost,
    upgradeCoinsWorker, upgradeCoinsWorkerCost,
    upgradeCoins, upgradeCoinsCost,
    upgradeStrength, upgradeStrengthCost,
    upgradeJob, upgradeJobCost,
    workerIntervals,
    workerUpgradeCost,
    day, month, year,
    qualityValue, costValue,        
    loyalCustomerCounter,
    loyalCustomerActivated,      
    supplierName,
    probabilitySuccess,
  };

  localStorage.setItem('FI3test5', JSON.stringify(progress));
}

function loadProgress() {
  const progress = JSON.parse(localStorage.getItem('FI3test5'));
  if (progress) {
    coins = progress.coins || 0;
    prestigeCount = progress.prestigeCount || 0;
    prestigeMultiplier = progress.prestigeMultiplier || 1;
    prestigeCost = progress.prestigeCost || 1000;
    upgradeCoinsPlayer = progress.upgradeCoinsPlayer || 1;
    upgradeCoinsPlayerCost = progress.upgradeCoinsPlayerCost || 10;
    upgradeCoinsWorker = progress.upgradeCoinsWorker || 1;
    upgradeCoinsWorkerCost = progress.upgradeCoinsWorkerCost || 10;
    upgradeCoins = progress.upgradeCoins || 1;
    upgradeCoinsCost = progress.upgradeCoinsCost || 50;
    upgradeStrength = progress.upgradeStrength || 1;
    upgradeStrengthCost = progress.upgradeStrengthCost || 100;
    upgradeJob = progress.upgradeJob || 10;
    upgradeJobCost = progress.upgradeJobCost || 250;
    day = progress.day || 1;
    month = progress.month || 1;
    year = progress.year || 2050;
    qualityValue = progress.qualityValue || 1;
    costValue = progress.costValue || 1;
    loyalCustomerCounter = progress.loyalCustomerCounter || 0;
    loyalCustomerActivated = progress.loyalCustomerActivated;
    supplierName = progress.supplierName;
    probabilitySuccess = progress.probabilitySuccess || 80;
    Object.assign(workerIntervals, progress.workerIntervals || {});
    Object.assign(workerUpgradeCost, progress.workerUpgradeCost || {});
  }
  updateCoins();
  updatePrestige();
  updateGamble();
  updateDate();
  updateWorkerDisplay();
  updateWorkerButtons();
  updateUpgradeButtons();
  updateBar('progressFillQuality', qualityValue);
  updateBar('progressFillCost', costValue);
  updatePercentageElements();
  checkLoyalCustomerStatus();
  updateDeliveryName();
  startSaveInterval();
  
  const backgroundMusic = new Howl({
    src: ['background-game.mp3'],
    loop: true,
    volume: 0.5
  });
  backgroundMusic.play();
}

function updateCoins() {
document.getElementById('coins').textContent = formatNumber(coins);
        }
function updatePrestige() {
document.getElementById('prestigeCount').textContent = formatNumber(prestigeCount);
document.getElementById('newPrestigeCount').textContent = formatNumber(prestigeCount + 1);
document.getElementById('prestigeMultiplier').textContent = formatNumber(prestigeMultiplier);
document.getElementById('newPrestigeMultiplier').textContent = formatNumber(prestigeMultiplier * 2);
document.getElementById('prestigeCost').textContent = formatNumber(prestigeCost / costValue);
        }
function updateGamble() {
  document.getElementById('gambleWin').textContent = formatNumber(probabilitySuccess);
  document.getElementById('gambleLose').textContent = formatNumber(100 - probabilitySuccess);
}

function formatNumber(number) {
    const suffixes = ['', 'K', 'M', 'B', 'T', 'aa', 'ab', 'ac', 'ad', 'ae', 'af', 'ag', 'ah', 'ai', 'aj', 'ak', 'al', 'am', 'an', 'ao', 'ap', 'aq', 'ar', 'as', 'at', 'au', 'av', 'aw', 'ax', 'ay', 'az'];
    
    let i = 0;
    while (number >= 1e3 && i < suffixes.length - 1) {
        number /= 1e3;
        i++;
    }

    return (number.toFixed(2) + suffixes[i]).replace('.00', '');
}

function updateWorkerDisplay() {
  for (const workerId in workerIntervals) {
    const interval = workerIntervals[workerId];

    const workerDisplay = document.getElementById(`workerTimeDisplay${workerId.slice(-1)}`);
    
    if (workerDisplay) {
      const clicksPerSecond = (1000 / interval).toFixed(2);

      workerDisplay.innerHTML = `${clicksPerSecond}`;
    }
  }
}

function updateWorkerButtons() {
  for (const workerId in workerUpgradeCost) {
    const upgradeButton = document.getElementById(`workerUpgrade_${workerId}`);
    if (upgradeButton) {
      const formattedCost = formatNumber(workerUpgradeCost[workerId]);
      upgradeButton.innerHTML = `Ausbilden:<br>${formattedCost}€`;
    }
  }
}

function updateUpgradeButtons() {
   document.getElementById('upgradeCoinsPlayerCost').textContent = formatNumber(upgradeCoinsPlayerCost / costValue); 
    document.getElementById('upgradeCoinsWorkerCost').textContent = formatNumber(upgradeCoinsWorkerCost / costValue);
  document.getElementById('upgradeCoinsCost').textContent = formatNumber(upgradeCoinsCost / costValue);
  document.getElementById('upgradeStrengthCost').textContent = formatNumber(upgradeStrengthCost / costValue);
  document.getElementById('upgradeJobCost').textContent = formatNumber(upgradeJobCost / costValue);
}

function startSaveInterval() {
  setInterval(() => {
    saveProgress();
  }, 500);
}

function updateDate() {
    const daysInMonth = new Date(year, month + 1, 0).getDate(); 
    
    const currentDateElement = document.getElementById('currentDate');
    const formattedDate = `${day}.${month + 1}.${year}`; 
    currentDateElement.textContent = formattedDate;

    day++;

    if (day > daysInMonth) {
        day = 1;
        month++;

        if (month > 11) {
            month = 0;
            year++;
        }
    }
}

setInterval(updateDate, 5000);

// Basic JS

function toggleActiveWindowChoose(buttonId) {
    document.querySelectorAll('.window-choose-button').forEach(button => {
        button.classList.remove('active');
        button.classList.add('not-active');
    });

    const clickedButton = document.getElementById(buttonId);
    if (clickedButton) {
        clickedButton.classList.remove('not-active');
        clickedButton.classList.add('active');
    }

    document.querySelectorAll('.window').forEach(div => {
        div.style.display = 'none';
    });

    const correspondingDiv = document.getElementById('window' + buttonId.charAt(0).toUpperCase() + buttonId.slice(1));
    if (correspondingDiv) {
        correspondingDiv.style.display = 'block';
    }
}

// Werkstatt

let selectedOrder = null;
let currentPlayer = false;
let currentWorker = {
  worker1: false, worker2: false, worker3: false, worker4: false, worker5: false,
};

function upgradeWorker(workerId) {
  if (workerIntervals[workerId] !== undefined) {
    
    if (coins >= workerUpgradeCost[workerId]) {
      coins -= workerUpgradeCost[workerId];
      workerIntervals[workerId] *= 0.8;
      workerUpgradeCost[workerId] *= 10;      
      updateCoins();
      updateWorkerDisplay()
      updateWorkerButtons();
    } else {
      alert("Nicht genug € für eine Ausblidung!");
    }
  } 
}


const orders = Array.from({ length: 6 }, (_, i) => document.getElementById(`order${i + 1}`));
const playerDiv = document.getElementById("player");
const workerDivs = {
  worker1: document.getElementById("worker1"),
  worker2: document.getElementById("worker2"),
  worker3: document.getElementById("worker3"),
  worker4: document.getElementById("worker4"),
  worker5: document.getElementById("worker5"),
};

const jobs = [
  { name: "Job 1", work: 50, payment: 50 },
  { name: "Job 2", work: 75, payment: 75 },
  { name: "Job 3", work: 100, payment: 100 },
];

const activeIntervals = {};

startLoading(0);

function startLoading(index) {
  const order = orders[index];
  if (!order || !order.classList.contains("passive")) return;

  order.classList.remove("passive");
  order.classList.add("loading");
  order.textContent = `Auftrag wird gesucht... ${upgradeJob}`;

  let timer = upgradeJob;
  const interval = setInterval(() => {
    timer--;
    order.textContent = `Auftrag wird gesucht... ${timer}`;
    if (timer <= 0) {
      clearInterval(interval);
      spawnJob(order);
      findNextPassiveJob();
    }
  }, 1000);
}

function findNextPassiveJob() {
  let foundPassive = false;
  const interval = setInterval(() => {
    if (!foundPassive) {
      for (let i = 0; i < orders.length; i++) {
        if (orders[i].classList.contains("passive")) {
          startLoading(i);
          foundPassive = true;
          clearInterval(interval);
          break;
        }
      }
    }
  }, 100);
}

function spawnJob(order) {
  const job = jobs[Math.floor(Math.random() * jobs.length)];
  order.classList.remove("loading");
  order.classList.add("job");
  order.innerHTML = `
    <strong>${job.name}</strong>
    <p>Work: ${job.work}</p>
    <p>Payment: ${job.payment} Coins</p>
  `;
  order.dataset.work = job.work;
  order.dataset.progress = 0;
  order.dataset.payment = job.payment;

  order.addEventListener("click", () => handleJobClick(order));
}

function handleJobClick(order) {
  if (selectedOrder === order) return;

  if (order.classList.contains("job")) {
    if (selectedOrder) {
      selectedOrder.classList.remove("selected");
    }

    selectedOrder = order;
    order.classList.add("selected");

    const selectorContainer = document.getElementById("selectorContainer");
    selectorContainer.style.display = "flex";

    const selector = document.getElementById("selector");
    selector.style.display = "flex";

    const blur = document.getElementById("blur");
    blur.style.display = "block";

    document.body.style.overflow = 'hidden';

    selectorContainer.addEventListener("click", (event) => {
      if (!selector.contains(event.target)) {
    selectorContainer.style.display = "none";
    selector.style.display = "none";
    blur.style.display = "none";
    document.body.style.overflow = "";
    selectedOrder = null;
      }
    });

    const playerButton = document.getElementById("selectorPlayer");
    if (currentPlayer) {
      playerButton.style.border = "solid #C62828 calc(var(--base-size) * 0.15)";
      playerButton.style.color = "#C62828";
      playerButton.disabled = true;
    } else {
      playerButton.style.border = "solid #2E7D32 calc(var(--base-size) * 0.15)";
      playerButton.style.color = "#2E7D32";
      playerButton.disabled = false;
    }

    for (const workerId in currentWorker) {
      const workerButton = document.getElementById(`selectorWorker${workerId.slice(-1)}`);
      if (workerButton) {
        if (currentWorker[workerId]) {
          workerButton.style.border = "solid #C62828 calc(var(--base-size) * 0.15)";
          workerButton.style.color = "#C62828";
          workerButton.disabled = true;
        } else {
          workerButton.style.border = "solid #2E7D32 calc(var(--base-size) * 0.15)";
          workerButton.style.color = "#2E7D32";
          workerButton.disabled = false;
        }
      }
    }
  }
}

function player() {
  if (!selectedOrder || !selectedOrder.classList.contains("job")) {
    alert("Du bist schon beschäftigt.");
    return;
  }
  
  currentPlayer = true;
  const status = document.getElementById("playerStatus");
  status.style.backgroundColor = "#C62828";
  
  const job = extractJobData(selectedOrder);
  playerDiv.dataset.job = JSON.stringify(job);
  playerDiv.innerHTML = `
    <strong>${job.name}</strong>
    <p>Progress: 0/${job.work}</p>
    <p>Payment: ${job.payment} Coins</p>
    <div class="progress-bar">
      <div class="progress-bar-fill" style="width: 0%;"></div>
    </div>
  `;
  resetJob(selectedOrder);
  playerDiv.addEventListener("click", handlePlayerClick);
  document.getElementById("selectorContainer").style.display = "none";
  document.getElementById("selector").style.display = "none";
  document.getElementById("blur").style.display = "none";
  document.body.style.overflow = '';
}

function handlePlayerClick() {
  const job = JSON.parse(playerDiv.dataset.job);
  let progress = parseFloat(job.progress) || 0;
  progress += upgradeStrength;
  progress = Math.round(progress * 10) / 10;

  const progressBarFill = playerDiv.querySelector(".progress-bar-fill");
  const progressPercentage = Math.min((progress / job.work) * 100, 100);
  progressBarFill.style.width = `${progressPercentage}%`;
  playerDiv.querySelector("p:nth-of-type(1)").textContent = `Progress: ${progress}/${job.work}`;

  if (progress >= job.work) {
    currentPlayer = false;
    const statusFinished = document.getElementById("playerStatus");
    statusFinished.style.backgroundColor = "#2E7D32";
    coins += (job.payment * ((upgradeCoinsPlayer * upgradeCoins) * prestigeMultiplier) * qualityValue);
    playerDiv.dataset.job = "";
    playerDiv.innerHTML = "Spieler: Kein Job";
    playerDiv.removeEventListener("click", handlePlayerClick);
    updateCoins();
  } else {
    playerDiv.dataset.job = JSON.stringify({ ...job, progress });
  }
}

function worker1() {
  assignJob(workerDivs.worker1, "worker1");
  const status = document.getElementById("workerStatus1");
  status.style.backgroundColor = "#C62828";
}

function worker2() {
  assignJob(workerDivs.worker2, "worker2");
  const status = document.getElementById("workerStatus2");
  status.style.backgroundColor = "#C62828";
}

function worker3() {
  assignJob(workerDivs.worker3, "worker3");
  const status = document.getElementById("workerStatus3");
  status.style.backgroundColor = "#C62828";
}

function worker4() {
  assignJob(workerDivs.worker4, "worker4");
  const status = document.getElementById("workerStatus4");
  status.style.backgroundColor = "#C62828";
}

function worker5() {
  assignJob(workerDivs.worker5, "worker5");
  const status = document.getElementById("workerStatus5");
  status.style.backgroundColor = "#C62828";
}


function assignJob(workerDiv, workerId) {
  if (!selectedOrder || !selectedOrder.classList.contains("job")) {
    alert("Es gibt keinen ausgewählten Auftrag.");
    return;
  }

  if (workerDiv.dataset.job) {
    alert("Dieser Mitarbeiter ist bereits beschäftigt.");
    return;
  }
  currentWorker[workerId] = true;

  const job = extractJobData(selectedOrder);
  workerDiv.dataset.job = JSON.stringify(job);
  workerDiv.innerHTML = `
    <strong>${job.name}</strong>
    <p>Progress: 0/${job.work}</p>
    <p>Payment: ${job.payment} Coins</p>
    <div class="progress-bar">
      <div class="progress-bar-fill" style="width: 0%;"></div>
    </div>
  `;
  resetJob(selectedOrder);
  document.getElementById("selectorContainer").style.display = "none";
  document.getElementById("selector").style.display = "none";
  document.getElementById("blur").style.display = "none";
  document.body.style.overflow = '';

  let progress = 0;
  const interval = setInterval(() => {
    progress++;
    const progressBarFill = workerDiv.querySelector(".progress-bar-fill");
    const progressPercentage = Math.min((progress / job.work) * 100, 100);
    progressBarFill.style.width = `${progressPercentage}%`;
    workerDiv.querySelector("p:nth-of-type(1)").textContent = `Progress: ${progress}/${job.work}`;

    if (progress >= job.work) {
  const statusFinished = document.getElementById(`workerStatus${workerId.slice(-1)}`);
  if (statusFinished) {
    statusFinished.style.backgroundColor = "#2E7D32";
  }
  currentWorker[workerId] = false;
  clearInterval(interval);
  delete activeIntervals[workerId];
  coins += (job.payment * ((upgradeCoinsWorker * upgradeCoins) * prestigeMultiplier) * qualityValue);
  workerDiv.dataset.job = "";
  workerDiv.innerHTML = "Kein Job";
  updateCoins();
}

  }, workerIntervals[workerId]);

  activeIntervals[workerId] = interval;
}

function resetJob(order) {
  order.classList.remove("job");
  order.classList.add("passive");
  order.textContent = "Passiv";
  
  if (selectedOrder === order) {
    selectedOrder = null;
  }
}


function extractJobData(order) {
  return {
    name: order.querySelector("strong").textContent,
    work: parseInt(order.dataset.work),
    progress: parseInt(order.dataset.progress),
    payment: parseInt(order.dataset.payment),
  };
}

// Upgrade

//Anzeigen vom jetzigem Stand zu Neuem Stand mit Pfeil emoticon, größere Sprünge für infinite Upgrades bei besondern Zahlen, wie 10 25 50 100 250 500 1000

function buyUpgradeCoinsPlayer() {
  if (coins >= (upgradeCoinsPlayerCost / costValue)) {
    coins -= (upgradeCoinsPlayerCost / costValue);
    upgradeCoinsPlayer += 0.05;
    upgradeCoinsPlayerCost *= 1.2;
  }
  updateCoins();
  updateUpgradeButtons();
}

function buyUpgradeCoinsWorker() {
  if (coins >= (upgradeCoinsWorkerCost / costValue)) {
    coins -= (upgradeCoinsWorkerCost / costValue);
    upgradeCoinsWorker += 0.05;
    upgradeCoinsWorkerCost *= 1.2;
  }
  updateCoins();
  updateUpgradeButtons();
}

function buyUpgradeCoins() {
  if (coins >= (upgradeCoinsCost / costValue)) {
    coins -= (upgradeCoinsCost / costValue);
    upgradeCoins += 0.1;
    upgradeCoinsCost *= 1.2;
  }
  updateCoins();
  updateUpgradeButtons();
}

function buyUpgradeStrength() {
  if (coins >= (upgradeStrengthCost / costValue)) {
    coins -= (upgradeStrengthCost / costValue);
    upgradeStrength += 0.5;
    upgradeStrengthCost *= 4;
  }
  updateCoins();
  updateUpgradeButtons();
}

function buyUpgradeJob() {
  if (coins >= (upgradeJobCost / costValue)) {
    coins -= (upgradeJobCost / costValue);
    upgradeJob--;
    if (upgradeJob <= 4) {
      upgradeJobCost *= 30;
    } else if (upgradeJob <= 7) {
      upgradeJobCost *= 20;
    } else {
      upgradeJobCost *= 10;
    }
  }
  updateCoins();
  updateUpgradeButtons();
}

//Teile Lieferant 

function updateBar(elementId, value) {
    let progressFill = document.getElementById(elementId);
    let percentage = Math.round(((value - 0.5) / 1) * 100);

    progressFill.style.width = percentage + "%";

    if (percentage > 70) {
        progressFill.style.backgroundColor = "green";
    } else if (percentage > 30) {
        progressFill.style.backgroundColor = "orange";
    } else {
        progressFill.style.backgroundColor = "red";
    }
}

function updateBarWithAnimation(elementId, value) {
    let progressFill = document.getElementById(elementId);
    let percentage = Math.round(((value - 0.5) / 1) * 100);

    progressFill.style.transition = "width 1s ease-in-out, background-color 1s ease-in-out";
    progressFill.style.width = percentage + "%";

    if (percentage > 70) {
        progressFill.style.backgroundColor = "green";
    } else if (percentage > 30) {
        progressFill.style.backgroundColor = "orange";
    } else {
        progressFill.style.backgroundColor = "red";
    }
}

function updatePercentageElements() {
    let qualityElement = document.getElementById('qualityLevelPercent');
    let costElement = document.getElementById('costLevelPercent');
    let percentageQuality = Math.round(((qualityValue - 0.5) / 1) * 100);
    let percentageCost = Math.round(((costValue - 0.5) / 1) * 100);

    if (qualityElement && costElement) {
        qualityElement.innerHTML = percentageQuality + "%";
        costElement.innerHTML = percentageCost + "%";
    }
}

function hidePercentages() {
    let qualityElement = document.getElementById('qualityLevelPercent');
    let costElement = document.getElementById('costLevelPercent');
    let percentageQuality = Math.round(((qualityValue - 0.5) / 1) * 100);
    let percentageCost = Math.round(((costValue - 0.5) / 1) * 100);

    if (qualityElement && costElement) {
        qualityElement.innerHTML = '???';
        costElement.innerHTML = '???';

        setTimeout(function() {
            qualityElement.innerHTML = percentageQuality + "%";
            costElement.innerHTML = percentageCost + "%";
        }, 1250);
    }
}

function loyalDisplayPercentages() {
    let qualityElement = document.getElementById('qualityLevelPercent');
    let costElement = document.getElementById('costLevelPercent');
    let percentageQuality = Math.round(((qualityValue - 0.5) / 1) * 100);
    let percentageCost = Math.round(((costValue - 0.5) / 1) * 100);

    if (qualityElement && costElement) {
        qualityElement.innerHTML = '+10';
        costElement.innerHTML = '+10';

        setTimeout(function() {
            qualityElement.innerHTML = percentageQuality + "%";
            costElement.innerHTML = percentageCost + "%";
        }, 1250);
    }
}

function changeCustomFill() {
    const localCustomerStatusElement = document.getElementById('localCustomerStatus');

    if (coins >= 25000) {
        if (!buttonCooldown) {
            coins -= 25000;
            qualityValue = Math.random() + 0.5;
            costValue = Math.random() + 0.5;

            loyalCustomerCounter = 0;
            loyalCustomerActivated = false;
            localCustomerStatusElement.textContent = `${365 - loyalCustomerCounter} Tage bis loyaler Kunde`;

            probabilitySuccess = 80;

            checkLoyalCustomerStatus();
            updateBarWithAnimation('progressFillQuality', qualityValue);
            updateBarWithAnimation('progressFillCost', costValue);
            hidePercentages();
            updateUpgradeButtons();
            updatePrestige();
            updateCoins();

            buttonCooldown = true;
            let countdown = 10;
            let buttonElement = document.getElementById("changeCustomFill");

            let countdownInterval = setInterval(function() {
                buttonElement.innerText = `Warte noch ${countdown} Tage`;
                countdown--;

                if (countdown < 0) {
                    buttonCooldown = false;
                    buttonElement.innerHTML = '<span>Neuen Lieferanten suchen</span> <br> <span>25K</span>';
                    clearInterval(countdownInterval);
                }
            }, 5000);

            const supplierNames = ["BikeCare GmbH", "CyclingTech", "WheelWorks AG", "GearUp GmbH", "BikePro KG", "Barans Fahrradteile", "RideSmart GmbH", "PedalPower GmbH", "Die Bike-Profis", "CycleSolutions Logistik", "RideEasy GmbH", "PedalPusher AG", "RideMate OHG", "BikeGenius GmbH", "DLH Group", "Lieferino", "Gubi Fortnite"];
            const randomIndex = Math.floor(Math.random() * supplierNames.length);
            supplierName = supplierNames[randomIndex];
            updateDeliveryName();
        } else {
            alert("Du musst noch warten, bis der Lieferant verfügbar ist.");
        }
    } else {
        alert("Spar noch ein wenig. Mehr Geld, aber bessere Lieferanten?");
    }
}

function updateDeliveryName() {
    document.getElementById('deliveryName').innerText = supplierName;
}

document.getElementById("changeCustomFill").addEventListener("click", changeCustomFill);

function checkLoyalCustomerStatus() {
    const localCustomerStatusElement = document.getElementById('localCustomerStatus');

    if (!loyalCustomerActivated && loyalCustomerCounter >= 365) {
        qualityValue += 0.1;
        costValue += 0.1;

        updateBarWithAnimation('progressFillQuality', qualityValue);
        updateBarWithAnimation('progressFillCost', costValue);
        loyalDisplayPercentages();
        updateUpgradeButtons();
        updatePrestige();

        localCustomerStatusElement.textContent = "Loyaler Kunde";
        loyalCustomerActivated = true;
    } else if (!loyalCustomerActivated) {
        localCustomerStatusElement.textContent = `${365 - loyalCustomerCounter} Tage bis loyaler Kunde`;
    }

    if (loyalCustomerActivated) {
        localCustomerStatusElement.textContent = "Loyaler Kunde";
    }
}

setInterval(() => {
    loyalCustomerCounter += 1;
    checkLoyalCustomerStatus();
}, 5000);

function gambleDelivery() {
  const gamble = Math.random() * 100 < probabilitySuccess;
            if (gamble) {
                qualityValue += 0.1;
                costValue += 0.1;
            } else {
                qualityValue -= 0.2;
                costValue -= 0.2;
                if (qualityValue < 0.5) {
                qualityValue = 0.5;
                }
                if (costValue < 0.5) {
                costValue = 0.5;
                }
            }

            if (probabilitySuccess > minimumProbability) {
                probabilitySuccess -= 10;
            }
            updateBarWithAnimation('progressFillQuality', qualityValue);
            updateBarWithAnimation('progressFillCost', costValue);
            hidePercentages();
            updateUpgradeButtons();
            updateGamble();
            updatePrestige();
            updateCoins();
        }

// Prestige 

function buyPrestige() {
  if (coins >= (prestigeCost / costValue)) {
    coins -= (prestigeCost / costValue);
    prestigeCount++;
    prestigeMultiplier *= 2;
    prestigeCost *= 5;
    coins = 0;
    upgradeCoinsPlayer = 1;
    upgradeCoinsPlayerCost = 10;
    upgradeCoinsWorker = 1;
    upgradeCoinsWorkerCost = 10;
    upgradeCoins = 1;
    upgradeCoinsCost = 50;
    upgradeStrength = 1;
    upgradeStrengthCost = 100;
    upgradeJob = 10;
    upgradeJobCost = 250;
    saveProgress();
    location.reload();
  } else {
  alert("Du hast nicht genug geld für die Erweiterung");
  }
}

// Tastatur Kürzel

function setupKeyListeners() {
  document.addEventListener("keydown", (event) => {
    const key = event.key;
    if (!isNaN(key) && key >= 1 && key <= orders.length) {
      const index = key - 1;
      const order = orders[index];
      if (order && order.classList.contains("job")) {
        handleJobClick(order);
      }
    }
  });
}

setupKeyListeners();

function openMenu() {
  window.open('../index.html', '_self');
}
