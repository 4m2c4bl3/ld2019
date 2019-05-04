import Phaser from 'phaser';
import {depth, scale, baseTrapTile, dynamicTrapTiles} from './../mazeVariables'
import Pathfinder from './pathfinder';

export default class Traps {
  constructor(parent) {
    this.parent = parent;
    this.player = parent.player;
    this.fadeSceneRestart = parent.fadeSceneRestart;
    this.alert;
    this.pathFinder = new Pathfinder({parent, map: parent.map.tileMap}); //use to keep regenerating paths;
    this.removableTraps = parent.removableTraps || [];
    this.createTraps(parent.map.tileMap)

    this.trapsSpotted = [];
    parent.trapsSpotted && parent.trapsSpotted.forEach(trap => this.createTrapSpotted(trap))
  }

  createTraps = (map) => {
    const trapTileset = map.addTilesetImage('traps', 'traps');
    this.trapsLayer = map.createDynamicLayer('traps', trapTileset, 0, 0);
    this.trapsLayer.visible = false;

    //red traps are static, always there
    const redTrapGroup = this.trapsLayer.filterTiles((tile) => tile.properties.id === baseTrapTile);
    this.drawNewTrapGroup(redTrapGroup);
    if (this.removableTraps.length > 0) {
      this.removableTraps.forEach((trap) => this.trapsLayer.removeTileAt(trap.x, trap.y, false))
      this.drawNewTrapGroup(this.trapsLayer.filterTiles((tile) => tile.properties.id > baseTrapTile && tile.properties.id <= [...dynamicTrapTiles].pop()));
    } else {
      this.drawDynamicTraps();
    }
    this.trapsLayer.setCollision([baseTrapTile, ...dynamicTrapTiles]);
    this.pathFinder.testPath();
  }

  drawNewTrapGroup = (trapGroup) => {
    trapGroup.forEach((tile) => {
      this.drawShine(tile, this.parent);
      const tileObject = this.parent.add.rectangle(tile.getCenterX(), tile.getCenterY(), tile.width, tile.height);
      this.parent.physics.world.enable(tileObject, 0);
      this.parent.physics.add.overlap(this.player.aura, tileObject, this.triggerTrap, null, this);
    });
  }

  drawDynamicTraps = () => {
    dynamicTrapTiles.forEach((tileIndex) => {
      const trapGroup = this.prepareDynamicTrapGroup(tileIndex);
      this.drawNewTrapGroup(trapGroup);
    });
  }

  prepareDynamicTrapGroup = (id) => {
    const newTrapGroup = this.trapsLayer.filterTiles((tile) => tile.properties.id === id);
    const removeTrapIndex = (Math.random() * (newTrapGroup.length - 1)).toFixed();
    const removeTrap = {x: newTrapGroup[removeTrapIndex].x, y: newTrapGroup[removeTrapIndex].y};
    this.removableTraps.push(removeTrap);
    this.trapsLayer.removeTileAt(removeTrap.x, removeTrap.y, false)
    newTrapGroup.splice(removeTrapIndex, 1)
    return newTrapGroup;
  }

  createTrapSpotted = (target) => {
    const trapSpotted = this.parent.add.image(target.x, target.y, 'misc');
    trapSpotted.setScale(2.5);
    this.trapsSpotted.push(trapSpotted);
  }

  drawShine = (tile, scene) => {
    let shine = scene.add.sprite(tile.getCenterX(), tile.getCenterY(), 'effects', 'shine.0').setScale(scale).setDepth(depth.shine);
    scene.add.rect;
    shine.anims.play('shine', true);
    scene.physics.world.enable(shine, 0);
  }

  triggerTrap = (sprite, tile) => {
    const centerSprite = sprite.body.center;
    const triggerX = (centerSprite.x > tile.body.center.x && Math.abs(centerSprite.x - tile.body.center.x) < tile.width / 3) || (centerSprite.x < tile.body.center.x && Math.abs(tile.body.center.x - centerSprite.x) < tile.width / 3);
    const triggerY = (centerSprite.y > tile.body.center.y && Math.abs(centerSprite.y - tile.body.center.y) < tile.height / 3) || (centerSprite.y < tile.body.center.y && Math.abs(tile.body.center.y - centerSprite.y) < tile.height / 3);

    if (triggerX && triggerY && !this.player.trapped) {
      if (this.alert) {
        this.alert.destroy();
        this.alert = undefined;
      }
      this.player.drawLargeBloodSplatter(sprite.body, true);
      this.player.trapped = true;
      this.parent.time.delayedCall(350, () => this.fadeSceneRestart(this.parent), [], this);
    } else if (!this.alert && !this.player.aura.body.touching.none && this.player.aura.body.wasTouching.none) {
      this.alert = this.parent.add.image(this.player.aura.body.center.x, this.player.aura.body.center.y - 30, 'alert');
      this.alert.name = 'exclamation mark';
      this.alert.setScale(scale).setDepth(depth.alert);

      if (!this.trapsSpotted.find(trap => trap.x === tile.body.center.x && trap.y == tile.body.center.y)) {
        this.createTrapSpotted(tile.body.center);
      }

      if (!this.parent.tweens.isTweening(this.alert)) {
        this.parent.tweens.add({
          targets: this.alert,
          props: {y: {value: this.alert.y - 20, duration: 300, ease: 'Elastic.easeOut'}}
        })
      }
      this.parent.time.delayedCall(350, () => {if (this.alert) {this.alert.destroy(); this.alert = undefined;} }, [], this);
    }
    this.lastTouching = sprite.body.touching.none;
    return true;
  };

  update = () => {
    if (this.alert && !this.parent.tweens.isTweening(this.alert)) {
      this.alert.setPosition(this.player.aura.body.center.x, this.player.aura.body.center.y - 30);
    }
    this.pathFinder.update();
  }
}