import Phaser from "phaser";
import Player from "./player";
import Timer from './timer';
import Animations from "./anims";

const gameRatio = { width: 9 * 32, height: 15 * 32 };

const config = {
  type: Phaser.AUTO,
  // pixelArt: true,
  scale: {
    parent: "get-away",
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
      // debug: true,
      gravity: { y: 0 }
    }
  }
};

const game = new Phaser.Game(config);

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

  this.load.image("marks", 'assets/marks.png');
  this.load.image("house", 'assets/house.png');
  this.load.image("directions", 'assets/directions.png')
  this.load.image("floor_base", 'assets/floor_base.png');
  this.load.image("trees_front", 'assets/trees_front.png');
  this.load.image("trees_back", 'assets/trees_back.png');
  this.load.image("alert", "assets/strong_exclamation.png");
  this.load.image("forest_floor", "assets/forest_floor.png");
  this.load.tilemapTiledJSON("map", "assets/forest1.json");
  this.load.atlas("sprite", "assets/sprite-0.png", "assets/sprite-0.json");
  this.load.atlas("overlays", "assets/overlays.png", "assets/overlays.json");
  this.load.atlas("effects", "assets/effects.png", "assets/effects.json");
}

function create() {
  const animations = new Animations(this.scene.scene.anims);
  this.alert;
  const map = this.make.tilemap({ key: "map" });
  this.physics.world.setBounds(map.x, map.y, map.widthInPixels, map.heightInPixels, true, true, true, true);
  const spawnPoint = map.findObject("spawn", obj => obj.name === "spawn_point");
  const escapeTrigger = map.findObject("escape", obj => obj.name === "escape");

  const marks = map.addTilesetImage("marks", "marks");
  const floor_base = map.addTilesetImage("floor_base", "floor_base");

  const baseLayer = map.createStaticLayer("base", floor_base, 0, 0);
  baseLayer.setCollisionByProperty({ collides: true });
  const trapsLayer = map.createStaticLayer("traps", marks, 0, 0);
  trapsLayer.setCollision(4);
  const filteredTiles = trapsLayer.filterTiles(filterByTrap);
  filteredTiles.forEach((tile) => createshine(tile, this));

  function filterByTrap(tile) { return tile.properties.collides; }
  function createshine(tile, scene) {
    let shine = scene.add.sprite(tile.getCenterX(), tile.getCenterY(), "effects", "shine.0").setScale(0.3).setDepth(100);
    shine.anims.play("shine", true);
    // game.debug.renderSpriteBounds(shine);
  }

  this.add.image(0, 0, "forest_floor").setOrigin(0, 0);
  this.add.image(0, 0, "trees_back").setOrigin(0, 0);

  this.add.image(0, 0, "trees_front").setOrigin(0, 0).setDepth(5);
  this.player = new Player(this, spawnPoint.x, spawnPoint.y);
  this.physics.add.collider(this.player.aura, baseLayer);
  this.physics.add.overlap(this.player.aura, trapsLayer);

  trapsLayer.setTileIndexCallback([4], triggerTrap, this);

  const frontScenery = this.physics.add.staticGroup();
  frontScenery.create(28, 910, "house")


  this.physics.add.collider(this.player.aura, frontScenery);
  const camera = this.cameras.main;
  camera.zoom = 2;
  camera.startFollow(this.player.aura);
  camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  camera.fadeEffect.start(false, 400, 0, 0, 0);
  this.playTime = new Timer({ scene: this, time: this.time, input: this.input, callback: (time) => fadeSceneRestart(this.player, time, this.scene) });
  const debugGraphics = this.add.graphics().setAlpha(0.75);

  // map.renderDebug(debugGraphics, {
  //   tileColor: null,
  //   collidingTileColor: new Phaser.Display.Color(243, 134, 48, 128), 
  //   faceColor: new Phaser.Display.Color(40, 39, 37, 255) 
  // });

  const directions = this.add.image(camera.midPoint.x + 30, camera.midPoint.y - 70, "directions");
  directions.scrollFactor = 0;
  directions.setScale(0.3).setDepth(1000);
  this.input.disable(this.player.aura.scene);
  this.input.keyboard.on('keydown-SPACE', () => { directions.destroy(); this.input.enable(this.player.aura.scene); });

}

function fadeSceneRestart(player, time, scene) {
  if (scene.systems.input.enabled) {
    scene.systems.input.disable(player.aura.scene);
    scene.systems.cameras.main.fadeEffect.start(true, 400, 0, 0, 0);
    const sceneRestartTimer = time.delayedCall(1 * 1000, () => { scene.restart(); }, [scene], this)
  }
}

function triggerTrap(sprite, tile) {
  const centerSprite = sprite.body.center;
  const triggerX = (centerSprite.x > tile.getCenterX() && Math.abs(centerSprite.x - tile.getCenterX()) < tile.width / 3) || (centerSprite.x < tile.getCenterX() && Math.abs(tile.getCenterX() - centerSprite.x) < tile.width / 3);
  const triggerY = (centerSprite.y > tile.getCenterY() && Math.abs(centerSprite.y - tile.getCenterY()) < tile.height / 3) || (centerSprite.y < tile.getCenterY() && Math.abs(tile.getCenterY() - centerSprite.y) < tile.height / 3);
  
  if (triggerX && triggerY) {
    if (this.alert) {
      this.alert.destroy();
      this.alert = undefined;
    }
    this.player.trapped = true;
    fadeSceneRestart(this.player, this.time, this.scene);
  } else if (!this.alert && sprite.body.touching !== sprite.body.wasTouching) {
    this.alert = this.add.image(this.player.aura.body.center.x, this.player.aura.body.center.y - 30, "alert");
    this.alert.name = 'exclamation mark';
    this.alert.setScale(0.3).setDepth(2000);
    if (!this.tweens.isTweening(this.alert)) {
      this.tweens.add({
        targets: this.alert,
        props: {y: {value: this.alert.y - 20, duration: 300, ease: 'Elastic.easeOut'}}
      })
    } 
    const hideAlert = this.time.delayedCall(350, () => { if (this.alert) { this.alert.destroy(); this.alert = undefined; } }, [], this);
  }
  this.lastTouching = sprite.body.touching.none;
  return true;
};

function update(time, delta) {
  this.player.update();
  this.playTime.update();
  if (this.alert && !this.tweens.isTweening(this.alert)) {
    this.alert.setPosition(this.player.aura.body.center.x, this.player.aura.body.center.y - 30);
  }
  this.player.aura.body.embedded ? this.player.auda.body.touching.none = false: null;
  if (this.player.aura.body.touching.none && !this.player.aura.body.wasTouching.none) {
    console.log('fart');
  }
  // console.log(this.player.aura.body.touching, this.player.aura.body.embedded);
  // console.log(this.theyrFuckingOverlapping);
}