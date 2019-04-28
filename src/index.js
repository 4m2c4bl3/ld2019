import Phaser from "phaser";
import Player from "./player";

const gameRatio = { width: 9 * 32, height: 15 * 32 };

const config = {
  type: Phaser.AUTO,
  pixelArt: true,
  scale: {
    parent: "run-for-it",
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: gameRatio.width,
    height: gameRatio.height,
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
      gravity: { y: 0 }
    }
  }
};

const game = new Phaser.Game(config);
let player;

function preload() {
  const progressBox = this.add.graphics();
  const progressBar = this.add.graphics();
  progressBox.fillStyle(0x072f37, 1);
  progressBox.fillRect(((gameRatio.width - 40) / 2) / 2, gameRatio.height / 3, (gameRatio.width + 40) / 2, 50);

  var percentText = this.make.text({
    x: gameRatio.width / 2,
    y: gameRatio.width / 2 - 5,
    text: '0%',
    style: {
      font: '18px monospace',
      fill: '#0f4737'
    }
  });
  percentText.setOrigin(0.5, 0.5);

  this.load.on('progress', function (value) {
    progressBar.clear();
    progressBar.fillStyle(0x0f4737, 1);
    progressBar.fillRect(((gameRatio.width) / 2) / 2, (gameRatio.height + 25) / 3, gameRatio.width / 2 * value, 35);
    percentText.setText(parseInt(value * 100) + '%');

  });

  this.load.on('complete', function () {
    progressBar.destroy();
    progressBox.destroy();
    percentText.destroy();
  });

  this.load.image("marks", './assets/marks.png');
  this.load.image("house", './assets/house.png');
  this.load.image("floor_base", './assets/floor_base.png');
  this.load.image("trees_front", './assets/trees_front.png');
  this.load.image("trees_back", './assets/trees_back.png');
  this.load.tilemapTiledJSON("map", "./assets/forest1.json");
  this.load.atlas("sprite", "./assets/sprite-0.png", "./assets/sprite-0.json");
}

function create() {
  const map = this.make.tilemap({ key: "map" });
  this.physics.world.setBounds(map.x,map.y, map.widthInPixels, map.heightInPixels , true, true, true, true);
  const spawnPoint = map.findObject("spawn", obj => obj.name === "spawn_point");

  const marks = map.addTilesetImage("marks", "marks");
  const floor_base = map.addTilesetImage("floor_base", "floor_base");

  const baseLayer = map.createStaticLayer("base", floor_base, 0, 0);
  baseLayer.setCollisionByProperty({ collides: true });
  const trapsLayer = map.createStaticLayer("traps", marks, 0, 0);
  trapsLayer.setCollisionByProperty({ collides: true });

  this.add.image(0, 0, "trees_back").setOrigin(0, 0);

  player = new Player(this, spawnPoint.x, spawnPoint.y);
  this.physics.add.collider(player.sprite, baseLayer);
  this.physics.add.overlap(player.sprite, trapsLayer);

  trapsLayer.setTileIndexCallback([4], triggerTrap, this);

  this.add.image(0, 0, "trees_front").setOrigin(0, 0);
  const frontScenery = this.physics.add.staticGroup();
  frontScenery.create(28, 910, "house")

  this.physics.add.collider(player.sprite, frontScenery);
  const camera = this.cameras.main;
  camera.startFollow(player.sprite);
  camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

  this.playTime = this.time.addEvent({ delay: 15 * 1000, callback: fadeSceneRestart, args: [this.input, player, this.time, this.scene], callbackScope: this, });
  this.playTime.pause = true;
  this.input.keyboard.on('keydown', () => this.playTime.pause = false); 
  const debugGraphics = this.add.graphics().setAlpha(0.75);

  map.renderDebug(debugGraphics, {
    tileColor: null,
    collidingTileColor: new Phaser.Display.Color(243, 134, 48, 128), 
    faceColor: new Phaser.Display.Color(40, 39, 37, 255) 
  });
}

function fadeSceneRestart(input, player, time, scene) {
  input.disable(player.sprite.scene);
  const sceneRestartTimer = time.delayedCall(1 * 1000, () =>  {scene.restart(); input.enable(player.sprite.scene);}, [scene], this)
}

function triggerTrap(sprite, tile) {
  const triggerX = Math.abs(sprite.x - tile.getCenterX()) < tile.width / 2;
  const triggerY = Math.abs(sprite.y - tile.getCenterY()) < tile.height / 2;
  //console.log(Math.abs(sprite.x - tile.getCenterX()), Math.abs(sprite.y - tile.getCenterY()), triggerX, triggerY, tile.height / 2);
  if (triggerX && triggerY) {
    fadeSceneRestart(this.input, player, this.time, this.scene);
  } else {
    //play trap hint animation
  }
  return false;
};

function update(time, delta) {
  player.update();
  // console.log(Math.ceil(this.playTime.elapsed / 1000));
}