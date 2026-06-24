var cookie = document.getElementById("cookie");
var cookieHeader = document.getElementById("cookie-header");
var upgradeContainer = document.getElementById("upgrade-container");
var superCookie = document.getElementById("super-cookie");
var saveButton = document.getElementById("save-button");
var resetButton = document.getElementById("reset-button");
var bitcookiePriceHistoryChart = document.getElementById("bitcookiePriceHistoryChart");
var bitcookiePriceHistory = document.getElementById("bitcookiePriceHistory");
var sellbitcookiesButton = document.getElementById("sellBitcookies");

let chart;

const bitcookieStartingPrice = 10_000;
const bitcookieMaxVariation = 8_000;

var game = JSON.parse(localStorage.getItem("game")) ?? {
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
    bitclickPower: 0,
    bitclickPowerModifier: 1,
  },
  bitcookies: {
    price: bitcookieStartingPrice,
    priceHistory: [bitcookieStartingPrice],
    owned: 0,
  }
};


var tickCount = 0;

const y = Math.random() * 10000;

const translations = {
  clickPower: "click power",
  cps: "cookies per second",
  bitclickPower: "bitcookie click power"
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
  seeds: {
    name: "Baked Chicken Cookie seeds",
    description: "Improved Baked Chicken flavored cookie seeds",
    price: 50_000,
    effects: {
      add: {
        clickPower: 30
      }
    }
  },
  gpu: {
    name: "RTX 8080",
    description: "automagically mines bitcookies, which convert to real ones",
    price: 100_000,
    effects: {
      add: {
        bitclickPower: 0.01
      }
    }
  },
  dirt_farmer_joe: {
    name: "Dirt Farmer Joe",
    description: "harvest the cookie seeds from the roots of the earth",
    price: 750_000,
    effects: {
      add: {
        cps: 250
      }
    }
  },
  mcdonalds: {
    name: "McDonalds Store",
    description: "A McDonalds location purely dedicated to selling cookies",
    price: 5_000_000,
    effects: {
      add: {
        cps: 5250,
        clickPower: 500
      }
    }
  },
  cookiescript: {
    name: "CookieScript™️ Tutorial book",
    description: "Code cookies directly into the world",
    price: 175_000_000,
    effects: {
      add: {
        cps: 10_000,
        clickPower: 2_500,
        bitclickPower: 50
      }
    }
  }

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
  "max-price-bitcookie": {
    name: "Wolf of cookie street",
    description: "Bit cookie price reached 18,000!!!",
    requirements: () => {
      return game.bitcookies.price >= 18000;
    }
  }
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

  const bitmoneyGainElement = document.createElement("h2")
  bitmoneyGainElement.classList.add("bitmoneyGain")
  bitmoneyGainElement.textContent = "+" + game.stats.bitclickPower;
  bitmoneyGainElement.style.visibility = game.stats.bitclickPower > 0 ? "visible" : "hidden";

  bitmoneyGainElement.style.top = `${e.clientY - (100 - fade)}px`;
  bitmoneyGainElement.style.left = `${e.clientX}px`;

  let v = setInterval(() => {
    fade--;

    if (fade < 0) {
      moneyGainElement.remove();
      bitmoneyGainElement.remove();
      clearInterval(v);
    }

    moneyGainElement.style.top = `${e.clientY - (100 - fade)}px`;
    moneyGainElement.style.left = `${e.clientX}px`;
    moneyGainElement.style.opacity = fade / 100;

    bitmoneyGainElement.style.top = `${e.clientY - (100 - fade) + 25}px`;
    bitmoneyGainElement.style.left = `${e.clientX + 25}px`;
    bitmoneyGainElement.style.opacity = fade / 100;
  }, 10);


  cookieClicked();

  document.body.append(moneyGainElement, bitmoneyGainElement);

  function cookieClicked() {
    game.cookies += game.stats.clickPower;
    game.totalCookiesClicked += 1;
    game.bitcookies.owned += game.stats.bitclickPower ?? 0
    updateText();
  }
});

