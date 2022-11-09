"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const openapi_validator_1 = require("openapi-validator");
const toSatisfyApiSpec_1 = __importDefault(require("./matchers/toSatisfyApiSpec"));
const toSatisfySchemaInApiSpec_1 = __importDefault(require("./matchers/toSatisfySchemaInApiSpec"));
function default_1(filepathOrObject) {
    const openApiSpec = (0, openapi_validator_1.makeApiSpec)(filepathOrObject);
    const jestMatchers = {
        toSatisfyApiSpec(received) {
            return toSatisfyApiSpec_1.default.call(this, received, openApiSpec);
        },
        toSatisfySchemaInApiSpec(received, schemaName) {
            return toSatisfySchemaInApiSpec_1.default.call(this, received, schemaName, openApiSpec);
        },
    };
    const jestExpect = global.expect;
    /* istanbul ignore next */
    if (jestExpect !== undefined) {
        jestExpect.extend(jestMatchers);
    }
    else {
        // eslint-disable-next-line no-console
        console.error([
            "Unable to find Jest's global expect.",
            'Please check you have configured jest-openapi correctly.',
            'See https://github.com/openapi-library/OpenAPIValidators/tree/master/packages/jest-openapi#usage for help.',
        ].join('\n'));
    }
    /* istanbul ignore next */
}
exports.default = default_1;
//# sourceMappingURL=index.js.map