"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sender = void 0;
const dgram_1 = require("dgram");
const util_1 = require("./util");
const packet_1 = require("./packet");
class Sender {
    constructor({ universe, port = 5568, reuseAddr = false }) {
        this.sequence = 0;
        this.port = port;
        this.universe = universe;
        this.multicastDest = util_1.multicastGroup(universe);
        this.socket = dgram_1.createSocket({ type: 'udp4', reuseAddr });
    }
    send(packet) {
        return new Promise((resolve, reject) => {
            const { buffer } = new packet_1.Packet(Object.assign(Object.assign({}, packet), { universe: this.universe, sequence: this.sequence }));
            this.sequence = (this.sequence + 1) % 256;
            this.socket.send(buffer, this.port, this.multicastDest, (err) => err ? reject(err) : resolve());
        });
    }
    close() {
        this.socket.close();
        return this;
    }
}
exports.Sender = Sender;
