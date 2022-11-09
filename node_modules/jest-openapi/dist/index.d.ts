import { OpenAPISpecObject } from 'openapi-validator';
declare global {
    namespace jest {
        interface Matchers<R> {
            /**
             * Check the HTTP response object satisfies a response defined in your OpenAPI spec.
             * [See usage example](https://github.com/openapi-library/OpenAPIValidators/tree/master/packages/jest-openapi#in-api-tests-validate-the-status-and-body-of-http-responses-against-your-openapi-spec)
             */
            toSatisfyApiSpec(): R;
            /**
             * Check the object satisfies a schema defined in your OpenAPI spec.
             * [See usage example](https://github.com/openapi-library/OpenAPIValidators/tree/master/packages/jest-openapi#in-unit-tests-validate-objects-against-schemas-defined-in-your-openapi-spec)
             */
            toSatisfySchemaInApiSpec(schemaName: string): R;
        }
    }
}
export default function (filepathOrObject: string | OpenAPISpecObject): void;
//# sourceMappingURL=index.d.ts.map