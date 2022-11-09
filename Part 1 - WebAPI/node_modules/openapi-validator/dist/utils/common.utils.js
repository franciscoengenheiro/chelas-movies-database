"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPathnameWithoutBasePath = exports.defaultBasePath = exports.findOpenApiPathMatchingPossiblePathnames = exports.getPathname = exports.stringify = void 0;
const path_parser_1 = require("path-parser");
const url_1 = __importDefault(require("url"));
const util_1 = require("util");
const stringify = (obj) => (0, util_1.inspect)(obj, { depth: null });
exports.stringify = stringify;
/**
 * Excludes the query because path = pathname + query
 */
const getPathname = (request) => 
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
url_1.default.parse(request.path).pathname;
exports.getPathname = getPathname;
/**
 * Converts all {foo} to :foo
 */
const convertOpenApiPathToColonForm = (openApiPath) => openApiPath.replace(/{/g, ':').replace(/}/g, '');
const doesColonPathMatchPathname = (pathInColonForm, pathname) => {
    /*
     * By default, OpenAPI path parameters have `style: simple; explode: false` (https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#parameter-object)
     * So array path parameters in the pathname of the actual request should be in the form: `/pathParams/a,b,c`
     * `path-parser` fails to match parameter patterns to parameters containing commas.
     * So we remove the commas.
     */
    const pathWithoutCommas = pathname.replace(/,/g, '');
    const pathParamsInPathname = new path_parser_1.Path(pathInColonForm).test(pathWithoutCommas); // => one of: null, {}, {exampleParam: 'foo'}
    return Boolean(pathParamsInPathname);
};
const doesOpenApiPathMatchPathname = (openApiPath, pathname) => {
    const pathInColonForm = convertOpenApiPathToColonForm(openApiPath);
    return doesColonPathMatchPathname(pathInColonForm, pathname);
};
const findOpenApiPathMatchingPossiblePathnames = (possiblePathnames, OAPaths) => {
    let openApiPath;
    // eslint-disable-next-line no-restricted-syntax
    for (const pathname of possiblePathnames) {
        // eslint-disable-next-line no-restricted-syntax
        for (const OAPath of OAPaths) {
            if (OAPath === pathname) {
                return OAPath;
            }
            if (doesOpenApiPathMatchPathname(OAPath, pathname)) {
                openApiPath = OAPath;
            }
        }
    }
    return openApiPath;
};
exports.findOpenApiPathMatchingPossiblePathnames = findOpenApiPathMatchingPossiblePathnames;
exports.defaultBasePath = '/';
const getPathnameWithoutBasePath = (basePath, pathname) => basePath === exports.defaultBasePath ? pathname : pathname.replace(basePath, '');
exports.getPathnameWithoutBasePath = getPathnameWithoutBasePath;
//# sourceMappingURL=common.utils.js.map