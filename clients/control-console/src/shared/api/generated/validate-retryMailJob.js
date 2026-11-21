// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const retryMailJobInput = validate234;
const schema306 = {
  type: 'object',
  properties: {
    path: {
      type: 'object',
      properties: { id: { type: 'string', format: 'uuid' } },
      required: ['id'],
    },
    query: {
      type: 'object',
      properties: { tenantId: { type: 'string', format: 'uuid' } },
      required: [],
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
  },
  required: ['path', 'header'],
  $id: 'https://edition.invalid/validators/retryMailJobInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
const pattern4 = new RegExp('^[a-zA-Z0-9._:-]+$', 'u');
function validate234(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/retryMailJobInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate234.evaluated;
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
    if (data.path !== undefined) {
      let data0 = data.path;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.id === undefined) {
          const err2 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'id' },
            message: "must have required property '" + 'id' + "'",
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
        if (data0.id !== undefined) {
          let data1 = data0.id;
          if (typeof data1 === 'string') {
            if (!formats0.test(data1)) {
              const err3 = {
                instancePath: instancePath + '/path/id',
                schemaPath: '#/properties/path/properties/id/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
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
              instancePath: instancePath + '/path/id',
              schemaPath: '#/properties/path/properties/id/type',
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
          instancePath: instancePath + '/path',
          schemaPath: '#/properties/path/type',
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
    }
    if (data.query !== undefined) {
      let data2 = data.query;
      if (data2 && typeof data2 == 'object' && !Array.isArray(data2)) {
        if (data2.tenantId !== undefined) {
          let data3 = data2.tenantId;
          if (typeof data3 === 'string') {
            if (!formats0.test(data3)) {
              const err6 = {
                instancePath: instancePath + '/query/tenantId',
                schemaPath: '#/properties/query/properties/tenantId/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
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
              instancePath: instancePath + '/query/tenantId',
              schemaPath: '#/properties/query/properties/tenantId/type',
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
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
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
    if (data.header !== undefined) {
      let data4 = data.header;
      if (data4 && typeof data4 == 'object' && !Array.isArray(data4)) {
        if (data4['Idempotency-Key'] === undefined) {
          const err9 = {
            instancePath: instancePath + '/header',
            schemaPath: '#/properties/header/required',
            keyword: 'required',
            params: { missingProperty: 'Idempotency-Key' },
            message: "must have required property '" + 'Idempotency-Key' + "'",
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
        if (data4['Idempotency-Key'] !== undefined) {
          let data5 = data4['Idempotency-Key'];
          if (typeof data5 === 'string') {
            if (func1(data5) > 128) {
              const err10 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/maxLength',
                keyword: 'maxLength',
                params: { limit: 128 },
                message: 'must NOT have more than 128 characters',
              };
              if (vErrors === null) {
                vErrors = [err10];
              } else {
                vErrors.push(err10);
              }
              errors++;
            }
            if (func1(data5) < 1) {
              const err11 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
              };
              if (vErrors === null) {
                vErrors = [err11];
              } else {
                vErrors.push(err11);
              }
              errors++;
            }
            if (!pattern4.test(data5)) {
              const err12 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/pattern',
                keyword: 'pattern',
                params: { pattern: '^[a-zA-Z0-9._:-]+$' },
                message: 'must match pattern "' + '^[a-zA-Z0-9._:-]+$' + '"',
              };
              if (vErrors === null) {
                vErrors = [err12];
              } else {
                vErrors.push(err12);
              }
              errors++;
            }
          } else {
            const err13 = {
              instancePath: instancePath + '/header/Idempotency-Key',
              schemaPath: '#/properties/header/properties/Idempotency-Key/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err13];
            } else {
              vErrors.push(err13);
            }
            errors++;
          }
        }
      } else {
        const err14 = {
          instancePath: instancePath + '/header',
          schemaPath: '#/properties/header/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
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
      instancePath,
      schemaPath: '#/type',
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
  validate234.errors = vErrors;
  return errors === 0;
}
validate234.evaluated = {
  props: { path: true, query: true, header: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const retryMailJobOutput = validate235;
const schema307 = {
  $ref: 'https://edition.invalid/control#/components/schemas/MailJob',
  $id: 'https://edition.invalid/validators/retryMailJobOutput',
};
const schema308 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    kind: { type: 'string' },
    recipient: { type: 'string' },
    tenantId: { type: 'string', format: 'uuid' },
    status: { type: 'string' },
    attempt: { type: 'integer', format: 'int32' },
    nextRunAt: { type: 'string', format: 'date-time' },
    error: { type: 'string' },
    traceId: { type: 'string', format: 'uuid' },
    outcome: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    completedAt: { type: 'string', format: 'date-time' },
    canRetry: { type: 'boolean' },
  },
};
const formats10 = fullFormats['date-time'];
function validate235(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/retryMailJobOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate235.evaluated;
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
              'https://edition.invalid/control#/components/schemas/MailJob/properties/id/format',
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
            'https://edition.invalid/control#/components/schemas/MailJob/properties/id/type',
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
    if (data.kind !== undefined) {
      if (typeof data.kind !== 'string') {
        const err2 = {
          instancePath: instancePath + '/kind',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/MailJob/properties/kind/type',
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
    if (data.recipient !== undefined) {
      if (typeof data.recipient !== 'string') {
        const err3 = {
          instancePath: instancePath + '/recipient',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/MailJob/properties/recipient/type',
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
    if (data.tenantId !== undefined) {
      let data3 = data.tenantId;
      if (typeof data3 === 'string') {
        if (!formats0.test(data3)) {
          const err4 = {
            instancePath: instancePath + '/tenantId',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/MailJob/properties/tenantId/format',
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
          instancePath: instancePath + '/tenantId',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/MailJob/properties/tenantId/type',
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
    if (data.status !== undefined) {
      if (typeof data.status !== 'string') {
        const err6 = {
          instancePath: instancePath + '/status',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/MailJob/properties/status/type',
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
    if (data.attempt !== undefined) {
      let data5 = data.attempt;
      if (!(typeof data5 == 'number' && !(data5 % 1) && !isNaN(data5))) {
        const err7 = {
          instancePath: instancePath + '/attempt',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/MailJob/properties/attempt/type',
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
    if (data.nextRunAt !== undefined) {
      let data6 = data.nextRunAt;
      if (typeof data6 === 'string') {
        if (!formats10.validate(data6)) {
          const err8 = {
            instancePath: instancePath + '/nextRunAt',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/MailJob/properties/nextRunAt/format',
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
          instancePath: instancePath + '/nextRunAt',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/MailJob/properties/nextRunAt/type',
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
    if (data.error !== undefined) {
      if (typeof data.error !== 'string') {
        const err10 = {
          instancePath: instancePath + '/error',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/MailJob/properties/error/type',
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
    if (data.traceId !== undefined) {
      let data8 = data.traceId;
      if (typeof data8 === 'string') {
        if (!formats0.test(data8)) {
          const err11 = {
            instancePath: instancePath + '/traceId',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/MailJob/properties/traceId/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
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
          instancePath: instancePath + '/traceId',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/MailJob/properties/traceId/type',
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
    if (data.outcome !== undefined) {
      if (typeof data.outcome !== 'string') {
        const err13 = {
          instancePath: instancePath + '/outcome',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/MailJob/properties/outcome/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
    }
    if (data.createdAt !== undefined) {
      let data10 = data.createdAt;
      if (typeof data10 === 'string') {
        if (!formats10.validate(data10)) {
          const err14 = {
            instancePath: instancePath + '/createdAt',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/MailJob/properties/createdAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err14];
          } else {
            vErrors.push(err14);
          }
          errors++;
        }
      } else {
        const err15 = {
          instancePath: instancePath + '/createdAt',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/MailJob/properties/createdAt/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err15];
        } else {
          vErrors.push(err15);
        }
        errors++;
      }
    }
    if (data.completedAt !== undefined) {
      let data11 = data.completedAt;
      if (typeof data11 === 'string') {
        if (!formats10.validate(data11)) {
          const err16 = {
            instancePath: instancePath + '/completedAt',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/MailJob/properties/completedAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err16];
          } else {
            vErrors.push(err16);
          }
          errors++;
        }
      } else {
        const err17 = {
          instancePath: instancePath + '/completedAt',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/MailJob/properties/completedAt/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err17];
        } else {
          vErrors.push(err17);
        }
        errors++;
      }
    }
    if (data.canRetry !== undefined) {
      if (typeof data.canRetry !== 'boolean') {
        const err18 = {
          instancePath: instancePath + '/canRetry',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/MailJob/properties/canRetry/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err18];
        } else {
          vErrors.push(err18);
        }
        errors++;
      }
    }
  } else {
    const err19 = {
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/MailJob/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err19];
    } else {
      vErrors.push(err19);
    }
    errors++;
  }
  validate235.errors = vErrors;
  return errors === 0;
}
validate235.evaluated = {
  props: {
    id: true,
    kind: true,
    recipient: true,
    tenantId: true,
    status: true,
    attempt: true,
    nextRunAt: true,
    error: true,
    traceId: true,
    outcome: true,
    createdAt: true,
    completedAt: true,
    canRetry: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
export const retryMailJobOutputFull = validate236;
const schema309 = {
  $ref: 'https://edition.invalid/control#/components/schemas/MailJob',
  $id: 'https://edition.invalid/validators/retryMailJobOutputFull',
};
function validate236(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/retryMailJobOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate236.evaluated;
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
              'https://edition.invalid/control#/components/schemas/MailJob/properties/id/format',
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
            'https://edition.invalid/control#/components/schemas/MailJob/properties/id/type',
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
    if (data.kind !== undefined) {
      if (typeof data.kind !== 'string') {
        const err2 = {
          instancePath: instancePath + '/kind',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/MailJob/properties/kind/type',
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
    if (data.recipient !== undefined) {
      if (typeof data.recipient !== 'string') {
        const err3 = {
          instancePath: instancePath + '/recipient',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/MailJob/properties/recipient/type',
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
    if (data.tenantId !== undefined) {
      let data3 = data.tenantId;
      if (typeof data3 === 'string') {
        if (!formats0.test(data3)) {
          const err4 = {
            instancePath: instancePath + '/tenantId',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/MailJob/properties/tenantId/format',
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
          instancePath: instancePath + '/tenantId',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/MailJob/properties/tenantId/type',
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
    if (data.status !== undefined) {
      if (typeof data.status !== 'string') {
        const err6 = {
          instancePath: instancePath + '/status',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/MailJob/properties/status/type',
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
    if (data.attempt !== undefined) {
      let data5 = data.attempt;
      if (!(typeof data5 == 'number' && !(data5 % 1) && !isNaN(data5))) {
        const err7 = {
          instancePath: instancePath + '/attempt',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/MailJob/properties/attempt/type',
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
    if (data.nextRunAt !== undefined) {
      let data6 = data.nextRunAt;
      if (typeof data6 === 'string') {
        if (!formats10.validate(data6)) {
          const err8 = {
            instancePath: instancePath + '/nextRunAt',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/MailJob/properties/nextRunAt/format',
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
          instancePath: instancePath + '/nextRunAt',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/MailJob/properties/nextRunAt/type',
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
    if (data.error !== undefined) {
      if (typeof data.error !== 'string') {
        const err10 = {
          instancePath: instancePath + '/error',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/MailJob/properties/error/type',
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
    if (data.traceId !== undefined) {
      let data8 = data.traceId;
      if (typeof data8 === 'string') {
        if (!formats0.test(data8)) {
          const err11 = {
            instancePath: instancePath + '/traceId',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/MailJob/properties/traceId/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
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
          instancePath: instancePath + '/traceId',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/MailJob/properties/traceId/type',
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
    if (data.outcome !== undefined) {
      if (typeof data.outcome !== 'string') {
        const err13 = {
          instancePath: instancePath + '/outcome',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/MailJob/properties/outcome/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
    }
    if (data.createdAt !== undefined) {
      let data10 = data.createdAt;
      if (typeof data10 === 'string') {
        if (!formats10.validate(data10)) {
          const err14 = {
            instancePath: instancePath + '/createdAt',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/MailJob/properties/createdAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err14];
          } else {
            vErrors.push(err14);
          }
          errors++;
        }
      } else {
        const err15 = {
          instancePath: instancePath + '/createdAt',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/MailJob/properties/createdAt/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err15];
        } else {
          vErrors.push(err15);
        }
        errors++;
      }
    }
    if (data.completedAt !== undefined) {
      let data11 = data.completedAt;
      if (typeof data11 === 'string') {
        if (!formats10.validate(data11)) {
          const err16 = {
            instancePath: instancePath + '/completedAt',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/MailJob/properties/completedAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err16];
          } else {
            vErrors.push(err16);
          }
          errors++;
        }
      } else {
        const err17 = {
          instancePath: instancePath + '/completedAt',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/MailJob/properties/completedAt/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err17];
        } else {
          vErrors.push(err17);
        }
        errors++;
      }
    }
    if (data.canRetry !== undefined) {
      if (typeof data.canRetry !== 'boolean') {
        const err18 = {
          instancePath: instancePath + '/canRetry',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/MailJob/properties/canRetry/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err18];
        } else {
          vErrors.push(err18);
        }
        errors++;
      }
    }
  } else {
    const err19 = {
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/MailJob/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err19];
    } else {
      vErrors.push(err19);
    }
    errors++;
  }
  validate236.errors = vErrors;
  return errors === 0;
}
validate236.evaluated = {
  props: {
    id: true,
    kind: true,
    recipient: true,
    tenantId: true,
    status: true,
    attempt: true,
    nextRunAt: true,
    error: true,
    traceId: true,
    outcome: true,
    createdAt: true,
    completedAt: true,
    canRetry: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
