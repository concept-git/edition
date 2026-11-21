// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const listWebhooksInput = validate201;
const schema264 = {
  type: 'object',
  properties: {
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
  required: ['query'],
  $id: 'https://edition.invalid/validators/listWebhooksInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
function validate201(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listWebhooksInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate201.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.query === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'query' },
        message: "must have required property '" + 'query' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.query !== undefined) {
      let data0 = data.query;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.tenantId === undefined) {
          const err1 = {
            instancePath: instancePath + '/query',
            schemaPath: '#/properties/query/required',
            keyword: 'required',
            params: { missingProperty: 'tenantId' },
            message: "must have required property '" + 'tenantId' + "'",
          };
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
        if (data0.tenantId !== undefined) {
          let data1 = data0.tenantId;
          if (typeof data1 === 'string') {
            if (!formats0.test(data1)) {
              const err2 = {
                instancePath: instancePath + '/query/tenantId',
                schemaPath: '#/properties/query/properties/tenantId/format',
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
              instancePath: instancePath + '/query/tenantId',
              schemaPath: '#/properties/query/properties/tenantId/type',
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
        if (data0.cursor !== undefined) {
          let data2 = data0.cursor;
          if (typeof data2 === 'string') {
            if (!formats0.test(data2)) {
              const err4 = {
                instancePath: instancePath + '/query/cursor',
                schemaPath: '#/properties/query/properties/cursor/format',
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
              instancePath: instancePath + '/query/cursor',
              schemaPath: '#/properties/query/properties/cursor/type',
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
        if (data0.limit !== undefined) {
          let data3 = data0.limit;
          if (!(typeof data3 == 'number' && !(data3 % 1) && !isNaN(data3))) {
            const err6 = {
              instancePath: instancePath + '/query/limit',
              schemaPath: '#/properties/query/properties/limit/type',
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
          if (typeof data3 == 'number') {
            if (data3 > 100 || isNaN(data3)) {
              const err7 = {
                instancePath: instancePath + '/query/limit',
                schemaPath: '#/properties/query/properties/limit/maximum',
                keyword: 'maximum',
                params: { comparison: '<=', limit: 100 },
                message: 'must be <= 100',
              };
              if (vErrors === null) {
                vErrors = [err7];
              } else {
                vErrors.push(err7);
              }
              errors++;
            }
            if (data3 < 1 || isNaN(data3)) {
              const err8 = {
                instancePath: instancePath + '/query/limit',
                schemaPath: '#/properties/query/properties/limit/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err8];
              } else {
                vErrors.push(err8);
              }
              errors++;
            }
          }
        }
        if (data0.fields !== undefined) {
          let data4 = data0.fields;
          if (typeof data4 === 'string') {
            if (func1(data4) > 4096) {
              const err9 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/maxLength',
                keyword: 'maxLength',
                params: { limit: 4096 },
                message: 'must NOT have more than 4096 characters',
              };
              if (vErrors === null) {
                vErrors = [err9];
              } else {
                vErrors.push(err9);
              }
              errors++;
            }
            if (func1(data4) < 1) {
              const err10 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/minLength',
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
          } else {
            const err11 = {
              instancePath: instancePath + '/query/fields',
              schemaPath: '#/properties/query/properties/fields/type',
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
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
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
  } else {
    const err13 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err13];
    } else {
      vErrors.push(err13);
    }
    errors++;
  }
  validate201.errors = vErrors;
  return errors === 0;
}
validate201.evaluated = {
  props: { query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const listWebhooksOutput = validate202;
const schema265 = {
  anyOf: [
    {
      $ref: 'https://edition.invalid/control#/components/schemas/SubscriptionPage',
    },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialSubscriptionPage',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/listWebhooksOutput',
};
const schema266 = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { $ref: '#/components/schemas/Subscription' },
    },
    nextCursor: { type: 'string', format: 'uuid' },
    eventTypes: { type: 'array', items: { type: 'string' }, uniqueItems: true },
  },
};
const schema35 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    url: { type: 'string' },
    scopeType: { type: 'string' },
    scopeId: { type: 'string', format: 'uuid' },
    events: { type: 'array', items: { type: 'string' }, uniqueItems: true },
    active: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
  },
};
const formats10 = fullFormats['date-time'];
function validate203(
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
  const evaluated0 = validate203.evaluated;
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
                      '#/components/schemas/Subscription/properties/id/format',
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
                    '#/components/schemas/Subscription/properties/id/type',
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
            if (data1.url !== undefined) {
              if (typeof data1.url !== 'string') {
                const err2 = {
                  instancePath: instancePath + '/items/' + i0 + '/url',
                  schemaPath:
                    '#/components/schemas/Subscription/properties/url/type',
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
            if (data1.scopeType !== undefined) {
              if (typeof data1.scopeType !== 'string') {
                const err3 = {
                  instancePath: instancePath + '/items/' + i0 + '/scopeType',
                  schemaPath:
                    '#/components/schemas/Subscription/properties/scopeType/type',
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
            if (data1.scopeId !== undefined) {
              let data5 = data1.scopeId;
              if (typeof data5 === 'string') {
                if (!formats0.test(data5)) {
                  const err4 = {
                    instancePath: instancePath + '/items/' + i0 + '/scopeId',
                    schemaPath:
                      '#/components/schemas/Subscription/properties/scopeId/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/scopeId',
                  schemaPath:
                    '#/components/schemas/Subscription/properties/scopeId/type',
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
            if (data1.events !== undefined) {
              let data6 = data1.events;
              if (Array.isArray(data6)) {
                const len1 = data6.length;
                for (let i1 = 0; i1 < len1; i1++) {
                  if (typeof data6[i1] !== 'string') {
                    const err6 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/events/' + i1,
                      schemaPath:
                        '#/components/schemas/Subscription/properties/events/items/type',
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
                let i2 = data6.length;
                let j0;
                if (i2 > 1) {
                  const indices0 = {};
                  for (; i2--;) {
                    let item0 = data6[i2];
                    if (typeof item0 !== 'string') {
                      continue;
                    }
                    if (typeof indices0[item0] == 'number') {
                      j0 = indices0[item0];
                      const err7 = {
                        instancePath: instancePath + '/items/' + i0 + '/events',
                        schemaPath:
                          '#/components/schemas/Subscription/properties/events/uniqueItems',
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
                        vErrors = [err7];
                      } else {
                        vErrors.push(err7);
                      }
                      errors++;
                      break;
                    }
                    indices0[item0] = i2;
                  }
                }
              } else {
                const err8 = {
                  instancePath: instancePath + '/items/' + i0 + '/events',
                  schemaPath:
                    '#/components/schemas/Subscription/properties/events/type',
                  keyword: 'type',
                  params: { type: 'array' },
                  message: 'must be array',
                };
                if (vErrors === null) {
                  vErrors = [err8];
                } else {
                  vErrors.push(err8);
                }
                errors++;
              }
            }
            if (data1.active !== undefined) {
              if (typeof data1.active !== 'boolean') {
                const err9 = {
                  instancePath: instancePath + '/items/' + i0 + '/active',
                  schemaPath:
                    '#/components/schemas/Subscription/properties/active/type',
                  keyword: 'type',
                  params: { type: 'boolean' },
                  message: 'must be boolean',
                };
                if (vErrors === null) {
                  vErrors = [err9];
                } else {
                  vErrors.push(err9);
                }
                errors++;
              }
            }
            if (data1.createdAt !== undefined) {
              let data9 = data1.createdAt;
              if (typeof data9 === 'string') {
                if (!formats10.validate(data9)) {
                  const err10 = {
                    instancePath: instancePath + '/items/' + i0 + '/createdAt',
                    schemaPath:
                      '#/components/schemas/Subscription/properties/createdAt/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/createdAt',
                  schemaPath:
                    '#/components/schemas/Subscription/properties/createdAt/type',
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
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/Subscription/type',
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
      } else {
        const err13 = {
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
    }
    if (data.nextCursor !== undefined) {
      let data10 = data.nextCursor;
      if (typeof data10 === 'string') {
        if (!formats0.test(data10)) {
          const err14 = {
            instancePath: instancePath + '/nextCursor',
            schemaPath: '#/properties/nextCursor/format',
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
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
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
    if (data.eventTypes !== undefined) {
      let data11 = data.eventTypes;
      if (Array.isArray(data11)) {
        const len2 = data11.length;
        for (let i3 = 0; i3 < len2; i3++) {
          if (typeof data11[i3] !== 'string') {
            const err16 = {
              instancePath: instancePath + '/eventTypes/' + i3,
              schemaPath: '#/properties/eventTypes/items/type',
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
        let i4 = data11.length;
        let j1;
        if (i4 > 1) {
          const indices1 = {};
          for (; i4--;) {
            let item1 = data11[i4];
            if (typeof item1 !== 'string') {
              continue;
            }
            if (typeof indices1[item1] == 'number') {
              j1 = indices1[item1];
              const err17 = {
                instancePath: instancePath + '/eventTypes',
                schemaPath: '#/properties/eventTypes/uniqueItems',
                keyword: 'uniqueItems',
                params: { i: i4, j: j1 },
                message:
                  'must NOT have duplicate items (items ## ' +
                  j1 +
                  ' and ' +
                  i4 +
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
            indices1[item1] = i4;
          }
        }
      } else {
        const err18 = {
          instancePath: instancePath + '/eventTypes',
          schemaPath: '#/properties/eventTypes/type',
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
      instancePath,
      schemaPath: '#/type',
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
  validate203.errors = vErrors;
  return errors === 0;
}
validate203.evaluated = {
  props: { items: true, nextCursor: true, eventTypes: true },
  dynamicProps: false,
  dynamicItems: false,
};
const schema268 = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialSubscription' },
    },
    nextCursor: { type: 'string', format: 'uuid' },
    eventTypes: { type: 'array', items: { type: 'string' }, uniqueItems: true },
  },
};
const schema269 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    url: { type: 'string' },
    scopeType: { type: 'string' },
    scopeId: { type: 'string', format: 'uuid' },
    events: { type: 'array', items: { type: 'string' }, uniqueItems: true },
    active: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
  },
};
function validate205(
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
  const evaluated0 = validate205.evaluated;
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
                      '#/components/schemas/PartialSubscription/properties/id/format',
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
                    '#/components/schemas/PartialSubscription/properties/id/type',
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
            if (data1.url !== undefined) {
              if (typeof data1.url !== 'string') {
                const err2 = {
                  instancePath: instancePath + '/items/' + i0 + '/url',
                  schemaPath:
                    '#/components/schemas/PartialSubscription/properties/url/type',
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
            if (data1.scopeType !== undefined) {
              if (typeof data1.scopeType !== 'string') {
                const err3 = {
                  instancePath: instancePath + '/items/' + i0 + '/scopeType',
                  schemaPath:
                    '#/components/schemas/PartialSubscription/properties/scopeType/type',
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
            if (data1.scopeId !== undefined) {
              let data5 = data1.scopeId;
              if (typeof data5 === 'string') {
                if (!formats0.test(data5)) {
                  const err4 = {
                    instancePath: instancePath + '/items/' + i0 + '/scopeId',
                    schemaPath:
                      '#/components/schemas/PartialSubscription/properties/scopeId/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/scopeId',
                  schemaPath:
                    '#/components/schemas/PartialSubscription/properties/scopeId/type',
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
            if (data1.events !== undefined) {
              let data6 = data1.events;
              if (Array.isArray(data6)) {
                const len1 = data6.length;
                for (let i1 = 0; i1 < len1; i1++) {
                  if (typeof data6[i1] !== 'string') {
                    const err6 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/events/' + i1,
                      schemaPath:
                        '#/components/schemas/PartialSubscription/properties/events/items/type',
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
                let i2 = data6.length;
                let j0;
                if (i2 > 1) {
                  const indices0 = {};
                  for (; i2--;) {
                    let item0 = data6[i2];
                    if (typeof item0 !== 'string') {
                      continue;
                    }
                    if (typeof indices0[item0] == 'number') {
                      j0 = indices0[item0];
                      const err7 = {
                        instancePath: instancePath + '/items/' + i0 + '/events',
                        schemaPath:
                          '#/components/schemas/PartialSubscription/properties/events/uniqueItems',
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
                        vErrors = [err7];
                      } else {
                        vErrors.push(err7);
                      }
                      errors++;
                      break;
                    }
                    indices0[item0] = i2;
                  }
                }
              } else {
                const err8 = {
                  instancePath: instancePath + '/items/' + i0 + '/events',
                  schemaPath:
                    '#/components/schemas/PartialSubscription/properties/events/type',
                  keyword: 'type',
                  params: { type: 'array' },
                  message: 'must be array',
                };
                if (vErrors === null) {
                  vErrors = [err8];
                } else {
                  vErrors.push(err8);
                }
                errors++;
              }
            }
            if (data1.active !== undefined) {
              if (typeof data1.active !== 'boolean') {
                const err9 = {
                  instancePath: instancePath + '/items/' + i0 + '/active',
                  schemaPath:
                    '#/components/schemas/PartialSubscription/properties/active/type',
                  keyword: 'type',
                  params: { type: 'boolean' },
                  message: 'must be boolean',
                };
                if (vErrors === null) {
                  vErrors = [err9];
                } else {
                  vErrors.push(err9);
                }
                errors++;
              }
            }
            if (data1.createdAt !== undefined) {
              let data9 = data1.createdAt;
              if (typeof data9 === 'string') {
                if (!formats10.validate(data9)) {
                  const err10 = {
                    instancePath: instancePath + '/items/' + i0 + '/createdAt',
                    schemaPath:
                      '#/components/schemas/PartialSubscription/properties/createdAt/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/createdAt',
                  schemaPath:
                    '#/components/schemas/PartialSubscription/properties/createdAt/type',
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
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/PartialSubscription/type',
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
      } else {
        const err13 = {
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
    }
    if (data.nextCursor !== undefined) {
      let data10 = data.nextCursor;
      if (typeof data10 === 'string') {
        if (!formats0.test(data10)) {
          const err14 = {
            instancePath: instancePath + '/nextCursor',
            schemaPath: '#/properties/nextCursor/format',
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
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
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
    if (data.eventTypes !== undefined) {
      let data11 = data.eventTypes;
      if (Array.isArray(data11)) {
        const len2 = data11.length;
        for (let i3 = 0; i3 < len2; i3++) {
          if (typeof data11[i3] !== 'string') {
            const err16 = {
              instancePath: instancePath + '/eventTypes/' + i3,
              schemaPath: '#/properties/eventTypes/items/type',
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
        let i4 = data11.length;
        let j1;
        if (i4 > 1) {
          const indices1 = {};
          for (; i4--;) {
            let item1 = data11[i4];
            if (typeof item1 !== 'string') {
              continue;
            }
            if (typeof indices1[item1] == 'number') {
              j1 = indices1[item1];
              const err17 = {
                instancePath: instancePath + '/eventTypes',
                schemaPath: '#/properties/eventTypes/uniqueItems',
                keyword: 'uniqueItems',
                params: { i: i4, j: j1 },
                message:
                  'must NOT have duplicate items (items ## ' +
                  j1 +
                  ' and ' +
                  i4 +
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
            indices1[item1] = i4;
          }
        }
      } else {
        const err18 = {
          instancePath: instancePath + '/eventTypes',
          schemaPath: '#/properties/eventTypes/type',
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
      instancePath,
      schemaPath: '#/type',
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
  validate205.errors = vErrors;
  return errors === 0;
}
validate205.evaluated = {
  props: { items: true, nextCursor: true, eventTypes: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate202(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listWebhooksOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate202.evaluated;
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
    !validate203(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate203.errors
        : vErrors.concat(validate203.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = {};
    props0.items = true;
    props0.nextCursor = true;
    props0.eventTypes = true;
  }
  const _errs2 = errors;
  if (
    !validate205(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate205.errors
        : vErrors.concat(validate205.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = props0 || {};
      props0.items = true;
      props0.nextCursor = true;
      props0.eventTypes = true;
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
  validate202.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate202.evaluated = { dynamicProps: true, dynamicItems: false };
export const listWebhooksOutputFull = validate207;
const schema270 = {
  $ref: 'https://edition.invalid/control#/components/schemas/SubscriptionPage',
  $id: 'https://edition.invalid/validators/listWebhooksOutputFull',
};
function validate208(
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
  const evaluated0 = validate208.evaluated;
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
                      '#/components/schemas/Subscription/properties/id/format',
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
                    '#/components/schemas/Subscription/properties/id/type',
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
            if (data1.url !== undefined) {
              if (typeof data1.url !== 'string') {
                const err2 = {
                  instancePath: instancePath + '/items/' + i0 + '/url',
                  schemaPath:
                    '#/components/schemas/Subscription/properties/url/type',
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
            if (data1.scopeType !== undefined) {
              if (typeof data1.scopeType !== 'string') {
                const err3 = {
                  instancePath: instancePath + '/items/' + i0 + '/scopeType',
                  schemaPath:
                    '#/components/schemas/Subscription/properties/scopeType/type',
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
            if (data1.scopeId !== undefined) {
              let data5 = data1.scopeId;
              if (typeof data5 === 'string') {
                if (!formats0.test(data5)) {
                  const err4 = {
                    instancePath: instancePath + '/items/' + i0 + '/scopeId',
                    schemaPath:
                      '#/components/schemas/Subscription/properties/scopeId/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/scopeId',
                  schemaPath:
                    '#/components/schemas/Subscription/properties/scopeId/type',
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
            if (data1.events !== undefined) {
              let data6 = data1.events;
              if (Array.isArray(data6)) {
                const len1 = data6.length;
                for (let i1 = 0; i1 < len1; i1++) {
                  if (typeof data6[i1] !== 'string') {
                    const err6 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/events/' + i1,
                      schemaPath:
                        '#/components/schemas/Subscription/properties/events/items/type',
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
                let i2 = data6.length;
                let j0;
                if (i2 > 1) {
                  const indices0 = {};
                  for (; i2--;) {
                    let item0 = data6[i2];
                    if (typeof item0 !== 'string') {
                      continue;
                    }
                    if (typeof indices0[item0] == 'number') {
                      j0 = indices0[item0];
                      const err7 = {
                        instancePath: instancePath + '/items/' + i0 + '/events',
                        schemaPath:
                          '#/components/schemas/Subscription/properties/events/uniqueItems',
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
                        vErrors = [err7];
                      } else {
                        vErrors.push(err7);
                      }
                      errors++;
                      break;
                    }
                    indices0[item0] = i2;
                  }
                }
              } else {
                const err8 = {
                  instancePath: instancePath + '/items/' + i0 + '/events',
                  schemaPath:
                    '#/components/schemas/Subscription/properties/events/type',
                  keyword: 'type',
                  params: { type: 'array' },
                  message: 'must be array',
                };
                if (vErrors === null) {
                  vErrors = [err8];
                } else {
                  vErrors.push(err8);
                }
                errors++;
              }
            }
            if (data1.active !== undefined) {
              if (typeof data1.active !== 'boolean') {
                const err9 = {
                  instancePath: instancePath + '/items/' + i0 + '/active',
                  schemaPath:
                    '#/components/schemas/Subscription/properties/active/type',
                  keyword: 'type',
                  params: { type: 'boolean' },
                  message: 'must be boolean',
                };
                if (vErrors === null) {
                  vErrors = [err9];
                } else {
                  vErrors.push(err9);
                }
                errors++;
              }
            }
            if (data1.createdAt !== undefined) {
              let data9 = data1.createdAt;
              if (typeof data9 === 'string') {
                if (!formats10.validate(data9)) {
                  const err10 = {
                    instancePath: instancePath + '/items/' + i0 + '/createdAt',
                    schemaPath:
                      '#/components/schemas/Subscription/properties/createdAt/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/createdAt',
                  schemaPath:
                    '#/components/schemas/Subscription/properties/createdAt/type',
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
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/Subscription/type',
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
      } else {
        const err13 = {
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
    }
    if (data.nextCursor !== undefined) {
      let data10 = data.nextCursor;
      if (typeof data10 === 'string') {
        if (!formats0.test(data10)) {
          const err14 = {
            instancePath: instancePath + '/nextCursor',
            schemaPath: '#/properties/nextCursor/format',
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
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
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
    if (data.eventTypes !== undefined) {
      let data11 = data.eventTypes;
      if (Array.isArray(data11)) {
        const len2 = data11.length;
        for (let i3 = 0; i3 < len2; i3++) {
          if (typeof data11[i3] !== 'string') {
            const err16 = {
              instancePath: instancePath + '/eventTypes/' + i3,
              schemaPath: '#/properties/eventTypes/items/type',
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
        let i4 = data11.length;
        let j1;
        if (i4 > 1) {
          const indices1 = {};
          for (; i4--;) {
            let item1 = data11[i4];
            if (typeof item1 !== 'string') {
              continue;
            }
            if (typeof indices1[item1] == 'number') {
              j1 = indices1[item1];
              const err17 = {
                instancePath: instancePath + '/eventTypes',
                schemaPath: '#/properties/eventTypes/uniqueItems',
                keyword: 'uniqueItems',
                params: { i: i4, j: j1 },
                message:
                  'must NOT have duplicate items (items ## ' +
                  j1 +
                  ' and ' +
                  i4 +
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
            indices1[item1] = i4;
          }
        }
      } else {
        const err18 = {
          instancePath: instancePath + '/eventTypes',
          schemaPath: '#/properties/eventTypes/type',
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
      instancePath,
      schemaPath: '#/type',
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
  validate208.errors = vErrors;
  return errors === 0;
}
validate208.evaluated = {
  props: { items: true, nextCursor: true, eventTypes: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate207(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listWebhooksOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate207.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate208(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate208.errors
        : vErrors.concat(validate208.errors);
    errors = vErrors.length;
  }
  validate207.errors = vErrors;
  return errors === 0;
}
validate207.evaluated = {
  props: { items: true, nextCursor: true, eventTypes: true },
  dynamicProps: false,
  dynamicItems: false,
};
