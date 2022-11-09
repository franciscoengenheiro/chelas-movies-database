import type { AxiosResponse as AxiosResponseType } from 'axios';
import AbstractResponse from './AbstractResponse';
export declare type RawAxiosResponse = AxiosResponseType;
export default class AxiosResponse extends AbstractResponse {
    protected res: RawAxiosResponse;
    constructor(res: RawAxiosResponse);
    getBodyForValidation(): AxiosResponse['body'];
}
//# sourceMappingURL=AxiosResponse.d.ts.map