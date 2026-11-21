// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const listJobsInput = validate975;
const schema1140 = {
  type: 'object',
  properties: {
    query: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', format: 'uuid' },
        spaceId: { type: 'string', format: 'uuid' },
        type: { type: 'string', default: 'import', pattern: 'import' },
        status: { type: 'string' },
        cursor: { type: 'string', format: 'uuid' },
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
  $id: 'https://edition.invalid/validators/listJobsInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const pattern115 = new RegExp('import', 'u');
const func1 = ucs2Length;
function validate975(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listJobsInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate975.evaluated;
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
        if (data0.spaceId !== undefined) {
          let data2 = data0.spaceId;
          if (typeof data2 === 'string') {
            if (!formats0.test(data2)) {
              const err2 = {
                instancePath: instancePath + '/query/spaceId',
                schemaPath: '#/properties/query/properties/spaceId/format',
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
              instancePath: instancePath + '/query/spaceId',
              schemaPath: '#/properties/query/properties/spaceId/type',
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
        if (data0.type !== undefined) {
          let data3 = data0.type;
          if (typeof data3 === 'string') {
            if (!pattern115.test(data3)) {
              const err4 = {
                instancePath: instancePath + '/query/type',
                schemaPath: '#/properties/query/properties/type/pattern',
                keyword: 'pattern',
                params: { pattern: 'import' },
                message: 'must match pattern "' + 'import' + '"',
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
              instancePath: instancePath + '/query/type',
              schemaPath: '#/properties/query/properties/type/type',
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
        if (data0.status !== undefined) {
          if (typeof data0.status !== 'string') {
            const err6 = {
              instancePath: instancePath + '/query/status',
              schemaPath: '#/properties/query/properties/status/type',
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
        if (data0.cursor !== undefined) {
          let data5 = data0.cursor;
          if (typeof data5 === 'string') {
            if (!formats0.test(data5)) {
              const err7 = {
                instancePath: instancePath + '/query/cursor',
                schemaPath: '#/properties/query/properties/cursor/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
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
              instancePath: instancePath + '/query/cursor',
              schemaPath: '#/properties/query/properties/cursor/type',
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
        if (data0.limit !== undefined) {
          let data6 = data0.limit;
          if (!(typeof data6 == 'number' && !(data6 % 1) && !isNaN(data6))) {
            const err9 = {
              instancePath: instancePath + '/query/limit',
              schemaPath: '#/properties/query/properties/limit/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err9];
            } else {
              vErrors.push(err9);
            }
            errors++;
          }
          if (typeof data6 == 'number') {
            if (data6 > 100 || isNaN(data6)) {
              const err10 = {
                instancePath: instancePath + '/query/limit',
                schemaPath: '#/properties/query/properties/limit/maximum',
                keyword: 'maximum',
                params: { comparison: '<=', limit: 100 },
                message: 'must be <= 100',
              };
              if (vErrors === null) {
                vErrors = [err10];
              } else {
                vErrors.push(err10);
              }
              errors++;
            }
            if (data6 < 1 || isNaN(data6)) {
              const err11 = {
                instancePath: instancePath + '/query/limit',
                schemaPath: '#/properties/query/properties/limit/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err11];
              } else {
                vErrors.push(err11);
              }
              errors++;
            }
          }
        }
        if (data0.fields !== undefined) {
          let data7 = data0.fields;
          if (typeof data7 === 'string') {
            if (func1(data7) > 4096) {
              const err12 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/maxLength',
                keyword: 'maxLength',
                params: { limit: 4096 },
                message: 'must NOT have more than 4096 characters',
              };
              if (vErrors === null) {
                vErrors = [err12];
              } else {
                vErrors.push(err12);
              }
              errors++;
            }
            if (func1(data7) < 1) {
              const err13 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/minLength',
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
              instancePath: instancePath + '/query/fields',
              schemaPath: '#/properties/query/properties/fields/type',
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
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
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
  validate975.errors = vErrors;
  return errors === 0;
}
validate975.evaluated = {
  props: { query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const listJobsOutput = validate976;
const schema1141 = {
  anyOf: [
    { $ref: 'https://edition.invalid/control#/components/schemas/JobPage' },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialJobPage',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/listJobsOutput',
};
const schema1142 = {
  type: 'object',
  properties: {
    items: { type: 'array', items: { $ref: '#/components/schemas/Job' } },
    nextCursor: { type: 'string', format: 'uuid' },
    total: { type: 'integer', format: 'int64' },
  },
};
const schema1143 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    tenantId: { type: 'string', format: 'uuid' },
    spaceId: { type: 'string', format: 'uuid' },
    type: { type: 'string' },
    status: { type: 'string' },
    phase: { type: 'string' },
    done: { type: 'integer', format: 'int32' },
    total: { type: 'integer', format: 'int32' },
    attempt: { type: 'integer', format: 'int32' },
    nextRunAt: { type: 'string', format: 'date-time' },
    outcome: { type: 'string' },
    traceId: { type: 'string' },
    allowedActions: {
      type: 'array',
      items: { type: 'string' },
      uniqueItems: true,
    },
  },
};
const formats10 = fullFormats['date-time'];
function validate977(
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
  const evaluated0 = validate977.evaluated;
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
                    schemaPath: '#/components/schemas/Job/properties/id/format',
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
                  schemaPath: '#/components/schemas/Job/properties/id/type',
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
            if (data1.tenantId !== undefined) {
              let data3 = data1.tenantId;
              if (typeof data3 === 'string') {
                if (!formats0.test(data3)) {
                  const err2 = {
                    instancePath: instancePath + '/items/' + i0 + '/tenantId',
                    schemaPath:
                      '#/components/schemas/Job/properties/tenantId/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/tenantId',
                  schemaPath:
                    '#/components/schemas/Job/properties/tenantId/type',
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
            if (data1.spaceId !== undefined) {
              let data4 = data1.spaceId;
              if (typeof data4 === 'string') {
                if (!formats0.test(data4)) {
                  const err4 = {
                    instancePath: instancePath + '/items/' + i0 + '/spaceId',
                    schemaPath:
                      '#/components/schemas/Job/properties/spaceId/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/spaceId',
                  schemaPath:
                    '#/components/schemas/Job/properties/spaceId/type',
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
            if (data1.type !== undefined) {
              if (typeof data1.type !== 'string') {
                const err6 = {
                  instancePath: instancePath + '/items/' + i0 + '/type',
                  schemaPath: '#/components/schemas/Job/properties/type/type',
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
            if (data1.status !== undefined) {
              if (typeof data1.status !== 'string') {
                const err7 = {
                  instancePath: instancePath + '/items/' + i0 + '/status',
                  schemaPath: '#/components/schemas/Job/properties/status/type',
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
            if (data1.phase !== undefined) {
              if (typeof data1.phase !== 'string') {
                const err8 = {
                  instancePath: instancePath + '/items/' + i0 + '/phase',
                  schemaPath: '#/components/schemas/Job/properties/phase/type',
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
            if (data1.done !== undefined) {
              let data8 = data1.done;
              if (!(
                typeof data8 == 'number' &&
                !(data8 % 1) &&
                !isNaN(data8)
              )) {
                const err9 = {
                  instancePath: instancePath + '/items/' + i0 + '/done',
                  schemaPath: '#/components/schemas/Job/properties/done/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
                };
                if (vErrors === null) {
                  vErrors = [err9];
                } else {
                  vErrors.push(err9);
                }
                errors++;
              }
            }
            if (data1.total !== undefined) {
              let data9 = data1.total;
              if (!(
                typeof data9 == 'number' &&
                !(data9 % 1) &&
                !isNaN(data9)
              )) {
                const err10 = {
                  instancePath: instancePath + '/items/' + i0 + '/total',
                  schemaPath: '#/components/schemas/Job/properties/total/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
                };
                if (vErrors === null) {
                  vErrors = [err10];
                } else {
                  vErrors.push(err10);
                }
                errors++;
              }
            }
            if (data1.attempt !== undefined) {
              let data10 = data1.attempt;
              if (!(
                typeof data10 == 'number' &&
                !(data10 % 1) &&
                !isNaN(data10)
              )) {
                const err11 = {
                  instancePath: instancePath + '/items/' + i0 + '/attempt',
                  schemaPath:
                    '#/components/schemas/Job/properties/attempt/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
                };
                if (vErrors === null) {
                  vErrors = [err11];
                } else {
                  vErrors.push(err11);
                }
                errors++;
              }
            }
            if (data1.nextRunAt !== undefined) {
              let data11 = data1.nextRunAt;
              if (typeof data11 === 'string') {
                if (!formats10.validate(data11)) {
                  const err12 = {
                    instancePath: instancePath + '/items/' + i0 + '/nextRunAt',
                    schemaPath:
                      '#/components/schemas/Job/properties/nextRunAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
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
                  instancePath: instancePath + '/items/' + i0 + '/nextRunAt',
                  schemaPath:
                    '#/components/schemas/Job/properties/nextRunAt/type',
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
            if (data1.outcome !== undefined) {
              if (typeof data1.outcome !== 'string') {
                const err14 = {
                  instancePath: instancePath + '/items/' + i0 + '/outcome',
                  schemaPath:
                    '#/components/schemas/Job/properties/outcome/type',
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
            if (data1.traceId !== undefined) {
              if (typeof data1.traceId !== 'string') {
                const err15 = {
                  instancePath: instancePath + '/items/' + i0 + '/traceId',
                  schemaPath:
                    '#/components/schemas/Job/properties/traceId/type',
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
            if (data1.allowedActions !== undefined) {
              let data14 = data1.allowedActions;
              if (Array.isArray(data14)) {
                const len1 = data14.length;
                for (let i1 = 0; i1 < len1; i1++) {
                  if (typeof data14[i1] !== 'string') {
                    const err16 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/allowedActions/' + i1,
                      schemaPath:
                        '#/components/schemas/Job/properties/allowedActions/items/type',
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
                let i2 = data14.length;
                let j0;
                if (i2 > 1) {
                  const indices0 = {};
                  for (; i2--;) {
                    let item0 = data14[i2];
                    if (typeof item0 !== 'string') {
                      continue;
                    }
                    if (typeof indices0[item0] == 'number') {
                      j0 = indices0[item0];
                      const err17 = {
                        instancePath:
                          instancePath + '/items/' + i0 + '/allowedActions',
                        schemaPath:
                          '#/components/schemas/Job/properties/allowedActions/uniqueItems',
                        keyword: 'uniqueItems',
                        params: { i: i2, j: j0 },
                        message:
                          'must NOT have duplicate items (items ## ' +
                          j0 +
                          ' and ' +
                          i2 +
                          ' are identical)',
                      };
                      if (vErrors === null) {
                        vErrors = [err17];
                      } else {
                        vErrors.push(err17);
                      }
                      errors++;
                      break;
                    }
                    indices0[item0] = i2;
                  }
                }
              } else {
                const err18 = {
                  instancePath:
                    instancePath + '/items/' + i0 + '/allowedActions',
                  schemaPath:
                    '#/components/schemas/Job/properties/allowedActions/type',
                  keyword: 'type',
                  params: { type: 'array' },
                  message: 'must be array',
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
              schemaPath: '#/components/schemas/Job/type',
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
      let data16 = data.nextCursor;
      if (typeof data16 === 'string') {
        if (!formats0.test(data16)) {
          const err21 = {
            instancePath: instancePath + '/nextCursor',
            schemaPath: '#/properties/nextCursor/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err21];
          } else {
            vErrors.push(err21);
          }
          errors++;
        }
      } else {
        const err22 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.total !== undefined) {
      let data17 = data.total;
      if (!(typeof data17 == 'number' && !(data17 % 1) && !isNaN(data17))) {
        const err23 = {
          instancePath: instancePath + '/total',
          schemaPath: '#/properties/total/type',
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
  } else {
    const err24 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err24];
    } else {
      vErrors.push(err24);
    }
    errors++;
  }
  validate977.errors = vErrors;
  return errors === 0;
}
validate977.evaluated = {
  props: { items: true, nextCursor: true, total: true },
  dynamicProps: false,
  dynamicItems: false,
};
const schema1144 = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialJob' },
    },
    nextCursor: { type: 'string', format: 'uuid' },
    total: { type: 'integer', format: 'int64' },
  },
};
const schema1145 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    tenantId: { type: 'string', format: 'uuid' },
    spaceId: { type: 'string', format: 'uuid' },
    type: { type: 'string' },
    status: { type: 'string' },
    phase: { type: 'string' },
    done: { type: 'integer', format: 'int32' },
    total: { type: 'integer', format: 'int32' },
    attempt: { type: 'integer', format: 'int32' },
    nextRunAt: { type: 'string', format: 'date-time' },
    outcome: { type: 'string' },
    traceId: { type: 'string' },
    allowedActions: {
      type: 'array',
      items: { type: 'string' },
      uniqueItems: true,
    },
  },
};
function validate979(
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
  const evaluated0 = validate979.evaluated;
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
                      '#/components/schemas/PartialJob/properties/id/format',
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
                    '#/components/schemas/PartialJob/properties/id/type',
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
            if (data1.tenantId !== undefined) {
              let data3 = data1.tenantId;
              if (typeof data3 === 'string') {
                if (!formats0.test(data3)) {
                  const err2 = {
                    instancePath: instancePath + '/items/' + i0 + '/tenantId',
                    schemaPath:
                      '#/components/schemas/PartialJob/properties/tenantId/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/tenantId',
                  schemaPath:
                    '#/components/schemas/PartialJob/properties/tenantId/type',
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
            if (data1.spaceId !== undefined) {
              let data4 = data1.spaceId;
              if (typeof data4 === 'string') {
                if (!formats0.test(data4)) {
                  const err4 = {
                    instancePath: instancePath + '/items/' + i0 + '/spaceId',
                    schemaPath:
                      '#/components/schemas/PartialJob/properties/spaceId/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/spaceId',
                  schemaPath:
                    '#/components/schemas/PartialJob/properties/spaceId/type',
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
            if (data1.type !== undefined) {
              if (typeof data1.type !== 'string') {
                const err6 = {
                  instancePath: instancePath + '/items/' + i0 + '/type',
                  schemaPath:
                    '#/components/schemas/PartialJob/properties/type/type',
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
            if (data1.status !== undefined) {
              if (typeof data1.status !== 'string') {
                const err7 = {
                  instancePath: instancePath + '/items/' + i0 + '/status',
                  schemaPath:
                    '#/components/schemas/PartialJob/properties/status/type',
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
            if (data1.phase !== undefined) {
              if (typeof data1.phase !== 'string') {
                const err8 = {
                  instancePath: instancePath + '/items/' + i0 + '/phase',
                  schemaPath:
                    '#/components/schemas/PartialJob/properties/phase/type',
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
            if (data1.done !== undefined) {
              let data8 = data1.done;
              if (!(
                typeof data8 == 'number' &&
                !(data8 % 1) &&
                !isNaN(data8)
              )) {
                const err9 = {
                  instancePath: instancePath + '/items/' + i0 + '/done',
                  schemaPath:
                    '#/components/schemas/PartialJob/properties/done/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
                };
                if (vErrors === null) {
                  vErrors = [err9];
                } else {
                  vErrors.push(err9);
                }
                errors++;
              }
            }
            if (data1.total !== undefined) {
              let data9 = data1.total;
              if (!(
                typeof data9 == 'number' &&
                !(data9 % 1) &&
                !isNaN(data9)
              )) {
                const err10 = {
                  instancePath: instancePath + '/items/' + i0 + '/total',
                  schemaPath:
                    '#/components/schemas/PartialJob/properties/total/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
                };
                if (vErrors === null) {
                  vErrors = [err10];
                } else {
                  vErrors.push(err10);
                }
                errors++;
              }
            }
            if (data1.attempt !== undefined) {
              let data10 = data1.attempt;
              if (!(
                typeof data10 == 'number' &&
                !(data10 % 1) &&
                !isNaN(data10)
              )) {
                const err11 = {
                  instancePath: instancePath + '/items/' + i0 + '/attempt',
                  schemaPath:
                    '#/components/schemas/PartialJob/properties/attempt/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
                };
                if (vErrors === null) {
                  vErrors = [err11];
                } else {
                  vErrors.push(err11);
                }
                errors++;
              }
            }
            if (data1.nextRunAt !== undefined) {
              let data11 = data1.nextRunAt;
              if (typeof data11 === 'string') {
                if (!formats10.validate(data11)) {
                  const err12 = {
                    instancePath: instancePath + '/items/' + i0 + '/nextRunAt',
                    schemaPath:
                      '#/components/schemas/PartialJob/properties/nextRunAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
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
                  instancePath: instancePath + '/items/' + i0 + '/nextRunAt',
                  schemaPath:
                    '#/components/schemas/PartialJob/properties/nextRunAt/type',
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
            if (data1.outcome !== undefined) {
              if (typeof data1.outcome !== 'string') {
                const err14 = {
                  instancePath: instancePath + '/items/' + i0 + '/outcome',
                  schemaPath:
                    '#/components/schemas/PartialJob/properties/outcome/type',
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
            if (data1.traceId !== undefined) {
              if (typeof data1.traceId !== 'string') {
                const err15 = {
                  instancePath: instancePath + '/items/' + i0 + '/traceId',
                  schemaPath:
                    '#/components/schemas/PartialJob/properties/traceId/type',
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
            if (data1.allowedActions !== undefined) {
              let data14 = data1.allowedActions;
              if (Array.isArray(data14)) {
                const len1 = data14.length;
                for (let i1 = 0; i1 < len1; i1++) {
                  if (typeof data14[i1] !== 'string') {
                    const err16 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/allowedActions/' + i1,
                      schemaPath:
                        '#/components/schemas/PartialJob/properties/allowedActions/items/type',
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
                let i2 = data14.length;
                let j0;
                if (i2 > 1) {
                  const indices0 = {};
                  for (; i2--;) {
                    let item0 = data14[i2];
                    if (typeof item0 !== 'string') {
                      continue;
                    }
                    if (typeof indices0[item0] == 'number') {
                      j0 = indices0[item0];
                      const err17 = {
                        instancePath:
                          instancePath + '/items/' + i0 + '/allowedActions',
                        schemaPath:
                          '#/components/schemas/PartialJob/properties/allowedActions/uniqueItems',
                        keyword: 'uniqueItems',
                        params: { i: i2, j: j0 },
                        message:
                          'must NOT have duplicate items (items ## ' +
                          j0 +
                          ' and ' +
                          i2 +
                          ' are identical)',
                      };
                      if (vErrors === null) {
                        vErrors = [err17];
                      } else {
                        vErrors.push(err17);
                      }
                      errors++;
                      break;
                    }
                    indices0[item0] = i2;
                  }
                }
              } else {
                const err18 = {
                  instancePath:
                    instancePath + '/items/' + i0 + '/allowedActions',
                  schemaPath:
                    '#/components/schemas/PartialJob/properties/allowedActions/type',
                  keyword: 'type',
                  params: { type: 'array' },
                  message: 'must be array',
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
              schemaPath: '#/components/schemas/PartialJob/type',
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
      let data16 = data.nextCursor;
      if (typeof data16 === 'string') {
        if (!formats0.test(data16)) {
          const err21 = {
            instancePath: instancePath + '/nextCursor',
            schemaPath: '#/properties/nextCursor/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err21];
          } else {
            vErrors.push(err21);
          }
          errors++;
        }
      } else {
        const err22 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.total !== undefined) {
      let data17 = data.total;
      if (!(typeof data17 == 'number' && !(data17 % 1) && !isNaN(data17))) {
        const err23 = {
          instancePath: instancePath + '/total',
          schemaPath: '#/properties/total/type',
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
  } else {
    const err24 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err24];
    } else {
      vErrors.push(err24);
    }
    errors++;
  }
  validate979.errors = vErrors;
  return errors === 0;
}
validate979.evaluated = {
  props: { items: true, nextCursor: true, total: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate976(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listJobsOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate976.evaluated;
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
    !validate977(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate977.errors
        : vErrors.concat(validate977.errors);
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
    !validate979(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate979.errors
        : vErrors.concat(validate979.errors);
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
  validate976.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate976.evaluated = { dynamicProps: true, dynamicItems: false };
export const listJobsOutputFull = validate981;
const schema1146 = {
  $ref: 'https://edition.invalid/control#/components/schemas/JobPage',
  $id: 'https://edition.invalid/validators/listJobsOutputFull',
};
function validate982(
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
  const evaluated0 = validate982.evaluated;
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
                    schemaPath: '#/components/schemas/Job/properties/id/format',
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
                  schemaPath: '#/components/schemas/Job/properties/id/type',
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
            if (data1.tenantId !== undefined) {
              let data3 = data1.tenantId;
              if (typeof data3 === 'string') {
                if (!formats0.test(data3)) {
                  const err2 = {
                    instancePath: instancePath + '/items/' + i0 + '/tenantId',
                    schemaPath:
                      '#/components/schemas/Job/properties/tenantId/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/tenantId',
                  schemaPath:
                    '#/components/schemas/Job/properties/tenantId/type',
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
            if (data1.spaceId !== undefined) {
              let data4 = data1.spaceId;
              if (typeof data4 === 'string') {
                if (!formats0.test(data4)) {
                  const err4 = {
                    instancePath: instancePath + '/items/' + i0 + '/spaceId',
                    schemaPath:
                      '#/components/schemas/Job/properties/spaceId/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/spaceId',
                  schemaPath:
                    '#/components/schemas/Job/properties/spaceId/type',
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
            if (data1.type !== undefined) {
              if (typeof data1.type !== 'string') {
                const err6 = {
                  instancePath: instancePath + '/items/' + i0 + '/type',
                  schemaPath: '#/components/schemas/Job/properties/type/type',
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
            if (data1.status !== undefined) {
              if (typeof data1.status !== 'string') {
                const err7 = {
                  instancePath: instancePath + '/items/' + i0 + '/status',
                  schemaPath: '#/components/schemas/Job/properties/status/type',
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
            if (data1.phase !== undefined) {
              if (typeof data1.phase !== 'string') {
                const err8 = {
                  instancePath: instancePath + '/items/' + i0 + '/phase',
                  schemaPath: '#/components/schemas/Job/properties/phase/type',
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
            if (data1.done !== undefined) {
              let data8 = data1.done;
              if (!(
                typeof data8 == 'number' &&
                !(data8 % 1) &&
                !isNaN(data8)
              )) {
                const err9 = {
                  instancePath: instancePath + '/items/' + i0 + '/done',
                  schemaPath: '#/components/schemas/Job/properties/done/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
                };
                if (vErrors === null) {
                  vErrors = [err9];
                } else {
                  vErrors.push(err9);
                }
                errors++;
              }
            }
            if (data1.total !== undefined) {
              let data9 = data1.total;
              if (!(
                typeof data9 == 'number' &&
                !(data9 % 1) &&
                !isNaN(data9)
              )) {
                const err10 = {
                  instancePath: instancePath + '/items/' + i0 + '/total',
                  schemaPath: '#/components/schemas/Job/properties/total/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
                };
                if (vErrors === null) {
                  vErrors = [err10];
                } else {
                  vErrors.push(err10);
                }
                errors++;
              }
            }
            if (data1.attempt !== undefined) {
              let data10 = data1.attempt;
              if (!(
                typeof data10 == 'number' &&
                !(data10 % 1) &&
                !isNaN(data10)
              )) {
                const err11 = {
                  instancePath: instancePath + '/items/' + i0 + '/attempt',
                  schemaPath:
                    '#/components/schemas/Job/properties/attempt/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
                };
                if (vErrors === null) {
                  vErrors = [err11];
                } else {
                  vErrors.push(err11);
                }
                errors++;
              }
            }
            if (data1.nextRunAt !== undefined) {
              let data11 = data1.nextRunAt;
              if (typeof data11 === 'string') {
                if (!formats10.validate(data11)) {
                  const err12 = {
                    instancePath: instancePath + '/items/' + i0 + '/nextRunAt',
                    schemaPath:
                      '#/components/schemas/Job/properties/nextRunAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
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
                  instancePath: instancePath + '/items/' + i0 + '/nextRunAt',
                  schemaPath:
                    '#/components/schemas/Job/properties/nextRunAt/type',
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
            if (data1.outcome !== undefined) {
              if (typeof data1.outcome !== 'string') {
                const err14 = {
                  instancePath: instancePath + '/items/' + i0 + '/outcome',
                  schemaPath:
                    '#/components/schemas/Job/properties/outcome/type',
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
            if (data1.traceId !== undefined) {
              if (typeof data1.traceId !== 'string') {
                const err15 = {
                  instancePath: instancePath + '/items/' + i0 + '/traceId',
                  schemaPath:
                    '#/components/schemas/Job/properties/traceId/type',
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
            if (data1.allowedActions !== undefined) {
              let data14 = data1.allowedActions;
              if (Array.isArray(data14)) {
                const len1 = data14.length;
                for (let i1 = 0; i1 < len1; i1++) {
                  if (typeof data14[i1] !== 'string') {
                    const err16 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/allowedActions/' + i1,
                      schemaPath:
                        '#/components/schemas/Job/properties/allowedActions/items/type',
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
                let i2 = data14.length;
                let j0;
                if (i2 > 1) {
                  const indices0 = {};
                  for (; i2--;) {
                    let item0 = data14[i2];
                    if (typeof item0 !== 'string') {
                      continue;
                    }
                    if (typeof indices0[item0] == 'number') {
                      j0 = indices0[item0];
                      const err17 = {
                        instancePath:
                          instancePath + '/items/' + i0 + '/allowedActions',
                        schemaPath:
                          '#/components/schemas/Job/properties/allowedActions/uniqueItems',
                        keyword: 'uniqueItems',
                        params: { i: i2, j: j0 },
                        message:
                          'must NOT have duplicate items (items ## ' +
                          j0 +
                          ' and ' +
                          i2 +
                          ' are identical)',
                      };
                      if (vErrors === null) {
                        vErrors = [err17];
                      } else {
                        vErrors.push(err17);
                      }
                      errors++;
                      break;
                    }
                    indices0[item0] = i2;
                  }
                }
              } else {
                const err18 = {
                  instancePath:
                    instancePath + '/items/' + i0 + '/allowedActions',
                  schemaPath:
                    '#/components/schemas/Job/properties/allowedActions/type',
                  keyword: 'type',
                  params: { type: 'array' },
                  message: 'must be array',
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
              schemaPath: '#/components/schemas/Job/type',
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
      let data16 = data.nextCursor;
      if (typeof data16 === 'string') {
        if (!formats0.test(data16)) {
          const err21 = {
            instancePath: instancePath + '/nextCursor',
            schemaPath: '#/properties/nextCursor/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err21];
          } else {
            vErrors.push(err21);
          }
          errors++;
        }
      } else {
        const err22 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.total !== undefined) {
      let data17 = data.total;
      if (!(typeof data17 == 'number' && !(data17 % 1) && !isNaN(data17))) {
        const err23 = {
          instancePath: instancePath + '/total',
          schemaPath: '#/properties/total/type',
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
  } else {
    const err24 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err24];
    } else {
      vErrors.push(err24);
    }
    errors++;
  }
  validate982.errors = vErrors;
  return errors === 0;
}
validate982.evaluated = {
  props: { items: true, nextCursor: true, total: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate981(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listJobsOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate981.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate982(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate982.errors
        : vErrors.concat(validate982.errors);
    errors = vErrors.length;
  }
  validate981.errors = vErrors;
  return errors === 0;
}
validate981.evaluated = {
  props: { items: true, nextCursor: true, total: true },
  dynamicProps: false,
  dynamicItems: false,
};
