// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const listSitesInput = validate553;
const schema653 = {
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
        fields: { type: 'string', maxLength: 4096, minLength: 1 },
      },
      required: [],
    },
  },
  required: ['path'],
  $id: 'https://edition.invalid/validators/listSitesInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
function validate553(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listSitesInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate553.evaluated;
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
        if (data2.fields !== undefined) {
          let data5 = data2.fields;
          if (typeof data5 === 'string') {
            if (func1(data5) > 4096) {
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
            if (func1(data5) < 1) {
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
  validate553.errors = vErrors;
  return errors === 0;
}
validate553.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const listSitesOutput = validate554;
const schema654 = {
  anyOf: [
    { $ref: 'https://edition.invalid/control#/components/schemas/SitePage' },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialSitePage',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/listSitesOutput',
};
const schema655 = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { $ref: '#/components/schemas/SiteSummary' },
    },
    nextCursor: { type: ['string', 'null'] },
    total: { type: ['integer', 'null'], format: 'int64' },
    allowedActions: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          'create',
          'read',
          'update',
          'mount',
          'unmount',
          'remount',
          'reorder',
          'delete',
          'manage_permissions',
        ],
      },
    },
  },
  required: ['allowedActions', 'items', 'nextCursor', 'total'],
};
const schema656 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    tenantId: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    rule: { type: 'string' },
    home: { type: ['string', 'null'], format: 'uuid' },
    robotsPolicy: { type: 'string', enum: ['index', 'noindex'] },
    domains: {
      type: 'array',
      items: { $ref: '#/components/schemas/SiteDomain' },
    },
    createdAt: { type: 'string', format: 'date-time' },
    createdBy: { type: ['string', 'null'], format: 'uuid' },
    updatedAt: { type: 'string', format: 'date-time' },
    updatedBy: { type: ['string', 'null'], format: 'uuid' },
    allowedActions: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          'create',
          'read',
          'update',
          'mount',
          'unmount',
          'remount',
          'reorder',
          'delete',
          'manage_permissions',
        ],
      },
    },
  },
  required: [
    'allowedActions',
    'createdAt',
    'createdBy',
    'domains',
    'home',
    'id',
    'name',
    'robotsPolicy',
    'rule',
    'tenantId',
    'updatedAt',
    'updatedBy',
  ],
};
const schema139 = {
  type: 'object',
  properties: {
    host: { type: 'string' },
    verified: { type: 'boolean' },
    isPrimary: { type: 'boolean' },
  },
  required: ['host', 'isPrimary', 'verified'],
};
const formats10 = fullFormats['date-time'];
function validate556(
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
  const evaluated0 = validate556.evaluated;
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
    if (data.createdAt === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'createdAt' },
        message: "must have required property '" + 'createdAt' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.createdBy === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'createdBy' },
        message: "must have required property '" + 'createdBy' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.domains === undefined) {
      const err3 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'domains' },
        message: "must have required property '" + 'domains' + "'",
      };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.home === undefined) {
      const err4 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'home' },
        message: "must have required property '" + 'home' + "'",
      };
      if (vErrors === null) {
        vErrors = [err4];
      } else {
        vErrors.push(err4);
      }
      errors++;
    }
    if (data.id === undefined) {
      const err5 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'id' },
        message: "must have required property '" + 'id' + "'",
      };
      if (vErrors === null) {
        vErrors = [err5];
      } else {
        vErrors.push(err5);
      }
      errors++;
    }
    if (data.name === undefined) {
      const err6 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'name' },
        message: "must have required property '" + 'name' + "'",
      };
      if (vErrors === null) {
        vErrors = [err6];
      } else {
        vErrors.push(err6);
      }
      errors++;
    }
    if (data.robotsPolicy === undefined) {
      const err7 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'robotsPolicy' },
        message: "must have required property '" + 'robotsPolicy' + "'",
      };
      if (vErrors === null) {
        vErrors = [err7];
      } else {
        vErrors.push(err7);
      }
      errors++;
    }
    if (data.rule === undefined) {
      const err8 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'rule' },
        message: "must have required property '" + 'rule' + "'",
      };
      if (vErrors === null) {
        vErrors = [err8];
      } else {
        vErrors.push(err8);
      }
      errors++;
    }
    if (data.tenantId === undefined) {
      const err9 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'tenantId' },
        message: "must have required property '" + 'tenantId' + "'",
      };
      if (vErrors === null) {
        vErrors = [err9];
      } else {
        vErrors.push(err9);
      }
      errors++;
    }
    if (data.updatedAt === undefined) {
      const err10 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'updatedAt' },
        message: "must have required property '" + 'updatedAt' + "'",
      };
      if (vErrors === null) {
        vErrors = [err10];
      } else {
        vErrors.push(err10);
      }
      errors++;
    }
    if (data.updatedBy === undefined) {
      const err11 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'updatedBy' },
        message: "must have required property '" + 'updatedBy' + "'",
      };
      if (vErrors === null) {
        vErrors = [err11];
      } else {
        vErrors.push(err11);
      }
      errors++;
    }
    if (data.id !== undefined) {
      let data0 = data.id;
      if (typeof data0 === 'string') {
        if (!formats0.test(data0)) {
          const err12 = {
            instancePath: instancePath + '/id',
            schemaPath: '#/properties/id/format',
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
          instancePath: instancePath + '/id',
          schemaPath: '#/properties/id/type',
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
    if (data.tenantId !== undefined) {
      let data1 = data.tenantId;
      if (typeof data1 === 'string') {
        if (!formats0.test(data1)) {
          const err14 = {
            instancePath: instancePath + '/tenantId',
            schemaPath: '#/properties/tenantId/format',
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
          instancePath: instancePath + '/tenantId',
          schemaPath: '#/properties/tenantId/type',
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
    if (data.name !== undefined) {
      if (typeof data.name !== 'string') {
        const err16 = {
          instancePath: instancePath + '/name',
          schemaPath: '#/properties/name/type',
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
    if (data.rule !== undefined) {
      if (typeof data.rule !== 'string') {
        const err17 = {
          instancePath: instancePath + '/rule',
          schemaPath: '#/properties/rule/type',
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
    if (data.home !== undefined) {
      let data4 = data.home;
      if (typeof data4 !== 'string' && data4 !== null) {
        const err18 = {
          instancePath: instancePath + '/home',
          schemaPath: '#/properties/home/type',
          keyword: 'type',
          params: { type: schema656.properties.home.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err18];
        } else {
          vErrors.push(err18);
        }
        errors++;
      }
      if (typeof data4 === 'string') {
        if (!formats0.test(data4)) {
          const err19 = {
            instancePath: instancePath + '/home',
            schemaPath: '#/properties/home/format',
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
      }
    }
    if (data.robotsPolicy !== undefined) {
      let data5 = data.robotsPolicy;
      if (typeof data5 !== 'string') {
        const err20 = {
          instancePath: instancePath + '/robotsPolicy',
          schemaPath: '#/properties/robotsPolicy/type',
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
      if (!(data5 === 'index' || data5 === 'noindex')) {
        const err21 = {
          instancePath: instancePath + '/robotsPolicy',
          schemaPath: '#/properties/robotsPolicy/enum',
          keyword: 'enum',
          params: { allowedValues: schema656.properties.robotsPolicy.enum },
          message: 'must be equal to one of the allowed values',
        };
        if (vErrors === null) {
          vErrors = [err21];
        } else {
          vErrors.push(err21);
        }
        errors++;
      }
    }
    if (data.domains !== undefined) {
      let data6 = data.domains;
      if (Array.isArray(data6)) {
        const len0 = data6.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data7 = data6[i0];
          if (data7 && typeof data7 == 'object' && !Array.isArray(data7)) {
            if (data7.host === undefined) {
              const err22 = {
                instancePath: instancePath + '/domains/' + i0,
                schemaPath: '#/components/schemas/SiteDomain/required',
                keyword: 'required',
                params: { missingProperty: 'host' },
                message: "must have required property '" + 'host' + "'",
              };
              if (vErrors === null) {
                vErrors = [err22];
              } else {
                vErrors.push(err22);
              }
              errors++;
            }
            if (data7.isPrimary === undefined) {
              const err23 = {
                instancePath: instancePath + '/domains/' + i0,
                schemaPath: '#/components/schemas/SiteDomain/required',
                keyword: 'required',
                params: { missingProperty: 'isPrimary' },
                message: "must have required property '" + 'isPrimary' + "'",
              };
              if (vErrors === null) {
                vErrors = [err23];
              } else {
                vErrors.push(err23);
              }
              errors++;
            }
            if (data7.verified === undefined) {
              const err24 = {
                instancePath: instancePath + '/domains/' + i0,
                schemaPath: '#/components/schemas/SiteDomain/required',
                keyword: 'required',
                params: { missingProperty: 'verified' },
                message: "must have required property '" + 'verified' + "'",
              };
              if (vErrors === null) {
                vErrors = [err24];
              } else {
                vErrors.push(err24);
              }
              errors++;
            }
            if (data7.host !== undefined) {
              if (typeof data7.host !== 'string') {
                const err25 = {
                  instancePath: instancePath + '/domains/' + i0 + '/host',
                  schemaPath:
                    '#/components/schemas/SiteDomain/properties/host/type',
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
            if (data7.verified !== undefined) {
              if (typeof data7.verified !== 'boolean') {
                const err26 = {
                  instancePath: instancePath + '/domains/' + i0 + '/verified',
                  schemaPath:
                    '#/components/schemas/SiteDomain/properties/verified/type',
                  keyword: 'type',
                  params: { type: 'boolean' },
                  message: 'must be boolean',
                };
                if (vErrors === null) {
                  vErrors = [err26];
                } else {
                  vErrors.push(err26);
                }
                errors++;
              }
            }
            if (data7.isPrimary !== undefined) {
              if (typeof data7.isPrimary !== 'boolean') {
                const err27 = {
                  instancePath: instancePath + '/domains/' + i0 + '/isPrimary',
                  schemaPath:
                    '#/components/schemas/SiteDomain/properties/isPrimary/type',
                  keyword: 'type',
                  params: { type: 'boolean' },
                  message: 'must be boolean',
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
              instancePath: instancePath + '/domains/' + i0,
              schemaPath: '#/components/schemas/SiteDomain/type',
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
          instancePath: instancePath + '/domains',
          schemaPath: '#/properties/domains/type',
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
    if (data.createdAt !== undefined) {
      let data11 = data.createdAt;
      if (typeof data11 === 'string') {
        if (!formats10.validate(data11)) {
          const err30 = {
            instancePath: instancePath + '/createdAt',
            schemaPath: '#/properties/createdAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err30];
          } else {
            vErrors.push(err30);
          }
          errors++;
        }
      } else {
        const err31 = {
          instancePath: instancePath + '/createdAt',
          schemaPath: '#/properties/createdAt/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err31];
        } else {
          vErrors.push(err31);
        }
        errors++;
      }
    }
    if (data.createdBy !== undefined) {
      let data12 = data.createdBy;
      if (typeof data12 !== 'string' && data12 !== null) {
        const err32 = {
          instancePath: instancePath + '/createdBy',
          schemaPath: '#/properties/createdBy/type',
          keyword: 'type',
          params: { type: schema656.properties.createdBy.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err32];
        } else {
          vErrors.push(err32);
        }
        errors++;
      }
      if (typeof data12 === 'string') {
        if (!formats0.test(data12)) {
          const err33 = {
            instancePath: instancePath + '/createdBy',
            schemaPath: '#/properties/createdBy/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
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
    if (data.updatedAt !== undefined) {
      let data13 = data.updatedAt;
      if (typeof data13 === 'string') {
        if (!formats10.validate(data13)) {
          const err34 = {
            instancePath: instancePath + '/updatedAt',
            schemaPath: '#/properties/updatedAt/format',
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
          instancePath: instancePath + '/updatedAt',
          schemaPath: '#/properties/updatedAt/type',
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
    if (data.updatedBy !== undefined) {
      let data14 = data.updatedBy;
      if (typeof data14 !== 'string' && data14 !== null) {
        const err36 = {
          instancePath: instancePath + '/updatedBy',
          schemaPath: '#/properties/updatedBy/type',
          keyword: 'type',
          params: { type: schema656.properties.updatedBy.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err36];
        } else {
          vErrors.push(err36);
        }
        errors++;
      }
      if (typeof data14 === 'string') {
        if (!formats0.test(data14)) {
          const err37 = {
            instancePath: instancePath + '/updatedBy',
            schemaPath: '#/properties/updatedBy/format',
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
    if (data.allowedActions !== undefined) {
      let data15 = data.allowedActions;
      if (Array.isArray(data15)) {
        const len1 = data15.length;
        for (let i1 = 0; i1 < len1; i1++) {
          let data16 = data15[i1];
          if (typeof data16 !== 'string') {
            const err38 = {
              instancePath: instancePath + '/allowedActions/' + i1,
              schemaPath: '#/properties/allowedActions/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err38];
            } else {
              vErrors.push(err38);
            }
            errors++;
          }
          if (!(
            data16 === 'create' ||
            data16 === 'read' ||
            data16 === 'update' ||
            data16 === 'mount' ||
            data16 === 'unmount' ||
            data16 === 'remount' ||
            data16 === 'reorder' ||
            data16 === 'delete' ||
            data16 === 'manage_permissions'
          )) {
            const err39 = {
              instancePath: instancePath + '/allowedActions/' + i1,
              schemaPath: '#/properties/allowedActions/items/enum',
              keyword: 'enum',
              params: {
                allowedValues: schema656.properties.allowedActions.items.enum,
              },
              message: 'must be equal to one of the allowed values',
            };
            if (vErrors === null) {
              vErrors = [err39];
            } else {
              vErrors.push(err39);
            }
            errors++;
          }
        }
      } else {
        const err40 = {
          instancePath: instancePath + '/allowedActions',
          schemaPath: '#/properties/allowedActions/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err40];
        } else {
          vErrors.push(err40);
        }
        errors++;
      }
    }
  } else {
    const err41 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err41];
    } else {
      vErrors.push(err41);
    }
    errors++;
  }
  validate556.errors = vErrors;
  return errors === 0;
}
validate556.evaluated = {
  props: {
    id: true,
    tenantId: true,
    name: true,
    rule: true,
    home: true,
    robotsPolicy: true,
    domains: true,
    createdAt: true,
    createdBy: true,
    updatedAt: true,
    updatedBy: true,
    allowedActions: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate555(
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
  const evaluated0 = validate555.evaluated;
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
          if (
            !validate556(data0[i0], {
              instancePath: instancePath + '/items/' + i0,
              parentData: data0,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors =
              vErrors === null
                ? validate556.errors
                : vErrors.concat(validate556.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err4 = {
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.nextCursor !== undefined) {
      let data2 = data.nextCursor;
      if (typeof data2 !== 'string' && data2 !== null) {
        const err5 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
          keyword: 'type',
          params: { type: schema655.properties.nextCursor.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.total !== undefined) {
      let data3 = data.total;
      if (
        !(typeof data3 == 'number' && !(data3 % 1) && !isNaN(data3)) &&
        data3 !== null
      ) {
        const err6 = {
          instancePath: instancePath + '/total',
          schemaPath: '#/properties/total/type',
          keyword: 'type',
          params: { type: schema655.properties.total.type },
          message: 'must be integer,null',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.allowedActions !== undefined) {
      let data4 = data.allowedActions;
      if (Array.isArray(data4)) {
        const len1 = data4.length;
        for (let i1 = 0; i1 < len1; i1++) {
          let data5 = data4[i1];
          if (typeof data5 !== 'string') {
            const err7 = {
              instancePath: instancePath + '/allowedActions/' + i1,
              schemaPath: '#/properties/allowedActions/items/type',
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
          if (!(
            data5 === 'create' ||
            data5 === 'read' ||
            data5 === 'update' ||
            data5 === 'mount' ||
            data5 === 'unmount' ||
            data5 === 'remount' ||
            data5 === 'reorder' ||
            data5 === 'delete' ||
            data5 === 'manage_permissions'
          )) {
            const err8 = {
              instancePath: instancePath + '/allowedActions/' + i1,
              schemaPath: '#/properties/allowedActions/items/enum',
              keyword: 'enum',
              params: {
                allowedValues: schema655.properties.allowedActions.items.enum,
              },
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
      } else {
        const err9 = {
          instancePath: instancePath + '/allowedActions',
          schemaPath: '#/properties/allowedActions/type',
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
  validate555.errors = vErrors;
  return errors === 0;
}
validate555.evaluated = {
  props: { items: true, nextCursor: true, total: true, allowedActions: true },
  dynamicProps: false,
  dynamicItems: false,
};
const schema658 = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialSiteSummary' },
    },
    nextCursor: { type: ['string', 'null'] },
    total: { type: ['integer', 'null'], format: 'int64' },
    allowedActions: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          'create',
          'read',
          'update',
          'mount',
          'unmount',
          'remount',
          'reorder',
          'delete',
          'manage_permissions',
        ],
      },
    },
  },
};
const schema659 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    tenantId: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    rule: { type: 'string' },
    home: { type: ['string', 'null'], format: 'uuid' },
    robotsPolicy: { type: 'string', enum: ['index', 'noindex'] },
    domains: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialSiteDomain' },
    },
    createdAt: { type: 'string', format: 'date-time' },
    createdBy: { type: ['string', 'null'], format: 'uuid' },
    updatedAt: { type: 'string', format: 'date-time' },
    updatedBy: { type: ['string', 'null'], format: 'uuid' },
    allowedActions: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          'create',
          'read',
          'update',
          'mount',
          'unmount',
          'remount',
          'reorder',
          'delete',
          'manage_permissions',
        ],
      },
    },
  },
};
const schema660 = {
  type: 'object',
  properties: {
    host: { type: 'string' },
    verified: { type: 'boolean' },
    isPrimary: { type: 'boolean' },
  },
};
function validate560(
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
  const evaluated0 = validate560.evaluated;
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
    if (data.tenantId !== undefined) {
      let data1 = data.tenantId;
      if (typeof data1 === 'string') {
        if (!formats0.test(data1)) {
          const err2 = {
            instancePath: instancePath + '/tenantId',
            schemaPath: '#/properties/tenantId/format',
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
          instancePath: instancePath + '/tenantId',
          schemaPath: '#/properties/tenantId/type',
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
    if (data.name !== undefined) {
      if (typeof data.name !== 'string') {
        const err4 = {
          instancePath: instancePath + '/name',
          schemaPath: '#/properties/name/type',
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
    if (data.rule !== undefined) {
      if (typeof data.rule !== 'string') {
        const err5 = {
          instancePath: instancePath + '/rule',
          schemaPath: '#/properties/rule/type',
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
    if (data.home !== undefined) {
      let data4 = data.home;
      if (typeof data4 !== 'string' && data4 !== null) {
        const err6 = {
          instancePath: instancePath + '/home',
          schemaPath: '#/properties/home/type',
          keyword: 'type',
          params: { type: schema659.properties.home.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
      if (typeof data4 === 'string') {
        if (!formats0.test(data4)) {
          const err7 = {
            instancePath: instancePath + '/home',
            schemaPath: '#/properties/home/format',
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
      }
    }
    if (data.robotsPolicy !== undefined) {
      let data5 = data.robotsPolicy;
      if (typeof data5 !== 'string') {
        const err8 = {
          instancePath: instancePath + '/robotsPolicy',
          schemaPath: '#/properties/robotsPolicy/type',
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
      if (!(data5 === 'index' || data5 === 'noindex')) {
        const err9 = {
          instancePath: instancePath + '/robotsPolicy',
          schemaPath: '#/properties/robotsPolicy/enum',
          keyword: 'enum',
          params: { allowedValues: schema659.properties.robotsPolicy.enum },
          message: 'must be equal to one of the allowed values',
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.domains !== undefined) {
      let data6 = data.domains;
      if (Array.isArray(data6)) {
        const len0 = data6.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data7 = data6[i0];
          if (data7 && typeof data7 == 'object' && !Array.isArray(data7)) {
            if (data7.host !== undefined) {
              if (typeof data7.host !== 'string') {
                const err10 = {
                  instancePath: instancePath + '/domains/' + i0 + '/host',
                  schemaPath:
                    '#/components/schemas/PartialSiteDomain/properties/host/type',
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
            if (data7.verified !== undefined) {
              if (typeof data7.verified !== 'boolean') {
                const err11 = {
                  instancePath: instancePath + '/domains/' + i0 + '/verified',
                  schemaPath:
                    '#/components/schemas/PartialSiteDomain/properties/verified/type',
                  keyword: 'type',
                  params: { type: 'boolean' },
                  message: 'must be boolean',
                };
                if (vErrors === null) {
                  vErrors = [err11];
                } else {
                  vErrors.push(err11);
                }
                errors++;
              }
            }
            if (data7.isPrimary !== undefined) {
              if (typeof data7.isPrimary !== 'boolean') {
                const err12 = {
                  instancePath: instancePath + '/domains/' + i0 + '/isPrimary',
                  schemaPath:
                    '#/components/schemas/PartialSiteDomain/properties/isPrimary/type',
                  keyword: 'type',
                  params: { type: 'boolean' },
                  message: 'must be boolean',
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
              instancePath: instancePath + '/domains/' + i0,
              schemaPath: '#/components/schemas/PartialSiteDomain/type',
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
        }
      } else {
        const err14 = {
          instancePath: instancePath + '/domains',
          schemaPath: '#/properties/domains/type',
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
    if (data.createdAt !== undefined) {
      let data11 = data.createdAt;
      if (typeof data11 === 'string') {
        if (!formats10.validate(data11)) {
          const err15 = {
            instancePath: instancePath + '/createdAt',
            schemaPath: '#/properties/createdAt/format',
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
          instancePath: instancePath + '/createdAt',
          schemaPath: '#/properties/createdAt/type',
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
    if (data.createdBy !== undefined) {
      let data12 = data.createdBy;
      if (typeof data12 !== 'string' && data12 !== null) {
        const err17 = {
          instancePath: instancePath + '/createdBy',
          schemaPath: '#/properties/createdBy/type',
          keyword: 'type',
          params: { type: schema659.properties.createdBy.type },
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
            instancePath: instancePath + '/createdBy',
            schemaPath: '#/properties/createdBy/format',
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
    if (data.updatedAt !== undefined) {
      let data13 = data.updatedAt;
      if (typeof data13 === 'string') {
        if (!formats10.validate(data13)) {
          const err19 = {
            instancePath: instancePath + '/updatedAt',
            schemaPath: '#/properties/updatedAt/format',
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
          instancePath: instancePath + '/updatedAt',
          schemaPath: '#/properties/updatedAt/type',
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
    if (data.updatedBy !== undefined) {
      let data14 = data.updatedBy;
      if (typeof data14 !== 'string' && data14 !== null) {
        const err21 = {
          instancePath: instancePath + '/updatedBy',
          schemaPath: '#/properties/updatedBy/type',
          keyword: 'type',
          params: { type: schema659.properties.updatedBy.type },
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
            instancePath: instancePath + '/updatedBy',
            schemaPath: '#/properties/updatedBy/format',
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
    if (data.allowedActions !== undefined) {
      let data15 = data.allowedActions;
      if (Array.isArray(data15)) {
        const len1 = data15.length;
        for (let i1 = 0; i1 < len1; i1++) {
          let data16 = data15[i1];
          if (typeof data16 !== 'string') {
            const err23 = {
              instancePath: instancePath + '/allowedActions/' + i1,
              schemaPath: '#/properties/allowedActions/items/type',
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
          if (!(
            data16 === 'create' ||
            data16 === 'read' ||
            data16 === 'update' ||
            data16 === 'mount' ||
            data16 === 'unmount' ||
            data16 === 'remount' ||
            data16 === 'reorder' ||
            data16 === 'delete' ||
            data16 === 'manage_permissions'
          )) {
            const err24 = {
              instancePath: instancePath + '/allowedActions/' + i1,
              schemaPath: '#/properties/allowedActions/items/enum',
              keyword: 'enum',
              params: {
                allowedValues: schema659.properties.allowedActions.items.enum,
              },
              message: 'must be equal to one of the allowed values',
            };
            if (vErrors === null) {
              vErrors = [err24];
            } else {
              vErrors.push(err24);
            }
            errors++;
          }
        }
      } else {
        const err25 = {
          instancePath: instancePath + '/allowedActions',
          schemaPath: '#/properties/allowedActions/type',
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
  } else {
    const err26 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err26];
    } else {
      vErrors.push(err26);
    }
    errors++;
  }
  validate560.errors = vErrors;
  return errors === 0;
}
validate560.evaluated = {
  props: {
    id: true,
    tenantId: true,
    name: true,
    rule: true,
    home: true,
    robotsPolicy: true,
    domains: true,
    createdAt: true,
    createdBy: true,
    updatedAt: true,
    updatedBy: true,
    allowedActions: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate559(
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
  const evaluated0 = validate559.evaluated;
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
            !validate560(data0[i0], {
              instancePath: instancePath + '/items/' + i0,
              parentData: data0,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors =
              vErrors === null
                ? validate560.errors
                : vErrors.concat(validate560.errors);
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
      let data2 = data.nextCursor;
      if (typeof data2 !== 'string' && data2 !== null) {
        const err1 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
          keyword: 'type',
          params: { type: schema658.properties.nextCursor.type },
          message: 'must be string,null',
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
      if (
        !(typeof data3 == 'number' && !(data3 % 1) && !isNaN(data3)) &&
        data3 !== null
      ) {
        const err2 = {
          instancePath: instancePath + '/total',
          schemaPath: '#/properties/total/type',
          keyword: 'type',
          params: { type: schema658.properties.total.type },
          message: 'must be integer,null',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.allowedActions !== undefined) {
      let data4 = data.allowedActions;
      if (Array.isArray(data4)) {
        const len1 = data4.length;
        for (let i1 = 0; i1 < len1; i1++) {
          let data5 = data4[i1];
          if (typeof data5 !== 'string') {
            const err3 = {
              instancePath: instancePath + '/allowedActions/' + i1,
              schemaPath: '#/properties/allowedActions/items/type',
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
            data5 === 'create' ||
            data5 === 'read' ||
            data5 === 'update' ||
            data5 === 'mount' ||
            data5 === 'unmount' ||
            data5 === 'remount' ||
            data5 === 'reorder' ||
            data5 === 'delete' ||
            data5 === 'manage_permissions'
          )) {
            const err4 = {
              instancePath: instancePath + '/allowedActions/' + i1,
              schemaPath: '#/properties/allowedActions/items/enum',
              keyword: 'enum',
              params: {
                allowedValues: schema658.properties.allowedActions.items.enum,
              },
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
      } else {
        const err5 = {
          instancePath: instancePath + '/allowedActions',
          schemaPath: '#/properties/allowedActions/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
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
      instancePath,
      schemaPath: '#/type',
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
  validate559.errors = vErrors;
  return errors === 0;
}
validate559.evaluated = {
  props: { items: true, nextCursor: true, total: true, allowedActions: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate554(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listSitesOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate554.evaluated;
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
    !validate555(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate555.errors
        : vErrors.concat(validate555.errors);
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
    !validate559(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate559.errors
        : vErrors.concat(validate559.errors);
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
  validate554.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate554.evaluated = { dynamicProps: true, dynamicItems: false };
export const listSitesOutputFull = validate563;
const schema661 = {
  $ref: 'https://edition.invalid/control#/components/schemas/SitePage',
  $id: 'https://edition.invalid/validators/listSitesOutputFull',
};
function validate564(
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
  const evaluated0 = validate564.evaluated;
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
          if (
            !validate556(data0[i0], {
              instancePath: instancePath + '/items/' + i0,
              parentData: data0,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors =
              vErrors === null
                ? validate556.errors
                : vErrors.concat(validate556.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err4 = {
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.nextCursor !== undefined) {
      let data2 = data.nextCursor;
      if (typeof data2 !== 'string' && data2 !== null) {
        const err5 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
          keyword: 'type',
          params: { type: schema655.properties.nextCursor.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.total !== undefined) {
      let data3 = data.total;
      if (
        !(typeof data3 == 'number' && !(data3 % 1) && !isNaN(data3)) &&
        data3 !== null
      ) {
        const err6 = {
          instancePath: instancePath + '/total',
          schemaPath: '#/properties/total/type',
          keyword: 'type',
          params: { type: schema655.properties.total.type },
          message: 'must be integer,null',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.allowedActions !== undefined) {
      let data4 = data.allowedActions;
      if (Array.isArray(data4)) {
        const len1 = data4.length;
        for (let i1 = 0; i1 < len1; i1++) {
          let data5 = data4[i1];
          if (typeof data5 !== 'string') {
            const err7 = {
              instancePath: instancePath + '/allowedActions/' + i1,
              schemaPath: '#/properties/allowedActions/items/type',
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
          if (!(
            data5 === 'create' ||
            data5 === 'read' ||
            data5 === 'update' ||
            data5 === 'mount' ||
            data5 === 'unmount' ||
            data5 === 'remount' ||
            data5 === 'reorder' ||
            data5 === 'delete' ||
            data5 === 'manage_permissions'
          )) {
            const err8 = {
              instancePath: instancePath + '/allowedActions/' + i1,
              schemaPath: '#/properties/allowedActions/items/enum',
              keyword: 'enum',
              params: {
                allowedValues: schema655.properties.allowedActions.items.enum,
              },
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
      } else {
        const err9 = {
          instancePath: instancePath + '/allowedActions',
          schemaPath: '#/properties/allowedActions/type',
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
  validate564.errors = vErrors;
  return errors === 0;
}
validate564.evaluated = {
  props: { items: true, nextCursor: true, total: true, allowedActions: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate563(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listSitesOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate563.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate564(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate564.errors
        : vErrors.concat(validate564.errors);
    errors = vErrors.length;
  }
  validate563.errors = vErrors;
  return errors === 0;
}
validate563.evaluated = {
  props: { items: true, nextCursor: true, total: true, allowedActions: true },
  dynamicProps: false,
  dynamicItems: false,
};
