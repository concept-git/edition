// Generated from contracts/openapi.json. Do not edit.
'use strict';
export const schema_BundleExportRequest = validate1542;
const schema428 = {
  type: 'object',
  properties: { releaseId: { type: 'string', format: 'uuid' } },
  required: ['releaseId'],
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
function validate1542(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate1542.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.releaseId === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'releaseId' },
        message: "must have required property '" + 'releaseId' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.releaseId !== undefined) {
      let data0 = data.releaseId;
      if (typeof data0 === 'string') {
        if (!formats0.test(data0)) {
          const err1 = {
            instancePath: instancePath + '/releaseId',
            schemaPath: '#/properties/releaseId/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
      } else {
        const err2 = {
          instancePath: instancePath + '/releaseId',
          schemaPath: '#/properties/releaseId/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
  } else {
    const err3 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err3];
    } else {
      vErrors.push(err3);
    }
    errors++;
  }
  validate1542.errors = vErrors;
  return errors === 0;
}
validate1542.evaluated = {
  props: { releaseId: true },
  dynamicProps: false,
  dynamicItems: false,
};
