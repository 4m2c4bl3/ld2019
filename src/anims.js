import Phaser from 'phaser';

export default class Animations {
  constructor(anims) {
    anims.create({
      key: 'left',
      frames: anims.generateFrameNames('playerSprite', {
        prefix: 'sprite.left.',
        start: 0,
        end: 3,
        zeroPad: 0
      }),
      frameRate: 10,
      repeat: -1
    });
    anims.create({
      key: 'left-hit',
      frames: anims.generateFrameNames('playerSprite', {
        prefix: 'hit.left.',
        start: 0,
        end: 2,
        zeroPad: 0
      }),
      frameRate: 10,
      repeat: 0
    });
    anims.create({
      key: 'right',
      frames: anims.generateFrameNames('playerSprite', {
        prefix: 'sprite.right.',
        start: 0,
        end: 3,
        zeroPad: 0
      }),
      frameRate: 10,
      repeat: -1
    });
    anims.create({
      key: 'right-hit',
      frames: anims.generateFrameNames('playerSprite', {
        prefix: 'hit.right.',
        start: 0,
        end: 2,
        zeroPad: 0
      }),
      frameRate: 10,
      repeat: 0
    });
    anims.create({
      key: 'front',
      frames: anims.generateFrameNames('playerSprite', {
        prefix: 'sprite.front.',
        start: 0,
        end: 3,
        zeroPad: 0
      }),
      frameRate: 10,
      repeat: -1
    });
    anims.create({
      key: 'front-hit',
      frames: anims.generateFrameNames('playerSprite', {
        prefix: 'hit.front.',
        start: 0,
        end: 2,
        zeroPad: 0
      }),
      frameRate: 10,
      repeat: 0
    });
    anims.create({
      key: 'back',
      frames: anims.generateFrameNames('playerSprite', {
        prefix: 'sprite.back.',
        start: 0,
        end: 3,
        zeroPad: 0
      }),
      frameRate: 10,
      repeat: -1
    });
    anims.create({
      key: 'back-hit',
      frames: anims.generateFrameNames('playerSprite', {
        prefix: 'hit.back.',
        start: 0,
        end: 2,
        zeroPad: 0
      }),
      frameRate: 10,
      repeat: 0
    });
    anims.create({
      key: 'box',
      frames: anims.generateFrameNames('playerSprite', {
        prefix: 'box.',
        start: 0,
        end: 0,
        zeroPad: 0
      }),
      frameRate: 10,
      repeat: 0
    });
    anims.create({
      key: 'trap',
      frames: anims.generateFrameNames('playerSprite', {
        prefix: 'trap_back.',
        start: 0,
        end: 1,
        zeroPad: 0
      }),
      frameRate: 15,
      repeat: 0
    });
    anims.create({
      key: 'overlay',
      frames: anims.generateFrameNames('overlays', {
        prefix: 'overlay',
        start: 1,
        end: 3,
        zeroPad: 1
      }),
      frameRate: 5,
      repeat: -1
    });
    anims.create({
      key: 'shine',
      frames: anims.generateFrameNames('effects', {
        prefix: 'shine.',
        start: 0,
        end: 5,
        zeroPad: 0
      }),
      frameRate: 10,
      repeat: -1,
      repeatDelay: 1 * 1000
    });
    anims.create({
      key: 'escaped-message-draw',
      frames: anims.generateFrameNames('escaped_message', {
        prefix: 'escaped_message.',
        start: 0,
        end: 9,
        zeroPad: 0
      }),
      frameRate: 4,
      repeat: 0
    });
    anims.create({
      key: 'escaped-message-loop',
      frames: anims.generateFrameNames('escaped_message', {
        prefix: 'escaped_message.',
        start: 8,
        end: 9,
        zeroPad: 0
      }),
      frameRate: 3,
      repeat: -1
    });
  }

}