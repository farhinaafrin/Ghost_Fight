// TODO: Royalty Free Music from Bensound
// player
var initialPenguins = 3;
var penguinCount = 0;
var playerInfo = {
  x: 100,
  y: 500 / 2,
  penguins: [],
};

// itemss
var chimneys = [];
var items = [];
var penguinSpeed = 1;
var droneSpeed = 6;
var cloudSpeed = 2;
var grinchSpeed = 3;

var gifts = [];

// game
var canvas;
var canvasWidth = 1000;
var canvasHeight = 500;
var frameCount = 0;
var score = 0;
var roundTime = 60;
var endTime = new Date().getTime() / 1000 + roundTime;
var gameOver = false;
var interval;
var debug = false;

var grinch = null;
var gameStatus = "normal";
var sound;

var firstTime = true;
var totalGifts = 100;
var giftsToDeliver = totalGifts;
function main() {
  sound = document.getElementById("sound");
  sound.volume = 0.2;
  //setTimeout(function(){sound.play();},1000);

  canvas = document.getElementById("gameCanvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  context = canvas.getContext("2d");
  context.imageSmoothingEnabled = false;
  canvas.addEventListener("mousedown", function () {
    // fire
    if (gameStatus == "boss") {
      addGift(true);
    } else {
      addGift();
    }
  });

  restart();
  penguinCount = 0;

  canvas.addEventListener("mousedown", function (event) {
    var mouse = getMouseLocation(canvas, event);
    if (gameOver) {
      restart();
      firstTime = false;
    }
  });
  canvas.addEventListener("mousemove", function (event) {
    var mouse = getMouseLocation(canvas, event);
    updatePlayer(mouse);
  });
}

function restart() {
  gameOver = false;
  endTime = new Date().getTime() / 1000 + roundTime;

  // initialize player
  while (penguinCount <= initialPenguins) {
    replenish();
  }
  while (playerInfo.penguins.length > initialPenguins) {
    playerInfo.penguins.pop();
  }
  penguinCount = initialPenguins;
  gameStatus = "normal";
  giftsToDeliver = totalGifts;
  grinch = null;
  score = 0;
  items = [];
  interval = setInterval(function () {
    updateGame();
  }, 1000 / 30); //30 times per second
}

function getMouseLocation(canvas, event) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: Math.floor(event.clientX - rect.left),
    y: Math.floor(event.clientY - rect.top),
  };
}

// reposition santa and his penguins
function updatePlayer(location) {
  playerInfo.x = location.x;
  playerInfo.y = location.y;
  if (gameStatus == "normal" && playerInfo.y > canvasHeight * 0.75) {
    playerInfo.y = canvasHeight * 0.75;
  }
  for (var i = 0; i < playerInfo.penguins.length; i++) {
    playerInfo.penguins[i].x = location.x + penguinSize * (i + 1);
    playerInfo.penguins[i].y = playerInfo.y;
  }
}

function moveGifts() {
  for (var i = 0; i < gifts.length; i++) {
    gifts[i].y += gifts[i].vertical;
    gifts[i].x += gifts[i].horizontal;
    if (gifts[i].y > canvasHeight) {
      gifts.splice(i, 1);
      i--;
      score += 1;
    }
  }
}

