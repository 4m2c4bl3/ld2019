import Phaser from "phaser";

export default class Player {

  constructor(scene, x, y) {
    this.scene = scene;
    const anims = scene.anims;
    anims.create({
      key: "left",
      frames: anims.generateFrameNames("sprite", {
        prefix: "sprite1.left.",
        start: 0,
        end: 3,
        zeroPad: 0
      }),
      frameRate: 10,
      repeat: -1
    });
    anims.create({
      key: "right",
      frames: anims.generateFrameNames("sprite", {
        prefix: "sprite1.right.",
        start: 0,
        end: 3,
        zeroPad: 0
      }),
      frameRate: 10,
      repeat: -1
    });
    anims.create({
      key: "front",
      frames: anims.generateFrameNames("sprite", {
        prefix: "sprite1.front.",
        start: 0,
        end: 3,
        zeroPad: 0
      }),
      frameRate: 10,
      repeat: -1
    });
    anims.create({
      key: "back",
      frames: anims.generateFrameNames("sprite", {
        prefix: "sprite1.back.",
        start: 0,
        end: 3,
        zeroPad: 0
      }),
      frameRate: 10,
      repeat: -1
    });

    this.sprite = this.scene.physics.add.sprite(x, y, "sprite", "sprite1.back.0");
    this.sprite.setSize(25, 12);
    this.sprite.setOffset(0, 28);
    this.sprite.setCollideWorldBounds(true);

    this.cursors = this.scene.input.keyboard.createCursorKeys();
  }

  update() {
    function stopMovement(prevVelocity, sprite) {
      sprite.anims.stop();
      if (prevVelocity.x < 0) sprite.setTexture("sprite", "sprite1.left.0");
      else if (prevVelocity.x > 0) sprite.setTexture("sprite", "sprite1.right.0");
      else if (prevVelocity.y < 0) sprite.setTexture("sprite", "sprite1.back.0");
      else if (prevVelocity.y > 0) sprite.setTexture("sprite", "sprite1.front.0");
    }
  
    const speed = 175;
    const prevVelocity = this.sprite.body.velocity.clone();
    this.sprite.body.setVelocity(0);

    if (this.sprite.scene.input.enabled) {
      console.log(this.sprite.body.touching);
      if (this.cursors.left.isDown) {
        this.sprite.body.setVelocityX(-speed);
        this.sprite.anims.play("left", true);
      } else if (this.cursors.right.isDown) {
        this.sprite.body.setVelocityX(speed);
        this.sprite.anims.play("right", true);
      } else if (this.cursors.up.isDown) {
        this.sprite.body.setVelocityY(-speed);
        this.sprite.anims.play("back", true);
      } else if (this.cursors.down.isDown) {
        this.sprite.body.setVelocityY(speed);
        this.sprite.anims.play("front", true);
      } else {
        stopMovement(prevVelocity, this.sprite)
      }
    } else {
      stopMovement(prevVelocity, this.sprite)
    }
    this.sprite.body.velocity.normalize().scale(speed);
  }

  destroy() {
    this.sprite.destroy();
  }
}