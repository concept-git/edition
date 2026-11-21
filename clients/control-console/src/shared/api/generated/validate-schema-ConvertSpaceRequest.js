// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const schema_ConvertSpaceRequest = validate1543;
const schema434 = {
  type: 'object',
  properties: {
    mode: { type: 'string', minLength: 1, pattern: 'authored|synced' },
  },
  required: ['mode'],
};
const func1 = ucs2Length;
const pattern42 = new RegExp('authored|synced', 'u');
function validate1543(
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
  const evaluated0 = validate1543.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.mode === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'mode' },
        message: "must have required property '" + 'mode' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.mode !== undefined) {
      let data0 = data.mode;
      if (typeof data0 === 'string') {
        if (func1(data0) < 1) {
          const err1 = {
            instancePath: instancePath + '/mode',
            schemaPath: '#/properties/mode/minLength',
            keyword: 'minLength',
            params: { limit: 1 },
            message: 'must NOT have fewer than 1 characters',
          };
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
        if (!pattern42.test(data0)) {
          const err2 = {
            instancePath: instancePath + '/mode',
            schemaPath: '#/properties/mode/pattern',
            keyword: 'pattern',
            params: { pattern: 'authored|synced' },
            message: 'must match pattern "' + 'authored|synced' + '"',
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
          instancePath: instancePath + '/mode',
          schemaPath: '#/properties/mode/type',
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
  } else {
    const err4 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err4];
    } else {
      vErrors.push(err4);
    }
    errors++;
  }
  validate1543.errors = vErrors;
  return errors === 0;
}
validate1543.evaluated = {
  props: { mode: true },
  dynamicProps: false,
  dynamicItems: false,
};
