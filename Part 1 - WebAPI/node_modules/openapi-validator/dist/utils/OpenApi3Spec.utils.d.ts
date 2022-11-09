import type { OpenAPIV3 } from 'openapi-types';
export declare const serversPropertyNotProvidedOrIsEmptyArray: (spec: OpenAPIV3.Document) => boolean;
export declare const getMatchingServerUrlsAndServerBasePaths: (servers: OpenAPIV3.ServerObject[], pathname: string) => {
    concreteUrl: string;
    matchingBasePath: string;
}[];
//# sourceMappingURL=OpenApi3Spec.utils.d.ts.map