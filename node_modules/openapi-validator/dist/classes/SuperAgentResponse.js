"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractResponse_1 = __importDefault(require("./AbstractResponse"));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isEmptyObj = (obj) => !!obj && Object.entries(obj).length === 0 && obj.constructor === Object;
class SuperAgentResponse extends AbstractResponse_1.default {
    constructor(res) {
        super(res);
        this.res = res;
        this.status = res.status;
        this.body = res.body;
        this.req = res.req;
        this.isResTextPopulatedInsteadOfResBody =
            res.text !== '{}' && isEmptyObj(this.body);
        this.bodyHasNoContent = res.text === '';
    }
    getBodyForValidation() {
        if (this.bodyHasNoContent) {
            return null;
        }
        if (this.isResTextPopulatedInsteadOfResBody) {
            return this.res.text;
        }
        return this.body;
    }
    summary() {
        return {
            ...super.summary(),
            ...(this.isResTextPopulatedInsteadOfResBody && { text: this.res.text }),
        };
    }
}
exports.default = SuperAgentResponse;
//# sourceMappingURL=SuperAgentResponse.js.map