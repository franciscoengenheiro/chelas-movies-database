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
const common_utils_1 = require("../utils/common.utils");
const AbstractOpenApiSpec_1 = __importDefault(require("./AbstractOpenApiSpec"));
const ValidationError_1 = __importStar(require("./errors/ValidationError"));
const basePathPropertyNotProvided = (spec) => !spec.basePath;
class OpenApi2Spec extends AbstractOpenApiSpec_1.default {
    constructor(spec) {
        super(spec);
        this.spec = spec;
        this.didUserDefineBasePath = !basePathPropertyNotProvided(spec);
    }
    /**
     * "If the basePath property is not provided, the API is served directly under the host
     * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#fixed-fields
     */
    findOpenApiPathMatchingPathname(pathname) {
        const { basePath } = this.spec;
        if (basePath && !pathname.startsWith(basePath)) {
            throw new ValidationError_1.default(ValidationError_1.ErrorCode.BasePathNotFound);
        }
        const pathnameWithoutBasePath = basePath
            ? (0, common_utils_1.getPathnameWithoutBasePath)(basePath, pathname)
            : pathname;
        const openApiPath = (0, common_utils_1.findOpenApiPathMatchingPossiblePathnames)([pathnameWithoutBasePath], this.paths());
        if (!openApiPath) {
            throw new ValidationError_1.default(ValidationError_1.ErrorCode.PathNotFound);
        }
        return openApiPath;
    }
    findResponseDefinition(referenceString) {
        var _a;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const nameOfResponseDefinition = referenceString.split('#/responses/')[1];
        return (_a = this.spec.responses) === null || _a === void 0 ? void 0 : _a[nameOfResponseDefinition];
    }
    getComponentDefinitionsProperty() {
        return { definitions: this.spec.definitions };
    }
    getSchemaObjects() {
        return this.spec.definitions;
    }
}
exports.default = OpenApi2Spec;
//# sourceMappingURL=OpenApi2Spec.js.map