function updateGame() {
  if (gameStatus == "normal") {
    document.getElementById("gameCanvas").style.background = "rgb(15,97,171)";
    if (frameCount % 6 == 0 && items.length < 10 && Math.random() < 0.3) {
      addRandomItem();
    }
    let giftAmount = Math.floor(
      Math.max(2, (20 - playerInfo.penguins.length) * 2)
    );
    if ((frameCount + 1) % giftAmount == 0) {
      //addGift();
    }
    if (
      frameCount % Math.round(55 / playerInfo.penguins.length) == 0 &&
      Math.random() < 0.3
    ) {
      addChimney();
    }
  } else {
    if (grinch == null) {
      sound.play();
      grinch = {
        x: canvas.width + 100,
        y: canvas.height * 0.5,
        radius: grinchSize / 2,
        life: 100,
        state: "init",
        frame: 0,
      };
    }
    if (
      (grinch.state == "throw" ||
        grinch.state == "mad" ||
        grinch.state == "normal") &&
      frameCount % 8 == 0
    ) {
      if (Math.floor(grinch.frame / 5) % 3 == 0) {
        grinch.state = "throw";
        addRandomItem(true);
      } else if (Math.floor(grinch.frame / 5) % 3 == 1) {
        grinch.state = "normal";
      } else {
        grinch.state = "mad";
        addRandomItem(true, true);
      }
      grinch.frame++;
    }
    if (grinch.x > canvasWidth * 0.85) {
      grinch.x -= grinchSpeed;
    } else {
      if (grinch.state == "init") {
        grinch.initializedAt = frameCount;
        grinch.state = "throw";
      }
      grinch.y += 5 * Math.cos((frameCount - grinch.initializedAt) / 30);
    }
    document.getElementById("gameCanvas").style.background = "rgb(135,97,131)";
  }
  moveGifts();
  // move items
  for (var i = 0; i < items.length; i++) {
    switch (items[i].type) {
      // moving at different speeds
      case "pizza":
        items[i].x -= droneSpeed;
        break;
      case "cloud":
        items[i].x -= cloudSpeed + penguinCount;
        break;
      case "drone":
        items[i].x -= droneSpeed + penguinCount;
        break;
      case "penguin":
        items[i].x -= penguinSpeed + penguinCount;
        break;
    }
    // remove when offscreen
    if (items[i].x < -100) {
      items.splice(i, 1);
      i--;
    }
  }
  for (var i = 0; i < chimneys.length; i++) {
    chimneys[i].x -= cloudSpeed + penguinCount;
    if (chimneys[i].x < -100) {
      chimneys.splice(i, 1);
      i--;
    }
  }

  // handle collisions
  for (var j = 0; j < playerInfo.penguins.length; j++) {
    if (playerInfo.penguins[j].visible == false) {
      continue; // skip collision with invisible penguin
    }
    for (var i = 0; i < items.length; i++) {
      if (collide(playerInfo.penguins[j], items[i])) {
        handleCollision(items[i], playerInfo.penguins[j]);

        items.splice(i, 1);
        i--;
      }
    }
    if (grinch != null && grinch.state != "init") {
      if (collide(grinch, playerInfo.penguins[j])) {
        playerInfo.penguins[j].visible = false;
        penguinCount--;
      }
    }
  }
  for (var j = 0; j < gifts.length; j++) {
    for (var i = 0; i < chimneys.length; i++) {
      if (collide(chimneys[i], gifts[j])) {
        gifts.splice(j, 1);
        giftsToDeliver--;
        j--;
        break;
      }
    }
  }

  if (grinch != null && grinch.state != "init") {
    for (var j = 0; j < gifts.length; j++) {
      if (collide(grinch, gifts[j])) {
        gifts.splice(j, 1);
        j--;
        grinch.life--;
      }
    }
  }

  // redrawing everything
  var context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);

  drawPlayer();
  if (grinch != null) {
    drawGrinch();
  }

  for (var i = 0; i < items.length; i++) {
    drawItem(items[i]);
  }
  for (var i = 0; i < chimneys.length; i++) {
    drawChimney(chimneys[i]);
  }

  for (var i = 0; i < gifts.length; i++) {
    drawGift(gifts[i]);
  }

  showScoreAndTime();

  if (giftsToDeliver <= 0) {
    gameStatus = "boss";
  }
  if (isGameOver()) {
    gameOver = true;
    showGameOver();
    clearInterval(interval);
  }

  frameCount++;
}

function addGift(shoot) {
  if (shoot) {
    gifts.push({
      x: playerInfo.x,
      y: playerInfo.y + santaSize / 2,
      radius: giftSize / 2,
      horizontal: 10,
      vertical: 0,
    });
  } else {
    gifts.push({
      x: playerInfo.x,
      y: playerInfo.y,
      radius: giftSize / 2,
      horizontal: 0,
      vertical: 5,
    });
  }
}

function addRandomItem(isPizza, isDrone) {
  var type = "penguin";
  var radius = penguinSize;
  if (Math.random() < 0.8) {
    type = "drone";
    radius = droneSize;
    if (Math.random() < 0.5) {
      type = "cloud";
      radius = cloudSize;
    }
  }
  if (isPizza) {
    radius = giftSize;
    type = "pizza";
    if (isDrone) {
      type = "drone";
    }
    items.push({
      type: type,
      x: grinch.x,
      y: grinch.y - grinchSize / 4,
      radius: radius / 2,
    });
  } else {
    items.push({
      type: type,
      x: canvas.width + 100,
      y: Math.random() * canvas.height * 0.7 + canvas.height * 0.1,
      radius: radius / 2,
    });
  }
}

function addChimney() {
  chimneys.push({
    x: canvas.width + 100,
    y: canvas.height * 0.92,
    radius: chimneySize / 2,
  });
}

// using pythagoras
function collide(A, B) {
  var dist = Math.sqrt((A.x - B.x) * (A.x - B.x) + (A.y - B.y) * (A.y - B.y));

  if (dist > A.radius + B.radius) {
    return false;
  }

  return true;
}

function handleCollision(item, penguin) {
  switch (item.type) {
    case "drone":
      penguin.visible = false;
      penguinCount--;
      break;
    case "cloud":
      penguin.visible = false;
      penguinCount--;
      break;
    case "penguin":
      replenish();
      break;
    case "pizza":
      penguin.visible = false;
      penguinCount--;
      break;
  }
}

