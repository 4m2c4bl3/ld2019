import Phaser from "phaser";

export default class Timer {
    constructor({ input, time, callback, scene }) {
        this.input = input;
        this.time = time;
        this.scene = scene;

        this.playTime = this.time.addEvent({ delay: 15 * 1000, callback: callback, args: [this.time], callbackScope: this });
        this.playTime.paused = true;
        this.input.keyboard.on('keydown-SPACE', () => this.playTime.paused = false);

        this.overlay = this.scene.add.sprite(this.scene.cameras.main.midPoint.x, this.scene.cameras.main.midPoint.y, "overlays", "overlay1").setAlpha(0.75).setDepth(10);
        this.overlay.blendMode = 'MULTIPLY';
        this.overlay.anims.play("overlay", true);
    }
    update() {
        this.overlay.setAlpha(((Math.ceil(this.playTime.elapsed / 1000) * 15).toFixed(3) / 100) - 0.3);
        this.overlay.setPosition(this.scene.cameras.main.midPoint.x, this.scene.cameras.main.midPoint.y);
    }
}