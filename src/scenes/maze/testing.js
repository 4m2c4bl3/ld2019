//just testing tools 
export class Testing {
  constructor({parent, map}) {
    this.parent = parent;

    const mini = this.parent.cameras.add(2, 2, 160, 160)
      .setName("mini")
      // .setScroll(0.9 * 960, 0.9 * 960) // looks right
      .setScroll(350, 350)
      .setZoom(0.15);

    const debugGraphics = this.parent.add.graphics().setAlpha(0.75);
    map.renderDebug(debugGraphics, {
      tileColor: null, // Color of non-colliding tiles
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
      faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    });
  }
  update() {

  }
}