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
const OpenApi3Spec_utils_1 = require("../utils/OpenApi3Spec.utils");
const AbstractOpenApiSpec_1 = __importDefault(require("./AbstractOpenApiSpec"));
const ValidationError_1 = __importStar(require("./errors/ValidationError"));
class OpenApi3Spec extends AbstractOpenApiSpec_1.default {
    constructor(spec) {
        super(spec);
        this.spec = spec;
        this.didUserDefineServers = !(0, OpenApi3Spec_utils_1.serversPropertyNotProvidedOrIsEmptyArray)(spec);
        this.ensureDefaultServer();
    }
    /**
     * "If the servers property is not provided, or is an empty array, the default value would be a Server Object with a url value of '/'"
     * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#fixed-fields
     */
    ensureDefaultServer() {
        if ((0, OpenApi3Spec_utils_1.serversPropertyNotProvidedOrIsEmptyArray)(this.spec)) {
            this.spec.servers = [{ url: common_utils_1.defaultBasePath }];
        }
    }
    servers() {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.spec.servers;
    }
    getServerUrls() {
        return this.servers().map((server) => server.url);
    }
    getMatchingServerUrls(pathname) {
        return (0, OpenApi3Spec_utils_1.getMatchingServerUrlsAndServerBasePaths)(this.servers(), pathname).map(({ concreteUrl }) => concreteUrl);
    }
    getMatchingServerBasePaths(pathname) {
        return (0, OpenApi3Spec_utils_1.getMatchingServerUrlsAndServerBasePaths)(this.servers(), pathname).map(({ matchingBasePath }) => matchingBasePath);
    }
    findOpenApiPathMatchingPathname(pathname) {
        const matchingServerBasePaths = this.getMatchingServerBasePaths(pathname);
        if (!matchingServerBasePaths.length) {
            throw new ValidationError_1.default(ValidationError_1.ErrorCode.ServerNotFound);
        }
        const possiblePathnames = matchingServerBasePaths.map((basePath) => (0, common_utils_1.getPathnameWithoutBasePath)(basePath, pathname));
        const openApiPath = (0, common_utils_1.findOpenApiPathMatchingPossiblePathnames)(possiblePathnames, this.paths());
        if (!openApiPath) {
            throw new ValidationError_1.default(ValidationError_1.ErrorCode.PathNotFound);
        }
        return openApiPath;
    }
    findResponseDefinition(referenceString) {
        var _a, _b;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const nameOfResponseDefinition = referenceString.split('#/components/responses/')[1];
        return (_b = (_a = this.spec.components) === null || _a === void 0 ? void 0 : _a.responses) === null || _b === void 0 ? void 0 : _b[nameOfResponseDefinition];
    }
    getComponentDefinitionsProperty() {
        return { components: this.spec.components };
    }
    getSchemaObjects() {
        var _a;
        return (_a = this.spec.components) === null || _a === void 0 ? void 0 : _a.schemas;
    }
}
exports.default = OpenApi3Spec;
//# sourceMappingURL=OpenApi3Spec.js.map