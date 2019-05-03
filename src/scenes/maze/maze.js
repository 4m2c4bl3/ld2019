import Phaser, {Game} from 'phaser';
import Animations from '../../anims';
import Player from './components/player';
import Timer from './components/timer';
import Traps from './components/traps';
import Escape from './components/escape';
import {depth} from './mazeVariables';
import {Testing} from './testing';

export default class MazeScene extends Phaser.Scene {
    constructor() {
        super('maze')
    }

    init = (data) => {
        this.newGame = data.newGame;
        this.removableTraps = !this.newGame && data.removableTraps;
        this.bloodTrail = !this.newGame && data.bloodTrail;
    }
    preload = () => {}

    create = () => {
        const animations = new Animations(this.scene.scene.anims);

        this.map = this.map || this.make.tilemap({key: 'map'});
        this.physics.world.setBounds(this.map.x, this.map.y, this.map.widthInPixels, this.map.heightInPixels, true, true, true, true);

        const floor_base = this.map.addTilesetImage('floor_base', 'floor_base');
        this.baseLayer = this.map.createStaticLayer('base', floor_base, 0, 0);
        this.baseLayer.setCollisionByProperty({collides: true});

        this.add.image(0, 0, 'forest_floor').setOrigin(0, 0);
        this.add.image(0, 0, 'trees_back').setOrigin(0, 0);
        this.add.image(0, 0, 'trees_front').setOrigin(0, 0).setDepth(depth.trees);

        this.frontScenery = this.physics.add.staticGroup();
        this.frontScenery.create(28, 910, 'house').setDepth(depth.house);

        const spawnPoint = this.map.findObject('spawn', obj => obj.name === 'spawn_point');
        this.player = new Player({parent: this, x: spawnPoint.x, y: spawnPoint.y, bloodTrail: this.bloodTrail});
        this.physics.add.collider(this.player.aura, this.baseLayer, null, null, this);
        this.physics.add.collider(this.player.aura, this.frontScenery, null, null, this);


        this.traps = new Traps({parent: this, map: this.map, player: this.player, callback: this.fadeSceneRestart, removableTraps: this.removableTraps});
        this.escape = new Escape({parent: this, map: this.map, player: this.player, playTime: this.playTime, callback: this.fadeSceneRestart})

        this.camera = this.cameras.main;
        this.camera.zoom = 2;
        this.camera.startFollow(this.player.aura);
        this.camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.camera.fadeEffect.start(false, 400, 0, 0, 0);

        this.testingTools = new Testing({parent: this, map: this.map});

        this.playTime = new Timer({parent: this, time: this.time, input: this.input, overrideDelay: this.traps.pathFinder.pathTime, callback: (time) => this.fadeSceneRestart(this.player, time, this.scene)});

        const directions = this.add.image(this.camera.midPoint.x + 30, this.camera.midPoint.y - 70, 'directions');
        directions.scrollFactor = 0;
        directions.setScale(0.3).setDepth(depth.directions);
        this.input.disable(this.player.aura.scene);
        this.input.keyboard.once('keydown-SPACE', () => {directions.destroy(); this.input.enable(this.player.aura.scene);});
    }

    fadeSceneRestart = (player, time, scene, newGame = false) => {
        if (scene.systems.input.enabled || newGame) {
            scene.systems.input.disable(player.aura.scene);
            scene.systems.cameras.main.fadeEffect.start(true, 400, 0, 0, 0);
            time.delayedCall(1 * 1000, () => {scene.restart({newGame, removableTraps: this.traps.removableTraps, bloodTrail: this.player.bloodTrail});}, [scene], this)
        }
    }

    update = (time, delta) => {
        this.player.update();
        this.traps && this.traps.update();
        this.playTime && this.playTime.update();
        this.testingTools && this.testingTools.update();
        if (this.traps.pathFinder.pathTime) {
            this.playTime.overrideDelay = this.traps.pathFinder.pathTime;
        }
    }
}
