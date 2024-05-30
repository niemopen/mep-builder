"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GTRIService = void 0;
const common_1 = require("@nestjs/common");
const baseURL = 'https://tools.niem.gov/api/v2';
let GTRIService = class GTRIService {
    async transformModel(from, to, file) {
        var axios = require('axios');
        var FormData = require('form-data');
        var fs = require('fs');
        function bufferToStream(binary) {
            const { Readable } = require('stream');
            return new Readable({
                read() {
                    this.push(binary);
                    this.push(null);
                },
            });
        }
        console.log('fileTypeisBuffer?: ', Buffer.isBuffer(file));
        const { writeFile } = require('fs').promises;
        await writeFile('temp.zip', file);
        var stream = bufferToStream(file);
        console.log('is stream readable? : ', stream.readable);
        var data = new FormData();
        data.append('from', from);
        data.append('to', to);
        data.append('file', fs.createReadStream('temp.zip'));
        var config = {
            method: 'post',
            url: 'https://tools.niem.gov/api/v2/transforms/models',
            headers: Object.assign({}, data.getHeaders()),
            data: data,
        };
        return await axios(config)
            .then(function (response) {
            return JSON.stringify(response.data);
        })
            .catch(function (error) {
            console.log(error);
            return false;
        });
    }
};
GTRIService = __decorate([
    (0, common_1.Injectable)()
], GTRIService);
exports.GTRIService = GTRIService;
//# sourceMappingURL=gtri.service%20copy.js.map