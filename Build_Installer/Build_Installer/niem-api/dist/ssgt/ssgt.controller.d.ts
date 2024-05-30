import { SSGTService } from './ssgt.service';
import { SSGTDTO } from './dto/ssgt.dto';
import { MongoRepoService } from 'src/data/mongorepository/mongorepo.service';
import { ErrorLogService } from 'src/error/error.log.service';
export declare class SSGTController {
    private readonly SSGTService;
    private readonly MongoRepoService;
    private readonly ErrorLogService;
    constructor(SSGTService: SSGTService, MongoRepoService: MongoRepoService, ErrorLogService: ErrorLogService);
    search(res: any, SSGTDTO: SSGTDTO): Promise<any>;
    getElement(res: any, SSGTDTO: SSGTDTO): Promise<any>;
    getElementType(res: any, SSGTDTO: SSGTDTO): Promise<any>;
    getSubsetSchema(res: any, SSGTDTO: SSGTDTO): Promise<any>;
}
