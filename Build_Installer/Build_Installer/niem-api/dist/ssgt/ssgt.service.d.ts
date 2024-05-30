import { SSGTDTO } from './dto/ssgt.dto';
import { ErrorLogService } from 'src/error/error.log.service';
export declare class SSGTService {
    private ErrorLogService;
    constructor(ErrorLogService: ErrorLogService);
    search(SSGTDTO: SSGTDTO): Promise<any>;
    getElement(SSGTDTO: SSGTDTO): Promise<any>;
    getElementType(SSGTDTO: SSGTDTO): Promise<any>;
    getSubsetSchema(SSGTDTO: SSGTDTO): Promise<any>;
}
