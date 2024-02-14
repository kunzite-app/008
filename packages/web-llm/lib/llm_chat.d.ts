import * as tvmjs from "tvmjs";
import { Tokenizer } from "@mlc-ai/web-tokenizers";
import { ChatConfig } from "./config";
import { LogitProcessor } from "./types";
export declare class LLMChatPipeline {
    private config;
    private tokenizer;
    private tvm;
    private device;
    private vm;
    private prefill;
    private decoding;
    private fclearKVCaches;
    private params;
    private kvCache;
    private logitsOnCPU?;
    private filledKVCacheLength;
    private bosTokenId;
    private maxWindowLength;
    private slidingWindowSize;
    private attentionSinkSize;
    private prefillChunkSize;
    private resetStatsPerPrefill;
    private stopStr;
    private stopTokens;
    private outputMessage;
    private outputIds;
    private stopTriggered;
    private appearedTokens;
    private conversation;
    private sinkTriggered;
    private slidingWindowCacheOffset;
    private decodingTotalTime;
    private decodingTotalTokens;
    private prefillTotalTime;
    private prefillTotalTokens;
    private logger;
    private logitProcessor?;
    constructor(tvm: tvmjs.Instance, tokenizer: Tokenizer, config: ChatConfig, logitProcessor?: LogitProcessor);
    dispose(): void;
    /**
     * Get the current message.
     */
    getMessage(): string;
    /**
     * Reset the runtime statistics
     */
    resetRuntimeStats(): void;
    /**
     * Reset the chat history
     */
    resetChat(keepStats?: boolean): void;
    /**
     * @returns Whether stop is triggered.
     */
    stopped(): boolean;
    /**
     * @returns Runtime stats information.
     */
    runtimeStatsText(): string;
    asyncLoadWebGPUPipelines(): Promise<void>;
    /**
     * Generate the first token given input prompt
     */
    prefillStep(inp: string): Promise<void>;
    decodeStep(): Promise<void>;
    /**
     * Manually trigger stop if it is not stopped.
     */
    triggerStop(): void;
    /**
     * Add a generated token and check for stop.
     *
     * @param nextToken The next token.
     */
    private processNextToken;
    private forward;
    private updateLogitsOnCPU;
    private sampleTokenFromLogits;
    private getInputTokens;
    forwardTokensAndSample(inputIds: Array<number>, curPos: number, isPrefill: boolean): Promise<number>;
    evaluate(): Promise<void>;
}
//# sourceMappingURL=llm_chat.d.ts.map