import Phaser from 'phaser';
import { depth } from './../mazeVariables';

export default class Player {
  constructor({ parent, x, y }) {
    this.parent = parent;
    this.trapped = false;
    this.paused = true;
    this.aura = this.parent.add.container(x, y);

    this.bloodTrail = [];
    parent.bloodTrail && parent.bloodTrail.forEach(({ blood }) => {
      if (blood.alpha > 0) {
        const newBlood = blood.name !== 'trap' ? this.drawNewBlood(blood) : this.drawLargeBloodSplatter(blood);
        this.bloodTrail.push({ blood: newBlood });
      }
    })

    this.sprite = this.parent.add.sprite(0, 0, 'sprite', 'sprite.back.0');
    this.sprite.name = 'player sprite';
    this.aura.setSize(this.parent.map.tileMap.tileWidth, this.sprite.height);
    this.aura.add(this.sprite);
    this.aura.getByName('player sprite').setDepth(depth.player);
    this.aura.setDepth(depth.player);
    this.parent.physics.world.add(this.aura);
    this.parent.physics.world.enable(this.aura);
    this.aura.body.setCircle(25, (this.aura.width / 3).toFixed(), this.aura.height / 4 * 3)
    this.aura.body.setCollideWorldBounds(true);


    this.parent.physics.add.collider(this.aura, this.parent.map.baseLayer, null, null, this);
    // this.parent.physics.add.overlap(this.aura, this.parent.map.grass, () => console.log('fart'), null, this);
    // this.parent.physics.add.collider(this.aura, this.parent.map.frontScenery, null, null, this);

    this.cursors = this.parent.input.keyboard.createCursorKeys();
  }

  drawNewBlood = (target) => {
    const newBlood = this.parent.add.image(target.x, target.y, 'blood');
    const scaleVariable = Phaser.Math.RND.realInRange(0.5, 1);
    newBlood.setDepth(depth.blood).setScale(scaleVariable).setAlpha(target.type !== 'Container' ? target.alpha - (target.alpha / 4).toFixed(3) : 1);
    newBlood.blendMode = 'MULTIPLY';
    return newBlood;
  }

  drawLargeBloodSplatter = (target, fresh = false) => {
    const newBlood = this.parent.add.image(target.x, target.y, 'blood');
    // const scaleVariable = Phaser.Math.RND.between(1,2);
    newBlood.setDepth(depth.blood).setScale(2);
    newBlood.blendMode = 'MULTIPLY';
    newBlood.name = 'trap';
    fresh && this.bloodTrail.push({ blood: newBlood });
    return newBlood;
  }

  drawBloodTrail = () => {
    if (!this.startStep) {
      this.startStep = { ...this.aura.body.position };
      const percentElapsed = this.parent.defeatTimer.timer.elapsed ? Phaser.Math.Percent(this.parent.defeatTimer.timer.elapsed, 0, this.parent.defeatTimer.timer.delay) : 0.1;
      const elapsed = this.parent.defeatTimer.timer.elapsed && percentElapsed > 0.1 ? percentElapsed * 10 : 1 ;
       this.bloodDistance = Phaser.Math.RND.realInRange(this.parent.map.tileMap.tileWidth / elapsed.toFixed(0), (this.parent.map.tileMap.tileWidth * 2) / elapsed.toFixed(0));
       this.parent.defeatTimer.timer.elapsed && console.log(elapsed, this.bloodDistance);
      }
    else if (Math.abs(this.startStep.x - this.aura.body.position.x) > this.bloodDistance || Math.abs(this.startStep.y - this.aura.body.position.y) > this.bloodDistance) {
      const blood = this.drawNewBlood({ ...this.aura, y: this.aura.body.center.y });
      this.bloodTrail.push({ blood });
      this.startStep = undefined;
    }
  }

  update = () => {
    this.aura.body.embedded ? this.aura.body.touching.none = false : null;
    if (this.trapped) this.paused = true;
    if (!this.paused) {
      this.drawBloodTrail();
    }
    function stopMovement(prevVelocity, sprite) {
      sprite.anims.stop();
      if (prevVelocity.x < 0) sprite.setTexture('sprite', 'sprite.left.0');
      else if (prevVelocity.x > 0) sprite.setTexture('sprite', 'sprite.right.0');
      else if (prevVelocity.y < 0) sprite.setTexture('sprite', 'sprite.back.0');
      else if (prevVelocity.y > 0) sprite.setTexture('sprite', 'sprite.front.0');
    }

    const speed = this.cursors.space.isDown ? 5 * this.parent.map.tileMap.tileWidth : 3 * this.parent.map.tileMap.tileWidth;
    this.sprite.anims.msPerFrame = this.cursors.space.isDown ? 100 : 150;
    const prevVelocity = this.aura.body.velocity.clone();
    this.aura.body.setVelocity(0);

    if (!this.trapped && !this.paused) {
      if (this.cursors.left.isDown) {
        this.aura.body.setVelocityX(-speed);
        this.sprite.anims.play('left', true);
      } else if (this.cursors.right.isDown) {
        this.aura.body.setVelocityX(speed);
        this.sprite.anims.play('right', true);
      } else if (this.cursors.up.isDown) {
        this.aura.body.setVelocityY(-speed);
        this.sprite.anims.play('back', true);
      } else if (this.cursors.down.isDown) {
        this.aura.body.setVelocityY(speed);
        this.sprite.anims.play('front', true);
      } else {
        stopMovement(prevVelocity, this.sprite)
      }
    } else {
      if (this.trapped && this.sprite.anims.currentAnim.key !== 'box') {
        const anims = this.sprite.anims;
        if (!anims.currentAnim.key.includes('-')) {
          const trappedAnimKey = `${anims.currentAnim.key}-hit`;
          anims.stop();

          const trap = this.parent.add.sprite(0, 0, 'sprite', 'trap_back.0');
          trap.name = 'trap'
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
    const damageAnims = ['back-hit', 'front-hit', 'hit.left.', 'right-hit'];
    if (damageAnims.includes(animation.key)) {
      this.aura.remove(this.aura.getByName('trap'), true);
      this.sprite.anims.play('box', true);
    }
  }

  destroy() {
    this.sprite.destroy();
  }
}