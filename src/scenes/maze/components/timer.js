import Phaser from 'phaser';
import {depth} from './../mazeVariables'

export default class Timer {
    constructor({parent, overrideDelay}) {
        this.input = parent.input;
        this.time = parent.time;
        this.parent = parent;
        this.overrideAlpha;
        this.timerAlpha;
        this.overrideDelay = overrideDelay;
        this.delay = 20;
        this.timerConfig = {delay: this.delay * 1000, callback: (parent) => parent.fadeSceneRestart(parent), args: [this.parent], callbackScope: this}
        this.timer = this.time.addEvent(this.timerConfig);
        this.timer.paused = true;
        this.input.keyboard.once('keydown-SPACE', () => this.timer.paused = false);

        this.overlay = this.parent.add.sprite(this.parent.cameras.main.midPoint.x, this.parent.cameras.main.midPoint.y, 'overlays', 'overlay1').setAlpha(0.75).setDepth(depth.overlay).setScale(2.5);
        this.overlay.blendMode = 'MULTIPLY';
        this.overlay.anims.play('overlay', true);
    }
    update() {
        if (this.timer.delay !== this.delay * 1000 && !this.timer.paused)
        {
          this.timer.reset({...this.timerConfig, delay: this.delay * 1000});
        }
        
        this.timerAlpha = (Math.ceil(this.timer.elapsed / 1000)  / this.delay).toFixed(3);
        this.overlay.setAlpha(this.overrideAlpha ? this.overrideAlpha.progress : this.timerAlpha < 0 ? 0 : this.timerAlpha);
        this.overlay.setPosition(this.parent.cameras.main.midPoint.x, this.parent.cameras.main.midPoint.y);
        if (this.overrideDelay && this.delay !== this.overrideDelay) {
            this.delay = this.overrideDelay;
        }
        this.timerLastUpdate = Math.ceil(this.timer.elapsed / 1000);
    }
}