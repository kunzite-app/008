/**
 * Conversation template config
 */
export interface ConvTemplateConfig {
    system: string;
    roles: Array<string>;
    seps: Array<string>;
    separator_style: string;
    offset: number;
    stop_str: string;
    add_bos: boolean;
    stop_tokens: Array<number>;
}
/**
 * Config of one chat model
 */
export interface ChatConfig {
    tokenizer_files: Array<string>;
    conv_config?: Partial<ConvTemplateConfig>;
    conv_template: string;
    mean_gen_len: number;
    shift_fill_factor: number;
    repetition_penalty: number;
    top_p: number;
    temperature: number;
}
/**
 * Information for a model.
 * @param model_url: the huggingface link to download the model weights.
 * @param local_id: what we call the model.
 * @param model_lib_url: link to the model library (wasm file) the model uses.
 * @param vram_required_MB: amount of vram in MB required to run the model (can use
 *    `utils/vram_requirements` to calculate).
 * @param low_resource_required: whether the model can run on limited devices (e.g. Android phone).
 * @param required_features: feature needed to run this model (e.g. shader-f16).
 */
export interface ModelRecord {
    model_url: string;
    local_id: string;
    model_lib_url: string;
    vram_required_MB?: number;
    low_resource_required?: boolean;
    required_features?: Array<string>;
}
/**
 * Extra configuration that can be
 * passed to the load.
 *
 * @param model_list: models to be used.
 */
export interface AppConfig {
    model_list: Array<ModelRecord>;
}
/**
 * Default models and model library mapping to be used if unspecified.
 */
export declare const prebuiltAppConfig: AppConfig;
//# sourceMappingURL=config.d.ts.map