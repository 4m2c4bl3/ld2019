import Phaser, {Game} from 'phaser';
import Animations from '../../anims';
import Player from './components/player';
import Timer from './components/timer';
import Traps from './components/traps';
import Escape from './components/escape';
import {depth} from './mazeVariables';

export default class MazeScene extends Phaser.Scene {
    constructor() {
        super('maze')
    }
    
    preload() {}

    create() {
        const animations = new Animations(this.scene.scene.anims);
        //draw map
        const baseMap = this.make.tilemap({ key: 'map' });
        this.physics.world.setBounds(baseMap.x, baseMap.y, baseMap.widthInPixels, baseMap.heightInPixels, true, true, true, true);
        const spawnPoint = baseMap.findObject('spawn', obj => obj.name === 'spawn_point');

        const floor_base = baseMap.addTilesetImage('floor_base', 'floor_base');
        const baseLayer = baseMap.createStaticLayer('base', floor_base, 0, 0);
        baseLayer.setCollisionByProperty({ collides: true });

        this.add.image(0, 0, 'forest_floor').setOrigin(0, 0);
        this.add.image(0, 0, 'trees_back').setOrigin(0, 0);
        this.add.image(0, 0, 'trees_front').setOrigin(0, 0).setDepth(depth.trees);

        const frontScenery = this.physics.add.staticGroup();
        frontScenery.create(28, 910, 'house').setDepth(depth.house);

        //create classes

        this.player = new Player({ parent: this, x: spawnPoint.x, y: spawnPoint.y , bloodTrail: this.player ? this.player.bloodTrail : undefined});
        this.physics.add.collider(this.player.aura, baseLayer, null, null, this);
        this.physics.add.collider(this.player.aura, frontScenery, null, null, this);

        this.traps = new Traps({ parent: this, map: baseMap, player: this.player, callback: this.fadeSceneRestart })
        this.playTime = new Timer({ parent: this, time: this.time, input: this.input, callback: (time) => this.fadeSceneRestart(this.player, time, this.scene) });
        this.escape = new Escape({ parent: this, map: baseMap, player: this.player, playTime: this.playTime, callback: this.fadeSceneRestart })

        //create camera
        this.camera = this.cameras.main;
        this.camera.zoom = 2;
        this.camera.startFollow(this.player.aura);
        this.camera.setBounds(0, 0, baseMap.widthInPixels, baseMap.heightInPixels);
        this.camera.fadeEffect.start(false, 400, 0, 0, 0);

        //create startup
        const directions = this.add.image(this.camera.midPoint.x + 30, this.camera.midPoint.y - 70, 'directions');
        directions.scrollFactor = 0;
        directions.setScale(0.3).setDepth(depth.directions);
        this.input.disable(this.player.aura.scene);
        this.input.keyboard.once('keydown-SPACE', () => { directions.destroy(); this.input.enable(this.player.aura.scene); });
    }

    fadeSceneRestart(player, time, scene, escaped = false) {
        if (scene.systems.input.enabled || escaped) {
            scene.systems.input.disable(player.aura.scene);
            scene.systems.cameras.main.fadeEffect.start(true, 400, 0, 0, 0);
            const sceneRestartTimer = time.delayedCall(1 * 1000, () => { scene.restart({bloodHistory: this.player.bloodTrail}); }, [scene], this)
        }
    }

    update(time, delta) {
        this.player.update();
        this.traps && this.traps.update();
        this.playTime && this.playTime.update();
    }
}
