import { Readable, Writable } from 'stream';

export interface McpRequest {
    id: string | number;
    method: string;
    params?: Record<string, any>;
}

export interface McpResponse {
    id: string | number;
    result?: any;
    error?: {
        message: string;
        code?: number;
        data?: any;
    };
}

export interface McpSessionStreams {
    input: Readable;
    output: Writable;
}

export interface McpSessionConfig {
    enabledTools: Set<string>;
}
