import { AppConfig } from "./config";
import { ChatInterface, ChatOptions, GenerateProgressCallback, InitProgressCallback, InitProgressReport } from "./types";
/**
 * Message kind used by worker
 */
type RequestKind = ("return" | "throw" | "reload" | "generate" | "runtimeStatsText" | "interruptGenerate" | "unload" | "resetChat" | "initProgressCallback" | "generateProgressCallback" | "getMaxStorageBufferBindingSize" | "getGPUVendor" | "forwardTokensAndSample" | "customRequest");
interface ReloadParams {
    localIdOrUrl: string;
    chatOpts?: ChatOptions;
    appConfig?: AppConfig;
}
interface GenerateParams {
    input: string;
    streamInterval?: number;
}
interface ResetChatParams {
    keepStats: boolean;
}
interface GenerateProgressCallbackParams {
    step: number;
    currentMessage: string;
}
interface ForwardTokensAndSampleParams {
    inputIds: Array<number>;
    curPos: number;
    isPrefill: boolean;
}
export interface CustomRequestParams {
    requestName: string;
    requestMessage: string;
}
type MessageContent = GenerateProgressCallbackParams | ReloadParams | GenerateParams | ResetChatParams | ForwardTokensAndSampleParams | CustomRequestParams | InitProgressReport | string | null | number;
/**
 * The message used in exchange between worker
 * and the main thread.
 */
export interface WorkerMessage {
    kind: RequestKind;
    uuid: string;
    content: MessageContent;
}
/**
 * Worker handler that can be used in a WebWorker
 *
 * @example
 *
 * // setup a chat worker handler that routes
 * // requests to the chat
 * const chat = new ChatModule();
 * cont handler = new ChatWorkerHandler(chat);
 * onmessage = handler.onmessage;
 */
export declare class ChatWorkerHandler {
    protected chat: ChatInterface;
    constructor(chat: ChatInterface);
    handleTask<T extends MessageContent>(uuid: string, task: () => Promise<T>): Promise<void>;
    onmessage(event: MessageEvent): void;
}
interface ChatWorker {
    onmessage: any;
    postMessage: (message: any) => void;
}
/**
 * A client of chat worker that exposes the chat interface
 *
 * @example
 *
 * const chat = new webllm.ChatWorkerClient(new Worker(
 *   new URL('./worker.ts', import.meta.url),
 *   {type: 'module'}
 * ));
 */
export declare class ChatWorkerClient implements ChatInterface {
    worker: ChatWorker;
    private initProgressCallback?;
    private generateCallbackRegistry;
    private pendingPromise;
    constructor(worker: any);
    setInitProgressCallback(initProgressCallback: InitProgressCallback): void;
    protected getPromise<T extends MessageContent>(msg: WorkerMessage): Promise<T>;
    reload(localIdOrUrl: string, chatOpts?: ChatOptions, appConfig?: AppConfig): Promise<void>;
    getMaxStorageBufferBindingSize(): Promise<number>;
    getGPUVendor(): Promise<string>;
    generate(input: string, progressCallback?: GenerateProgressCallback, streamInterval?: number): Promise<string>;
    runtimeStatsText(): Promise<string>;
    interruptGenerate(): void;
    unload(): Promise<void>;
    resetChat(keepStats?: boolean): Promise<void>;
    forwardTokensAndSample(inputIds: Array<number>, curPos: number, isPrefill: boolean): Promise<number>;
    onmessage(event: any): void;
}
export {};
//# sourceMappingURL=web_worker.d.ts.map