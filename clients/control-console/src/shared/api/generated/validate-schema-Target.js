// Generated from contracts/openapi.json. Do not edit.
'use strict';
export const schema_Target = validate1528;
const schema301 = {
  type: 'object',
  properties: {
    tenantId: { type: 'string', format: 'uuid' },
    siteId: { type: 'string', format: 'uuid' },
  },
  required: ['siteId', 'tenantId'],
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
function validate1528(
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
  const evaluated0 = validate1528.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.siteId === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'siteId' },
        message: "must have required property '" + 'siteId' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.tenantId === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'tenantId' },
        message: "must have required property '" + 'tenantId' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.tenantId !== undefined) {
      let data0 = data.tenantId;
      if (typeof data0 === 'string') {
        if (!formats0.test(data0)) {
          const err2 = {
            instancePath: instancePath + '/tenantId',
            schemaPath: '#/properties/tenantId/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
      } else {
        const err3 = {
          instancePath: instancePath + '/tenantId',
          schemaPath: '#/properties/tenantId/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.siteId !== undefined) {
      let data1 = data.siteId;
      if (typeof data1 === 'string') {
        if (!formats0.test(data1)) {
          const err4 = {
            instancePath: instancePath + '/siteId',
            schemaPath: '#/properties/siteId/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
      } else {
        const err5 = {
          instancePath: instancePath + '/siteId',
          schemaPath: '#/properties/siteId/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
  } else {
    const err6 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err6];
    } else {
      vErrors.push(err6);
    }
    errors++;
  }
  validate1528.errors = vErrors;
  return errors === 0;
}
validate1528.evaluated = {
  props: { tenantId: true, siteId: true },
  dynamicProps: false,
  dynamicItems: false,
};
