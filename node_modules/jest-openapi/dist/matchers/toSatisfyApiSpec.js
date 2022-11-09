"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jest_matcher_utils_1 = require("jest-matcher-utils");
const openapi_validator_1 = require("openapi-validator");
const utils_1 = require("../utils");
function default_1(received, openApiSpec) {
    const actualResponse = (0, openapi_validator_1.makeResponse)(received);
    const validationError = openApiSpec.validateResponse(actualResponse);
    const pass = !validationError;
    const matcherHintOptions = {
        comment: "Matches 'received' to a response defined in your API spec, then validates 'received' against it",
        isNot: this.isNot,
        promise: this.promise,
    };
    const hint = (0, jest_matcher_utils_1.matcherHint)('toSatisfyApiSpec', undefined, '', matcherHintOptions);
    const message = pass
        ? () => getExpectReceivedNotToSatisfyApiSpecMsg(actualResponse, openApiSpec, hint)
        : () => getExpectReceivedToSatisfyApiSpecMsg(actualResponse, openApiSpec, validationError, hint);
    return {
        pass,
        message,
    };
}
exports.default = default_1;
function getExpectReceivedToSatisfyApiSpecMsg(actualResponse, openApiSpec, validationError, hint) {
    const { status, req } = actualResponse;
    const { method, path: requestPath } = req;
    const unmatchedEndpoint = `${method} ${requestPath}`;
    if (validationError.code === openapi_validator_1.ErrorCode.ServerNotFound) {
        // prettier-ignore
        return (0, utils_1.joinWithNewLines)(hint, `expected ${(0, jest_matcher_utils_1.RECEIVED_COLOR)('received')} to satisfy a '${status}' response defined for endpoint '${unmatchedEndpoint}' in your API spec`, `${(0, jest_matcher_utils_1.RECEIVED_COLOR)('received')} had request path ${(0, jest_matcher_utils_1.RECEIVED_COLOR)(requestPath)}, but your API spec has no matching servers`, `Servers found in API spec: ${(0, jest_matcher_utils_1.EXPECTED_COLOR)(openApiSpec.getServerUrls().join(', '))}`);
    }
    if (validationError.code === openapi_validator_1.ErrorCode.BasePathNotFound) {
        // prettier-ignore
        return (0, utils_1.joinWithNewLines)(hint, `expected ${(0, jest_matcher_utils_1.RECEIVED_COLOR)('received')} to satisfy a '${status}' response defined for endpoint '${unmatchedEndpoint}' in your API spec`, `${(0, jest_matcher_utils_1.RECEIVED_COLOR)('received')} had request path ${(0, jest_matcher_utils_1.RECEIVED_COLOR)(requestPath)}, but your API spec has basePath ${(0, jest_matcher_utils_1.EXPECTED_COLOR)(openApiSpec.spec.basePath)}`);
    }
    if (validationError.code === openapi_validator_1.ErrorCode.PathNotFound) {
        // prettier-ignore
        const pathNotFoundErrorMessage = (0, utils_1.joinWithNewLines)(hint, `expected ${(0, jest_matcher_utils_1.RECEIVED_COLOR)('received')} to satisfy a '${status}' response defined for endpoint '${unmatchedEndpoint}' in your API spec`, `${(0, jest_matcher_utils_1.RECEIVED_COLOR)('received')} had request path ${(0, jest_matcher_utils_1.RECEIVED_COLOR)(requestPath)}, but your API spec has no matching path`, `Paths found in API spec: ${(0, jest_matcher_utils_1.EXPECTED_COLOR)(openApiSpec.paths().join(', '))}`);
        if ('didUserDefineBasePath' in openApiSpec &&
            openApiSpec.didUserDefineBasePath) {
            // prettier-ignore
            return (0, utils_1.joinWithNewLines)(pathNotFoundErrorMessage, `'${requestPath}' matches basePath \`${openApiSpec.spec.basePath}\` but no <basePath/endpointPath> combinations`);
        }
        if ('didUserDefineServers' in openApiSpec &&
            openApiSpec.didUserDefineServers) {
            return (0, utils_1.joinWithNewLines)(pathNotFoundErrorMessage, `'${requestPath}' matches servers ${(0, utils_1.stringify)(openApiSpec.getMatchingServerUrls(requestPath))} but no <server/endpointPath> combinations`);
        }
        return pathNotFoundErrorMessage;
    }
    const path = openApiSpec.findOpenApiPathMatchingRequest(req);
    const endpoint = `${method} ${path}`;
    if (validationError.code === openapi_validator_1.ErrorCode.MethodNotFound) {
        const expectedPathItem = openApiSpec.findExpectedPathItem(req);
        const expectedRequestOperations = Object.keys(expectedPathItem)
            .map((operation) => operation.toUpperCase())
            .join(', ');
        // prettier-ignore
        return (0, utils_1.joinWithNewLines)(hint, `expected ${(0, jest_matcher_utils_1.RECEIVED_COLOR)('received')} to satisfy a '${status}' response defined for endpoint '${endpoint}' in your API spec`, `${(0, jest_matcher_utils_1.RECEIVED_COLOR)('received')} had request method ${(0, jest_matcher_utils_1.RECEIVED_COLOR)(method)}, but your API spec has no ${(0, jest_matcher_utils_1.RECEIVED_COLOR)(method)} operation defined for path '${path}'`, `Request operations found for path '${path}' in API spec: ${(0, jest_matcher_utils_1.EXPECTED_COLOR)(expectedRequestOperations)}`);
    }
    if (validationError.code === openapi_validator_1.ErrorCode.StatusNotFound) {
        const expectedResponseOperation = 
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        openApiSpec.findExpectedResponseOperation(req);
        const expectedResponseStatuses = Object.keys(expectedResponseOperation.responses).join(', ');
        // prettier-ignore
        return (0, utils_1.joinWithNewLines)(hint, `expected ${(0, jest_matcher_utils_1.RECEIVED_COLOR)('received')} to satisfy a '${status}' response defined for endpoint '${endpoint}' in your API spec`, `${(0, jest_matcher_utils_1.RECEIVED_COLOR)('received')} had status ${(0, jest_matcher_utils_1.RECEIVED_COLOR)(status)}, but your API spec has no ${(0, jest_matcher_utils_1.RECEIVED_COLOR)(status)} response defined for endpoint '${endpoint}'`, `Response statuses found for endpoint '${endpoint}' in API spec: ${(0, jest_matcher_utils_1.EXPECTED_COLOR)(expectedResponseStatuses)}`);
    }
    // validationError.code === ErrorCode.InvalidBody
    const responseDefinition = openApiSpec.findExpectedResponse(actualResponse);
    // prettier-ignore
    return (0, utils_1.joinWithNewLines)(hint, `expected ${(0, jest_matcher_utils_1.RECEIVED_COLOR)('received')} to satisfy the '${status}' response defined for endpoint '${endpoint}' in your API spec`, `${(0, jest_matcher_utils_1.RECEIVED_COLOR)('received')} did not satisfy it because: ${validationError}`, `${(0, jest_matcher_utils_1.RECEIVED_COLOR)('received')} contained: ${(0, jest_matcher_utils_1.RECEIVED_COLOR)(actualResponse.toString())}`, `The '${status}' response defined for endpoint '${endpoint}' in API spec: ${(0, jest_matcher_utils_1.EXPECTED_COLOR)((0, utils_1.stringify)(responseDefinition))}`);
}
function getExpectReceivedNotToSatisfyApiSpecMsg(actualResponse, openApiSpec, hint) {
    const { status, req } = actualResponse;
    const responseDefinition = openApiSpec.findExpectedResponse(actualResponse);
    const endpoint = `${req.method} ${openApiSpec.findOpenApiPathMatchingRequest(req)}`;
    // prettier-ignore
    return (0, utils_1.joinWithNewLines)(hint, `expected ${(0, jest_matcher_utils_1.RECEIVED_COLOR)('received')} not to satisfy the '${status}' response defined for endpoint '${endpoint}' in your API spec`, `${(0, jest_matcher_utils_1.RECEIVED_COLOR)('received')} contained: ${(0, jest_matcher_utils_1.RECEIVED_COLOR)(actualResponse.toString())}`, `The '${status}' response defined for endpoint '${endpoint}' in API spec: ${(0, jest_matcher_utils_1.EXPECTED_COLOR)((0, utils_1.stringify)(responseDefinition))}`);
}
//# sourceMappingURL=toSatisfyApiSpec.js.map