import {LogFilePool} from "../log/log-file-pool";
import {WatcherFactory} from "../watcher/watcher-factory";
import {Watcher} from "../watcher/watcher";
import {LogFile} from "../log/log-file";
import {ArgumentError} from "common-errors";
import {webSocketToString} from "../../common/web-socket";
import {Request} from "express";
import {LogFileAccessError} from "../log/restricted-log-file-pool";
import {WebSocketEndpoint} from "../../common/api/endpoint";
import WebSocket = require("ws");

/**
 * Current web-socket API of upload-server, used to obtain information about changes in log files in a real time.
 */
export class DefaultWebSocketAPI implements WebSocketEndpoint {
    /**
     * Construct an API.
     *
     * @param logFilePool pool of log files, where the API will look for logs to watches changes in
     * @param watcherFactory factory, that will be used by the API to create watchers for all new client connections
     */
    constructor(private logFilePool: LogFilePool, private watcherFactory: WatcherFactory) {
    }

    /**
     * {@inheritDoc}
     */
    async process(connection: WebSocket, request: Request): Promise<void> {
        let watcher: Watcher;
        let logFile: LogFile;
        try {
            console.info("%s got a new connection %s with query %s. Going to start watching a log file immediately.", this, webSocketToString(connection), JSON.stringify(request.query));
            watcher = this.watcherFactory.create(connection);
            connection.on('close', () => this.onConnectionClosed(watcher));
            const absoluteLogFilePath: string = request.query.absolutePath;
            if (!absoluteLogFilePath) {
                throw new ArgumentError('absolutePath');
            }
            const fromStart = request.query.fromStart || false;
            logFile = await this.logFilePool.getLog(absoluteLogFilePath);
            if (fromStart) {
                await watcher.watchFromTheBeginning(logFile);
            } else {
                await watcher.watchLog(logFile);
            }
        } catch (e) {
            if (e instanceof LogFileAccessError) {
                connection.close(1008, e.message);
            } else {
                watcher?.notifyAboutError(e);
            }
        }
    }

    private async onConnectionClosed(watcher: Watcher): Promise<void> {
        console.info("%s has disconnected from %s. Going to dispose all of it's logs if nobody else watches them", watcher, this);
        const freedLogFiles: Array<LogFile> = await watcher.stopWatchingLogs();
        await this.logFilePool.disposeAllIfNecessary(freedLogFiles);
    }

    /**
     * {@inheritDoc}
     */
    toString() {
        return "DefaultWebSocketAPI{}";
    }
}