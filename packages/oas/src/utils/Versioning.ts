import { OAS } from '../types/oas';
import { OpenAPIV2, OpenAPIV3 } from 'openapi-types';

export class Versioning {
  public static isV3(spec: OAS.Collection): spec is OpenAPIV3.Document {
    return (spec as OpenAPIV3.Document).openapi !== undefined;
  }

  public static isV2(spec: OAS.Collection): spec is OpenAPIV2.Document {
    return (spec as OpenAPIV2.Document).swagger !== undefined;
  }
}
