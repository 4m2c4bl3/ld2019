import Phaser from 'phaser';
import EasyStar from 'easystarjs';

export default class Pathfinder {
  constructor({ parent, map }) {
    this.map = map;
    this.parent = parent;
    this.pathFinder = new EasyStar.js();
  }

  drawPath = () => {
    this.path.forEach(pathItem => {
      const baseTile = this.map.findTile(tile => tile.x === pathItem.x && tile.y === pathItem.y)
      this.parent.add.image(baseTile.pixelX, baseTile.pixelY, 'blood').setOrigin(0, 0);
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
    this.pathFinder.findPath(0, Math.floor(base.height) - 1, Math.floor(base.width - 1 / 29), Math.floor(0 / 29), (path) => {
      if (path) {
        this.path = path;
        this.pathTime = this.path.length * 0.5;
        this.drawPath();
      }
    });
    this.pathFinder.calculate();
  }

  update() {
  }
  
}