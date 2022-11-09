"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractResponse_1 = __importDefault(require("./AbstractResponse"));
class AxiosResponse extends AbstractResponse_1.default {
    constructor(res) {
        super(res);
        this.res = res;
        this.status = res.status;
        this.body = res.data;
        this.req = res.request;
        this.bodyHasNoContent = this.body === '';
    }
    getBodyForValidation() {
        if (this.bodyHasNoContent) {
            return null;
        }
        return this.body;
    }
}
exports.default = AxiosResponse;
//# sourceMappingURL=AxiosResponse.js.map