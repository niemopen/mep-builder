"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeCommonNIEMComponentSchema = void 0;
const mongoose = require("mongoose");
exports.TypeCommonNIEMComponentSchema = new mongoose.Schema({
    ns_prefix: String,
    type_name: String,
    definition: String,
});
//# sourceMappingURL=typecommonniemcomponent.schema.js.map