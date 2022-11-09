"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const openapi_response_validator_1 = __importDefault(require("openapi-response-validator"));
const common_utils_1 = require("../utils/common.utils");
const ValidationError_1 = __importStar(require("./errors/ValidationError"));
class OpenApiSpec {
    constructor(spec) {
        this.spec = spec;
    }
    pathsObject() {
        return this.spec.paths;
    }
    getPathItem(openApiPath) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.pathsObject()[openApiPath];
    }
    paths() {
        return Object.keys(this.pathsObject());
    }
    getSchemaObject(schemaName) {
        var _a;
        return (_a = this.getSchemaObjects()) === null || _a === void 0 ? void 0 : _a[schemaName];
    }
    getExpectedResponse(responseOperation, status) {
        const response = responseOperation.responses[status];
        if (!response) {
            return undefined;
        }
        if ('$ref' in response) {
            return this.findResponseDefinition(response.$ref);
        }
        return response;
    }
    findExpectedResponse(actualResponse) {
        const actualRequest = actualResponse.req;
        const expectedResponseOperation = this.findExpectedResponseOperation(actualRequest);
        if (!expectedResponseOperation) {
            throw new ValidationError_1.default(ValidationError_1.ErrorCode.MethodNotFound);
        }
        const { status } = actualResponse;
        const expectedResponse = this.getExpectedResponse(expectedResponseOperation, status);
        if (!expectedResponse) {
            throw new ValidationError_1.default(ValidationError_1.ErrorCode.StatusNotFound);
        }
        return { [status]: expectedResponse };
    }
    findOpenApiPathMatchingRequest(actualRequest) {
        const actualPathname = (0, common_utils_1.getPathname)(actualRequest);
        const openApiPath = this.findOpenApiPathMatchingPathname(actualPathname);
        return openApiPath;
    }
    findExpectedPathItem(actualRequest) {
        const actualPathname = (0, common_utils_1.getPathname)(actualRequest);
        const openApiPath = this.findOpenApiPathMatchingPathname(actualPathname);
        const pathItemObject = this.getPathItem(openApiPath);
        return pathItemObject;
    }
    findExpectedResponseOperation(actualRequest) {
        const pathItemObject = this.findExpectedPathItem(actualRequest);
        const operationObject = pathItemObject[actualRequest.method.toLowerCase()];
        return operationObject;
    }
    validateResponse(actualResponse) {
        let expectedResponse;
        try {
            expectedResponse = this.findExpectedResponse(actualResponse);
        }
        catch (error) {
            if (error instanceof ValidationError_1.default) {
                return error;
            }
            throw error;
        }
        const validator = new openapi_response_validator_1.default({
            responses: expectedResponse,
            ...this.getComponentDefinitionsProperty(),
        });
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const expectedResStatus = Object.keys(expectedResponse)[0];
        const validationError = validator.validateResponse(expectedResStatus, actualResponse.getBodyForValidation());
        return validationError
            ? new ValidationError_1.default(ValidationError_1.ErrorCode.InvalidBody, validationError.errors
                .map(({ path, message }) => `${path} ${message}`)
                .join(', '))
            : null;
    }
    /*
     * For consistency and to save maintaining another dependency,
     * we validate objects using our response validator:
     * We put the object inside a mock response, then validate
     * the whole response against a mock expected response.
     * The 2 mock responses are identical except for the body,
     * thus validating the object against its schema.
     */
    validateObject(actualObject, schema) {
        const mockResStatus = '200';
        const mockExpectedResponse = { [mockResStatus]: { schema } };
        const validator = new openapi_response_validator_1.default({
            responses: mockExpectedResponse,
            ...this.getComponentDefinitionsProperty(),
            errorTransformer: ({ path, message }) => ({
                message: `${path.replace('response', 'object')} ${message}`,
            }),
        });
        const validationError = validator.validateResponse(mockResStatus, actualObject);
        return validationError
            ? new ValidationError_1.default(ValidationError_1.ErrorCode.InvalidObject, validationError.errors.map((error) => error.message).join(', '))
            : null;
    }
}
exports.default = OpenApiSpec;
//# sourceMappingURL=AbstractOpenApiSpec.js.map