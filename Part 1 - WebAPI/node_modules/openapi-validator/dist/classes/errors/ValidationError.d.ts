export declare enum ErrorCode {
    ServerNotFound = 0,
    BasePathNotFound = 1,
    PathNotFound = 2,
    MethodNotFound = 3,
    StatusNotFound = 4,
    InvalidBody = 5,
    InvalidObject = 6
}
export default class ValidationError extends Error {
    code: ErrorCode;
    constructor(code: ErrorCode, message?: string);
    toString(): string;
}
//# sourceMappingURL=ValidationError.d.ts.map