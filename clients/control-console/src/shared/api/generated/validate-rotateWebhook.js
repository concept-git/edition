// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const rotateWebhookInput = validate217;
const schema281 = {
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
  },
  required: ['path', 'query', 'header'],
  $id: 'https://edition.invalid/validators/rotateWebhookInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
const pattern4 = new RegExp('^[a-zA-Z0-9._:-]+$', 'u');
function validate217(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/rotateWebhookInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate217.evaluated;
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
    if (data.path !== undefined) {
      let data0 = data.path;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.id === undefined) {
          const err3 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'id' },
            message: "must have required property '" + 'id' + "'",
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
        if (data0.id !== undefined) {
          let data1 = data0.id;
          if (typeof data1 === 'string') {
            if (!formats0.test(data1)) {
              const err4 = {
                instancePath: instancePath + '/path/id',
                schemaPath: '#/properties/path/properties/id/format',
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
              instancePath: instancePath + '/path/id',
              schemaPath: '#/properties/path/properties/id/type',
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
    if (data.query !== undefined) {
      let data2 = data.query;
      if (data2 && typeof data2 == 'object' && !Array.isArray(data2)) {
        if (data2.tenantId === undefined) {
          const err7 = {
            instancePath: instancePath + '/query',
            schemaPath: '#/properties/query/required',
            keyword: 'required',
            params: { missingProperty: 'tenantId' },
            message: "must have required property '" + 'tenantId' + "'",
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
        if (data2.tenantId !== undefined) {
          let data3 = data2.tenantId;
          if (typeof data3 === 'string') {
            if (!formats0.test(data3)) {
              const err8 = {
                instancePath: instancePath + '/query/tenantId',
                schemaPath: '#/properties/query/properties/tenantId/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
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
              instancePath: instancePath + '/query/tenantId',
              schemaPath: '#/properties/query/properties/tenantId/type',
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
      } else {
        const err10 = {
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
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
    }
    if (data.header !== undefined) {
      let data4 = data.header;
      if (data4 && typeof data4 == 'object' && !Array.isArray(data4)) {
        if (data4['Idempotency-Key'] === undefined) {
          const err11 = {
            instancePath: instancePath + '/header',
            schemaPath: '#/properties/header/required',
            keyword: 'required',
            params: { missingProperty: 'Idempotency-Key' },
            message: "must have required property '" + 'Idempotency-Key' + "'",
          };
          if (vErrors === null) {
            vErrors = [err11];
          } else {
            vErrors.push(err11);
          }
          errors++;
        }
        if (data4['Idempotency-Key'] !== undefined) {
          let data5 = data4['Idempotency-Key'];
          if (typeof data5 === 'string') {
            if (func1(data5) > 128) {
              const err12 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/maxLength',
                keyword: 'maxLength',
                params: { limit: 128 },
                message: 'must NOT have more than 128 characters',
              };
              if (vErrors === null) {
                vErrors = [err12];
              } else {
                vErrors.push(err12);
              }
              errors++;
            }
            if (func1(data5) < 1) {
              const err13 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/minLength',
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
            if (!pattern4.test(data5)) {
              const err14 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/pattern',
                keyword: 'pattern',
                params: { pattern: '^[a-zA-Z0-9._:-]+$' },
                message: 'must match pattern "' + '^[a-zA-Z0-9._:-]+$' + '"',
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
              instancePath: instancePath + '/header/Idempotency-Key',
              schemaPath: '#/properties/header/properties/Idempotency-Key/type',
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
      } else {
        const err16 = {
          instancePath: instancePath + '/header',
          schemaPath: '#/properties/header/type',
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
    }
  } else {
    const err17 = {
      instancePath,
      schemaPath: '#/type',
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
  validate217.errors = vErrors;
  return errors === 0;
}
validate217.evaluated = {
  props: { path: true, query: true, header: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const rotateWebhookOutput = validate218;
const schema282 = {
  $ref: 'https://edition.invalid/control#/components/schemas/SecretResult',
  $id: 'https://edition.invalid/validators/rotateWebhookOutput',
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
function validate219(
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
  const evaluated0 = validate219.evaluated;
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
  validate219.errors = vErrors;
  return errors === 0;
}
validate219.evaluated = {
  props: { subscription: true, secret: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate218(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/rotateWebhookOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate218.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate219(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate219.errors
        : vErrors.concat(validate219.errors);
    errors = vErrors.length;
  }
  validate218.errors = vErrors;
  return errors === 0;
}
validate218.evaluated = {
  props: { subscription: true, secret: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const rotateWebhookOutputFull = validate221;
const schema285 = {
  $ref: 'https://edition.invalid/control#/components/schemas/SecretResult',
  $id: 'https://edition.invalid/validators/rotateWebhookOutputFull',
};
function validate222(
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
  const evaluated0 = validate222.evaluated;
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
  validate222.errors = vErrors;
  return errors === 0;
}
validate222.evaluated = {
  props: { subscription: true, secret: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate221(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/rotateWebhookOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate221.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate222(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate222.errors
        : vErrors.concat(validate222.errors);
    errors = vErrors.length;
  }
  validate221.errors = vErrors;
  return errors === 0;
}
validate221.evaluated = {
  props: { subscription: true, secret: true },
  dynamicProps: false,
  dynamicItems: false,
};
