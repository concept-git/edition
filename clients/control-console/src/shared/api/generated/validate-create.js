// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const createInput = validate279;
const schema374 = {
  type: 'object',
  properties: {
    path: {
      type: 'object',
      properties: { tenantId: { type: 'string', format: 'uuid' } },
      required: ['tenantId'],
    },
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
      $ref: 'https://edition.invalid/control#/components/schemas/TeamNameRequest',
    },
  },
  required: ['path', 'header', 'body'],
  $id: 'https://edition.invalid/validators/createInput',
};
const schema375 = {
  type: 'object',
  properties: { name: { type: 'string', maxLength: 120, minLength: 0 } },
  required: ['name'],
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
const pattern4 = new RegExp('^[a-zA-Z0-9._:-]+$', 'u');
function validate279(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/createInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate279.evaluated;
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
    if (data.header === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'header' },
        message: "must have required property '" + 'header' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.body === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'body' },
        message: "must have required property '" + 'body' + "'",
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
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.tenantId === undefined) {
          const err3 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'tenantId' },
            message: "must have required property '" + 'tenantId' + "'",
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
        if (data0.tenantId !== undefined) {
          let data1 = data0.tenantId;
          if (typeof data1 === 'string') {
            if (!formats0.test(data1)) {
              const err4 = {
                instancePath: instancePath + '/path/tenantId',
                schemaPath: '#/properties/path/properties/tenantId/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
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
              instancePath: instancePath + '/path/tenantId',
              schemaPath: '#/properties/path/properties/tenantId/type',
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
      } else {
        const err6 = {
          instancePath: instancePath + '/path',
          schemaPath: '#/properties/path/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.header !== undefined) {
      let data2 = data.header;
      if (data2 && typeof data2 == 'object' && !Array.isArray(data2)) {
        if (data2['Idempotency-Key'] === undefined) {
          const err7 = {
            instancePath: instancePath + '/header',
            schemaPath: '#/properties/header/required',
            keyword: 'required',
            params: { missingProperty: 'Idempotency-Key' },
            message: "must have required property '" + 'Idempotency-Key' + "'",
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
        if (data2['Idempotency-Key'] !== undefined) {
          let data3 = data2['Idempotency-Key'];
          if (typeof data3 === 'string') {
            if (func1(data3) > 128) {
              const err8 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/maxLength',
                keyword: 'maxLength',
                params: { limit: 128 },
                message: 'must NOT have more than 128 characters',
              };
              if (vErrors === null) {
                vErrors = [err8];
              } else {
                vErrors.push(err8);
              }
              errors++;
            }
            if (func1(data3) < 1) {
              const err9 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/minLength',
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
            if (!pattern4.test(data3)) {
              const err10 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/pattern',
                keyword: 'pattern',
                params: { pattern: '^[a-zA-Z0-9._:-]+$' },
                message: 'must match pattern "' + '^[a-zA-Z0-9._:-]+$' + '"',
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
              instancePath: instancePath + '/header/Idempotency-Key',
              schemaPath: '#/properties/header/properties/Idempotency-Key/type',
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
      } else {
        const err12 = {
          instancePath: instancePath + '/header',
          schemaPath: '#/properties/header/type',
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
    }
    if (data.body !== undefined) {
      let data4 = data.body;
      if (data4 && typeof data4 == 'object' && !Array.isArray(data4)) {
        if (data4.name === undefined) {
          const err13 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/TeamNameRequest/required',
            keyword: 'required',
            params: { missingProperty: 'name' },
            message: "must have required property '" + 'name' + "'",
          };
          if (vErrors === null) {
            vErrors = [err13];
          } else {
            vErrors.push(err13);
          }
          errors++;
        }
        if (data4.name !== undefined) {
          let data5 = data4.name;
          if (typeof data5 === 'string') {
            if (func1(data5) > 120) {
              const err14 = {
                instancePath: instancePath + '/body/name',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/TeamNameRequest/properties/name/maxLength',
                keyword: 'maxLength',
                params: { limit: 120 },
                message: 'must NOT have more than 120 characters',
              };
              if (vErrors === null) {
                vErrors = [err14];
              } else {
                vErrors.push(err14);
              }
              errors++;
            }
            if (func1(data5) < 0) {
              const err15 = {
                instancePath: instancePath + '/body/name',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/TeamNameRequest/properties/name/minLength',
                keyword: 'minLength',
                params: { limit: 0 },
                message: 'must NOT have fewer than 0 characters',
              };
              if (vErrors === null) {
                vErrors = [err15];
              } else {
                vErrors.push(err15);
              }
              errors++;
            }
          } else {
            const err16 = {
              instancePath: instancePath + '/body/name',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/TeamNameRequest/properties/name/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err16];
            } else {
              vErrors.push(err16);
            }
            errors++;
          }
        }
      } else {
        const err17 = {
          instancePath: instancePath + '/body',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TeamNameRequest/type',
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
    }
  } else {
    const err18 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err18];
    } else {
      vErrors.push(err18);
    }
    errors++;
  }
  validate279.errors = vErrors;
  return errors === 0;
}
validate279.evaluated = {
  props: { path: true, header: true, body: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const createOutput = validate280;
const schema376 = {
  $ref: 'https://edition.invalid/control#/components/schemas/TeamView',
  $id: 'https://edition.invalid/validators/createOutput',
};
const schema368 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    tenantId: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    callerRole: { type: 'string' },
    memberCount: { type: 'integer', format: 'int64' },
    ownerCount: { type: 'integer', format: 'int64' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};
const formats10 = fullFormats['date-time'];
function validate280(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/createOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate280.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.id !== undefined) {
      let data0 = data.id;
      if (typeof data0 === 'string') {
        if (!formats0.test(data0)) {
          const err0 = {
            instancePath: instancePath + '/id',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/TeamView/properties/id/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err0];
          } else {
            vErrors.push(err0);
          }
          errors++;
        }
      } else {
        const err1 = {
          instancePath: instancePath + '/id',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TeamView/properties/id/type',
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
    if (data.tenantId !== undefined) {
      let data1 = data.tenantId;
      if (typeof data1 === 'string') {
        if (!formats0.test(data1)) {
          const err2 = {
            instancePath: instancePath + '/tenantId',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/TeamView/properties/tenantId/format',
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
          instancePath: instancePath + '/tenantId',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TeamView/properties/tenantId/type',
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
    if (data.name !== undefined) {
      if (typeof data.name !== 'string') {
        const err4 = {
          instancePath: instancePath + '/name',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TeamView/properties/name/type',
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
    if (data.callerRole !== undefined) {
      if (typeof data.callerRole !== 'string') {
        const err5 = {
          instancePath: instancePath + '/callerRole',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TeamView/properties/callerRole/type',
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
    if (data.memberCount !== undefined) {
      let data4 = data.memberCount;
      if (!(typeof data4 == 'number' && !(data4 % 1) && !isNaN(data4))) {
        const err6 = {
          instancePath: instancePath + '/memberCount',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TeamView/properties/memberCount/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.ownerCount !== undefined) {
      let data5 = data.ownerCount;
      if (!(typeof data5 == 'number' && !(data5 % 1) && !isNaN(data5))) {
        const err7 = {
          instancePath: instancePath + '/ownerCount',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TeamView/properties/ownerCount/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
    if (data.createdAt !== undefined) {
      let data6 = data.createdAt;
      if (typeof data6 === 'string') {
        if (!formats10.validate(data6)) {
          const err8 = {
            instancePath: instancePath + '/createdAt',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/TeamView/properties/createdAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
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
          instancePath: instancePath + '/createdAt',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TeamView/properties/createdAt/type',
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
    if (data.updatedAt !== undefined) {
      let data7 = data.updatedAt;
      if (typeof data7 === 'string') {
        if (!formats10.validate(data7)) {
          const err10 = {
            instancePath: instancePath + '/updatedAt',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/TeamView/properties/updatedAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
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
          instancePath: instancePath + '/updatedAt',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TeamView/properties/updatedAt/type',
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
  } else {
    const err12 = {
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/TeamView/type',
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
  validate280.errors = vErrors;
  return errors === 0;
}
validate280.evaluated = {
  props: {
    id: true,
    tenantId: true,
    name: true,
    callerRole: true,
    memberCount: true,
    ownerCount: true,
    createdAt: true,
    updatedAt: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
export const createOutputFull = validate281;
const schema378 = {
  $ref: 'https://edition.invalid/control#/components/schemas/TeamView',
  $id: 'https://edition.invalid/validators/createOutputFull',
};
function validate281(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/createOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate281.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.id !== undefined) {
      let data0 = data.id;
      if (typeof data0 === 'string') {
        if (!formats0.test(data0)) {
          const err0 = {
            instancePath: instancePath + '/id',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/TeamView/properties/id/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err0];
          } else {
            vErrors.push(err0);
          }
          errors++;
        }
      } else {
        const err1 = {
          instancePath: instancePath + '/id',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TeamView/properties/id/type',
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
    if (data.tenantId !== undefined) {
      let data1 = data.tenantId;
      if (typeof data1 === 'string') {
        if (!formats0.test(data1)) {
          const err2 = {
            instancePath: instancePath + '/tenantId',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/TeamView/properties/tenantId/format',
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
          instancePath: instancePath + '/tenantId',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TeamView/properties/tenantId/type',
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
    if (data.name !== undefined) {
      if (typeof data.name !== 'string') {
        const err4 = {
          instancePath: instancePath + '/name',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TeamView/properties/name/type',
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
    if (data.callerRole !== undefined) {
      if (typeof data.callerRole !== 'string') {
        const err5 = {
          instancePath: instancePath + '/callerRole',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TeamView/properties/callerRole/type',
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
    if (data.memberCount !== undefined) {
      let data4 = data.memberCount;
      if (!(typeof data4 == 'number' && !(data4 % 1) && !isNaN(data4))) {
        const err6 = {
          instancePath: instancePath + '/memberCount',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TeamView/properties/memberCount/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.ownerCount !== undefined) {
      let data5 = data.ownerCount;
      if (!(typeof data5 == 'number' && !(data5 % 1) && !isNaN(data5))) {
        const err7 = {
          instancePath: instancePath + '/ownerCount',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TeamView/properties/ownerCount/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
    if (data.createdAt !== undefined) {
      let data6 = data.createdAt;
      if (typeof data6 === 'string') {
        if (!formats10.validate(data6)) {
          const err8 = {
            instancePath: instancePath + '/createdAt',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/TeamView/properties/createdAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
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
          instancePath: instancePath + '/createdAt',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TeamView/properties/createdAt/type',
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
    if (data.updatedAt !== undefined) {
      let data7 = data.updatedAt;
      if (typeof data7 === 'string') {
        if (!formats10.validate(data7)) {
          const err10 = {
            instancePath: instancePath + '/updatedAt',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/TeamView/properties/updatedAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
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
          instancePath: instancePath + '/updatedAt',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TeamView/properties/updatedAt/type',
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
  } else {
    const err12 = {
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/TeamView/type',
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
  validate281.errors = vErrors;
  return errors === 0;
}
validate281.evaluated = {
  props: {
    id: true,
    tenantId: true,
    name: true,
    callerRole: true,
    memberCount: true,
    ownerCount: true,
    createdAt: true,
    updatedAt: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
