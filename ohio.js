var cookie = document.getElementById("cookie");
var cookieHeader = document.getElementById("cookie-header");
var upgradeContainer = document.getElementById("upgrade-container");
var superCookie = document.getElementById("super-cookie");
var saveButton = document.getElementById("save-button");
var resetButton = document.getElementById("reset-button");
var game = JSON.parse(localStorage.getItem("game")) || {
  cookies: 0,
  buildings: {},
  achievementsGained: [],
  totalCookiesClicked: 0,
  superCookiesClicked: 0,
  stats: {
    cps: 0,
    cpsModifier: 1,
    clickPower: 1,
    clickPowerModifier: 1,
  },
};

var tickCount = 0;

const y = Math.random() * 10000;

const translations = {
  clickPower: "click power",
  cps: "cookies per second",
};

const upgrades = {
  cursor: {
    name: "Cursor",
    description: "This is a cursor to help cookie your cookies",
    price: 125,
    effects: {
      add: {
        cps: 0.2,
      },
    },
  },
  "cookie-tray": {
    name: "Cookie Tray",
    description: "A cookie tray to help cook cookies evenly ",
    price: 700,
    effects: {
      add: {
        cps: 1.2,
      },
    },
  },
  "oven-mitts": {
    name: "Oven Mitts",
    description:
      "Oven mitts to help you take cookies out of the oven without burning your fingies",
    price: 1000,
    effects: {
      add: {
        clickPower: 1,
      },
    },
  },
  "mixing-machine": {
    name: "Mixing Machine",
    description: "A machine to automatically mix the cookie dough",
    price: 6000,
    effects: {
      add: {
        cps: 10,
      },
    },
  },

  oven: {
    name: "Industrial Oven",
    description: "An oven that bakes cookies ",
    price: 30000,
    effects: {
      add: {
        cps: 65,
      },
    },
  },
};

//achievements and stuff
const achievements = {
  "1000-cookies-cooked": {
    name: "Cookie Startup",
    description: "You baked 1000 cookies!",
    requirements: () => {
      return game.totalCookiesClicked >= 1000;
    },
  },
  "10000-cookies-cooked": {
    name: "Cookie Entrepreneur",
    description: "You baked 10000 cookies by hand! Pretty impressive.",
    requirements: () => {
      return game.totalCookiesClicked >= 10000;
    },
  },
  "10-buildings": {
    name: "Cookie Franchise Owner",
    description: "You bought 10 buildings!",
    requirements: () => {
      return Object.values(game.buildings).reduce((a, b) => a + b, 0) >= 10;
    },
  },
  "25-buildings": {
    name: "Cookie Realtor",
    description: "You bought 25 buildings!",
    requirements: () => {
      return Object.values(game.buildings).reduce((a, b) => a + b, 0) >= 25;
    },
  },
  "super-cookie-clicked": {
    name: "Cookie Party",
    description: "You got your first super cookie!",
    requirements: () => {
      return game.superCookiesClicked >= 1;
    },
  },

  "5-super-cookie-clicked": {
    name: "Cookie Fiesta",
    description: "You got five super cookis!!!",
    requirements: () => {
      return game.superCookiesClicked >= 5;
    },
  },
};

Object.keys(upgrades).forEach((upgrade) => {
  if (!game.buildings[upgrade]) {
    game.buildings[upgrade] = 0;
  }
});

function achievementsCheckTick() {
  for (const achievementName in achievements) {
    const achievement = achievements[achievementName];
    if (
      achievement.requirements() &&
      !game.achievementsGained.includes(achievementName)
    ) {
      alert(`You got an achievement!
${achievement.name} - ${achievement.description}`);
      game.achievementsGained.push(achievementName);
    }
  }
}

cookie.addEventListener("click", (e) => {
  const moneyGainElement = document.createElement("h2");
  moneyGainElement.classList.add("moneyGain");
  moneyGainElement.textContent = `+`;
  moneyGainElement.textContent += game.stats.clickPower;

  let fade = 100;
  moneyGainElement.style.top = `${e.clientY - (100 - fade)}px`;
  moneyGainElement.style.left = `${e.clientX}px`;

  let v = setInterval(() => {
    fade--;

    if (fade < 0) {
      moneyGainElement.remove();
      clearInterval(v);
    }

    moneyGainElement.style.top = `${e.clientY - (100 - fade)}px`;
    moneyGainElement.style.left = `${e.clientX}px`;
    moneyGainElement.style.opacity = fade / 100;
  }, 10);
  cookieClicked();
  document.body.append(moneyGainElement);

  function cookieClicked() {
    game.cookies += game.stats.clickPower;
    game.totalCookiesClicked += 1;
    updateText();
  }
});

function updateText() {
  cookieHeader.innerHTML = `${game.cookies.toLocaleString()} cookies <br>  ${game.stats.clickPower.toLocaleString()} per click - ${game.stats.cps.toLocaleString()} cps`;
  document.title = `GreyClicker - ${game.cookies.toLocaleString()} cookies`;
  for (upgradeName in upgrades) {
    const upgradeHeader = document.querySelector(`#${upgradeName}`);

    upgradeHeader.querySelector(".buildingsOwnedIndicator").innerHTML =
      `(${game.buildings[upgradeName].toLocaleString()})`;
  }
}

superCookie.addEventListener("click", superCookieClicked);
const frenzyHeader = document.querySelector("#cookiefrenzy-header");
function superCookieClicked() {
  game.cookies += y;
  updateText();
  frenzyHeader.style.visibility = "visible";
  setTimeout(() => {
    frenzyHeader.style.visibility = "hidden";
  }, 15000);
  cookieFrenzy();
  game.superCookiesClicked += 1;
}

