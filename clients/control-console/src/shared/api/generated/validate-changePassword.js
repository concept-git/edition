// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const changePasswordInput = validate747;
const schema855 = {
  type: 'object',
  properties: {
    body: {
      $ref: 'https://edition.invalid/control#/components/schemas/ChangeRequest',
    },
  },
  required: ['body'],
  $id: 'https://edition.invalid/validators/changePasswordInput',
};
const schema856 = {
  type: 'object',
  properties: {
    oldPassword: { type: 'string', minLength: 1 },
    newPassword: { type: 'string', minLength: 1 },
  },
  required: ['newPassword', 'oldPassword'],
};
const func1 = ucs2Length;
function validate747(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/changePasswordInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate747.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.body === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'body' },
        message: "must have required property '" + 'body' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.body !== undefined) {
      let data0 = data.body;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.newPassword === undefined) {
          const err1 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/ChangeRequest/required',
            keyword: 'required',
            params: { missingProperty: 'newPassword' },
            message: "must have required property '" + 'newPassword' + "'",
          };
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
        if (data0.oldPassword === undefined) {
          const err2 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/ChangeRequest/required',
            keyword: 'required',
            params: { missingProperty: 'oldPassword' },
            message: "must have required property '" + 'oldPassword' + "'",
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
        if (data0.oldPassword !== undefined) {
          let data1 = data0.oldPassword;
          if (typeof data1 === 'string') {
            if (func1(data1) < 1) {
              const err3 = {
                instancePath: instancePath + '/body/oldPassword',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/ChangeRequest/properties/oldPassword/minLength',
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
          } else {
            const err4 = {
              instancePath: instancePath + '/body/oldPassword',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/ChangeRequest/properties/oldPassword/type',
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
        if (data0.newPassword !== undefined) {
          let data2 = data0.newPassword;
          if (typeof data2 === 'string') {
            if (func1(data2) < 1) {
              const err5 = {
                instancePath: instancePath + '/body/newPassword',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/ChangeRequest/properties/newPassword/minLength',
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
              instancePath: instancePath + '/body/newPassword',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/ChangeRequest/properties/newPassword/type',
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
          instancePath: instancePath + '/body',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ChangeRequest/type',
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
    }
  } else {
    const err8 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err8];
    } else {
      vErrors.push(err8);
    }
    errors++;
  }
  validate747.errors = vErrors;
  return errors === 0;
}
validate747.evaluated = {
  props: { body: true },
  dynamicProps: false,
  dynamicItems: false,
};