function replenish() {
  var found = false;
  for (var i = 0; i < playerInfo.penguins.length; i++) {
    if (playerInfo.penguins[i].visible == false) {
      playerInfo.penguins[i].visible = true;
      found = true;
      break;
    }
  }
  if (!found) {
    playerInfo.penguins.push({
      radius: penguinSize / 2,
      visible: true,
    });
  }

  penguinCount++;
  updatePlayer(playerInfo);
}

function isGameOver() {
  if (penguinCount <= 0) {
    //} || endTime - new Date().getTime() / 1000 < 0) {
    return true;
  }
  if (grinch != null) {
    if (grinch.life <= 0) {
      return true;
    }
  }
  return false;
}

// assets
var santaImage = new Image();
santaImage.src =
  "https://cs.uef.fi/~radum/santa_and_his_penguins/images/santa.png";

var penguinImages = [];
for (var i = 0; i <= 3; i++) {
  penguinImages[i] = new Image();
  penguinImages[i].src =
    "https://cs.uef.fi/~radum/santa_and_his_penguins/images/penguin_" +
    i +
    ".png";
}

var droneImage = new Image();
droneImage.src =
  "https://cs.uef.fi/~radum/santa_and_his_penguins/images/drone.png";

var cloudImage = new Image();
cloudImage.src =
  "https://cs.uef.fi/~radum/santa_and_his_penguins/images/cloud.png";

var giftImage = new Image();
giftImage.src =
  "https://cs.uef.fi/~radum/santa_and_his_penguins/images/gift.png";

var pizzaImage = new Image();
pizzaImage.src =
  "https://cs.uef.fi/~radum/santa_and_his_penguins/images/pizza.png";

var machinegunImage = new Image();
machinegunImage.src =
  "https://cs.uef.fi/~radum/santa_and_his_penguins/images/machinegun.png";

var chimneyImage = new Image();
chimneyImage.src =
  "https://cs.uef.fi/~radum/santa_and_his_penguins/images/chimney.png";

var helpImage = new Image();
helpImage.src =
  "https://cs.uef.fi/~radum/santa_and_his_penguins/images/help.png";

var grinchImages = [];
for (var i = 0; i <= 7; i++) {
  grinchImages[i] = new Image();
  grinchImages[i].src =
    "https://cs.uef.fi/~radum/santa_and_his_penguins/images/throw_" +
    i +
    ".png";
}

grinchImages[8] = new Image();
grinchImages[8].src =
  "https://cs.uef.fi/~radum/santa_and_his_penguins/images/normal.png";
grinchImages[9] = new Image();
grinchImages[9].src =
  "https://cs.uef.fi/~radum/santa_and_his_penguins/images/surprised.png";
grinchImages[10] = new Image();
grinchImages[10].src =
  "https://cs.uef.fi/~radum/santa_and_his_penguins/images/mad.png";

// parameters
var penguinSize = 40;
var santaSize = 50;
var droneSize = 50;
var cloudSize = 80;
var grinchSize = 200;
var giftSize = 40;
var chimneySize = 80;

function drawPlayer() {
  var context = canvas.getContext("2d");
  context.beginPath();
  context.moveTo(playerInfo.x, playerInfo.y);
  for (var i = playerInfo.penguins.length - 1; i >= 0; i--) {
    if (playerInfo.penguins[i].visible == true) {
      // drawing line to first visible penguin
      context.lineTo(playerInfo.penguins[i].x, playerInfo.penguins[i].y);
      context.stroke();
      break;
    }
  }

  context.drawImage(
    santaImage,
    playerInfo.x - santaSize / 2,
    playerInfo.y - santaSize / 2,
    santaSize,
    santaSize
  );

  if (gameStatus == "boss") {
    context.drawImage(
      machinegunImage,
      playerInfo.x - santaSize / 2,
      playerInfo.y - (0 * santaSize) / 2,
      santaSize,
      santaSize
    );
  }

  for (let i = 0; i < playerInfo.penguins.length; i++) {
    if (playerInfo.penguins[i].visible == true) {
      context.drawImage(
        penguinImages[(Math.floor(frameCount / 3) + i) % 4],
        playerInfo.penguins[i].x - penguinSize / 2,
        playerInfo.penguins[i].y - penguinSize / 2,
        penguinSize,
        penguinSize
      );

      if (debug) {
        context.fillStyle = "rgba(0,255,0,0.5)";
        context.beginPath();
        context.arc(
          playerInfo.penguins[i].x,
          playerInfo.penguins[i].y,
          penguinSize / 2, // radius
          0,
          Math.PI * 2
        ); // full circle
        context.fill();
      }
    }
  }
}
function drawGrinch() {
  var context = canvas.getContext("2d");
  context.beginPath();

  if (grinch.state == "throw") {
    context.drawImage(
      grinchImages[frameCount % 8],
      grinch.x - grinchSize / 2,
      grinch.y - grinchSize / 2,
      grinchSize,
      grinchSize
    );
  } else if (grinch.state == "normal") {
    context.drawImage(
      grinchImages[9],
      grinch.x - grinchSize / 2,
      grinch.y - grinchSize / 2,
      grinchSize,
      grinchSize
    );
  } else if (grinch.state == "mad") {
    context.drawImage(
      grinchImages[10],
      grinch.x - grinchSize / 2,
      grinch.y - grinchSize / 2,
      grinchSize,
      grinchSize
    );
  } else {
    if (frameCount % 4 == 0 || frameCount % 4 == 1) {
      context.globalAlpha = 0.2;
    } else {
      context.globalAlpha = 0.6;
    }
    context.drawImage(
      grinchImages[8],
      grinch.x - grinchSize / 2,
      grinch.y - grinchSize / 2,
      grinchSize,
      grinchSize
    );
    context.globalAlpha = 1;
  }
  if (debug) {
    context.fillStyle = "rgba(0,255,0,0.5)";
    context.beginPath();
    context.arc(grinch.x, grinch.y, grinchSize / 2, 0, Math.PI * 2);
    context.fill();
  }
}

