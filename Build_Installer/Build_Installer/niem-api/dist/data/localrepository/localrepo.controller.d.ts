import { LocalRepoService } from './localrepo.service';
import { CreateLocalRepoDto } from './dto/localrepo.dto';
export declare class LocalRepoController {
    private readonly LocalRepoService;
    constructor(LocalRepoService: LocalRepoService);
    getSubsetSchemaZip(res: any, CreateLocalRepoDto: CreateLocalRepoDto): Promise<any>;
    deletePackage(res: any, CreateLocalRepoDto: CreateLocalRepoDto): Promise<any>;
}
