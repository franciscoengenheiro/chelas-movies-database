import { RawResponse } from './classes/AbstractResponse';
import AxiosResponse from './classes/AxiosResponse';
import RequestPromiseResponse from './classes/RequestPromiseResponse';
import SuperAgentResponse from './classes/SuperAgentResponse';
export default function makeResponse(res: RawResponse): AxiosResponse | SuperAgentResponse | RequestPromiseResponse;
//# sourceMappingURL=responseFactory.d.ts.map