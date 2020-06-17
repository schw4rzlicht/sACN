/// <reference types="node" />
import { EventEmitter } from 'events';
import { AssertionError } from 'assert';
import { Packet } from './packet';
interface Props {
    universes?: number[];
    port?: number;
    iface?: string;
    reuseAddr?: boolean;
}
export declare interface Receiver {
    on(event: 'packet', listener: (packet: Packet) => void): this;
    on(event: 'PacketCorruption', listener: (err: AssertionError) => void): this;
    on(event: 'PacketOutOfOrder', listener: (err: Error) => void): this;
    on(event: 'error', listener: (err: Error) => void): this;
}
export declare class Receiver extends EventEmitter {
    private socket;
    private lastSequence;
    private readonly port;
    universes: Props['universes'];
    private readonly iface;
    constructor({ universes, port, iface, reuseAddr, }: Props);
    addUniverse(universe: number): this;
    removeUniverse(universe: number): this;
    close(callback?: () => void): this;
}
export {};
