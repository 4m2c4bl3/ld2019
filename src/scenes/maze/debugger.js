//just testing tools 
export class Debugger {
  constructor(parent) {
    this.parent = parent;

    this.parent.cameras.add(2, 2, 160, 160)
      .setName("mini")
      .setScroll(350, 350)
      .setZoom(0.15);

    const debugGraphics = this.parent.add.graphics().setAlpha(0.75);
    parent.map.tileMap.renderDebug(debugGraphics, {
      tileColor: null, // Color of non-colliding tiles
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
      faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    });

    parent.traps.pathFinder.debugging = true;
  }
  update() {
  }
}