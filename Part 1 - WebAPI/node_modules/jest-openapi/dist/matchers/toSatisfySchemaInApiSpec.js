"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jest_matcher_utils_1 = require("jest-matcher-utils");
const utils_1 = require("../utils");
function default_1(received, schemaName, openApiSpec) {
    const matcherHintOptions = {
        comment: "Matches 'received' to a schema defined in your API spec, then validates 'received' against it",
        isNot: this.isNot,
        promise: this.promise,
    };
    const hint = (0, jest_matcher_utils_1.matcherHint)('toSatisfySchemaInApiSpec', undefined, 'schemaName', matcherHintOptions);
    const schema = openApiSpec.getSchemaObject(schemaName);
    if (!schema) {
        // alert users they are misusing this assertion
        throw new Error((0, jest_matcher_utils_1.matcherErrorMessage)(hint, `${(0, jest_matcher_utils_1.EXPECTED_COLOR)('schemaName')} must match a schema in your API spec`, (0, jest_matcher_utils_1.printWithType)('schemaName', schemaName, jest_matcher_utils_1.printExpected)));
    }
    const validationError = openApiSpec.validateObject(received, schema);
    const pass = !validationError;
    const message = pass
        ? () => getExpectReceivedNotToSatisfySchemaInApiSpecMsg(received, schemaName, schema, hint)
        : () => getExpectReceivedToSatisfySchemaInApiSpecMsg(received, schemaName, schema, validationError, hint);
    return {
        pass,
        message,
    };
}
exports.default = default_1;
function getExpectReceivedToSatisfySchemaInApiSpecMsg(received, schemaName, schema, validationError, hint) {
    // prettier-ignore
    return (0, utils_1.joinWithNewLines)(hint, `expected ${(0, jest_matcher_utils_1.RECEIVED_COLOR)('received')} to satisfy the '${schemaName}' schema defined in your API spec`, `${(0, jest_matcher_utils_1.RECEIVED_COLOR)('received')} did not satisfy it because: ${validationError}`, `${(0, jest_matcher_utils_1.RECEIVED_COLOR)('received')} was: ${(0, jest_matcher_utils_1.RECEIVED_COLOR)((0, utils_1.stringify)(received))}`, `The '${schemaName}' schema in API spec: ${(0, jest_matcher_utils_1.EXPECTED_COLOR)((0, utils_1.stringify)(schema))}`);
}
function getExpectReceivedNotToSatisfySchemaInApiSpecMsg(received, schemaName, schema, hint) {
    // prettier-ignore
    return (0, utils_1.joinWithNewLines)(hint, `expected ${(0, jest_matcher_utils_1.RECEIVED_COLOR)('received')} not to satisfy the '${schemaName}' schema defined in your API spec`, `${(0, jest_matcher_utils_1.RECEIVED_COLOR)('received')} was: ${(0, jest_matcher_utils_1.RECEIVED_COLOR)((0, utils_1.stringify)(received))}`, `The '${schemaName}' schema in API spec: ${(0, jest_matcher_utils_1.EXPECTED_COLOR)((0, utils_1.stringify)(schema))}`);
}
//# sourceMappingURL=toSatisfySchemaInApiSpec.js.map