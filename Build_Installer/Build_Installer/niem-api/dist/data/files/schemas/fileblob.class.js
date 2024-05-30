"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileBlobClass = void 0;
class FileBlobClass {
    constructor(buffer, originalname, fieldname = 'file', encoding = null, size = null) {
        this.buffer = buffer;
        this.originalname = originalname;
        this.fieldname = fieldname;
        this.encoding = encoding;
        this.size = size;
    }
}
exports.FileBlobClass = FileBlobClass;
//# sourceMappingURL=fileblob.class.js.map