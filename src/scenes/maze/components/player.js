import Phaser from "phaser";
import {depth} from "./../mazeVariables";

export default class Player {
  constructor({ parent, x, y }) {
    this.parent = parent;
    this.trapped = false;
    this.aura = this.parent.add.container(x, y);
    this.sprite = this.parent.add.sprite(0, 0, "sprite", "sprite.back.0");
    this.sprite.name = "player sprite";
    this.aura.setSize(200, 200);
    this.aura.add(this.sprite);
    this.aura.getByName('player sprite').setDepth(depth.player);
    this.parent.physics.world.add(this.aura);
    this.parent.physics.world.enable(this.aura);
    this.aura.setScale(0.25);
    this.aura.body.setCircle(25, 80, 150)
    this.aura.body.setCollideWorldBounds(true);

    this.cursors = this.parent.input.keyboard.createCursorKeys();
  }

  update() {
    this.aura.body.embedded ? this.aura.body.touching.none = false : null;

    function stopMovement(prevVelocity, sprite) {
      sprite.anims.stop();
      if (prevVelocity.x < 0) sprite.setTexture("sprite", "sprite.left.0");
      else if (prevVelocity.x > 0) sprite.setTexture("sprite", "sprite.right.0");
      else if (prevVelocity.y < 0) sprite.setTexture("sprite", "sprite.back.0");
      else if (prevVelocity.y > 0) sprite.setTexture("sprite", "sprite.front.0");
    }

    const speed = this.cursors.space.isDown ? 175 : 120;
    this.sprite.anims.msPerFrame = this.cursors.space.isDown ? 100 : 150;
    const prevVelocity = this.aura.body.velocity.clone();
    this.aura.body.setVelocity(0);

    if (this.sprite.scene.input.enabled && !this.trapped) {
      if (this.cursors.left.isDown) {
        this.aura.body.setVelocityX(-speed);
        this.sprite.anims.play("left", true);
      } else if (this.cursors.right.isDown) {
        this.aura.body.setVelocityX(speed);
        this.sprite.anims.play("right", true);
      } else if (this.cursors.up.isDown) {
        this.aura.body.setVelocityY(-speed);
        this.sprite.anims.play("back", true);
      } else if (this.cursors.down.isDown) {
        this.aura.body.setVelocityY(speed);
        this.sprite.anims.play("front", true);
      } else {
        stopMovement(prevVelocity, this.sprite)
      }
    } else {
      if (this.trapped && this.sprite.anims.currentAnim.key !== 'box') {
        const anims = this.sprite.anims;
        if (!anims.currentAnim.key.includes('-')) {
          const trappedAnimKey = `${anims.currentAnim.key}-hit`;
          anims.stop();

          const trap = this.parent.add.sprite(0, 0, "sprite", "trap_back.0");
          trap.name = "trap"
          this.aura.add(trap);
          this.aura.swap(trap, this.sprite);
          this.aura.getByName('trap').setDepth(depth.trap);
          trap.anims.play('trap', true);

          this.sprite.on('animationcomplete', this.animComplete, this);
          anims.play(trappedAnimKey, true);
        }
      } else {
        stopMovement(prevVelocity, this.sprite)
      }
    }
    this.aura.body.velocity.normalize().scale(speed);
  }
  animComplete(animation, frame) {
    const damageAnims = ["back-hit", "front-hit", "hit.left.", "right-hit"];
    if (damageAnims.includes(animation.key)) {
      this.aura.remove(this.aura.getByName('trap'), true);
      this.sprite.anims.play('box', true);
    }
  }

  destroy() {
    this.sprite.destroy();
  }
}