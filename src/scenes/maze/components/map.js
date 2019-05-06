import { depth } from './../mazeVariables';

export default class Map {
  constructor(parent) {
    this.parent = parent;
    this.tileMap = this.parent.make.tilemap({ key: 'map' });

    this.parent.physics.world.setBounds(0, 0, this.tileMap.widthInPixels, this.tileMap.heightInPixels, true, true, true, true);

    const baseTileset = this.tileMap.addTilesetImage('base', 'base');
    this.baseLayer = this.tileMap.createStaticLayer('base', baseTileset, 0, 0);
    this.baseLayer.setCollisionByProperty({ collides: true });


    this.parent.add.image(0, 0, 'bg').setOrigin(0, 0);
    this.parent.add.image(0, 0, 'bg_below').setOrigin(0, 0);
    this.drawGrass();
    this.parent.add.image(0, 0, 'bg_above').setOrigin(0, 0).setDepth(depth.trees);
    this.frontScenery = this.parent.physics.add.staticGroup();
    this.frontScenery.create(0, this.tileMap.heightInPixels - this.parent.game.textures.list.house.source[0].height, 'house').setOrigin(0, 0).setDepth(depth.house).refreshBody();
  }

  drawGrass = () => {
    const grassImage = this.parent.cache.json.get('plantlife').frames["wide_grasses.0"].spriteSourceSize;
    const numberOfXGrassRequired = Math.ceil(this.tileMap.widthInPixels / (grassImage.w / 2));
    const numberOfYGrassRequired = Math.ceil(this.tileMap.heightInPixels / (grassImage.h / 4));
    this.grass = this.parent.add.group({
      classType: Phaser.GameObjects.Sprite,
      defaultKey: 'plantlife',
    });
    this.grass.maxSize = numberOfXGrassRequired * numberOfYGrassRequired;
    this.grass.createMultiple({
      key: this.grass.defaultKey,
      frame: `wide_grasses.${Phaser.Math.RND.between(0, 1)}`,
      repeat: this.grass.maxSize - 1
    });
    Phaser.Actions.GridAlign(this.grass.getChildren(), {
      width: numberOfXGrassRequired,
      height: numberOfYGrassRequired,
      cellWidth: grassImage.w - (grassImage.w / 2),
      cellHeight: grassImage.h - (grassImage.h / 4)
    });
    Phaser.Actions.SetBlendMode(this.grass.getChildren(), 2);
    Phaser.Actions.SetAlpha(0.5);
    this.grass.getChildren().forEach((g, i) => {
      g.x += Phaser.Math.RND.realInRange(-10, 10);
      g.y += Phaser.Math.RND.realInRange(-10, 10);
      if (i % 2 === 0) {
        g.flipX = true;
      }
    })
    this.grass.getChildren().forEach(grass => grass.setDepth(grass.y + depth.plants));
  }
  update = () => {
    if (this.parent.player.aura.body.isMoving) {
      this.grass.getChildren().filter(e => e.body).forEach(e => {
        this.grass.killAndHide(e);
        this.parent.physics.world.disable(e);
      });
      const visibleGrass = this.parent.cameras.main.cull(this.grass.getChildren());
      visibleGrass.forEach(e => { e.setVisible(true); })
      this.parent.physics.world.enable(visibleGrass, 1);
    }
  }
}