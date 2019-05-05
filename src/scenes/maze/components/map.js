import { depth } from './../mazeVariables';

export default class Map {
  constructor(parent) {
    this.parent = parent;
    this.tileMap = this.parent.make.tilemap({ key: 'map' });

    this.parent.physics.world.setBounds(this.tileMap.x, this.tileMap.y, this.tileMap.widthInPixels, this.tileMap.heightInPixels, true, true, true, true);

    const baseTileset = this.tileMap.addTilesetImage('base', 'base');
    this.baseLayer = this.tileMap.createStaticLayer('base', baseTileset, 0, 0);
    this.baseLayer.setCollisionByProperty({ collides: true });


    this.parent.add.image(0, 0, 'bg').setOrigin(0, 0);
    this.parent.add.image(0, 0, 'bg_below').setOrigin(0, 0);
    this.grass = this.parent.add.group();
    this.drawGrass();
    this.parent.add.image(0, 0, 'bg_above').setOrigin(0, 0).setDepth(depth.trees);

    this.parent.physics.world.enable(this.grass, 0);
    // this.frontScenery = this.parent.physics.add.staticGroup();
    // this.frontScenery.create(28, 910, 'house').setDepth(depth.house);
  }

  drawGrass = () => {
    const floorTiles = this.baseLayer.tilemap.filterTiles(t => !t.properties.collides);

    floorTiles.forEach(t => {
      var hitArea = new Phaser.Geom.Rectangle(t.pixelX, t.pixelY, t.baseWidth, t.baseHeight);
      var hitAreaCallback = Phaser.Geom.Rectangle.Contains;

      const newGrass = this.parent.add.group({
        key: 'plantlife',
        frame: `large_grasses.${Phaser.Math.RND.between(0, 2)}`,
        max: 3,
        hitArea: hitArea,
        hitAreaCallback: () => console.log('honk'),
        visible: true,
        // active: false, 
      })

      var rect = new Phaser.Geom.Rectangle(t.pixelX, t.pixelY, t.baseWidth, t.baseHeight);
      Phaser.Actions.PlaceOnRectangle(newGrass.getChildren(), rect);
      Phaser.Actions.SetXY(newGrass.getChildren(), 0, 0, t.pixelX, t.pixelY)
      Phaser.Actions.SetRotation(newGrass.getChildren(), Phaser.Math.RND.between(0, 120))
      // Phaser.Actions.Spread(newGrass.getChildren(), 'x', -50, 50, true);
      // Phaser.Actions.Spread(newGrass.getChildren(), 'y', -50, 50, true);
      // Phaser.Actions.Spread(newGrass.getChildren(), 'rotation', 0, 120, true);
      this.grass.addMultiple(newGrass.getChildren(), true);
    })
    // this.parent.cameras.main.disableCull = true;
    // Phaser.Actions.PlaceOnRectangle(group.getChildren(), rect, 5);
  }
  update = () => {
    //   this.grass.getChildren().forEach(e => { e.setActive(false); e.setVisible(false); })
    //   const visibleGrass = this.parent.cameras.main.cull(this.grass.getChildren());
    //   visibleGrass.forEach(e => { e.setActive(true); e.setVisible(true); })
  }
}