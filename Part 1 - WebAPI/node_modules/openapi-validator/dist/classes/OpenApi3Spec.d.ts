import type { OpenAPIV3 } from 'openapi-types';
import type { ResponseObjectWithSchema } from './AbstractOpenApiSpec';
import AbstractOpenApiSpec from './AbstractOpenApiSpec';
export default class OpenApi3Spec extends AbstractOpenApiSpec {
    protected spec: OpenAPIV3.Document;
    didUserDefineServers: boolean;
    constructor(spec: OpenAPIV3.Document);
    /**
     * "If the servers property is not provided, or is an empty array, the default value would be a Server Object with a url value of '/'"
     * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#fixed-fields
     */
    ensureDefaultServer(): void;
    servers(): OpenAPIV3.ServerObject[];
    getServerUrls(): string[];
    getMatchingServerUrls(pathname: string): string[];
    getMatchingServerBasePaths(pathname: string): string[];
    findOpenApiPathMatchingPathname(pathname: string): string;
    findResponseDefinition(referenceString: string): ResponseObjectWithSchema | undefined;
    getComponentDefinitionsProperty(): {
        components: OpenAPIV3.Document['components'];
    };
    getSchemaObjects(): OpenAPIV3.ComponentsObject['schemas'];
}
//# sourceMappingURL=OpenApi3Spec.d.ts.map