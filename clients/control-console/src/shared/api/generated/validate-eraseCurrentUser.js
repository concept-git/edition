// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const eraseCurrentUserInput = validate746;
const schema853 = {
  type: 'object',
  properties: {
    header: {
      type: 'object',
      properties: {
        'Idempotency-Key': {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
      required: ['Idempotency-Key'],
    },
    body: {
      $ref: 'https://edition.invalid/control#/components/schemas/EraseRequest',
    },
  },
  required: ['header', 'body'],
  $id: 'https://edition.invalid/validators/eraseCurrentUserInput',
};
const schema854 = {
  type: 'object',
  properties: {
    confirmationEmail: { type: 'string', format: 'email', minLength: 1 },
    currentPassword: { type: 'string', minLength: 1 },
  },
  required: ['confirmationEmail', 'currentPassword'],
};
const func1 = ucs2Length;
const pattern4 = new RegExp('^[a-zA-Z0-9._:-]+$', 'u');
const formats732 =
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
function validate746(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/eraseCurrentUserInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate746.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.header === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'header' },
        message: "must have required property '" + 'header' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.body === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'body' },
        message: "must have required property '" + 'body' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.header !== undefined) {
      let data0 = data.header;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0['Idempotency-Key'] === undefined) {
          const err2 = {
            instancePath: instancePath + '/header',
            schemaPath: '#/properties/header/required',
            keyword: 'required',
            params: { missingProperty: 'Idempotency-Key' },
            message: "must have required property '" + 'Idempotency-Key' + "'",
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
        if (data0['Idempotency-Key'] !== undefined) {
          let data1 = data0['Idempotency-Key'];
          if (typeof data1 === 'string') {
            if (func1(data1) > 128) {
              const err3 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/maxLength',
                keyword: 'maxLength',
                params: { limit: 128 },
                message: 'must NOT have more than 128 characters',
              };
              if (vErrors === null) {
                vErrors = [err3];
              } else {
                vErrors.push(err3);
              }
              errors++;
            }
            if (func1(data1) < 1) {
              const err4 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
              };
              if (vErrors === null) {
                vErrors = [err4];
              } else {
                vErrors.push(err4);
              }
              errors++;
            }
            if (!pattern4.test(data1)) {
              const err5 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/pattern',
                keyword: 'pattern',
                params: { pattern: '^[a-zA-Z0-9._:-]+$' },
                message: 'must match pattern "' + '^[a-zA-Z0-9._:-]+$' + '"',
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
              instancePath: instancePath + '/header/Idempotency-Key',
              schemaPath: '#/properties/header/properties/Idempotency-Key/type',
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
          instancePath: instancePath + '/header',
          schemaPath: '#/properties/header/type',
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
    if (data.body !== undefined) {
      let data2 = data.body;
      if (data2 && typeof data2 == 'object' && !Array.isArray(data2)) {
        if (data2.confirmationEmail === undefined) {
          const err8 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/EraseRequest/required',
            keyword: 'required',
            params: { missingProperty: 'confirmationEmail' },
            message:
              "must have required property '" + 'confirmationEmail' + "'",
          };
          if (vErrors === null) {
            vErrors = [err8];
          } else {
            vErrors.push(err8);
          }
          errors++;
        }
        if (data2.currentPassword === undefined) {
          const err9 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/EraseRequest/required',
            keyword: 'required',
            params: { missingProperty: 'currentPassword' },
            message: "must have required property '" + 'currentPassword' + "'",
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
        if (data2.confirmationEmail !== undefined) {
          let data3 = data2.confirmationEmail;
          if (typeof data3 === 'string') {
            if (func1(data3) < 1) {
              const err10 = {
                instancePath: instancePath + '/body/confirmationEmail',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/EraseRequest/properties/confirmationEmail/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
              };
              if (vErrors === null) {
                vErrors = [err10];
              } else {
                vErrors.push(err10);
              }
              errors++;
            }
            if (!formats732.test(data3)) {
              const err11 = {
                instancePath: instancePath + '/body/confirmationEmail',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/EraseRequest/properties/confirmationEmail/format',
                keyword: 'format',
                params: { format: 'email' },
                message: 'must match format "' + 'email' + '"',
              };
              if (vErrors === null) {
                vErrors = [err11];
              } else {
                vErrors.push(err11);
              }
              errors++;
            }
          } else {
            const err12 = {
              instancePath: instancePath + '/body/confirmationEmail',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/EraseRequest/properties/confirmationEmail/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err12];
            } else {
              vErrors.push(err12);
            }
            errors++;
          }
        }
        if (data2.currentPassword !== undefined) {
          let data4 = data2.currentPassword;
          if (typeof data4 === 'string') {
            if (func1(data4) < 1) {
              const err13 = {
                instancePath: instancePath + '/body/currentPassword',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/EraseRequest/properties/currentPassword/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
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
              instancePath: instancePath + '/body/currentPassword',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/EraseRequest/properties/currentPassword/type',
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
      } else {
        const err15 = {
          instancePath: instancePath + '/body',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/EraseRequest/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err15];
        } else {
          vErrors.push(err15);
        }
        errors++;
      }
    }
  } else {
    const err16 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err16];
    } else {
      vErrors.push(err16);
    }
    errors++;
  }
  validate746.errors = vErrors;
  return errors === 0;
}
validate746.evaluated = {
  props: { header: true, body: true },
  dynamicProps: false,
  dynamicItems: false,
};
