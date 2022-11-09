import type { ActualRequest } from '../classes/AbstractResponse';
export declare const stringify: (obj: unknown) => string;
/**
 * Excludes the query because path = pathname + query
 */
export declare const getPathname: (request: ActualRequest) => string;
export declare const findOpenApiPathMatchingPossiblePathnames: (possiblePathnames: string[], OAPaths: string[]) => string | undefined;
export declare const defaultBasePath = "/";
export declare const getPathnameWithoutBasePath: (basePath: string, pathname: string) => string;
//# sourceMappingURL=common.utils.d.ts.map