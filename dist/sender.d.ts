import { Options } from './packet';
interface Props {
    universe: number;
    port?: number;
    reuseAddr?: boolean;
}
export declare class Sender {
    private socket;
    private readonly port;
    readonly universe: Props['universe'];
    private readonly multicastDest;
    private sequence;
    constructor({ universe, port, reuseAddr }: Props);
    send(packet: Omit<Options, 'sequence' | 'universe'>): Promise<void>;
    close(): this;
}
export {};
