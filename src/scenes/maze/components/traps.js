import Phaser from 'phaser';
import {depth} from './../mazeVariables'
import Pathfinder from './pathfinder';

export default class Traps {
  constructor({parent, map, player, callback, removableTraps}) {
    this.parent = parent;
    this.player = player;
    this.fadeSceneRestart = callback;
    this.alert;
    this.pathFinder = new Pathfinder({parent, map}); //use to keep regenerating paths;
    this.removableTraps = removableTraps || [];
    this.createTraps(map)
  }

  createTraps = (map) => {
    const marks = map.addTilesetImage('trap marks', 'marks');
    this.trapsLayer = map.createDynamicLayer('traps', marks, 0, 0);
    this.trapsLayer.visible = false;

    //red traps are static, always there
    const redTrapGroup = this.trapsLayer.filterTiles((tile) => tile.properties.id === 1);
    this.drawNewTrapGroup(redTrapGroup);
    if (this.removableTraps.length > 0 ) {
      this.removableTraps.forEach((trap) => this.trapsLayer.removeTileAt(trap.x, trap.y, false))
      this.drawNewTrapGroup(this.trapsLayer.filterTiles((tile) => tile.properties.id > 1));
    } else {
      this.drawDynamicTraps();
    }
    this.trapsLayer.setCollision([0, 1, 2, 3, 4, 5, 6]);
    this.pathFinder.testPath();

  }

  drawNewTrapGroup = (trapGroup) => {
    trapGroup.forEach((tile) => {
      this.createshine(tile, this.parent);
      const tileObject = this.parent.add.rectangle(tile.getCenterX(), tile.getCenterY(), tile.width, tile.height);
      this.parent.physics.world.enable(tileObject, 0);
      this.parent.physics.add.overlap(this.player.aura, tileObject, this.triggerTrap, null, this);
    });
  }

  drawDynamicTraps = () => {
    const yellowTrapGroup = this.prepareDynamicTrapGroup(2);
    this.drawNewTrapGroup(yellowTrapGroup);
    const greenTrapGroup = this.prepareDynamicTrapGroup(3);
    this.drawNewTrapGroup(greenTrapGroup);
    const tealTrapGroup = this.prepareDynamicTrapGroup(4);
    this.drawNewTrapGroup(tealTrapGroup);
    const blueTrapGroup = this.prepareDynamicTrapGroup(5);
    this.drawNewTrapGroup(blueTrapGroup);
    const purpleTrapGroup = this.prepareDynamicTrapGroup(6);
    this.drawNewTrapGroup(purpleTrapGroup);
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

  createshine = (tile, scene) => {
    let shine = scene.add.sprite(tile.getCenterX(), tile.getCenterY(), 'effects', 'shine.0').setScale(0.3).setDepth(depth.shine);
    let shineHitbox = scene.add.rect
    shine.anims.play('shine', true);
    scene.physics.world.enable(shine, 0);
  }
  triggerTrap = (sprite, tile) => {
    const centerSprite = sprite.body.center;
    const triggerX = (centerSprite.x > tile.body.center.x && Math.abs(centerSprite.x - tile.body.center.x) < tile.width / 3) || (centerSprite.x < tile.body.center.x && Math.abs(tile.body.center.x - centerSprite.x) < tile.width / 3);
    const triggerY = (centerSprite.y > tile.body.center.y && Math.abs(centerSprite.y - tile.body.center.y) < tile.height / 3) || (centerSprite.y < tile.body.center.y && Math.abs(tile.body.center.y - centerSprite.y) < tile.height / 3);

    if (triggerX && triggerY) {
      if (this.alert) {
        this.alert.destroy();
        this.alert = undefined;
      }
      this.player.trapped = true;
      this.parent.time.delayedCall(350, () => this.fadeSceneRestart(this.player, this.parent.time, this.parent.scene), [], this);
    } else if (!this.alert && !this.player.aura.body.touching.none && this.player.aura.body.wasTouching.none) {
      this.alert = this.parent.add.image(this.player.aura.body.center.x, this.player.aura.body.center.y - 30, 'alert');
      this.alert.name = 'exclamation mark';
      this.alert.setScale(0.3).setDepth(depth.alert);
      if (!this.parent.tweens.isTweening(this.alert)) {
        this.parent.tweens.add({
          targets: this.alert,
          props: {y: {value: this.alert.y - 20, duration: 300, ease: 'Elastic.easeOut'}}
        })
      }
      const hideAlert = this.parent.time.delayedCall(350, () => {if (this.alert) {this.alert.destroy(); this.alert = undefined;} }, [], this);
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