function drawItem(item) {
  var image;
  switch (item.type) {
    case "chimney":
      image = chimneyImage;
      break;
    case "pizza":
      image = pizzaImage;
      break;
    case "cloud":
      image = cloudImage;
      break;
    case "drone":
      image = droneImage;
      break;
    case "penguin":
      image = penguinImages[(Math.floor(frameCount / 3) + i) % 4];
      break;
  }
  context.drawImage(
    image,
    item.x - item.radius,
    item.y - item.radius,
    item.radius * 2,
    item.radius * 2
  );

  if (debug) {
    context.fillStyle = "rgba(0,255,0,0.5)";
    context.beginPath();
    context.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
    context.fill();
  }
}

function drawChimney(item) {
  context.drawImage(
    chimneyImage,
    item.x - chimneySize / 2,
    item.y - chimneySize / 2,
    chimneySize,
    chimneySize
  );

  if (debug) {
    context.fillStyle = "rgba(0,255,0,0.5)";
    context.beginPath();
    context.arc(item.x, item.y, chimneySize / 2, 0, Math.PI * 2);
    context.fill();
  }
}

function drawGift(item) {
  var image = giftImage;

  context.drawImage(
    image,
    item.x - item.radius / 2,
    item.y - item.radius / 2,
    item.radius,
    item.radius
  );
  // maybe try fixing this?
  if (debug) {
    context.fillStyle = "rgba(0,255,0,0.5)";
    context.beginPath();
    context.arc(item.x, item.y, item.radius / 2, 0, Math.PI * 2);
    context.fill();
  }
}

function showGameOver() {
  var context = canvas.getContext("2d");
  context.fillStyle = "white";
  context.beginPath();
  context.font = "60px Courier New";
  context.textAlign = "center";
  context.textBaseline = "middle";
  if (firstTime) {
    context.fillStyle = "rgba(0,0,0,0.4)";
    context.beginPath();
    context.fillRect(0, 0, canvasWidth, canvasHeight);
    context.fill();
    context.fillStyle = "white";
    context.fillText("CLICK TO BEGIN", canvas.width / 2, canvas.height * 0.3);
    context.drawImage(helpImage, 100 * 3, 64 * 3, 100 * 3, 64 * 3);
  } else {
    if (grinch == null || grinch.life > 0) {
      context.fillText("GAME OVER", canvas.width / 2, canvas.height * 0.4);
    } else {
      context.fillText("YOU WIN!", canvas.width / 2, canvas.height * 0.4);
    }
    context.font = "30px Courier New";
    context.fillText(
      "(click to restart)",
      canvas.width / 2,
      canvas.height * 0.5
    );
  }
}

function showScoreAndTime() {
  var context = canvas.getContext("2d");
  context.fillStyle = "white";
  context.beginPath();
  context.font = "20px Courier New";
  if (grinch == null) {
    context.textAlign = "left";
    context.textBaseline = "top";
    context.fillText("Remaining gifts: " + giftsToDeliver, 10, 10);
  } else {
    context.textAlign = "right";
    context.textBaseline = "top";
    context.fillStyle = "rgb(0,255,0)";
    context.fillText("Grinch life: " + grinch.life, canvas.width - 10, 10);
  }
}

setTimeout(function () {
  main();
}, 100);
