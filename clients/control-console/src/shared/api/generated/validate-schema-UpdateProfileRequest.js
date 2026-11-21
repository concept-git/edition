// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const schema_UpdateProfileRequest = validate1526;
const schema257 = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1 },
    locale: { type: 'string' },
    avatar: { type: 'string' },
  },
  required: ['name'],
};
const func1 = ucs2Length;
function validate1526(
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
  const evaluated0 = validate1526.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.name === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'name' },
        message: "must have required property '" + 'name' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.name !== undefined) {
      let data0 = data.name;
      if (typeof data0 === 'string') {
        if (func1(data0) < 1) {
          const err1 = {
            instancePath: instancePath + '/name',
            schemaPath: '#/properties/name/minLength',
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
      } else {
        const err2 = {
          instancePath: instancePath + '/name',
          schemaPath: '#/properties/name/type',
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
    if (data.locale !== undefined) {
      if (typeof data.locale !== 'string') {
        const err3 = {
          instancePath: instancePath + '/locale',
          schemaPath: '#/properties/locale/type',
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
    if (data.avatar !== undefined) {
      if (typeof data.avatar !== 'string') {
        const err4 = {
          instancePath: instancePath + '/avatar',
          schemaPath: '#/properties/avatar/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
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
  validate1526.errors = vErrors;
  return errors === 0;
}
validate1526.evaluated = {
  props: { name: true, locale: true, avatar: true },
  dynamicProps: false,
  dynamicItems: false,
};
