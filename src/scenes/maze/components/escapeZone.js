import Phaser from 'phaser';
import {depth, scale} from './../mazeVariables'

export default class EscapeZone {
  constructor(parent) {
    this.parent = parent;
    this.fadeSceneRestart = parent.fadeSceneRestart;
    this.escapeZones = this.parent.add.container(0, 0);
    this.displayScale = 2;

    const escapeObjects = parent.map.tileMap.filterObjects('escape', obj => obj.type === 'escape');
    escapeObjects.forEach((escapeObject) => {
      const escapeZone = this.parent.add.rectangle(escapeObject.x, escapeObject.y, escapeObject.width, escapeObject.height).setOrigin(0, 0);
      this.parent.physics.world.enable(escapeZone, 0);
      this.parent.physics.add.overlap(this.parent.player.aura, escapeZone, this.escape, null, this);
      this.escapeZones.add(escapeZone);
    })

  }

  animComplete = (animation, frame) => {
    if (animation.key === 'escaped-message-draw') {
      this.escapedText.anims.play('escaped-message-loop', true);
      this.parent.add.image(this.parent.camera.midPoint.x, this.parent.camera.midPoint.y + ((this.escapedSprite.displayHeight / 4)*2) + this.escapedText.displayHeight + (this.escapedText.displayHeight / 2), 'space_bar').setScale(this.displayScale).setDepth(depth.directions);
    }
  }

  escape = () => {
    if (!this.parent.defeatTimer.timer.paused || !this.parent.defeatTimer.overrideAlpha) {
      this.parent.input.keyboard.once('keydown-SPACE', () => this.fadeSceneRestart(this.parent, true));
      this.parent.defeatTimer.timer.paused = true;
      this.parent.player.paused = true;
      const startTime = this.parent.defeatTimer.timerAlpha < 0 ? 0 : this.parent.defeatTimer.timerAlpha;
      this.parent.defeatTimer.overrideAlpha = this.parent.scene.systems.tweens.addCounter({from: startTime, to: 1, duration: 250});
      
      this.escapedSprite = this.parent.add.sprite(this.parent.camera.midPoint.x, (this.parent.camera.midPoint.y - (this.parent.player.sprite.height / 2)), 'sprite', 'sprite.right.0').setScale(this.displayScale).setDepth(depth.escaped);
      this.escapedSprite.anims.play(this.parent.player.sprite.anims.currentAnim.key, true);
      this.escapedSprite.anims.msPerFrame = 150;
      this.escapedText = this.parent.add.sprite(this.parent.camera.midPoint.x, this.parent.camera.midPoint.y + (this.escapedSprite.displayHeight / 4)*2, 'escaped_message', 'escaped_message.0').setScale(this.displayScale).setDepth(depth.escaped);
      this.escapedText.anims.play('escaped-message-draw', true);
      this.escapedText.on('animationcomplete', this.animComplete, this);

      return true;
    }
  }

  update() {
  }
}