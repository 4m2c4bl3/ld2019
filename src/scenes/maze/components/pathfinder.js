import Phaser from 'phaser';
import EasyStar from 'easystarjs';

export default class PathFinder {
  constructor({ parent, map }) {
    this.map = map;
    this.parent = parent;
    this.debugging = false;
    this.pathFinder = new EasyStar.js();
    this.tiles = [];
  }

  drawPath = () => {
    this.path.forEach(pathItem => {
      const baseTile = this.map.findTile(tile => tile.x === pathItem.x && tile.y === pathItem.y)
      const baseTileImage = this.parent.add.image(baseTile.pixelX, baseTile.pixelY, 'blood').setScale(4).setOrigin(0, 0).setAlpha(0);
      this.tiles.push(baseTileImage);
    })
  }

  testPath = () => {
    const base = this.map.layers.find(layer => layer.name === 'base');
    const traps = this.map.layers.find(layer => layer.name === 'traps').data;
    const trapIndexes = [1,2,3,4,5,6]

    const baseLayerArray = base.data.map((x, indexX) => x.map((y, indexY) => {
      const baseIndex = y.index;
      const trapsIndex = traps[indexX][indexY].properties.id;
      return !trapIndexes.includes(trapsIndex) ? baseIndex : 2; 
    }));

    this.pathFinder.setGrid(baseLayerArray);
    this.pathFinder.setAcceptableTiles([1])
    this.path = undefined;
    this.pathFinder.findPath(0, Math.floor(base.height) - 1, Math.floor(base.width - 1 / base.baseTileWidth), Math.floor(0 / base.baseTileHeight), (path) => {
      if (path) {
        this.path = path;
        this.pathTime = Math.ceil(this.path.length * 0.3);
        this.drawPath();
      }
    });
    this.pathFinder.calculate();
  }

  update() {
    if (this.tiles.length > 0 && this.debugging && this.tiles[0].alpha !== 1)
    {
      this.tiles.forEach(tile => tile.setAlpha(1));
    }

  }
  
}