const mMOverlay = document.querySelector("#mmoverlay");

function cookieFrenzy() {
  mMOverlay.style.visibility = "visible";
  game.stats.clickPowerModifier *= 2;
  game.stats.cpsModifier *= 1.5;
  setTimeout(() => {
    mMOverlay.style.visibility = "hidden";
    game.stats.clickPowerModifier /= 2;
    game.stats.cpsModifier /= 1.5;
  }, 15000);
}

frenzyHeader.style.visibility = "hidden";

//upgrade stuffies

function buyUpgrade(count, upgradeName, e) {
  const upgrade = upgrades[upgradeName];
  if (game.cookies >= count * upgrade.price) {
    game.cookies -= count * upgrade.price;

    const moneyLossElement = document.createElement("h2");
    moneyLossElement.classList.add("moneyLoss");
    moneyLossElement.innerHTML = `- $${(count * upgrade.price).toLocaleString()}`;

    let fade = 100;
    moneyLossElement.style.top = `${e.clientY - (100 - fade)}px`;
    moneyLossElement.style.left = `${e.clientX}px`;

    let v = setInterval(() => {
      fade--;

      if (fade < 0) {
        moneyLossElement.remove();
        clearInterval(v);
      }

      moneyLossElement.style.top = `${e.clientY - (100 - fade)}px`;
      moneyLossElement.style.left = `${e.clientX}px`;
      moneyLossElement.style.opacity = fade / 100;
    }, 10);

    document.body.append(moneyLossElement);

    if (upgrade.effects.add) {
      game.buildings[upgradeName] += count;
    }
  } else alert("no cash?");
}

for (const upgradeName in upgrades) {
  const upgrade = upgrades[upgradeName];
  const element = document.createElement("div");

  const elementHeader = document.createElement("h2");

  const buildingsOwnedIndicator = document.createElement("span");
  buildingsOwnedIndicator.classList.add("buildingsOwnedIndicator");
  buildingsOwnedIndicator.innerHTML = `(${game.buildings[upgradeName].toLocaleString()})`;

  elementHeader.append(
    buildingsOwnedIndicator,
    document.createTextNode(` ${upgrade.name} - $${upgrade.price}`),
  );
  element.id = upgradeName;

  const elementDescription = document.createElement("p");
  elementDescription.textContent =
    upgrade.description +
    Object.keys(upgrade.effects.add)
      .map((effectName) => {
        return ` -    adds ${upgrade.effects.add[effectName]} ${translations[effectName]}`;
      })
      .join(" ");
  const upgradeButton = document.createElement("button");
  upgradeButton.classList.add("upgradeButton");

  const upgrade10Button = document.createElement("button");
  upgrade10Button.classList.add("upgrade10Button");

  const upgrade100Button = document.createElement("button");
  upgrade100Button.classList.add("upgrade100Button");

  upgradeButton.addEventListener("click", (e) => {
    buyUpgrade(1, upgradeName, e);
  });
  upgrade10Button.addEventListener("click", (e) => {
    buyUpgrade(10, upgradeName, e);
  });

  upgrade100Button.addEventListener("click", (e) => {
    buyUpgrade(100, upgradeName, e);
  });

  const upgradeCountHeader = document.createElement("h3");
  upgradeCountHeader.innerHTML = `x${game.buildings[upgradeName]}`;
  upgradeCountHeader.classList.add = "upgradeCountHeader";

  element.append(
    elementHeader,
    elementDescription,
    upgradeButton,
    upgrade10Button,
    upgrade100Button,
  );

  upgradeContainer.append(element);
}

setInterval(() => {
  game.cookies += game.stats.cps / 10;
  const blockedStats = ["cpsModifier", "clickPowerModifier"];

  Object.keys(game.stats).forEach((stat) => {
    if (blockedStats.includes(stat)) return;
    if (stat == "clickPower") {
      game.stats[stat] = 1;
    } else {
      game.stats[stat] = 0;
    }
  });

  //apple jingle bells
  for (building in game.buildings) {
    const buildingsOwned = game.buildings[building];

    Object.keys(upgrades[building].effects.add).forEach((effect) => {
      game.stats[effect] +=
        upgrades[building].effects.add[effect] * buildingsOwned;
    });
  }
  game.stats.cps *= game.stats.cpsModifier;
  game.stats.clickPower *= game.stats.clickPowerModifier;
  updateText();

  for (const achievement in achievements) {
  }
}, 100);

const c = document.querySelector("body");
const b = document.querySelector("#super-cookie");

function change() {
  b.style.visibility = "hidden";
  b.style.left = Math.random() * 100 + "%";
  b.style.top = Math.random() * 100 + "%";
}

b.addEventListener("click", change);

//ticks and stuffies
var t = setInterval(achievementsCheckTick, 10);

var w = setInterval(checkTickCount, 10);

function checkTickCount() {
  if (tickCount >= 1) clearInterval(t);
}

function superCookieTick() {
  setTimeout(
    () => {
      b.style.visibility = "visible";
      setTimeout(() => {
        b.style.visibility = "hidden";
        superCookieTick();
      }, 15000);
    },
    Math.random() * 900 * 1000,
  );
}
superCookieTick();
function save() {
  localStorage.setItem("game", JSON.stringify(game));
  alert("Game saved");

  game.stats.clickPowerModifier = 1;
  game.stats.cpsModifier = 1;
}
change();
//save button stuffs
saveButton.addEventListener("click", save);

function reset() {
  if (confirm("Are you sure you want to reset?")) {
    localStorage.clear();
    location.reload();
  }
}
resetButton.addEventListener("click", reset);
