import { ConvTemplateConfig } from "./config";
/**
 * Helper to keep track of history conversations.
 */
export declare class Conversation {
    messages: Array<[string, string | undefined]>;
    config: ConvTemplateConfig;
    constructor(config: ConvTemplateConfig);
    private getPromptArrayInternal;
    /**
     * Get prompt arrays with the first one as system.
     *
     * @returns The prompt array.
     */
    getPromptArray(): Array<string>;
    /**
     * Get the last round of prompt has not been fed as input.
     *
     * @note This function needs to be used with the assumption that
     *       the caller call appendMessage then appendReplyHeader.
     *
     * @returns The prompt array.
     */
    getPrompArrayLastRound(): string[];
    reset(): void;
    getStopStr(): string;
    getStopTokens(): number[];
    appendMessage(role: string, message: string): void;
    appendReplyHeader(role: string): void;
    finishReply(message: string): void;
}
export declare function getConversation(conv_template: string, conv_config?: Partial<ConvTemplateConfig>): Conversation;
//# sourceMappingURL=conversation.d.ts.map