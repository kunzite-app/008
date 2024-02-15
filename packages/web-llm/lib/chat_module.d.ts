import { AppConfig } from "./config";
import { InitProgressCallback, ChatInterface, ChatOptions, GenerateProgressCallback, LogitProcessor } from "./types";
/**
 * This is the main interface to the chat module.
 */
export declare class ChatModule implements ChatInterface {
    private logger;
    private logitProcessorRegistry?;
    private logitProcessor?;
    private pipeline?;
    private initProgressCallback?;
    private interruptSignal;
    private deviceLostIsError;
    constructor(logitProcessorRegistry?: Map<string, LogitProcessor>);
    setInitProgressCallback(initProgressCallback: InitProgressCallback): void;
    reload(localId: string, chatOpts?: ChatOptions, appConfig?: AppConfig): Promise<void>;
    generate(input: string, progressCallback?: GenerateProgressCallback, streamInterval?: number): Promise<string>;
    interruptGenerate(): Promise<void>;
    runtimeStatsText(): Promise<string>;
    resetChat(keepStats?: boolean): Promise<void>;
    unload(): Promise<void>;
    getMaxStorageBufferBindingSize(): Promise<number>;
    getGPUVendor(): Promise<string>;
    forwardTokensAndSample(inputIds: Array<number>, curPos: number, isPrefill: boolean): Promise<number>;
    /**
     * @returns Whether the generation stopped.
     */
    stopped(): boolean;
    /**
     * Get the current generated response.
     *
     * @returns The current output message.
     */
    getMessage(): string;
    /**
     * Run a prefill step with a given input.
     * @param input The input prompt.
     */
    prefill(input: string): Promise<void>;
    /**
     * Run a decode step to decode the next token.
     */
    decode(): Promise<void>;
    private getPipeline;
    private asyncLoadTokenizer;
}
/**
 * This is the interface to the chat module that connects to the REST API.
 */
export declare class ChatRestModule implements ChatInterface {
    private logger;
    private initProgressCallback?;
    setInitProgressCallback(initProgressCallback: InitProgressCallback): void;
    reload(localId: string, chatOpts?: ChatOptions, appConfig?: AppConfig): Promise<void>;
    getMaxStorageBufferBindingSize(): Promise<number>;
    getGPUVendor(): Promise<string>;
    unload(): Promise<void>;
    interruptGenerate(): Promise<void>;
    forwardTokensAndSample(inputIds: Array<number>, curPos: number, isPrefill: boolean): Promise<number>;
    generate(input: string, progressCallback?: GenerateProgressCallback, streamInterval?: number): Promise<string>;
    runtimeStatsText(): Promise<string>;
    resetChat(keepStats?: boolean): Promise<void>;
}
export declare function hasModelInCache(localId: string, appConfig?: AppConfig): Promise<boolean>;
//# sourceMappingURL=chat_module.d.ts.map