import Phaser from 'phaser';
import Animations from '../../anims';
import Player from './components/player';
import Timer from './components/timer';
import Traps from './components/traps';
import Map from './components/map';
import Escape from './components/escape';
import {depth} from './mazeVariables';
import {Debugger} from './debugger';

export default class MazeScene extends Phaser.Scene {
    constructor() {
        super('maze')
    }

    init = (data) => {
        this.newGame = data.newGame;
        this.removableTraps = !this.newGame && data.removableTraps;
        this.bloodTrail = !this.newGame && data.bloodTrail;
        this.trapsSpotted = !this.newGame && data.trapsSpotted;
    }
    preload = () => {}

    create = () => {
        //super reliant on order, which sucks .... anyway they need to be:
        //1) map
        //2) player
        //4) traps & escape

        const animations = new Animations(this.scene.scene.anims);

        this.map = new Map(this);

        const spawnPoint = this.map.tileMap.findObject('spawn', obj => obj.name === 'spawn_point');
        this.player = new Player({parent: this, x: spawnPoint.x, y: spawnPoint.y});

        this.traps = new Traps(this);
        this.escape = new Escape(this);

        this.drawCamera()

        // this.debuggingTools = new Debugger(this);
        this.playTime = new Timer({parent: this, overrideDelay: this.traps.pathFinder.pathTime});

        this.drawDirections();
    }

    drawCamera = () => {
        this.camera = this.cameras.main;
        this.camera.zoom = 2;
        this.camera.startFollow(this.player.aura);
        this.camera.setBounds(0, 0, this.map.tileMap.widthInPixels, this.map.tileMap.heightInPixels);
        this.camera.fadeEffect.start(false, 400, 0, 0, 0);
    }

    drawDirections = () => {
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
            time.delayedCall(1 * 1000, () => scene.restart({
                newGame,
                removableTraps: this.traps.removableTraps,
                bloodTrail: this.player.bloodTrail,
                trapsSpotted: this.traps.trapsSpotted
            }), [scene], this)
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
