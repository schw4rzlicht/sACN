"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.empty = exports.bit = exports.inRange = exports.objectify = exports.dp = exports.multicastGroup = void 0;
function multicastGroup(universe) {
    if ((universe > 0 && universe <= 63999) || universe === 64214) {
        // eslint-disable-next-line no-bitwise
        return `239.255.${universe >> 8}.${universe & 255}`;
    }
    throw new RangeError('universe must be between 1-63999');
}
exports.multicastGroup = multicastGroup;
exports.dp = (n, decimals = 2) => Math.round(n * Math.pow(10, decimals)) / Math.pow(10, decimals);
function objectify(buf) {
    const data = {};
    buf.forEach((val, ch) => {
        if (val > 0)
            data[ch + 1] = exports.dp(val / 2.55, 2); // rounding to 2dp will not lose any data
    });
    return data;
}
exports.objectify = objectify;
exports.inRange = (n) => Math.min(255, Math.max(Math.round(n), 0));
function bit(bitt, num) {
    // we could just do a _bit_ of shifting here instead :P
    // e.g. (0x1234 >> 8) & 255
    const arr = new ArrayBuffer(bitt / 8);
    // this mutates `arr`
    const view = new DataView(arr);
    view[`setUint${bitt}`](0, num, false); // ByteOffset = 0; litteEndian = false
    return Array.from(new Uint8Array(arr));
}
exports.bit = bit;
exports.empty = (len) => Array.from(new Uint8Array(new ArrayBuffer(len)));
