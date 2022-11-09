"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_utils_1 = require("../utils/common.utils");
class AbstractResponse {
    constructor(res) {
        this.res = res;
    }
    summary() {
        return {
            body: this.body,
        };
    }
    toString() {
        return (0, common_utils_1.stringify)(this.summary());
    }
}
exports.default = AbstractResponse;
//# sourceMappingURL=AbstractResponse.js.map