// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const convertSpaceInput = validate327;
const schema433 = {
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
      $ref: 'https://edition.invalid/control#/components/schemas/ConvertSpaceRequest',
    },
  },
  required: ['path', 'header', 'body'],
  $id: 'https://edition.invalid/validators/convertSpaceInput',
};
const schema434 = {
  type: 'object',
  properties: {
    mode: { type: 'string', minLength: 1, pattern: 'authored|synced' },
  },
  required: ['mode'],
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
const pattern4 = new RegExp('^[a-zA-Z0-9._:-]+$', 'u');
const pattern42 = new RegExp('authored|synced', 'u');
function validate327(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/convertSpaceInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate327.evaluated;
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
    if (data.path !== undefined) {
      let data0 = data.path;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.tenantId === undefined) {
          const err3 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
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
        if (data0.spaceId === undefined) {
          const err4 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'spaceId' },
            message: "must have required property '" + 'spaceId' + "'",
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
        if (data0.tenantId !== undefined) {
          let data1 = data0.tenantId;
          if (typeof data1 === 'string') {
            if (!formats0.test(data1)) {
              const err5 = {
                instancePath: instancePath + '/path/tenantId',
                schemaPath: '#/properties/path/properties/tenantId/format',
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
              instancePath: instancePath + '/path/tenantId',
              schemaPath: '#/properties/path/properties/tenantId/type',
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
        if (data0.spaceId !== undefined) {
          let data2 = data0.spaceId;
          if (typeof data2 === 'string') {
            if (!formats0.test(data2)) {
              const err7 = {
                instancePath: instancePath + '/path/spaceId',
                schemaPath: '#/properties/path/properties/spaceId/format',
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
              instancePath: instancePath + '/path/spaceId',
              schemaPath: '#/properties/path/properties/spaceId/type',
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
          instancePath: instancePath + '/path',
          schemaPath: '#/properties/path/type',
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
    if (data.header !== undefined) {
      let data3 = data.header;
      if (data3 && typeof data3 == 'object' && !Array.isArray(data3)) {
        if (data3['Idempotency-Key'] === undefined) {
          const err10 = {
            instancePath: instancePath + '/header',
            schemaPath: '#/properties/header/required',
            keyword: 'required',
            params: { missingProperty: 'Idempotency-Key' },
            message: "must have required property '" + 'Idempotency-Key' + "'",
          };
          if (vErrors === null) {
            vErrors = [err10];
          } else {
            vErrors.push(err10);
          }
          errors++;
        }
        if (data3['Idempotency-Key'] !== undefined) {
          let data4 = data3['Idempotency-Key'];
          if (typeof data4 === 'string') {
            if (func1(data4) > 128) {
              const err11 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/maxLength',
                keyword: 'maxLength',
                params: { limit: 128 },
                message: 'must NOT have more than 128 characters',
              };
              if (vErrors === null) {
                vErrors = [err11];
              } else {
                vErrors.push(err11);
              }
              errors++;
            }
            if (func1(data4) < 1) {
              const err12 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
              };
              if (vErrors === null) {
                vErrors = [err12];
              } else {
                vErrors.push(err12);
              }
              errors++;
            }
            if (!pattern4.test(data4)) {
              const err13 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/pattern',
                keyword: 'pattern',
                params: { pattern: '^[a-zA-Z0-9._:-]+$' },
                message: 'must match pattern "' + '^[a-zA-Z0-9._:-]+$' + '"',
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
              instancePath: instancePath + '/header/Idempotency-Key',
              schemaPath: '#/properties/header/properties/Idempotency-Key/type',
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
          instancePath: instancePath + '/header',
          schemaPath: '#/properties/header/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err15];
        } else {
          vErrors.push(err15);
        }
        errors++;
      }
    }
    if (data.body !== undefined) {
      let data5 = data.body;
      if (data5 && typeof data5 == 'object' && !Array.isArray(data5)) {
        if (data5.mode === undefined) {
          const err16 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/ConvertSpaceRequest/required',
            keyword: 'required',
            params: { missingProperty: 'mode' },
            message: "must have required property '" + 'mode' + "'",
          };
          if (vErrors === null) {
            vErrors = [err16];
          } else {
            vErrors.push(err16);
          }
          errors++;
        }
        if (data5.mode !== undefined) {
          let data6 = data5.mode;
          if (typeof data6 === 'string') {
            if (func1(data6) < 1) {
              const err17 = {
                instancePath: instancePath + '/body/mode',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/ConvertSpaceRequest/properties/mode/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
              };
              if (vErrors === null) {
                vErrors = [err17];
              } else {
                vErrors.push(err17);
              }
              errors++;
            }
            if (!pattern42.test(data6)) {
              const err18 = {
                instancePath: instancePath + '/body/mode',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/ConvertSpaceRequest/properties/mode/pattern',
                keyword: 'pattern',
                params: { pattern: 'authored|synced' },
                message: 'must match pattern "' + 'authored|synced' + '"',
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
              instancePath: instancePath + '/body/mode',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/ConvertSpaceRequest/properties/mode/type',
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
      } else {
        const err20 = {
          instancePath: instancePath + '/body',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ConvertSpaceRequest/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
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
  validate327.errors = vErrors;
  return errors === 0;
}
validate327.evaluated = {
  props: { path: true, header: true, body: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const convertSpaceOutput = validate328;
const schema435 = {
  $ref: 'https://edition.invalid/control#/components/schemas/SpaceDetail',
  $id: 'https://edition.invalid/validators/convertSpaceOutput',
};
const schema41 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    tenantId: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    icon: {
      type: ['string', 'null'],
      enum: ['book', 'code', 'api', 'guide', 'reference', null],
    },
    description: { type: ['string', 'null'] },
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
    collectionPath: { type: 'array', items: { type: 'string' } },
    mounts: {
      type: 'array',
      items: { $ref: '#/components/schemas/SpaceMount' },
    },
    retention: { type: 'integer', format: 'int32' },
    autoRelease: { type: ['boolean', 'null'] },
  },
  required: [
    'allowedActions',
    'autoRelease',
    'collectionId',
    'collectionPath',
    'createdAt',
    'createdBy',
    'description',
    'driftCount',
    'icon',
    'id',
    'lastReleaseAt',
    'mode',
    'mounts',
    'name',
    'pageCount',
    'retention',
    'status',
    'tenantId',
    'updatedAt',
    'updatedBy',
  ],
};
const schema42 = {
  type: 'object',
  properties: {
    siteId: { type: 'string', format: 'uuid' },
    slug: { type: 'string' },
  },
  required: ['siteId', 'slug'],
};
const formats10 = fullFormats['date-time'];
function validate329(
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
  const evaluated0 = validate329.evaluated;
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
    if (data.autoRelease === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'autoRelease' },
        message: "must have required property '" + 'autoRelease' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.collectionId === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'collectionId' },
        message: "must have required property '" + 'collectionId' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.collectionPath === undefined) {
      const err3 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'collectionPath' },
        message: "must have required property '" + 'collectionPath' + "'",
      };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.createdAt === undefined) {
      const err4 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'createdAt' },
        message: "must have required property '" + 'createdAt' + "'",
      };
      if (vErrors === null) {
        vErrors = [err4];
      } else {
        vErrors.push(err4);
      }
      errors++;
    }
    if (data.createdBy === undefined) {
      const err5 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'createdBy' },
        message: "must have required property '" + 'createdBy' + "'",
      };
      if (vErrors === null) {
        vErrors = [err5];
      } else {
        vErrors.push(err5);
      }
      errors++;
    }
    if (data.description === undefined) {
      const err6 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'description' },
        message: "must have required property '" + 'description' + "'",
      };
      if (vErrors === null) {
        vErrors = [err6];
      } else {
        vErrors.push(err6);
      }
      errors++;
    }
    if (data.driftCount === undefined) {
      const err7 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'driftCount' },
        message: "must have required property '" + 'driftCount' + "'",
      };
      if (vErrors === null) {
        vErrors = [err7];
      } else {
        vErrors.push(err7);
      }
      errors++;
    }
    if (data.icon === undefined) {
      const err8 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'icon' },
        message: "must have required property '" + 'icon' + "'",
      };
      if (vErrors === null) {
        vErrors = [err8];
      } else {
        vErrors.push(err8);
      }
      errors++;
    }
    if (data.id === undefined) {
      const err9 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'id' },
        message: "must have required property '" + 'id' + "'",
      };
      if (vErrors === null) {
        vErrors = [err9];
      } else {
        vErrors.push(err9);
      }
      errors++;
    }
    if (data.lastReleaseAt === undefined) {
      const err10 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'lastReleaseAt' },
        message: "must have required property '" + 'lastReleaseAt' + "'",
      };
      if (vErrors === null) {
        vErrors = [err10];
      } else {
        vErrors.push(err10);
      }
      errors++;
    }
    if (data.mode === undefined) {
      const err11 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'mode' },
        message: "must have required property '" + 'mode' + "'",
      };
      if (vErrors === null) {
        vErrors = [err11];
      } else {
        vErrors.push(err11);
      }
      errors++;
    }
    if (data.mounts === undefined) {
      const err12 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'mounts' },
        message: "must have required property '" + 'mounts' + "'",
      };
      if (vErrors === null) {
        vErrors = [err12];
      } else {
        vErrors.push(err12);
      }
      errors++;
    }
    if (data.name === undefined) {
      const err13 = {
        instancePath,
        schemaPath: '#/required',
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
    if (data.pageCount === undefined) {
      const err14 = {
        instancePath,
        schemaPath: '#/required',
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
    if (data.retention === undefined) {
      const err15 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'retention' },
        message: "must have required property '" + 'retention' + "'",
      };
      if (vErrors === null) {
        vErrors = [err15];
      } else {
        vErrors.push(err15);
      }
      errors++;
    }
    if (data.status === undefined) {
      const err16 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'status' },
        message: "must have required property '" + 'status' + "'",
      };
      if (vErrors === null) {
        vErrors = [err16];
      } else {
        vErrors.push(err16);
      }
      errors++;
    }
    if (data.tenantId === undefined) {
      const err17 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'tenantId' },
        message: "must have required property '" + 'tenantId' + "'",
      };
      if (vErrors === null) {
        vErrors = [err17];
      } else {
        vErrors.push(err17);
      }
      errors++;
    }
    if (data.updatedAt === undefined) {
      const err18 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'updatedAt' },
        message: "must have required property '" + 'updatedAt' + "'",
      };
      if (vErrors === null) {
        vErrors = [err18];
      } else {
        vErrors.push(err18);
      }
      errors++;
    }
    if (data.updatedBy === undefined) {
      const err19 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'updatedBy' },
        message: "must have required property '" + 'updatedBy' + "'",
      };
      if (vErrors === null) {
        vErrors = [err19];
      } else {
        vErrors.push(err19);
      }
      errors++;
    }
    if (data.id !== undefined) {
      let data0 = data.id;
      if (typeof data0 === 'string') {
        if (!formats0.test(data0)) {
          const err20 = {
            instancePath: instancePath + '/id',
            schemaPath: '#/properties/id/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err20];
          } else {
            vErrors.push(err20);
          }
          errors++;
        }
      } else {
        const err21 = {
          instancePath: instancePath + '/id',
          schemaPath: '#/properties/id/type',
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
    if (data.tenantId !== undefined) {
      let data1 = data.tenantId;
      if (typeof data1 === 'string') {
        if (!formats0.test(data1)) {
          const err22 = {
            instancePath: instancePath + '/tenantId',
            schemaPath: '#/properties/tenantId/format',
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
          instancePath: instancePath + '/tenantId',
          schemaPath: '#/properties/tenantId/type',
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
    if (data.name !== undefined) {
      if (typeof data.name !== 'string') {
        const err24 = {
          instancePath: instancePath + '/name',
          schemaPath: '#/properties/name/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err24];
        } else {
          vErrors.push(err24);
        }
        errors++;
      }
    }
    if (data.icon !== undefined) {
      let data3 = data.icon;
      if (typeof data3 !== 'string' && data3 !== null) {
        const err25 = {
          instancePath: instancePath + '/icon',
          schemaPath: '#/properties/icon/type',
          keyword: 'type',
          params: { type: schema41.properties.icon.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err25];
        } else {
          vErrors.push(err25);
        }
        errors++;
      }
      if (!(
        data3 === 'book' ||
        data3 === 'code' ||
        data3 === 'api' ||
        data3 === 'guide' ||
        data3 === 'reference' ||
        data3 === null
      )) {
        const err26 = {
          instancePath: instancePath + '/icon',
          schemaPath: '#/properties/icon/enum',
          keyword: 'enum',
          params: { allowedValues: schema41.properties.icon.enum },
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
    if (data.description !== undefined) {
      let data4 = data.description;
      if (typeof data4 !== 'string' && data4 !== null) {
        const err27 = {
          instancePath: instancePath + '/description',
          schemaPath: '#/properties/description/type',
          keyword: 'type',
          params: { type: schema41.properties.description.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
    }
    if (data.mode !== undefined) {
      let data5 = data.mode;
      if (typeof data5 !== 'string') {
        const err28 = {
          instancePath: instancePath + '/mode',
          schemaPath: '#/properties/mode/type',
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
      if (!(data5 === 'authored' || data5 === 'synced')) {
        const err29 = {
          instancePath: instancePath + '/mode',
          schemaPath: '#/properties/mode/enum',
          keyword: 'enum',
          params: { allowedValues: schema41.properties.mode.enum },
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
    if (data.status !== undefined) {
      let data6 = data.status;
      if (typeof data6 !== 'string') {
        const err30 = {
          instancePath: instancePath + '/status',
          schemaPath: '#/properties/status/type',
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
      if (!(data6 === 'active' || data6 === 'archived')) {
        const err31 = {
          instancePath: instancePath + '/status',
          schemaPath: '#/properties/status/enum',
          keyword: 'enum',
          params: { allowedValues: schema41.properties.status.enum },
          message: 'must be equal to one of the allowed values',
        };
        if (vErrors === null) {
          vErrors = [err31];
        } else {
          vErrors.push(err31);
        }
        errors++;
      }
    }
    if (data.pageCount !== undefined) {
      let data7 = data.pageCount;
      if (!(typeof data7 == 'number' && !(data7 % 1) && !isNaN(data7))) {
        const err32 = {
          instancePath: instancePath + '/pageCount',
          schemaPath: '#/properties/pageCount/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err32];
        } else {
          vErrors.push(err32);
        }
        errors++;
      }
    }
    if (data.driftCount !== undefined) {
      let data8 = data.driftCount;
      if (!(typeof data8 == 'number' && !(data8 % 1) && !isNaN(data8))) {
        const err33 = {
          instancePath: instancePath + '/driftCount',
          schemaPath: '#/properties/driftCount/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err33];
        } else {
          vErrors.push(err33);
        }
        errors++;
      }
    }
    if (data.lastReleaseAt !== undefined) {
      let data9 = data.lastReleaseAt;
      if (typeof data9 !== 'string' && data9 !== null) {
        const err34 = {
          instancePath: instancePath + '/lastReleaseAt',
          schemaPath: '#/properties/lastReleaseAt/type',
          keyword: 'type',
          params: { type: schema41.properties.lastReleaseAt.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err34];
        } else {
          vErrors.push(err34);
        }
        errors++;
      }
      if (typeof data9 === 'string') {
        if (!formats10.validate(data9)) {
          const err35 = {
            instancePath: instancePath + '/lastReleaseAt',
            schemaPath: '#/properties/lastReleaseAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err35];
          } else {
            vErrors.push(err35);
          }
          errors++;
        }
      }
    }
    if (data.createdAt !== undefined) {
      let data10 = data.createdAt;
      if (typeof data10 === 'string') {
        if (!formats10.validate(data10)) {
          const err36 = {
            instancePath: instancePath + '/createdAt',
            schemaPath: '#/properties/createdAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err36];
          } else {
            vErrors.push(err36);
          }
          errors++;
        }
      } else {
        const err37 = {
          instancePath: instancePath + '/createdAt',
          schemaPath: '#/properties/createdAt/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err37];
        } else {
          vErrors.push(err37);
        }
        errors++;
      }
    }
    if (data.createdBy !== undefined) {
      let data11 = data.createdBy;
      if (typeof data11 !== 'string' && data11 !== null) {
        const err38 = {
          instancePath: instancePath + '/createdBy',
          schemaPath: '#/properties/createdBy/type',
          keyword: 'type',
          params: { type: schema41.properties.createdBy.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err38];
        } else {
          vErrors.push(err38);
        }
        errors++;
      }
      if (typeof data11 === 'string') {
        if (!formats0.test(data11)) {
          const err39 = {
            instancePath: instancePath + '/createdBy',
            schemaPath: '#/properties/createdBy/format',
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
      }
    }
    if (data.updatedAt !== undefined) {
      let data12 = data.updatedAt;
      if (typeof data12 === 'string') {
        if (!formats10.validate(data12)) {
          const err40 = {
            instancePath: instancePath + '/updatedAt',
            schemaPath: '#/properties/updatedAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err40];
          } else {
            vErrors.push(err40);
          }
          errors++;
        }
      } else {
        const err41 = {
          instancePath: instancePath + '/updatedAt',
          schemaPath: '#/properties/updatedAt/type',
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
    if (data.updatedBy !== undefined) {
      let data13 = data.updatedBy;
      if (typeof data13 !== 'string' && data13 !== null) {
        const err42 = {
          instancePath: instancePath + '/updatedBy',
          schemaPath: '#/properties/updatedBy/type',
          keyword: 'type',
          params: { type: schema41.properties.updatedBy.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err42];
        } else {
          vErrors.push(err42);
        }
        errors++;
      }
      if (typeof data13 === 'string') {
        if (!formats0.test(data13)) {
          const err43 = {
            instancePath: instancePath + '/updatedBy',
            schemaPath: '#/properties/updatedBy/format',
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
    if (data.collectionId !== undefined) {
      let data14 = data.collectionId;
      if (typeof data14 !== 'string' && data14 !== null) {
        const err44 = {
          instancePath: instancePath + '/collectionId',
          schemaPath: '#/properties/collectionId/type',
          keyword: 'type',
          params: { type: schema41.properties.collectionId.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err44];
        } else {
          vErrors.push(err44);
        }
        errors++;
      }
      if (typeof data14 === 'string') {
        if (!formats0.test(data14)) {
          const err45 = {
            instancePath: instancePath + '/collectionId',
            schemaPath: '#/properties/collectionId/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err45];
          } else {
            vErrors.push(err45);
          }
          errors++;
        }
      }
    }
    if (data.allowedActions !== undefined) {
      let data15 = data.allowedActions;
      if (Array.isArray(data15)) {
        const len0 = data15.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data16 = data15[i0];
          if (typeof data16 !== 'string') {
            const err46 = {
              instancePath: instancePath + '/allowedActions/' + i0,
              schemaPath: '#/properties/allowedActions/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err46];
            } else {
              vErrors.push(err46);
            }
            errors++;
          }
          if (!(
            data16 === 'delete' ||
            data16 === 'create' ||
            data16 === 'read' ||
            data16 === 'update' ||
            data16 === 'archive' ||
            data16 === 'restore' ||
            data16 === 'convert' ||
            data16 === 'write_pages' ||
            data16 === 'manage_permissions'
          )) {
            const err47 = {
              instancePath: instancePath + '/allowedActions/' + i0,
              schemaPath: '#/properties/allowedActions/items/enum',
              keyword: 'enum',
              params: {
                allowedValues: schema41.properties.allowedActions.items.enum,
              },
              message: 'must be equal to one of the allowed values',
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
          instancePath: instancePath + '/allowedActions',
          schemaPath: '#/properties/allowedActions/type',
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
    if (data.collectionPath !== undefined) {
      let data17 = data.collectionPath;
      if (Array.isArray(data17)) {
        const len1 = data17.length;
        for (let i1 = 0; i1 < len1; i1++) {
          if (typeof data17[i1] !== 'string') {
            const err49 = {
              instancePath: instancePath + '/collectionPath/' + i1,
              schemaPath: '#/properties/collectionPath/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err49];
            } else {
              vErrors.push(err49);
            }
            errors++;
          }
        }
      } else {
        const err50 = {
          instancePath: instancePath + '/collectionPath',
          schemaPath: '#/properties/collectionPath/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err50];
        } else {
          vErrors.push(err50);
        }
        errors++;
      }
    }
    if (data.mounts !== undefined) {
      let data19 = data.mounts;
      if (Array.isArray(data19)) {
        const len2 = data19.length;
        for (let i2 = 0; i2 < len2; i2++) {
          let data20 = data19[i2];
          if (data20 && typeof data20 == 'object' && !Array.isArray(data20)) {
            if (data20.siteId === undefined) {
              const err51 = {
                instancePath: instancePath + '/mounts/' + i2,
                schemaPath: '#/components/schemas/SpaceMount/required',
                keyword: 'required',
                params: { missingProperty: 'siteId' },
                message: "must have required property '" + 'siteId' + "'",
              };
              if (vErrors === null) {
                vErrors = [err51];
              } else {
                vErrors.push(err51);
              }
              errors++;
            }
            if (data20.slug === undefined) {
              const err52 = {
                instancePath: instancePath + '/mounts/' + i2,
                schemaPath: '#/components/schemas/SpaceMount/required',
                keyword: 'required',
                params: { missingProperty: 'slug' },
                message: "must have required property '" + 'slug' + "'",
              };
              if (vErrors === null) {
                vErrors = [err52];
              } else {
                vErrors.push(err52);
              }
              errors++;
            }
            if (data20.siteId !== undefined) {
              let data21 = data20.siteId;
              if (typeof data21 === 'string') {
                if (!formats0.test(data21)) {
                  const err53 = {
                    instancePath: instancePath + '/mounts/' + i2 + '/siteId',
                    schemaPath:
                      '#/components/schemas/SpaceMount/properties/siteId/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err53];
                  } else {
                    vErrors.push(err53);
                  }
                  errors++;
                }
              } else {
                const err54 = {
                  instancePath: instancePath + '/mounts/' + i2 + '/siteId',
                  schemaPath:
                    '#/components/schemas/SpaceMount/properties/siteId/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err54];
                } else {
                  vErrors.push(err54);
                }
                errors++;
              }
            }
            if (data20.slug !== undefined) {
              if (typeof data20.slug !== 'string') {
                const err55 = {
                  instancePath: instancePath + '/mounts/' + i2 + '/slug',
                  schemaPath:
                    '#/components/schemas/SpaceMount/properties/slug/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err55];
                } else {
                  vErrors.push(err55);
                }
                errors++;
              }
            }
          } else {
            const err56 = {
              instancePath: instancePath + '/mounts/' + i2,
              schemaPath: '#/components/schemas/SpaceMount/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
            };
            if (vErrors === null) {
              vErrors = [err56];
            } else {
              vErrors.push(err56);
            }
            errors++;
          }
        }
      } else {
        const err57 = {
          instancePath: instancePath + '/mounts',
          schemaPath: '#/properties/mounts/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err57];
        } else {
          vErrors.push(err57);
        }
        errors++;
      }
    }
    if (data.retention !== undefined) {
      let data23 = data.retention;
      if (!(typeof data23 == 'number' && !(data23 % 1) && !isNaN(data23))) {
        const err58 = {
          instancePath: instancePath + '/retention',
          schemaPath: '#/properties/retention/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err58];
        } else {
          vErrors.push(err58);
        }
        errors++;
      }
    }
    if (data.autoRelease !== undefined) {
      let data24 = data.autoRelease;
      if (typeof data24 !== 'boolean' && data24 !== null) {
        const err59 = {
          instancePath: instancePath + '/autoRelease',
          schemaPath: '#/properties/autoRelease/type',
          keyword: 'type',
          params: { type: schema41.properties.autoRelease.type },
          message: 'must be boolean,null',
        };
        if (vErrors === null) {
          vErrors = [err59];
        } else {
          vErrors.push(err59);
        }
        errors++;
      }
    }
  } else {
    const err60 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err60];
    } else {
      vErrors.push(err60);
    }
    errors++;
  }
  validate329.errors = vErrors;
  return errors === 0;
}
validate329.evaluated = {
  props: {
    id: true,
    tenantId: true,
    name: true,
    icon: true,
    description: true,
    mode: true,
    status: true,
    pageCount: true,
    driftCount: true,
    lastReleaseAt: true,
    createdAt: true,
    createdBy: true,
    updatedAt: true,
    updatedBy: true,
    collectionId: true,
    allowedActions: true,
    collectionPath: true,
    mounts: true,
    retention: true,
    autoRelease: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate328(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/convertSpaceOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate328.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate329(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate329.errors
        : vErrors.concat(validate329.errors);
    errors = vErrors.length;
  }
  validate328.errors = vErrors;
  return errors === 0;
}
validate328.evaluated = {
  props: {
    id: true,
    tenantId: true,
    name: true,
    icon: true,
    description: true,
    mode: true,
    status: true,
    pageCount: true,
    driftCount: true,
    lastReleaseAt: true,
    createdAt: true,
    createdBy: true,
    updatedAt: true,
    updatedBy: true,
    collectionId: true,
    allowedActions: true,
    collectionPath: true,
    mounts: true,
    retention: true,
    autoRelease: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
export const convertSpaceOutputFull = validate331;
const schema438 = {
  $ref: 'https://edition.invalid/control#/components/schemas/SpaceDetail',
  $id: 'https://edition.invalid/validators/convertSpaceOutputFull',
};
function validate332(
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
  const evaluated0 = validate332.evaluated;
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
    if (data.autoRelease === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'autoRelease' },
        message: "must have required property '" + 'autoRelease' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.collectionId === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'collectionId' },
        message: "must have required property '" + 'collectionId' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.collectionPath === undefined) {
      const err3 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'collectionPath' },
        message: "must have required property '" + 'collectionPath' + "'",
      };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.createdAt === undefined) {
      const err4 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'createdAt' },
        message: "must have required property '" + 'createdAt' + "'",
      };
      if (vErrors === null) {
        vErrors = [err4];
      } else {
        vErrors.push(err4);
      }
      errors++;
    }
    if (data.createdBy === undefined) {
      const err5 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'createdBy' },
        message: "must have required property '" + 'createdBy' + "'",
      };
      if (vErrors === null) {
        vErrors = [err5];
      } else {
        vErrors.push(err5);
      }
      errors++;
    }
    if (data.description === undefined) {
      const err6 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'description' },
        message: "must have required property '" + 'description' + "'",
      };
      if (vErrors === null) {
        vErrors = [err6];
      } else {
        vErrors.push(err6);
      }
      errors++;
    }
    if (data.driftCount === undefined) {
      const err7 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'driftCount' },
        message: "must have required property '" + 'driftCount' + "'",
      };
      if (vErrors === null) {
        vErrors = [err7];
      } else {
        vErrors.push(err7);
      }
      errors++;
    }
    if (data.icon === undefined) {
      const err8 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'icon' },
        message: "must have required property '" + 'icon' + "'",
      };
      if (vErrors === null) {
        vErrors = [err8];
      } else {
        vErrors.push(err8);
      }
      errors++;
    }
    if (data.id === undefined) {
      const err9 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'id' },
        message: "must have required property '" + 'id' + "'",
      };
      if (vErrors === null) {
        vErrors = [err9];
      } else {
        vErrors.push(err9);
      }
      errors++;
    }
    if (data.lastReleaseAt === undefined) {
      const err10 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'lastReleaseAt' },
        message: "must have required property '" + 'lastReleaseAt' + "'",
      };
      if (vErrors === null) {
        vErrors = [err10];
      } else {
        vErrors.push(err10);
      }
      errors++;
    }
    if (data.mode === undefined) {
      const err11 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'mode' },
        message: "must have required property '" + 'mode' + "'",
      };
      if (vErrors === null) {
        vErrors = [err11];
      } else {
        vErrors.push(err11);
      }
      errors++;
    }
    if (data.mounts === undefined) {
      const err12 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'mounts' },
        message: "must have required property '" + 'mounts' + "'",
      };
      if (vErrors === null) {
        vErrors = [err12];
      } else {
        vErrors.push(err12);
      }
      errors++;
    }
    if (data.name === undefined) {
      const err13 = {
        instancePath,
        schemaPath: '#/required',
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
    if (data.pageCount === undefined) {
      const err14 = {
        instancePath,
        schemaPath: '#/required',
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
    if (data.retention === undefined) {
      const err15 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'retention' },
        message: "must have required property '" + 'retention' + "'",
      };
      if (vErrors === null) {
        vErrors = [err15];
      } else {
        vErrors.push(err15);
      }
      errors++;
    }
    if (data.status === undefined) {
      const err16 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'status' },
        message: "must have required property '" + 'status' + "'",
      };
      if (vErrors === null) {
        vErrors = [err16];
      } else {
        vErrors.push(err16);
      }
      errors++;
    }
    if (data.tenantId === undefined) {
      const err17 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'tenantId' },
        message: "must have required property '" + 'tenantId' + "'",
      };
      if (vErrors === null) {
        vErrors = [err17];
      } else {
        vErrors.push(err17);
      }
      errors++;
    }
    if (data.updatedAt === undefined) {
      const err18 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'updatedAt' },
        message: "must have required property '" + 'updatedAt' + "'",
      };
      if (vErrors === null) {
        vErrors = [err18];
      } else {
        vErrors.push(err18);
      }
      errors++;
    }
    if (data.updatedBy === undefined) {
      const err19 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'updatedBy' },
        message: "must have required property '" + 'updatedBy' + "'",
      };
      if (vErrors === null) {
        vErrors = [err19];
      } else {
        vErrors.push(err19);
      }
      errors++;
    }
    if (data.id !== undefined) {
      let data0 = data.id;
      if (typeof data0 === 'string') {
        if (!formats0.test(data0)) {
          const err20 = {
            instancePath: instancePath + '/id',
            schemaPath: '#/properties/id/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err20];
          } else {
            vErrors.push(err20);
          }
          errors++;
        }
      } else {
        const err21 = {
          instancePath: instancePath + '/id',
          schemaPath: '#/properties/id/type',
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
    if (data.tenantId !== undefined) {
      let data1 = data.tenantId;
      if (typeof data1 === 'string') {
        if (!formats0.test(data1)) {
          const err22 = {
            instancePath: instancePath + '/tenantId',
            schemaPath: '#/properties/tenantId/format',
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
          instancePath: instancePath + '/tenantId',
          schemaPath: '#/properties/tenantId/type',
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
    if (data.name !== undefined) {
      if (typeof data.name !== 'string') {
        const err24 = {
          instancePath: instancePath + '/name',
          schemaPath: '#/properties/name/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err24];
        } else {
          vErrors.push(err24);
        }
        errors++;
      }
    }
    if (data.icon !== undefined) {
      let data3 = data.icon;
      if (typeof data3 !== 'string' && data3 !== null) {
        const err25 = {
          instancePath: instancePath + '/icon',
          schemaPath: '#/properties/icon/type',
          keyword: 'type',
          params: { type: schema41.properties.icon.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err25];
        } else {
          vErrors.push(err25);
        }
        errors++;
      }
      if (!(
        data3 === 'book' ||
        data3 === 'code' ||
        data3 === 'api' ||
        data3 === 'guide' ||
        data3 === 'reference' ||
        data3 === null
      )) {
        const err26 = {
          instancePath: instancePath + '/icon',
          schemaPath: '#/properties/icon/enum',
          keyword: 'enum',
          params: { allowedValues: schema41.properties.icon.enum },
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
    if (data.description !== undefined) {
      let data4 = data.description;
      if (typeof data4 !== 'string' && data4 !== null) {
        const err27 = {
          instancePath: instancePath + '/description',
          schemaPath: '#/properties/description/type',
          keyword: 'type',
          params: { type: schema41.properties.description.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
    }
    if (data.mode !== undefined) {
      let data5 = data.mode;
      if (typeof data5 !== 'string') {
        const err28 = {
          instancePath: instancePath + '/mode',
          schemaPath: '#/properties/mode/type',
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
      if (!(data5 === 'authored' || data5 === 'synced')) {
        const err29 = {
          instancePath: instancePath + '/mode',
          schemaPath: '#/properties/mode/enum',
          keyword: 'enum',
          params: { allowedValues: schema41.properties.mode.enum },
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
    if (data.status !== undefined) {
      let data6 = data.status;
      if (typeof data6 !== 'string') {
        const err30 = {
          instancePath: instancePath + '/status',
          schemaPath: '#/properties/status/type',
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
      if (!(data6 === 'active' || data6 === 'archived')) {
        const err31 = {
          instancePath: instancePath + '/status',
          schemaPath: '#/properties/status/enum',
          keyword: 'enum',
          params: { allowedValues: schema41.properties.status.enum },
          message: 'must be equal to one of the allowed values',
        };
        if (vErrors === null) {
          vErrors = [err31];
        } else {
          vErrors.push(err31);
        }
        errors++;
      }
    }
    if (data.pageCount !== undefined) {
      let data7 = data.pageCount;
      if (!(typeof data7 == 'number' && !(data7 % 1) && !isNaN(data7))) {
        const err32 = {
          instancePath: instancePath + '/pageCount',
          schemaPath: '#/properties/pageCount/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err32];
        } else {
          vErrors.push(err32);
        }
        errors++;
      }
    }
    if (data.driftCount !== undefined) {
      let data8 = data.driftCount;
      if (!(typeof data8 == 'number' && !(data8 % 1) && !isNaN(data8))) {
        const err33 = {
          instancePath: instancePath + '/driftCount',
          schemaPath: '#/properties/driftCount/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err33];
        } else {
          vErrors.push(err33);
        }
        errors++;
      }
    }
    if (data.lastReleaseAt !== undefined) {
      let data9 = data.lastReleaseAt;
      if (typeof data9 !== 'string' && data9 !== null) {
        const err34 = {
          instancePath: instancePath + '/lastReleaseAt',
          schemaPath: '#/properties/lastReleaseAt/type',
          keyword: 'type',
          params: { type: schema41.properties.lastReleaseAt.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err34];
        } else {
          vErrors.push(err34);
        }
        errors++;
      }
      if (typeof data9 === 'string') {
        if (!formats10.validate(data9)) {
          const err35 = {
            instancePath: instancePath + '/lastReleaseAt',
            schemaPath: '#/properties/lastReleaseAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err35];
          } else {
            vErrors.push(err35);
          }
          errors++;
        }
      }
    }
    if (data.createdAt !== undefined) {
      let data10 = data.createdAt;
      if (typeof data10 === 'string') {
        if (!formats10.validate(data10)) {
          const err36 = {
            instancePath: instancePath + '/createdAt',
            schemaPath: '#/properties/createdAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err36];
          } else {
            vErrors.push(err36);
          }
          errors++;
        }
      } else {
        const err37 = {
          instancePath: instancePath + '/createdAt',
          schemaPath: '#/properties/createdAt/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err37];
        } else {
          vErrors.push(err37);
        }
        errors++;
      }
    }
    if (data.createdBy !== undefined) {
      let data11 = data.createdBy;
      if (typeof data11 !== 'string' && data11 !== null) {
        const err38 = {
          instancePath: instancePath + '/createdBy',
          schemaPath: '#/properties/createdBy/type',
          keyword: 'type',
          params: { type: schema41.properties.createdBy.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err38];
        } else {
          vErrors.push(err38);
        }
        errors++;
      }
      if (typeof data11 === 'string') {
        if (!formats0.test(data11)) {
          const err39 = {
            instancePath: instancePath + '/createdBy',
            schemaPath: '#/properties/createdBy/format',
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
      }
    }
    if (data.updatedAt !== undefined) {
      let data12 = data.updatedAt;
      if (typeof data12 === 'string') {
        if (!formats10.validate(data12)) {
          const err40 = {
            instancePath: instancePath + '/updatedAt',
            schemaPath: '#/properties/updatedAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err40];
          } else {
            vErrors.push(err40);
          }
          errors++;
        }
      } else {
        const err41 = {
          instancePath: instancePath + '/updatedAt',
          schemaPath: '#/properties/updatedAt/type',
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
    if (data.updatedBy !== undefined) {
      let data13 = data.updatedBy;
      if (typeof data13 !== 'string' && data13 !== null) {
        const err42 = {
          instancePath: instancePath + '/updatedBy',
          schemaPath: '#/properties/updatedBy/type',
          keyword: 'type',
          params: { type: schema41.properties.updatedBy.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err42];
        } else {
          vErrors.push(err42);
        }
        errors++;
      }
      if (typeof data13 === 'string') {
        if (!formats0.test(data13)) {
          const err43 = {
            instancePath: instancePath + '/updatedBy',
            schemaPath: '#/properties/updatedBy/format',
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
    if (data.collectionId !== undefined) {
      let data14 = data.collectionId;
      if (typeof data14 !== 'string' && data14 !== null) {
        const err44 = {
          instancePath: instancePath + '/collectionId',
          schemaPath: '#/properties/collectionId/type',
          keyword: 'type',
          params: { type: schema41.properties.collectionId.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err44];
        } else {
          vErrors.push(err44);
        }
        errors++;
      }
      if (typeof data14 === 'string') {
        if (!formats0.test(data14)) {
          const err45 = {
            instancePath: instancePath + '/collectionId',
            schemaPath: '#/properties/collectionId/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err45];
          } else {
            vErrors.push(err45);
          }
          errors++;
        }
      }
    }
    if (data.allowedActions !== undefined) {
      let data15 = data.allowedActions;
      if (Array.isArray(data15)) {
        const len0 = data15.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data16 = data15[i0];
          if (typeof data16 !== 'string') {
            const err46 = {
              instancePath: instancePath + '/allowedActions/' + i0,
              schemaPath: '#/properties/allowedActions/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err46];
            } else {
              vErrors.push(err46);
            }
            errors++;
          }
          if (!(
            data16 === 'delete' ||
            data16 === 'create' ||
            data16 === 'read' ||
            data16 === 'update' ||
            data16 === 'archive' ||
            data16 === 'restore' ||
            data16 === 'convert' ||
            data16 === 'write_pages' ||
            data16 === 'manage_permissions'
          )) {
            const err47 = {
              instancePath: instancePath + '/allowedActions/' + i0,
              schemaPath: '#/properties/allowedActions/items/enum',
              keyword: 'enum',
              params: {
                allowedValues: schema41.properties.allowedActions.items.enum,
              },
              message: 'must be equal to one of the allowed values',
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
          instancePath: instancePath + '/allowedActions',
          schemaPath: '#/properties/allowedActions/type',
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
    if (data.collectionPath !== undefined) {
      let data17 = data.collectionPath;
      if (Array.isArray(data17)) {
        const len1 = data17.length;
        for (let i1 = 0; i1 < len1; i1++) {
          if (typeof data17[i1] !== 'string') {
            const err49 = {
              instancePath: instancePath + '/collectionPath/' + i1,
              schemaPath: '#/properties/collectionPath/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err49];
            } else {
              vErrors.push(err49);
            }
            errors++;
          }
        }
      } else {
        const err50 = {
          instancePath: instancePath + '/collectionPath',
          schemaPath: '#/properties/collectionPath/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err50];
        } else {
          vErrors.push(err50);
        }
        errors++;
      }
    }
    if (data.mounts !== undefined) {
      let data19 = data.mounts;
      if (Array.isArray(data19)) {
        const len2 = data19.length;
        for (let i2 = 0; i2 < len2; i2++) {
          let data20 = data19[i2];
          if (data20 && typeof data20 == 'object' && !Array.isArray(data20)) {
            if (data20.siteId === undefined) {
              const err51 = {
                instancePath: instancePath + '/mounts/' + i2,
                schemaPath: '#/components/schemas/SpaceMount/required',
                keyword: 'required',
                params: { missingProperty: 'siteId' },
                message: "must have required property '" + 'siteId' + "'",
              };
              if (vErrors === null) {
                vErrors = [err51];
              } else {
                vErrors.push(err51);
              }
              errors++;
            }
            if (data20.slug === undefined) {
              const err52 = {
                instancePath: instancePath + '/mounts/' + i2,
                schemaPath: '#/components/schemas/SpaceMount/required',
                keyword: 'required',
                params: { missingProperty: 'slug' },
                message: "must have required property '" + 'slug' + "'",
              };
              if (vErrors === null) {
                vErrors = [err52];
              } else {
                vErrors.push(err52);
              }
              errors++;
            }
            if (data20.siteId !== undefined) {
              let data21 = data20.siteId;
              if (typeof data21 === 'string') {
                if (!formats0.test(data21)) {
                  const err53 = {
                    instancePath: instancePath + '/mounts/' + i2 + '/siteId',
                    schemaPath:
                      '#/components/schemas/SpaceMount/properties/siteId/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err53];
                  } else {
                    vErrors.push(err53);
                  }
                  errors++;
                }
              } else {
                const err54 = {
                  instancePath: instancePath + '/mounts/' + i2 + '/siteId',
                  schemaPath:
                    '#/components/schemas/SpaceMount/properties/siteId/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err54];
                } else {
                  vErrors.push(err54);
                }
                errors++;
              }
            }
            if (data20.slug !== undefined) {
              if (typeof data20.slug !== 'string') {
                const err55 = {
                  instancePath: instancePath + '/mounts/' + i2 + '/slug',
                  schemaPath:
                    '#/components/schemas/SpaceMount/properties/slug/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err55];
                } else {
                  vErrors.push(err55);
                }
                errors++;
              }
            }
          } else {
            const err56 = {
              instancePath: instancePath + '/mounts/' + i2,
              schemaPath: '#/components/schemas/SpaceMount/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
            };
            if (vErrors === null) {
              vErrors = [err56];
            } else {
              vErrors.push(err56);
            }
            errors++;
          }
        }
      } else {
        const err57 = {
          instancePath: instancePath + '/mounts',
          schemaPath: '#/properties/mounts/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err57];
        } else {
          vErrors.push(err57);
        }
        errors++;
      }
    }
    if (data.retention !== undefined) {
      let data23 = data.retention;
      if (!(typeof data23 == 'number' && !(data23 % 1) && !isNaN(data23))) {
        const err58 = {
          instancePath: instancePath + '/retention',
          schemaPath: '#/properties/retention/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err58];
        } else {
          vErrors.push(err58);
        }
        errors++;
      }
    }
    if (data.autoRelease !== undefined) {
      let data24 = data.autoRelease;
      if (typeof data24 !== 'boolean' && data24 !== null) {
        const err59 = {
          instancePath: instancePath + '/autoRelease',
          schemaPath: '#/properties/autoRelease/type',
          keyword: 'type',
          params: { type: schema41.properties.autoRelease.type },
          message: 'must be boolean,null',
        };
        if (vErrors === null) {
          vErrors = [err59];
        } else {
          vErrors.push(err59);
        }
        errors++;
      }
    }
  } else {
    const err60 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err60];
    } else {
      vErrors.push(err60);
    }
    errors++;
  }
  validate332.errors = vErrors;
  return errors === 0;
}
validate332.evaluated = {
  props: {
    id: true,
    tenantId: true,
    name: true,
    icon: true,
    description: true,
    mode: true,
    status: true,
    pageCount: true,
    driftCount: true,
    lastReleaseAt: true,
    createdAt: true,
    createdBy: true,
    updatedAt: true,
    updatedBy: true,
    collectionId: true,
    allowedActions: true,
    collectionPath: true,
    mounts: true,
    retention: true,
    autoRelease: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate331(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/convertSpaceOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate331.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate332(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate332.errors
        : vErrors.concat(validate332.errors);
    errors = vErrors.length;
  }
  validate331.errors = vErrors;
  return errors === 0;
}
validate331.evaluated = {
  props: {
    id: true,
    tenantId: true,
    name: true,
    icon: true,
    description: true,
    mode: true,
    status: true,
    pageCount: true,
    driftCount: true,
    lastReleaseAt: true,
    createdAt: true,
    createdBy: true,
    updatedAt: true,
    updatedBy: true,
    collectionId: true,
    allowedActions: true,
    collectionPath: true,
    mounts: true,
    retention: true,
    autoRelease: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
