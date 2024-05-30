/// <reference types="node" />
import { GTRIService } from './gtri.service';
import { ErrorLogService } from 'src/error/error.log.service';
import { SearchPropertiesDto, SearchTypesDto, ValidationDto } from './dto/gtri.api.2.0.dto';
export declare class GTRIAPIController {
    private readonly GTRIService;
    private ErrorLogService;
    constructor(GTRIService: GTRIService, ErrorLogService: ErrorLogService);
    transformModels(res: any, from: string, to: string, file: Buffer, userId: string): Promise<any>;
    getAllProperties(res: any, version: string): Promise<any>;
    getProperty(res: any, version: string, qname: string): Promise<any>;
    getPropertiesByNamespace(res: any, version: string, prefix: string): Promise<any>;
    getType(res: any, version: string, qname: string): Promise<any>;
    getTypesByNamespace(res: any, version: string, prefix: string): Promise<any>;
    getTypeSubproperties(res: any, version: string, qname: string): Promise<any>;
    getAllNamespaces(res: any, version: string): Promise<any>;
    getNamespace(res: any, version: string, prefix: string): Promise<any>;
    getFacets(res: any, version: string, qname: string): Promise<any>;
    searchProperties(res: any, SearchPropertiesDto: SearchPropertiesDto): Promise<any>;
    searchTypes(res: any, SearchTypesDto: SearchTypesDto): Promise<any>;
    validationMessageSpecification(res: any, ValidationDto: ValidationDto): Promise<any>;
    validationMessageCatalog(res: any, ValidationDto: ValidationDto): Promise<any>;
    validationSchemaNDR(res: any, ValidationDto: ValidationDto): Promise<any>;
    validationSchemaXML(res: any, ValidationDto: ValidationDto): Promise<any>;
    validationCmfXML(res: any, ValidationDto: ValidationDto): Promise<any>;
    validationInstanceJSON(res: any, ValidationDto: ValidationDto): Promise<any>;
    validationInstanceXML(res: any, ValidationDto: ValidationDto): Promise<any>;
}
