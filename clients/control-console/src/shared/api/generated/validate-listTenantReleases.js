// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const listTenantReleasesInput = validate1337;
const schema1490 = {
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
        spaceId: { type: 'string', format: 'uuid' },
        mode: { type: 'string', pattern: 'authored|synced' },
        status: {
          type: 'string',
          pattern: 'draft|flagged|validated|live|archived',
        },
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
  $id: 'https://edition.invalid/validators/listTenantReleasesInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const pattern42 = new RegExp('authored|synced', 'u');
const pattern122 = new RegExp('draft|flagged|validated|live|archived', 'u');
const func1 = ucs2Length;
function validate1337(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listTenantReleasesInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1337.evaluated;
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
        if (data2.spaceId !== undefined) {
          let data3 = data2.spaceId;
          if (typeof data3 === 'string') {
            if (!formats0.test(data3)) {
              const err5 = {
                instancePath: instancePath + '/query/spaceId',
                schemaPath: '#/properties/query/properties/spaceId/format',
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
              instancePath: instancePath + '/query/spaceId',
              schemaPath: '#/properties/query/properties/spaceId/type',
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
        if (data2.mode !== undefined) {
          let data4 = data2.mode;
          if (typeof data4 === 'string') {
            if (!pattern42.test(data4)) {
              const err7 = {
                instancePath: instancePath + '/query/mode',
                schemaPath: '#/properties/query/properties/mode/pattern',
                keyword: 'pattern',
                params: { pattern: 'authored|synced' },
                message: 'must match pattern "' + 'authored|synced' + '"',
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
              instancePath: instancePath + '/query/mode',
              schemaPath: '#/properties/query/properties/mode/type',
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
        if (data2.status !== undefined) {
          let data5 = data2.status;
          if (typeof data5 === 'string') {
            if (!pattern122.test(data5)) {
              const err9 = {
                instancePath: instancePath + '/query/status',
                schemaPath: '#/properties/query/properties/status/pattern',
                keyword: 'pattern',
                params: { pattern: 'draft|flagged|validated|live|archived' },
                message:
                  'must match pattern "' +
                  'draft|flagged|validated|live|archived' +
                  '"',
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
        if (data2.cursor !== undefined) {
          if (typeof data2.cursor !== 'string') {
            const err11 = {
              instancePath: instancePath + '/query/cursor',
              schemaPath: '#/properties/query/properties/cursor/type',
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
        if (data2.limit !== undefined) {
          let data7 = data2.limit;
          if (!(typeof data7 == 'number' && !(data7 % 1) && !isNaN(data7))) {
            const err12 = {
              instancePath: instancePath + '/query/limit',
              schemaPath: '#/properties/query/properties/limit/type',
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
          if (typeof data7 == 'number') {
            if (data7 > 100 || isNaN(data7)) {
              const err13 = {
                instancePath: instancePath + '/query/limit',
                schemaPath: '#/properties/query/properties/limit/maximum',
                keyword: 'maximum',
                params: { comparison: '<=', limit: 100 },
                message: 'must be <= 100',
              };
              if (vErrors === null) {
                vErrors = [err13];
              } else {
                vErrors.push(err13);
              }
              errors++;
            }
            if (data7 < 1 || isNaN(data7)) {
              const err14 = {
                instancePath: instancePath + '/query/limit',
                schemaPath: '#/properties/query/properties/limit/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
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
  validate1337.errors = vErrors;
  return errors === 0;
}
validate1337.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const listTenantReleasesOutput = validate1338;
const schema1491 = {
  anyOf: [
    {
      $ref: 'https://edition.invalid/control#/components/schemas/TenantReleasePage',
    },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialTenantReleasePage',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/listTenantReleasesOutput',
};
const schema1492 = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { $ref: '#/components/schemas/TenantReleaseSummary' },
    },
    nextCursor: { type: 'string' },
    total: { type: 'integer', format: 'int64' },
    spaces: {
      type: 'array',
      items: { $ref: '#/components/schemas/ReleaseSpaceChoice' },
    },
  },
};
const schema1495 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    mode: { type: 'string' },
    status: { type: 'string' },
  },
};
const schema1493 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    label: { type: 'string' },
    status: {
      type: 'string',
      enum: ['draft', 'flagged', 'validated', 'live', 'archived'],
    },
    source: { $ref: '#/components/schemas/ReleaseSource' },
    pageCount: { type: 'integer', format: 'int32' },
    createdAt: { type: 'string', format: 'date-time' },
    promotedAt: { type: 'string', format: 'date-time' },
    allowedActions: {
      type: 'array',
      items: { type: 'string' },
      uniqueItems: true,
    },
    spaceId: { type: 'string', format: 'uuid' },
    spaceName: { type: 'string' },
    spaceMode: { type: 'string' },
    spaceStatus: { type: 'string' },
  },
};
const schema478 = {
  type: 'object',
  properties: {
    kind: { type: 'string' },
    ref: { type: 'string' },
    actor: { type: 'string', format: 'uuid' },
  },
};
const formats10 = fullFormats['date-time'];
function validate1340(
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
  const evaluated0 = validate1340.evaluated;
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
    if (data.label !== undefined) {
      if (typeof data.label !== 'string') {
        const err2 = {
          instancePath: instancePath + '/label',
          schemaPath: '#/properties/label/type',
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
    if (data.status !== undefined) {
      let data2 = data.status;
      if (typeof data2 !== 'string') {
        const err3 = {
          instancePath: instancePath + '/status',
          schemaPath: '#/properties/status/type',
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
      if (!(
        data2 === 'draft' ||
        data2 === 'flagged' ||
        data2 === 'validated' ||
        data2 === 'live' ||
        data2 === 'archived'
      )) {
        const err4 = {
          instancePath: instancePath + '/status',
          schemaPath: '#/properties/status/enum',
          keyword: 'enum',
          params: { allowedValues: schema1493.properties.status.enum },
          message: 'must be equal to one of the allowed values',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.source !== undefined) {
      let data3 = data.source;
      if (data3 && typeof data3 == 'object' && !Array.isArray(data3)) {
        if (data3.kind !== undefined) {
          if (typeof data3.kind !== 'string') {
            const err5 = {
              instancePath: instancePath + '/source/kind',
              schemaPath:
                '#/components/schemas/ReleaseSource/properties/kind/type',
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
        if (data3.ref !== undefined) {
          if (typeof data3.ref !== 'string') {
            const err6 = {
              instancePath: instancePath + '/source/ref',
              schemaPath:
                '#/components/schemas/ReleaseSource/properties/ref/type',
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
        if (data3.actor !== undefined) {
          let data6 = data3.actor;
          if (typeof data6 === 'string') {
            if (!formats0.test(data6)) {
              const err7 = {
                instancePath: instancePath + '/source/actor',
                schemaPath:
                  '#/components/schemas/ReleaseSource/properties/actor/format',
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
              instancePath: instancePath + '/source/actor',
              schemaPath:
                '#/components/schemas/ReleaseSource/properties/actor/type',
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
      } else {
        const err9 = {
          instancePath: instancePath + '/source',
          schemaPath: '#/components/schemas/ReleaseSource/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.pageCount !== undefined) {
      let data7 = data.pageCount;
      if (!(typeof data7 == 'number' && !(data7 % 1) && !isNaN(data7))) {
        const err10 = {
          instancePath: instancePath + '/pageCount',
          schemaPath: '#/properties/pageCount/type',
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
    if (data.createdAt !== undefined) {
      let data8 = data.createdAt;
      if (typeof data8 === 'string') {
        if (!formats10.validate(data8)) {
          const err11 = {
            instancePath: instancePath + '/createdAt',
            schemaPath: '#/properties/createdAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
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
          instancePath: instancePath + '/createdAt',
          schemaPath: '#/properties/createdAt/type',
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
    if (data.promotedAt !== undefined) {
      let data9 = data.promotedAt;
      if (typeof data9 === 'string') {
        if (!formats10.validate(data9)) {
          const err13 = {
            instancePath: instancePath + '/promotedAt',
            schemaPath: '#/properties/promotedAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
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
          instancePath: instancePath + '/promotedAt',
          schemaPath: '#/properties/promotedAt/type',
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
    if (data.allowedActions !== undefined) {
      let data10 = data.allowedActions;
      if (Array.isArray(data10)) {
        const len0 = data10.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (typeof data10[i0] !== 'string') {
            const err15 = {
              instancePath: instancePath + '/allowedActions/' + i0,
              schemaPath: '#/properties/allowedActions/items/type',
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
              const err16 = {
                instancePath: instancePath + '/allowedActions',
                schemaPath: '#/properties/allowedActions/uniqueItems',
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
                vErrors = [err16];
              } else {
                vErrors.push(err16);
              }
              errors++;
              break;
            }
            indices0[item0] = i1;
          }
        }
      } else {
        const err17 = {
          instancePath: instancePath + '/allowedActions',
          schemaPath: '#/properties/allowedActions/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err17];
        } else {
          vErrors.push(err17);
        }
        errors++;
      }
    }
    if (data.spaceId !== undefined) {
      let data12 = data.spaceId;
      if (typeof data12 === 'string') {
        if (!formats0.test(data12)) {
          const err18 = {
            instancePath: instancePath + '/spaceId',
            schemaPath: '#/properties/spaceId/format',
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
          instancePath: instancePath + '/spaceId',
          schemaPath: '#/properties/spaceId/type',
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
    if (data.spaceName !== undefined) {
      if (typeof data.spaceName !== 'string') {
        const err20 = {
          instancePath: instancePath + '/spaceName',
          schemaPath: '#/properties/spaceName/type',
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
    if (data.spaceMode !== undefined) {
      if (typeof data.spaceMode !== 'string') {
        const err21 = {
          instancePath: instancePath + '/spaceMode',
          schemaPath: '#/properties/spaceMode/type',
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
    if (data.spaceStatus !== undefined) {
      if (typeof data.spaceStatus !== 'string') {
        const err22 = {
          instancePath: instancePath + '/spaceStatus',
          schemaPath: '#/properties/spaceStatus/type',
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
  } else {
    const err23 = {
      instancePath,
      schemaPath: '#/type',
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
  validate1340.errors = vErrors;
  return errors === 0;
}
validate1340.evaluated = {
  props: {
    id: true,
    label: true,
    status: true,
    source: true,
    pageCount: true,
    createdAt: true,
    promotedAt: true,
    allowedActions: true,
    spaceId: true,
    spaceName: true,
    spaceMode: true,
    spaceStatus: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1339(
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
  const evaluated0 = validate1339.evaluated;
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
            !validate1340(data0[i0], {
              instancePath: instancePath + '/items/' + i0,
              parentData: data0,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors =
              vErrors === null
                ? validate1340.errors
                : vErrors.concat(validate1340.errors);
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
      if (typeof data.nextCursor !== 'string') {
        const err1 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
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
    if (data.total !== undefined) {
      let data3 = data.total;
      if (!(typeof data3 == 'number' && !(data3 % 1) && !isNaN(data3))) {
        const err2 = {
          instancePath: instancePath + '/total',
          schemaPath: '#/properties/total/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.spaces !== undefined) {
      let data4 = data.spaces;
      if (Array.isArray(data4)) {
        const len1 = data4.length;
        for (let i1 = 0; i1 < len1; i1++) {
          let data5 = data4[i1];
          if (data5 && typeof data5 == 'object' && !Array.isArray(data5)) {
            if (data5.id !== undefined) {
              let data6 = data5.id;
              if (typeof data6 === 'string') {
                if (!formats0.test(data6)) {
                  const err3 = {
                    instancePath: instancePath + '/spaces/' + i1 + '/id',
                    schemaPath:
                      '#/components/schemas/ReleaseSpaceChoice/properties/id/format',
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
                  instancePath: instancePath + '/spaces/' + i1 + '/id',
                  schemaPath:
                    '#/components/schemas/ReleaseSpaceChoice/properties/id/type',
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
            if (data5.name !== undefined) {
              if (typeof data5.name !== 'string') {
                const err5 = {
                  instancePath: instancePath + '/spaces/' + i1 + '/name',
                  schemaPath:
                    '#/components/schemas/ReleaseSpaceChoice/properties/name/type',
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
            if (data5.mode !== undefined) {
              if (typeof data5.mode !== 'string') {
                const err6 = {
                  instancePath: instancePath + '/spaces/' + i1 + '/mode',
                  schemaPath:
                    '#/components/schemas/ReleaseSpaceChoice/properties/mode/type',
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
            if (data5.status !== undefined) {
              if (typeof data5.status !== 'string') {
                const err7 = {
                  instancePath: instancePath + '/spaces/' + i1 + '/status',
                  schemaPath:
                    '#/components/schemas/ReleaseSpaceChoice/properties/status/type',
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
              instancePath: instancePath + '/spaces/' + i1,
              schemaPath: '#/components/schemas/ReleaseSpaceChoice/type',
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
      } else {
        const err9 = {
          instancePath: instancePath + '/spaces',
          schemaPath: '#/properties/spaces/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
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
      instancePath,
      schemaPath: '#/type',
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
  validate1339.errors = vErrors;
  return errors === 0;
}
validate1339.evaluated = {
  props: { items: true, nextCursor: true, total: true, spaces: true },
  dynamicProps: false,
  dynamicItems: false,
};
const schema1496 = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialTenantReleaseSummary' },
    },
    nextCursor: { type: 'string' },
    total: { type: 'integer', format: 'int64' },
    spaces: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialReleaseSpaceChoice' },
    },
  },
};
const schema1499 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    mode: { type: 'string' },
    status: { type: 'string' },
  },
};
const schema1497 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    label: { type: 'string' },
    status: {
      type: 'string',
      enum: ['draft', 'flagged', 'validated', 'live', 'archived'],
    },
    source: { $ref: '#/components/schemas/PartialReleaseSource' },
    pageCount: { type: 'integer', format: 'int32' },
    createdAt: { type: 'string', format: 'date-time' },
    promotedAt: { type: 'string', format: 'date-time' },
    allowedActions: {
      type: 'array',
      items: { type: 'string' },
      uniqueItems: true,
    },
    spaceId: { type: 'string', format: 'uuid' },
    spaceName: { type: 'string' },
    spaceMode: { type: 'string' },
    spaceStatus: { type: 'string' },
  },
};
const schema961 = {
  type: 'object',
  properties: {
    kind: { type: 'string' },
    ref: { type: 'string' },
    actor: { type: 'string', format: 'uuid' },
  },
};
function validate1344(
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
  const evaluated0 = validate1344.evaluated;
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
    if (data.label !== undefined) {
      if (typeof data.label !== 'string') {
        const err2 = {
          instancePath: instancePath + '/label',
          schemaPath: '#/properties/label/type',
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
    if (data.status !== undefined) {
      let data2 = data.status;
      if (typeof data2 !== 'string') {
        const err3 = {
          instancePath: instancePath + '/status',
          schemaPath: '#/properties/status/type',
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
      if (!(
        data2 === 'draft' ||
        data2 === 'flagged' ||
        data2 === 'validated' ||
        data2 === 'live' ||
        data2 === 'archived'
      )) {
        const err4 = {
          instancePath: instancePath + '/status',
          schemaPath: '#/properties/status/enum',
          keyword: 'enum',
          params: { allowedValues: schema1497.properties.status.enum },
          message: 'must be equal to one of the allowed values',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.source !== undefined) {
      let data3 = data.source;
      if (data3 && typeof data3 == 'object' && !Array.isArray(data3)) {
        if (data3.kind !== undefined) {
          if (typeof data3.kind !== 'string') {
            const err5 = {
              instancePath: instancePath + '/source/kind',
              schemaPath:
                '#/components/schemas/PartialReleaseSource/properties/kind/type',
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
        if (data3.ref !== undefined) {
          if (typeof data3.ref !== 'string') {
            const err6 = {
              instancePath: instancePath + '/source/ref',
              schemaPath:
                '#/components/schemas/PartialReleaseSource/properties/ref/type',
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
        if (data3.actor !== undefined) {
          let data6 = data3.actor;
          if (typeof data6 === 'string') {
            if (!formats0.test(data6)) {
              const err7 = {
                instancePath: instancePath + '/source/actor',
                schemaPath:
                  '#/components/schemas/PartialReleaseSource/properties/actor/format',
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
              instancePath: instancePath + '/source/actor',
              schemaPath:
                '#/components/schemas/PartialReleaseSource/properties/actor/type',
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
      } else {
        const err9 = {
          instancePath: instancePath + '/source',
          schemaPath: '#/components/schemas/PartialReleaseSource/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.pageCount !== undefined) {
      let data7 = data.pageCount;
      if (!(typeof data7 == 'number' && !(data7 % 1) && !isNaN(data7))) {
        const err10 = {
          instancePath: instancePath + '/pageCount',
          schemaPath: '#/properties/pageCount/type',
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
    if (data.createdAt !== undefined) {
      let data8 = data.createdAt;
      if (typeof data8 === 'string') {
        if (!formats10.validate(data8)) {
          const err11 = {
            instancePath: instancePath + '/createdAt',
            schemaPath: '#/properties/createdAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
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
          instancePath: instancePath + '/createdAt',
          schemaPath: '#/properties/createdAt/type',
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
    if (data.promotedAt !== undefined) {
      let data9 = data.promotedAt;
      if (typeof data9 === 'string') {
        if (!formats10.validate(data9)) {
          const err13 = {
            instancePath: instancePath + '/promotedAt',
            schemaPath: '#/properties/promotedAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
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
          instancePath: instancePath + '/promotedAt',
          schemaPath: '#/properties/promotedAt/type',
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
    if (data.allowedActions !== undefined) {
      let data10 = data.allowedActions;
      if (Array.isArray(data10)) {
        const len0 = data10.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (typeof data10[i0] !== 'string') {
            const err15 = {
              instancePath: instancePath + '/allowedActions/' + i0,
              schemaPath: '#/properties/allowedActions/items/type',
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
              const err16 = {
                instancePath: instancePath + '/allowedActions',
                schemaPath: '#/properties/allowedActions/uniqueItems',
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
                vErrors = [err16];
              } else {
                vErrors.push(err16);
              }
              errors++;
              break;
            }
            indices0[item0] = i1;
          }
        }
      } else {
        const err17 = {
          instancePath: instancePath + '/allowedActions',
          schemaPath: '#/properties/allowedActions/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err17];
        } else {
          vErrors.push(err17);
        }
        errors++;
      }
    }
    if (data.spaceId !== undefined) {
      let data12 = data.spaceId;
      if (typeof data12 === 'string') {
        if (!formats0.test(data12)) {
          const err18 = {
            instancePath: instancePath + '/spaceId',
            schemaPath: '#/properties/spaceId/format',
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
          instancePath: instancePath + '/spaceId',
          schemaPath: '#/properties/spaceId/type',
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
    if (data.spaceName !== undefined) {
      if (typeof data.spaceName !== 'string') {
        const err20 = {
          instancePath: instancePath + '/spaceName',
          schemaPath: '#/properties/spaceName/type',
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
    if (data.spaceMode !== undefined) {
      if (typeof data.spaceMode !== 'string') {
        const err21 = {
          instancePath: instancePath + '/spaceMode',
          schemaPath: '#/properties/spaceMode/type',
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
    if (data.spaceStatus !== undefined) {
      if (typeof data.spaceStatus !== 'string') {
        const err22 = {
          instancePath: instancePath + '/spaceStatus',
          schemaPath: '#/properties/spaceStatus/type',
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
  } else {
    const err23 = {
      instancePath,
      schemaPath: '#/type',
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
  validate1344.errors = vErrors;
  return errors === 0;
}
validate1344.evaluated = {
  props: {
    id: true,
    label: true,
    status: true,
    source: true,
    pageCount: true,
    createdAt: true,
    promotedAt: true,
    allowedActions: true,
    spaceId: true,
    spaceName: true,
    spaceMode: true,
    spaceStatus: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1343(
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
  const evaluated0 = validate1343.evaluated;
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
            !validate1344(data0[i0], {
              instancePath: instancePath + '/items/' + i0,
              parentData: data0,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors =
              vErrors === null
                ? validate1344.errors
                : vErrors.concat(validate1344.errors);
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
      if (typeof data.nextCursor !== 'string') {
        const err1 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
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
    if (data.total !== undefined) {
      let data3 = data.total;
      if (!(typeof data3 == 'number' && !(data3 % 1) && !isNaN(data3))) {
        const err2 = {
          instancePath: instancePath + '/total',
          schemaPath: '#/properties/total/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.spaces !== undefined) {
      let data4 = data.spaces;
      if (Array.isArray(data4)) {
        const len1 = data4.length;
        for (let i1 = 0; i1 < len1; i1++) {
          let data5 = data4[i1];
          if (data5 && typeof data5 == 'object' && !Array.isArray(data5)) {
            if (data5.id !== undefined) {
              let data6 = data5.id;
              if (typeof data6 === 'string') {
                if (!formats0.test(data6)) {
                  const err3 = {
                    instancePath: instancePath + '/spaces/' + i1 + '/id',
                    schemaPath:
                      '#/components/schemas/PartialReleaseSpaceChoice/properties/id/format',
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
                  instancePath: instancePath + '/spaces/' + i1 + '/id',
                  schemaPath:
                    '#/components/schemas/PartialReleaseSpaceChoice/properties/id/type',
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
            if (data5.name !== undefined) {
              if (typeof data5.name !== 'string') {
                const err5 = {
                  instancePath: instancePath + '/spaces/' + i1 + '/name',
                  schemaPath:
                    '#/components/schemas/PartialReleaseSpaceChoice/properties/name/type',
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
            if (data5.mode !== undefined) {
              if (typeof data5.mode !== 'string') {
                const err6 = {
                  instancePath: instancePath + '/spaces/' + i1 + '/mode',
                  schemaPath:
                    '#/components/schemas/PartialReleaseSpaceChoice/properties/mode/type',
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
            if (data5.status !== undefined) {
              if (typeof data5.status !== 'string') {
                const err7 = {
                  instancePath: instancePath + '/spaces/' + i1 + '/status',
                  schemaPath:
                    '#/components/schemas/PartialReleaseSpaceChoice/properties/status/type',
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
              instancePath: instancePath + '/spaces/' + i1,
              schemaPath: '#/components/schemas/PartialReleaseSpaceChoice/type',
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
      } else {
        const err9 = {
          instancePath: instancePath + '/spaces',
          schemaPath: '#/properties/spaces/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
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
      instancePath,
      schemaPath: '#/type',
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
  validate1343.errors = vErrors;
  return errors === 0;
}
validate1343.evaluated = {
  props: { items: true, nextCursor: true, total: true, spaces: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1338(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listTenantReleasesOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1338.evaluated;
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
    !validate1339(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1339.errors
        : vErrors.concat(validate1339.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = {};
    props0.items = true;
    props0.nextCursor = true;
    props0.total = true;
    props0.spaces = true;
  }
  const _errs2 = errors;
  if (
    !validate1343(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1343.errors
        : vErrors.concat(validate1343.errors);
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
      props0.spaces = true;
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
  validate1338.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate1338.evaluated = { dynamicProps: true, dynamicItems: false };
export const listTenantReleasesOutputFull = validate1347;
const schema1500 = {
  $ref: 'https://edition.invalid/control#/components/schemas/TenantReleasePage',
  $id: 'https://edition.invalid/validators/listTenantReleasesOutputFull',
};
function validate1348(
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
  const evaluated0 = validate1348.evaluated;
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
            !validate1340(data0[i0], {
              instancePath: instancePath + '/items/' + i0,
              parentData: data0,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors =
              vErrors === null
                ? validate1340.errors
                : vErrors.concat(validate1340.errors);
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
      if (typeof data.nextCursor !== 'string') {
        const err1 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
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
    if (data.total !== undefined) {
      let data3 = data.total;
      if (!(typeof data3 == 'number' && !(data3 % 1) && !isNaN(data3))) {
        const err2 = {
          instancePath: instancePath + '/total',
          schemaPath: '#/properties/total/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.spaces !== undefined) {
      let data4 = data.spaces;
      if (Array.isArray(data4)) {
        const len1 = data4.length;
        for (let i1 = 0; i1 < len1; i1++) {
          let data5 = data4[i1];
          if (data5 && typeof data5 == 'object' && !Array.isArray(data5)) {
            if (data5.id !== undefined) {
              let data6 = data5.id;
              if (typeof data6 === 'string') {
                if (!formats0.test(data6)) {
                  const err3 = {
                    instancePath: instancePath + '/spaces/' + i1 + '/id',
                    schemaPath:
                      '#/components/schemas/ReleaseSpaceChoice/properties/id/format',
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
                  instancePath: instancePath + '/spaces/' + i1 + '/id',
                  schemaPath:
                    '#/components/schemas/ReleaseSpaceChoice/properties/id/type',
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
            if (data5.name !== undefined) {
              if (typeof data5.name !== 'string') {
                const err5 = {
                  instancePath: instancePath + '/spaces/' + i1 + '/name',
                  schemaPath:
                    '#/components/schemas/ReleaseSpaceChoice/properties/name/type',
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
            if (data5.mode !== undefined) {
              if (typeof data5.mode !== 'string') {
                const err6 = {
                  instancePath: instancePath + '/spaces/' + i1 + '/mode',
                  schemaPath:
                    '#/components/schemas/ReleaseSpaceChoice/properties/mode/type',
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
            if (data5.status !== undefined) {
              if (typeof data5.status !== 'string') {
                const err7 = {
                  instancePath: instancePath + '/spaces/' + i1 + '/status',
                  schemaPath:
                    '#/components/schemas/ReleaseSpaceChoice/properties/status/type',
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
              instancePath: instancePath + '/spaces/' + i1,
              schemaPath: '#/components/schemas/ReleaseSpaceChoice/type',
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
      } else {
        const err9 = {
          instancePath: instancePath + '/spaces',
          schemaPath: '#/properties/spaces/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
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
      instancePath,
      schemaPath: '#/type',
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
  validate1348.errors = vErrors;
  return errors === 0;
}
validate1348.evaluated = {
  props: { items: true, nextCursor: true, total: true, spaces: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1347(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listTenantReleasesOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1347.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate1348(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1348.errors
        : vErrors.concat(validate1348.errors);
    errors = vErrors.length;
  }
  validate1347.errors = vErrors;
  return errors === 0;
}
validate1347.evaluated = {
  props: { items: true, nextCursor: true, total: true, spaces: true },
  dynamicProps: false,
  dynamicItems: false,
};
