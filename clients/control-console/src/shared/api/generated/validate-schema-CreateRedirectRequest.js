// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const schema_CreateRedirectRequest = validate1557;
const schema697 = {
  type: 'object',
  properties: {
    path: { type: 'string', maxLength: 512, minLength: 0 },
    targetType: { type: 'string', minLength: 1, pattern: 'space|page' },
    targetId: { type: 'string', format: 'uuid' },
  },
  required: ['path', 'targetId', 'targetType'],
};
const func1 = ucs2Length;
const pattern80 = new RegExp('space|page', 'u');
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
function validate1557(
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
  const evaluated0 = validate1557.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.path === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'path' },
        message: "must have required property '" + 'path' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.targetId === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'targetId' },
        message: "must have required property '" + 'targetId' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.targetType === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'targetType' },
        message: "must have required property '" + 'targetType' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.path !== undefined) {
      let data0 = data.path;
      if (typeof data0 === 'string') {
        if (func1(data0) > 512) {
          const err3 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/maxLength',
            keyword: 'maxLength',
            params: { limit: 512 },
            message: 'must NOT have more than 512 characters',
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
        if (func1(data0) < 0) {
          const err4 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/minLength',
            keyword: 'minLength',
            params: { limit: 0 },
            message: 'must NOT have fewer than 0 characters',
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
          instancePath: instancePath + '/path',
          schemaPath: '#/properties/path/type',
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
    if (data.targetType !== undefined) {
      let data1 = data.targetType;
      if (typeof data1 === 'string') {
        if (func1(data1) < 1) {
          const err6 = {
            instancePath: instancePath + '/targetType',
            schemaPath: '#/properties/targetType/minLength',
            keyword: 'minLength',
            params: { limit: 1 },
            message: 'must NOT have fewer than 1 characters',
          };
          if (vErrors === null) {
            vErrors = [err6];
          } else {
            vErrors.push(err6);
          }
          errors++;
        }
        if (!pattern80.test(data1)) {
          const err7 = {
            instancePath: instancePath + '/targetType',
            schemaPath: '#/properties/targetType/pattern',
            keyword: 'pattern',
            params: { pattern: 'space|page' },
            message: 'must match pattern "' + 'space|page' + '"',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      } else {
        const err8 = {
          instancePath: instancePath + '/targetType',
          schemaPath: '#/properties/targetType/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.targetId !== undefined) {
      let data2 = data.targetId;
      if (typeof data2 === 'string') {
        if (!formats0.test(data2)) {
          const err9 = {
            instancePath: instancePath + '/targetId',
            schemaPath: '#/properties/targetId/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
      } else {
        const err10 = {
          instancePath: instancePath + '/targetId',
          schemaPath: '#/properties/targetId/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
  } else {
    const err11 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err11];
    } else {
      vErrors.push(err11);
    }
    errors++;
  }
  validate1557.errors = vErrors;
  return errors === 0;
}
validate1557.evaluated = {
  props: { path: true, targetType: true, targetId: true },
  dynamicProps: false,
  dynamicItems: false,
};
