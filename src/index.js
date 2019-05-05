import Phaser from 'phaser';
import MazeScene from './scenes/maze/maze';
import LoadingScene from './scenes/loading/loading';
import {gameRatio} from './gameVariables';

const config = {
  type: Phaser.AUTO,
  // pixelArt: true,
  scale: {
    parent: 'get-away',
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: gameRatio.width,
    height: gameRatio.height,
  },
  scene: [LoadingScene, MazeScene],
  physics: {
    default: 'arcade',
    arcade: {
      // debug: true,
      gravity: { y: 0 }
    }
  }
};

const game = new Phaser.Game(config);