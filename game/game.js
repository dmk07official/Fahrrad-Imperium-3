//Speichern, Laden, Variablen
let coins = 0;
let upgrade = 1;

// Individuelle Intervalle für Worker
const workerIntervals = {
  worker1: 800,
  worker2: 800,
  worker3: 800,
  worker4: 800,
  worker5: 800,
};

// Upgrade-Kosten für Worker
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
    upgrade,
    workerIntervals,
    workerUpgradeCost,
  };

  localStorage.setItem('progress', JSON.stringify(progress));
}

function loadProgress() {
  const progress = JSON.parse(localStorage.getItem('progress'));
  if (progress) {
    coins = progress.coins || 0;
    upgrade = progress.upgrade || 1;
    Object.assign(workerIntervals, progress.workerIntervals || {});
    Object.assign(workerUpgradeCost, progress.workerUpgradeCost || {});
  }
  updateCoins();
  updateWorkerButtons();
}

// Funktion zur Aktualisierung der Upgrade-Buttons
function updateWorkerButtons() {
  for (const workerId in workerUpgradeCost) {
    const upgradeButton = document.getElementById(`workerUpgrade_${workerId}`);
    if (upgradeButton) {
      upgradeButton.textContent = `Ausbilden: ${workerUpgradeCost[workerId]}€`;
    }
  }
}

// Beim Laden der Seite Progress laden
loadProgress();
        

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

function formatNumber(number) {
    const suffixes = ['', 'K', 'M', 'B', 'T', 'aa', 'ab', 'ac', 'ad', 'ae', 'af', 'ag', 'ah', 'ai', 'aj', 'ak', 'al', 'am', 'an', 'ao', 'ap', 'aq', 'ar', 'as', 'at', 'au', 'av', 'aw', 'ax', 'ay', 'az'];
    
    let i = 0;
    while (number >= 1e3 && i < suffixes.length - 1) {
        number /= 1e3;
        i++;
    }

    return (number.toFixed(2) + suffixes[i]).replace('.00', '');
}

// Update

function updateCoins() {
        
document.getElementById('coins').textContent = formatNumber(coins);
        }

// Werkstatt

let selectedOrder = null;
let currentPlayer = false;
let currentWorker = false;

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
  const selectorContainer = document.getElementById("selectorContainer");
  selectorContainer.style.display = "flex";
   const selector = document.getElementById("selector");
   selector.style.display = "flex";
   selectedOrder = order;
   const blur = document.getElementById("blur");
   blur.style.display = "block";

  
   const playerButton = document.getElementById("selectorPlayer");
if (currentPlayer) {
    playerButton.style.border = "solid red calc(var(--base-size) * 0.15)";
    playerButton.style.color = "red";
}

const workerButton = document.getElementById(`selectorWorker${workerId.slice(-1)}`);
if (currentWorker) {
    workerButton.style.border = "solid red calc(var(--base-size) * 0.15)";
    workerButton.style.color = "red";
}

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
  progress++;

  const progressBarFill = playerDiv.querySelector(".progress-bar-fill");
  const progressPercentage = Math.min((progress / job.work) * 100, 100);
  progressBarFill.style.width = `${progressPercentage}%`;
  playerDiv.querySelector("p:nth-of-type(1)").textContent = `Progress: ${progress}/${job.work}`;

  if (progress >= job.work) {
    currentPlayer = false;
    coins += job.payment * upgrade;
    playerDiv.dataset.job = "";
    playerDiv.innerHTML = "Spieler: Kein Job";
    playerDiv.removeEventListener("click", handlePlayerClick);
    updateCoins();
    saveProgress();
  } else {
    playerDiv.dataset.job = JSON.stringify({ ...job, progress });
  }
}

function worker1() {
  assignJob(workerDivs.worker1, "worker1");
  const status = document.getElementById("workerStatus1");
  status.style.backgroundColor = "red";
}

function worker2() {
  assignJob(workerDivs.worker2, "worker2");
  const status = document.getElementById("workerStatus2");
  status.style.backgroundColor = "red";
}

function worker3() {
  assignJob(workerDivs.worker3, "worker3");
  const status = document.getElementById("workerStatus3");
  status.style.backgroundColor = "red";
}

function worker4() {
  assignJob(workerDivs.worker4, "worker4");
  const status = document.getElementById("workerStatus4");
  status.style.backgroundColor = "red";
}

function worker5() {
  assignJob(workerDivs.worker5, "worker5");
  const status = document.getElementById("workerStatus5");
  status.style.backgroundColor = "red";
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
  currentWorker = true;

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
    statusFinished.style.backgroundColor = "green";
  }
  clearInterval(interval);
  delete activeIntervals[workerId];
  coins += job.payment * upgrade;
  workerDiv.dataset.job = "";
  workerDiv.innerHTML = "Kein Job";
  currentWorker = false;
  updateCoins();
  saveProgress();
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

function upgradeCoins() {
  if (coins >= 500) {
    coins -= 500; // Ziehe 500 von coins ab und speichere das Ergebnis
    upgrade += 0.1; // Multipliziere upgrade mit 1.1 und speichere das Ergebnis
  }
  updateCoins(); // Aktualisiere die Anzeige oder Verarbeitung
}


// Tastatur Kürzel

let isAssignMode = false;

// Job Auswahl mit 1-5
function setupKeyListeners() {
  document.addEventListener("keydown", (event) => {
    const key = event.key;

    // Überprüfen, ob das Werkstatt-Window aktiv ist
    const werkstattActive = document.getElementById("werkstatt").style.display === "block";

    if (key.toLowerCase() === "s") {
      isAssignMode = true; // S gedrückt halten aktiviert den Zuweisungsmodus
    }

    if (!isNaN(key) && key >= 1 && key <= orders.length) {
      const index = key - 1;
      const order = orders[index];

      if (order && order.classList.contains("job")) {
        if (isAssignMode) {
          // Wenn S gedrückt wird, Aufträge zuweisen
          assignOrderToWorkerOrPlayer(order, key);
        } else {
          // Ansonsten Auftrag nur auswählen
          handleJobClick(order);
        }
      }
    }

    // Key "6" für Player-Zuweisung
    if (key === "6" && isAssignMode && selectedOrder) {
      player();
    }
  });

  document.addEventListener("keyup", (event) => {
    if (event.key.toLowerCase() === "s") {
      isAssignMode = false; // S loslassen deaktiviert den Zuweisungsmodus
    }
  });
}

function assignOrderToWorkerOrPlayer(order, key) {
  const workerId = `worker${key}`;
  const workerDiv = workerDivs[workerId];

  if (workerDiv) {
    assignJob(workerDiv, workerId); // Auftrag an den entsprechenden Worker zuweisen
  } else if (key === "6") {
    player(); // Auftrag an den Spieler zuweisen
  }
}



// Rufe diese Funktion am Ende des Skripts auf, um die Tastenevents zu initialisieren
setupKeyListeners();
