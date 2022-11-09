"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractResponse_1 = __importDefault(require("./AbstractResponse"));
class RequestPromiseResponse extends AbstractResponse_1.default {
    constructor(res) {
        super(res);
        this.res = res;
        this.status = res.statusCode;
        this.body = res.request._json // eslint-disable-line no-underscore-dangle
            ? res.body
            : res.body.replace(/"/g, '');
        this.req = res.req;
        this.bodyHasNoContent = this.body === '';
    }
    getBodyForValidation() {
        if (this.bodyHasNoContent) {
            return null;
        }
        try {
            return JSON.parse(this.body);
        }
        catch (error) {
            // if JSON.parse errors, then body is not stringfied JSON that
            // needs parsing into a JSON object, so just move to the next
            // block and return the body
        }
        return this.body;
    }
}
exports.default = RequestPromiseResponse;
//# sourceMappingURL=RequestPromiseResponse.js.map