import Phaser from "phaser";

export default class Traps {
  constructor({scene, map, player, callback}) {
    this.scene = scene;
    this.player = player;
    this.fadeSceneRestart = callback;
    this.alert;
    const trapsLayer = map.createStaticLayer("traps", marks, 0, 0);
    const marks = map.addTilesetImage("marks", "marks");
    trapsLayer.setCollision(4);
    const filteredTiles = trapsLayer.filterTiles(filterByTrap);
    filteredTiles.forEach((tile) => createshine(tile, this.scene));

    function filterByTrap(tile) {return tile.properties.collides;}
    function createshine(tile, scene) {
      let shine = scene.add.sprite(tile.getCenterX(), tile.getCenterY(), "effects", "shine.0").setScale(0.3).setDepth(100);
      shine.anims.play("shine", true);
      // game.debug.renderSpriteBounds(shine);
    }

    this.scene.physics.add.overlap(this.player.aura, trapsLayer);
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
      this.fadeSceneRestart(this.player, this.scene.time, this.scene.scene);
    } else if (!this.alert && sprite.body.touching !== sprite.body.wasTouching) {
      this.alert = this.scene.add.image(this.player.aura.body.center.x, this.player.aura.body.center.y - 30, "alert");
      this.alert.name = 'exclamation mark';
      this.alert.setScale(0.3).setDepth(2000);
      if (!this.scene.tweens.isTweening(this.alert)) {
        this.scene.tweens.add({
          targets: this.alert,
          props: {y: {value: this.alert.y - 20, duration: 300, ease: 'Elastic.easeOut'}}
        })
      }
      const hideAlert = this.scene.time.delayedCall(350, () => {if (this.alert) {this.alert.destroy(); this.alert = undefined;} }, [], this);
    }
    this.lastTouching = sprite.body.touching.none;
    return true;
  };

  update() {
    if (this.alert && !this.scene.tweens.isTweening(this.alert)) {
      this.alert.setPosition(this.player.aura.body.center.x, this.player.aura.body.center.y - 30);
    }
    this.player.aura.body.embedded ? this.player.auda.body.touching.none = false : null;
    if (this.player.aura.body.touching.none && !this.player.aura.body.wasTouching.none) {
      console.log('fart');
    }
    // console.log(this.player.aura.body.touching, this.player.aura.body.embedded);
    // console.log(this.theyrFuckingOverlapping);
  }

}