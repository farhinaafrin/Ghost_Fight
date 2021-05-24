const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = 900;
canvas.height = 600;
let gameFrame = 0;
let score = 0;

let gameOver = false;

//Global Veriables
const shootingRight = [];
const shootingLeft = [];
const enemy1 = [];
const enemy2 = [];

// mouse_position Adjustment
let canvasPosition = canvas.getBoundingClientRect();
const mouse = {
  x: canvas.width / 2,
  y: canvas.height / 2,
};

canvas.addEventListener("mousemove", function (event) {
  mouse.x = event.x - canvasPosition.left;
  mouse.y = event.y - canvasPosition.top;
});

function handleGameStatus() {
  ctx.fillStyle = "rgb(237, 142, 47)";
  ctx.font = "30px Arial";
  ctx.fillText("Score:" + score, 50, 40);
  if (gameOver) {
    ctx.fillStyle = "rgb(237, 142, 47)";
    ctx.font = "70px Arial";
    ctx.fillText("GAME OVER", 230, 300);
  } else if (score == 10) {
    ctx.fillStyle = "rgb(237, 142, 47)";
    ctx.font = "70px Arial";
    ctx.fillText("YOU WIN", 280, 300);
    gameOver = true;
  }
}

const fireballLeft = new Image();
fireballLeft.src = "images/fireballLeft.png";
const fireballRight = new Image();
fireballRight.src = "images/fireballRight.png";
//shooting
class Shooting {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 30;
    this.minFrame = 0;
    this.maxFrame = 5;
    this.frameX = 0;
    this.frameY = 0;
    this.spriteWidth = 512;
    this.spriteHeight = 197;
  }
  draw() {
    //ctx.fillStyle = "blue";

    //ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.drawImage(
      fireballRight,
      this.frameX * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
  draw1() {
    //ctx.fillStyle = "blue";

    //ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.drawImage(
      fireballLeft,
      this.frameX * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
  update() {
    this.x += 12;
  }
  updateLeft() {
    this.x -= 12;
  }
}
function handleShooting() {
  for (let i = 0; i < shootingRight.length; i++) {
    shootingRight[i].draw();
    shootingRight[i].update();
    if (shootingRight[i] && shootingRight[i].x > canvas.width) {
      shootingRight.splice(i, 1);
      i--;
    }
    for (let j = 0; j < enemy1.length; j++) {
      if (
        shootingRight[i] &&
        enemy1[j] &&
        collision(shootingRight[i], enemy1[j])
      ) {
        enemy1.splice(j, 1);
        shootingRight.splice(i, 1);
        i--;
        score++;
      }
    }
    for (let k = 0; k < enemy2.length; k++) {
      if (
        shootingRight[i] &&
        enemy2[k] &&
        collision(shootingRight[i], enemy2[k])
      ) {
        enemy2.splice(k, 1);
        shootingRight.splice(i, 1);
        i--;
        score++;
      }
    }
  }

  for (let i = 0; i < shootingLeft.length; i++) {
    shootingLeft[i].draw1();
    shootingLeft[i].updateLeft();
    if (shootingLeft[i] && shootingLeft[i].x > canvas.width - 100) {
      shootingLeft.splice(i, 1);
      i--;
    }
    for (let j = 0; j < enemy2.length; j++) {
      if (
        shootingLeft[i] &&
        enemy2[j] &&
        collision(shootingLeft[i], enemy2[j])
      ) {
        enemy2.splice(j, 1);
        shootingRight.splice(i, 1);
        i--;
        score++;
      }
    }
    for (let k = 0; k < enemy1.length; k++) {
      if (
        shootingLeft[i] &&
        enemy1[k] &&
        collision(shootingLeft[i], enemy1[k])
      ) {
        enemy1.splice(k, 1);
        shootingLeft.splice(i, 1);
        i--;
        score++;
      }
    }
  }
}

const playerLeft = new Image();
playerLeft.src = "images/playerLeft.png";
const playerRight = new Image();
playerRight.src = "images/playerRight.png";
//player
class Player {
  constructor() {
    this.x = canvas.width / 2 - 50;
    this.y = canvas.height - 100;
    this.width = 50;
    this.height = 70;
    this.frameX = 0;
    this.frameY = 0;
    this.minFrame = 0;
    this.maxFrame = 9;
    this.spriteWidth = 356;
    this.spriteHeight = 592;
  }
  draw() {
    //ctx.fillStyle = "black";
    //ctx.fillRect(this.x, this.y, this.width, this.height);

    if (this.x >= mouse.x) {
      ctx.drawImage(
        playerLeft,
        this.frameX * this.spriteWidth,
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      );
    } else {
      ctx.drawImage(
        playerRight,
        this.frameX * this.spriteWidth,
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
  }
  update() {
    const dx = this.x + 50 - mouse.x;
    const dy = this.y + 50 - mouse.y;
    if (mouse.x != this.x) {
      this.x -= dx / 15;
    }
    if (mouse.y != this.y) {
      this.y -= dy / 15;
    }
  }
  just() {
    canvas.addEventListener("click", () => {
      shootingRight.push(new Shooting(this.x + 70, this.y + 50));
      shootingLeft.push(new Shooting(this.x + 30, this.y + 50));
    });
  }
}
const player = new Player();

function handlePlayer() {
  player.draw();
  player.update();
  player.just();
  for (let i = 0; i < enemy1.length; i++) {
    if (player && enemy1[i] && collision(player, enemy1[i])) {
      gameOver = true;
    }
  }
  for (let i = 0; i < enemy1.length; i++) {
    if (enemy2[i] && collision(player, enemy2[i])) {
      gameOver = true;
    }
  }
}

//enemy

const leftEnemy = new Image();
leftEnemy.src = "images/enemy1.png";

class Enemy1 {
  constructor() {
    this.x = canvas.width + 10;
    this.y = Math.random() * (canvas.height - 150) + 90;
    this.speed = 5;
    this.movement = this.speed;
    this.width = 70;
    this.height = 70;
    this.frameX = 0;
    this.frameY = 0;
    this.minFrame = 0;
    this.maxFrame = 10;
    this.spriteWidth = 530;
    this.spriteHeight = 420;
  }
  draw() {
    //ctx.fillStyle = "red";
    // ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.drawImage(
      leftEnemy,
      this.frameX * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width + 20,
      this.height + 10
    );
  }
  update() {
    this.x -= this.movement;
    if (gameFrame % 10 === 0) {
      if (this.frameX < this.maxFrame) this.frameX++;
      else this.frameX = this.minFrame;
    }
  }
}
const RightEnemy = new Image();
RightEnemy.src = "images/enemy2.png";
class Enemy2 {
  constructor() {
    this.x = -10;
    this.y = Math.random() * (canvas.height - 150) + 90;
    this.width = 60;
    this.height = 60;
    this.speed = 5;
    this.frameX = 0;
    this.frameY = 0;
    this.minFrame = 0;
    this.maxFrame = 10;
    this.spriteWidth = 520;
    this.spriteHeight = 420;
    this.movement = this.speed;
  }
  draw() {
    //ctx.fillStyle = "gold";
    //ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.drawImage(
      RightEnemy,
      this.frameX * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width + 30,
      this.height + 20
    );
  }
  update() {
    this.x += this.movement;
    if (gameFrame % 10 === 0) {
      if (this.frameX < this.maxFrame) this.frameX++;
      else this.frameX = this.minFrame;
    }
  }
}

function handleEnemy() {
  if (gameFrame % 100 == 0) {
    enemy1.push(new Enemy1());
  }
  if (gameFrame % 100 == 0) {
    enemy2.push(new Enemy2());
  }
  for (let i = 0; i < enemy1.length; i++) {
    enemy1[i].draw();
    enemy1[i].update();

    if (enemy1[i].x < 0) {
      enemy1.splice(i, 1);
      i--;
    }
  }
  for (let i = 0; i < enemy2.length; i++) {
    enemy2[i].draw();
    enemy2[i].update();

    if (enemy2[i].x > canvas.width) {
      enemy2.splice(i, 1);
      i--;
    }
  }
}
///background
const background = new Image();
background.src = "images/BG.png";
function backgroundhandle() {
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
}
//others
//animation_or_main

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  backgroundhandle();
  handleShooting();
  handlePlayer();
  handleEnemy();
  handleGameStatus();
  gameFrame++;
  if (!gameOver) requestAnimationFrame(animate);
}
animate();

function collision(first, second) {
  if (
    !(
      first.x > second.x + second.width ||
      first.x + first.width < second.x ||
      first.y > second.y + second.height ||
      first.y + first.height < second.y
    )
  ) {
    return true;
  }
}
///Resizing window
window.addEventListener("resize", function () {
  canvasPosition = canvas.getBoundingClientRect();
});
