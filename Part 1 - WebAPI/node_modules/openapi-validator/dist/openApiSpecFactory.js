"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const openapi_schema_validator_1 = __importDefault(require("openapi-schema-validator"));
const path_1 = __importDefault(require("path"));
const typeof_1 = __importDefault(require("typeof"));
const OpenApi2Spec_1 = __importDefault(require("./classes/OpenApi2Spec"));
const OpenApi3Spec_1 = __importDefault(require("./classes/OpenApi3Spec"));
const common_utils_1 = require("./utils/common.utils");
const isObject = (arg) => typeof arg === 'object' && arg !== null && !Array.isArray(arg);
function makeApiSpec(filepathOrObject) {
    const spec = loadSpec(filepathOrObject);
    validateSpec(spec);
    const validSpec = spec;
    if ('swagger' in validSpec) {
        return new OpenApi2Spec_1.default(validSpec);
    }
    return new OpenApi3Spec_1.default(validSpec);
}
exports.default = makeApiSpec;
function loadSpec(arg) {
    try {
        if (typeof arg === 'string') {
            return loadFile(arg);
        }
        if (isObject(arg)) {
            return arg;
        }
        throw new Error(`Received type '${(0, typeof_1.default)(arg)}'`);
    }
    catch (error) {
        throw new Error(`The provided argument must be either an absolute filepath or an object representing an OpenAPI specification.\nError details: ${error.message}`);
    }
}
function loadFile(filepath) {
    if (!path_1.default.isAbsolute(filepath)) {
        throw new Error(`'${filepath}' is not an absolute filepath`);
    }
    const fileData = fs_extra_1.default.readFileSync(filepath, { encoding: 'utf8' });
    try {
        return js_yaml_1.default.load(fileData);
    }
    catch (error) {
        throw new Error(`Invalid YAML or JSON:\n${error.message}`);
    }
}
function validateSpec(obj) {
    try {
        const validator = new openapi_schema_validator_1.default({
            version: obj.swagger || // '2.0'
                obj.openapi, // '3.X.X'
        });
        const { errors } = validator.validate(obj);
        if (errors.length > 0) {
            throw new Error((0, common_utils_1.stringify)(errors));
        }
        return obj;
    }
    catch (error) {
        throw new Error(`Invalid OpenAPI spec: ${error.message}`);
    }
}
//# sourceMappingURL=openApiSpecFactory.js.map