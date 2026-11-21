// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const listRedirectsInput = validate581;
const schema687 = {
  type: 'object',
  properties: {
    path: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', format: 'uuid' },
        siteId: { type: 'string', format: 'uuid' },
      },
      required: ['tenantId', 'siteId'],
    },
    query: {
      type: 'object',
      properties: {
        origin: { type: 'string', pattern: 'auto|manual' },
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
  required: ['path'],
  $id: 'https://edition.invalid/validators/listRedirectsInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const pattern78 = new RegExp('auto|manual', 'u');
const func1 = ucs2Length;
function validate581(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listRedirectsInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate581.evaluated;
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
    if (data.path !== undefined) {
      let data0 = data.path;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.tenantId === undefined) {
          const err1 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
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
        if (data0.siteId === undefined) {
          const err2 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'siteId' },
            message: "must have required property '" + 'siteId' + "'",
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
        if (data0.tenantId !== undefined) {
          let data1 = data0.tenantId;
          if (typeof data1 === 'string') {
            if (!formats0.test(data1)) {
              const err3 = {
                instancePath: instancePath + '/path/tenantId',
                schemaPath: '#/properties/path/properties/tenantId/format',
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
              instancePath: instancePath + '/path/tenantId',
              schemaPath: '#/properties/path/properties/tenantId/type',
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
        if (data0.siteId !== undefined) {
          let data2 = data0.siteId;
          if (typeof data2 === 'string') {
            if (!formats0.test(data2)) {
              const err5 = {
                instancePath: instancePath + '/path/siteId',
                schemaPath: '#/properties/path/properties/siteId/format',
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
              instancePath: instancePath + '/path/siteId',
              schemaPath: '#/properties/path/properties/siteId/type',
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
      let data3 = data.query;
      if (data3 && typeof data3 == 'object' && !Array.isArray(data3)) {
        if (data3.origin !== undefined) {
          let data4 = data3.origin;
          if (typeof data4 === 'string') {
            if (!pattern78.test(data4)) {
              const err8 = {
                instancePath: instancePath + '/query/origin',
                schemaPath: '#/properties/query/properties/origin/pattern',
                keyword: 'pattern',
                params: { pattern: 'auto|manual' },
                message: 'must match pattern "' + 'auto|manual' + '"',
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
              instancePath: instancePath + '/query/origin',
              schemaPath: '#/properties/query/properties/origin/type',
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
        if (data3.cursor !== undefined) {
          if (typeof data3.cursor !== 'string') {
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
        if (data3.limit !== undefined) {
          let data6 = data3.limit;
          if (!(typeof data6 == 'number' && !(data6 % 1) && !isNaN(data6))) {
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
          if (typeof data6 == 'number') {
            if (data6 > 100 || isNaN(data6)) {
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
            if (data6 < 1 || isNaN(data6)) {
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
        if (data3.fields !== undefined) {
          let data7 = data3.fields;
          if (typeof data7 === 'string') {
            if (func1(data7) > 4096) {
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
            if (func1(data7) < 1) {
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
  validate581.errors = vErrors;
  return errors === 0;
}
validate581.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const listRedirectsOutput = validate582;
const schema688 = {
  anyOf: [
    {
      $ref: 'https://edition.invalid/control#/components/schemas/RedirectPageResponse',
    },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialRedirectPageResponse',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/listRedirectsOutput',
};
const schema689 = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { $ref: '#/components/schemas/RedirectResponse' },
    },
    nextCursor: { type: 'string' },
  },
};
const schema690 = {
  type: 'object',
  properties: {
    path: { type: 'string' },
    targetId: { type: 'string', format: 'uuid' },
    targetType: { type: 'string' },
    origin: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    hitCount: { type: 'integer', format: 'int64' },
    currentPath: { type: 'string' },
    targetLabel: { type: 'string' },
    reachable: { type: 'boolean' },
  },
};
const formats10 = fullFormats['date-time'];
function validate583(
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
  const evaluated0 = validate583.evaluated;
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
            if (data1.path !== undefined) {
              if (typeof data1.path !== 'string') {
                const err0 = {
                  instancePath: instancePath + '/items/' + i0 + '/path',
                  schemaPath:
                    '#/components/schemas/RedirectResponse/properties/path/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err0];
                } else {
                  vErrors.push(err0);
                }
                errors++;
              }
            }
            if (data1.targetId !== undefined) {
              let data3 = data1.targetId;
              if (typeof data3 === 'string') {
                if (!formats0.test(data3)) {
                  const err1 = {
                    instancePath: instancePath + '/items/' + i0 + '/targetId',
                    schemaPath:
                      '#/components/schemas/RedirectResponse/properties/targetId/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/targetId',
                  schemaPath:
                    '#/components/schemas/RedirectResponse/properties/targetId/type',
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
            if (data1.targetType !== undefined) {
              if (typeof data1.targetType !== 'string') {
                const err3 = {
                  instancePath: instancePath + '/items/' + i0 + '/targetType',
                  schemaPath:
                    '#/components/schemas/RedirectResponse/properties/targetType/type',
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
            if (data1.origin !== undefined) {
              if (typeof data1.origin !== 'string') {
                const err4 = {
                  instancePath: instancePath + '/items/' + i0 + '/origin',
                  schemaPath:
                    '#/components/schemas/RedirectResponse/properties/origin/type',
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
            if (data1.createdAt !== undefined) {
              let data6 = data1.createdAt;
              if (typeof data6 === 'string') {
                if (!formats10.validate(data6)) {
                  const err5 = {
                    instancePath: instancePath + '/items/' + i0 + '/createdAt',
                    schemaPath:
                      '#/components/schemas/RedirectResponse/properties/createdAt/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/createdAt',
                  schemaPath:
                    '#/components/schemas/RedirectResponse/properties/createdAt/type',
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
            if (data1.hitCount !== undefined) {
              let data7 = data1.hitCount;
              if (!(
                typeof data7 == 'number' &&
                !(data7 % 1) &&
                !isNaN(data7)
              )) {
                const err7 = {
                  instancePath: instancePath + '/items/' + i0 + '/hitCount',
                  schemaPath:
                    '#/components/schemas/RedirectResponse/properties/hitCount/type',
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
            if (data1.currentPath !== undefined) {
              if (typeof data1.currentPath !== 'string') {
                const err8 = {
                  instancePath: instancePath + '/items/' + i0 + '/currentPath',
                  schemaPath:
                    '#/components/schemas/RedirectResponse/properties/currentPath/type',
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
            if (data1.targetLabel !== undefined) {
              if (typeof data1.targetLabel !== 'string') {
                const err9 = {
                  instancePath: instancePath + '/items/' + i0 + '/targetLabel',
                  schemaPath:
                    '#/components/schemas/RedirectResponse/properties/targetLabel/type',
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
            if (data1.reachable !== undefined) {
              if (typeof data1.reachable !== 'boolean') {
                const err10 = {
                  instancePath: instancePath + '/items/' + i0 + '/reachable',
                  schemaPath:
                    '#/components/schemas/RedirectResponse/properties/reachable/type',
                  keyword: 'type',
                  params: { type: 'boolean' },
                  message: 'must be boolean',
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
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/RedirectResponse/type',
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
      } else {
        const err12 = {
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
    }
    if (data.nextCursor !== undefined) {
      if (typeof data.nextCursor !== 'string') {
        const err13 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
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
  validate583.errors = vErrors;
  return errors === 0;
}
validate583.evaluated = {
  props: { items: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
const schema691 = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialRedirectResponse' },
    },
    nextCursor: { type: 'string' },
  },
};
const schema692 = {
  type: 'object',
  properties: {
    path: { type: 'string' },
    targetId: { type: 'string', format: 'uuid' },
    targetType: { type: 'string' },
    origin: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    hitCount: { type: 'integer', format: 'int64' },
    currentPath: { type: 'string' },
    targetLabel: { type: 'string' },
    reachable: { type: 'boolean' },
  },
};
function validate585(
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
  const evaluated0 = validate585.evaluated;
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
            if (data1.path !== undefined) {
              if (typeof data1.path !== 'string') {
                const err0 = {
                  instancePath: instancePath + '/items/' + i0 + '/path',
                  schemaPath:
                    '#/components/schemas/PartialRedirectResponse/properties/path/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err0];
                } else {
                  vErrors.push(err0);
                }
                errors++;
              }
            }
            if (data1.targetId !== undefined) {
              let data3 = data1.targetId;
              if (typeof data3 === 'string') {
                if (!formats0.test(data3)) {
                  const err1 = {
                    instancePath: instancePath + '/items/' + i0 + '/targetId',
                    schemaPath:
                      '#/components/schemas/PartialRedirectResponse/properties/targetId/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/targetId',
                  schemaPath:
                    '#/components/schemas/PartialRedirectResponse/properties/targetId/type',
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
            if (data1.targetType !== undefined) {
              if (typeof data1.targetType !== 'string') {
                const err3 = {
                  instancePath: instancePath + '/items/' + i0 + '/targetType',
                  schemaPath:
                    '#/components/schemas/PartialRedirectResponse/properties/targetType/type',
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
            if (data1.origin !== undefined) {
              if (typeof data1.origin !== 'string') {
                const err4 = {
                  instancePath: instancePath + '/items/' + i0 + '/origin',
                  schemaPath:
                    '#/components/schemas/PartialRedirectResponse/properties/origin/type',
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
            if (data1.createdAt !== undefined) {
              let data6 = data1.createdAt;
              if (typeof data6 === 'string') {
                if (!formats10.validate(data6)) {
                  const err5 = {
                    instancePath: instancePath + '/items/' + i0 + '/createdAt',
                    schemaPath:
                      '#/components/schemas/PartialRedirectResponse/properties/createdAt/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/createdAt',
                  schemaPath:
                    '#/components/schemas/PartialRedirectResponse/properties/createdAt/type',
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
            if (data1.hitCount !== undefined) {
              let data7 = data1.hitCount;
              if (!(
                typeof data7 == 'number' &&
                !(data7 % 1) &&
                !isNaN(data7)
              )) {
                const err7 = {
                  instancePath: instancePath + '/items/' + i0 + '/hitCount',
                  schemaPath:
                    '#/components/schemas/PartialRedirectResponse/properties/hitCount/type',
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
            if (data1.currentPath !== undefined) {
              if (typeof data1.currentPath !== 'string') {
                const err8 = {
                  instancePath: instancePath + '/items/' + i0 + '/currentPath',
                  schemaPath:
                    '#/components/schemas/PartialRedirectResponse/properties/currentPath/type',
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
            if (data1.targetLabel !== undefined) {
              if (typeof data1.targetLabel !== 'string') {
                const err9 = {
                  instancePath: instancePath + '/items/' + i0 + '/targetLabel',
                  schemaPath:
                    '#/components/schemas/PartialRedirectResponse/properties/targetLabel/type',
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
            if (data1.reachable !== undefined) {
              if (typeof data1.reachable !== 'boolean') {
                const err10 = {
                  instancePath: instancePath + '/items/' + i0 + '/reachable',
                  schemaPath:
                    '#/components/schemas/PartialRedirectResponse/properties/reachable/type',
                  keyword: 'type',
                  params: { type: 'boolean' },
                  message: 'must be boolean',
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
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/PartialRedirectResponse/type',
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
      } else {
        const err12 = {
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
    }
    if (data.nextCursor !== undefined) {
      if (typeof data.nextCursor !== 'string') {
        const err13 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
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
  validate585.errors = vErrors;
  return errors === 0;
}
validate585.evaluated = {
  props: { items: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate582(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listRedirectsOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate582.evaluated;
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
    !validate583(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate583.errors
        : vErrors.concat(validate583.errors);
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
    !validate585(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate585.errors
        : vErrors.concat(validate585.errors);
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
  validate582.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate582.evaluated = { dynamicProps: true, dynamicItems: false };
export const listRedirectsOutputFull = validate587;
const schema693 = {
  $ref: 'https://edition.invalid/control#/components/schemas/RedirectPageResponse',
  $id: 'https://edition.invalid/validators/listRedirectsOutputFull',
};
function validate588(
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
  const evaluated0 = validate588.evaluated;
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
            if (data1.path !== undefined) {
              if (typeof data1.path !== 'string') {
                const err0 = {
                  instancePath: instancePath + '/items/' + i0 + '/path',
                  schemaPath:
                    '#/components/schemas/RedirectResponse/properties/path/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err0];
                } else {
                  vErrors.push(err0);
                }
                errors++;
              }
            }
            if (data1.targetId !== undefined) {
              let data3 = data1.targetId;
              if (typeof data3 === 'string') {
                if (!formats0.test(data3)) {
                  const err1 = {
                    instancePath: instancePath + '/items/' + i0 + '/targetId',
                    schemaPath:
                      '#/components/schemas/RedirectResponse/properties/targetId/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/targetId',
                  schemaPath:
                    '#/components/schemas/RedirectResponse/properties/targetId/type',
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
            if (data1.targetType !== undefined) {
              if (typeof data1.targetType !== 'string') {
                const err3 = {
                  instancePath: instancePath + '/items/' + i0 + '/targetType',
                  schemaPath:
                    '#/components/schemas/RedirectResponse/properties/targetType/type',
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
            if (data1.origin !== undefined) {
              if (typeof data1.origin !== 'string') {
                const err4 = {
                  instancePath: instancePath + '/items/' + i0 + '/origin',
                  schemaPath:
                    '#/components/schemas/RedirectResponse/properties/origin/type',
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
            if (data1.createdAt !== undefined) {
              let data6 = data1.createdAt;
              if (typeof data6 === 'string') {
                if (!formats10.validate(data6)) {
                  const err5 = {
                    instancePath: instancePath + '/items/' + i0 + '/createdAt',
                    schemaPath:
                      '#/components/schemas/RedirectResponse/properties/createdAt/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/createdAt',
                  schemaPath:
                    '#/components/schemas/RedirectResponse/properties/createdAt/type',
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
            if (data1.hitCount !== undefined) {
              let data7 = data1.hitCount;
              if (!(
                typeof data7 == 'number' &&
                !(data7 % 1) &&
                !isNaN(data7)
              )) {
                const err7 = {
                  instancePath: instancePath + '/items/' + i0 + '/hitCount',
                  schemaPath:
                    '#/components/schemas/RedirectResponse/properties/hitCount/type',
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
            if (data1.currentPath !== undefined) {
              if (typeof data1.currentPath !== 'string') {
                const err8 = {
                  instancePath: instancePath + '/items/' + i0 + '/currentPath',
                  schemaPath:
                    '#/components/schemas/RedirectResponse/properties/currentPath/type',
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
            if (data1.targetLabel !== undefined) {
              if (typeof data1.targetLabel !== 'string') {
                const err9 = {
                  instancePath: instancePath + '/items/' + i0 + '/targetLabel',
                  schemaPath:
                    '#/components/schemas/RedirectResponse/properties/targetLabel/type',
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
            if (data1.reachable !== undefined) {
              if (typeof data1.reachable !== 'boolean') {
                const err10 = {
                  instancePath: instancePath + '/items/' + i0 + '/reachable',
                  schemaPath:
                    '#/components/schemas/RedirectResponse/properties/reachable/type',
                  keyword: 'type',
                  params: { type: 'boolean' },
                  message: 'must be boolean',
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
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/RedirectResponse/type',
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
      } else {
        const err12 = {
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
    }
    if (data.nextCursor !== undefined) {
      if (typeof data.nextCursor !== 'string') {
        const err13 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
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
  validate588.errors = vErrors;
  return errors === 0;
}
validate588.evaluated = {
  props: { items: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate587(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listRedirectsOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate587.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate588(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate588.errors
        : vErrors.concat(validate588.errors);
    errors = vErrors.length;
  }
  validate587.errors = vErrors;
  return errors === 0;
}
validate587.evaluated = {
  props: { items: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
