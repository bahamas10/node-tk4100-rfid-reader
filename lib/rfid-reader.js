/**
 * Read data from a keyboard device
 * Basically ripped off from:
 * https://github.com/maddox/magic-cards/blob/master/scanner/scanner.js
 *
 * Author: Dave Eddy <dave@daveeddy.com>
 * Date: July 16, 2018
 * License: MIT
 */

var assert = require('assert-plus');
var InputEvent = require('input-event');

var EventEmitter = require('events').EventEmitter;
var util = require('util');

var RFID_KEYS = 'X^1234567890XXXXqwertzuiopXXXXasdfghjklXXXXXyxcvbnmXXXXXXXXXXXXXXXXXXXXXXX';

module.exports = RFIDReader;

/*
 * Example
 *
 * var rr = new RFIDReader({
 *    device: '/dev/input/event0',
 *    maxLength: 32 // max key length, defaults to 32, set to 0 to disable
 * });
 *
 * rr.on('tag', function (tag) {
 *     // tag => "38ef00ab"
 * });
 *
 * rr.on('error', function (err) {
 *     // error was encountered while reading
 * });
 *
 **/
function RFIDReader(opts) {
    var self = this;

    EventEmitter.call(self);

    assert.object(opts, 'opts');
    assert.string(opts.device, 'opts.device');
    assert.optionalNumber(opts.maxLength, 'opts.maxLength');

    self.device = opts.device;
    self.maxLength = opts.hasOwnProperty('maxLength') ? opts.maxLength : 32;

    var input = new InputEvent(opts.device);
    var keyboard = new InputEvent.Keyboard(input);

    var keys = [];
    var tag;
    keyboard.on('keyup', function (ev) {
        switch (ev.code) {
        case 28: // Enter
            tag = keys.join('');
            keys = [];

            self.emit('tag', tag);
            break;
        default:
            keys.push(RFID_KEYS[ev.code]);
            if (keys.length > self.maxLength) {
                var err = new Error('maxLength exceeded');
                self.emit('error', err);
                keys = [];
            }
            break;
        }
    });
}
util.inherits(RFIDReader, EventEmitter);
