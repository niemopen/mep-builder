import { Injectable } from '@nestjs/common';
import { SSGTDTO } from './dto/ssgt.dto';
import { ErrorLogService } from 'src/error/error.log.service';
import axios from 'axios';
import { convert } from 'xmlbuilder2';

@Injectable()
export class SSGTService {
  constructor(private ErrorLogService: ErrorLogService) {}
  async search(SSGTDTO: SSGTDTO): Promise<any> {
    const xmls =
      '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:nm="http://niem.gov/ws/schemas">\
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

    const xmlStr = await axios
      .post('https://tools.niem.gov/niemtools/ws/search/', xmls, {
        headers: { 'Content-Type': 'text/xml' },
      })
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        return console.log(err.response.data);
      });

    return convert(xmlStr, { format: 'object' });
  }

  async getElement(SSGTDTO: SSGTDTO): Promise<any> {
    const xmls =
      '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:nm="http://niem.gov/ws/schemas">\
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

    const xmlStr = await axios
      .post('https://tools.niem.gov/niemtools/ws/search/', xmls, {
        headers: { 'Content-Type': 'text/xml' },
      })
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        return console.log(err.response.data);
      });

    return convert(xmlStr, { format: 'object' });
  }

  async getElementType(SSGTDTO: SSGTDTO): Promise<any> {
    const xmls =
      '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:sch="http://niem.gov/ws/schemas">\
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

    const xmlStr = await axios
      .post('https://tools.niem.gov/niemtools/ws/search/', xmls, {
        headers: { 'Content-Type': 'text/xml' },
      })
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        return console.log(err.response.data);
      });

    return convert(xmlStr, { format: 'object' });
  }

  async getSubsetSchema(SSGTDTO: SSGTDTO): Promise<any> {
    const xmls =
      '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:nm="http://niem.gov/ws/schemas">\
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
    return await axios
      .post('https://tools.niem.gov/niemtools/ws/schemagenerator/', xmls, {
        headers: { 'Content-Type': 'text/xml' },
      })
      .then((res) => {
        return {
          isSuccess: true,
          data: convert(res.data, { format: 'object' }),
        };
      })
      .catch(async (error) => {
        return await this.ErrorLogService.errorServiceResponse(
          error,
          SSGTDTO.auditUser,
        );
      });
  }
}
