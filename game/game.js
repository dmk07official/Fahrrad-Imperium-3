//Speichern, Laden, Variablen
let coins = 0;
let upgrade = 1;
let upgradeCoins = 1;
let upgradeCoinsCost = 10;
let upgradeStrength = 1;
let upgradeStrengthCost = 50;
let day = 1;
let month = 1;
let year = 2050;

const workerIntervals = {
  worker1: 800,
  worker2: 800,
  worker3: 800,
  worker4: 800,
  worker5: 800,
};

const workerUpgradeCost = {
  worker1: 100,
  worker2: 100,
  worker3: 100,
  worker4: 100,
  worker5: 100,
};

function saveProgress() {
  const progress = {
    coins,
    upgradeCoins,
    upgradeCoinsCost,
    upgradeStrength,
    upgradeStrengthCost,
    workerIntervals,
    workerUpgradeCost,
    day,
    month,
    year,
  };

  localStorage.setItem('progress', JSON.stringify(progress));
}

function loadProgress() {
  const progress = JSON.parse(localStorage.getItem('progress'));
  if (progress) {
    coins = progress.coins || 0;
    upgradeCoins = progress.upgradeCoins || 1;
    upgradeCoinsCost = progress.upgradeCoinsCost || 10;
    upgradeStrength = progress.upgradeStrength || 1;
    upgradeStrengthCost = progress.upgradeStrengthCost || 10;
    day = progress.day || 1;
    month = progress.month || 1;
    year = progress.year || 2050;
    Object.assign(workerIntervals, progress.workerIntervals || {});
    Object.assign(workerUpgradeCost, progress.workerUpgradeCost || {});
  }
  updateCoins();
  updateDate();
  updateWorkerButtons();
  updateUpgradeButtons();
  startSaveInterval();
}

function updateCoins() {
        
document.getElementById('coins').textContent = formatNumber(coins);
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
  document.getElementById('upgradeCoinsCost').textContent = formatNumber(upgradeCoinsCost);
  document.getElementById('upgradeStrengthCost').textContent = formatNumber(upgradeStrengthCost);
}

function startSaveInterval() {
  setInterval(() => {
    saveProgress();
  }, 1000);
}

loadProgress();

// Basic JS

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

function formatNumber(number) {
    const suffixes = ['', 'K', 'M', 'B', 'T', 'aa', 'ab', 'ac', 'ad', 'ae', 'af', 'ag', 'ah', 'ai', 'aj', 'ak', 'al', 'am', 'an', 'ao', 'ap', 'aq', 'ar', 'as', 'at', 'au', 'av', 'aw', 'ax', 'ay', 'az'];
    
    let i = 0;
    while (number >= 1e3 && i < suffixes.length - 1) {
        number /= 1e3;
        i++;
    }

    return (number.toFixed(2) + suffixes[i]).replace('.00', '');
}

// Werkstatt

let selectedOrder = null;
let currentPlayer = false;
let currentWorker = {
  worker1: false,
  worker2: false,
  worker3: false,
  worker4: false,
  worker5: false,
};

function upgradeWorker(workerId) {
  if (workerIntervals[workerId] !== undefined) {
    
    if (coins >= workerUpgradeCost[workerId]) {
      coins -= workerUpgradeCost[workerId];
      workerIntervals[workerId] *= 0.8;
      workerUpgradeCost[workerId] *= 10;

      const upgradeButton = document.getElementById(`workerUpgrade_${workerId}`);
      if (upgradeButton) {
        upgradeButton.textContent = `Aufwerten: ${workerUpgradeCost[workerId]}€`;
      }
      
      updateCoins();
    } else {
      alert("Nicht genug € für die Ausblidung!");
    }
  } 
}


const orders = Array.from({ length: 5 }, (_, i) => document.getElementById(`order${i + 1}`));
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
  order.textContent = "Auftrag wird gesucht... 10";

  let timer = 10;
  const interval = setInterval(() => {
    timer--;
    order.textContent = `Auftrag wird gesucht... ${timer}`;
    if (timer <= 0) {
      clearInterval(interval);
      spawnJob(order);
      findNextPassiveJob();
    }
  }, 500);
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
  const selectorContainer = document.getElementById("selectorContainer");
  selectorContainer.style.display = "flex";
   const selector = document.getElementById("selector");
   selector.style.display = "flex";
   selectedOrder = order;
   const blur = document.getElementById("blur");
   //blur.style.display = "block";

   selectorContainer.addEventListener("click", (event) => {
  if (!selector.contains(event.target)) {
    fadeOutSelector();
  }
});
  
   const playerButton = document.getElementById("selectorPlayer");
if (currentPlayer) {
    playerButton.style.border = "solid #C62828 calc(var(--base-size) * 0.15)";
    playerButton.style.color = "#C62828";
} else {
    playerButton.style.border = "solid #2E7D32 calc(var(--base-size) * 0.15)";
    playerButton.style.color = "#2E7D32";
}

for (const workerId in currentWorker) {
    const workerButton = document.getElementById(`selectorWorker${workerId.slice(-1)}`);
    if (workerButton) {
      if (currentWorker[workerId]) {
        workerButton.style.border = "solid #C62828 calc(var(--base-size) * 0.15)";
        workerButton.style.color = "#C62828";
      } else {
        workerButton.style.border = "solid #2E7D32 calc(var(--base-size) * 0.15)";
        workerButton.style.color = "#2E7D32";
      }
    }
  }

}

function fadeOutSelector() {
  selectorContainer.classList.add("fade-out-selector");
  selector.classList.add("fade-out-selector");
  blur.classList.add("fade-out-selector");

  setTimeout(() => {
    selectorContainer.classList.remove("fade-out-selector");
    selector.classList.remove("fade-out-selector");
    blur.classList.remove("fade-out-selector");
  }, 200);
}

function player() {
  if (!selectedOrder || !selectedOrder.classList.contains("job")) {
    alert("Du bist schon beschäftigt.");
    return;
  }
  
  currentPlayer = true;
  
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
}

function handlePlayerClick() {
  const job = JSON.parse(playerDiv.dataset.job);
  let progress = parseInt(job.progress) || 0;
  progress += upgradeStrength;

  const progressBarFill = playerDiv.querySelector(".progress-bar-fill");
  const progressPercentage = Math.min((progress / job.work) * 100, 100);
  progressBarFill.style.width = `${progressPercentage}%`;
  playerDiv.querySelector("p:nth-of-type(1)").textContent = `Progress: ${progress}/${job.work}`;

  if (progress >= job.work) {
    currentPlayer = false;
    coins += job.payment * upgradeCoins;
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
  coins += job.payment * upgradeCoins;
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
}

function extractJobData(order) {
  return {
    name: order.querySelector("strong").textContent,
    work: parseInt(order.dataset.work),
    progress: parseInt(order.dataset.progress),
    payment: parseInt(order.dataset.payment),
  };
}

//upgrade

function buyUpgradeCoins() {
  if (coins >= upgradeCoinsCost) {
    coins -= upgradeCoinsCost;
    upgradeCoins += 0.1;
    upgradeCoinsCost *= 1.1;
  }
  updateCoins();
  updateUpgradeButtons();
}

function buyUpgradeStrength() {
  if (coins >= upgradeStrengthCost) {
    coins -= upgradeStrengthCost;
    upgradeStrength += 0.25;
    upgradeStrengthCost *= 1.1;
  }
  updateCoins();
  updateUpgradeButtons();
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
