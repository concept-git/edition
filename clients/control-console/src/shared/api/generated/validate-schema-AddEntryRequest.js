// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const schema_AddEntryRequest = validate1544;
const schema457 = {
  type: 'object',
  properties: {
    parentId: { type: 'string', format: 'uuid' },
    label: { type: 'string', maxLength: 200, minLength: 0 },
    kind: { type: 'string', minLength: 1, pattern: 'target|group|link' },
    targetId: { type: 'string', format: 'uuid' },
    url: { type: 'string', maxLength: 2048, minLength: 0 },
    position: { type: 'integer', format: 'int32', minimum: 0 },
  },
  required: ['kind', 'label'],
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
const pattern52 = new RegExp('target|group|link', 'u');
function validate1544(
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
  const evaluated0 = validate1544.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.kind === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'kind' },
        message: "must have required property '" + 'kind' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.label === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'label' },
        message: "must have required property '" + 'label' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.parentId !== undefined) {
      let data0 = data.parentId;
      if (typeof data0 === 'string') {
        if (!formats0.test(data0)) {
          const err2 = {
            instancePath: instancePath + '/parentId',
            schemaPath: '#/properties/parentId/format',
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
          instancePath: instancePath + '/parentId',
          schemaPath: '#/properties/parentId/type',
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
    if (data.label !== undefined) {
      let data1 = data.label;
      if (typeof data1 === 'string') {
        if (func1(data1) > 200) {
          const err4 = {
            instancePath: instancePath + '/label',
            schemaPath: '#/properties/label/maxLength',
            keyword: 'maxLength',
            params: { limit: 200 },
            message: 'must NOT have more than 200 characters',
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
        if (func1(data1) < 0) {
          const err5 = {
            instancePath: instancePath + '/label',
            schemaPath: '#/properties/label/minLength',
            keyword: 'minLength',
            params: { limit: 0 },
            message: 'must NOT have fewer than 0 characters',
          };
          if (vErrors === null) {
            vErrors = [err5];
          } else {
            vErrors.push(err5);
          }
          errors++;
        }
      } else {
        const err6 = {
          instancePath: instancePath + '/label',
          schemaPath: '#/properties/label/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.kind !== undefined) {
      let data2 = data.kind;
      if (typeof data2 === 'string') {
        if (func1(data2) < 1) {
          const err7 = {
            instancePath: instancePath + '/kind',
            schemaPath: '#/properties/kind/minLength',
            keyword: 'minLength',
            params: { limit: 1 },
            message: 'must NOT have fewer than 1 characters',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
        if (!pattern52.test(data2)) {
          const err8 = {
            instancePath: instancePath + '/kind',
            schemaPath: '#/properties/kind/pattern',
            keyword: 'pattern',
            params: { pattern: 'target|group|link' },
            message: 'must match pattern "' + 'target|group|link' + '"',
          };
          if (vErrors === null) {
            vErrors = [err8];
          } else {
            vErrors.push(err8);
          }
          errors++;
        }
      } else {
        const err9 = {
          instancePath: instancePath + '/kind',
          schemaPath: '#/properties/kind/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.targetId !== undefined) {
      let data3 = data.targetId;
      if (typeof data3 === 'string') {
        if (!formats0.test(data3)) {
          const err10 = {
            instancePath: instancePath + '/targetId',
            schemaPath: '#/properties/targetId/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err10];
          } else {
            vErrors.push(err10);
          }
          errors++;
        }
      } else {
        const err11 = {
          instancePath: instancePath + '/targetId',
          schemaPath: '#/properties/targetId/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.url !== undefined) {
      let data4 = data.url;
      if (typeof data4 === 'string') {
        if (func1(data4) > 2048) {
          const err12 = {
            instancePath: instancePath + '/url',
            schemaPath: '#/properties/url/maxLength',
            keyword: 'maxLength',
            params: { limit: 2048 },
            message: 'must NOT have more than 2048 characters',
          };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
        if (func1(data4) < 0) {
          const err13 = {
            instancePath: instancePath + '/url',
            schemaPath: '#/properties/url/minLength',
            keyword: 'minLength',
            params: { limit: 0 },
            message: 'must NOT have fewer than 0 characters',
          };
          if (vErrors === null) {
            vErrors = [err13];
          } else {
            vErrors.push(err13);
          }
          errors++;
        }
      } else {
        const err14 = {
          instancePath: instancePath + '/url',
          schemaPath: '#/properties/url/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err14];
        } else {
          vErrors.push(err14);
        }
        errors++;
      }
    }
    if (data.position !== undefined) {
      let data5 = data.position;
      if (!(typeof data5 == 'number' && !(data5 % 1) && !isNaN(data5))) {
        const err15 = {
          instancePath: instancePath + '/position',
          schemaPath: '#/properties/position/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err15];
        } else {
          vErrors.push(err15);
        }
        errors++;
      }
      if (typeof data5 == 'number') {
        if (data5 < 0 || isNaN(data5)) {
          const err16 = {
            instancePath: instancePath + '/position',
            schemaPath: '#/properties/position/minimum',
            keyword: 'minimum',
            params: { comparison: '>=', limit: 0 },
            message: 'must be >= 0',
          };
          if (vErrors === null) {
            vErrors = [err16];
          } else {
            vErrors.push(err16);
          }
          errors++;
        }
      }
    }
  } else {
    const err17 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err17];
    } else {
      vErrors.push(err17);
    }
    errors++;
  }
  validate1544.errors = vErrors;
  return errors === 0;
}
validate1544.evaluated = {
  props: {
    parentId: true,
    label: true,
    kind: true,
    targetId: true,
    url: true,
    position: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
