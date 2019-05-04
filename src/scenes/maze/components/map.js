import {depth} from './../mazeVariables';

export default class Map {
  constructor(parent) {
    this.parent = parent;
    this.tileMap = this.parent.make.tilemap({key: 'map'});
    
    this.parent.physics.world.setBounds(this.tileMap.x, this.tileMap.y, this.tileMap.widthInPixels, this.tileMap.heightInPixels, true, true, true, true);

    const baseTileset = this.tileMap.addTilesetImage('base', 'base');
    this.baseLayer = this.tileMap.createStaticLayer('base', baseTileset, 0, 0);
    this.baseLayer.setCollisionByProperty({collides: true});

    // this.parent.add.image(0, 0, 'forest_floor').setOrigin(0, 0);
    // this.parent.add.image(0, 0, 'trees_back').setOrigin(0, 0);
    // this.parent.add.image(0, 0, 'trees_front').setOrigin(0, 0).setDepth(depth.trees);

    // this.frontScenery = this.parent.physics.add.staticGroup();
    // this.frontScenery.create(28, 910, 'house').setDepth(depth.house);
  }
}