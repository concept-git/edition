// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const createWebhookInput = validate210;
const schema273 = {
  type: 'object',
  properties: {
    query: {
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
      $ref: 'https://edition.invalid/control#/components/schemas/WebhookConfiguration',
    },
  },
  required: ['query', 'header', 'body'],
  $id: 'https://edition.invalid/validators/createWebhookInput',
};
const schema33 = {
  type: 'object',
  properties: {
    url: { type: 'string', maxLength: 2048, minLength: 0 },
    scopeType: { type: 'string', pattern: 'tenant|space|site' },
    scopeId: { type: 'string', format: 'uuid' },
    events: {
      type: 'array',
      items: { type: 'string', minLength: 1 },
      minItems: 1,
      uniqueItems: true,
    },
    active: { type: 'boolean' },
  },
  required: ['events', 'scopeType', 'url'],
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
const pattern4 = new RegExp('^[a-zA-Z0-9._:-]+$', 'u');
const pattern5 = new RegExp('tenant|space|site', 'u');
function validate210(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/createWebhookInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate210.evaluated;
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
    if (data.query !== undefined) {
      let data0 = data.query;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.tenantId === undefined) {
          const err3 = {
            instancePath: instancePath + '/query',
            schemaPath: '#/properties/query/required',
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
                instancePath: instancePath + '/query/tenantId',
                schemaPath: '#/properties/query/properties/tenantId/format',
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
              instancePath: instancePath + '/query/tenantId',
              schemaPath: '#/properties/query/properties/tenantId/type',
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
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
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
        if (data4.events === undefined) {
          const err13 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/WebhookConfiguration/required',
            keyword: 'required',
            params: { missingProperty: 'events' },
            message: "must have required property '" + 'events' + "'",
          };
          if (vErrors === null) {
            vErrors = [err13];
          } else {
            vErrors.push(err13);
          }
          errors++;
        }
        if (data4.scopeType === undefined) {
          const err14 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/WebhookConfiguration/required',
            keyword: 'required',
            params: { missingProperty: 'scopeType' },
            message: "must have required property '" + 'scopeType' + "'",
          };
          if (vErrors === null) {
            vErrors = [err14];
          } else {
            vErrors.push(err14);
          }
          errors++;
        }
        if (data4.url === undefined) {
          const err15 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/WebhookConfiguration/required',
            keyword: 'required',
            params: { missingProperty: 'url' },
            message: "must have required property '" + 'url' + "'",
          };
          if (vErrors === null) {
            vErrors = [err15];
          } else {
            vErrors.push(err15);
          }
          errors++;
        }
        if (data4.url !== undefined) {
          let data5 = data4.url;
          if (typeof data5 === 'string') {
            if (func1(data5) > 2048) {
              const err16 = {
                instancePath: instancePath + '/body/url',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/WebhookConfiguration/properties/url/maxLength',
                keyword: 'maxLength',
                params: { limit: 2048 },
                message: 'must NOT have more than 2048 characters',
              };
              if (vErrors === null) {
                vErrors = [err16];
              } else {
                vErrors.push(err16);
              }
              errors++;
            }
            if (func1(data5) < 0) {
              const err17 = {
                instancePath: instancePath + '/body/url',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/WebhookConfiguration/properties/url/minLength',
                keyword: 'minLength',
                params: { limit: 0 },
                message: 'must NOT have fewer than 0 characters',
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
              instancePath: instancePath + '/body/url',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/WebhookConfiguration/properties/url/type',
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
        if (data4.scopeType !== undefined) {
          let data6 = data4.scopeType;
          if (typeof data6 === 'string') {
            if (!pattern5.test(data6)) {
              const err19 = {
                instancePath: instancePath + '/body/scopeType',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/WebhookConfiguration/properties/scopeType/pattern',
                keyword: 'pattern',
                params: { pattern: 'tenant|space|site' },
                message: 'must match pattern "' + 'tenant|space|site' + '"',
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
              instancePath: instancePath + '/body/scopeType',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/WebhookConfiguration/properties/scopeType/type',
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
        if (data4.scopeId !== undefined) {
          let data7 = data4.scopeId;
          if (typeof data7 === 'string') {
            if (!formats0.test(data7)) {
              const err21 = {
                instancePath: instancePath + '/body/scopeId',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/WebhookConfiguration/properties/scopeId/format',
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
              instancePath: instancePath + '/body/scopeId',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/WebhookConfiguration/properties/scopeId/type',
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
        if (data4.events !== undefined) {
          let data8 = data4.events;
          if (Array.isArray(data8)) {
            if (data8.length < 1) {
              const err23 = {
                instancePath: instancePath + '/body/events',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/WebhookConfiguration/properties/events/minItems',
                keyword: 'minItems',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 items',
              };
              if (vErrors === null) {
                vErrors = [err23];
              } else {
                vErrors.push(err23);
              }
              errors++;
            }
            const len0 = data8.length;
            for (let i0 = 0; i0 < len0; i0++) {
              let data9 = data8[i0];
              if (typeof data9 === 'string') {
                if (func1(data9) < 1) {
                  const err24 = {
                    instancePath: instancePath + '/body/events/' + i0,
                    schemaPath:
                      'https://edition.invalid/control#/components/schemas/WebhookConfiguration/properties/events/items/minLength',
                    keyword: 'minLength',
                    params: { limit: 1 },
                    message: 'must NOT have fewer than 1 characters',
                  };
                  if (vErrors === null) {
                    vErrors = [err24];
                  } else {
                    vErrors.push(err24);
                  }
                  errors++;
                }
              } else {
                const err25 = {
                  instancePath: instancePath + '/body/events/' + i0,
                  schemaPath:
                    'https://edition.invalid/control#/components/schemas/WebhookConfiguration/properties/events/items/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err25];
                } else {
                  vErrors.push(err25);
                }
                errors++;
              }
            }
            let i1 = data8.length;
            let j0;
            if (i1 > 1) {
              const indices0 = {};
              for (; i1--;) {
                let item0 = data8[i1];
                if (typeof item0 !== 'string') {
                  continue;
                }
                if (typeof indices0[item0] == 'number') {
                  j0 = indices0[item0];
                  const err26 = {
                    instancePath: instancePath + '/body/events',
                    schemaPath:
                      'https://edition.invalid/control#/components/schemas/WebhookConfiguration/properties/events/uniqueItems',
                    keyword: 'uniqueItems',
                    params: { i: i1, j: j0 },
                    message:
                      'must NOT have duplicate items (items ## ' +
                      j0 +
                      ' and ' +
                      i1 +
                      ' are identical)',
                  };
                  if (vErrors === null) {
                    vErrors = [err26];
                  } else {
                    vErrors.push(err26);
                  }
                  errors++;
                  break;
                }
                indices0[item0] = i1;
              }
            }
          } else {
            const err27 = {
              instancePath: instancePath + '/body/events',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/WebhookConfiguration/properties/events/type',
              keyword: 'type',
              params: { type: 'array' },
              message: 'must be array',
            };
            if (vErrors === null) {
              vErrors = [err27];
            } else {
              vErrors.push(err27);
            }
            errors++;
          }
        }
        if (data4.active !== undefined) {
          if (typeof data4.active !== 'boolean') {
            const err28 = {
              instancePath: instancePath + '/body/active',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/WebhookConfiguration/properties/active/type',
              keyword: 'type',
              params: { type: 'boolean' },
              message: 'must be boolean',
            };
            if (vErrors === null) {
              vErrors = [err28];
            } else {
              vErrors.push(err28);
            }
            errors++;
          }
        }
      } else {
        const err29 = {
          instancePath: instancePath + '/body',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/WebhookConfiguration/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err29];
        } else {
          vErrors.push(err29);
        }
        errors++;
      }
    }
  } else {
    const err30 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err30];
    } else {
      vErrors.push(err30);
    }
    errors++;
  }
  validate210.errors = vErrors;
  return errors === 0;
}
validate210.evaluated = {
  props: { query: true, header: true, body: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const createWebhookOutput = validate211;
const schema275 = {
  $ref: 'https://edition.invalid/control#/components/schemas/SecretResult',
  $id: 'https://edition.invalid/validators/createWebhookOutput',
};
const schema276 = {
  type: 'object',
  properties: {
    subscription: { $ref: '#/components/schemas/Subscription' },
    secret: { type: 'string' },
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
function validate212(
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
  const evaluated0 = validate212.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.subscription !== undefined) {
      let data0 = data.subscription;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.id !== undefined) {
          let data1 = data0.id;
          if (typeof data1 === 'string') {
            if (!formats0.test(data1)) {
              const err0 = {
                instancePath: instancePath + '/subscription/id',
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
              instancePath: instancePath + '/subscription/id',
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
        if (data0.url !== undefined) {
          if (typeof data0.url !== 'string') {
            const err2 = {
              instancePath: instancePath + '/subscription/url',
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
        if (data0.scopeType !== undefined) {
          if (typeof data0.scopeType !== 'string') {
            const err3 = {
              instancePath: instancePath + '/subscription/scopeType',
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
        if (data0.scopeId !== undefined) {
          let data4 = data0.scopeId;
          if (typeof data4 === 'string') {
            if (!formats0.test(data4)) {
              const err4 = {
                instancePath: instancePath + '/subscription/scopeId',
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
              instancePath: instancePath + '/subscription/scopeId',
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
        if (data0.events !== undefined) {
          let data5 = data0.events;
          if (Array.isArray(data5)) {
            const len0 = data5.length;
            for (let i0 = 0; i0 < len0; i0++) {
              if (typeof data5[i0] !== 'string') {
                const err6 = {
                  instancePath: instancePath + '/subscription/events/' + i0,
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
            let i1 = data5.length;
            let j0;
            if (i1 > 1) {
              const indices0 = {};
              for (; i1--;) {
                let item0 = data5[i1];
                if (typeof item0 !== 'string') {
                  continue;
                }
                if (typeof indices0[item0] == 'number') {
                  j0 = indices0[item0];
                  const err7 = {
                    instancePath: instancePath + '/subscription/events',
                    schemaPath:
                      '#/components/schemas/Subscription/properties/events/uniqueItems',
                    keyword: 'uniqueItems',
                    params: { i: i1, j: j0 },
                    message:
                      'must NOT have duplicate items (items ## ' +
                      j0 +
                      ' and ' +
                      i1 +
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
                indices0[item0] = i1;
              }
            }
          } else {
            const err8 = {
              instancePath: instancePath + '/subscription/events',
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
        if (data0.active !== undefined) {
          if (typeof data0.active !== 'boolean') {
            const err9 = {
              instancePath: instancePath + '/subscription/active',
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
        if (data0.createdAt !== undefined) {
          let data8 = data0.createdAt;
          if (typeof data8 === 'string') {
            if (!formats10.validate(data8)) {
              const err10 = {
                instancePath: instancePath + '/subscription/createdAt',
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
              instancePath: instancePath + '/subscription/createdAt',
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
          instancePath: instancePath + '/subscription',
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
    if (data.secret !== undefined) {
      if (typeof data.secret !== 'string') {
        const err13 = {
          instancePath: instancePath + '/secret',
          schemaPath: '#/properties/secret/type',
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
      instancePath,
      schemaPath: '#/type',
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
  validate212.errors = vErrors;
  return errors === 0;
}
validate212.evaluated = {
  props: { subscription: true, secret: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate211(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/createWebhookOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate211.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate212(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate212.errors
        : vErrors.concat(validate212.errors);
    errors = vErrors.length;
  }
  validate211.errors = vErrors;
  return errors === 0;
}
validate211.evaluated = {
  props: { subscription: true, secret: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const createWebhookOutputFull = validate214;
const schema278 = {
  $ref: 'https://edition.invalid/control#/components/schemas/SecretResult',
  $id: 'https://edition.invalid/validators/createWebhookOutputFull',
};
function validate215(
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
  const evaluated0 = validate215.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.subscription !== undefined) {
      let data0 = data.subscription;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.id !== undefined) {
          let data1 = data0.id;
          if (typeof data1 === 'string') {
            if (!formats0.test(data1)) {
              const err0 = {
                instancePath: instancePath + '/subscription/id',
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
              instancePath: instancePath + '/subscription/id',
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
        if (data0.url !== undefined) {
          if (typeof data0.url !== 'string') {
            const err2 = {
              instancePath: instancePath + '/subscription/url',
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
        if (data0.scopeType !== undefined) {
          if (typeof data0.scopeType !== 'string') {
            const err3 = {
              instancePath: instancePath + '/subscription/scopeType',
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
        if (data0.scopeId !== undefined) {
          let data4 = data0.scopeId;
          if (typeof data4 === 'string') {
            if (!formats0.test(data4)) {
              const err4 = {
                instancePath: instancePath + '/subscription/scopeId',
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
              instancePath: instancePath + '/subscription/scopeId',
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
        if (data0.events !== undefined) {
          let data5 = data0.events;
          if (Array.isArray(data5)) {
            const len0 = data5.length;
            for (let i0 = 0; i0 < len0; i0++) {
              if (typeof data5[i0] !== 'string') {
                const err6 = {
                  instancePath: instancePath + '/subscription/events/' + i0,
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
            let i1 = data5.length;
            let j0;
            if (i1 > 1) {
              const indices0 = {};
              for (; i1--;) {
                let item0 = data5[i1];
                if (typeof item0 !== 'string') {
                  continue;
                }
                if (typeof indices0[item0] == 'number') {
                  j0 = indices0[item0];
                  const err7 = {
                    instancePath: instancePath + '/subscription/events',
                    schemaPath:
                      '#/components/schemas/Subscription/properties/events/uniqueItems',
                    keyword: 'uniqueItems',
                    params: { i: i1, j: j0 },
                    message:
                      'must NOT have duplicate items (items ## ' +
                      j0 +
                      ' and ' +
                      i1 +
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
                indices0[item0] = i1;
              }
            }
          } else {
            const err8 = {
              instancePath: instancePath + '/subscription/events',
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
        if (data0.active !== undefined) {
          if (typeof data0.active !== 'boolean') {
            const err9 = {
              instancePath: instancePath + '/subscription/active',
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
        if (data0.createdAt !== undefined) {
          let data8 = data0.createdAt;
          if (typeof data8 === 'string') {
            if (!formats10.validate(data8)) {
              const err10 = {
                instancePath: instancePath + '/subscription/createdAt',
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
              instancePath: instancePath + '/subscription/createdAt',
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
          instancePath: instancePath + '/subscription',
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
    if (data.secret !== undefined) {
      if (typeof data.secret !== 'string') {
        const err13 = {
          instancePath: instancePath + '/secret',
          schemaPath: '#/properties/secret/type',
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
      instancePath,
      schemaPath: '#/type',
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
  validate215.errors = vErrors;
  return errors === 0;
}
validate215.evaluated = {
  props: { subscription: true, secret: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate214(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/createWebhookOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate214.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate215(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate215.errors
        : vErrors.concat(validate215.errors);
    errors = vErrors.length;
  }
  validate214.errors = vErrors;
  return errors === 0;
}
validate214.evaluated = {
  props: { subscription: true, secret: true },
  dynamicProps: false,
  dynamicItems: false,
};
