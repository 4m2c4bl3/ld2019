import Phaser from "phaser";
import depth from "./depth";

export default class Traps {
  constructor({parent, map, player, callback}) {
    this.parent = parent;
    this.player = player;
    this.fadeSceneRestart = callback;
    this.alert;
    const trapsLayer = map.createStaticLayer("traps", marks, 0, 0);
    const marks = map.addTilesetImage("marks", "marks");
    trapsLayer.setCollision(4);
    const filteredTiles = trapsLayer.filterTiles(filterByTrap);
    filteredTiles.forEach((tile) => createshine(tile, this.parent));

    function filterByTrap(tile) {return tile.properties.collides;}
    function createshine(tile, scene) {
      let shine = scene.add.sprite(tile.getCenterX(), tile.getCenterY(), "effects", "shine.0").setScale(0.3).setDepth(depth.shine);
      shine.anims.play("shine", true);
      this.parent.physics.world.enable(shine, 0);
      // game.debug.renderSpriteBounds(shine);
    }

    this.parent.physics.add.overlap(this.player.aura, trapsLayer);
    trapsLayer.setTileIndexCallback([4], this.triggerTrap, this);
  }

  triggerTrap(sprite, tile) {
    const centerSprite = sprite.body.center;
    const triggerX = (centerSprite.x > tile.getCenterX() && Math.abs(centerSprite.x - tile.getCenterX()) < tile.width / 3) || (centerSprite.x < tile.getCenterX() && Math.abs(tile.getCenterX() - centerSprite.x) < tile.width / 3);
    const triggerY = (centerSprite.y > tile.getCenterY() && Math.abs(centerSprite.y - tile.getCenterY()) < tile.height / 3) || (centerSprite.y < tile.getCenterY() && Math.abs(tile.getCenterY() - centerSprite.y) < tile.height / 3);

    if (triggerX && triggerY) {
      if (this.alert) {
        this.alert.destroy();
        this.alert = undefined;
      }
      this.player.trapped = true;
      this.parent.time.delayedCall(350, () => this.fadeSceneRestart(this.player, this.parent.time, this.parent.scene), [], this);
    } else if (!this.alert && sprite.body.touching !== sprite.body.wasTouching) {
      this.alert = this.parent.add.image(this.player.aura.body.center.x, this.player.aura.body.center.y - 30, "alert");
      this.alert.name = 'exclamation mark';
      this.alert.setScale(0.3).setDepth(depth.alert);
      if (!this.parent.tweens.isTweening(this.alert)) {
        this.parent.tweens.add({
          targets: this.alert,
          props: {y: {value: this.alert.y - 20, duration: 300, ease: 'Elastic.easeOut'}}
        })
      }
      const hideAlert = this.parent.time.delayedCall(350, () => {if (this.alert) {this.alert.destroy(); this.alert = undefined;} }, [], this);
    }
    this.lastTouching = sprite.body.touching.none;
    return true;
  };

  update() {
    if (this.alert && !this.parent.tweens.isTweening(this.alert)) {
      this.alert.setPosition(this.player.aura.body.center.x, this.player.aura.body.center.y - 30);
    }
    // console.log(this.player.aura.body.touching, this.player.aura.body.embedded);
    // console.log(this.theyrFuckingOverlapping);
  }

}