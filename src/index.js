import Phaser from "phaser";
import Player from "./player";
import Timer from './timer';
import Animations from "./anims";
import Traps from "./traps";
import depth from "./depth";

const gameRatio = {width: 9 * 32, height: 15 * 32};

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
      gravity: {y: 0}
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
  //draw map
  const map = this.make.tilemap({ key: "map" });
  this.physics.world.setBounds(map.x, map.y, map.widthInPixels, map.heightInPixels, true, true, true, true);
  const spawnPoint = map.findObject("spawn", obj => obj.name === "spawn_point");

  const floor_base = map.addTilesetImage("floor_base", "floor_base");
  const baseLayer = map.createStaticLayer("base", floor_base, 0, 0);
  baseLayer.setCollisionByProperty({collides: true});

  this.add.image(0, 0, "forest_floor").setOrigin(0, 0);
  this.add.image(0, 0, "trees_back").setOrigin(0, 0);
  this.add.image(0, 0, "trees_front").setOrigin(0, 0).setDepth(depth.trees);

  const frontScenery = this.physics.add.staticGroup();
  frontScenery.create(28, 910, "house").setDepth(depth.house);

  //create classes

  this.player = new Player({parent: this, x: spawnPoint.x, y: spawnPoint.y});
  this.physics.add.collider(this.player.aura, baseLayer, null, null, this);
  this.physics.add.collider(this.player.aura, frontScenery, null, null, this);


  const escapeObject = map.findObject("escape", obj => obj.name === "escape");
  const escapeZone = new Phaser.Geom.Polygon(escapeObject.polygon);
  this.physics.world.enable(escapeZone, 0);  
  escapeZone.body.setAllowGravity(false);
  escapeZone.body.moves = false;
  this.physics.add.overlap(this.player.aura.body, escapeZone, escape, null, this);


  // this.traps = new Traps({parent: this, map: map, player: this.player, callback: fadeSceneRestart})
  // this.playTime = new Timer({ parent: this, time: this.time, input: this.input, callback: (time) => fadeSceneRestart(this.player, time, this.scene) });

  //add physics

  //create camera
  this.camera = this.cameras.main;
  this.camera.zoom = 2;
  this.camera.startFollow(this.player.aura);
  this.camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  this.camera.fadeEffect.start(false, 400, 0, 0, 0);

  //create startup
  const directions = this.add.image(this.camera.midPoint.x + 30, this.camera.midPoint.y - 70, "directions");
  directions.scrollFactor = 0;
  directions.setScale(0.3).setDepth(depth.directions);
  this.input.disable(this.player.aura.scene);
  this.input.keyboard.on('keydown-SPACE', () => {directions.destroy(); this.input.enable(this.player.aura.scene);});
}
function escape(){
  console.log('farty');
  return true;
}
function fadeSceneRestart(player, time, scene) {
  if (scene.systems.input.enabled) {
    scene.systems.input.disable(player.aura.scene);
    scene.systems.cameras.main.fadeEffect.start(true, 400, 0, 0, 0);
    const sceneRestartTimer = time.delayedCall(1 * 1000, () => {scene.restart();}, [scene], this)
  }
}

function update(time, delta) {
  this.player.update();
  this.traps &&  this.traps.update();
  this.playTime && this.playTime.update();
}