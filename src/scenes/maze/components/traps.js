import Phaser from "phaser";
import { depth } from './../mazeVariables'
import Pathfinder from './pathfinder';

export default class Traps {
  constructor({ parent, map, player, callback }) {
    this.parent = parent;
    this.player = player;
    this.fadeSceneRestart = callback;
    this.alert;
    this.pathFinder = new Pathfinder({ parent: parent, map: map, }); //use to keep regenerating paths;
    this.pathFinder.testPath();

    const trapsLayer = map.createStaticLayer("traps", marks, 0, 0);
    const marks = map.addTilesetImage("marks", "marks");
    trapsLayer.setCollision(1);

    const filteredTiles = trapsLayer.filterTiles((tile) => tile.properties.id === 1);
    filteredTiles.forEach((tile) => {
      this.createshine(tile, this.parent);
      const tileObject = this.parent.add.rectangle(tile.getCenterX(), tile.getCenterY(), tile.width, tile.height);
      this.parent.physics.world.enable(tileObject, 0);
      this.parent.physics.add.overlap(this.player.aura, tileObject, this.triggerTrap, null, this);
    });

  }

  createshine(tile, scene, ) {
    let shine = scene.add.sprite(tile.getCenterX(), tile.getCenterY(), "effects", "shine.0").setScale(0.3).setDepth(depth.shine);
    let shineHitbox = scene.add.rect
    shine.anims.play("shine", true);
    scene.physics.world.enable(shine, 0);
  }
  triggerTrap(sprite, tile) {
    const centerSprite = sprite.body.center;
    const triggerX = (centerSprite.x > tile.body.center.x && Math.abs(centerSprite.x - tile.body.center.x) < tile.width / 3) || (centerSprite.x < tile.body.center.x && Math.abs(tile.body.center.x - centerSprite.x) < tile.width / 3);
    const triggerY = (centerSprite.y > tile.body.center.y && Math.abs(centerSprite.y - tile.body.center.y) < tile.height / 3) || (centerSprite.y < tile.body.center.y && Math.abs(tile.body.center.y - centerSprite.y) < tile.height / 3);

    if (triggerX && triggerY) {
      if (this.alert) {
        this.alert.destroy();
        this.alert = undefined;
      }
      this.player.trapped = true;
      this.parent.time.delayedCall(350, () => this.fadeSceneRestart(this.player, this.parent.time, this.parent.scene), [], this);
    } else if (!this.alert && !this.player.aura.body.touching.none && this.player.aura.body.wasTouching.none) {
      this.alert = this.parent.add.image(this.player.aura.body.center.x, this.player.aura.body.center.y - 30, "alert");
      this.alert.name = 'exclamation mark';
      this.alert.setScale(0.3).setDepth(depth.alert);
      if (!this.parent.tweens.isTweening(this.alert)) {
        this.parent.tweens.add({
          targets: this.alert,
          props: { y: { value: this.alert.y - 20, duration: 300, ease: 'Elastic.easeOut' } }
        })
      }
      const hideAlert = this.parent.time.delayedCall(350, () => { if (this.alert) { this.alert.destroy(); this.alert = undefined; } }, [], this);
    }
    this.lastTouching = sprite.body.touching.none;
    return true;
  };

  update() {
    if (this.alert && !this.parent.tweens.isTweening(this.alert)) {
      this.alert.setPosition(this.player.aura.body.center.x, this.player.aura.body.center.y - 30);
    }
    this.pathFinder.update();
  }
}