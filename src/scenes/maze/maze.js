import Phaser from 'phaser';
import Animations from '../../anims';
import Player from './components/player';
import DefeatTimer from './components/defeatTimer';
import Traps from './components/traps';
import Map from './components/map';
import EscapeZone from './components/escapeZone';
import { depth, scale } from './mazeVariables';
import { Debugger } from './debugger';

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
    preload = () => { }

    create = () => {
        //super reliant on order, which sucks .... anyway they need to be:
        //1) map
        //2) player
        //4) traps & escape

        const animations = new Animations(this.scene.scene.anims);

        this.map = new Map(this);

        const spawnPoint = this.map.tileMap.findObject('spawn', obj => obj.name === 'spawn_point');
        this.player = new Player({ parent: this, x: spawnPoint.x, y: spawnPoint.y });

        this.traps = new Traps(this);
        this.escapeZone = new EscapeZone(this);

        this.drawCamera()

        this.debuggingTools = new Debugger(this);
        this.defeatTimer = new DefeatTimer({ parent: this, overrideDelay: this.traps.pathFinder.pathTime });

        this.drawDirections();
    }

    drawCamera = () => {
        this.camera = this.cameras.main;
        this.camera.setZoom(0.4);
        this.camera.startFollow(this.player.aura);
        this.camera.setBounds(0, 0, this.map.tileMap.widthInPixels, this.map.tileMap.heightInPixels);
        this.camera.fadeEffect.start(false, 400, 0, 0, 0);
    }

    drawDirections = () => {
        const directions = this.add.image(this.camera.scrollX + this.camera.width / 2, this.camera.scrollY + this.camera.height / 2, 'directions');
        directions.scrollFactor = 0;
        directions.setScale(2).setDepth(depth.directions);
        this.input.keyboard.once('keydown-SPACE', () => { directions.destroy(); this.player.paused = false; });
    }

    fadeSceneRestart = (parent, newGame = false) => {
        parent.scene.systems.cameras.main.fadeEffect.start(true, 400, 0, 0, 0);
        parent.time.delayedCall(1 * 1000, () => this.scene.restart({
            newGame,
            removableTraps: this.traps.removableTraps,
            bloodTrail: this.player.bloodTrail,
            trapsSpotted: this.traps.trapsSpotted
        }), [], this)
    }

    update = (time, delta) => {
        this.player.update();
        this.map && this.map.update();
        this.traps && this.traps.update();
        this.defeatTimer && this.defeatTimer.update();
        this.testingTools && this.testingTools.update();
        if (this.traps.pathFinder.pathTime) {
            this.defeatTimer.overrideDelay = this.traps.pathFinder.pathTime;
        }
    }
}
