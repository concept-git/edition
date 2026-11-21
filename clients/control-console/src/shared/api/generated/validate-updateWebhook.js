// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const updateWebhookInput = validate20;
const schema31 = {
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
  required: ['path', 'query', 'header', 'body'],
  $id: 'https://edition.invalid/validators/updateWebhookInput',
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
function validate20(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/updateWebhookInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate20.evaluated;
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
    if (data.header === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'header' },
        message: "must have required property '" + 'header' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.body === undefined) {
      const err3 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'body' },
        message: "must have required property '" + 'body' + "'",
      };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.path !== undefined) {
      let data0 = data.path;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.id === undefined) {
          const err4 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'id' },
            message: "must have required property '" + 'id' + "'",
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
        if (data0.id !== undefined) {
          let data1 = data0.id;
          if (typeof data1 === 'string') {
            if (!formats0.test(data1)) {
              const err5 = {
                instancePath: instancePath + '/path/id',
                schemaPath: '#/properties/path/properties/id/format',
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
              instancePath: instancePath + '/path/id',
              schemaPath: '#/properties/path/properties/id/type',
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
      } else {
        const err7 = {
          instancePath: instancePath + '/path',
          schemaPath: '#/properties/path/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
    if (data.query !== undefined) {
      let data2 = data.query;
      if (data2 && typeof data2 == 'object' && !Array.isArray(data2)) {
        if (data2.tenantId === undefined) {
          const err8 = {
            instancePath: instancePath + '/query',
            schemaPath: '#/properties/query/required',
            keyword: 'required',
            params: { missingProperty: 'tenantId' },
            message: "must have required property '" + 'tenantId' + "'",
          };
          if (vErrors === null) {
            vErrors = [err8];
          } else {
            vErrors.push(err8);
          }
          errors++;
        }
        if (data2.tenantId !== undefined) {
          let data3 = data2.tenantId;
          if (typeof data3 === 'string') {
            if (!formats0.test(data3)) {
              const err9 = {
                instancePath: instancePath + '/query/tenantId',
                schemaPath: '#/properties/query/properties/tenantId/format',
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
              instancePath: instancePath + '/query/tenantId',
              schemaPath: '#/properties/query/properties/tenantId/type',
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
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
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
    if (data.header !== undefined) {
      let data4 = data.header;
      if (data4 && typeof data4 == 'object' && !Array.isArray(data4)) {
        if (data4['Idempotency-Key'] === undefined) {
          const err12 = {
            instancePath: instancePath + '/header',
            schemaPath: '#/properties/header/required',
            keyword: 'required',
            params: { missingProperty: 'Idempotency-Key' },
            message: "must have required property '" + 'Idempotency-Key' + "'",
          };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
        if (data4['Idempotency-Key'] !== undefined) {
          let data5 = data4['Idempotency-Key'];
          if (typeof data5 === 'string') {
            if (func1(data5) > 128) {
              const err13 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/maxLength',
                keyword: 'maxLength',
                params: { limit: 128 },
                message: 'must NOT have more than 128 characters',
              };
              if (vErrors === null) {
                vErrors = [err13];
              } else {
                vErrors.push(err13);
              }
              errors++;
            }
            if (func1(data5) < 1) {
              const err14 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
              };
              if (vErrors === null) {
                vErrors = [err14];
              } else {
                vErrors.push(err14);
              }
              errors++;
            }
            if (!pattern4.test(data5)) {
              const err15 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/pattern',
                keyword: 'pattern',
                params: { pattern: '^[a-zA-Z0-9._:-]+$' },
                message: 'must match pattern "' + '^[a-zA-Z0-9._:-]+$' + '"',
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
              instancePath: instancePath + '/header/Idempotency-Key',
              schemaPath: '#/properties/header/properties/Idempotency-Key/type',
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
          instancePath: instancePath + '/header',
          schemaPath: '#/properties/header/type',
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
    if (data.body !== undefined) {
      let data6 = data.body;
      if (data6 && typeof data6 == 'object' && !Array.isArray(data6)) {
        if (data6.events === undefined) {
          const err18 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/WebhookConfiguration/required',
            keyword: 'required',
            params: { missingProperty: 'events' },
            message: "must have required property '" + 'events' + "'",
          };
          if (vErrors === null) {
            vErrors = [err18];
          } else {
            vErrors.push(err18);
          }
          errors++;
        }
        if (data6.scopeType === undefined) {
          const err19 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/WebhookConfiguration/required',
            keyword: 'required',
            params: { missingProperty: 'scopeType' },
            message: "must have required property '" + 'scopeType' + "'",
          };
          if (vErrors === null) {
            vErrors = [err19];
          } else {
            vErrors.push(err19);
          }
          errors++;
        }
        if (data6.url === undefined) {
          const err20 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/WebhookConfiguration/required',
            keyword: 'required',
            params: { missingProperty: 'url' },
            message: "must have required property '" + 'url' + "'",
          };
          if (vErrors === null) {
            vErrors = [err20];
          } else {
            vErrors.push(err20);
          }
          errors++;
        }
        if (data6.url !== undefined) {
          let data7 = data6.url;
          if (typeof data7 === 'string') {
            if (func1(data7) > 2048) {
              const err21 = {
                instancePath: instancePath + '/body/url',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/WebhookConfiguration/properties/url/maxLength',
                keyword: 'maxLength',
                params: { limit: 2048 },
                message: 'must NOT have more than 2048 characters',
              };
              if (vErrors === null) {
                vErrors = [err21];
              } else {
                vErrors.push(err21);
              }
              errors++;
            }
            if (func1(data7) < 0) {
              const err22 = {
                instancePath: instancePath + '/body/url',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/WebhookConfiguration/properties/url/minLength',
                keyword: 'minLength',
                params: { limit: 0 },
                message: 'must NOT have fewer than 0 characters',
              };
              if (vErrors === null) {
                vErrors = [err22];
              } else {
                vErrors.push(err22);
              }
              errors++;
            }
          } else {
            const err23 = {
              instancePath: instancePath + '/body/url',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/WebhookConfiguration/properties/url/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err23];
            } else {
              vErrors.push(err23);
            }
            errors++;
          }
        }
        if (data6.scopeType !== undefined) {
          let data8 = data6.scopeType;
          if (typeof data8 === 'string') {
            if (!pattern5.test(data8)) {
              const err24 = {
                instancePath: instancePath + '/body/scopeType',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/WebhookConfiguration/properties/scopeType/pattern',
                keyword: 'pattern',
                params: { pattern: 'tenant|space|site' },
                message: 'must match pattern "' + 'tenant|space|site' + '"',
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
              instancePath: instancePath + '/body/scopeType',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/WebhookConfiguration/properties/scopeType/type',
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
        if (data6.scopeId !== undefined) {
          let data9 = data6.scopeId;
          if (typeof data9 === 'string') {
            if (!formats0.test(data9)) {
              const err26 = {
                instancePath: instancePath + '/body/scopeId',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/WebhookConfiguration/properties/scopeId/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
              };
              if (vErrors === null) {
                vErrors = [err26];
              } else {
                vErrors.push(err26);
              }
              errors++;
            }
          } else {
            const err27 = {
              instancePath: instancePath + '/body/scopeId',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/WebhookConfiguration/properties/scopeId/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err27];
            } else {
              vErrors.push(err27);
            }
            errors++;
          }
        }
        if (data6.events !== undefined) {
          let data10 = data6.events;
          if (Array.isArray(data10)) {
            if (data10.length < 1) {
              const err28 = {
                instancePath: instancePath + '/body/events',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/WebhookConfiguration/properties/events/minItems',
                keyword: 'minItems',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 items',
              };
              if (vErrors === null) {
                vErrors = [err28];
              } else {
                vErrors.push(err28);
              }
              errors++;
            }
            const len0 = data10.length;
            for (let i0 = 0; i0 < len0; i0++) {
              let data11 = data10[i0];
              if (typeof data11 === 'string') {
                if (func1(data11) < 1) {
                  const err29 = {
                    instancePath: instancePath + '/body/events/' + i0,
                    schemaPath:
                      'https://edition.invalid/control#/components/schemas/WebhookConfiguration/properties/events/items/minLength',
                    keyword: 'minLength',
                    params: { limit: 1 },
                    message: 'must NOT have fewer than 1 characters',
                  };
                  if (vErrors === null) {
                    vErrors = [err29];
                  } else {
                    vErrors.push(err29);
                  }
                  errors++;
                }
              } else {
                const err30 = {
                  instancePath: instancePath + '/body/events/' + i0,
                  schemaPath:
                    'https://edition.invalid/control#/components/schemas/WebhookConfiguration/properties/events/items/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err30];
                } else {
                  vErrors.push(err30);
                }
                errors++;
              }
            }
            let i1 = data10.length;
            let j0;
            if (i1 > 1) {
              const indices0 = {};
              for (; i1--;) {
                let item0 = data10[i1];
                if (typeof item0 !== 'string') {
                  continue;
                }
                if (typeof indices0[item0] == 'number') {
                  j0 = indices0[item0];
                  const err31 = {
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
                    vErrors = [err31];
                  } else {
                    vErrors.push(err31);
                  }
                  errors++;
                  break;
                }
                indices0[item0] = i1;
              }
            }
          } else {
            const err32 = {
              instancePath: instancePath + '/body/events',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/WebhookConfiguration/properties/events/type',
              keyword: 'type',
              params: { type: 'array' },
              message: 'must be array',
            };
            if (vErrors === null) {
              vErrors = [err32];
            } else {
              vErrors.push(err32);
            }
            errors++;
          }
        }
        if (data6.active !== undefined) {
          if (typeof data6.active !== 'boolean') {
            const err33 = {
              instancePath: instancePath + '/body/active',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/WebhookConfiguration/properties/active/type',
              keyword: 'type',
              params: { type: 'boolean' },
              message: 'must be boolean',
            };
            if (vErrors === null) {
              vErrors = [err33];
            } else {
              vErrors.push(err33);
            }
            errors++;
          }
        }
      } else {
        const err34 = {
          instancePath: instancePath + '/body',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/WebhookConfiguration/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err34];
        } else {
          vErrors.push(err34);
        }
        errors++;
      }
    }
  } else {
    const err35 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err35];
    } else {
      vErrors.push(err35);
    }
    errors++;
  }
  validate20.errors = vErrors;
  return errors === 0;
}
validate20.evaluated = {
  props: { path: true, query: true, header: true, body: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const updateWebhookOutput = validate22;
const schema34 = {
  $ref: 'https://edition.invalid/control#/components/schemas/Subscription',
  $id: 'https://edition.invalid/validators/updateWebhookOutput',
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
function validate22(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/updateWebhookOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate22.evaluated;
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
              'https://edition.invalid/control#/components/schemas/Subscription/properties/id/format',
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
            'https://edition.invalid/control#/components/schemas/Subscription/properties/id/type',
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
    if (data.url !== undefined) {
      if (typeof data.url !== 'string') {
        const err2 = {
          instancePath: instancePath + '/url',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Subscription/properties/url/type',
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
    if (data.scopeType !== undefined) {
      if (typeof data.scopeType !== 'string') {
        const err3 = {
          instancePath: instancePath + '/scopeType',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Subscription/properties/scopeType/type',
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
    if (data.scopeId !== undefined) {
      let data3 = data.scopeId;
      if (typeof data3 === 'string') {
        if (!formats0.test(data3)) {
          const err4 = {
            instancePath: instancePath + '/scopeId',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/Subscription/properties/scopeId/format',
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
          instancePath: instancePath + '/scopeId',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Subscription/properties/scopeId/type',
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
    if (data.events !== undefined) {
      let data4 = data.events;
      if (Array.isArray(data4)) {
        const len0 = data4.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (typeof data4[i0] !== 'string') {
            const err6 = {
              instancePath: instancePath + '/events/' + i0,
              schemaPath:
                'https://edition.invalid/control#/components/schemas/Subscription/properties/events/items/type',
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
        let i1 = data4.length;
        let j0;
        if (i1 > 1) {
          const indices0 = {};
          for (; i1--;) {
            let item0 = data4[i1];
            if (typeof item0 !== 'string') {
              continue;
            }
            if (typeof indices0[item0] == 'number') {
              j0 = indices0[item0];
              const err7 = {
                instancePath: instancePath + '/events',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/Subscription/properties/events/uniqueItems',
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
          instancePath: instancePath + '/events',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Subscription/properties/events/type',
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
    if (data.active !== undefined) {
      if (typeof data.active !== 'boolean') {
        const err9 = {
          instancePath: instancePath + '/active',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Subscription/properties/active/type',
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
    if (data.createdAt !== undefined) {
      let data7 = data.createdAt;
      if (typeof data7 === 'string') {
        if (!formats10.validate(data7)) {
          const err10 = {
            instancePath: instancePath + '/createdAt',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/Subscription/properties/createdAt/format',
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
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Subscription/properties/createdAt/type',
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
        'https://edition.invalid/control#/components/schemas/Subscription/type',
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
  validate22.errors = vErrors;
  return errors === 0;
}
validate22.evaluated = {
  props: {
    id: true,
    url: true,
    scopeType: true,
    scopeId: true,
    events: true,
    active: true,
    createdAt: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
export const updateWebhookOutputFull = validate23;
const schema36 = {
  $ref: 'https://edition.invalid/control#/components/schemas/Subscription',
  $id: 'https://edition.invalid/validators/updateWebhookOutputFull',
};
function validate23(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/updateWebhookOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate23.evaluated;
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
              'https://edition.invalid/control#/components/schemas/Subscription/properties/id/format',
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
            'https://edition.invalid/control#/components/schemas/Subscription/properties/id/type',
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
    if (data.url !== undefined) {
      if (typeof data.url !== 'string') {
        const err2 = {
          instancePath: instancePath + '/url',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Subscription/properties/url/type',
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
    if (data.scopeType !== undefined) {
      if (typeof data.scopeType !== 'string') {
        const err3 = {
          instancePath: instancePath + '/scopeType',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Subscription/properties/scopeType/type',
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
    if (data.scopeId !== undefined) {
      let data3 = data.scopeId;
      if (typeof data3 === 'string') {
        if (!formats0.test(data3)) {
          const err4 = {
            instancePath: instancePath + '/scopeId',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/Subscription/properties/scopeId/format',
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
          instancePath: instancePath + '/scopeId',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Subscription/properties/scopeId/type',
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
    if (data.events !== undefined) {
      let data4 = data.events;
      if (Array.isArray(data4)) {
        const len0 = data4.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (typeof data4[i0] !== 'string') {
            const err6 = {
              instancePath: instancePath + '/events/' + i0,
              schemaPath:
                'https://edition.invalid/control#/components/schemas/Subscription/properties/events/items/type',
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
        let i1 = data4.length;
        let j0;
        if (i1 > 1) {
          const indices0 = {};
          for (; i1--;) {
            let item0 = data4[i1];
            if (typeof item0 !== 'string') {
              continue;
            }
            if (typeof indices0[item0] == 'number') {
              j0 = indices0[item0];
              const err7 = {
                instancePath: instancePath + '/events',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/Subscription/properties/events/uniqueItems',
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
          instancePath: instancePath + '/events',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Subscription/properties/events/type',
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
    if (data.active !== undefined) {
      if (typeof data.active !== 'boolean') {
        const err9 = {
          instancePath: instancePath + '/active',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Subscription/properties/active/type',
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
    if (data.createdAt !== undefined) {
      let data7 = data.createdAt;
      if (typeof data7 === 'string') {
        if (!formats10.validate(data7)) {
          const err10 = {
            instancePath: instancePath + '/createdAt',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/Subscription/properties/createdAt/format',
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
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Subscription/properties/createdAt/type',
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
        'https://edition.invalid/control#/components/schemas/Subscription/type',
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
  validate23.errors = vErrors;
  return errors === 0;
}
validate23.evaluated = {
  props: {
    id: true,
    url: true,
    scopeType: true,
    scopeId: true,
    events: true,
    active: true,
    createdAt: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
