// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const loginInput = validate250;
const schema335 = {
  type: 'object',
  properties: {
    body: {
      $ref: 'https://edition.invalid/control#/components/schemas/LoginRequest',
    },
  },
  required: ['body'],
  $id: 'https://edition.invalid/validators/loginInput',
};
const schema336 = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email', minLength: 1 },
    password: { type: 'string', minLength: 1 },
  },
  required: ['email', 'password'],
};
const formats732 =
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
const func1 = ucs2Length;
function validate250(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/loginInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate250.evaluated;
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
        if (data0.email === undefined) {
          const err1 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/LoginRequest/required',
            keyword: 'required',
            params: { missingProperty: 'email' },
            message: "must have required property '" + 'email' + "'",
          };
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
        if (data0.password === undefined) {
          const err2 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/LoginRequest/required',
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
        if (data0.email !== undefined) {
          let data1 = data0.email;
          if (typeof data1 === 'string') {
            if (func1(data1) < 1) {
              const err3 = {
                instancePath: instancePath + '/body/email',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/LoginRequest/properties/email/minLength',
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
            if (!formats732.test(data1)) {
              const err4 = {
                instancePath: instancePath + '/body/email',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/LoginRequest/properties/email/format',
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
              instancePath: instancePath + '/body/email',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/LoginRequest/properties/email/type',
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
        if (data0.password !== undefined) {
          let data2 = data0.password;
          if (typeof data2 === 'string') {
            if (func1(data2) < 1) {
              const err6 = {
                instancePath: instancePath + '/body/password',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/LoginRequest/properties/password/minLength',
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
              instancePath: instancePath + '/body/password',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/LoginRequest/properties/password/type',
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
      } else {
        const err8 = {
          instancePath: instancePath + '/body',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/LoginRequest/type',
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
    }
  } else {
    const err9 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err9];
    } else {
      vErrors.push(err9);
    }
    errors++;
  }
  validate250.errors = vErrors;
  return errors === 0;
}
validate250.evaluated = {
  props: { body: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const loginOutput = validate251;
const schema337 = {
  $ref: 'https://edition.invalid/control#/components/schemas/TokenResponse',
  $id: 'https://edition.invalid/validators/loginOutput',
};
const schema327 = {
  type: 'object',
  properties: {
    accessToken: { type: 'string' },
    tokenType: { type: 'string' },
    expiresIn: { type: 'integer', format: 'int64' },
  },
};
function validate251(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/loginOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate251.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.accessToken !== undefined) {
      if (typeof data.accessToken !== 'string') {
        const err0 = {
          instancePath: instancePath + '/accessToken',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TokenResponse/properties/accessToken/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
    if (data.tokenType !== undefined) {
      if (typeof data.tokenType !== 'string') {
        const err1 = {
          instancePath: instancePath + '/tokenType',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TokenResponse/properties/tokenType/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.expiresIn !== undefined) {
      let data2 = data.expiresIn;
      if (!(typeof data2 == 'number' && !(data2 % 1) && !isNaN(data2))) {
        const err2 = {
          instancePath: instancePath + '/expiresIn',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TokenResponse/properties/expiresIn/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
  } else {
    const err3 = {
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/TokenResponse/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err3];
    } else {
      vErrors.push(err3);
    }
    errors++;
  }
  validate251.errors = vErrors;
  return errors === 0;
}
validate251.evaluated = {
  props: { accessToken: true, tokenType: true, expiresIn: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const loginOutputFull = validate252;
const schema339 = {
  $ref: 'https://edition.invalid/control#/components/schemas/TokenResponse',
  $id: 'https://edition.invalid/validators/loginOutputFull',
};
function validate252(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/loginOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate252.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.accessToken !== undefined) {
      if (typeof data.accessToken !== 'string') {
        const err0 = {
          instancePath: instancePath + '/accessToken',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TokenResponse/properties/accessToken/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
    if (data.tokenType !== undefined) {
      if (typeof data.tokenType !== 'string') {
        const err1 = {
          instancePath: instancePath + '/tokenType',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TokenResponse/properties/tokenType/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.expiresIn !== undefined) {
      let data2 = data.expiresIn;
      if (!(typeof data2 == 'number' && !(data2 % 1) && !isNaN(data2))) {
        const err2 = {
          instancePath: instancePath + '/expiresIn',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TokenResponse/properties/expiresIn/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
  } else {
    const err3 = {
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/TokenResponse/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err3];
    } else {
      vErrors.push(err3);
    }
    errors++;
  }
  validate252.errors = vErrors;
  return errors === 0;
}
validate252.evaluated = {
  props: { accessToken: true, tokenType: true, expiresIn: true },
  dynamicProps: false,
  dynamicItems: false,
};
