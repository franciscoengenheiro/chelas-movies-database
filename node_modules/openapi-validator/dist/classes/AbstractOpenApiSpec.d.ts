import type { OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from 'openapi-types';
import type { ActualRequest, ActualResponse } from './AbstractResponse';
import ValidationError from './errors/ValidationError';
declare type Document = OpenAPIV2.Document | OpenAPIV3.Document;
declare type Operation = OpenAPIV2.OperationObject | OpenAPIV3.OperationObject;
declare type PathItemObject = OpenAPIV2.PathItemObject | OpenAPIV3.PathItemObject;
export declare type ResponseObjectWithSchema = (OpenAPIV2.ResponseObject & {
    schema: OpenAPIV2.Schema;
}) | (OpenAPIV3.ResponseObject & {
    content: {
        [media: string]: OpenAPIV3.MediaTypeObject & {
            schema: OpenAPIV3.SchemaObject;
        };
    };
}) | (OpenAPIV3_1.ResponseObject & {
    content: {
        [media: string]: OpenAPIV3_1.MediaTypeObject & {
            schema: OpenAPIV3_1.SchemaObject;
        };
    };
});
export declare type Schema = OpenAPIV2.Schema | OpenAPIV3.SchemaObject;
export default abstract class OpenApiSpec {
    protected spec: Document;
    protected abstract getSchemaObjects(): Record<string, Schema> | undefined;
    protected abstract findResponseDefinition(referenceString: string): ResponseObjectWithSchema | undefined;
    protected abstract findOpenApiPathMatchingPathname(pathname: string): string;
    protected abstract getComponentDefinitionsProperty(): {
        definitions: OpenAPIV2.Document['definitions'];
    } | {
        components: OpenAPIV3.Document['components'];
    };
    constructor(spec: Document);
    pathsObject(): Document['paths'];
    getPathItem(openApiPath: string): PathItemObject;
    paths(): string[];
    getSchemaObject(schemaName: string): Schema | undefined;
    getExpectedResponse(responseOperation: Operation, status: ActualResponse['status']): ResponseObjectWithSchema | undefined;
    findExpectedResponse(actualResponse: ActualResponse): Record<string, ResponseObjectWithSchema>;
    findOpenApiPathMatchingRequest(actualRequest: ActualRequest): string;
    findExpectedPathItem(actualRequest: ActualRequest): PathItemObject;
    findExpectedResponseOperation(actualRequest: ActualRequest): Operation | undefined;
    validateResponse(actualResponse: ActualResponse): ValidationError | null;
    validateObject(actualObject: unknown, schema: Schema): ValidationError | null;
}
export {};
//# sourceMappingURL=AbstractOpenApiSpec.d.ts.map