// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const listPagesInput = validate438;
const schema528 = {
  type: 'object',
  properties: {
    path: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', format: 'uuid' },
        spaceId: { type: 'string', format: 'uuid' },
      },
      required: ['tenantId', 'spaceId'],
    },
    query: {
      type: 'object',
      properties: {
        cursor: { type: 'string' },
        limit: {
          type: 'integer',
          format: 'int32',
          default: 20,
          maximum: 100,
          minimum: 1,
        },
        status: { type: 'string', pattern: 'draft|published' },
        format: { type: 'string', pattern: 'markdown|html|txt|json|xml' },
        tag: { type: 'string' },
        q: { type: 'string', maxLength: 200, minLength: 0 },
        ids: {
          type: 'array',
          items: { type: 'string', format: 'uuid' },
          maxItems: 100,
          minItems: 1,
        },
        fields: { type: 'string', maxLength: 4096, minLength: 1 },
      },
      required: [],
    },
  },
  required: ['path'],
  $id: 'https://edition.invalid/validators/listPagesInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const pattern60 = new RegExp('draft|published', 'u');
const pattern61 = new RegExp('markdown|html|txt|json|xml', 'u');
const func1 = ucs2Length;
function validate438(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listPagesInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate438.evaluated;
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
        if (data0.spaceId === undefined) {
          const err2 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'spaceId' },
            message: "must have required property '" + 'spaceId' + "'",
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
        if (data0.spaceId !== undefined) {
          let data2 = data0.spaceId;
          if (typeof data2 === 'string') {
            if (!formats0.test(data2)) {
              const err5 = {
                instancePath: instancePath + '/path/spaceId',
                schemaPath: '#/properties/path/properties/spaceId/format',
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
              instancePath: instancePath + '/path/spaceId',
              schemaPath: '#/properties/path/properties/spaceId/type',
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
        if (data3.cursor !== undefined) {
          if (typeof data3.cursor !== 'string') {
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
        if (data3.limit !== undefined) {
          let data5 = data3.limit;
          if (!(typeof data5 == 'number' && !(data5 % 1) && !isNaN(data5))) {
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
          if (typeof data5 == 'number') {
            if (data5 > 100 || isNaN(data5)) {
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
            if (data5 < 1 || isNaN(data5)) {
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
        if (data3.status !== undefined) {
          let data6 = data3.status;
          if (typeof data6 === 'string') {
            if (!pattern60.test(data6)) {
              const err12 = {
                instancePath: instancePath + '/query/status',
                schemaPath: '#/properties/query/properties/status/pattern',
                keyword: 'pattern',
                params: { pattern: 'draft|published' },
                message: 'must match pattern "' + 'draft|published' + '"',
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
              instancePath: instancePath + '/query/status',
              schemaPath: '#/properties/query/properties/status/type',
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
        if (data3.format !== undefined) {
          let data7 = data3.format;
          if (typeof data7 === 'string') {
            if (!pattern61.test(data7)) {
              const err14 = {
                instancePath: instancePath + '/query/format',
                schemaPath: '#/properties/query/properties/format/pattern',
                keyword: 'pattern',
                params: { pattern: 'markdown|html|txt|json|xml' },
                message:
                  'must match pattern "' + 'markdown|html|txt|json|xml' + '"',
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
              instancePath: instancePath + '/query/format',
              schemaPath: '#/properties/query/properties/format/type',
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
        if (data3.tag !== undefined) {
          if (typeof data3.tag !== 'string') {
            const err16 = {
              instancePath: instancePath + '/query/tag',
              schemaPath: '#/properties/query/properties/tag/type',
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
        if (data3.q !== undefined) {
          let data9 = data3.q;
          if (typeof data9 === 'string') {
            if (func1(data9) > 200) {
              const err17 = {
                instancePath: instancePath + '/query/q',
                schemaPath: '#/properties/query/properties/q/maxLength',
                keyword: 'maxLength',
                params: { limit: 200 },
                message: 'must NOT have more than 200 characters',
              };
              if (vErrors === null) {
                vErrors = [err17];
              } else {
                vErrors.push(err17);
              }
              errors++;
            }
            if (func1(data9) < 0) {
              const err18 = {
                instancePath: instancePath + '/query/q',
                schemaPath: '#/properties/query/properties/q/minLength',
                keyword: 'minLength',
                params: { limit: 0 },
                message: 'must NOT have fewer than 0 characters',
              };
              if (vErrors === null) {
                vErrors = [err18];
              } else {
                vErrors.push(err18);
              }
              errors++;
            }
          } else {
            const err19 = {
              instancePath: instancePath + '/query/q',
              schemaPath: '#/properties/query/properties/q/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err19];
            } else {
              vErrors.push(err19);
            }
            errors++;
          }
        }
        if (data3.ids !== undefined) {
          let data10 = data3.ids;
          if (Array.isArray(data10)) {
            if (data10.length > 100) {
              const err20 = {
                instancePath: instancePath + '/query/ids',
                schemaPath: '#/properties/query/properties/ids/maxItems',
                keyword: 'maxItems',
                params: { limit: 100 },
                message: 'must NOT have more than 100 items',
              };
              if (vErrors === null) {
                vErrors = [err20];
              } else {
                vErrors.push(err20);
              }
              errors++;
            }
            if (data10.length < 1) {
              const err21 = {
                instancePath: instancePath + '/query/ids',
                schemaPath: '#/properties/query/properties/ids/minItems',
                keyword: 'minItems',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 items',
              };
              if (vErrors === null) {
                vErrors = [err21];
              } else {
                vErrors.push(err21);
              }
              errors++;
            }
            const len0 = data10.length;
            for (let i0 = 0; i0 < len0; i0++) {
              let data11 = data10[i0];
              if (typeof data11 === 'string') {
                if (!formats0.test(data11)) {
                  const err22 = {
                    instancePath: instancePath + '/query/ids/' + i0,
                    schemaPath:
                      '#/properties/query/properties/ids/items/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
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
                  instancePath: instancePath + '/query/ids/' + i0,
                  schemaPath: '#/properties/query/properties/ids/items/type',
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
          } else {
            const err24 = {
              instancePath: instancePath + '/query/ids',
              schemaPath: '#/properties/query/properties/ids/type',
              keyword: 'type',
              params: { type: 'array' },
              message: 'must be array',
            };
            if (vErrors === null) {
              vErrors = [err24];
            } else {
              vErrors.push(err24);
            }
            errors++;
          }
        }
        if (data3.fields !== undefined) {
          let data12 = data3.fields;
          if (typeof data12 === 'string') {
            if (func1(data12) > 4096) {
              const err25 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/maxLength',
                keyword: 'maxLength',
                params: { limit: 4096 },
                message: 'must NOT have more than 4096 characters',
              };
              if (vErrors === null) {
                vErrors = [err25];
              } else {
                vErrors.push(err25);
              }
              errors++;
            }
            if (func1(data12) < 1) {
              const err26 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
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
              instancePath: instancePath + '/query/fields',
              schemaPath: '#/properties/query/properties/fields/type',
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
      } else {
        const err28 = {
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
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
      instancePath,
      schemaPath: '#/type',
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
  validate438.errors = vErrors;
  return errors === 0;
}
validate438.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const listPagesOutput = validate439;
const schema529 = {
  anyOf: [
    { $ref: 'https://edition.invalid/control#/components/schemas/PagePage' },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialPagePage',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/listPagesOutput',
};
const schema530 = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { $ref: '#/components/schemas/PageSummary' },
    },
    nextCursor: { type: ['string', 'null'] },
    total: { type: ['integer', 'null'], format: 'int64' },
    allowedActions: {
      type: 'array',
      items: { type: 'string' },
      uniqueItems: true,
    },
  },
};
const schema531 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    title: { type: 'string' },
    slug: { type: 'string' },
    status: { type: 'string' },
    format: { type: 'string' },
    icon: { type: ['string', 'null'] },
    tags: { type: 'array', items: { type: 'string' } },
    driftFlag: { type: 'boolean' },
    updatedAt: { type: 'string', format: 'date-time' },
    updatedBy: { type: 'string', format: 'uuid' },
    publishedAt: { type: ['string', 'null'], format: 'date-time' },
    allowedActions: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          'create',
          'read',
          'rename',
          'edit',
          'revert',
          'reslug',
          'transfer',
          'publish',
          'unpublish',
        ],
      },
      uniqueItems: true,
    },
    contentType: { type: 'string' },
    versionRef: { type: 'string' },
    interpretation: { type: 'object', additionalProperties: {} },
  },
};
const formats10 = fullFormats['date-time'];
function validate440(
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
  const evaluated0 = validate440.evaluated;
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
                      '#/components/schemas/PageSummary/properties/id/format',
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
                    '#/components/schemas/PageSummary/properties/id/type',
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
            if (data1.title !== undefined) {
              if (typeof data1.title !== 'string') {
                const err2 = {
                  instancePath: instancePath + '/items/' + i0 + '/title',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/title/type',
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
            if (data1.slug !== undefined) {
              if (typeof data1.slug !== 'string') {
                const err3 = {
                  instancePath: instancePath + '/items/' + i0 + '/slug',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/slug/type',
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
            if (data1.status !== undefined) {
              if (typeof data1.status !== 'string') {
                const err4 = {
                  instancePath: instancePath + '/items/' + i0 + '/status',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/status/type',
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
            if (data1.format !== undefined) {
              if (typeof data1.format !== 'string') {
                const err5 = {
                  instancePath: instancePath + '/items/' + i0 + '/format',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/format/type',
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
            if (data1.icon !== undefined) {
              let data7 = data1.icon;
              if (typeof data7 !== 'string' && data7 !== null) {
                const err6 = {
                  instancePath: instancePath + '/items/' + i0 + '/icon',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/icon/type',
                  keyword: 'type',
                  params: { type: schema531.properties.icon.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err6];
                } else {
                  vErrors.push(err6);
                }
                errors++;
              }
            }
            if (data1.tags !== undefined) {
              let data8 = data1.tags;
              if (Array.isArray(data8)) {
                const len1 = data8.length;
                for (let i1 = 0; i1 < len1; i1++) {
                  if (typeof data8[i1] !== 'string') {
                    const err7 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/tags/' + i1,
                      schemaPath:
                        '#/components/schemas/PageSummary/properties/tags/items/type',
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
                  instancePath: instancePath + '/items/' + i0 + '/tags',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/tags/type',
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
            if (data1.driftFlag !== undefined) {
              if (typeof data1.driftFlag !== 'boolean') {
                const err9 = {
                  instancePath: instancePath + '/items/' + i0 + '/driftFlag',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/driftFlag/type',
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
            if (data1.updatedAt !== undefined) {
              let data11 = data1.updatedAt;
              if (typeof data11 === 'string') {
                if (!formats10.validate(data11)) {
                  const err10 = {
                    instancePath: instancePath + '/items/' + i0 + '/updatedAt',
                    schemaPath:
                      '#/components/schemas/PageSummary/properties/updatedAt/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/updatedAt',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/updatedAt/type',
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
            if (data1.updatedBy !== undefined) {
              let data12 = data1.updatedBy;
              if (typeof data12 === 'string') {
                if (!formats0.test(data12)) {
                  const err12 = {
                    instancePath: instancePath + '/items/' + i0 + '/updatedBy',
                    schemaPath:
                      '#/components/schemas/PageSummary/properties/updatedBy/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/updatedBy',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/updatedBy/type',
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
            if (data1.publishedAt !== undefined) {
              let data13 = data1.publishedAt;
              if (typeof data13 !== 'string' && data13 !== null) {
                const err14 = {
                  instancePath: instancePath + '/items/' + i0 + '/publishedAt',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/publishedAt/type',
                  keyword: 'type',
                  params: { type: schema531.properties.publishedAt.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err14];
                } else {
                  vErrors.push(err14);
                }
                errors++;
              }
              if (typeof data13 === 'string') {
                if (!formats10.validate(data13)) {
                  const err15 = {
                    instancePath:
                      instancePath + '/items/' + i0 + '/publishedAt',
                    schemaPath:
                      '#/components/schemas/PageSummary/properties/publishedAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
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
            if (data1.allowedActions !== undefined) {
              let data14 = data1.allowedActions;
              if (Array.isArray(data14)) {
                const len2 = data14.length;
                for (let i2 = 0; i2 < len2; i2++) {
                  let data15 = data14[i2];
                  if (typeof data15 !== 'string') {
                    const err16 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/allowedActions/' + i2,
                      schemaPath:
                        '#/components/schemas/PageSummary/properties/allowedActions/items/type',
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
                  if (!(
                    data15 === 'create' ||
                    data15 === 'read' ||
                    data15 === 'rename' ||
                    data15 === 'edit' ||
                    data15 === 'revert' ||
                    data15 === 'reslug' ||
                    data15 === 'transfer' ||
                    data15 === 'publish' ||
                    data15 === 'unpublish'
                  )) {
                    const err17 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/allowedActions/' + i2,
                      schemaPath:
                        '#/components/schemas/PageSummary/properties/allowedActions/items/enum',
                      keyword: 'enum',
                      params: {
                        allowedValues:
                          schema531.properties.allowedActions.items.enum,
                      },
                      message: 'must be equal to one of the allowed values',
                    };
                    if (vErrors === null) {
                      vErrors = [err17];
                    } else {
                      vErrors.push(err17);
                    }
                    errors++;
                  }
                }
                let i3 = data14.length;
                let j0;
                if (i3 > 1) {
                  const indices0 = {};
                  for (; i3--;) {
                    let item0 = data14[i3];
                    if (typeof item0 !== 'string') {
                      continue;
                    }
                    if (typeof indices0[item0] == 'number') {
                      j0 = indices0[item0];
                      const err18 = {
                        instancePath:
                          instancePath + '/items/' + i0 + '/allowedActions',
                        schemaPath:
                          '#/components/schemas/PageSummary/properties/allowedActions/uniqueItems',
                        keyword: 'uniqueItems',
                        params: { i: i3, j: j0 },
                        message:
                          'must NOT have duplicate items (items ## ' +
                          j0 +
                          ' and ' +
                          i3 +
                          ' are identical)',
                      };
                      if (vErrors === null) {
                        vErrors = [err18];
                      } else {
                        vErrors.push(err18);
                      }
                      errors++;
                      break;
                    }
                    indices0[item0] = i3;
                  }
                }
              } else {
                const err19 = {
                  instancePath:
                    instancePath + '/items/' + i0 + '/allowedActions',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/allowedActions/type',
                  keyword: 'type',
                  params: { type: 'array' },
                  message: 'must be array',
                };
                if (vErrors === null) {
                  vErrors = [err19];
                } else {
                  vErrors.push(err19);
                }
                errors++;
              }
            }
            if (data1.contentType !== undefined) {
              if (typeof data1.contentType !== 'string') {
                const err20 = {
                  instancePath: instancePath + '/items/' + i0 + '/contentType',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/contentType/type',
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
            if (data1.versionRef !== undefined) {
              if (typeof data1.versionRef !== 'string') {
                const err21 = {
                  instancePath: instancePath + '/items/' + i0 + '/versionRef',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/versionRef/type',
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
            if (data1.interpretation !== undefined) {
              let data18 = data1.interpretation;
              if (
                data18 &&
                typeof data18 == 'object' &&
                !Array.isArray(data18)
              ) {
              } else {
                const err22 = {
                  instancePath:
                    instancePath + '/items/' + i0 + '/interpretation',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/interpretation/type',
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
            }
          } else {
            const err23 = {
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/PageSummary/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
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
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err24];
        } else {
          vErrors.push(err24);
        }
        errors++;
      }
    }
    if (data.nextCursor !== undefined) {
      let data19 = data.nextCursor;
      if (typeof data19 !== 'string' && data19 !== null) {
        const err25 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
          keyword: 'type',
          params: { type: schema530.properties.nextCursor.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err25];
        } else {
          vErrors.push(err25);
        }
        errors++;
      }
    }
    if (data.total !== undefined) {
      let data20 = data.total;
      if (
        !(typeof data20 == 'number' && !(data20 % 1) && !isNaN(data20)) &&
        data20 !== null
      ) {
        const err26 = {
          instancePath: instancePath + '/total',
          schemaPath: '#/properties/total/type',
          keyword: 'type',
          params: { type: schema530.properties.total.type },
          message: 'must be integer,null',
        };
        if (vErrors === null) {
          vErrors = [err26];
        } else {
          vErrors.push(err26);
        }
        errors++;
      }
    }
    if (data.allowedActions !== undefined) {
      let data21 = data.allowedActions;
      if (Array.isArray(data21)) {
        const len3 = data21.length;
        for (let i4 = 0; i4 < len3; i4++) {
          if (typeof data21[i4] !== 'string') {
            const err27 = {
              instancePath: instancePath + '/allowedActions/' + i4,
              schemaPath: '#/properties/allowedActions/items/type',
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
        let i5 = data21.length;
        let j1;
        if (i5 > 1) {
          const indices1 = {};
          for (; i5--;) {
            let item1 = data21[i5];
            if (typeof item1 !== 'string') {
              continue;
            }
            if (typeof indices1[item1] == 'number') {
              j1 = indices1[item1];
              const err28 = {
                instancePath: instancePath + '/allowedActions',
                schemaPath: '#/properties/allowedActions/uniqueItems',
                keyword: 'uniqueItems',
                params: { i: i5, j: j1 },
                message:
                  'must NOT have duplicate items (items ## ' +
                  j1 +
                  ' and ' +
                  i5 +
                  ' are identical)',
              };
              if (vErrors === null) {
                vErrors = [err28];
              } else {
                vErrors.push(err28);
              }
              errors++;
              break;
            }
            indices1[item1] = i5;
          }
        }
      } else {
        const err29 = {
          instancePath: instancePath + '/allowedActions',
          schemaPath: '#/properties/allowedActions/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
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
  validate440.errors = vErrors;
  return errors === 0;
}
validate440.evaluated = {
  props: { items: true, nextCursor: true, total: true, allowedActions: true },
  dynamicProps: false,
  dynamicItems: false,
};
const schema532 = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialPageSummary' },
    },
    nextCursor: { type: ['string', 'null'] },
    total: { type: ['integer', 'null'], format: 'int64' },
    allowedActions: {
      type: 'array',
      items: { type: 'string' },
      uniqueItems: true,
    },
  },
};
const schema533 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    title: { type: 'string' },
    slug: { type: 'string' },
    status: { type: 'string' },
    format: { type: 'string' },
    icon: { type: ['string', 'null'] },
    tags: { type: 'array', items: { type: 'string' } },
    driftFlag: { type: 'boolean' },
    updatedAt: { type: 'string', format: 'date-time' },
    updatedBy: { type: 'string', format: 'uuid' },
    publishedAt: { type: ['string', 'null'], format: 'date-time' },
    allowedActions: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          'create',
          'read',
          'rename',
          'edit',
          'revert',
          'reslug',
          'transfer',
          'publish',
          'unpublish',
        ],
      },
      uniqueItems: true,
    },
    contentType: { type: 'string' },
    versionRef: { type: 'string' },
    interpretation: { type: 'object', additionalProperties: {} },
  },
};
function validate442(
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
  const evaluated0 = validate442.evaluated;
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
                      '#/components/schemas/PartialPageSummary/properties/id/format',
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
                    '#/components/schemas/PartialPageSummary/properties/id/type',
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
            if (data1.title !== undefined) {
              if (typeof data1.title !== 'string') {
                const err2 = {
                  instancePath: instancePath + '/items/' + i0 + '/title',
                  schemaPath:
                    '#/components/schemas/PartialPageSummary/properties/title/type',
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
            if (data1.slug !== undefined) {
              if (typeof data1.slug !== 'string') {
                const err3 = {
                  instancePath: instancePath + '/items/' + i0 + '/slug',
                  schemaPath:
                    '#/components/schemas/PartialPageSummary/properties/slug/type',
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
            if (data1.status !== undefined) {
              if (typeof data1.status !== 'string') {
                const err4 = {
                  instancePath: instancePath + '/items/' + i0 + '/status',
                  schemaPath:
                    '#/components/schemas/PartialPageSummary/properties/status/type',
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
            if (data1.format !== undefined) {
              if (typeof data1.format !== 'string') {
                const err5 = {
                  instancePath: instancePath + '/items/' + i0 + '/format',
                  schemaPath:
                    '#/components/schemas/PartialPageSummary/properties/format/type',
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
            if (data1.icon !== undefined) {
              let data7 = data1.icon;
              if (typeof data7 !== 'string' && data7 !== null) {
                const err6 = {
                  instancePath: instancePath + '/items/' + i0 + '/icon',
                  schemaPath:
                    '#/components/schemas/PartialPageSummary/properties/icon/type',
                  keyword: 'type',
                  params: { type: schema533.properties.icon.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err6];
                } else {
                  vErrors.push(err6);
                }
                errors++;
              }
            }
            if (data1.tags !== undefined) {
              let data8 = data1.tags;
              if (Array.isArray(data8)) {
                const len1 = data8.length;
                for (let i1 = 0; i1 < len1; i1++) {
                  if (typeof data8[i1] !== 'string') {
                    const err7 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/tags/' + i1,
                      schemaPath:
                        '#/components/schemas/PartialPageSummary/properties/tags/items/type',
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
                  instancePath: instancePath + '/items/' + i0 + '/tags',
                  schemaPath:
                    '#/components/schemas/PartialPageSummary/properties/tags/type',
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
            if (data1.driftFlag !== undefined) {
              if (typeof data1.driftFlag !== 'boolean') {
                const err9 = {
                  instancePath: instancePath + '/items/' + i0 + '/driftFlag',
                  schemaPath:
                    '#/components/schemas/PartialPageSummary/properties/driftFlag/type',
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
            if (data1.updatedAt !== undefined) {
              let data11 = data1.updatedAt;
              if (typeof data11 === 'string') {
                if (!formats10.validate(data11)) {
                  const err10 = {
                    instancePath: instancePath + '/items/' + i0 + '/updatedAt',
                    schemaPath:
                      '#/components/schemas/PartialPageSummary/properties/updatedAt/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/updatedAt',
                  schemaPath:
                    '#/components/schemas/PartialPageSummary/properties/updatedAt/type',
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
            if (data1.updatedBy !== undefined) {
              let data12 = data1.updatedBy;
              if (typeof data12 === 'string') {
                if (!formats0.test(data12)) {
                  const err12 = {
                    instancePath: instancePath + '/items/' + i0 + '/updatedBy',
                    schemaPath:
                      '#/components/schemas/PartialPageSummary/properties/updatedBy/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/updatedBy',
                  schemaPath:
                    '#/components/schemas/PartialPageSummary/properties/updatedBy/type',
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
            if (data1.publishedAt !== undefined) {
              let data13 = data1.publishedAt;
              if (typeof data13 !== 'string' && data13 !== null) {
                const err14 = {
                  instancePath: instancePath + '/items/' + i0 + '/publishedAt',
                  schemaPath:
                    '#/components/schemas/PartialPageSummary/properties/publishedAt/type',
                  keyword: 'type',
                  params: { type: schema533.properties.publishedAt.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err14];
                } else {
                  vErrors.push(err14);
                }
                errors++;
              }
              if (typeof data13 === 'string') {
                if (!formats10.validate(data13)) {
                  const err15 = {
                    instancePath:
                      instancePath + '/items/' + i0 + '/publishedAt',
                    schemaPath:
                      '#/components/schemas/PartialPageSummary/properties/publishedAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
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
            if (data1.allowedActions !== undefined) {
              let data14 = data1.allowedActions;
              if (Array.isArray(data14)) {
                const len2 = data14.length;
                for (let i2 = 0; i2 < len2; i2++) {
                  let data15 = data14[i2];
                  if (typeof data15 !== 'string') {
                    const err16 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/allowedActions/' + i2,
                      schemaPath:
                        '#/components/schemas/PartialPageSummary/properties/allowedActions/items/type',
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
                  if (!(
                    data15 === 'create' ||
                    data15 === 'read' ||
                    data15 === 'rename' ||
                    data15 === 'edit' ||
                    data15 === 'revert' ||
                    data15 === 'reslug' ||
                    data15 === 'transfer' ||
                    data15 === 'publish' ||
                    data15 === 'unpublish'
                  )) {
                    const err17 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/allowedActions/' + i2,
                      schemaPath:
                        '#/components/schemas/PartialPageSummary/properties/allowedActions/items/enum',
                      keyword: 'enum',
                      params: {
                        allowedValues:
                          schema533.properties.allowedActions.items.enum,
                      },
                      message: 'must be equal to one of the allowed values',
                    };
                    if (vErrors === null) {
                      vErrors = [err17];
                    } else {
                      vErrors.push(err17);
                    }
                    errors++;
                  }
                }
                let i3 = data14.length;
                let j0;
                if (i3 > 1) {
                  const indices0 = {};
                  for (; i3--;) {
                    let item0 = data14[i3];
                    if (typeof item0 !== 'string') {
                      continue;
                    }
                    if (typeof indices0[item0] == 'number') {
                      j0 = indices0[item0];
                      const err18 = {
                        instancePath:
                          instancePath + '/items/' + i0 + '/allowedActions',
                        schemaPath:
                          '#/components/schemas/PartialPageSummary/properties/allowedActions/uniqueItems',
                        keyword: 'uniqueItems',
                        params: { i: i3, j: j0 },
                        message:
                          'must NOT have duplicate items (items ## ' +
                          j0 +
                          ' and ' +
                          i3 +
                          ' are identical)',
                      };
                      if (vErrors === null) {
                        vErrors = [err18];
                      } else {
                        vErrors.push(err18);
                      }
                      errors++;
                      break;
                    }
                    indices0[item0] = i3;
                  }
                }
              } else {
                const err19 = {
                  instancePath:
                    instancePath + '/items/' + i0 + '/allowedActions',
                  schemaPath:
                    '#/components/schemas/PartialPageSummary/properties/allowedActions/type',
                  keyword: 'type',
                  params: { type: 'array' },
                  message: 'must be array',
                };
                if (vErrors === null) {
                  vErrors = [err19];
                } else {
                  vErrors.push(err19);
                }
                errors++;
              }
            }
            if (data1.contentType !== undefined) {
              if (typeof data1.contentType !== 'string') {
                const err20 = {
                  instancePath: instancePath + '/items/' + i0 + '/contentType',
                  schemaPath:
                    '#/components/schemas/PartialPageSummary/properties/contentType/type',
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
            if (data1.versionRef !== undefined) {
              if (typeof data1.versionRef !== 'string') {
                const err21 = {
                  instancePath: instancePath + '/items/' + i0 + '/versionRef',
                  schemaPath:
                    '#/components/schemas/PartialPageSummary/properties/versionRef/type',
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
            if (data1.interpretation !== undefined) {
              let data18 = data1.interpretation;
              if (
                data18 &&
                typeof data18 == 'object' &&
                !Array.isArray(data18)
              ) {
              } else {
                const err22 = {
                  instancePath:
                    instancePath + '/items/' + i0 + '/interpretation',
                  schemaPath:
                    '#/components/schemas/PartialPageSummary/properties/interpretation/type',
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
            }
          } else {
            const err23 = {
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/PartialPageSummary/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
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
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err24];
        } else {
          vErrors.push(err24);
        }
        errors++;
      }
    }
    if (data.nextCursor !== undefined) {
      let data19 = data.nextCursor;
      if (typeof data19 !== 'string' && data19 !== null) {
        const err25 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
          keyword: 'type',
          params: { type: schema532.properties.nextCursor.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err25];
        } else {
          vErrors.push(err25);
        }
        errors++;
      }
    }
    if (data.total !== undefined) {
      let data20 = data.total;
      if (
        !(typeof data20 == 'number' && !(data20 % 1) && !isNaN(data20)) &&
        data20 !== null
      ) {
        const err26 = {
          instancePath: instancePath + '/total',
          schemaPath: '#/properties/total/type',
          keyword: 'type',
          params: { type: schema532.properties.total.type },
          message: 'must be integer,null',
        };
        if (vErrors === null) {
          vErrors = [err26];
        } else {
          vErrors.push(err26);
        }
        errors++;
      }
    }
    if (data.allowedActions !== undefined) {
      let data21 = data.allowedActions;
      if (Array.isArray(data21)) {
        const len3 = data21.length;
        for (let i4 = 0; i4 < len3; i4++) {
          if (typeof data21[i4] !== 'string') {
            const err27 = {
              instancePath: instancePath + '/allowedActions/' + i4,
              schemaPath: '#/properties/allowedActions/items/type',
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
        let i5 = data21.length;
        let j1;
        if (i5 > 1) {
          const indices1 = {};
          for (; i5--;) {
            let item1 = data21[i5];
            if (typeof item1 !== 'string') {
              continue;
            }
            if (typeof indices1[item1] == 'number') {
              j1 = indices1[item1];
              const err28 = {
                instancePath: instancePath + '/allowedActions',
                schemaPath: '#/properties/allowedActions/uniqueItems',
                keyword: 'uniqueItems',
                params: { i: i5, j: j1 },
                message:
                  'must NOT have duplicate items (items ## ' +
                  j1 +
                  ' and ' +
                  i5 +
                  ' are identical)',
              };
              if (vErrors === null) {
                vErrors = [err28];
              } else {
                vErrors.push(err28);
              }
              errors++;
              break;
            }
            indices1[item1] = i5;
          }
        }
      } else {
        const err29 = {
          instancePath: instancePath + '/allowedActions',
          schemaPath: '#/properties/allowedActions/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
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
  validate442.errors = vErrors;
  return errors === 0;
}
validate442.evaluated = {
  props: { items: true, nextCursor: true, total: true, allowedActions: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate439(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listPagesOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate439.evaluated;
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
    !validate440(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate440.errors
        : vErrors.concat(validate440.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = {};
    props0.items = true;
    props0.nextCursor = true;
    props0.total = true;
    props0.allowedActions = true;
  }
  const _errs2 = errors;
  if (
    !validate442(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate442.errors
        : vErrors.concat(validate442.errors);
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
      props0.allowedActions = true;
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
  validate439.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate439.evaluated = { dynamicProps: true, dynamicItems: false };
export const listPagesOutputFull = validate444;
const schema534 = {
  $ref: 'https://edition.invalid/control#/components/schemas/PagePage',
  $id: 'https://edition.invalid/validators/listPagesOutputFull',
};
function validate445(
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
  const evaluated0 = validate445.evaluated;
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
                      '#/components/schemas/PageSummary/properties/id/format',
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
                    '#/components/schemas/PageSummary/properties/id/type',
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
            if (data1.title !== undefined) {
              if (typeof data1.title !== 'string') {
                const err2 = {
                  instancePath: instancePath + '/items/' + i0 + '/title',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/title/type',
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
            if (data1.slug !== undefined) {
              if (typeof data1.slug !== 'string') {
                const err3 = {
                  instancePath: instancePath + '/items/' + i0 + '/slug',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/slug/type',
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
            if (data1.status !== undefined) {
              if (typeof data1.status !== 'string') {
                const err4 = {
                  instancePath: instancePath + '/items/' + i0 + '/status',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/status/type',
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
            if (data1.format !== undefined) {
              if (typeof data1.format !== 'string') {
                const err5 = {
                  instancePath: instancePath + '/items/' + i0 + '/format',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/format/type',
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
            if (data1.icon !== undefined) {
              let data7 = data1.icon;
              if (typeof data7 !== 'string' && data7 !== null) {
                const err6 = {
                  instancePath: instancePath + '/items/' + i0 + '/icon',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/icon/type',
                  keyword: 'type',
                  params: { type: schema531.properties.icon.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err6];
                } else {
                  vErrors.push(err6);
                }
                errors++;
              }
            }
            if (data1.tags !== undefined) {
              let data8 = data1.tags;
              if (Array.isArray(data8)) {
                const len1 = data8.length;
                for (let i1 = 0; i1 < len1; i1++) {
                  if (typeof data8[i1] !== 'string') {
                    const err7 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/tags/' + i1,
                      schemaPath:
                        '#/components/schemas/PageSummary/properties/tags/items/type',
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
                  instancePath: instancePath + '/items/' + i0 + '/tags',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/tags/type',
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
            if (data1.driftFlag !== undefined) {
              if (typeof data1.driftFlag !== 'boolean') {
                const err9 = {
                  instancePath: instancePath + '/items/' + i0 + '/driftFlag',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/driftFlag/type',
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
            if (data1.updatedAt !== undefined) {
              let data11 = data1.updatedAt;
              if (typeof data11 === 'string') {
                if (!formats10.validate(data11)) {
                  const err10 = {
                    instancePath: instancePath + '/items/' + i0 + '/updatedAt',
                    schemaPath:
                      '#/components/schemas/PageSummary/properties/updatedAt/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/updatedAt',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/updatedAt/type',
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
            if (data1.updatedBy !== undefined) {
              let data12 = data1.updatedBy;
              if (typeof data12 === 'string') {
                if (!formats0.test(data12)) {
                  const err12 = {
                    instancePath: instancePath + '/items/' + i0 + '/updatedBy',
                    schemaPath:
                      '#/components/schemas/PageSummary/properties/updatedBy/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/updatedBy',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/updatedBy/type',
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
            if (data1.publishedAt !== undefined) {
              let data13 = data1.publishedAt;
              if (typeof data13 !== 'string' && data13 !== null) {
                const err14 = {
                  instancePath: instancePath + '/items/' + i0 + '/publishedAt',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/publishedAt/type',
                  keyword: 'type',
                  params: { type: schema531.properties.publishedAt.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err14];
                } else {
                  vErrors.push(err14);
                }
                errors++;
              }
              if (typeof data13 === 'string') {
                if (!formats10.validate(data13)) {
                  const err15 = {
                    instancePath:
                      instancePath + '/items/' + i0 + '/publishedAt',
                    schemaPath:
                      '#/components/schemas/PageSummary/properties/publishedAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
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
            if (data1.allowedActions !== undefined) {
              let data14 = data1.allowedActions;
              if (Array.isArray(data14)) {
                const len2 = data14.length;
                for (let i2 = 0; i2 < len2; i2++) {
                  let data15 = data14[i2];
                  if (typeof data15 !== 'string') {
                    const err16 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/allowedActions/' + i2,
                      schemaPath:
                        '#/components/schemas/PageSummary/properties/allowedActions/items/type',
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
                  if (!(
                    data15 === 'create' ||
                    data15 === 'read' ||
                    data15 === 'rename' ||
                    data15 === 'edit' ||
                    data15 === 'revert' ||
                    data15 === 'reslug' ||
                    data15 === 'transfer' ||
                    data15 === 'publish' ||
                    data15 === 'unpublish'
                  )) {
                    const err17 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/allowedActions/' + i2,
                      schemaPath:
                        '#/components/schemas/PageSummary/properties/allowedActions/items/enum',
                      keyword: 'enum',
                      params: {
                        allowedValues:
                          schema531.properties.allowedActions.items.enum,
                      },
                      message: 'must be equal to one of the allowed values',
                    };
                    if (vErrors === null) {
                      vErrors = [err17];
                    } else {
                      vErrors.push(err17);
                    }
                    errors++;
                  }
                }
                let i3 = data14.length;
                let j0;
                if (i3 > 1) {
                  const indices0 = {};
                  for (; i3--;) {
                    let item0 = data14[i3];
                    if (typeof item0 !== 'string') {
                      continue;
                    }
                    if (typeof indices0[item0] == 'number') {
                      j0 = indices0[item0];
                      const err18 = {
                        instancePath:
                          instancePath + '/items/' + i0 + '/allowedActions',
                        schemaPath:
                          '#/components/schemas/PageSummary/properties/allowedActions/uniqueItems',
                        keyword: 'uniqueItems',
                        params: { i: i3, j: j0 },
                        message:
                          'must NOT have duplicate items (items ## ' +
                          j0 +
                          ' and ' +
                          i3 +
                          ' are identical)',
                      };
                      if (vErrors === null) {
                        vErrors = [err18];
                      } else {
                        vErrors.push(err18);
                      }
                      errors++;
                      break;
                    }
                    indices0[item0] = i3;
                  }
                }
              } else {
                const err19 = {
                  instancePath:
                    instancePath + '/items/' + i0 + '/allowedActions',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/allowedActions/type',
                  keyword: 'type',
                  params: { type: 'array' },
                  message: 'must be array',
                };
                if (vErrors === null) {
                  vErrors = [err19];
                } else {
                  vErrors.push(err19);
                }
                errors++;
              }
            }
            if (data1.contentType !== undefined) {
              if (typeof data1.contentType !== 'string') {
                const err20 = {
                  instancePath: instancePath + '/items/' + i0 + '/contentType',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/contentType/type',
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
            if (data1.versionRef !== undefined) {
              if (typeof data1.versionRef !== 'string') {
                const err21 = {
                  instancePath: instancePath + '/items/' + i0 + '/versionRef',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/versionRef/type',
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
            if (data1.interpretation !== undefined) {
              let data18 = data1.interpretation;
              if (
                data18 &&
                typeof data18 == 'object' &&
                !Array.isArray(data18)
              ) {
              } else {
                const err22 = {
                  instancePath:
                    instancePath + '/items/' + i0 + '/interpretation',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/interpretation/type',
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
            }
          } else {
            const err23 = {
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/PageSummary/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
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
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err24];
        } else {
          vErrors.push(err24);
        }
        errors++;
      }
    }
    if (data.nextCursor !== undefined) {
      let data19 = data.nextCursor;
      if (typeof data19 !== 'string' && data19 !== null) {
        const err25 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
          keyword: 'type',
          params: { type: schema530.properties.nextCursor.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err25];
        } else {
          vErrors.push(err25);
        }
        errors++;
      }
    }
    if (data.total !== undefined) {
      let data20 = data.total;
      if (
        !(typeof data20 == 'number' && !(data20 % 1) && !isNaN(data20)) &&
        data20 !== null
      ) {
        const err26 = {
          instancePath: instancePath + '/total',
          schemaPath: '#/properties/total/type',
          keyword: 'type',
          params: { type: schema530.properties.total.type },
          message: 'must be integer,null',
        };
        if (vErrors === null) {
          vErrors = [err26];
        } else {
          vErrors.push(err26);
        }
        errors++;
      }
    }
    if (data.allowedActions !== undefined) {
      let data21 = data.allowedActions;
      if (Array.isArray(data21)) {
        const len3 = data21.length;
        for (let i4 = 0; i4 < len3; i4++) {
          if (typeof data21[i4] !== 'string') {
            const err27 = {
              instancePath: instancePath + '/allowedActions/' + i4,
              schemaPath: '#/properties/allowedActions/items/type',
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
        let i5 = data21.length;
        let j1;
        if (i5 > 1) {
          const indices1 = {};
          for (; i5--;) {
            let item1 = data21[i5];
            if (typeof item1 !== 'string') {
              continue;
            }
            if (typeof indices1[item1] == 'number') {
              j1 = indices1[item1];
              const err28 = {
                instancePath: instancePath + '/allowedActions',
                schemaPath: '#/properties/allowedActions/uniqueItems',
                keyword: 'uniqueItems',
                params: { i: i5, j: j1 },
                message:
                  'must NOT have duplicate items (items ## ' +
                  j1 +
                  ' and ' +
                  i5 +
                  ' are identical)',
              };
              if (vErrors === null) {
                vErrors = [err28];
              } else {
                vErrors.push(err28);
              }
              errors++;
              break;
            }
            indices1[item1] = i5;
          }
        }
      } else {
        const err29 = {
          instancePath: instancePath + '/allowedActions',
          schemaPath: '#/properties/allowedActions/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
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
  validate445.errors = vErrors;
  return errors === 0;
}
validate445.evaluated = {
  props: { items: true, nextCursor: true, total: true, allowedActions: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate444(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listPagesOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate444.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate445(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate445.errors
        : vErrors.concat(validate445.errors);
    errors = vErrors.length;
  }
  validate444.errors = vErrors;
  return errors === 0;
}
validate444.evaluated = {
  props: { items: true, nextCursor: true, total: true, allowedActions: true },
  dynamicProps: false,
  dynamicItems: false,
};
