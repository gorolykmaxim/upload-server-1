import {Command} from "../command";
import {Observable, Subscriber} from "rxjs";
import {JsonDB} from "node-json-db";
import {ArgumentError} from "common-errors";

/**
 * Name, to which {@link ReadConfig} command is assigned to.
 */
export const READ_CONFIG: string = 'read config';

/**
 * Arguments, that can be passed to {@link ReadConfig}.
 */
export interface ReadConfigArgs {
    /**
     * JSON path, by which a data is located in the config.
     * In a config like {"a":{"b":{"c":"d", "e":15}}}
     * value of e can be accessed with path: "/a/b/e".
     * The entire "b" data structure can also be read.
     */
    path: string
}

/**
 * Read data from the config.
 */
export class ReadConfig extends Command {
    /**
     * Construct a command.
     *
     * @param config config, that houses the data
     */
    constructor(private config: JsonDB) {
        super();
    }

    /**
     * {@inheritDoc}
     */
    async execute(output: Subscriber<any>, args?: any, input?: Observable<any>): Promise<void> {
        const a: ReadConfigArgs = args;
        if (!a || !a.path) {
            throw new ArgumentError('path');
        }
        output.next(this.config.getData(a.path));
    }
}
