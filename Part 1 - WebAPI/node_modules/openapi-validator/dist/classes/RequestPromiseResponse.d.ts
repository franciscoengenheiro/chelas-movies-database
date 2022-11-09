import type { Request, Response } from 'request';
import AbstractResponse from './AbstractResponse';
export declare type RawRequestPromiseResponse = Response & {
    req: Request;
    request: Response['request'] & {
        _json?: unknown;
    };
};
export default class RequestPromiseResponse extends AbstractResponse {
    protected res: RawRequestPromiseResponse;
    constructor(res: RawRequestPromiseResponse);
    getBodyForValidation(): RequestPromiseResponse['body'];
}
//# sourceMappingURL=RequestPromiseResponse.d.ts.map