// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const listWebhookDeliveriesInput = validate922;
const schema1061 = {
  type: 'object',
  properties: {
    path: {
      type: 'object',
      properties: { id: { type: 'string', format: 'uuid' } },
      required: ['id'],
    },
    query: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', format: 'uuid' },
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
      required: ['tenantId'],
    },
  },
  required: ['path', 'query'],
  $id: 'https://edition.invalid/validators/listWebhookDeliveriesInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
function validate922(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listWebhookDeliveriesInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate922.evaluated;
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
    if (data.query === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'query' },
        message: "must have required property '" + 'query' + "'",
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
        if (data2.tenantId === undefined) {
          const err6 = {
            instancePath: instancePath + '/query',
            schemaPath: '#/properties/query/required',
            keyword: 'required',
            params: { missingProperty: 'tenantId' },
            message: "must have required property '" + 'tenantId' + "'",
          };
          if (vErrors === null) {
            vErrors = [err6];
          } else {
            vErrors.push(err6);
          }
          errors++;
        }
        if (data2.tenantId !== undefined) {
          let data3 = data2.tenantId;
          if (typeof data3 === 'string') {
            if (!formats0.test(data3)) {
              const err7 = {
                instancePath: instancePath + '/query/tenantId',
                schemaPath: '#/properties/query/properties/tenantId/format',
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
              instancePath: instancePath + '/query/tenantId',
              schemaPath: '#/properties/query/properties/tenantId/type',
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
        if (data2.cursor !== undefined) {
          let data4 = data2.cursor;
          if (typeof data4 === 'string') {
            if (!formats0.test(data4)) {
              const err9 = {
                instancePath: instancePath + '/query/cursor',
                schemaPath: '#/properties/query/properties/cursor/format',
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
              instancePath: instancePath + '/query/cursor',
              schemaPath: '#/properties/query/properties/cursor/type',
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
        if (data2.limit !== undefined) {
          let data5 = data2.limit;
          if (!(typeof data5 == 'number' && !(data5 % 1) && !isNaN(data5))) {
            const err11 = {
              instancePath: instancePath + '/query/limit',
              schemaPath: '#/properties/query/properties/limit/type',
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
          if (typeof data5 == 'number') {
            if (data5 > 100 || isNaN(data5)) {
              const err12 = {
                instancePath: instancePath + '/query/limit',
                schemaPath: '#/properties/query/properties/limit/maximum',
                keyword: 'maximum',
                params: { comparison: '<=', limit: 100 },
                message: 'must be <= 100',
              };
              if (vErrors === null) {
                vErrors = [err12];
              } else {
                vErrors.push(err12);
              }
              errors++;
            }
            if (data5 < 1 || isNaN(data5)) {
              const err13 = {
                instancePath: instancePath + '/query/limit',
                schemaPath: '#/properties/query/properties/limit/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err13];
              } else {
                vErrors.push(err13);
              }
              errors++;
            }
          }
        }
        if (data2.fields !== undefined) {
          let data6 = data2.fields;
          if (typeof data6 === 'string') {
            if (func1(data6) > 4096) {
              const err14 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/maxLength',
                keyword: 'maxLength',
                params: { limit: 4096 },
                message: 'must NOT have more than 4096 characters',
              };
              if (vErrors === null) {
                vErrors = [err14];
              } else {
                vErrors.push(err14);
              }
              errors++;
            }
            if (func1(data6) < 1) {
              const err15 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
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
              instancePath: instancePath + '/query/fields',
              schemaPath: '#/properties/query/properties/fields/type',
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
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
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
  validate922.errors = vErrors;
  return errors === 0;
}
validate922.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const listWebhookDeliveriesOutput = validate923;
const schema1062 = {
  anyOf: [
    {
      $ref: 'https://edition.invalid/control#/components/schemas/DeliveryPage',
    },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialDeliveryPage',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/listWebhookDeliveriesOutput',
};
const schema1063 = {
  type: 'object',
  properties: {
    items: { type: 'array', items: { $ref: '#/components/schemas/Delivery' } },
    nextCursor: { type: 'string', format: 'uuid' },
  },
};
const schema1064 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    eventId: { type: 'string', format: 'uuid' },
    eventType: { type: 'string' },
    status: { type: 'string' },
    attempts: { type: 'integer', format: 'int32' },
    nextRunAt: { type: 'string', format: 'date-time' },
    responseCode: { type: 'integer', format: 'int32' },
    createdAt: { type: 'string', format: 'date-time' },
    history: { type: 'array', items: { $ref: '#/components/schemas/Attempt' } },
  },
};
const schema1065 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    startedAt: { type: 'string', format: 'date-time' },
    responseCode: { type: 'integer', format: 'int32' },
    error: { type: 'string' },
    durationMs: { type: 'integer', format: 'int64' },
  },
};
const formats10 = fullFormats['date-time'];
function validate925(
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
  const evaluated0 = validate925.evaluated;
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
            schemaPath: '#/properties/id/format',
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
          schemaPath: '#/properties/id/type',
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
    if (data.eventId !== undefined) {
      let data1 = data.eventId;
      if (typeof data1 === 'string') {
        if (!formats0.test(data1)) {
          const err2 = {
            instancePath: instancePath + '/eventId',
            schemaPath: '#/properties/eventId/format',
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
          instancePath: instancePath + '/eventId',
          schemaPath: '#/properties/eventId/type',
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
    if (data.eventType !== undefined) {
      if (typeof data.eventType !== 'string') {
        const err4 = {
          instancePath: instancePath + '/eventType',
          schemaPath: '#/properties/eventType/type',
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
    if (data.status !== undefined) {
      if (typeof data.status !== 'string') {
        const err5 = {
          instancePath: instancePath + '/status',
          schemaPath: '#/properties/status/type',
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
    if (data.attempts !== undefined) {
      let data4 = data.attempts;
      if (!(typeof data4 == 'number' && !(data4 % 1) && !isNaN(data4))) {
        const err6 = {
          instancePath: instancePath + '/attempts',
          schemaPath: '#/properties/attempts/type',
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
    if (data.nextRunAt !== undefined) {
      let data5 = data.nextRunAt;
      if (typeof data5 === 'string') {
        if (!formats10.validate(data5)) {
          const err7 = {
            instancePath: instancePath + '/nextRunAt',
            schemaPath: '#/properties/nextRunAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
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
          instancePath: instancePath + '/nextRunAt',
          schemaPath: '#/properties/nextRunAt/type',
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
    if (data.responseCode !== undefined) {
      let data6 = data.responseCode;
      if (!(typeof data6 == 'number' && !(data6 % 1) && !isNaN(data6))) {
        const err9 = {
          instancePath: instancePath + '/responseCode',
          schemaPath: '#/properties/responseCode/type',
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
    if (data.createdAt !== undefined) {
      let data7 = data.createdAt;
      if (typeof data7 === 'string') {
        if (!formats10.validate(data7)) {
          const err10 = {
            instancePath: instancePath + '/createdAt',
            schemaPath: '#/properties/createdAt/format',
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
          instancePath: instancePath + '/createdAt',
          schemaPath: '#/properties/createdAt/type',
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
    if (data.history !== undefined) {
      let data8 = data.history;
      if (Array.isArray(data8)) {
        const len0 = data8.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data9 = data8[i0];
          if (data9 && typeof data9 == 'object' && !Array.isArray(data9)) {
            if (data9.id !== undefined) {
              let data10 = data9.id;
              if (typeof data10 === 'string') {
                if (!formats0.test(data10)) {
                  const err12 = {
                    instancePath: instancePath + '/history/' + i0 + '/id',
                    schemaPath:
                      '#/components/schemas/Attempt/properties/id/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
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
                  instancePath: instancePath + '/history/' + i0 + '/id',
                  schemaPath: '#/components/schemas/Attempt/properties/id/type',
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
            if (data9.startedAt !== undefined) {
              let data11 = data9.startedAt;
              if (typeof data11 === 'string') {
                if (!formats10.validate(data11)) {
                  const err14 = {
                    instancePath:
                      instancePath + '/history/' + i0 + '/startedAt',
                    schemaPath:
                      '#/components/schemas/Attempt/properties/startedAt/format',
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
                  instancePath: instancePath + '/history/' + i0 + '/startedAt',
                  schemaPath:
                    '#/components/schemas/Attempt/properties/startedAt/type',
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
            if (data9.responseCode !== undefined) {
              let data12 = data9.responseCode;
              if (!(
                typeof data12 == 'number' &&
                !(data12 % 1) &&
                !isNaN(data12)
              )) {
                const err16 = {
                  instancePath:
                    instancePath + '/history/' + i0 + '/responseCode',
                  schemaPath:
                    '#/components/schemas/Attempt/properties/responseCode/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
                };
                if (vErrors === null) {
                  vErrors = [err16];
                } else {
                  vErrors.push(err16);
                }
                errors++;
              }
            }
            if (data9.error !== undefined) {
              if (typeof data9.error !== 'string') {
                const err17 = {
                  instancePath: instancePath + '/history/' + i0 + '/error',
                  schemaPath:
                    '#/components/schemas/Attempt/properties/error/type',
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
            if (data9.durationMs !== undefined) {
              let data14 = data9.durationMs;
              if (!(
                typeof data14 == 'number' &&
                !(data14 % 1) &&
                !isNaN(data14)
              )) {
                const err18 = {
                  instancePath: instancePath + '/history/' + i0 + '/durationMs',
                  schemaPath:
                    '#/components/schemas/Attempt/properties/durationMs/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
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
              instancePath: instancePath + '/history/' + i0,
              schemaPath: '#/components/schemas/Attempt/type',
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
          instancePath: instancePath + '/history',
          schemaPath: '#/properties/history/type',
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
  } else {
    const err21 = {
      instancePath,
      schemaPath: '#/type',
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
  validate925.errors = vErrors;
  return errors === 0;
}
validate925.evaluated = {
  props: {
    id: true,
    eventId: true,
    eventType: true,
    status: true,
    attempts: true,
    nextRunAt: true,
    responseCode: true,
    createdAt: true,
    history: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate924(
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
  const evaluated0 = validate924.evaluated;
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
          if (
            !validate925(data0[i0], {
              instancePath: instancePath + '/items/' + i0,
              parentData: data0,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors =
              vErrors === null
                ? validate925.errors
                : vErrors.concat(validate925.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err0 = {
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
    if (data.nextCursor !== undefined) {
      let data2 = data.nextCursor;
      if (typeof data2 === 'string') {
        if (!formats0.test(data2)) {
          const err1 = {
            instancePath: instancePath + '/nextCursor',
            schemaPath: '#/properties/nextCursor/format',
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
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
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
      schemaPath: '#/type',
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
  validate924.errors = vErrors;
  return errors === 0;
}
validate924.evaluated = {
  props: { items: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
const schema1066 = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialDelivery' },
    },
    nextCursor: { type: 'string', format: 'uuid' },
  },
};
const schema1067 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    eventId: { type: 'string', format: 'uuid' },
    eventType: { type: 'string' },
    status: { type: 'string' },
    attempts: { type: 'integer', format: 'int32' },
    nextRunAt: { type: 'string', format: 'date-time' },
    responseCode: { type: 'integer', format: 'int32' },
    createdAt: { type: 'string', format: 'date-time' },
    history: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialAttempt' },
    },
  },
};
const schema1068 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    startedAt: { type: 'string', format: 'date-time' },
    responseCode: { type: 'integer', format: 'int32' },
    error: { type: 'string' },
    durationMs: { type: 'integer', format: 'int64' },
  },
};
function validate929(
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
  const evaluated0 = validate929.evaluated;
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
            schemaPath: '#/properties/id/format',
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
          schemaPath: '#/properties/id/type',
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
    if (data.eventId !== undefined) {
      let data1 = data.eventId;
      if (typeof data1 === 'string') {
        if (!formats0.test(data1)) {
          const err2 = {
            instancePath: instancePath + '/eventId',
            schemaPath: '#/properties/eventId/format',
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
          instancePath: instancePath + '/eventId',
          schemaPath: '#/properties/eventId/type',
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
    if (data.eventType !== undefined) {
      if (typeof data.eventType !== 'string') {
        const err4 = {
          instancePath: instancePath + '/eventType',
          schemaPath: '#/properties/eventType/type',
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
    if (data.status !== undefined) {
      if (typeof data.status !== 'string') {
        const err5 = {
          instancePath: instancePath + '/status',
          schemaPath: '#/properties/status/type',
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
    if (data.attempts !== undefined) {
      let data4 = data.attempts;
      if (!(typeof data4 == 'number' && !(data4 % 1) && !isNaN(data4))) {
        const err6 = {
          instancePath: instancePath + '/attempts',
          schemaPath: '#/properties/attempts/type',
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
    if (data.nextRunAt !== undefined) {
      let data5 = data.nextRunAt;
      if (typeof data5 === 'string') {
        if (!formats10.validate(data5)) {
          const err7 = {
            instancePath: instancePath + '/nextRunAt',
            schemaPath: '#/properties/nextRunAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
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
          instancePath: instancePath + '/nextRunAt',
          schemaPath: '#/properties/nextRunAt/type',
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
    if (data.responseCode !== undefined) {
      let data6 = data.responseCode;
      if (!(typeof data6 == 'number' && !(data6 % 1) && !isNaN(data6))) {
        const err9 = {
          instancePath: instancePath + '/responseCode',
          schemaPath: '#/properties/responseCode/type',
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
    if (data.createdAt !== undefined) {
      let data7 = data.createdAt;
      if (typeof data7 === 'string') {
        if (!formats10.validate(data7)) {
          const err10 = {
            instancePath: instancePath + '/createdAt',
            schemaPath: '#/properties/createdAt/format',
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
          instancePath: instancePath + '/createdAt',
          schemaPath: '#/properties/createdAt/type',
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
    if (data.history !== undefined) {
      let data8 = data.history;
      if (Array.isArray(data8)) {
        const len0 = data8.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data9 = data8[i0];
          if (data9 && typeof data9 == 'object' && !Array.isArray(data9)) {
            if (data9.id !== undefined) {
              let data10 = data9.id;
              if (typeof data10 === 'string') {
                if (!formats0.test(data10)) {
                  const err12 = {
                    instancePath: instancePath + '/history/' + i0 + '/id',
                    schemaPath:
                      '#/components/schemas/PartialAttempt/properties/id/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
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
                  instancePath: instancePath + '/history/' + i0 + '/id',
                  schemaPath:
                    '#/components/schemas/PartialAttempt/properties/id/type',
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
            if (data9.startedAt !== undefined) {
              let data11 = data9.startedAt;
              if (typeof data11 === 'string') {
                if (!formats10.validate(data11)) {
                  const err14 = {
                    instancePath:
                      instancePath + '/history/' + i0 + '/startedAt',
                    schemaPath:
                      '#/components/schemas/PartialAttempt/properties/startedAt/format',
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
                  instancePath: instancePath + '/history/' + i0 + '/startedAt',
                  schemaPath:
                    '#/components/schemas/PartialAttempt/properties/startedAt/type',
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
            if (data9.responseCode !== undefined) {
              let data12 = data9.responseCode;
              if (!(
                typeof data12 == 'number' &&
                !(data12 % 1) &&
                !isNaN(data12)
              )) {
                const err16 = {
                  instancePath:
                    instancePath + '/history/' + i0 + '/responseCode',
                  schemaPath:
                    '#/components/schemas/PartialAttempt/properties/responseCode/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
                };
                if (vErrors === null) {
                  vErrors = [err16];
                } else {
                  vErrors.push(err16);
                }
                errors++;
              }
            }
            if (data9.error !== undefined) {
              if (typeof data9.error !== 'string') {
                const err17 = {
                  instancePath: instancePath + '/history/' + i0 + '/error',
                  schemaPath:
                    '#/components/schemas/PartialAttempt/properties/error/type',
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
            if (data9.durationMs !== undefined) {
              let data14 = data9.durationMs;
              if (!(
                typeof data14 == 'number' &&
                !(data14 % 1) &&
                !isNaN(data14)
              )) {
                const err18 = {
                  instancePath: instancePath + '/history/' + i0 + '/durationMs',
                  schemaPath:
                    '#/components/schemas/PartialAttempt/properties/durationMs/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
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
              instancePath: instancePath + '/history/' + i0,
              schemaPath: '#/components/schemas/PartialAttempt/type',
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
          instancePath: instancePath + '/history',
          schemaPath: '#/properties/history/type',
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
  } else {
    const err21 = {
      instancePath,
      schemaPath: '#/type',
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
  validate929.errors = vErrors;
  return errors === 0;
}
validate929.evaluated = {
  props: {
    id: true,
    eventId: true,
    eventType: true,
    status: true,
    attempts: true,
    nextRunAt: true,
    responseCode: true,
    createdAt: true,
    history: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate928(
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
  const evaluated0 = validate928.evaluated;
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
          if (
            !validate929(data0[i0], {
              instancePath: instancePath + '/items/' + i0,
              parentData: data0,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors =
              vErrors === null
                ? validate929.errors
                : vErrors.concat(validate929.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err0 = {
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
    if (data.nextCursor !== undefined) {
      let data2 = data.nextCursor;
      if (typeof data2 === 'string') {
        if (!formats0.test(data2)) {
          const err1 = {
            instancePath: instancePath + '/nextCursor',
            schemaPath: '#/properties/nextCursor/format',
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
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
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
      schemaPath: '#/type',
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
  validate928.errors = vErrors;
  return errors === 0;
}
validate928.evaluated = {
  props: { items: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate923(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listWebhookDeliveriesOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate923.evaluated;
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
    !validate924(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate924.errors
        : vErrors.concat(validate924.errors);
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
    !validate928(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate928.errors
        : vErrors.concat(validate928.errors);
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
  validate923.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate923.evaluated = { dynamicProps: true, dynamicItems: false };
export const listWebhookDeliveriesOutputFull = validate932;
const schema1069 = {
  $ref: 'https://edition.invalid/control#/components/schemas/DeliveryPage',
  $id: 'https://edition.invalid/validators/listWebhookDeliveriesOutputFull',
};
function validate933(
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
  const evaluated0 = validate933.evaluated;
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
          if (
            !validate925(data0[i0], {
              instancePath: instancePath + '/items/' + i0,
              parentData: data0,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors =
              vErrors === null
                ? validate925.errors
                : vErrors.concat(validate925.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err0 = {
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
    if (data.nextCursor !== undefined) {
      let data2 = data.nextCursor;
      if (typeof data2 === 'string') {
        if (!formats0.test(data2)) {
          const err1 = {
            instancePath: instancePath + '/nextCursor',
            schemaPath: '#/properties/nextCursor/format',
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
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
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
      schemaPath: '#/type',
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
  validate933.errors = vErrors;
  return errors === 0;
}
validate933.evaluated = {
  props: { items: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate932(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listWebhookDeliveriesOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate932.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate933(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate933.errors
        : vErrors.concat(validate933.errors);
    errors = vErrors.length;
  }
  validate932.errors = vErrors;
  return errors === 0;
}
validate932.evaluated = {
  props: { items: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
