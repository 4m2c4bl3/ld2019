import Phaser from "phaser";
import depth from "./depth";

export default class Timer {
    constructor({ input, time, callback, parent }) {
        this.input = input;
        this.time = time;
        this.parent = parent;

        this.playTime = this.time.addEvent({ delay: 15 * 1000, callback: callback, args: [this.time], callbackScope: this });
        this.playTime.paused = true;
        this.input.keyboard.on('keydown-SPACE', () => this.playTime.paused = false);

        this.overlay = this.parent.add.sprite(this.parent.cameras.main.midPoint.x, this.parent.cameras.main.midPoint.y, "overlays", "overlay1").setAlpha(0.75).setDepth(depth.overlay);
        this.overlay.blendMode = 'MULTIPLY';
        this.overlay.anims.play("overlay", true);
    }
    update() {
        this.overlay.setAlpha(((Math.ceil(this.playTime.elapsed / 1000) * 15).toFixed(3) / 100) - 0.3);
        this.overlay.setPosition(this.parent.cameras.main.midPoint.x, this.parent.cameras.main.midPoint.y);
    }
}