// Generated from contracts/openapi.json. Do not edit.
'use strict';
export const schema_MoveRequest = validate1545;
const schema463 = {
  type: 'object',
  properties: {
    parentId: { type: 'string', format: 'uuid' },
    position: { type: 'integer', format: 'int32', minimum: 0 },
  },
  required: ['position'],
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
function validate1545(
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
  const evaluated0 = validate1545.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.position === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'position' },
        message: "must have required property '" + 'position' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.parentId !== undefined) {
      let data0 = data.parentId;
      if (typeof data0 === 'string') {
        if (!formats0.test(data0)) {
          const err1 = {
            instancePath: instancePath + '/parentId',
            schemaPath: '#/properties/parentId/format',
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
          instancePath: instancePath + '/parentId',
          schemaPath: '#/properties/parentId/type',
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
    if (data.position !== undefined) {
      let data1 = data.position;
      if (!(typeof data1 == 'number' && !(data1 % 1) && !isNaN(data1))) {
        const err3 = {
          instancePath: instancePath + '/position',
          schemaPath: '#/properties/position/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
      if (typeof data1 == 'number') {
        if (data1 < 0 || isNaN(data1)) {
          const err4 = {
            instancePath: instancePath + '/position',
            schemaPath: '#/properties/position/minimum',
            keyword: 'minimum',
            params: { comparison: '>=', limit: 0 },
            message: 'must be >= 0',
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
      }
    }
  } else {
    const err5 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err5];
    } else {
      vErrors.push(err5);
    }
    errors++;
  }
  validate1545.errors = vErrors;
  return errors === 0;
}
validate1545.evaluated = {
  props: { parentId: true, position: true },
  dynamicProps: false,
  dynamicItems: false,
};
