// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const listMailJobsInput = validate966;
const schema1131 = {
  type: 'object',
  properties: {
    query: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', format: 'uuid' },
        cursor: { type: 'string' },
        limit: {
          type: 'integer',
          format: 'int32',
          default: 20,
          maximum: 100,
          minimum: 1,
        },
        fields: { type: 'string', maxLength: 4096, minLength: 1 },
      },
      required: [],
    },
  },
  required: [],
  $id: 'https://edition.invalid/validators/listMailJobsInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
function validate966(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listMailJobsInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate966.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.query !== undefined) {
      let data0 = data.query;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.tenantId !== undefined) {
          let data1 = data0.tenantId;
          if (typeof data1 === 'string') {
            if (!formats0.test(data1)) {
              const err0 = {
                instancePath: instancePath + '/query/tenantId',
                schemaPath: '#/properties/query/properties/tenantId/format',
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
              instancePath: instancePath + '/query/tenantId',
              schemaPath: '#/properties/query/properties/tenantId/type',
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
        if (data0.cursor !== undefined) {
          if (typeof data0.cursor !== 'string') {
            const err2 = {
              instancePath: instancePath + '/query/cursor',
              schemaPath: '#/properties/query/properties/cursor/type',
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
        if (data0.limit !== undefined) {
          let data3 = data0.limit;
          if (!(typeof data3 == 'number' && !(data3 % 1) && !isNaN(data3))) {
            const err3 = {
              instancePath: instancePath + '/query/limit',
              schemaPath: '#/properties/query/properties/limit/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err3];
            } else {
              vErrors.push(err3);
            }
            errors++;
          }
          if (typeof data3 == 'number') {
            if (data3 > 100 || isNaN(data3)) {
              const err4 = {
                instancePath: instancePath + '/query/limit',
                schemaPath: '#/properties/query/properties/limit/maximum',
                keyword: 'maximum',
                params: { comparison: '<=', limit: 100 },
                message: 'must be <= 100',
              };
              if (vErrors === null) {
                vErrors = [err4];
              } else {
                vErrors.push(err4);
              }
              errors++;
            }
            if (data3 < 1 || isNaN(data3)) {
              const err5 = {
                instancePath: instancePath + '/query/limit',
                schemaPath: '#/properties/query/properties/limit/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err5];
              } else {
                vErrors.push(err5);
              }
              errors++;
            }
          }
        }
        if (data0.fields !== undefined) {
          let data4 = data0.fields;
          if (typeof data4 === 'string') {
            if (func1(data4) > 4096) {
              const err6 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/maxLength',
                keyword: 'maxLength',
                params: { limit: 4096 },
                message: 'must NOT have more than 4096 characters',
              };
              if (vErrors === null) {
                vErrors = [err6];
              } else {
                vErrors.push(err6);
              }
              errors++;
            }
            if (func1(data4) < 1) {
              const err7 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/minLength',
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
              instancePath: instancePath + '/query/fields',
              schemaPath: '#/properties/query/properties/fields/type',
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
      } else {
        const err9 = {
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
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
  validate966.errors = vErrors;
  return errors === 0;
}
validate966.evaluated = {
  props: { query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const listMailJobsOutput = validate967;
const schema1132 = {
  anyOf: [
    { $ref: 'https://edition.invalid/control#/components/schemas/MailJobPage' },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialMailJobPage',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/listMailJobsOutput',
};
const schema1133 = {
  type: 'object',
  properties: {
    items: { type: 'array', items: { $ref: '#/components/schemas/MailJob' } },
    nextCursor: { type: 'string' },
  },
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
function validate968(
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
  const evaluated0 = validate968.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.items !== undefined) {
      let data0 = data.items;
      if (Array.isArray(data0)) {
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data1 = data0[i0];
          if (data1 && typeof data1 == 'object' && !Array.isArray(data1)) {
            if (data1.id !== undefined) {
              let data2 = data1.id;
              if (typeof data2 === 'string') {
                if (!formats0.test(data2)) {
                  const err0 = {
                    instancePath: instancePath + '/items/' + i0 + '/id',
                    schemaPath:
                      '#/components/schemas/MailJob/properties/id/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/id',
                  schemaPath: '#/components/schemas/MailJob/properties/id/type',
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
            if (data1.kind !== undefined) {
              if (typeof data1.kind !== 'string') {
                const err2 = {
                  instancePath: instancePath + '/items/' + i0 + '/kind',
                  schemaPath:
                    '#/components/schemas/MailJob/properties/kind/type',
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
            if (data1.recipient !== undefined) {
              if (typeof data1.recipient !== 'string') {
                const err3 = {
                  instancePath: instancePath + '/items/' + i0 + '/recipient',
                  schemaPath:
                    '#/components/schemas/MailJob/properties/recipient/type',
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
            if (data1.tenantId !== undefined) {
              let data5 = data1.tenantId;
              if (typeof data5 === 'string') {
                if (!formats0.test(data5)) {
                  const err4 = {
                    instancePath: instancePath + '/items/' + i0 + '/tenantId',
                    schemaPath:
                      '#/components/schemas/MailJob/properties/tenantId/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/tenantId',
                  schemaPath:
                    '#/components/schemas/MailJob/properties/tenantId/type',
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
            if (data1.status !== undefined) {
              if (typeof data1.status !== 'string') {
                const err6 = {
                  instancePath: instancePath + '/items/' + i0 + '/status',
                  schemaPath:
                    '#/components/schemas/MailJob/properties/status/type',
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
            if (data1.attempt !== undefined) {
              let data7 = data1.attempt;
              if (!(
                typeof data7 == 'number' &&
                !(data7 % 1) &&
                !isNaN(data7)
              )) {
                const err7 = {
                  instancePath: instancePath + '/items/' + i0 + '/attempt',
                  schemaPath:
                    '#/components/schemas/MailJob/properties/attempt/type',
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
            if (data1.nextRunAt !== undefined) {
              let data8 = data1.nextRunAt;
              if (typeof data8 === 'string') {
                if (!formats10.validate(data8)) {
                  const err8 = {
                    instancePath: instancePath + '/items/' + i0 + '/nextRunAt',
                    schemaPath:
                      '#/components/schemas/MailJob/properties/nextRunAt/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/nextRunAt',
                  schemaPath:
                    '#/components/schemas/MailJob/properties/nextRunAt/type',
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
            if (data1.error !== undefined) {
              if (typeof data1.error !== 'string') {
                const err10 = {
                  instancePath: instancePath + '/items/' + i0 + '/error',
                  schemaPath:
                    '#/components/schemas/MailJob/properties/error/type',
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
            if (data1.traceId !== undefined) {
              let data10 = data1.traceId;
              if (typeof data10 === 'string') {
                if (!formats0.test(data10)) {
                  const err11 = {
                    instancePath: instancePath + '/items/' + i0 + '/traceId',
                    schemaPath:
                      '#/components/schemas/MailJob/properties/traceId/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/traceId',
                  schemaPath:
                    '#/components/schemas/MailJob/properties/traceId/type',
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
            if (data1.outcome !== undefined) {
              if (typeof data1.outcome !== 'string') {
                const err13 = {
                  instancePath: instancePath + '/items/' + i0 + '/outcome',
                  schemaPath:
                    '#/components/schemas/MailJob/properties/outcome/type',
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
            if (data1.createdAt !== undefined) {
              let data12 = data1.createdAt;
              if (typeof data12 === 'string') {
                if (!formats10.validate(data12)) {
                  const err14 = {
                    instancePath: instancePath + '/items/' + i0 + '/createdAt',
                    schemaPath:
                      '#/components/schemas/MailJob/properties/createdAt/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/createdAt',
                  schemaPath:
                    '#/components/schemas/MailJob/properties/createdAt/type',
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
            if (data1.completedAt !== undefined) {
              let data13 = data1.completedAt;
              if (typeof data13 === 'string') {
                if (!formats10.validate(data13)) {
                  const err16 = {
                    instancePath:
                      instancePath + '/items/' + i0 + '/completedAt',
                    schemaPath:
                      '#/components/schemas/MailJob/properties/completedAt/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/completedAt',
                  schemaPath:
                    '#/components/schemas/MailJob/properties/completedAt/type',
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
            if (data1.canRetry !== undefined) {
              if (typeof data1.canRetry !== 'boolean') {
                const err18 = {
                  instancePath: instancePath + '/items/' + i0 + '/canRetry',
                  schemaPath:
                    '#/components/schemas/MailJob/properties/canRetry/type',
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
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/MailJob/type',
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
        }
      } else {
        const err20 = {
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.nextCursor !== undefined) {
      if (typeof data.nextCursor !== 'string') {
        const err21 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err21];
        } else {
          vErrors.push(err21);
        }
        errors++;
      }
    }
  } else {
    const err22 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err22];
    } else {
      vErrors.push(err22);
    }
    errors++;
  }
  validate968.errors = vErrors;
  return errors === 0;
}
validate968.evaluated = {
  props: { items: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
const schema1135 = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialMailJob' },
    },
    nextCursor: { type: 'string' },
  },
};
const schema1136 = {
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
function validate970(
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
  const evaluated0 = validate970.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.items !== undefined) {
      let data0 = data.items;
      if (Array.isArray(data0)) {
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data1 = data0[i0];
          if (data1 && typeof data1 == 'object' && !Array.isArray(data1)) {
            if (data1.id !== undefined) {
              let data2 = data1.id;
              if (typeof data2 === 'string') {
                if (!formats0.test(data2)) {
                  const err0 = {
                    instancePath: instancePath + '/items/' + i0 + '/id',
                    schemaPath:
                      '#/components/schemas/PartialMailJob/properties/id/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/id',
                  schemaPath:
                    '#/components/schemas/PartialMailJob/properties/id/type',
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
            if (data1.kind !== undefined) {
              if (typeof data1.kind !== 'string') {
                const err2 = {
                  instancePath: instancePath + '/items/' + i0 + '/kind',
                  schemaPath:
                    '#/components/schemas/PartialMailJob/properties/kind/type',
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
            if (data1.recipient !== undefined) {
              if (typeof data1.recipient !== 'string') {
                const err3 = {
                  instancePath: instancePath + '/items/' + i0 + '/recipient',
                  schemaPath:
                    '#/components/schemas/PartialMailJob/properties/recipient/type',
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
            if (data1.tenantId !== undefined) {
              let data5 = data1.tenantId;
              if (typeof data5 === 'string') {
                if (!formats0.test(data5)) {
                  const err4 = {
                    instancePath: instancePath + '/items/' + i0 + '/tenantId',
                    schemaPath:
                      '#/components/schemas/PartialMailJob/properties/tenantId/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/tenantId',
                  schemaPath:
                    '#/components/schemas/PartialMailJob/properties/tenantId/type',
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
            if (data1.status !== undefined) {
              if (typeof data1.status !== 'string') {
                const err6 = {
                  instancePath: instancePath + '/items/' + i0 + '/status',
                  schemaPath:
                    '#/components/schemas/PartialMailJob/properties/status/type',
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
            if (data1.attempt !== undefined) {
              let data7 = data1.attempt;
              if (!(
                typeof data7 == 'number' &&
                !(data7 % 1) &&
                !isNaN(data7)
              )) {
                const err7 = {
                  instancePath: instancePath + '/items/' + i0 + '/attempt',
                  schemaPath:
                    '#/components/schemas/PartialMailJob/properties/attempt/type',
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
            if (data1.nextRunAt !== undefined) {
              let data8 = data1.nextRunAt;
              if (typeof data8 === 'string') {
                if (!formats10.validate(data8)) {
                  const err8 = {
                    instancePath: instancePath + '/items/' + i0 + '/nextRunAt',
                    schemaPath:
                      '#/components/schemas/PartialMailJob/properties/nextRunAt/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/nextRunAt',
                  schemaPath:
                    '#/components/schemas/PartialMailJob/properties/nextRunAt/type',
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
            if (data1.error !== undefined) {
              if (typeof data1.error !== 'string') {
                const err10 = {
                  instancePath: instancePath + '/items/' + i0 + '/error',
                  schemaPath:
                    '#/components/schemas/PartialMailJob/properties/error/type',
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
            if (data1.traceId !== undefined) {
              let data10 = data1.traceId;
              if (typeof data10 === 'string') {
                if (!formats0.test(data10)) {
                  const err11 = {
                    instancePath: instancePath + '/items/' + i0 + '/traceId',
                    schemaPath:
                      '#/components/schemas/PartialMailJob/properties/traceId/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/traceId',
                  schemaPath:
                    '#/components/schemas/PartialMailJob/properties/traceId/type',
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
            if (data1.outcome !== undefined) {
              if (typeof data1.outcome !== 'string') {
                const err13 = {
                  instancePath: instancePath + '/items/' + i0 + '/outcome',
                  schemaPath:
                    '#/components/schemas/PartialMailJob/properties/outcome/type',
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
            if (data1.createdAt !== undefined) {
              let data12 = data1.createdAt;
              if (typeof data12 === 'string') {
                if (!formats10.validate(data12)) {
                  const err14 = {
                    instancePath: instancePath + '/items/' + i0 + '/createdAt',
                    schemaPath:
                      '#/components/schemas/PartialMailJob/properties/createdAt/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/createdAt',
                  schemaPath:
                    '#/components/schemas/PartialMailJob/properties/createdAt/type',
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
            if (data1.completedAt !== undefined) {
              let data13 = data1.completedAt;
              if (typeof data13 === 'string') {
                if (!formats10.validate(data13)) {
                  const err16 = {
                    instancePath:
                      instancePath + '/items/' + i0 + '/completedAt',
                    schemaPath:
                      '#/components/schemas/PartialMailJob/properties/completedAt/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/completedAt',
                  schemaPath:
                    '#/components/schemas/PartialMailJob/properties/completedAt/type',
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
            if (data1.canRetry !== undefined) {
              if (typeof data1.canRetry !== 'boolean') {
                const err18 = {
                  instancePath: instancePath + '/items/' + i0 + '/canRetry',
                  schemaPath:
                    '#/components/schemas/PartialMailJob/properties/canRetry/type',
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
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/PartialMailJob/type',
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
        }
      } else {
        const err20 = {
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.nextCursor !== undefined) {
      if (typeof data.nextCursor !== 'string') {
        const err21 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err21];
        } else {
          vErrors.push(err21);
        }
        errors++;
      }
    }
  } else {
    const err22 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err22];
    } else {
      vErrors.push(err22);
    }
    errors++;
  }
  validate970.errors = vErrors;
  return errors === 0;
}
validate970.evaluated = {
  props: { items: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate967(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listMailJobsOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate967.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  const _errs0 = errors;
  let valid0 = false;
  const _errs1 = errors;
  if (
    !validate968(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate968.errors
        : vErrors.concat(validate968.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = {};
    props0.items = true;
    props0.nextCursor = true;
  }
  const _errs2 = errors;
  if (
    !validate970(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate970.errors
        : vErrors.concat(validate970.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = props0 || {};
      props0.items = true;
      props0.nextCursor = true;
    }
  }
  if (!valid0) {
    const err0 = {
      instancePath,
      schemaPath: '#/anyOf',
      keyword: 'anyOf',
      params: {},
      message: 'must match a schema in anyOf',
    };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate967.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate967.evaluated = { dynamicProps: true, dynamicItems: false };
export const listMailJobsOutputFull = validate972;
const schema1137 = {
  $ref: 'https://edition.invalid/control#/components/schemas/MailJobPage',
  $id: 'https://edition.invalid/validators/listMailJobsOutputFull',
};
function validate973(
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
  const evaluated0 = validate973.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.items !== undefined) {
      let data0 = data.items;
      if (Array.isArray(data0)) {
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data1 = data0[i0];
          if (data1 && typeof data1 == 'object' && !Array.isArray(data1)) {
            if (data1.id !== undefined) {
              let data2 = data1.id;
              if (typeof data2 === 'string') {
                if (!formats0.test(data2)) {
                  const err0 = {
                    instancePath: instancePath + '/items/' + i0 + '/id',
                    schemaPath:
                      '#/components/schemas/MailJob/properties/id/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/id',
                  schemaPath: '#/components/schemas/MailJob/properties/id/type',
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
            if (data1.kind !== undefined) {
              if (typeof data1.kind !== 'string') {
                const err2 = {
                  instancePath: instancePath + '/items/' + i0 + '/kind',
                  schemaPath:
                    '#/components/schemas/MailJob/properties/kind/type',
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
            if (data1.recipient !== undefined) {
              if (typeof data1.recipient !== 'string') {
                const err3 = {
                  instancePath: instancePath + '/items/' + i0 + '/recipient',
                  schemaPath:
                    '#/components/schemas/MailJob/properties/recipient/type',
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
            if (data1.tenantId !== undefined) {
              let data5 = data1.tenantId;
              if (typeof data5 === 'string') {
                if (!formats0.test(data5)) {
                  const err4 = {
                    instancePath: instancePath + '/items/' + i0 + '/tenantId',
                    schemaPath:
                      '#/components/schemas/MailJob/properties/tenantId/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/tenantId',
                  schemaPath:
                    '#/components/schemas/MailJob/properties/tenantId/type',
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
            if (data1.status !== undefined) {
              if (typeof data1.status !== 'string') {
                const err6 = {
                  instancePath: instancePath + '/items/' + i0 + '/status',
                  schemaPath:
                    '#/components/schemas/MailJob/properties/status/type',
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
            if (data1.attempt !== undefined) {
              let data7 = data1.attempt;
              if (!(
                typeof data7 == 'number' &&
                !(data7 % 1) &&
                !isNaN(data7)
              )) {
                const err7 = {
                  instancePath: instancePath + '/items/' + i0 + '/attempt',
                  schemaPath:
                    '#/components/schemas/MailJob/properties/attempt/type',
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
            if (data1.nextRunAt !== undefined) {
              let data8 = data1.nextRunAt;
              if (typeof data8 === 'string') {
                if (!formats10.validate(data8)) {
                  const err8 = {
                    instancePath: instancePath + '/items/' + i0 + '/nextRunAt',
                    schemaPath:
                      '#/components/schemas/MailJob/properties/nextRunAt/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/nextRunAt',
                  schemaPath:
                    '#/components/schemas/MailJob/properties/nextRunAt/type',
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
            if (data1.error !== undefined) {
              if (typeof data1.error !== 'string') {
                const err10 = {
                  instancePath: instancePath + '/items/' + i0 + '/error',
                  schemaPath:
                    '#/components/schemas/MailJob/properties/error/type',
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
            if (data1.traceId !== undefined) {
              let data10 = data1.traceId;
              if (typeof data10 === 'string') {
                if (!formats0.test(data10)) {
                  const err11 = {
                    instancePath: instancePath + '/items/' + i0 + '/traceId',
                    schemaPath:
                      '#/components/schemas/MailJob/properties/traceId/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/traceId',
                  schemaPath:
                    '#/components/schemas/MailJob/properties/traceId/type',
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
            if (data1.outcome !== undefined) {
              if (typeof data1.outcome !== 'string') {
                const err13 = {
                  instancePath: instancePath + '/items/' + i0 + '/outcome',
                  schemaPath:
                    '#/components/schemas/MailJob/properties/outcome/type',
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
            if (data1.createdAt !== undefined) {
              let data12 = data1.createdAt;
              if (typeof data12 === 'string') {
                if (!formats10.validate(data12)) {
                  const err14 = {
                    instancePath: instancePath + '/items/' + i0 + '/createdAt',
                    schemaPath:
                      '#/components/schemas/MailJob/properties/createdAt/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/createdAt',
                  schemaPath:
                    '#/components/schemas/MailJob/properties/createdAt/type',
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
            if (data1.completedAt !== undefined) {
              let data13 = data1.completedAt;
              if (typeof data13 === 'string') {
                if (!formats10.validate(data13)) {
                  const err16 = {
                    instancePath:
                      instancePath + '/items/' + i0 + '/completedAt',
                    schemaPath:
                      '#/components/schemas/MailJob/properties/completedAt/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/completedAt',
                  schemaPath:
                    '#/components/schemas/MailJob/properties/completedAt/type',
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
            if (data1.canRetry !== undefined) {
              if (typeof data1.canRetry !== 'boolean') {
                const err18 = {
                  instancePath: instancePath + '/items/' + i0 + '/canRetry',
                  schemaPath:
                    '#/components/schemas/MailJob/properties/canRetry/type',
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
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/MailJob/type',
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
        }
      } else {
        const err20 = {
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.nextCursor !== undefined) {
      if (typeof data.nextCursor !== 'string') {
        const err21 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err21];
        } else {
          vErrors.push(err21);
        }
        errors++;
      }
    }
  } else {
    const err22 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err22];
    } else {
      vErrors.push(err22);
    }
    errors++;
  }
  validate973.errors = vErrors;
  return errors === 0;
}
validate973.evaluated = {
  props: { items: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate972(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listMailJobsOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate972.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate973(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate973.errors
        : vErrors.concat(validate973.errors);
    errors = vErrors.length;
  }
  validate972.errors = vErrors;
  return errors === 0;
}
validate972.evaluated = {
  props: { items: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
