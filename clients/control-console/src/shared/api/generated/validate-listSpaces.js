// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const listSpacesInput = validate301;
const schema403 = {
  type: 'object',
  properties: {
    path: {
      type: 'object',
      properties: { tenantId: { type: 'string', format: 'uuid' } },
      required: ['tenantId'],
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
        status: { type: 'string', pattern: 'active|archived' },
        mode: { type: 'string', pattern: 'authored|synced' },
        collectionId: {
          type: 'string',
          pattern:
            'ungrouped|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}',
        },
        fields: { type: 'string', maxLength: 4096, minLength: 1 },
      },
      required: [],
    },
  },
  required: ['path'],
  $id: 'https://edition.invalid/validators/listSpacesInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const pattern41 = new RegExp('active|archived', 'u');
const pattern42 = new RegExp('authored|synced', 'u');
const pattern43 = new RegExp(
  'ungrouped|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}',
  'u',
);
const func1 = ucs2Length;
function validate301(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listSpacesInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate301.evaluated;
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
        if (data0.tenantId !== undefined) {
          let data1 = data0.tenantId;
          if (typeof data1 === 'string') {
            if (!formats0.test(data1)) {
              const err2 = {
                instancePath: instancePath + '/path/tenantId',
                schemaPath: '#/properties/path/properties/tenantId/format',
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
              instancePath: instancePath + '/path/tenantId',
              schemaPath: '#/properties/path/properties/tenantId/type',
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
      } else {
        const err4 = {
          instancePath: instancePath + '/path',
          schemaPath: '#/properties/path/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.query !== undefined) {
      let data2 = data.query;
      if (data2 && typeof data2 == 'object' && !Array.isArray(data2)) {
        if (data2.cursor !== undefined) {
          if (typeof data2.cursor !== 'string') {
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
        if (data2.limit !== undefined) {
          let data4 = data2.limit;
          if (!(typeof data4 == 'number' && !(data4 % 1) && !isNaN(data4))) {
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
          if (typeof data4 == 'number') {
            if (data4 > 100 || isNaN(data4)) {
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
            if (data4 < 1 || isNaN(data4)) {
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
        if (data2.status !== undefined) {
          let data5 = data2.status;
          if (typeof data5 === 'string') {
            if (!pattern41.test(data5)) {
              const err9 = {
                instancePath: instancePath + '/query/status',
                schemaPath: '#/properties/query/properties/status/pattern',
                keyword: 'pattern',
                params: { pattern: 'active|archived' },
                message: 'must match pattern "' + 'active|archived' + '"',
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
              instancePath: instancePath + '/query/status',
              schemaPath: '#/properties/query/properties/status/type',
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
        if (data2.mode !== undefined) {
          let data6 = data2.mode;
          if (typeof data6 === 'string') {
            if (!pattern42.test(data6)) {
              const err11 = {
                instancePath: instancePath + '/query/mode',
                schemaPath: '#/properties/query/properties/mode/pattern',
                keyword: 'pattern',
                params: { pattern: 'authored|synced' },
                message: 'must match pattern "' + 'authored|synced' + '"',
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
              instancePath: instancePath + '/query/mode',
              schemaPath: '#/properties/query/properties/mode/type',
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
        if (data2.collectionId !== undefined) {
          let data7 = data2.collectionId;
          if (typeof data7 === 'string') {
            if (!pattern43.test(data7)) {
              const err13 = {
                instancePath: instancePath + '/query/collectionId',
                schemaPath:
                  '#/properties/query/properties/collectionId/pattern',
                keyword: 'pattern',
                params: {
                  pattern:
                    'ungrouped|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}',
                },
                message:
                  'must match pattern "' +
                  'ungrouped|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}' +
                  '"',
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
              instancePath: instancePath + '/query/collectionId',
              schemaPath: '#/properties/query/properties/collectionId/type',
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
        if (data2.fields !== undefined) {
          let data8 = data2.fields;
          if (typeof data8 === 'string') {
            if (func1(data8) > 4096) {
              const err15 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/maxLength',
                keyword: 'maxLength',
                params: { limit: 4096 },
                message: 'must NOT have more than 4096 characters',
              };
              if (vErrors === null) {
                vErrors = [err15];
              } else {
                vErrors.push(err15);
              }
              errors++;
            }
            if (func1(data8) < 1) {
              const err16 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
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
              instancePath: instancePath + '/query/fields',
              schemaPath: '#/properties/query/properties/fields/type',
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
      } else {
        const err18 = {
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
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
  validate301.errors = vErrors;
  return errors === 0;
}
validate301.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const listSpacesOutput = validate302;
const schema404 = {
  anyOf: [
    { $ref: 'https://edition.invalid/control#/components/schemas/SpacePage' },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialSpacePage',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/listSpacesOutput',
};
const schema405 = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { $ref: '#/components/schemas/SpaceSummary' },
    },
    nextCursor: { type: ['string', 'null'] },
    total: { type: ['integer', 'null'], format: 'int64' },
    allowedActions: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          'delete',
          'create',
          'read',
          'update',
          'archive',
          'restore',
          'convert',
          'write_pages',
          'manage_permissions',
        ],
      },
    },
  },
  required: ['allowedActions', 'items', 'nextCursor', 'total'],
};
const schema406 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    tenantId: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    icon: {
      type: ['string', 'null'],
      enum: ['book', 'code', 'api', 'guide', 'reference', null],
    },
    mode: { type: 'string', enum: ['authored', 'synced'] },
    status: { type: 'string', enum: ['active', 'archived'] },
    pageCount: { type: 'integer', format: 'int64' },
    driftCount: { type: 'integer', format: 'int64' },
    lastReleaseAt: { type: ['string', 'null'], format: 'date-time' },
    createdAt: { type: 'string', format: 'date-time' },
    createdBy: { type: ['string', 'null'], format: 'uuid' },
    updatedAt: { type: 'string', format: 'date-time' },
    updatedBy: { type: ['string', 'null'], format: 'uuid' },
    collectionId: { type: ['string', 'null'], format: 'uuid' },
    allowedActions: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          'delete',
          'create',
          'read',
          'update',
          'archive',
          'restore',
          'convert',
          'write_pages',
          'manage_permissions',
        ],
      },
    },
  },
  required: [
    'allowedActions',
    'collectionId',
    'createdAt',
    'createdBy',
    'driftCount',
    'icon',
    'id',
    'lastReleaseAt',
    'mode',
    'name',
    'pageCount',
    'status',
    'tenantId',
    'updatedAt',
    'updatedBy',
  ],
};
const formats10 = fullFormats['date-time'];
function validate303(
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
  const evaluated0 = validate303.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.allowedActions === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'allowedActions' },
        message: "must have required property '" + 'allowedActions' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.items === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'items' },
        message: "must have required property '" + 'items' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.nextCursor === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'nextCursor' },
        message: "must have required property '" + 'nextCursor' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.total === undefined) {
      const err3 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'total' },
        message: "must have required property '" + 'total' + "'",
      };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.items !== undefined) {
      let data0 = data.items;
      if (Array.isArray(data0)) {
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data1 = data0[i0];
          if (data1 && typeof data1 == 'object' && !Array.isArray(data1)) {
            if (data1.allowedActions === undefined) {
              const err4 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/SpaceSummary/required',
                keyword: 'required',
                params: { missingProperty: 'allowedActions' },
                message:
                  "must have required property '" + 'allowedActions' + "'",
              };
              if (vErrors === null) {
                vErrors = [err4];
              } else {
                vErrors.push(err4);
              }
              errors++;
            }
            if (data1.collectionId === undefined) {
              const err5 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/SpaceSummary/required',
                keyword: 'required',
                params: { missingProperty: 'collectionId' },
                message: "must have required property '" + 'collectionId' + "'",
              };
              if (vErrors === null) {
                vErrors = [err5];
              } else {
                vErrors.push(err5);
              }
              errors++;
            }
            if (data1.createdAt === undefined) {
              const err6 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/SpaceSummary/required',
                keyword: 'required',
                params: { missingProperty: 'createdAt' },
                message: "must have required property '" + 'createdAt' + "'",
              };
              if (vErrors === null) {
                vErrors = [err6];
              } else {
                vErrors.push(err6);
              }
              errors++;
            }
            if (data1.createdBy === undefined) {
              const err7 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/SpaceSummary/required',
                keyword: 'required',
                params: { missingProperty: 'createdBy' },
                message: "must have required property '" + 'createdBy' + "'",
              };
              if (vErrors === null) {
                vErrors = [err7];
              } else {
                vErrors.push(err7);
              }
              errors++;
            }
            if (data1.driftCount === undefined) {
              const err8 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/SpaceSummary/required',
                keyword: 'required',
                params: { missingProperty: 'driftCount' },
                message: "must have required property '" + 'driftCount' + "'",
              };
              if (vErrors === null) {
                vErrors = [err8];
              } else {
                vErrors.push(err8);
              }
              errors++;
            }
            if (data1.icon === undefined) {
              const err9 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/SpaceSummary/required',
                keyword: 'required',
                params: { missingProperty: 'icon' },
                message: "must have required property '" + 'icon' + "'",
              };
              if (vErrors === null) {
                vErrors = [err9];
              } else {
                vErrors.push(err9);
              }
              errors++;
            }
            if (data1.id === undefined) {
              const err10 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/SpaceSummary/required',
                keyword: 'required',
                params: { missingProperty: 'id' },
                message: "must have required property '" + 'id' + "'",
              };
              if (vErrors === null) {
                vErrors = [err10];
              } else {
                vErrors.push(err10);
              }
              errors++;
            }
            if (data1.lastReleaseAt === undefined) {
              const err11 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/SpaceSummary/required',
                keyword: 'required',
                params: { missingProperty: 'lastReleaseAt' },
                message:
                  "must have required property '" + 'lastReleaseAt' + "'",
              };
              if (vErrors === null) {
                vErrors = [err11];
              } else {
                vErrors.push(err11);
              }
              errors++;
            }
            if (data1.mode === undefined) {
              const err12 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/SpaceSummary/required',
                keyword: 'required',
                params: { missingProperty: 'mode' },
                message: "must have required property '" + 'mode' + "'",
              };
              if (vErrors === null) {
                vErrors = [err12];
              } else {
                vErrors.push(err12);
              }
              errors++;
            }
            if (data1.name === undefined) {
              const err13 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/SpaceSummary/required',
                keyword: 'required',
                params: { missingProperty: 'name' },
                message: "must have required property '" + 'name' + "'",
              };
              if (vErrors === null) {
                vErrors = [err13];
              } else {
                vErrors.push(err13);
              }
              errors++;
            }
            if (data1.pageCount === undefined) {
              const err14 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/SpaceSummary/required',
                keyword: 'required',
                params: { missingProperty: 'pageCount' },
                message: "must have required property '" + 'pageCount' + "'",
              };
              if (vErrors === null) {
                vErrors = [err14];
              } else {
                vErrors.push(err14);
              }
              errors++;
            }
            if (data1.status === undefined) {
              const err15 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/SpaceSummary/required',
                keyword: 'required',
                params: { missingProperty: 'status' },
                message: "must have required property '" + 'status' + "'",
              };
              if (vErrors === null) {
                vErrors = [err15];
              } else {
                vErrors.push(err15);
              }
              errors++;
            }
            if (data1.tenantId === undefined) {
              const err16 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/SpaceSummary/required',
                keyword: 'required',
                params: { missingProperty: 'tenantId' },
                message: "must have required property '" + 'tenantId' + "'",
              };
              if (vErrors === null) {
                vErrors = [err16];
              } else {
                vErrors.push(err16);
              }
              errors++;
            }
            if (data1.updatedAt === undefined) {
              const err17 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/SpaceSummary/required',
                keyword: 'required',
                params: { missingProperty: 'updatedAt' },
                message: "must have required property '" + 'updatedAt' + "'",
              };
              if (vErrors === null) {
                vErrors = [err17];
              } else {
                vErrors.push(err17);
              }
              errors++;
            }
            if (data1.updatedBy === undefined) {
              const err18 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/SpaceSummary/required',
                keyword: 'required',
                params: { missingProperty: 'updatedBy' },
                message: "must have required property '" + 'updatedBy' + "'",
              };
              if (vErrors === null) {
                vErrors = [err18];
              } else {
                vErrors.push(err18);
              }
              errors++;
            }
            if (data1.id !== undefined) {
              let data2 = data1.id;
              if (typeof data2 === 'string') {
                if (!formats0.test(data2)) {
                  const err19 = {
                    instancePath: instancePath + '/items/' + i0 + '/id',
                    schemaPath:
                      '#/components/schemas/SpaceSummary/properties/id/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/id',
                  schemaPath:
                    '#/components/schemas/SpaceSummary/properties/id/type',
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
            if (data1.tenantId !== undefined) {
              let data3 = data1.tenantId;
              if (typeof data3 === 'string') {
                if (!formats0.test(data3)) {
                  const err21 = {
                    instancePath: instancePath + '/items/' + i0 + '/tenantId',
                    schemaPath:
                      '#/components/schemas/SpaceSummary/properties/tenantId/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/tenantId',
                  schemaPath:
                    '#/components/schemas/SpaceSummary/properties/tenantId/type',
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
            if (data1.name !== undefined) {
              if (typeof data1.name !== 'string') {
                const err23 = {
                  instancePath: instancePath + '/items/' + i0 + '/name',
                  schemaPath:
                    '#/components/schemas/SpaceSummary/properties/name/type',
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
            if (data1.icon !== undefined) {
              let data5 = data1.icon;
              if (typeof data5 !== 'string' && data5 !== null) {
                const err24 = {
                  instancePath: instancePath + '/items/' + i0 + '/icon',
                  schemaPath:
                    '#/components/schemas/SpaceSummary/properties/icon/type',
                  keyword: 'type',
                  params: { type: schema406.properties.icon.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err24];
                } else {
                  vErrors.push(err24);
                }
                errors++;
              }
              if (!(
                data5 === 'book' ||
                data5 === 'code' ||
                data5 === 'api' ||
                data5 === 'guide' ||
                data5 === 'reference' ||
                data5 === null
              )) {
                const err25 = {
                  instancePath: instancePath + '/items/' + i0 + '/icon',
                  schemaPath:
                    '#/components/schemas/SpaceSummary/properties/icon/enum',
                  keyword: 'enum',
                  params: { allowedValues: schema406.properties.icon.enum },
                  message: 'must be equal to one of the allowed values',
                };
                if (vErrors === null) {
                  vErrors = [err25];
                } else {
                  vErrors.push(err25);
                }
                errors++;
              }
            }
            if (data1.mode !== undefined) {
              let data6 = data1.mode;
              if (typeof data6 !== 'string') {
                const err26 = {
                  instancePath: instancePath + '/items/' + i0 + '/mode',
                  schemaPath:
                    '#/components/schemas/SpaceSummary/properties/mode/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err26];
                } else {
                  vErrors.push(err26);
                }
                errors++;
              }
              if (!(data6 === 'authored' || data6 === 'synced')) {
                const err27 = {
                  instancePath: instancePath + '/items/' + i0 + '/mode',
                  schemaPath:
                    '#/components/schemas/SpaceSummary/properties/mode/enum',
                  keyword: 'enum',
                  params: { allowedValues: schema406.properties.mode.enum },
                  message: 'must be equal to one of the allowed values',
                };
                if (vErrors === null) {
                  vErrors = [err27];
                } else {
                  vErrors.push(err27);
                }
                errors++;
              }
            }
            if (data1.status !== undefined) {
              let data7 = data1.status;
              if (typeof data7 !== 'string') {
                const err28 = {
                  instancePath: instancePath + '/items/' + i0 + '/status',
                  schemaPath:
                    '#/components/schemas/SpaceSummary/properties/status/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err28];
                } else {
                  vErrors.push(err28);
                }
                errors++;
              }
              if (!(data7 === 'active' || data7 === 'archived')) {
                const err29 = {
                  instancePath: instancePath + '/items/' + i0 + '/status',
                  schemaPath:
                    '#/components/schemas/SpaceSummary/properties/status/enum',
                  keyword: 'enum',
                  params: { allowedValues: schema406.properties.status.enum },
                  message: 'must be equal to one of the allowed values',
                };
                if (vErrors === null) {
                  vErrors = [err29];
                } else {
                  vErrors.push(err29);
                }
                errors++;
              }
            }
            if (data1.pageCount !== undefined) {
              let data8 = data1.pageCount;
              if (!(
                typeof data8 == 'number' &&
                !(data8 % 1) &&
                !isNaN(data8)
              )) {
                const err30 = {
                  instancePath: instancePath + '/items/' + i0 + '/pageCount',
                  schemaPath:
                    '#/components/schemas/SpaceSummary/properties/pageCount/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
                };
                if (vErrors === null) {
                  vErrors = [err30];
                } else {
                  vErrors.push(err30);
                }
                errors++;
              }
            }
            if (data1.driftCount !== undefined) {
              let data9 = data1.driftCount;
              if (!(
                typeof data9 == 'number' &&
                !(data9 % 1) &&
                !isNaN(data9)
              )) {
                const err31 = {
                  instancePath: instancePath + '/items/' + i0 + '/driftCount',
                  schemaPath:
                    '#/components/schemas/SpaceSummary/properties/driftCount/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
                };
                if (vErrors === null) {
                  vErrors = [err31];
                } else {
                  vErrors.push(err31);
                }
                errors++;
              }
            }
            if (data1.lastReleaseAt !== undefined) {
              let data10 = data1.lastReleaseAt;
              if (typeof data10 !== 'string' && data10 !== null) {
                const err32 = {
                  instancePath:
                    instancePath + '/items/' + i0 + '/lastReleaseAt',
                  schemaPath:
                    '#/components/schemas/SpaceSummary/properties/lastReleaseAt/type',
                  keyword: 'type',
                  params: { type: schema406.properties.lastReleaseAt.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err32];
                } else {
                  vErrors.push(err32);
                }
                errors++;
              }
              if (typeof data10 === 'string') {
                if (!formats10.validate(data10)) {
                  const err33 = {
                    instancePath:
                      instancePath + '/items/' + i0 + '/lastReleaseAt',
                    schemaPath:
                      '#/components/schemas/SpaceSummary/properties/lastReleaseAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err33];
                  } else {
                    vErrors.push(err33);
                  }
                  errors++;
                }
              }
            }
            if (data1.createdAt !== undefined) {
              let data11 = data1.createdAt;
              if (typeof data11 === 'string') {
                if (!formats10.validate(data11)) {
                  const err34 = {
                    instancePath: instancePath + '/items/' + i0 + '/createdAt',
                    schemaPath:
                      '#/components/schemas/SpaceSummary/properties/createdAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err34];
                  } else {
                    vErrors.push(err34);
                  }
                  errors++;
                }
              } else {
                const err35 = {
                  instancePath: instancePath + '/items/' + i0 + '/createdAt',
                  schemaPath:
                    '#/components/schemas/SpaceSummary/properties/createdAt/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err35];
                } else {
                  vErrors.push(err35);
                }
                errors++;
              }
            }
            if (data1.createdBy !== undefined) {
              let data12 = data1.createdBy;
              if (typeof data12 !== 'string' && data12 !== null) {
                const err36 = {
                  instancePath: instancePath + '/items/' + i0 + '/createdBy',
                  schemaPath:
                    '#/components/schemas/SpaceSummary/properties/createdBy/type',
                  keyword: 'type',
                  params: { type: schema406.properties.createdBy.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err36];
                } else {
                  vErrors.push(err36);
                }
                errors++;
              }
              if (typeof data12 === 'string') {
                if (!formats0.test(data12)) {
                  const err37 = {
                    instancePath: instancePath + '/items/' + i0 + '/createdBy',
                    schemaPath:
                      '#/components/schemas/SpaceSummary/properties/createdBy/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err37];
                  } else {
                    vErrors.push(err37);
                  }
                  errors++;
                }
              }
            }
            if (data1.updatedAt !== undefined) {
              let data13 = data1.updatedAt;
              if (typeof data13 === 'string') {
                if (!formats10.validate(data13)) {
                  const err38 = {
                    instancePath: instancePath + '/items/' + i0 + '/updatedAt',
                    schemaPath:
                      '#/components/schemas/SpaceSummary/properties/updatedAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err38];
                  } else {
                    vErrors.push(err38);
                  }
                  errors++;
                }
              } else {
                const err39 = {
                  instancePath: instancePath + '/items/' + i0 + '/updatedAt',
                  schemaPath:
                    '#/components/schemas/SpaceSummary/properties/updatedAt/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err39];
                } else {
                  vErrors.push(err39);
                }
                errors++;
              }
            }
            if (data1.updatedBy !== undefined) {
              let data14 = data1.updatedBy;
              if (typeof data14 !== 'string' && data14 !== null) {
                const err40 = {
                  instancePath: instancePath + '/items/' + i0 + '/updatedBy',
                  schemaPath:
                    '#/components/schemas/SpaceSummary/properties/updatedBy/type',
                  keyword: 'type',
                  params: { type: schema406.properties.updatedBy.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err40];
                } else {
                  vErrors.push(err40);
                }
                errors++;
              }
              if (typeof data14 === 'string') {
                if (!formats0.test(data14)) {
                  const err41 = {
                    instancePath: instancePath + '/items/' + i0 + '/updatedBy',
                    schemaPath:
                      '#/components/schemas/SpaceSummary/properties/updatedBy/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err41];
                  } else {
                    vErrors.push(err41);
                  }
                  errors++;
                }
              }
            }
            if (data1.collectionId !== undefined) {
              let data15 = data1.collectionId;
              if (typeof data15 !== 'string' && data15 !== null) {
                const err42 = {
                  instancePath: instancePath + '/items/' + i0 + '/collectionId',
                  schemaPath:
                    '#/components/schemas/SpaceSummary/properties/collectionId/type',
                  keyword: 'type',
                  params: { type: schema406.properties.collectionId.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err42];
                } else {
                  vErrors.push(err42);
                }
                errors++;
              }
              if (typeof data15 === 'string') {
                if (!formats0.test(data15)) {
                  const err43 = {
                    instancePath:
                      instancePath + '/items/' + i0 + '/collectionId',
                    schemaPath:
                      '#/components/schemas/SpaceSummary/properties/collectionId/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err43];
                  } else {
                    vErrors.push(err43);
                  }
                  errors++;
                }
              }
            }
            if (data1.allowedActions !== undefined) {
              let data16 = data1.allowedActions;
              if (Array.isArray(data16)) {
                const len1 = data16.length;
                for (let i1 = 0; i1 < len1; i1++) {
                  let data17 = data16[i1];
                  if (typeof data17 !== 'string') {
                    const err44 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/allowedActions/' + i1,
                      schemaPath:
                        '#/components/schemas/SpaceSummary/properties/allowedActions/items/type',
                      keyword: 'type',
                      params: { type: 'string' },
                      message: 'must be string',
                    };
                    if (vErrors === null) {
                      vErrors = [err44];
                    } else {
                      vErrors.push(err44);
                    }
                    errors++;
                  }
                  if (!(
                    data17 === 'delete' ||
                    data17 === 'create' ||
                    data17 === 'read' ||
                    data17 === 'update' ||
                    data17 === 'archive' ||
                    data17 === 'restore' ||
                    data17 === 'convert' ||
                    data17 === 'write_pages' ||
                    data17 === 'manage_permissions'
                  )) {
                    const err45 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/allowedActions/' + i1,
                      schemaPath:
                        '#/components/schemas/SpaceSummary/properties/allowedActions/items/enum',
                      keyword: 'enum',
                      params: {
                        allowedValues:
                          schema406.properties.allowedActions.items.enum,
                      },
                      message: 'must be equal to one of the allowed values',
                    };
                    if (vErrors === null) {
                      vErrors = [err45];
                    } else {
                      vErrors.push(err45);
                    }
                    errors++;
                  }
                }
              } else {
                const err46 = {
                  instancePath:
                    instancePath + '/items/' + i0 + '/allowedActions',
                  schemaPath:
                    '#/components/schemas/SpaceSummary/properties/allowedActions/type',
                  keyword: 'type',
                  params: { type: 'array' },
                  message: 'must be array',
                };
                if (vErrors === null) {
                  vErrors = [err46];
                } else {
                  vErrors.push(err46);
                }
                errors++;
              }
            }
          } else {
            const err47 = {
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/SpaceSummary/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
            };
            if (vErrors === null) {
              vErrors = [err47];
            } else {
              vErrors.push(err47);
            }
            errors++;
          }
        }
      } else {
        const err48 = {
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err48];
        } else {
          vErrors.push(err48);
        }
        errors++;
      }
    }
    if (data.nextCursor !== undefined) {
      let data18 = data.nextCursor;
      if (typeof data18 !== 'string' && data18 !== null) {
        const err49 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
          keyword: 'type',
          params: { type: schema405.properties.nextCursor.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err49];
        } else {
          vErrors.push(err49);
        }
        errors++;
      }
    }
    if (data.total !== undefined) {
      let data19 = data.total;
      if (
        !(typeof data19 == 'number' && !(data19 % 1) && !isNaN(data19)) &&
        data19 !== null
      ) {
        const err50 = {
          instancePath: instancePath + '/total',
          schemaPath: '#/properties/total/type',
          keyword: 'type',
          params: { type: schema405.properties.total.type },
          message: 'must be integer,null',
        };
        if (vErrors === null) {
          vErrors = [err50];
        } else {
          vErrors.push(err50);
        }
        errors++;
      }
    }
    if (data.allowedActions !== undefined) {
      let data20 = data.allowedActions;
      if (Array.isArray(data20)) {
        const len2 = data20.length;
        for (let i2 = 0; i2 < len2; i2++) {
          let data21 = data20[i2];
          if (typeof data21 !== 'string') {
            const err51 = {
              instancePath: instancePath + '/allowedActions/' + i2,
              schemaPath: '#/properties/allowedActions/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err51];
            } else {
              vErrors.push(err51);
            }
            errors++;
          }
          if (!(
            data21 === 'delete' ||
            data21 === 'create' ||
            data21 === 'read' ||
            data21 === 'update' ||
            data21 === 'archive' ||
            data21 === 'restore' ||
            data21 === 'convert' ||
            data21 === 'write_pages' ||
            data21 === 'manage_permissions'
          )) {
            const err52 = {
              instancePath: instancePath + '/allowedActions/' + i2,
              schemaPath: '#/properties/allowedActions/items/enum',
              keyword: 'enum',
              params: {
                allowedValues: schema405.properties.allowedActions.items.enum,
              },
              message: 'must be equal to one of the allowed values',
            };
            if (vErrors === null) {
              vErrors = [err52];
            } else {
              vErrors.push(err52);
            }
            errors++;
          }
        }
      } else {
        const err53 = {
          instancePath: instancePath + '/allowedActions',
          schemaPath: '#/properties/allowedActions/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err53];
        } else {
          vErrors.push(err53);
        }
        errors++;
      }
    }
  } else {
    const err54 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err54];
    } else {
      vErrors.push(err54);
    }
    errors++;
  }
  validate303.errors = vErrors;
  return errors === 0;
}
validate303.evaluated = {
  props: { items: true, nextCursor: true, total: true, allowedActions: true },
  dynamicProps: false,
  dynamicItems: false,
};
const schema407 = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialSpaceSummary' },
    },
    nextCursor: { type: ['string', 'null'] },
    total: { type: ['integer', 'null'], format: 'int64' },
    allowedActions: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          'delete',
          'create',
          'read',
          'update',
          'archive',
          'restore',
          'convert',
          'write_pages',
          'manage_permissions',
        ],
      },
    },
  },
};
const schema408 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    tenantId: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    icon: {
      type: ['string', 'null'],
      enum: ['book', 'code', 'api', 'guide', 'reference', null],
    },
    mode: { type: 'string', enum: ['authored', 'synced'] },
    status: { type: 'string', enum: ['active', 'archived'] },
    pageCount: { type: 'integer', format: 'int64' },
    driftCount: { type: 'integer', format: 'int64' },
    lastReleaseAt: { type: ['string', 'null'], format: 'date-time' },
    createdAt: { type: 'string', format: 'date-time' },
    createdBy: { type: ['string', 'null'], format: 'uuid' },
    updatedAt: { type: 'string', format: 'date-time' },
    updatedBy: { type: ['string', 'null'], format: 'uuid' },
    collectionId: { type: ['string', 'null'], format: 'uuid' },
    allowedActions: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          'delete',
          'create',
          'read',
          'update',
          'archive',
          'restore',
          'convert',
          'write_pages',
          'manage_permissions',
        ],
      },
    },
  },
};
function validate305(
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
  const evaluated0 = validate305.evaluated;
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
                      '#/components/schemas/PartialSpaceSummary/properties/id/format',
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
                    '#/components/schemas/PartialSpaceSummary/properties/id/type',
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
                      '#/components/schemas/PartialSpaceSummary/properties/tenantId/format',
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
                    '#/components/schemas/PartialSpaceSummary/properties/tenantId/type',
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
            if (data1.name !== undefined) {
              if (typeof data1.name !== 'string') {
                const err4 = {
                  instancePath: instancePath + '/items/' + i0 + '/name',
                  schemaPath:
                    '#/components/schemas/PartialSpaceSummary/properties/name/type',
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
            if (data1.icon !== undefined) {
              let data5 = data1.icon;
              if (typeof data5 !== 'string' && data5 !== null) {
                const err5 = {
                  instancePath: instancePath + '/items/' + i0 + '/icon',
                  schemaPath:
                    '#/components/schemas/PartialSpaceSummary/properties/icon/type',
                  keyword: 'type',
                  params: { type: schema408.properties.icon.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err5];
                } else {
                  vErrors.push(err5);
                }
                errors++;
              }
              if (!(
                data5 === 'book' ||
                data5 === 'code' ||
                data5 === 'api' ||
                data5 === 'guide' ||
                data5 === 'reference' ||
                data5 === null
              )) {
                const err6 = {
                  instancePath: instancePath + '/items/' + i0 + '/icon',
                  schemaPath:
                    '#/components/schemas/PartialSpaceSummary/properties/icon/enum',
                  keyword: 'enum',
                  params: { allowedValues: schema408.properties.icon.enum },
                  message: 'must be equal to one of the allowed values',
                };
                if (vErrors === null) {
                  vErrors = [err6];
                } else {
                  vErrors.push(err6);
                }
                errors++;
              }
            }
            if (data1.mode !== undefined) {
              let data6 = data1.mode;
              if (typeof data6 !== 'string') {
                const err7 = {
                  instancePath: instancePath + '/items/' + i0 + '/mode',
                  schemaPath:
                    '#/components/schemas/PartialSpaceSummary/properties/mode/type',
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
              if (!(data6 === 'authored' || data6 === 'synced')) {
                const err8 = {
                  instancePath: instancePath + '/items/' + i0 + '/mode',
                  schemaPath:
                    '#/components/schemas/PartialSpaceSummary/properties/mode/enum',
                  keyword: 'enum',
                  params: { allowedValues: schema408.properties.mode.enum },
                  message: 'must be equal to one of the allowed values',
                };
                if (vErrors === null) {
                  vErrors = [err8];
                } else {
                  vErrors.push(err8);
                }
                errors++;
              }
            }
            if (data1.status !== undefined) {
              let data7 = data1.status;
              if (typeof data7 !== 'string') {
                const err9 = {
                  instancePath: instancePath + '/items/' + i0 + '/status',
                  schemaPath:
                    '#/components/schemas/PartialSpaceSummary/properties/status/type',
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
              if (!(data7 === 'active' || data7 === 'archived')) {
                const err10 = {
                  instancePath: instancePath + '/items/' + i0 + '/status',
                  schemaPath:
                    '#/components/schemas/PartialSpaceSummary/properties/status/enum',
                  keyword: 'enum',
                  params: { allowedValues: schema408.properties.status.enum },
                  message: 'must be equal to one of the allowed values',
                };
                if (vErrors === null) {
                  vErrors = [err10];
                } else {
                  vErrors.push(err10);
                }
                errors++;
              }
            }
            if (data1.pageCount !== undefined) {
              let data8 = data1.pageCount;
              if (!(
                typeof data8 == 'number' &&
                !(data8 % 1) &&
                !isNaN(data8)
              )) {
                const err11 = {
                  instancePath: instancePath + '/items/' + i0 + '/pageCount',
                  schemaPath:
                    '#/components/schemas/PartialSpaceSummary/properties/pageCount/type',
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
            if (data1.driftCount !== undefined) {
              let data9 = data1.driftCount;
              if (!(
                typeof data9 == 'number' &&
                !(data9 % 1) &&
                !isNaN(data9)
              )) {
                const err12 = {
                  instancePath: instancePath + '/items/' + i0 + '/driftCount',
                  schemaPath:
                    '#/components/schemas/PartialSpaceSummary/properties/driftCount/type',
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
            if (data1.lastReleaseAt !== undefined) {
              let data10 = data1.lastReleaseAt;
              if (typeof data10 !== 'string' && data10 !== null) {
                const err13 = {
                  instancePath:
                    instancePath + '/items/' + i0 + '/lastReleaseAt',
                  schemaPath:
                    '#/components/schemas/PartialSpaceSummary/properties/lastReleaseAt/type',
                  keyword: 'type',
                  params: { type: schema408.properties.lastReleaseAt.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err13];
                } else {
                  vErrors.push(err13);
                }
                errors++;
              }
              if (typeof data10 === 'string') {
                if (!formats10.validate(data10)) {
                  const err14 = {
                    instancePath:
                      instancePath + '/items/' + i0 + '/lastReleaseAt',
                    schemaPath:
                      '#/components/schemas/PartialSpaceSummary/properties/lastReleaseAt/format',
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
              }
            }
            if (data1.createdAt !== undefined) {
              let data11 = data1.createdAt;
              if (typeof data11 === 'string') {
                if (!formats10.validate(data11)) {
                  const err15 = {
                    instancePath: instancePath + '/items/' + i0 + '/createdAt',
                    schemaPath:
                      '#/components/schemas/PartialSpaceSummary/properties/createdAt/format',
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
              } else {
                const err16 = {
                  instancePath: instancePath + '/items/' + i0 + '/createdAt',
                  schemaPath:
                    '#/components/schemas/PartialSpaceSummary/properties/createdAt/type',
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
            if (data1.createdBy !== undefined) {
              let data12 = data1.createdBy;
              if (typeof data12 !== 'string' && data12 !== null) {
                const err17 = {
                  instancePath: instancePath + '/items/' + i0 + '/createdBy',
                  schemaPath:
                    '#/components/schemas/PartialSpaceSummary/properties/createdBy/type',
                  keyword: 'type',
                  params: { type: schema408.properties.createdBy.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err17];
                } else {
                  vErrors.push(err17);
                }
                errors++;
              }
              if (typeof data12 === 'string') {
                if (!formats0.test(data12)) {
                  const err18 = {
                    instancePath: instancePath + '/items/' + i0 + '/createdBy',
                    schemaPath:
                      '#/components/schemas/PartialSpaceSummary/properties/createdBy/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err18];
                  } else {
                    vErrors.push(err18);
                  }
                  errors++;
                }
              }
            }
            if (data1.updatedAt !== undefined) {
              let data13 = data1.updatedAt;
              if (typeof data13 === 'string') {
                if (!formats10.validate(data13)) {
                  const err19 = {
                    instancePath: instancePath + '/items/' + i0 + '/updatedAt',
                    schemaPath:
                      '#/components/schemas/PartialSpaceSummary/properties/updatedAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
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
                  instancePath: instancePath + '/items/' + i0 + '/updatedAt',
                  schemaPath:
                    '#/components/schemas/PartialSpaceSummary/properties/updatedAt/type',
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
            if (data1.updatedBy !== undefined) {
              let data14 = data1.updatedBy;
              if (typeof data14 !== 'string' && data14 !== null) {
                const err21 = {
                  instancePath: instancePath + '/items/' + i0 + '/updatedBy',
                  schemaPath:
                    '#/components/schemas/PartialSpaceSummary/properties/updatedBy/type',
                  keyword: 'type',
                  params: { type: schema408.properties.updatedBy.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err21];
                } else {
                  vErrors.push(err21);
                }
                errors++;
              }
              if (typeof data14 === 'string') {
                if (!formats0.test(data14)) {
                  const err22 = {
                    instancePath: instancePath + '/items/' + i0 + '/updatedBy',
                    schemaPath:
                      '#/components/schemas/PartialSpaceSummary/properties/updatedBy/format',
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
              }
            }
            if (data1.collectionId !== undefined) {
              let data15 = data1.collectionId;
              if (typeof data15 !== 'string' && data15 !== null) {
                const err23 = {
                  instancePath: instancePath + '/items/' + i0 + '/collectionId',
                  schemaPath:
                    '#/components/schemas/PartialSpaceSummary/properties/collectionId/type',
                  keyword: 'type',
                  params: { type: schema408.properties.collectionId.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err23];
                } else {
                  vErrors.push(err23);
                }
                errors++;
              }
              if (typeof data15 === 'string') {
                if (!formats0.test(data15)) {
                  const err24 = {
                    instancePath:
                      instancePath + '/items/' + i0 + '/collectionId',
                    schemaPath:
                      '#/components/schemas/PartialSpaceSummary/properties/collectionId/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err24];
                  } else {
                    vErrors.push(err24);
                  }
                  errors++;
                }
              }
            }
            if (data1.allowedActions !== undefined) {
              let data16 = data1.allowedActions;
              if (Array.isArray(data16)) {
                const len1 = data16.length;
                for (let i1 = 0; i1 < len1; i1++) {
                  let data17 = data16[i1];
                  if (typeof data17 !== 'string') {
                    const err25 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/allowedActions/' + i1,
                      schemaPath:
                        '#/components/schemas/PartialSpaceSummary/properties/allowedActions/items/type',
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
                  if (!(
                    data17 === 'delete' ||
                    data17 === 'create' ||
                    data17 === 'read' ||
                    data17 === 'update' ||
                    data17 === 'archive' ||
                    data17 === 'restore' ||
                    data17 === 'convert' ||
                    data17 === 'write_pages' ||
                    data17 === 'manage_permissions'
                  )) {
                    const err26 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/allowedActions/' + i1,
                      schemaPath:
                        '#/components/schemas/PartialSpaceSummary/properties/allowedActions/items/enum',
                      keyword: 'enum',
                      params: {
                        allowedValues:
                          schema408.properties.allowedActions.items.enum,
                      },
                      message: 'must be equal to one of the allowed values',
                    };
                    if (vErrors === null) {
                      vErrors = [err26];
                    } else {
                      vErrors.push(err26);
                    }
                    errors++;
                  }
                }
              } else {
                const err27 = {
                  instancePath:
                    instancePath + '/items/' + i0 + '/allowedActions',
                  schemaPath:
                    '#/components/schemas/PartialSpaceSummary/properties/allowedActions/type',
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
          } else {
            const err28 = {
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/PartialSpaceSummary/type',
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
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
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
    if (data.nextCursor !== undefined) {
      let data18 = data.nextCursor;
      if (typeof data18 !== 'string' && data18 !== null) {
        const err30 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
          keyword: 'type',
          params: { type: schema407.properties.nextCursor.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err30];
        } else {
          vErrors.push(err30);
        }
        errors++;
      }
    }
    if (data.total !== undefined) {
      let data19 = data.total;
      if (
        !(typeof data19 == 'number' && !(data19 % 1) && !isNaN(data19)) &&
        data19 !== null
      ) {
        const err31 = {
          instancePath: instancePath + '/total',
          schemaPath: '#/properties/total/type',
          keyword: 'type',
          params: { type: schema407.properties.total.type },
          message: 'must be integer,null',
        };
        if (vErrors === null) {
          vErrors = [err31];
        } else {
          vErrors.push(err31);
        }
        errors++;
      }
    }
    if (data.allowedActions !== undefined) {
      let data20 = data.allowedActions;
      if (Array.isArray(data20)) {
        const len2 = data20.length;
        for (let i2 = 0; i2 < len2; i2++) {
          let data21 = data20[i2];
          if (typeof data21 !== 'string') {
            const err32 = {
              instancePath: instancePath + '/allowedActions/' + i2,
              schemaPath: '#/properties/allowedActions/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err32];
            } else {
              vErrors.push(err32);
            }
            errors++;
          }
          if (!(
            data21 === 'delete' ||
            data21 === 'create' ||
            data21 === 'read' ||
            data21 === 'update' ||
            data21 === 'archive' ||
            data21 === 'restore' ||
            data21 === 'convert' ||
            data21 === 'write_pages' ||
            data21 === 'manage_permissions'
          )) {
            const err33 = {
              instancePath: instancePath + '/allowedActions/' + i2,
              schemaPath: '#/properties/allowedActions/items/enum',
              keyword: 'enum',
              params: {
                allowedValues: schema407.properties.allowedActions.items.enum,
              },
              message: 'must be equal to one of the allowed values',
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
          instancePath: instancePath + '/allowedActions',
          schemaPath: '#/properties/allowedActions/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
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
  validate305.errors = vErrors;
  return errors === 0;
}
validate305.evaluated = {
  props: { items: true, nextCursor: true, total: true, allowedActions: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate302(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listSpacesOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate302.evaluated;
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
    !validate303(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate303.errors
        : vErrors.concat(validate303.errors);
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
    !validate305(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate305.errors
        : vErrors.concat(validate305.errors);
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
  validate302.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate302.evaluated = { dynamicProps: true, dynamicItems: false };
export const listSpacesOutputFull = validate307;
const schema409 = {
  $ref: 'https://edition.invalid/control#/components/schemas/SpacePage',
  $id: 'https://edition.invalid/validators/listSpacesOutputFull',
};
function validate308(
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
  const evaluated0 = validate308.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.allowedActions === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'allowedActions' },
        message: "must have required property '" + 'allowedActions' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.items === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'items' },
        message: "must have required property '" + 'items' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.nextCursor === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'nextCursor' },
        message: "must have required property '" + 'nextCursor' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.total === undefined) {
      const err3 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'total' },
        message: "must have required property '" + 'total' + "'",
      };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.items !== undefined) {
      let data0 = data.items;
      if (Array.isArray(data0)) {
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data1 = data0[i0];
          if (data1 && typeof data1 == 'object' && !Array.isArray(data1)) {
            if (data1.allowedActions === undefined) {
              const err4 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/SpaceSummary/required',
                keyword: 'required',
                params: { missingProperty: 'allowedActions' },
                message:
                  "must have required property '" + 'allowedActions' + "'",
              };
              if (vErrors === null) {
                vErrors = [err4];
              } else {
                vErrors.push(err4);
              }
              errors++;
            }
            if (data1.collectionId === undefined) {
              const err5 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/SpaceSummary/required',
                keyword: 'required',
                params: { missingProperty: 'collectionId' },
                message: "must have required property '" + 'collectionId' + "'",
              };
              if (vErrors === null) {
                vErrors = [err5];
              } else {
                vErrors.push(err5);
              }
              errors++;
            }
            if (data1.createdAt === undefined) {
              const err6 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/SpaceSummary/required',
                keyword: 'required',
                params: { missingProperty: 'createdAt' },
                message: "must have required property '" + 'createdAt' + "'",
              };
              if (vErrors === null) {
                vErrors = [err6];
              } else {
                vErrors.push(err6);
              }
              errors++;
            }
            if (data1.createdBy === undefined) {
              const err7 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/SpaceSummary/required',
                keyword: 'required',
                params: { missingProperty: 'createdBy' },
                message: "must have required property '" + 'createdBy' + "'",
              };
              if (vErrors === null) {
                vErrors = [err7];
              } else {
                vErrors.push(err7);
              }
              errors++;
            }
            if (data1.driftCount === undefined) {
              const err8 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/SpaceSummary/required',
                keyword: 'required',
                params: { missingProperty: 'driftCount' },
                message: "must have required property '" + 'driftCount' + "'",
              };
              if (vErrors === null) {
                vErrors = [err8];
              } else {
                vErrors.push(err8);
              }
              errors++;
            }
            if (data1.icon === undefined) {
              const err9 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/SpaceSummary/required',
                keyword: 'required',
                params: { missingProperty: 'icon' },
                message: "must have required property '" + 'icon' + "'",
              };
              if (vErrors === null) {
                vErrors = [err9];
              } else {
                vErrors.push(err9);
              }
              errors++;
            }
            if (data1.id === undefined) {
              const err10 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/SpaceSummary/required',
                keyword: 'required',
                params: { missingProperty: 'id' },
                message: "must have required property '" + 'id' + "'",
              };
              if (vErrors === null) {
                vErrors = [err10];
              } else {
                vErrors.push(err10);
              }
              errors++;
            }
            if (data1.lastReleaseAt === undefined) {
              const err11 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/SpaceSummary/required',
                keyword: 'required',
                params: { missingProperty: 'lastReleaseAt' },
                message:
                  "must have required property '" + 'lastReleaseAt' + "'",
              };
              if (vErrors === null) {
                vErrors = [err11];
              } else {
                vErrors.push(err11);
              }
              errors++;
            }
            if (data1.mode === undefined) {
              const err12 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/SpaceSummary/required',
                keyword: 'required',
                params: { missingProperty: 'mode' },
                message: "must have required property '" + 'mode' + "'",
              };
              if (vErrors === null) {
                vErrors = [err12];
              } else {
                vErrors.push(err12);
              }
              errors++;
            }
            if (data1.name === undefined) {
              const err13 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/SpaceSummary/required',
                keyword: 'required',
                params: { missingProperty: 'name' },
                message: "must have required property '" + 'name' + "'",
              };
              if (vErrors === null) {
                vErrors = [err13];
              } else {
                vErrors.push(err13);
              }
              errors++;
            }
            if (data1.pageCount === undefined) {
              const err14 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/SpaceSummary/required',
                keyword: 'required',
                params: { missingProperty: 'pageCount' },
                message: "must have required property '" + 'pageCount' + "'",
              };
              if (vErrors === null) {
                vErrors = [err14];
              } else {
                vErrors.push(err14);
              }
              errors++;
            }
            if (data1.status === undefined) {
              const err15 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/SpaceSummary/required',
                keyword: 'required',
                params: { missingProperty: 'status' },
                message: "must have required property '" + 'status' + "'",
              };
              if (vErrors === null) {
                vErrors = [err15];
              } else {
                vErrors.push(err15);
              }
              errors++;
            }
            if (data1.tenantId === undefined) {
              const err16 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/SpaceSummary/required',
                keyword: 'required',
                params: { missingProperty: 'tenantId' },
                message: "must have required property '" + 'tenantId' + "'",
              };
              if (vErrors === null) {
                vErrors = [err16];
              } else {
                vErrors.push(err16);
              }
              errors++;
            }
            if (data1.updatedAt === undefined) {
              const err17 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/SpaceSummary/required',
                keyword: 'required',
                params: { missingProperty: 'updatedAt' },
                message: "must have required property '" + 'updatedAt' + "'",
              };
              if (vErrors === null) {
                vErrors = [err17];
              } else {
                vErrors.push(err17);
              }
              errors++;
            }
            if (data1.updatedBy === undefined) {
              const err18 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/SpaceSummary/required',
                keyword: 'required',
                params: { missingProperty: 'updatedBy' },
                message: "must have required property '" + 'updatedBy' + "'",
              };
              if (vErrors === null) {
                vErrors = [err18];
              } else {
                vErrors.push(err18);
              }
              errors++;
            }
            if (data1.id !== undefined) {
              let data2 = data1.id;
              if (typeof data2 === 'string') {
                if (!formats0.test(data2)) {
                  const err19 = {
                    instancePath: instancePath + '/items/' + i0 + '/id',
                    schemaPath:
                      '#/components/schemas/SpaceSummary/properties/id/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/id',
                  schemaPath:
                    '#/components/schemas/SpaceSummary/properties/id/type',
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
            if (data1.tenantId !== undefined) {
              let data3 = data1.tenantId;
              if (typeof data3 === 'string') {
                if (!formats0.test(data3)) {
                  const err21 = {
                    instancePath: instancePath + '/items/' + i0 + '/tenantId',
                    schemaPath:
                      '#/components/schemas/SpaceSummary/properties/tenantId/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/tenantId',
                  schemaPath:
                    '#/components/schemas/SpaceSummary/properties/tenantId/type',
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
            if (data1.name !== undefined) {
              if (typeof data1.name !== 'string') {
                const err23 = {
                  instancePath: instancePath + '/items/' + i0 + '/name',
                  schemaPath:
                    '#/components/schemas/SpaceSummary/properties/name/type',
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
            if (data1.icon !== undefined) {
              let data5 = data1.icon;
              if (typeof data5 !== 'string' && data5 !== null) {
                const err24 = {
                  instancePath: instancePath + '/items/' + i0 + '/icon',
                  schemaPath:
                    '#/components/schemas/SpaceSummary/properties/icon/type',
                  keyword: 'type',
                  params: { type: schema406.properties.icon.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err24];
                } else {
                  vErrors.push(err24);
                }
                errors++;
              }
              if (!(
                data5 === 'book' ||
                data5 === 'code' ||
                data5 === 'api' ||
                data5 === 'guide' ||
                data5 === 'reference' ||
                data5 === null
              )) {
                const err25 = {
                  instancePath: instancePath + '/items/' + i0 + '/icon',
                  schemaPath:
                    '#/components/schemas/SpaceSummary/properties/icon/enum',
                  keyword: 'enum',
                  params: { allowedValues: schema406.properties.icon.enum },
                  message: 'must be equal to one of the allowed values',
                };
                if (vErrors === null) {
                  vErrors = [err25];
                } else {
                  vErrors.push(err25);
                }
                errors++;
              }
            }
            if (data1.mode !== undefined) {
              let data6 = data1.mode;
              if (typeof data6 !== 'string') {
                const err26 = {
                  instancePath: instancePath + '/items/' + i0 + '/mode',
                  schemaPath:
                    '#/components/schemas/SpaceSummary/properties/mode/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err26];
                } else {
                  vErrors.push(err26);
                }
                errors++;
              }
              if (!(data6 === 'authored' || data6 === 'synced')) {
                const err27 = {
                  instancePath: instancePath + '/items/' + i0 + '/mode',
                  schemaPath:
                    '#/components/schemas/SpaceSummary/properties/mode/enum',
                  keyword: 'enum',
                  params: { allowedValues: schema406.properties.mode.enum },
                  message: 'must be equal to one of the allowed values',
                };
                if (vErrors === null) {
                  vErrors = [err27];
                } else {
                  vErrors.push(err27);
                }
                errors++;
              }
            }
            if (data1.status !== undefined) {
              let data7 = data1.status;
              if (typeof data7 !== 'string') {
                const err28 = {
                  instancePath: instancePath + '/items/' + i0 + '/status',
                  schemaPath:
                    '#/components/schemas/SpaceSummary/properties/status/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err28];
                } else {
                  vErrors.push(err28);
                }
                errors++;
              }
              if (!(data7 === 'active' || data7 === 'archived')) {
                const err29 = {
                  instancePath: instancePath + '/items/' + i0 + '/status',
                  schemaPath:
                    '#/components/schemas/SpaceSummary/properties/status/enum',
                  keyword: 'enum',
                  params: { allowedValues: schema406.properties.status.enum },
                  message: 'must be equal to one of the allowed values',
                };
                if (vErrors === null) {
                  vErrors = [err29];
                } else {
                  vErrors.push(err29);
                }
                errors++;
              }
            }
            if (data1.pageCount !== undefined) {
              let data8 = data1.pageCount;
              if (!(
                typeof data8 == 'number' &&
                !(data8 % 1) &&
                !isNaN(data8)
              )) {
                const err30 = {
                  instancePath: instancePath + '/items/' + i0 + '/pageCount',
                  schemaPath:
                    '#/components/schemas/SpaceSummary/properties/pageCount/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
                };
                if (vErrors === null) {
                  vErrors = [err30];
                } else {
                  vErrors.push(err30);
                }
                errors++;
              }
            }
            if (data1.driftCount !== undefined) {
              let data9 = data1.driftCount;
              if (!(
                typeof data9 == 'number' &&
                !(data9 % 1) &&
                !isNaN(data9)
              )) {
                const err31 = {
                  instancePath: instancePath + '/items/' + i0 + '/driftCount',
                  schemaPath:
                    '#/components/schemas/SpaceSummary/properties/driftCount/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
                };
                if (vErrors === null) {
                  vErrors = [err31];
                } else {
                  vErrors.push(err31);
                }
                errors++;
              }
            }
            if (data1.lastReleaseAt !== undefined) {
              let data10 = data1.lastReleaseAt;
              if (typeof data10 !== 'string' && data10 !== null) {
                const err32 = {
                  instancePath:
                    instancePath + '/items/' + i0 + '/lastReleaseAt',
                  schemaPath:
                    '#/components/schemas/SpaceSummary/properties/lastReleaseAt/type',
                  keyword: 'type',
                  params: { type: schema406.properties.lastReleaseAt.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err32];
                } else {
                  vErrors.push(err32);
                }
                errors++;
              }
              if (typeof data10 === 'string') {
                if (!formats10.validate(data10)) {
                  const err33 = {
                    instancePath:
                      instancePath + '/items/' + i0 + '/lastReleaseAt',
                    schemaPath:
                      '#/components/schemas/SpaceSummary/properties/lastReleaseAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err33];
                  } else {
                    vErrors.push(err33);
                  }
                  errors++;
                }
              }
            }
            if (data1.createdAt !== undefined) {
              let data11 = data1.createdAt;
              if (typeof data11 === 'string') {
                if (!formats10.validate(data11)) {
                  const err34 = {
                    instancePath: instancePath + '/items/' + i0 + '/createdAt',
                    schemaPath:
                      '#/components/schemas/SpaceSummary/properties/createdAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err34];
                  } else {
                    vErrors.push(err34);
                  }
                  errors++;
                }
              } else {
                const err35 = {
                  instancePath: instancePath + '/items/' + i0 + '/createdAt',
                  schemaPath:
                    '#/components/schemas/SpaceSummary/properties/createdAt/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err35];
                } else {
                  vErrors.push(err35);
                }
                errors++;
              }
            }
            if (data1.createdBy !== undefined) {
              let data12 = data1.createdBy;
              if (typeof data12 !== 'string' && data12 !== null) {
                const err36 = {
                  instancePath: instancePath + '/items/' + i0 + '/createdBy',
                  schemaPath:
                    '#/components/schemas/SpaceSummary/properties/createdBy/type',
                  keyword: 'type',
                  params: { type: schema406.properties.createdBy.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err36];
                } else {
                  vErrors.push(err36);
                }
                errors++;
              }
              if (typeof data12 === 'string') {
                if (!formats0.test(data12)) {
                  const err37 = {
                    instancePath: instancePath + '/items/' + i0 + '/createdBy',
                    schemaPath:
                      '#/components/schemas/SpaceSummary/properties/createdBy/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err37];
                  } else {
                    vErrors.push(err37);
                  }
                  errors++;
                }
              }
            }
            if (data1.updatedAt !== undefined) {
              let data13 = data1.updatedAt;
              if (typeof data13 === 'string') {
                if (!formats10.validate(data13)) {
                  const err38 = {
                    instancePath: instancePath + '/items/' + i0 + '/updatedAt',
                    schemaPath:
                      '#/components/schemas/SpaceSummary/properties/updatedAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err38];
                  } else {
                    vErrors.push(err38);
                  }
                  errors++;
                }
              } else {
                const err39 = {
                  instancePath: instancePath + '/items/' + i0 + '/updatedAt',
                  schemaPath:
                    '#/components/schemas/SpaceSummary/properties/updatedAt/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err39];
                } else {
                  vErrors.push(err39);
                }
                errors++;
              }
            }
            if (data1.updatedBy !== undefined) {
              let data14 = data1.updatedBy;
              if (typeof data14 !== 'string' && data14 !== null) {
                const err40 = {
                  instancePath: instancePath + '/items/' + i0 + '/updatedBy',
                  schemaPath:
                    '#/components/schemas/SpaceSummary/properties/updatedBy/type',
                  keyword: 'type',
                  params: { type: schema406.properties.updatedBy.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err40];
                } else {
                  vErrors.push(err40);
                }
                errors++;
              }
              if (typeof data14 === 'string') {
                if (!formats0.test(data14)) {
                  const err41 = {
                    instancePath: instancePath + '/items/' + i0 + '/updatedBy',
                    schemaPath:
                      '#/components/schemas/SpaceSummary/properties/updatedBy/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err41];
                  } else {
                    vErrors.push(err41);
                  }
                  errors++;
                }
              }
            }
            if (data1.collectionId !== undefined) {
              let data15 = data1.collectionId;
              if (typeof data15 !== 'string' && data15 !== null) {
                const err42 = {
                  instancePath: instancePath + '/items/' + i0 + '/collectionId',
                  schemaPath:
                    '#/components/schemas/SpaceSummary/properties/collectionId/type',
                  keyword: 'type',
                  params: { type: schema406.properties.collectionId.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err42];
                } else {
                  vErrors.push(err42);
                }
                errors++;
              }
              if (typeof data15 === 'string') {
                if (!formats0.test(data15)) {
                  const err43 = {
                    instancePath:
                      instancePath + '/items/' + i0 + '/collectionId',
                    schemaPath:
                      '#/components/schemas/SpaceSummary/properties/collectionId/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err43];
                  } else {
                    vErrors.push(err43);
                  }
                  errors++;
                }
              }
            }
            if (data1.allowedActions !== undefined) {
              let data16 = data1.allowedActions;
              if (Array.isArray(data16)) {
                const len1 = data16.length;
                for (let i1 = 0; i1 < len1; i1++) {
                  let data17 = data16[i1];
                  if (typeof data17 !== 'string') {
                    const err44 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/allowedActions/' + i1,
                      schemaPath:
                        '#/components/schemas/SpaceSummary/properties/allowedActions/items/type',
                      keyword: 'type',
                      params: { type: 'string' },
                      message: 'must be string',
                    };
                    if (vErrors === null) {
                      vErrors = [err44];
                    } else {
                      vErrors.push(err44);
                    }
                    errors++;
                  }
                  if (!(
                    data17 === 'delete' ||
                    data17 === 'create' ||
                    data17 === 'read' ||
                    data17 === 'update' ||
                    data17 === 'archive' ||
                    data17 === 'restore' ||
                    data17 === 'convert' ||
                    data17 === 'write_pages' ||
                    data17 === 'manage_permissions'
                  )) {
                    const err45 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/allowedActions/' + i1,
                      schemaPath:
                        '#/components/schemas/SpaceSummary/properties/allowedActions/items/enum',
                      keyword: 'enum',
                      params: {
                        allowedValues:
                          schema406.properties.allowedActions.items.enum,
                      },
                      message: 'must be equal to one of the allowed values',
                    };
                    if (vErrors === null) {
                      vErrors = [err45];
                    } else {
                      vErrors.push(err45);
                    }
                    errors++;
                  }
                }
              } else {
                const err46 = {
                  instancePath:
                    instancePath + '/items/' + i0 + '/allowedActions',
                  schemaPath:
                    '#/components/schemas/SpaceSummary/properties/allowedActions/type',
                  keyword: 'type',
                  params: { type: 'array' },
                  message: 'must be array',
                };
                if (vErrors === null) {
                  vErrors = [err46];
                } else {
                  vErrors.push(err46);
                }
                errors++;
              }
            }
          } else {
            const err47 = {
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/SpaceSummary/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
            };
            if (vErrors === null) {
              vErrors = [err47];
            } else {
              vErrors.push(err47);
            }
            errors++;
          }
        }
      } else {
        const err48 = {
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err48];
        } else {
          vErrors.push(err48);
        }
        errors++;
      }
    }
    if (data.nextCursor !== undefined) {
      let data18 = data.nextCursor;
      if (typeof data18 !== 'string' && data18 !== null) {
        const err49 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
          keyword: 'type',
          params: { type: schema405.properties.nextCursor.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err49];
        } else {
          vErrors.push(err49);
        }
        errors++;
      }
    }
    if (data.total !== undefined) {
      let data19 = data.total;
      if (
        !(typeof data19 == 'number' && !(data19 % 1) && !isNaN(data19)) &&
        data19 !== null
      ) {
        const err50 = {
          instancePath: instancePath + '/total',
          schemaPath: '#/properties/total/type',
          keyword: 'type',
          params: { type: schema405.properties.total.type },
          message: 'must be integer,null',
        };
        if (vErrors === null) {
          vErrors = [err50];
        } else {
          vErrors.push(err50);
        }
        errors++;
      }
    }
    if (data.allowedActions !== undefined) {
      let data20 = data.allowedActions;
      if (Array.isArray(data20)) {
        const len2 = data20.length;
        for (let i2 = 0; i2 < len2; i2++) {
          let data21 = data20[i2];
          if (typeof data21 !== 'string') {
            const err51 = {
              instancePath: instancePath + '/allowedActions/' + i2,
              schemaPath: '#/properties/allowedActions/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err51];
            } else {
              vErrors.push(err51);
            }
            errors++;
          }
          if (!(
            data21 === 'delete' ||
            data21 === 'create' ||
            data21 === 'read' ||
            data21 === 'update' ||
            data21 === 'archive' ||
            data21 === 'restore' ||
            data21 === 'convert' ||
            data21 === 'write_pages' ||
            data21 === 'manage_permissions'
          )) {
            const err52 = {
              instancePath: instancePath + '/allowedActions/' + i2,
              schemaPath: '#/properties/allowedActions/items/enum',
              keyword: 'enum',
              params: {
                allowedValues: schema405.properties.allowedActions.items.enum,
              },
              message: 'must be equal to one of the allowed values',
            };
            if (vErrors === null) {
              vErrors = [err52];
            } else {
              vErrors.push(err52);
            }
            errors++;
          }
        }
      } else {
        const err53 = {
          instancePath: instancePath + '/allowedActions',
          schemaPath: '#/properties/allowedActions/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err53];
        } else {
          vErrors.push(err53);
        }
        errors++;
      }
    }
  } else {
    const err54 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err54];
    } else {
      vErrors.push(err54);
    }
    errors++;
  }
  validate308.errors = vErrors;
  return errors === 0;
}
validate308.evaluated = {
  props: { items: true, nextCursor: true, total: true, allowedActions: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate307(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listSpacesOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate307.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate308(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate308.errors
        : vErrors.concat(validate308.errors);
    errors = vErrors.length;
  }
  validate307.errors = vErrors;
  return errors === 0;
}
validate307.evaluated = {
  props: { items: true, nextCursor: true, total: true, allowedActions: true },
  dynamicProps: false,
  dynamicItems: false,
};
