/**
 * this is the low-level implementation of the E1.31 (sACN) protocol
 */
/// <reference types="node" />
export interface Options {
    universe: Packet['universe'];
    payload: Packet['payload'];
    sequence: Packet['sequence'];
    sourceName?: Packet['sourceName'];
    priority?: Packet['priority'];
    cid?: Packet['cid'];
}
/**
 * This constructs a sACN Packet, either from an
 * existing `Buffer` or from `Options`.
 */
export declare class Packet {
    readonly sourceAddress?: string;
    private readonly root_vector;
    private readonly root_fl;
    private readonly preambleSize;
    private readonly postambleSize;
    private readonly acnPid;
    readonly cid: Buffer;
    private readonly frame_vector;
    private readonly frame_fl;
    readonly options: number;
    readonly sequence: number;
    readonly sourceName: string;
    readonly priority: number;
    readonly syncUniverse: number;
    readonly universe: number;
    private readonly dmp_vector;
    private readonly dmp_fl;
    private readonly type;
    private readonly firstAddress;
    private readonly addressIncrement;
    readonly propertyValueCount: number;
    private readonly startCode;
    private readonly privatePayload;
    constructor(input: Buffer | Options, sourceAddress?: string);
    get payload(): Record<number, number>;
    get payloadAsBuffer(): Buffer;
    get payloadAsRawArray(): Array<number>;
    get buffer(): Buffer;
}
