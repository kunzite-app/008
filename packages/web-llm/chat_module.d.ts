import { ChatOptions, AppConfig, GenerationConfig } from "./config";
import { ChatCompletionRequest, ChatCompletion, ChatCompletionChunk, ChatCompletionFinishReason, ChatCompletionRequestNonStreaming, ChatCompletionRequestStreaming, ChatCompletionRequestBase } from "./openai_api_protocols/index";
import { InitProgressCallback, ChatInterface, GenerateProgressCallback, LogitProcessor } from "./types";
/**
 * This is the main interface to the chat module.
 */
export declare class ChatModule implements ChatInterface {
    private currentModelId?;
    private logger;
    private logitProcessorRegistry?;
    private logitProcessor?;
    private pipeline?;
    private initProgressCallback?;
    private interruptSignal;
    private deviceLostIsError;
    private config?;
    constructor(logitProcessorRegistry?: Map<string, LogitProcessor>);
    setInitProgressCallback(initProgressCallback: InitProgressCallback): void;
    reload(modelId: string, chatOpts?: ChatOptions, appConfig?: AppConfig): Promise<void>;
    generate(input: string | ChatCompletionRequestNonStreaming, progressCallback?: GenerateProgressCallback, streamInterval?: number, genConfig?: GenerationConfig): Promise<string>;
    /**
     * Similar to `generate()`; but instead of using callback, we use an async iterable.
     * @param request Request for chat completion.
     * @param genConfig Generation config extraced from `request`.
     */
    chatCompletionAsyncChunkGenerator(request: ChatCompletionRequestStreaming, genConfig: GenerationConfig): AsyncGenerator<ChatCompletionChunk, void, void>;
    /**
     * Completes a single ChatCompletionRequest.
     *
     * @param request A OpenAI-style ChatCompletion request.
     *
     * @note For each choice (i.e. `n`), a request is defined by a single `prefill()` and mulitple
     * `decode()`. This is important as it determines the behavior of various fields including `seed`.
     */
    chatCompletion(request: ChatCompletionRequestNonStreaming): Promise<ChatCompletion>;
    chatCompletion(request: ChatCompletionRequestStreaming): Promise<AsyncIterable<ChatCompletionChunk>>;
    chatCompletion(request: ChatCompletionRequestBase): Promise<AsyncIterable<ChatCompletionChunk> | ChatCompletion>;
    interruptGenerate(): Promise<void>;
    runtimeStatsText(): Promise<string>;
    resetChat(keepStats?: boolean): Promise<void>;
    unload(): Promise<void>;
    getMaxStorageBufferBindingSize(): Promise<number>;
    getGPUVendor(): Promise<string>;
    forwardTokensAndSample(inputIds: Array<number>, isPrefill: boolean): Promise<number>;
    /**
     * @returns Whether the generation stopped.
     */
    stopped(): boolean;
    /**
     * @returns Finish reason; undefined if generation not started/stopped yet.
    */
    getFinishReason(): ChatCompletionFinishReason | undefined;
    /**
     * Get the current generated response.
     *
     * @returns The current output message.
     */
    getMessage(): Promise<string>;
    /**
     * Get a new Conversation object based on the chat completion request.
     *
     * @param request The incoming ChatCompletionRequest
     * @note `request.messages[-1]` is not included as it would be treated as a normal input to
     * `prefill()`.
     */
    private getConversationFromChatCompletionRequest;
    /**
     * Returns the function string based on the request.tools and request.tool_choice, raises erros if
     * encounter invalid request.
     *
     * @param request The chatCompletionRequest we are about to prefill for.
     * @returns The string used to set Conversatoin.function_string
     */
    private getFunctionCallUsage;
    /**
     * Run a prefill step with a given input.
     *
     * If `input` is a chatCompletionRequest, we treat `input.messages[-1]` as the usual user input.
     * We then convert `input.messages[:-1]` to a `Conversation` object, representing a conversation
     * history.
     *
     * If the new `Conversation` object matches the current one loaded, it means we are
     * performing multi-round chatting, so we do not reset, hence reusing KV cache. Otherwise, we
     * reset every thing, treating the request as something completely new.
     *
     * @param input The input prompt, or `messages` in OpenAI-like APIs.
     */
    prefill(input: string | ChatCompletionRequest, genConfig?: GenerationConfig): Promise<void>;
    /**
     * Run a decode step to decode the next token.
     */
    decode(genConfig?: GenerationConfig): Promise<void>;
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
    reload(modelId: string, chatOpts?: ChatOptions, appConfig?: AppConfig): Promise<void>;
    getMaxStorageBufferBindingSize(): Promise<number>;
    getGPUVendor(): Promise<string>;
    getMessage(): Promise<string>;
    unload(): Promise<void>;
    interruptGenerate(): Promise<void>;
    forwardTokensAndSample(inputIds: Array<number>, isPrefill: boolean): Promise<number>;
    chatCompletion(request: ChatCompletionRequestNonStreaming): Promise<ChatCompletion>;
    chatCompletion(request: ChatCompletionRequestStreaming): Promise<AsyncIterable<ChatCompletionChunk>>;
    chatCompletion(request: ChatCompletionRequestBase): Promise<AsyncIterable<ChatCompletionChunk> | ChatCompletion>;
    generate(input: string | ChatCompletionRequestNonStreaming, progressCallback?: GenerateProgressCallback, streamInterval?: number, genConfig?: GenerationConfig): Promise<string>;
    runtimeStatsText(): Promise<string>;
    resetChat(keepStats?: boolean): Promise<void>;
}
//# sourceMappingURL=chat_module.d.ts.map