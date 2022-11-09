import type { Response, SuperAgentRequest } from 'superagent';
import AbstractResponse from './AbstractResponse';
export declare type RawSuperAgentResponse = Response & {
    req: SuperAgentRequest & {
        path: string;
    };
};
export default class SuperAgentResponse extends AbstractResponse {
    protected res: RawSuperAgentResponse;
    private isResTextPopulatedInsteadOfResBody;
    constructor(res: RawSuperAgentResponse);
    getBodyForValidation(): SuperAgentResponse['body'];
    summary(): ReturnType<AbstractResponse['summary']> & {
        text?: string;
    };
}
//# sourceMappingURL=SuperAgentResponse.d.ts.map