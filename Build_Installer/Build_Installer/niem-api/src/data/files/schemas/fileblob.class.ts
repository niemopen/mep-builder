export class FileBlobClass {
  constructor(
    protected buffer: string | Buffer,
    protected originalname: string,
    protected fieldname: string = 'file',
    protected encoding: string = null,
    protected size: string = null,
  ) {}
}
