"use strict";
/**
 * this is the low-level implementation of the E1.31 (sACN) protocol
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Packet = void 0;
const assert = require("assert");
const util_1 = require("./util");
const constants_1 = require("./constants");
/**
 * This constructs a sACN Packet, either from an
 * existing `Buffer` or from `Options`.
 */
class Packet {
    constructor(input, sourceAddress) {
        this.sourceAddress = sourceAddress;
        /* root layer */
        this.root_vector = constants_1.RootVector.DATA;
        this.preambleSize = 0x0010; // =16 (unit16 hence the redundant 00s)
        this.postambleSize = 0;
        this.acnPid = constants_1.ACN_PID;
        /* framing layer */
        this.frame_vector = constants_1.FrameVector.DATA;
        /* DMP layer */
        this.dmp_vector = constants_1.DmpVector.DATA;
        this.type = 0xa1; // = 61
        this.firstAddress = 0;
        this.addressIncrement = 1;
        this.startCode = 0;
        if (!input)
            throw new Error('Buffer packet instantiated with no value');
        if (input instanceof Buffer) {
            const buf = input;
            // If a buffer is supplied, ascertain that the packet implements ACN
            // correctly, and that is it a data packet. Also asceratain that the
            // UDP overhead is valid. Then fill up the class values.
            /* root layer */
            assert.strictEqual(buf.readUInt32BE(18), this.root_vector);
            this.root_fl = buf.readUInt16BE(16);
            assert.deepStrictEqual(buf.slice(4, 16), this.acnPid);
            assert.strictEqual(buf.readUInt16BE(0), this.preambleSize);
            assert.strictEqual(buf.readUInt16BE(2), this.postambleSize);
            this.cid = buf.slice(22, 38);
            /* frame layer */
            assert.strictEqual(buf.readUInt32BE(40), this.frame_vector);
            this.frame_fl = buf.readUInt16BE(38);
            this.options = buf.readUInt8(112);
            this.sequence = buf.readUInt8(111);
            this.sourceName = buf.toString('ascii', 44, 107).replace(/\x00/g, '');
            this.priority = buf.readUInt8(108);
            this.syncUniverse = buf.readUInt16BE(109);
            this.universe = buf.readUInt16BE(113);
            /* DMP layer */
            assert.strictEqual(buf.readUInt8(117), this.dmp_vector);
            this.dmp_fl = buf.readUInt16BE(115);
            assert.strictEqual(buf.readUInt8(118), this.type);
            assert.strictEqual(buf.readUInt16BE(119), this.firstAddress);
            assert.strictEqual(buf.readUInt16BE(121), this.addressIncrement);
            this.propertyValueCount = buf.readUInt16BE(123);
            assert.strictEqual(buf.readUInt8(125), this.startCode);
            this.privatePayload = buf.slice(126);
        }
        else {
            // if input is not a buffer
            const options = input;
            // set constants
            this.preambleSize = 0x0010;
            this.root_fl = 0x726e;
            this.frame_fl = 0x7258;
            this.dmp_fl = 0x720b;
            this.syncUniverse = 0; // we as a sender don't implement this
            this.options = 0; // TODO: can we just set to 0?
            // set properties
            this.privatePayload = options.payload;
            this.sourceName = options.sourceName || 'sACN nodejs';
            this.priority = options.priority || 100;
            this.sequence = options.sequence;
            this.universe = options.universe;
            this.cid = options.cid || constants_1.DEFAULT_CID;
            // set computed properties
            this.propertyValueCount = 0x0201; // "Indicates 1+ the number of slots in packet"
            // We set the highest possible value (1+512) so that channels with zero values are
            // treated as deliberately 0 (cf. undefined)
        }
    }
    get payload() {
        return this.privatePayload instanceof Buffer
            ? util_1.objectify(this.privatePayload)
            : this.privatePayload;
    }
    get payloadAsBuffer() {
        return this.privatePayload instanceof Buffer ? this.privatePayload : null;
    }
    get payloadAsRawArray() {
        if (!(this.privatePayload instanceof Buffer)) {
            return null;
        }
        const data = [];
        this.privatePayload.forEach((value, channel) => {
            data[channel] = value;
        });
        return data;
    }
    get buffer() {
        const sourceNameBuf = Buffer.from(this.sourceName.padEnd(64, '\0'));
        const n = [].concat(
        /* root layer */
        util_1.bit(16, this.preambleSize), // 0,1 = preable size
        util_1.bit(16, this.postambleSize), // 2,3 = postamble size
        [...this.acnPid], util_1.bit(16, this.root_fl), // 16,17 = root fl
        util_1.bit(32, this.root_vector), // 18,19,20,21 = Root_vector
        [...this.cid], // 22-37 = cid
        /* framing layer */
        util_1.bit(16, this.frame_fl), // 38,39 = frame fl
        util_1.bit(32, this.frame_vector), // 40,41,42,43 = frame vector
        [...sourceNameBuf], // 44 - 107 = sourceName
        util_1.bit(8, this.priority), // 108 = priority (8bit)
        util_1.bit(16, this.syncUniverse), // 109,110 = syncUniverse
        util_1.bit(8, this.sequence), // 111 = sequence
        util_1.bit(8, this.options), // 112 = options
        util_1.bit(16, this.universe), // 113,114 = universe
        /* DMP layer */
        util_1.bit(16, this.dmp_fl), // 115,116 = dmp_fl
        util_1.bit(8, this.dmp_vector), // 117 = dmp vector
        util_1.bit(8, this.type), // 118 = type
        util_1.bit(16, this.firstAddress), // 119,120 = first adddress
        util_1.bit(16, this.addressIncrement), // 121,122 = addressIncrement
        util_1.bit(16, this.propertyValueCount), // 123,124 = propertyValueCount
        util_1.bit(8, this.startCode), // 125 = startCode
        util_1.empty(512));
        for (const ch in this.payload) {
            if (+ch >= 1 && +ch <= 512) {
                n[125 + +ch] = util_1.inRange(this.payload[ch] * 2.55);
            }
        }
        return Buffer.from(n);
    }
}
exports.Packet = Packet;
