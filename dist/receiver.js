"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Receiver = void 0;
const dgram_1 = require("dgram");
const events_1 = require("events");
const assert_1 = require("assert");
const packet_1 = require("./packet");
const util_1 = require("./util");
class Receiver extends events_1.EventEmitter {
    constructor({ universes = [1], port = 5568, iface = undefined, reuseAddr = false, }) {
        super();
        this.universes = universes;
        this.port = port;
        this.iface = iface;
        this.socket = dgram_1.createSocket({ type: 'udp4', reuseAddr });
        this.lastSequence = {};
        this.socket.on('message', (msg, rinfo) => {
            try {
                const packet = new packet_1.Packet(msg, rinfo.address);
                // somehow we received a packet for a universe we're not listening to
                // silently drop this packet
                if (!this.universes.includes(packet.universe))
                    return;
                if (this.lastSequence[packet.universe] &&
                    Math.abs(this.lastSequence[packet.universe] - packet.sequence) > 20) {
                    throw new Error(`Packet significantly out of order in universe ${packet.universe} (${this.lastSequence[packet.universe]} -> ${packet.sequence})`);
                }
                this.lastSequence[packet.universe] =
                    packet.sequence === 255 ? -1 : packet.sequence;
                this.emit('packet', packet);
            }
            catch (err) {
                const event = err instanceof assert_1.AssertionError
                    ? 'PacketCorruption'
                    : 'PacketOutOfOrder';
                this.emit(event, err);
            }
        });
        this.socket.bind(this.port, () => {
            for (const uni of this.universes) {
                try {
                    this.socket.addMembership(util_1.multicastGroup(uni), this.iface);
                }
                catch (err) {
                    this.emit('error', err); // emit errors from socket.addMembership
                }
            }
        });
    }
    addUniverse(universe) {
        // already listening to this one; do nothing
        if (this.universes.includes(universe))
            return this;
        this.socket.addMembership(util_1.multicastGroup(universe), this.iface);
        this.universes.push(universe);
        return this;
    }
    removeUniverse(universe) {
        // not listening to this one; do nothing
        if (!this.universes.includes(universe))
            return this;
        this.socket.dropMembership(util_1.multicastGroup(universe), this.iface);
        this.universes = this.universes.filter((n) => n !== universe);
        return this;
    }
    close(callback) {
        this.socket.close(callback);
        return this;
    }
}
exports.Receiver = Receiver;
