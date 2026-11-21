// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const schema_EraseRequest = validate1568;
const schema854 = {
  type: 'object',
  properties: {
    confirmationEmail: { type: 'string', format: 'email', minLength: 1 },
    currentPassword: { type: 'string', minLength: 1 },
  },
  required: ['confirmationEmail', 'currentPassword'],
};
const formats732 =
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
const func1 = ucs2Length;
function validate1568(
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
  const evaluated0 = validate1568.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.confirmationEmail === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'confirmationEmail' },
        message: "must have required property '" + 'confirmationEmail' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.currentPassword === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'currentPassword' },
        message: "must have required property '" + 'currentPassword' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.confirmationEmail !== undefined) {
      let data0 = data.confirmationEmail;
      if (typeof data0 === 'string') {
        if (func1(data0) < 1) {
          const err2 = {
            instancePath: instancePath + '/confirmationEmail',
            schemaPath: '#/properties/confirmationEmail/minLength',
            keyword: 'minLength',
            params: { limit: 1 },
            message: 'must NOT have fewer than 1 characters',
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
        if (!formats732.test(data0)) {
          const err3 = {
            instancePath: instancePath + '/confirmationEmail',
            schemaPath: '#/properties/confirmationEmail/format',
            keyword: 'format',
            params: { format: 'email' },
            message: 'must match format "' + 'email' + '"',
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
      } else {
        const err4 = {
          instancePath: instancePath + '/confirmationEmail',
          schemaPath: '#/properties/confirmationEmail/type',
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
    if (data.currentPassword !== undefined) {
      let data1 = data.currentPassword;
      if (typeof data1 === 'string') {
        if (func1(data1) < 1) {
          const err5 = {
            instancePath: instancePath + '/currentPassword',
            schemaPath: '#/properties/currentPassword/minLength',
            keyword: 'minLength',
            params: { limit: 1 },
            message: 'must NOT have fewer than 1 characters',
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
          instancePath: instancePath + '/currentPassword',
          schemaPath: '#/properties/currentPassword/type',
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
  } else {
    const err7 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err7];
    } else {
      vErrors.push(err7);
    }
    errors++;
  }
  validate1568.errors = vErrors;
  return errors === 0;
}
validate1568.evaluated = {
  props: { confirmationEmail: true, currentPassword: true },
  dynamicProps: false,
  dynamicItems: false,
};
