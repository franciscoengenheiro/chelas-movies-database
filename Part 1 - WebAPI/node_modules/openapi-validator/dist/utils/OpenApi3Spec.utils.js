"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMatchingServerUrlsAndServerBasePaths = exports.serversPropertyNotProvidedOrIsEmptyArray = void 0;
const combos_1 = __importDefault(require("combos"));
const common_utils_1 = require("./common.utils");
const unique = (array) => [...new Set(array)];
const serversPropertyNotProvidedOrIsEmptyArray = (spec) => !spec.servers || !spec.servers.length;
exports.serversPropertyNotProvidedOrIsEmptyArray = serversPropertyNotProvidedOrIsEmptyArray;
const getBasePath = (url) => {
    const basePathStartIndex = url.replace('//', '  ').indexOf('/');
    return basePathStartIndex !== -1
        ? url.slice(basePathStartIndex)
        : common_utils_1.defaultBasePath;
};
const getPossibleValuesOfServerVariable = ({ default: defaultValue, enum: enumMembers, }) => enumMembers ? unique([defaultValue].concat(enumMembers)) : [defaultValue];
const mapServerVariablesToPossibleValues = (serverVariables) => Object.entries(serverVariables).reduce((currentMap, [variableName, detailsOfPossibleValues]) => ({
    ...currentMap,
    [variableName]: getPossibleValuesOfServerVariable(detailsOfPossibleValues),
}), {});
const convertTemplateExpressionToConcreteExpression = (templateExpression, mapOfVariablesToValues) => Object.entries(mapOfVariablesToValues).reduce((currentExpression, [variable, value]) => currentExpression.replace(`{${variable}}`, value), templateExpression);
const getPossibleConcreteBasePaths = (basePath, serverVariables) => {
    const mapOfServerVariablesToPossibleValues = mapServerVariablesToPossibleValues(serverVariables);
    const combinationsOfBasePathVariableValues = (0, combos_1.default)(mapOfServerVariablesToPossibleValues);
    const possibleBasePaths = combinationsOfBasePathVariableValues.map((mapOfVariablesToValues) => convertTemplateExpressionToConcreteExpression(basePath, mapOfVariablesToValues));
    return possibleBasePaths;
};
const getPossibleBasePaths = (url, serverVariables) => {
    const basePath = getBasePath(url);
    return serverVariables
        ? getPossibleConcreteBasePaths(basePath, serverVariables)
        : [basePath];
};
const getMatchingServerUrlsAndServerBasePaths = (servers, pathname) => {
    const matchesPathname = (basePath) => pathname.startsWith(basePath);
    return servers
        .map(({ url: templatedUrl, variables }) => ({
        templatedUrl,
        possibleBasePaths: getPossibleBasePaths(templatedUrl, variables),
    }))
        .filter(({ possibleBasePaths }) => possibleBasePaths.some(matchesPathname))
        .map(({ templatedUrl, possibleBasePaths }) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const matchingBasePath = possibleBasePaths.find(matchesPathname);
        return {
            concreteUrl: templatedUrl.replace(getBasePath(templatedUrl), matchingBasePath),
            matchingBasePath,
        };
    });
};
exports.getMatchingServerUrlsAndServerBasePaths = getMatchingServerUrlsAndServerBasePaths;
//# sourceMappingURL=OpenApi3Spec.utils.js.map