import type { RawAxiosResponse } from './AxiosResponse';
import type { RawRequestPromiseResponse } from './RequestPromiseResponse';
import type { RawSuperAgentResponse } from './SuperAgentResponse';
export declare type RawResponse = RawAxiosResponse | RawSuperAgentResponse | RawRequestPromiseResponse;
export default abstract class AbstractResponse {
    protected res: RawResponse;
    status: number;
    req: {
        method: string;
        path: string;
    };
    abstract getBodyForValidation(): unknown;
    protected body: unknown;
    protected bodyHasNoContent: boolean;
    constructor(res: RawResponse);
    summary(): {
        body: unknown;
    };
    toString(): string;
}
export declare type ActualResponse = AbstractResponse;
export declare type ActualRequest = AbstractResponse['req'];
//# sourceMappingURL=AbstractResponse.d.ts.map