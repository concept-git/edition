// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const listAuditInput = validate991;
const schema1162 = {
  type: 'object',
  properties: {
    query: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', format: 'uuid' },
        actor: { type: 'string', format: 'uuid' },
        action: { type: 'string' },
        target: { type: 'string', format: 'uuid' },
        outcome: { type: 'string' },
        from: { type: 'string', format: 'date-time' },
        to: { type: 'string', format: 'date-time' },
        cursor: { type: 'integer', format: 'int64' },
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
  $id: 'https://edition.invalid/validators/listAuditInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const formats10 = fullFormats['date-time'];
const func1 = ucs2Length;
function validate991(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listAuditInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate991.evaluated;
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
        if (data0.actor !== undefined) {
          let data2 = data0.actor;
          if (typeof data2 === 'string') {
            if (!formats0.test(data2)) {
              const err2 = {
                instancePath: instancePath + '/query/actor',
                schemaPath: '#/properties/query/properties/actor/format',
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
              instancePath: instancePath + '/query/actor',
              schemaPath: '#/properties/query/properties/actor/type',
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
        if (data0.action !== undefined) {
          if (typeof data0.action !== 'string') {
            const err4 = {
              instancePath: instancePath + '/query/action',
              schemaPath: '#/properties/query/properties/action/type',
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
        if (data0.target !== undefined) {
          let data4 = data0.target;
          if (typeof data4 === 'string') {
            if (!formats0.test(data4)) {
              const err5 = {
                instancePath: instancePath + '/query/target',
                schemaPath: '#/properties/query/properties/target/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
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
              instancePath: instancePath + '/query/target',
              schemaPath: '#/properties/query/properties/target/type',
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
        if (data0.outcome !== undefined) {
          if (typeof data0.outcome !== 'string') {
            const err7 = {
              instancePath: instancePath + '/query/outcome',
              schemaPath: '#/properties/query/properties/outcome/type',
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
        if (data0.from !== undefined) {
          let data6 = data0.from;
          if (typeof data6 === 'string') {
            if (!formats10.validate(data6)) {
              const err8 = {
                instancePath: instancePath + '/query/from',
                schemaPath: '#/properties/query/properties/from/format',
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
              instancePath: instancePath + '/query/from',
              schemaPath: '#/properties/query/properties/from/type',
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
        if (data0.to !== undefined) {
          let data7 = data0.to;
          if (typeof data7 === 'string') {
            if (!formats10.validate(data7)) {
              const err10 = {
                instancePath: instancePath + '/query/to',
                schemaPath: '#/properties/query/properties/to/format',
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
              instancePath: instancePath + '/query/to',
              schemaPath: '#/properties/query/properties/to/type',
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
        if (data0.cursor !== undefined) {
          let data8 = data0.cursor;
          if (!(typeof data8 == 'number' && !(data8 % 1) && !isNaN(data8))) {
            const err12 = {
              instancePath: instancePath + '/query/cursor',
              schemaPath: '#/properties/query/properties/cursor/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err12];
            } else {
              vErrors.push(err12);
            }
            errors++;
          }
        }
        if (data0.limit !== undefined) {
          let data9 = data0.limit;
          if (!(typeof data9 == 'number' && !(data9 % 1) && !isNaN(data9))) {
            const err13 = {
              instancePath: instancePath + '/query/limit',
              schemaPath: '#/properties/query/properties/limit/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err13];
            } else {
              vErrors.push(err13);
            }
            errors++;
          }
          if (typeof data9 == 'number') {
            if (data9 > 100 || isNaN(data9)) {
              const err14 = {
                instancePath: instancePath + '/query/limit',
                schemaPath: '#/properties/query/properties/limit/maximum',
                keyword: 'maximum',
                params: { comparison: '<=', limit: 100 },
                message: 'must be <= 100',
              };
              if (vErrors === null) {
                vErrors = [err14];
              } else {
                vErrors.push(err14);
              }
              errors++;
            }
            if (data9 < 1 || isNaN(data9)) {
              const err15 = {
                instancePath: instancePath + '/query/limit',
                schemaPath: '#/properties/query/properties/limit/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err15];
              } else {
                vErrors.push(err15);
              }
              errors++;
            }
          }
        }
        if (data0.fields !== undefined) {
          let data10 = data0.fields;
          if (typeof data10 === 'string') {
            if (func1(data10) > 4096) {
              const err16 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/maxLength',
                keyword: 'maxLength',
                params: { limit: 4096 },
                message: 'must NOT have more than 4096 characters',
              };
              if (vErrors === null) {
                vErrors = [err16];
              } else {
                vErrors.push(err16);
              }
              errors++;
            }
            if (func1(data10) < 1) {
              const err17 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
              };
              if (vErrors === null) {
                vErrors = [err17];
              } else {
                vErrors.push(err17);
              }
              errors++;
            }
          } else {
            const err18 = {
              instancePath: instancePath + '/query/fields',
              schemaPath: '#/properties/query/properties/fields/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
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
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
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
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err20];
    } else {
      vErrors.push(err20);
    }
    errors++;
  }
  validate991.errors = vErrors;
  return errors === 0;
}
validate991.evaluated = {
  props: { query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const listAuditOutput = validate992;
const schema1163 = {
  anyOf: [
    { $ref: 'https://edition.invalid/control#/components/schemas/AuditPage' },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialAuditPage',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/listAuditOutput',
};
const schema1164 = {
  type: 'object',
  properties: {
    items: { type: 'array', items: { $ref: '#/components/schemas/AuditItem' } },
    nextCursor: { type: 'integer', format: 'int64' },
    total: { type: 'integer', format: 'int64' },
  },
};
const schema1165 = {
  type: 'object',
  properties: {
    id: { type: 'integer', format: 'int64' },
    eventId: { type: 'string', format: 'uuid' },
    rootId: { type: 'string', format: 'uuid' },
    time: { type: 'string', format: 'date-time' },
    kind: { type: 'string' },
    actorType: { type: 'string' },
    actorId: { type: 'string', format: 'uuid' },
    actorName: { type: 'string' },
    action: { type: 'string' },
    targetType: { type: 'string' },
    targetId: { type: 'string', format: 'uuid' },
    outcome: { type: 'string' },
    ip: { type: 'string' },
    requestId: { type: 'string' },
    credentialId: { type: 'string', format: 'uuid' },
  },
};
function validate993(
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
  const evaluated0 = validate993.evaluated;
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
              if (!(
                typeof data2 == 'number' &&
                !(data2 % 1) &&
                !isNaN(data2)
              )) {
                const err0 = {
                  instancePath: instancePath + '/items/' + i0 + '/id',
                  schemaPath:
                    '#/components/schemas/AuditItem/properties/id/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
                };
                if (vErrors === null) {
                  vErrors = [err0];
                } else {
                  vErrors.push(err0);
                }
                errors++;
              }
            }
            if (data1.eventId !== undefined) {
              let data3 = data1.eventId;
              if (typeof data3 === 'string') {
                if (!formats0.test(data3)) {
                  const err1 = {
                    instancePath: instancePath + '/items/' + i0 + '/eventId',
                    schemaPath:
                      '#/components/schemas/AuditItem/properties/eventId/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/eventId',
                  schemaPath:
                    '#/components/schemas/AuditItem/properties/eventId/type',
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
            if (data1.rootId !== undefined) {
              let data4 = data1.rootId;
              if (typeof data4 === 'string') {
                if (!formats0.test(data4)) {
                  const err3 = {
                    instancePath: instancePath + '/items/' + i0 + '/rootId',
                    schemaPath:
                      '#/components/schemas/AuditItem/properties/rootId/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/rootId',
                  schemaPath:
                    '#/components/schemas/AuditItem/properties/rootId/type',
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
            if (data1.time !== undefined) {
              let data5 = data1.time;
              if (typeof data5 === 'string') {
                if (!formats10.validate(data5)) {
                  const err5 = {
                    instancePath: instancePath + '/items/' + i0 + '/time',
                    schemaPath:
                      '#/components/schemas/AuditItem/properties/time/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
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
                  instancePath: instancePath + '/items/' + i0 + '/time',
                  schemaPath:
                    '#/components/schemas/AuditItem/properties/time/type',
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
            if (data1.kind !== undefined) {
              if (typeof data1.kind !== 'string') {
                const err7 = {
                  instancePath: instancePath + '/items/' + i0 + '/kind',
                  schemaPath:
                    '#/components/schemas/AuditItem/properties/kind/type',
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
            if (data1.actorType !== undefined) {
              if (typeof data1.actorType !== 'string') {
                const err8 = {
                  instancePath: instancePath + '/items/' + i0 + '/actorType',
                  schemaPath:
                    '#/components/schemas/AuditItem/properties/actorType/type',
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
            if (data1.actorId !== undefined) {
              let data8 = data1.actorId;
              if (typeof data8 === 'string') {
                if (!formats0.test(data8)) {
                  const err9 = {
                    instancePath: instancePath + '/items/' + i0 + '/actorId',
                    schemaPath:
                      '#/components/schemas/AuditItem/properties/actorId/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
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
                  instancePath: instancePath + '/items/' + i0 + '/actorId',
                  schemaPath:
                    '#/components/schemas/AuditItem/properties/actorId/type',
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
            if (data1.actorName !== undefined) {
              if (typeof data1.actorName !== 'string') {
                const err11 = {
                  instancePath: instancePath + '/items/' + i0 + '/actorName',
                  schemaPath:
                    '#/components/schemas/AuditItem/properties/actorName/type',
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
            if (data1.action !== undefined) {
              if (typeof data1.action !== 'string') {
                const err12 = {
                  instancePath: instancePath + '/items/' + i0 + '/action',
                  schemaPath:
                    '#/components/schemas/AuditItem/properties/action/type',
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
            if (data1.targetType !== undefined) {
              if (typeof data1.targetType !== 'string') {
                const err13 = {
                  instancePath: instancePath + '/items/' + i0 + '/targetType',
                  schemaPath:
                    '#/components/schemas/AuditItem/properties/targetType/type',
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
            if (data1.targetId !== undefined) {
              let data12 = data1.targetId;
              if (typeof data12 === 'string') {
                if (!formats0.test(data12)) {
                  const err14 = {
                    instancePath: instancePath + '/items/' + i0 + '/targetId',
                    schemaPath:
                      '#/components/schemas/AuditItem/properties/targetId/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
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
                  instancePath: instancePath + '/items/' + i0 + '/targetId',
                  schemaPath:
                    '#/components/schemas/AuditItem/properties/targetId/type',
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
            if (data1.outcome !== undefined) {
              if (typeof data1.outcome !== 'string') {
                const err16 = {
                  instancePath: instancePath + '/items/' + i0 + '/outcome',
                  schemaPath:
                    '#/components/schemas/AuditItem/properties/outcome/type',
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
            if (data1.ip !== undefined) {
              if (typeof data1.ip !== 'string') {
                const err17 = {
                  instancePath: instancePath + '/items/' + i0 + '/ip',
                  schemaPath:
                    '#/components/schemas/AuditItem/properties/ip/type',
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
            if (data1.requestId !== undefined) {
              if (typeof data1.requestId !== 'string') {
                const err18 = {
                  instancePath: instancePath + '/items/' + i0 + '/requestId',
                  schemaPath:
                    '#/components/schemas/AuditItem/properties/requestId/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err18];
                } else {
                  vErrors.push(err18);
                }
                errors++;
              }
            }
            if (data1.credentialId !== undefined) {
              let data16 = data1.credentialId;
              if (typeof data16 === 'string') {
                if (!formats0.test(data16)) {
                  const err19 = {
                    instancePath:
                      instancePath + '/items/' + i0 + '/credentialId',
                    schemaPath:
                      '#/components/schemas/AuditItem/properties/credentialId/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err19];
                  } else {
                    vErrors.push(err19);
                  }
                  errors++;
                }
              } else {
                const err20 = {
                  instancePath: instancePath + '/items/' + i0 + '/credentialId',
                  schemaPath:
                    '#/components/schemas/AuditItem/properties/credentialId/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err20];
                } else {
                  vErrors.push(err20);
                }
                errors++;
              }
            }
          } else {
            const err21 = {
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/AuditItem/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
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
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.nextCursor !== undefined) {
      let data17 = data.nextCursor;
      if (!(typeof data17 == 'number' && !(data17 % 1) && !isNaN(data17))) {
        const err23 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
    }
    if (data.total !== undefined) {
      let data18 = data.total;
      if (!(typeof data18 == 'number' && !(data18 % 1) && !isNaN(data18))) {
        const err24 = {
          instancePath: instancePath + '/total',
          schemaPath: '#/properties/total/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err24];
        } else {
          vErrors.push(err24);
        }
        errors++;
      }
    }
  } else {
    const err25 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err25];
    } else {
      vErrors.push(err25);
    }
    errors++;
  }
  validate993.errors = vErrors;
  return errors === 0;
}
validate993.evaluated = {
  props: { items: true, nextCursor: true, total: true },
  dynamicProps: false,
  dynamicItems: false,
};
const schema1166 = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialAuditItem' },
    },
    nextCursor: { type: 'integer', format: 'int64' },
    total: { type: 'integer', format: 'int64' },
  },
};
const schema1167 = {
  type: 'object',
  properties: {
    id: { type: 'integer', format: 'int64' },
    eventId: { type: 'string', format: 'uuid' },
    rootId: { type: 'string', format: 'uuid' },
    time: { type: 'string', format: 'date-time' },
    kind: { type: 'string' },
    actorType: { type: 'string' },
    actorId: { type: 'string', format: 'uuid' },
    actorName: { type: 'string' },
    action: { type: 'string' },
    targetType: { type: 'string' },
    targetId: { type: 'string', format: 'uuid' },
    outcome: { type: 'string' },
    ip: { type: 'string' },
    requestId: { type: 'string' },
    credentialId: { type: 'string', format: 'uuid' },
  },
};
function validate995(
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
  const evaluated0 = validate995.evaluated;
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
              if (!(
                typeof data2 == 'number' &&
                !(data2 % 1) &&
                !isNaN(data2)
              )) {
                const err0 = {
                  instancePath: instancePath + '/items/' + i0 + '/id',
                  schemaPath:
                    '#/components/schemas/PartialAuditItem/properties/id/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
                };
                if (vErrors === null) {
                  vErrors = [err0];
                } else {
                  vErrors.push(err0);
                }
                errors++;
              }
            }
            if (data1.eventId !== undefined) {
              let data3 = data1.eventId;
              if (typeof data3 === 'string') {
                if (!formats0.test(data3)) {
                  const err1 = {
                    instancePath: instancePath + '/items/' + i0 + '/eventId',
                    schemaPath:
                      '#/components/schemas/PartialAuditItem/properties/eventId/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/eventId',
                  schemaPath:
                    '#/components/schemas/PartialAuditItem/properties/eventId/type',
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
            if (data1.rootId !== undefined) {
              let data4 = data1.rootId;
              if (typeof data4 === 'string') {
                if (!formats0.test(data4)) {
                  const err3 = {
                    instancePath: instancePath + '/items/' + i0 + '/rootId',
                    schemaPath:
                      '#/components/schemas/PartialAuditItem/properties/rootId/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/rootId',
                  schemaPath:
                    '#/components/schemas/PartialAuditItem/properties/rootId/type',
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
            if (data1.time !== undefined) {
              let data5 = data1.time;
              if (typeof data5 === 'string') {
                if (!formats10.validate(data5)) {
                  const err5 = {
                    instancePath: instancePath + '/items/' + i0 + '/time',
                    schemaPath:
                      '#/components/schemas/PartialAuditItem/properties/time/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
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
                  instancePath: instancePath + '/items/' + i0 + '/time',
                  schemaPath:
                    '#/components/schemas/PartialAuditItem/properties/time/type',
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
            if (data1.kind !== undefined) {
              if (typeof data1.kind !== 'string') {
                const err7 = {
                  instancePath: instancePath + '/items/' + i0 + '/kind',
                  schemaPath:
                    '#/components/schemas/PartialAuditItem/properties/kind/type',
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
            if (data1.actorType !== undefined) {
              if (typeof data1.actorType !== 'string') {
                const err8 = {
                  instancePath: instancePath + '/items/' + i0 + '/actorType',
                  schemaPath:
                    '#/components/schemas/PartialAuditItem/properties/actorType/type',
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
            if (data1.actorId !== undefined) {
              let data8 = data1.actorId;
              if (typeof data8 === 'string') {
                if (!formats0.test(data8)) {
                  const err9 = {
                    instancePath: instancePath + '/items/' + i0 + '/actorId',
                    schemaPath:
                      '#/components/schemas/PartialAuditItem/properties/actorId/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
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
                  instancePath: instancePath + '/items/' + i0 + '/actorId',
                  schemaPath:
                    '#/components/schemas/PartialAuditItem/properties/actorId/type',
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
            if (data1.actorName !== undefined) {
              if (typeof data1.actorName !== 'string') {
                const err11 = {
                  instancePath: instancePath + '/items/' + i0 + '/actorName',
                  schemaPath:
                    '#/components/schemas/PartialAuditItem/properties/actorName/type',
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
            if (data1.action !== undefined) {
              if (typeof data1.action !== 'string') {
                const err12 = {
                  instancePath: instancePath + '/items/' + i0 + '/action',
                  schemaPath:
                    '#/components/schemas/PartialAuditItem/properties/action/type',
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
            if (data1.targetType !== undefined) {
              if (typeof data1.targetType !== 'string') {
                const err13 = {
                  instancePath: instancePath + '/items/' + i0 + '/targetType',
                  schemaPath:
                    '#/components/schemas/PartialAuditItem/properties/targetType/type',
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
            if (data1.targetId !== undefined) {
              let data12 = data1.targetId;
              if (typeof data12 === 'string') {
                if (!formats0.test(data12)) {
                  const err14 = {
                    instancePath: instancePath + '/items/' + i0 + '/targetId',
                    schemaPath:
                      '#/components/schemas/PartialAuditItem/properties/targetId/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
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
                  instancePath: instancePath + '/items/' + i0 + '/targetId',
                  schemaPath:
                    '#/components/schemas/PartialAuditItem/properties/targetId/type',
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
            if (data1.outcome !== undefined) {
              if (typeof data1.outcome !== 'string') {
                const err16 = {
                  instancePath: instancePath + '/items/' + i0 + '/outcome',
                  schemaPath:
                    '#/components/schemas/PartialAuditItem/properties/outcome/type',
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
            if (data1.ip !== undefined) {
              if (typeof data1.ip !== 'string') {
                const err17 = {
                  instancePath: instancePath + '/items/' + i0 + '/ip',
                  schemaPath:
                    '#/components/schemas/PartialAuditItem/properties/ip/type',
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
            if (data1.requestId !== undefined) {
              if (typeof data1.requestId !== 'string') {
                const err18 = {
                  instancePath: instancePath + '/items/' + i0 + '/requestId',
                  schemaPath:
                    '#/components/schemas/PartialAuditItem/properties/requestId/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err18];
                } else {
                  vErrors.push(err18);
                }
                errors++;
              }
            }
            if (data1.credentialId !== undefined) {
              let data16 = data1.credentialId;
              if (typeof data16 === 'string') {
                if (!formats0.test(data16)) {
                  const err19 = {
                    instancePath:
                      instancePath + '/items/' + i0 + '/credentialId',
                    schemaPath:
                      '#/components/schemas/PartialAuditItem/properties/credentialId/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err19];
                  } else {
                    vErrors.push(err19);
                  }
                  errors++;
                }
              } else {
                const err20 = {
                  instancePath: instancePath + '/items/' + i0 + '/credentialId',
                  schemaPath:
                    '#/components/schemas/PartialAuditItem/properties/credentialId/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err20];
                } else {
                  vErrors.push(err20);
                }
                errors++;
              }
            }
          } else {
            const err21 = {
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/PartialAuditItem/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
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
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.nextCursor !== undefined) {
      let data17 = data.nextCursor;
      if (!(typeof data17 == 'number' && !(data17 % 1) && !isNaN(data17))) {
        const err23 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
    }
    if (data.total !== undefined) {
      let data18 = data.total;
      if (!(typeof data18 == 'number' && !(data18 % 1) && !isNaN(data18))) {
        const err24 = {
          instancePath: instancePath + '/total',
          schemaPath: '#/properties/total/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err24];
        } else {
          vErrors.push(err24);
        }
        errors++;
      }
    }
  } else {
    const err25 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err25];
    } else {
      vErrors.push(err25);
    }
    errors++;
  }
  validate995.errors = vErrors;
  return errors === 0;
}
validate995.evaluated = {
  props: { items: true, nextCursor: true, total: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate992(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listAuditOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate992.evaluated;
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
    !validate993(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate993.errors
        : vErrors.concat(validate993.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = {};
    props0.items = true;
    props0.nextCursor = true;
    props0.total = true;
  }
  const _errs2 = errors;
  if (
    !validate995(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate995.errors
        : vErrors.concat(validate995.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = props0 || {};
      props0.items = true;
      props0.nextCursor = true;
      props0.total = true;
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
  validate992.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate992.evaluated = { dynamicProps: true, dynamicItems: false };
export const listAuditOutputFull = validate997;
const schema1168 = {
  $ref: 'https://edition.invalid/control#/components/schemas/AuditPage',
  $id: 'https://edition.invalid/validators/listAuditOutputFull',
};
function validate998(
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
  const evaluated0 = validate998.evaluated;
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
              if (!(
                typeof data2 == 'number' &&
                !(data2 % 1) &&
                !isNaN(data2)
              )) {
                const err0 = {
                  instancePath: instancePath + '/items/' + i0 + '/id',
                  schemaPath:
                    '#/components/schemas/AuditItem/properties/id/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
                };
                if (vErrors === null) {
                  vErrors = [err0];
                } else {
                  vErrors.push(err0);
                }
                errors++;
              }
            }
            if (data1.eventId !== undefined) {
              let data3 = data1.eventId;
              if (typeof data3 === 'string') {
                if (!formats0.test(data3)) {
                  const err1 = {
                    instancePath: instancePath + '/items/' + i0 + '/eventId',
                    schemaPath:
                      '#/components/schemas/AuditItem/properties/eventId/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/eventId',
                  schemaPath:
                    '#/components/schemas/AuditItem/properties/eventId/type',
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
            if (data1.rootId !== undefined) {
              let data4 = data1.rootId;
              if (typeof data4 === 'string') {
                if (!formats0.test(data4)) {
                  const err3 = {
                    instancePath: instancePath + '/items/' + i0 + '/rootId',
                    schemaPath:
                      '#/components/schemas/AuditItem/properties/rootId/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/rootId',
                  schemaPath:
                    '#/components/schemas/AuditItem/properties/rootId/type',
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
            if (data1.time !== undefined) {
              let data5 = data1.time;
              if (typeof data5 === 'string') {
                if (!formats10.validate(data5)) {
                  const err5 = {
                    instancePath: instancePath + '/items/' + i0 + '/time',
                    schemaPath:
                      '#/components/schemas/AuditItem/properties/time/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
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
                  instancePath: instancePath + '/items/' + i0 + '/time',
                  schemaPath:
                    '#/components/schemas/AuditItem/properties/time/type',
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
            if (data1.kind !== undefined) {
              if (typeof data1.kind !== 'string') {
                const err7 = {
                  instancePath: instancePath + '/items/' + i0 + '/kind',
                  schemaPath:
                    '#/components/schemas/AuditItem/properties/kind/type',
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
            if (data1.actorType !== undefined) {
              if (typeof data1.actorType !== 'string') {
                const err8 = {
                  instancePath: instancePath + '/items/' + i0 + '/actorType',
                  schemaPath:
                    '#/components/schemas/AuditItem/properties/actorType/type',
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
            if (data1.actorId !== undefined) {
              let data8 = data1.actorId;
              if (typeof data8 === 'string') {
                if (!formats0.test(data8)) {
                  const err9 = {
                    instancePath: instancePath + '/items/' + i0 + '/actorId',
                    schemaPath:
                      '#/components/schemas/AuditItem/properties/actorId/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
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
                  instancePath: instancePath + '/items/' + i0 + '/actorId',
                  schemaPath:
                    '#/components/schemas/AuditItem/properties/actorId/type',
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
            if (data1.actorName !== undefined) {
              if (typeof data1.actorName !== 'string') {
                const err11 = {
                  instancePath: instancePath + '/items/' + i0 + '/actorName',
                  schemaPath:
                    '#/components/schemas/AuditItem/properties/actorName/type',
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
            if (data1.action !== undefined) {
              if (typeof data1.action !== 'string') {
                const err12 = {
                  instancePath: instancePath + '/items/' + i0 + '/action',
                  schemaPath:
                    '#/components/schemas/AuditItem/properties/action/type',
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
            if (data1.targetType !== undefined) {
              if (typeof data1.targetType !== 'string') {
                const err13 = {
                  instancePath: instancePath + '/items/' + i0 + '/targetType',
                  schemaPath:
                    '#/components/schemas/AuditItem/properties/targetType/type',
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
            if (data1.targetId !== undefined) {
              let data12 = data1.targetId;
              if (typeof data12 === 'string') {
                if (!formats0.test(data12)) {
                  const err14 = {
                    instancePath: instancePath + '/items/' + i0 + '/targetId',
                    schemaPath:
                      '#/components/schemas/AuditItem/properties/targetId/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
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
                  instancePath: instancePath + '/items/' + i0 + '/targetId',
                  schemaPath:
                    '#/components/schemas/AuditItem/properties/targetId/type',
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
            if (data1.outcome !== undefined) {
              if (typeof data1.outcome !== 'string') {
                const err16 = {
                  instancePath: instancePath + '/items/' + i0 + '/outcome',
                  schemaPath:
                    '#/components/schemas/AuditItem/properties/outcome/type',
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
            if (data1.ip !== undefined) {
              if (typeof data1.ip !== 'string') {
                const err17 = {
                  instancePath: instancePath + '/items/' + i0 + '/ip',
                  schemaPath:
                    '#/components/schemas/AuditItem/properties/ip/type',
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
            if (data1.requestId !== undefined) {
              if (typeof data1.requestId !== 'string') {
                const err18 = {
                  instancePath: instancePath + '/items/' + i0 + '/requestId',
                  schemaPath:
                    '#/components/schemas/AuditItem/properties/requestId/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err18];
                } else {
                  vErrors.push(err18);
                }
                errors++;
              }
            }
            if (data1.credentialId !== undefined) {
              let data16 = data1.credentialId;
              if (typeof data16 === 'string') {
                if (!formats0.test(data16)) {
                  const err19 = {
                    instancePath:
                      instancePath + '/items/' + i0 + '/credentialId',
                    schemaPath:
                      '#/components/schemas/AuditItem/properties/credentialId/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err19];
                  } else {
                    vErrors.push(err19);
                  }
                  errors++;
                }
              } else {
                const err20 = {
                  instancePath: instancePath + '/items/' + i0 + '/credentialId',
                  schemaPath:
                    '#/components/schemas/AuditItem/properties/credentialId/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err20];
                } else {
                  vErrors.push(err20);
                }
                errors++;
              }
            }
          } else {
            const err21 = {
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/AuditItem/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
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
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.nextCursor !== undefined) {
      let data17 = data.nextCursor;
      if (!(typeof data17 == 'number' && !(data17 % 1) && !isNaN(data17))) {
        const err23 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
    }
    if (data.total !== undefined) {
      let data18 = data.total;
      if (!(typeof data18 == 'number' && !(data18 % 1) && !isNaN(data18))) {
        const err24 = {
          instancePath: instancePath + '/total',
          schemaPath: '#/properties/total/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err24];
        } else {
          vErrors.push(err24);
        }
        errors++;
      }
    }
  } else {
    const err25 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err25];
    } else {
      vErrors.push(err25);
    }
    errors++;
  }
  validate998.errors = vErrors;
  return errors === 0;
}
validate998.evaluated = {
  props: { items: true, nextCursor: true, total: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate997(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listAuditOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate997.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate998(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate998.errors
        : vErrors.concat(validate998.errors);
    errors = vErrors.length;
  }
  validate997.errors = vErrors;
  return errors === 0;
}
validate997.evaluated = {
  props: { items: true, nextCursor: true, total: true },
  dynamicProps: false,
  dynamicItems: false,
};
