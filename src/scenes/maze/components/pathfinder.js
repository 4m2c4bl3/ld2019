import Phaser from "phaser";
import EasyStar from 'easystarjs';

export default class Pathfinder {
    constructor({ parent, map, player}) {
        this.map = map;
        this.player = player;
        this.parent = parent;

        this.pathFinder = new EasyStar.js();
        const traps = this.map.layers.find(layer => layer.name === 'traps').data;
        const baseLayerArray = this.map.layers.find(layer => layer.name === 'base').data.map((x, indexX) => x.map((y, indexY) => {
          const baseIndex = y.index;
          const trapsIndex = traps[indexX][indexY].index;
          return trapsIndex < 0 ? baseIndex : 2;
        }));
        this.pathFinder.setGrid(baseLayerArray);
        this.pathFinder.setAcceptableTiles([1])

        const target = this.map.objects.find(object => object.name === 'escape').objects[0];

        this.pathFinder.findPath(Math.floor(this.player.aura.x/29), Math.floor(this.player.aura.y/29), Math.floor(target.x/29), Math.floor(target.y/29), (path) =>{
          if (path === null)
          {
            console.warn("Path was not found.");
          }else{
            console.log(path);
            this.path = path;
            this.drawPath();
          }
        });
        this.pathFinder.calculate();


    }
    drawPath() {
      this.path.forEach((pathItem) => {
        const baseTile = this.map.layers.find(layer => layer.name === 'base').data[pathItem.x][pathItem.y];
        this.parent.add.image(baseTile.pixelX, baseTile.pixely, 'blood').setScale(0.5);
      })
    }
    update() {
      this.path && console.log(this.path[0]);
    }
}