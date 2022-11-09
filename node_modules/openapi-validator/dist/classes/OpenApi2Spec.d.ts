import type { OpenAPIV2 } from 'openapi-types';
import type { ResponseObjectWithSchema } from './AbstractOpenApiSpec';
import AbstractOpenApiSpec from './AbstractOpenApiSpec';
export default class OpenApi2Spec extends AbstractOpenApiSpec {
    spec: OpenAPIV2.Document;
    didUserDefineBasePath: boolean;
    constructor(spec: OpenAPIV2.Document);
    /**
     * "If the basePath property is not provided, the API is served directly under the host
     * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#fixed-fields
     */
    findOpenApiPathMatchingPathname(pathname: string): string;
    findResponseDefinition(referenceString: string): ResponseObjectWithSchema | undefined;
    getComponentDefinitionsProperty(): {
        definitions: OpenAPIV2.Document['definitions'];
    };
    getSchemaObjects(): OpenAPIV2.Document['definitions'];
}
//# sourceMappingURL=OpenApi2Spec.d.ts.map