function updateText() {
  cookieHeader.innerHTML = `${game.cookies.toLocaleString()} cookies ${game.bitcookies.owned > 0 ? `<br>${game.bitcookies.owned.toFixed(2).toLocaleString()} bitcookies` : ""} <br>  ${game.stats.clickPower.toLocaleString()} per click - ${game.stats.cps.toLocaleString()} cps`;
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
  const blockedStats = ["cpsModifier", "clickPowerModifier", "bitclickPowerModifier"];

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
  game.stats.bitclickPower *= game.stats.bitclickPowerModifier

  updateText();
}, 100);

setInterval(() => {
  tickMarket();
}, 500)

function tickMarket() {
  game.bitcookies.price += ((Math.random() * 10) - 5) * 20 * 8;

  game.bitcookies.price = Math.min(Math.max(game.bitcookies.price, bitcookieStartingPrice - bitcookieMaxVariation), bitcookieStartingPrice + bitcookieMaxVariation)

  game.bitcookies.priceHistory.push(game.bitcookies.price);
  chart.data.labels.push(new Date().toLocaleTimeString())
  chart.data.datasets[0].data.push(game.bitcookies.price)

  if (game.bitcookies.priceHistory.length > 50) {
    game.bitcookies.priceHistory.shift()
    chart.data.datasets[0].data.shift();
    chart.data.labels.shift()
  }

  chart.data.datasets[0].label = `Bitcookie Price (${game.bitcookies.price.toLocaleString()})`

  chart.update("none");
}

const c = document.querySelector("body");
const b = document.querySelector("#super-cookie");

function change() {
  b.style.visibility = "hidden";
  b.style.left = Math.random() * 100 + "%";
  b.style.top = Math.random() * 100 + "%";
}

b.addEventListener("click", change);

//ticks and stuffies
var t = setInterval(achievementsCheckTick, 400);

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

setInterval(() => {
  if (game.stats.bitclickPower > 0) {
    bitcookiePriceHistory.style.visibility = "visible"

  } else {
    bitcookiePriceHistory.style.visibility = "hidden"
  }
}, 1000)









sellbitcookiesButton.addEventListener("click", (e) => {
  if (game.bitcookies.owned > 0) {


    let delta = game.bitcookies.owned * game.bitcookies.price
    game.cookies += delta;
    game.bitcookies.owned = 0;

    const moneyGainElement = document.createElement("h2");
    moneyGainElement.classList.add("moneyGain");
    moneyGainElement.innerHTML = `+ $${(delta).toLocaleString()}<br><span class="bitmoneyGain"> - ${(delta / game.bitcookies.price).toFixed().toLocaleString()}</span>`;

    let fade = 400;
    let totalFade = 400;

    moneyGainElement.style.top = `${e.clientY - (totalFade - fade)}px`;
    moneyGainElement.style.left = `${e.clientX}px`;

    let v = setInterval(() => {
      fade--;

      if (fade < 0) {
        moneyGainElement.remove();
        clearInterval(v);
      }

      moneyGainElement.style.top = `${e.clientY - (totalFade - fade)}px`;
      moneyGainElement.style.left = `${e.clientX}px`;
      moneyGainElement.style.opacity = fade / totalFade;
    }, 10);

    document.body.append(moneyGainElement)
  }
})

chart = new Chart(bitcookiePriceHistoryChart, {
  type: "line",
  data: {
    labels: new Array(game.bitcookies.priceHistory.length).fill(""),
    datasets: [{
      label: 'Bitcookie Price',
      data: [],
      fill: true,
      borderColor: 'rgb(176, 59, 248)',
      color: "red",
      tension: 0.25
    }],
  },
  options: {
    scales: {
      y: {
        min: 2000,
        max: 18000
      },
      x: {
        ticks: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: "rgb(176, 59, 248)",
          boxWidth: 0,
          font: {
            size: 28
          }
        }
      }
    }
  }
})

chart.data.datasets[0].data = game.bitcookies.priceHistory