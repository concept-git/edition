// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const registerInput = validate241;
const schema319 = {
  type: 'object',
  properties: {
    body: {
      $ref: 'https://edition.invalid/control#/components/schemas/RegisterRequest',
    },
  },
  required: ['body'],
  $id: 'https://edition.invalid/validators/registerInput',
};
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
function validate241(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/registerInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate241.evaluated;
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
              'https://edition.invalid/control#/components/schemas/RegisterRequest/required',
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
        if (data0.name === undefined) {
          const err2 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/RegisterRequest/required',
            keyword: 'required',
            params: { missingProperty: 'name' },
            message: "must have required property '" + 'name' + "'",
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
        if (data0.password === undefined) {
          const err3 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/RegisterRequest/required',
            keyword: 'required',
            params: { missingProperty: 'password' },
            message: "must have required property '" + 'password' + "'",
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
        if (data0.email !== undefined) {
          let data1 = data0.email;
          if (typeof data1 === 'string') {
            if (func1(data1) < 1) {
              const err4 = {
                instancePath: instancePath + '/body/email',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/RegisterRequest/properties/email/minLength',
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
            if (!formats732.test(data1)) {
              const err5 = {
                instancePath: instancePath + '/body/email',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/RegisterRequest/properties/email/format',
                keyword: 'format',
                params: { format: 'email' },
                message: 'must match format "' + 'email' + '"',
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
              instancePath: instancePath + '/body/email',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/RegisterRequest/properties/email/type',
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
        if (data0.name !== undefined) {
          let data2 = data0.name;
          if (typeof data2 === 'string') {
            if (func1(data2) < 1) {
              const err7 = {
                instancePath: instancePath + '/body/name',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/RegisterRequest/properties/name/minLength',
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
          } else {
            const err8 = {
              instancePath: instancePath + '/body/name',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/RegisterRequest/properties/name/type',
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
        if (data0.password !== undefined) {
          let data3 = data0.password;
          if (typeof data3 === 'string') {
            if (func1(data3) < 1) {
              const err9 = {
                instancePath: instancePath + '/body/password',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/RegisterRequest/properties/password/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
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
              instancePath: instancePath + '/body/password',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/RegisterRequest/properties/password/type',
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
          instancePath: instancePath + '/body',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/RegisterRequest/type',
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
    }
  } else {
    const err12 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err12];
    } else {
      vErrors.push(err12);
    }
    errors++;
  }
  validate241.errors = vErrors;
  return errors === 0;
}
validate241.evaluated = {
  props: { body: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const registerOutput = validate242;
const schema321 = {
  $ref: 'https://edition.invalid/control#/components/schemas/RegisterResponse',
  $id: 'https://edition.invalid/validators/registerOutput',
};
const schema322 = {
  type: 'object',
  properties: { userId: { type: 'string', format: 'uuid' } },
  required: ['userId'],
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
function validate242(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/registerOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate242.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.userId === undefined) {
      const err0 = {
        instancePath,
        schemaPath:
          'https://edition.invalid/control#/components/schemas/RegisterResponse/required',
        keyword: 'required',
        params: { missingProperty: 'userId' },
        message: "must have required property '" + 'userId' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.userId !== undefined) {
      let data0 = data.userId;
      if (typeof data0 === 'string') {
        if (!formats0.test(data0)) {
          const err1 = {
            instancePath: instancePath + '/userId',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/RegisterResponse/properties/userId/format',
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
          instancePath: instancePath + '/userId',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/RegisterResponse/properties/userId/type',
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
  } else {
    const err3 = {
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/RegisterResponse/type',
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
  validate242.errors = vErrors;
  return errors === 0;
}
validate242.evaluated = {
  props: { userId: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const registerOutputFull = validate243;
const schema323 = {
  $ref: 'https://edition.invalid/control#/components/schemas/RegisterResponse',
  $id: 'https://edition.invalid/validators/registerOutputFull',
};
function validate243(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/registerOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate243.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.userId === undefined) {
      const err0 = {
        instancePath,
        schemaPath:
          'https://edition.invalid/control#/components/schemas/RegisterResponse/required',
        keyword: 'required',
        params: { missingProperty: 'userId' },
        message: "must have required property '" + 'userId' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.userId !== undefined) {
      let data0 = data.userId;
      if (typeof data0 === 'string') {
        if (!formats0.test(data0)) {
          const err1 = {
            instancePath: instancePath + '/userId',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/RegisterResponse/properties/userId/format',
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
          instancePath: instancePath + '/userId',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/RegisterResponse/properties/userId/type',
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
  } else {
    const err3 = {
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/RegisterResponse/type',
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
  validate243.errors = vErrors;
  return errors === 0;
}
validate243.evaluated = {
  props: { userId: true },
  dynamicProps: false,
  dynamicItems: false,
};
