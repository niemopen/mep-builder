"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyCommonNIEMComponentSchema = void 0;
const mongoose = require("mongoose");
exports.PropertyCommonNIEMComponentSchema = new mongoose.Schema({
    ns_prefix: String,
    parent_property_name: String,
    property_name: String,
    type_prefix: String,
    type_name: String,
    definition: String,
});
//# sourceMappingURL=propertycommonniemcomponent.schema.js.map