let {
  test,
  Sound,
  loop,
  drawObject,
  Controller,
  GameObject,
  backInside,
  canvas,
} = Game("canvas");
let gameOver = false;
let gameoverElement = document.getElementById("gameOver");
let scoreElement = document.getElementById("score");
let restartGameElement = document.getElementById("restartGame");
let scale = {
  player: {
    width: 30,
    height: 32,
  },
  enemy: {
    width: 20,
    height: 22,
  },
  shuts: {
    width: 8,
    height: 8,
  },
};
let player = new GameObject({
  position: {
    x: canvas.width / 2 - scale.player.width,
    y: canvas.height - scale.player.height,
  },
  dir: { x: 0, y: 0 },
  width: scale.player.width,
  height: scale.player.height,
  speed: 1,
  src: "./assets/player.png",
  score: 0,
});
let shuts = [];
let enemies = [];
let bg = new GameObject({
  width: canvas.width,
  height: canvas.height,
  position: { x: 0, y: 0 },
  src: "./assets/bg.jpeg",
});
let game = () => {
  scoreElement.innerHTML = player.score;
  backInside(player);
  drawObject(bg);
  drawObject(player);
  if (enemies.length < 3) {
    createEnemy();
  }
  shuts.map((shut, i) => {
    shut.position.y -= 2;
    let explodedEnemyIndex = enemies.findIndex(
      (enemy) => enemy.isTouch(shut) && !enemy.isExplode
    );
    if (explodedEnemyIndex > -1) {
      player.score++;
      shuts.splice(i, 1);
      enemies[explodedEnemyIndex].isExplode = true;
      enemies[explodedEnemyIndex].src = "./assets/blast.png";
      let deleteFrame = 0;
      function deleteEnemy() {
        deleteFrame++;
        if (deleteFrame > 25) {
          enemies.splice(explodedEnemyIndex, 1);
        } else {
          requestAnimationFrame(deleteEnemy);
        }
      }
      deleteEnemy();
    }
    if (shut.position.y < -shut.height) {
      shuts.splice(i, 1);
    }
    drawObject(shut);
  });
  enemies.map((enemy) => {
    enemy.coliders.map((colider) => {
      colider.position.y = enemy.position.y;
    });
    if (!enemy.isExplode) {
      enemy.speed += 0.0005;
      enemy.position.y += enemy.speed;
    }
    drawObject(enemy);
    if (
      (player.isTouch(enemy) && !enemy.isExplode) ||
      enemy.position.y > canvas.height
    ) {
      GameOver();
    }
  });
  player.position.x += player.dir.x;
  player.position.y += player.dir.y;
  if (!gameOver) {
    requestAnimationFrame(game);
  }
};
restartGameElement.addEventListener("click", () => {
  player.position = {
    x: canvas.width / 2 - scale.player.width,
    y: canvas.height - scale.player.height,
  };
  player.dir = { x: 0, y: 0 };
  player.score = 0;
  enemies = [];
  shuts = [];
  gameoverElement.style.display = "none";
  gameOver = false;
  game();
});
loop(game, true);
function GameOver() {
  gameOver = true;
  gameoverElement.style.display = "flex";
}
function createEnemy() {
  let randomPosition = () => {
    return Math.floor(Math.random() * (canvas.width - scale.enemy.width));
  };
  let enemyPosition = randomPosition();
  let newEnemy = new GameObject({
    position: {
      x: randomPosition(),
      y: -scale.enemy.height,
    },
    sposition: { sx: 100, sy: 20 },
    swidth: 600,
    sheight: 800,
    isExplode: false,
    width: scale.enemy.width,
    height: scale.enemy.height,
    speed: 0.05,
    src: "./assets/enemy.png",
  });
  enemies.map((enemy) => {
    if (enemy.isTouch(newEnemy)) {
      newEnemy.position.x = randomPosition();
    }
  });
  newEnemy.coliders = [
    {
      position: { x: newEnemy.position.x, y: 0 },
      width: newEnemy.width,
      height: 10,
    },
    {
      position: { x: newEnemy.position.x + newEnemy.width / 2 - 5, y: 0 },
      width: 10,
      height: newEnemy.height,
    },
  ];

  enemies.push(newEnemy);
}
function Shoot() {
  shuts.push(
    new GameObject({
      src: "./assets/shut.png",
      width: scale.shuts.width,
      height: scale.shuts.height,
      position: {
        x: player.position.x + scale.player.width / 2 - scale.shuts.width / 2,
        y: player.position.y - scale.shuts.height / 2,
      },
    })
  );
}
let controller = new Controller(
  {
    keydown: (e) => {
      player.dir.x =
        e.code == "KeyA" || e.code == "ArrowLeft"
          ? -player.speed
          : e.code == "KeyD" || e.code == "ArrowRight"
          ? player.speed
          : player.dir.x;
      player.dir.y =
        e.code == "KeyW" || e.code == "ArrowUp"
          ? -player.speed
          : e.code == "KeyS" || e.code == "ArrowDown"
          ? player.speed
          : player.dir.y;
    },
    keyup: (e) => {
      if (
        e.code == "KeyA" ||
        e.code == "ArrowLeft" ||
        e.code == "KeyD" ||
        e.code == "ArrowRight"
      ) {
        player.dir.x = 0;
      }

      if (
        e.code == "KeyW" ||
        e.code == "ArrowUp" ||
        e.code == "KeyS" ||
        e.code == "ArrowDown"
      ) {
        player.dir.y = 0;
      }
    },
    click: (e) => {
      Shoot();
    },
  },
  true
);
