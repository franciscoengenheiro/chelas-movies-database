"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCode = void 0;
var ErrorCode;
(function (ErrorCode) {
    ErrorCode[ErrorCode["ServerNotFound"] = 0] = "ServerNotFound";
    ErrorCode[ErrorCode["BasePathNotFound"] = 1] = "BasePathNotFound";
    ErrorCode[ErrorCode["PathNotFound"] = 2] = "PathNotFound";
    ErrorCode[ErrorCode["MethodNotFound"] = 3] = "MethodNotFound";
    ErrorCode[ErrorCode["StatusNotFound"] = 4] = "StatusNotFound";
    ErrorCode[ErrorCode["InvalidBody"] = 5] = "InvalidBody";
    ErrorCode[ErrorCode["InvalidObject"] = 6] = "InvalidObject";
})(ErrorCode = exports.ErrorCode || (exports.ErrorCode = {}));
class ValidationError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
    }
    toString() {
        return this.message;
    }
}
exports.default = ValidationError;
//# sourceMappingURL=ValidationError.js.map