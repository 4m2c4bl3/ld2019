
import { gameRatio } from '../../gameVariables';

export default class LoadingScene extends Phaser.Scene {
  constructor() {
    super('loading')
  }
  preload = () => {
    const progressBox = this.add.graphics();
    const progressBar = this.add.graphics();
    progressBox.fillStyle(0x072f37, 1);
    progressBox.fillRect(((gameRatio.width - 40) / 2) / 2, gameRatio.height / 3, (gameRatio.width + 40) / 2, 50);

    var percentText = this.make.text({
      x: gameRatio.width / 2,
      y: gameRatio.width / 2 - 5,
      text: '0%',
      style: {
        font: '18px monospace',
        fill: '#0f4737'
      }
    });
    percentText.setOrigin(0.5, 0.5);

    this.load.on('progress', function (value) {
      progressBar.clear();
      progressBar.fillStyle(0x0f4737, 1);
      progressBar.fillRect(((gameRatio.width) / 2) / 2, (gameRatio.height + 25) / 3, gameRatio.width / 2 * value, 35);
      percentText.setText(parseInt(value * 100) + '%');

    });

    this.load.on('complete', function () {
      progressBar.destroy();
      progressBox.destroy();
      percentText.destroy();
    });

    this.load.image('traps', 'assets/traps.png');
    this.load.image('house', 'assets/house.png');
    this.load.image('directions', 'assets/directions.png')
    this.load.image('base', 'assets/base.png');
    this.load.image('trees_front', 'assets/trees_front.png');
    this.load.image('trees_back', 'assets/trees_back.png');
    this.load.image('alert', 'assets/strong_exclamation.png');
    this.load.image('space_bar', 'assets/space_bar.png');
    this.load.image('forest_floor', 'assets/forest_floor.png');
    this.load.tilemapTiledJSON('map', 'assets/forest1.json');
    this.load.atlas('sprite', 'assets/sprite-0.png', 'assets/sprite-0.json');
    this.load.atlas('overlays', 'assets/overlays.png', 'assets/overlays.json');
    this.load.atlas('effects', 'assets/effects.png', 'assets/effects.json');
    this.load.atlas('escaped_message', 'assets/escaped_message.png', 'assets/escaped_message.json');
    this.load.image('blood', 'assets/blood_temp.png');
    this.load.image('misc', 'assets/grey_temp.png');
  }

  create = () => {
    this.scene.transition({ target: 'maze' });
  }
}