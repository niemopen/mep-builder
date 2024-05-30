"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSGTService = void 0;
const common_1 = require("@nestjs/common");
const error_log_service_1 = require("../error/error.log.service");
const axios_1 = require("axios");
const xmlbuilder2_1 = require("xmlbuilder2");
let SSGTService = class SSGTService {
    constructor(ErrorLogService) {
        this.ErrorLogService = ErrorLogService;
    }
    async search(SSGTDTO) {
        const xmls = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:nm="http://niem.gov/ws/schemas">\
      <soapenv:Header/>\
       <soapenv:Body>\
          <nm:SearchRequest>\
             <nm:Type>\
                <nm:Value>' +
            SSGTDTO.value +
            '</nm:Value>\
             </nm:Type>\
             <nm:SearchString>\
                <nm:Value>' +
            SSGTDTO.searchString +
            '</nm:Value>\
             </nm:SearchString>\
             <nm:Release>\
        <nm:Value>' +
            SSGTDTO.release +
            '</nm:Value>\
        </nm:Release>\
          </nm:SearchRequest>\
       </soapenv:Body>\
    </soapenv:Envelope>';
        const xmlStr = await axios_1.default
            .post('https://tools.niem.gov/niemtools/ws/search/', xmls, {
            headers: { 'Content-Type': 'text/xml' },
        })
            .then((res) => {
            return res.data;
        })
            .catch((err) => {
            return console.log(err.response.data);
        });
        return (0, xmlbuilder2_1.convert)(xmlStr, { format: 'object' });
    }
    async getElement(SSGTDTO) {
        const xmls = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:nm="http://niem.gov/ws/schemas">\
            <soapenv:Header/>\
            <soapenv:Body>\
            <nm:GetElementRequest>\
                <nm:ID>\
                    <nm:Value>' +
            SSGTDTO.value +
            '</nm:Value>\
                </nm:ID>\
                <nm:Release>\
                    <nm:Value>' +
            SSGTDTO.release +
            '</nm:Value>\
                </nm:Release>\
            </nm:GetElementRequest>\
            </soapenv:Body>\
        </soapenv:Envelope>';
        const xmlStr = await axios_1.default
            .post('https://tools.niem.gov/niemtools/ws/search/', xmls, {
            headers: { 'Content-Type': 'text/xml' },
        })
            .then((res) => {
            return res.data;
        })
            .catch((err) => {
            return console.log(err.response.data);
        });
        return (0, xmlbuilder2_1.convert)(xmlStr, { format: 'object' });
    }
    async getElementType(SSGTDTO) {
        const xmls = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:sch="http://niem.gov/ws/schemas">\
            <soapenv:Header/>\
            <soapenv:Body>\
            <sch:GetElementRequest>\
                <sch:ID>\
                    <sch:Value>' +
            SSGTDTO.value +
            'Type\
    </sch:Value>\
                </sch:ID>\
            </sch:GetElementRequest>\
            </soapenv:Body>\
        </soapenv:Envelope>';
        const xmlStr = await axios_1.default
            .post('https://tools.niem.gov/niemtools/ws/search/', xmls, {
            headers: { 'Content-Type': 'text/xml' },
        })
            .then((res) => {
            return res.data;
        })
            .catch((err) => {
            return console.log(err.response.data);
        });
        return (0, xmlbuilder2_1.convert)(xmlStr, { format: 'object' });
    }
    async getSubsetSchema(SSGTDTO) {
        const xmls = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:nm="http://niem.gov/ws/schemas">\
        <soapenv:Header/>\
            <soapenv:Body>\
                <nm:GenerateSchemaRequest>\
                    <nm:WantList>\
                        <nm:DataFile>' +
            SSGTDTO.wantlist +
            '</nm:DataFile>\
                    </nm:WantList>\
                    <nm:IncludeWantList>\
                        <nm:Value>' +
            SSGTDTO.includeWantlist +
            '</nm:Value>\
                    </nm:IncludeWantList>\
                    <nm:IncludeDocumentation>\
                        <nm:Value>' +
            SSGTDTO.includeDocumentation +
            '</nm:Value>\
                    </nm:IncludeDocumentation>\
                </nm:GenerateSchemaRequest>\
            </soapenv:Body>\
    </soapenv:Envelope>';
        return await axios_1.default
            .post('https://tools.niem.gov/niemtools/ws/schemagenerator/', xmls, {
            headers: { 'Content-Type': 'text/xml' },
        })
            .then((res) => {
            return {
                isSuccess: true,
                data: (0, xmlbuilder2_1.convert)(res.data, { format: 'object' }),
            };
        })
            .catch(async (error) => {
            return await this.ErrorLogService.errorServiceResponse(error, SSGTDTO.auditUser);
        });
    }
};
SSGTService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [error_log_service_1.ErrorLogService])
], SSGTService);
exports.SSGTService = SSGTService;
//# sourceMappingURL=ssgt.service.js.map