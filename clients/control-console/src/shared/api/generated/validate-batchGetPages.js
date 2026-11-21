// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
('use strict');
export const batchGetPagesInput = validate475;
const schema569 = {
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
    body: {
      $ref: 'https://edition.invalid/control#/components/schemas/BatchReadRequest',
    },
  },
  required: ['path', 'body'],
  $id: 'https://edition.invalid/validators/batchGetPagesInput',
};
const schema570 = {
  type: 'object',
  properties: {
    ids: {
      type: 'array',
      items: { type: 'string', format: 'uuid' },
      maxItems: 100,
      minItems: 1,
    },
    view: { type: 'string', enum: ['summary', 'content'] },
  },
  required: ['ids', 'view'],
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
function validate475(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/batchGetPagesInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate475.evaluated;
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
    if (data.body === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'body' },
        message: "must have required property '" + 'body' + "'",
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
        if (data0.tenantId === undefined) {
          const err2 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'tenantId' },
            message: "must have required property '" + 'tenantId' + "'",
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
        if (data0.spaceId === undefined) {
          const err3 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'spaceId' },
            message: "must have required property '" + 'spaceId' + "'",
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
                instancePath: instancePath + '/path/tenantId',
                schemaPath: '#/properties/path/properties/tenantId/format',
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
              instancePath: instancePath + '/path/tenantId',
              schemaPath: '#/properties/path/properties/tenantId/type',
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
        if (data0.spaceId !== undefined) {
          let data2 = data0.spaceId;
          if (typeof data2 === 'string') {
            if (!formats0.test(data2)) {
              const err6 = {
                instancePath: instancePath + '/path/spaceId',
                schemaPath: '#/properties/path/properties/spaceId/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
              };
              if (vErrors === null) {
                vErrors = [err6];
              } else {
                vErrors.push(err6);
              }
              errors++;
            }
          } else {
            const err7 = {
              instancePath: instancePath + '/path/spaceId',
              schemaPath: '#/properties/path/properties/spaceId/type',
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
          instancePath: instancePath + '/path',
          schemaPath: '#/properties/path/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.body !== undefined) {
      let data3 = data.body;
      if (data3 && typeof data3 == 'object' && !Array.isArray(data3)) {
        if (data3.ids === undefined) {
          const err9 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/BatchReadRequest/required',
            keyword: 'required',
            params: { missingProperty: 'ids' },
            message: "must have required property '" + 'ids' + "'",
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
        if (data3.view === undefined) {
          const err10 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/BatchReadRequest/required',
            keyword: 'required',
            params: { missingProperty: 'view' },
            message: "must have required property '" + 'view' + "'",
          };
          if (vErrors === null) {
            vErrors = [err10];
          } else {
            vErrors.push(err10);
          }
          errors++;
        }
        if (data3.ids !== undefined) {
          let data4 = data3.ids;
          if (Array.isArray(data4)) {
            if (data4.length > 100) {
              const err11 = {
                instancePath: instancePath + '/body/ids',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/BatchReadRequest/properties/ids/maxItems',
                keyword: 'maxItems',
                params: { limit: 100 },
                message: 'must NOT have more than 100 items',
              };
              if (vErrors === null) {
                vErrors = [err11];
              } else {
                vErrors.push(err11);
              }
              errors++;
            }
            if (data4.length < 1) {
              const err12 = {
                instancePath: instancePath + '/body/ids',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/BatchReadRequest/properties/ids/minItems',
                keyword: 'minItems',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 items',
              };
              if (vErrors === null) {
                vErrors = [err12];
              } else {
                vErrors.push(err12);
              }
              errors++;
            }
            const len0 = data4.length;
            for (let i0 = 0; i0 < len0; i0++) {
              let data5 = data4[i0];
              if (typeof data5 === 'string') {
                if (!formats0.test(data5)) {
                  const err13 = {
                    instancePath: instancePath + '/body/ids/' + i0,
                    schemaPath:
                      'https://edition.invalid/control#/components/schemas/BatchReadRequest/properties/ids/items/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
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
                  instancePath: instancePath + '/body/ids/' + i0,
                  schemaPath:
                    'https://edition.invalid/control#/components/schemas/BatchReadRequest/properties/ids/items/type',
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
              instancePath: instancePath + '/body/ids',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/BatchReadRequest/properties/ids/type',
              keyword: 'type',
              params: { type: 'array' },
              message: 'must be array',
            };
            if (vErrors === null) {
              vErrors = [err15];
            } else {
              vErrors.push(err15);
            }
            errors++;
          }
        }
        if (data3.view !== undefined) {
          let data6 = data3.view;
          if (typeof data6 !== 'string') {
            const err16 = {
              instancePath: instancePath + '/body/view',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/BatchReadRequest/properties/view/type',
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
          if (!(data6 === 'summary' || data6 === 'content')) {
            const err17 = {
              instancePath: instancePath + '/body/view',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/BatchReadRequest/properties/view/enum',
              keyword: 'enum',
              params: { allowedValues: schema570.properties.view.enum },
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
      } else {
        const err18 = {
          instancePath: instancePath + '/body',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/BatchReadRequest/type',
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
  validate475.errors = vErrors;
  return errors === 0;
}
validate475.evaluated = {
  props: { path: true, body: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const batchGetPagesOutput = validate476;
const schema571 = {
  $ref: 'https://edition.invalid/control#/components/schemas/BatchPageResponse',
  $id: 'https://edition.invalid/validators/batchGetPagesOutput',
};
const schema572 = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { $ref: '#/components/schemas/BatchPageItem' },
    },
  },
};
const schema573 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    status: { type: 'string', enum: ['ok', 'not_found'] },
    page: {
      anyOf: [{ $ref: '#/components/schemas/PageSummary' }, { type: 'null' }],
    },
    content: {
      anyOf: [
        { $ref: '#/components/schemas/ContentSnapshot' },
        { type: 'null' },
      ],
    },
    etag: { type: ['string', 'null'] },
  },
  required: ['id', 'status'],
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
const schema119 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    format: { type: 'string' },
    content: { type: 'string' },
    revision: { type: 'integer', format: 'int32' },
    contentType: { type: 'string' },
    versionRef: { type: ['string', 'null'] },
    interpretation: { type: 'object', additionalProperties: {} },
  },
  required: [
    'content',
    'contentType',
    'format',
    'id',
    'interpretation',
    'revision',
    'versionRef',
  ],
};
const formats10 = fullFormats['date-time'];
function validate478(
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
  const evaluated0 = validate478.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.id === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'id' },
        message: "must have required property '" + 'id' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.status === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'status' },
        message: "must have required property '" + 'status' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.id !== undefined) {
      let data0 = data.id;
      if (typeof data0 === 'string') {
        if (!formats0.test(data0)) {
          const err2 = {
            instancePath: instancePath + '/id',
            schemaPath: '#/properties/id/format',
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
          instancePath: instancePath + '/id',
          schemaPath: '#/properties/id/type',
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
    if (data.status !== undefined) {
      let data1 = data.status;
      if (typeof data1 !== 'string') {
        const err4 = {
          instancePath: instancePath + '/status',
          schemaPath: '#/properties/status/type',
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
      if (!(data1 === 'ok' || data1 === 'not_found')) {
        const err5 = {
          instancePath: instancePath + '/status',
          schemaPath: '#/properties/status/enum',
          keyword: 'enum',
          params: { allowedValues: schema573.properties.status.enum },
          message: 'must be equal to one of the allowed values',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.page !== undefined) {
      let data2 = data.page;
      const _errs6 = errors;
      let valid1 = false;
      const _errs7 = errors;
      if (data2 && typeof data2 == 'object' && !Array.isArray(data2)) {
        if (data2.id !== undefined) {
          let data3 = data2.id;
          if (typeof data3 === 'string') {
            if (!formats0.test(data3)) {
              const err6 = {
                instancePath: instancePath + '/page/id',
                schemaPath:
                  '#/components/schemas/PageSummary/properties/id/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
              };
              if (vErrors === null) {
                vErrors = [err6];
              } else {
                vErrors.push(err6);
              }
              errors++;
            }
          } else {
            const err7 = {
              instancePath: instancePath + '/page/id',
              schemaPath: '#/components/schemas/PageSummary/properties/id/type',
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
        if (data2.title !== undefined) {
          if (typeof data2.title !== 'string') {
            const err8 = {
              instancePath: instancePath + '/page/title',
              schemaPath:
                '#/components/schemas/PageSummary/properties/title/type',
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
        if (data2.slug !== undefined) {
          if (typeof data2.slug !== 'string') {
            const err9 = {
              instancePath: instancePath + '/page/slug',
              schemaPath:
                '#/components/schemas/PageSummary/properties/slug/type',
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
        if (data2.status !== undefined) {
          if (typeof data2.status !== 'string') {
            const err10 = {
              instancePath: instancePath + '/page/status',
              schemaPath:
                '#/components/schemas/PageSummary/properties/status/type',
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
        if (data2.format !== undefined) {
          if (typeof data2.format !== 'string') {
            const err11 = {
              instancePath: instancePath + '/page/format',
              schemaPath:
                '#/components/schemas/PageSummary/properties/format/type',
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
        if (data2.icon !== undefined) {
          let data8 = data2.icon;
          if (typeof data8 !== 'string' && data8 !== null) {
            const err12 = {
              instancePath: instancePath + '/page/icon',
              schemaPath:
                '#/components/schemas/PageSummary/properties/icon/type',
              keyword: 'type',
              params: { type: schema531.properties.icon.type },
              message: 'must be string,null',
            };
            if (vErrors === null) {
              vErrors = [err12];
            } else {
              vErrors.push(err12);
            }
            errors++;
          }
        }
        if (data2.tags !== undefined) {
          let data9 = data2.tags;
          if (Array.isArray(data9)) {
            const len0 = data9.length;
            for (let i0 = 0; i0 < len0; i0++) {
              if (typeof data9[i0] !== 'string') {
                const err13 = {
                  instancePath: instancePath + '/page/tags/' + i0,
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/tags/items/type',
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
              instancePath: instancePath + '/page/tags',
              schemaPath:
                '#/components/schemas/PageSummary/properties/tags/type',
              keyword: 'type',
              params: { type: 'array' },
              message: 'must be array',
            };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
        }
        if (data2.driftFlag !== undefined) {
          if (typeof data2.driftFlag !== 'boolean') {
            const err15 = {
              instancePath: instancePath + '/page/driftFlag',
              schemaPath:
                '#/components/schemas/PageSummary/properties/driftFlag/type',
              keyword: 'type',
              params: { type: 'boolean' },
              message: 'must be boolean',
            };
            if (vErrors === null) {
              vErrors = [err15];
            } else {
              vErrors.push(err15);
            }
            errors++;
          }
        }
        if (data2.updatedAt !== undefined) {
          let data12 = data2.updatedAt;
          if (typeof data12 === 'string') {
            if (!formats10.validate(data12)) {
              const err16 = {
                instancePath: instancePath + '/page/updatedAt',
                schemaPath:
                  '#/components/schemas/PageSummary/properties/updatedAt/format',
                keyword: 'format',
                params: { format: 'date-time' },
                message: 'must match format "' + 'date-time' + '"',
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
              instancePath: instancePath + '/page/updatedAt',
              schemaPath:
                '#/components/schemas/PageSummary/properties/updatedAt/type',
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
        if (data2.updatedBy !== undefined) {
          let data13 = data2.updatedBy;
          if (typeof data13 === 'string') {
            if (!formats0.test(data13)) {
              const err18 = {
                instancePath: instancePath + '/page/updatedBy',
                schemaPath:
                  '#/components/schemas/PageSummary/properties/updatedBy/format',
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
          } else {
            const err19 = {
              instancePath: instancePath + '/page/updatedBy',
              schemaPath:
                '#/components/schemas/PageSummary/properties/updatedBy/type',
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
        if (data2.publishedAt !== undefined) {
          let data14 = data2.publishedAt;
          if (typeof data14 !== 'string' && data14 !== null) {
            const err20 = {
              instancePath: instancePath + '/page/publishedAt',
              schemaPath:
                '#/components/schemas/PageSummary/properties/publishedAt/type',
              keyword: 'type',
              params: { type: schema531.properties.publishedAt.type },
              message: 'must be string,null',
            };
            if (vErrors === null) {
              vErrors = [err20];
            } else {
              vErrors.push(err20);
            }
            errors++;
          }
          if (typeof data14 === 'string') {
            if (!formats10.validate(data14)) {
              const err21 = {
                instancePath: instancePath + '/page/publishedAt',
                schemaPath:
                  '#/components/schemas/PageSummary/properties/publishedAt/format',
                keyword: 'format',
                params: { format: 'date-time' },
                message: 'must match format "' + 'date-time' + '"',
              };
              if (vErrors === null) {
                vErrors = [err21];
              } else {
                vErrors.push(err21);
              }
              errors++;
            }
          }
        }
        if (data2.allowedActions !== undefined) {
          let data15 = data2.allowedActions;
          if (Array.isArray(data15)) {
            const len1 = data15.length;
            for (let i1 = 0; i1 < len1; i1++) {
              let data16 = data15[i1];
              if (typeof data16 !== 'string') {
                const err22 = {
                  instancePath: instancePath + '/page/allowedActions/' + i1,
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/allowedActions/items/type',
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
              if (!(
                data16 === 'create' ||
                data16 === 'read' ||
                data16 === 'rename' ||
                data16 === 'edit' ||
                data16 === 'revert' ||
                data16 === 'reslug' ||
                data16 === 'transfer' ||
                data16 === 'publish' ||
                data16 === 'unpublish'
              )) {
                const err23 = {
                  instancePath: instancePath + '/page/allowedActions/' + i1,
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
                  vErrors = [err23];
                } else {
                  vErrors.push(err23);
                }
                errors++;
              }
            }
            let i2 = data15.length;
            let j0;
            if (i2 > 1) {
              const indices0 = {};
              for (; i2--;) {
                let item0 = data15[i2];
                if (typeof item0 !== 'string') {
                  continue;
                }
                if (typeof indices0[item0] == 'number') {
                  j0 = indices0[item0];
                  const err24 = {
                    instancePath: instancePath + '/page/allowedActions',
                    schemaPath:
                      '#/components/schemas/PageSummary/properties/allowedActions/uniqueItems',
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
                    vErrors = [err24];
                  } else {
                    vErrors.push(err24);
                  }
                  errors++;
                  break;
                }
                indices0[item0] = i2;
              }
            }
          } else {
            const err25 = {
              instancePath: instancePath + '/page/allowedActions',
              schemaPath:
                '#/components/schemas/PageSummary/properties/allowedActions/type',
              keyword: 'type',
              params: { type: 'array' },
              message: 'must be array',
            };
            if (vErrors === null) {
              vErrors = [err25];
            } else {
              vErrors.push(err25);
            }
            errors++;
          }
        }
        if (data2.contentType !== undefined) {
          if (typeof data2.contentType !== 'string') {
            const err26 = {
              instancePath: instancePath + '/page/contentType',
              schemaPath:
                '#/components/schemas/PageSummary/properties/contentType/type',
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
        }
        if (data2.versionRef !== undefined) {
          if (typeof data2.versionRef !== 'string') {
            const err27 = {
              instancePath: instancePath + '/page/versionRef',
              schemaPath:
                '#/components/schemas/PageSummary/properties/versionRef/type',
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
        if (data2.interpretation !== undefined) {
          let data19 = data2.interpretation;
          if (data19 && typeof data19 == 'object' && !Array.isArray(data19)) {
          } else {
            const err28 = {
              instancePath: instancePath + '/page/interpretation',
              schemaPath:
                '#/components/schemas/PageSummary/properties/interpretation/type',
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
          instancePath: instancePath + '/page',
          schemaPath: '#/components/schemas/PageSummary/type',
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
      var _valid0 = _errs7 === errors;
      valid1 = valid1 || _valid0;
      if (_valid0) {
        var props0 = {};
        props0.id = true;
        props0.title = true;
        props0.slug = true;
        props0.status = true;
        props0.format = true;
        props0.icon = true;
        props0.tags = true;
        props0.driftFlag = true;
        props0.updatedAt = true;
        props0.updatedBy = true;
        props0.publishedAt = true;
        props0.allowedActions = true;
        props0.contentType = true;
        props0.versionRef = true;
        props0.interpretation = true;
      }
      const _errs45 = errors;
      if (data2 !== null) {
        const err30 = {
          instancePath: instancePath + '/page',
          schemaPath: '#/properties/page/anyOf/1/type',
          keyword: 'type',
          params: { type: 'null' },
          message: 'must be null',
        };
        if (vErrors === null) {
          vErrors = [err30];
        } else {
          vErrors.push(err30);
        }
        errors++;
      }
      var _valid0 = _errs45 === errors;
      valid1 = valid1 || _valid0;
      if (!valid1) {
        const err31 = {
          instancePath: instancePath + '/page',
          schemaPath: '#/properties/page/anyOf',
          keyword: 'anyOf',
          params: {},
          message: 'must match a schema in anyOf',
        };
        if (vErrors === null) {
          vErrors = [err31];
        } else {
          vErrors.push(err31);
        }
        errors++;
      } else {
        errors = _errs6;
        if (vErrors !== null) {
          if (_errs6) {
            vErrors.length = _errs6;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.content !== undefined) {
      let data20 = data.content;
      const _errs48 = errors;
      let valid9 = false;
      const _errs49 = errors;
      if (data20 && typeof data20 == 'object' && !Array.isArray(data20)) {
        if (data20.content === undefined) {
          const err32 = {
            instancePath: instancePath + '/content',
            schemaPath: '#/components/schemas/ContentSnapshot/required',
            keyword: 'required',
            params: { missingProperty: 'content' },
            message: "must have required property '" + 'content' + "'",
          };
          if (vErrors === null) {
            vErrors = [err32];
          } else {
            vErrors.push(err32);
          }
          errors++;
        }
        if (data20.contentType === undefined) {
          const err33 = {
            instancePath: instancePath + '/content',
            schemaPath: '#/components/schemas/ContentSnapshot/required',
            keyword: 'required',
            params: { missingProperty: 'contentType' },
            message: "must have required property '" + 'contentType' + "'",
          };
          if (vErrors === null) {
            vErrors = [err33];
          } else {
            vErrors.push(err33);
          }
          errors++;
        }
        if (data20.format === undefined) {
          const err34 = {
            instancePath: instancePath + '/content',
            schemaPath: '#/components/schemas/ContentSnapshot/required',
            keyword: 'required',
            params: { missingProperty: 'format' },
            message: "must have required property '" + 'format' + "'",
          };
          if (vErrors === null) {
            vErrors = [err34];
          } else {
            vErrors.push(err34);
          }
          errors++;
        }
        if (data20.id === undefined) {
          const err35 = {
            instancePath: instancePath + '/content',
            schemaPath: '#/components/schemas/ContentSnapshot/required',
            keyword: 'required',
            params: { missingProperty: 'id' },
            message: "must have required property '" + 'id' + "'",
          };
          if (vErrors === null) {
            vErrors = [err35];
          } else {
            vErrors.push(err35);
          }
          errors++;
        }
        if (data20.interpretation === undefined) {
          const err36 = {
            instancePath: instancePath + '/content',
            schemaPath: '#/components/schemas/ContentSnapshot/required',
            keyword: 'required',
            params: { missingProperty: 'interpretation' },
            message: "must have required property '" + 'interpretation' + "'",
          };
          if (vErrors === null) {
            vErrors = [err36];
          } else {
            vErrors.push(err36);
          }
          errors++;
        }
        if (data20.revision === undefined) {
          const err37 = {
            instancePath: instancePath + '/content',
            schemaPath: '#/components/schemas/ContentSnapshot/required',
            keyword: 'required',
            params: { missingProperty: 'revision' },
            message: "must have required property '" + 'revision' + "'",
          };
          if (vErrors === null) {
            vErrors = [err37];
          } else {
            vErrors.push(err37);
          }
          errors++;
        }
        if (data20.versionRef === undefined) {
          const err38 = {
            instancePath: instancePath + '/content',
            schemaPath: '#/components/schemas/ContentSnapshot/required',
            keyword: 'required',
            params: { missingProperty: 'versionRef' },
            message: "must have required property '" + 'versionRef' + "'",
          };
          if (vErrors === null) {
            vErrors = [err38];
          } else {
            vErrors.push(err38);
          }
          errors++;
        }
        if (data20.id !== undefined) {
          let data21 = data20.id;
          if (typeof data21 === 'string') {
            if (!formats0.test(data21)) {
              const err39 = {
                instancePath: instancePath + '/content/id',
                schemaPath:
                  '#/components/schemas/ContentSnapshot/properties/id/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
              };
              if (vErrors === null) {
                vErrors = [err39];
              } else {
                vErrors.push(err39);
              }
              errors++;
            }
          } else {
            const err40 = {
              instancePath: instancePath + '/content/id',
              schemaPath:
                '#/components/schemas/ContentSnapshot/properties/id/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err40];
            } else {
              vErrors.push(err40);
            }
            errors++;
          }
        }
        if (data20.format !== undefined) {
          if (typeof data20.format !== 'string') {
            const err41 = {
              instancePath: instancePath + '/content/format',
              schemaPath:
                '#/components/schemas/ContentSnapshot/properties/format/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err41];
            } else {
              vErrors.push(err41);
            }
            errors++;
          }
        }
        if (data20.content !== undefined) {
          if (typeof data20.content !== 'string') {
            const err42 = {
              instancePath: instancePath + '/content/content',
              schemaPath:
                '#/components/schemas/ContentSnapshot/properties/content/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err42];
            } else {
              vErrors.push(err42);
            }
            errors++;
          }
        }
        if (data20.revision !== undefined) {
          let data24 = data20.revision;
          if (!(typeof data24 == 'number' && !(data24 % 1) && !isNaN(data24))) {
            const err43 = {
              instancePath: instancePath + '/content/revision',
              schemaPath:
                '#/components/schemas/ContentSnapshot/properties/revision/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err43];
            } else {
              vErrors.push(err43);
            }
            errors++;
          }
        }
        if (data20.contentType !== undefined) {
          if (typeof data20.contentType !== 'string') {
            const err44 = {
              instancePath: instancePath + '/content/contentType',
              schemaPath:
                '#/components/schemas/ContentSnapshot/properties/contentType/type',
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
        }
        if (data20.versionRef !== undefined) {
          let data26 = data20.versionRef;
          if (typeof data26 !== 'string' && data26 !== null) {
            const err45 = {
              instancePath: instancePath + '/content/versionRef',
              schemaPath:
                '#/components/schemas/ContentSnapshot/properties/versionRef/type',
              keyword: 'type',
              params: { type: schema119.properties.versionRef.type },
              message: 'must be string,null',
            };
            if (vErrors === null) {
              vErrors = [err45];
            } else {
              vErrors.push(err45);
            }
            errors++;
          }
        }
        if (data20.interpretation !== undefined) {
          let data27 = data20.interpretation;
          if (data27 && typeof data27 == 'object' && !Array.isArray(data27)) {
          } else {
            const err46 = {
              instancePath: instancePath + '/content/interpretation',
              schemaPath:
                '#/components/schemas/ContentSnapshot/properties/interpretation/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
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
          instancePath: instancePath + '/content',
          schemaPath: '#/components/schemas/ContentSnapshot/type',
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
      var _valid1 = _errs49 === errors;
      valid9 = valid9 || _valid1;
      if (_valid1) {
        var props1 = {};
        props1.id = true;
        props1.format = true;
        props1.content = true;
        props1.revision = true;
        props1.contentType = true;
        props1.versionRef = true;
        props1.interpretation = true;
      }
      const _errs67 = errors;
      if (data20 !== null) {
        const err48 = {
          instancePath: instancePath + '/content',
          schemaPath: '#/properties/content/anyOf/1/type',
          keyword: 'type',
          params: { type: 'null' },
          message: 'must be null',
        };
        if (vErrors === null) {
          vErrors = [err48];
        } else {
          vErrors.push(err48);
        }
        errors++;
      }
      var _valid1 = _errs67 === errors;
      valid9 = valid9 || _valid1;
      if (!valid9) {
        const err49 = {
          instancePath: instancePath + '/content',
          schemaPath: '#/properties/content/anyOf',
          keyword: 'anyOf',
          params: {},
          message: 'must match a schema in anyOf',
        };
        if (vErrors === null) {
          vErrors = [err49];
        } else {
          vErrors.push(err49);
        }
        errors++;
      } else {
        errors = _errs48;
        if (vErrors !== null) {
          if (_errs48) {
            vErrors.length = _errs48;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.etag !== undefined) {
      let data28 = data.etag;
      if (typeof data28 !== 'string' && data28 !== null) {
        const err50 = {
          instancePath: instancePath + '/etag',
          schemaPath: '#/properties/etag/type',
          keyword: 'type',
          params: { type: schema573.properties.etag.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err50];
        } else {
          vErrors.push(err50);
        }
        errors++;
      }
    }
  } else {
    const err51 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err51];
    } else {
      vErrors.push(err51);
    }
    errors++;
  }
  validate478.errors = vErrors;
  return errors === 0;
}
validate478.evaluated = {
  props: { id: true, status: true, page: true, content: true, etag: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate477(
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
  const evaluated0 = validate477.evaluated;
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
            !validate478(data0[i0], {
              instancePath: instancePath + '/items/' + i0,
              parentData: data0,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors =
              vErrors === null
                ? validate478.errors
                : vErrors.concat(validate478.errors);
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
  } else {
    const err1 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err1];
    } else {
      vErrors.push(err1);
    }
    errors++;
  }
  validate477.errors = vErrors;
  return errors === 0;
}
validate477.evaluated = {
  props: { items: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate476(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/batchGetPagesOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate476.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate477(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate477.errors
        : vErrors.concat(validate477.errors);
    errors = vErrors.length;
  }
  validate476.errors = vErrors;
  return errors === 0;
}
validate476.evaluated = {
  props: { items: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const batchGetPagesOutputFull = validate481;
const schema576 = {
  $ref: 'https://edition.invalid/control#/components/schemas/BatchPageResponse',
  $id: 'https://edition.invalid/validators/batchGetPagesOutputFull',
};
function validate482(
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
  const evaluated0 = validate482.evaluated;
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
            !validate478(data0[i0], {
              instancePath: instancePath + '/items/' + i0,
              parentData: data0,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors =
              vErrors === null
                ? validate478.errors
                : vErrors.concat(validate478.errors);
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
  } else {
    const err1 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err1];
    } else {
      vErrors.push(err1);
    }
    errors++;
  }
  validate482.errors = vErrors;
  return errors === 0;
}
validate482.evaluated = {
  props: { items: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate481(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/batchGetPagesOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate481.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate482(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate482.errors
        : vErrors.concat(validate482.errors);
    errors = vErrors.length;
  }
  validate481.errors = vErrors;
  return errors === 0;
}
validate481.evaluated = {
  props: { items: true },
  dynamicProps: false,
  dynamicItems: false,
};
