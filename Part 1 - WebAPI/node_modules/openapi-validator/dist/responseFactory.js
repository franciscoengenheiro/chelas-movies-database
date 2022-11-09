"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AxiosResponse_1 = __importDefault(require("./classes/AxiosResponse"));
const RequestPromiseResponse_1 = __importDefault(require("./classes/RequestPromiseResponse"));
const SuperAgentResponse_1 = __importDefault(require("./classes/SuperAgentResponse"));
function makeResponse(res) {
    if ('data' in res) {
        return new AxiosResponse_1.default(res);
    }
    if ('status' in res) {
        return new SuperAgentResponse_1.default(res);
    }
    return new RequestPromiseResponse_1.default(res);
}
exports.default = makeResponse;
//# sourceMappingURL=responseFactory.js.map