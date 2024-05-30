/// <reference types="node" />
export declare class FileBlobClass {
    protected buffer: string | Buffer;
    protected originalname: string;
    protected fieldname: string;
    protected encoding: string;
    protected size: string;
    constructor(buffer: string | Buffer, originalname: string, fieldname?: string, encoding?: string, size?: string);
}
