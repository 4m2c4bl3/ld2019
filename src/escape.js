import Phaser from "phaser";
import depth from "./depth";

export default class Escape {
    constructor({ parent, map, player, playTime, callback }) {
        this.parent = parent;
        this.player = player;
        this.playTime = playTime;
        this.fadeSceneRestart = callback;
        this.escapeZones = this.parent.add.container(0, 0);

        const escapeObjects = map.filterObjects("escape", obj => obj.type === "escape");
        escapeObjects.forEach((escapeObject) => {
            const escapeZone = this.parent.add.rectangle(escapeObject.x, escapeObject.y, escapeObject.width, escapeObject.height).setOrigin(0, 0);
            this.parent.physics.world.enable(escapeZone, 0);
            this.parent.physics.add.overlap(this.player.aura, escapeZone, this.escape, null, this);
            this.escapeZones.add(escapeZone);
        })

    }

    animComplete(animation, frame) {
        if (animation.key === "escaped-message-draw") {
            this.escapedText.anims.play('escaped-message-loop', true);
            this.parent.add.image(this.parent.camera.midPoint.x, this.parent.camera.midPoint.y + 70, "space_bar").setScale(0.3).setDepth(depth.directions);
        }
    }

    escape() {
        if (!this.playTime.timer.paused || !this.playTime.overrideAlpha) {
            this.parent.input.keyboard.once('keydown-SPACE', () => this.fadeSceneRestart(this.player, this.parent.time, this.parent.scene, true));
            this.playTime.timer.paused = true;
            this.parent.scene.systems.input.disable(this.player.aura.scene);
            const startTime = this.playTime.timerAlpha < 0 ? 0 : this.playTime.timerAlpha;
            this.playTime.overrideAlpha = this.parent.scene.systems.tweens.addCounter({ from: startTime, to: 1, duration: 250 });

            this.overlay = this.parent.add.sprite(this.parent.cameras.main.midPoint.x, this.parent.cameras.main.midPoint.y, "overlays", "overlay1").setAlpha(0.75).setDepth(depth.overlay);
            this.overlay.blendMode = 'MULTIPLY';
            this.overlay.anims.play("overlay", true);
            const escapedSprite = this.parent.add.sprite(this.parent.camera.midPoint.x, this.parent.camera.midPoint.y - 30, "sprite", "sprite.right.0").setScale(0.4).setDepth(depth.escaped);
            escapedSprite.anims.play(this.player.sprite.anims.currentAnim.key, true);
            escapedSprite.anims.msPerFrame = 500;
            this.escapedText = this.parent.add.sprite(this.parent.camera.midPoint.x, this.parent.camera.midPoint.y + 30, "escaped_message", "escaped_message.0").setScale(0.5).setDepth(depth.escaped);
            this.escapedText.anims.play("escaped-message-draw", true);
            this.escapedText.on('animationcomplete', this.animComplete, this);

            return true;
        }
    }

    update() {
    }
}