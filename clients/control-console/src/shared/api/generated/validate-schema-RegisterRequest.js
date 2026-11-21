// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const schema_RegisterRequest = validate1530;
const schema320 = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      format: 'email',
      example: 'alice@example.com',
      minLength: 1,
    },
    name: { type: 'string', example: 'Alice', minLength: 1 },
    password: { type: 'string', minLength: 1 },
  },
  required: ['email', 'name', 'password'],
};
const formats732 =
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
const func1 = ucs2Length;
function validate1530(
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
  const evaluated0 = validate1530.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.email === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'email' },
        message: "must have required property '" + 'email' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.name === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'name' },
        message: "must have required property '" + 'name' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.password === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'password' },
        message: "must have required property '" + 'password' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.email !== undefined) {
      let data0 = data.email;
      if (typeof data0 === 'string') {
        if (func1(data0) < 1) {
          const err3 = {
            instancePath: instancePath + '/email',
            schemaPath: '#/properties/email/minLength',
            keyword: 'minLength',
            params: { limit: 1 },
            message: 'must NOT have fewer than 1 characters',
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
        if (!formats732.test(data0)) {
          const err4 = {
            instancePath: instancePath + '/email',
            schemaPath: '#/properties/email/format',
            keyword: 'format',
            params: { format: 'email' },
            message: 'must match format "' + 'email' + '"',
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
          instancePath: instancePath + '/email',
          schemaPath: '#/properties/email/type',
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
    if (data.name !== undefined) {
      let data1 = data.name;
      if (typeof data1 === 'string') {
        if (func1(data1) < 1) {
          const err6 = {
            instancePath: instancePath + '/name',
            schemaPath: '#/properties/name/minLength',
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
      } else {
        const err7 = {
          instancePath: instancePath + '/name',
          schemaPath: '#/properties/name/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
    if (data.password !== undefined) {
      let data2 = data.password;
      if (typeof data2 === 'string') {
        if (func1(data2) < 1) {
          const err8 = {
            instancePath: instancePath + '/password',
            schemaPath: '#/properties/password/minLength',
            keyword: 'minLength',
            params: { limit: 1 },
            message: 'must NOT have fewer than 1 characters',
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
          instancePath: instancePath + '/password',
          schemaPath: '#/properties/password/type',
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
  } else {
    const err10 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err10];
    } else {
      vErrors.push(err10);
    }
    errors++;
  }
  validate1530.errors = vErrors;
  return errors === 0;
}
validate1530.evaluated = {
  props: { email: true, name: true, password: true },
  dynamicProps: false,
  dynamicItems: false,
};
