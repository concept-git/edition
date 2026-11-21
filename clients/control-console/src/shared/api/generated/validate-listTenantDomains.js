// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const listTenantDomainsInput = validate1394;
const schema1541 = {
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
        siteId: { type: 'string', format: 'uuid' },
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
  $id: 'https://edition.invalid/validators/listTenantDomainsInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
function validate1394(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listTenantDomainsInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1394.evaluated;
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
        if (data2.siteId !== undefined) {
          let data3 = data2.siteId;
          if (typeof data3 === 'string') {
            if (!formats0.test(data3)) {
              const err5 = {
                instancePath: instancePath + '/query/siteId',
                schemaPath: '#/properties/query/properties/siteId/format',
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
              instancePath: instancePath + '/query/siteId',
              schemaPath: '#/properties/query/properties/siteId/type',
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
        if (data2.cursor !== undefined) {
          if (typeof data2.cursor !== 'string') {
            const err7 = {
              instancePath: instancePath + '/query/cursor',
              schemaPath: '#/properties/query/properties/cursor/type',
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
        if (data2.limit !== undefined) {
          let data5 = data2.limit;
          if (!(typeof data5 == 'number' && !(data5 % 1) && !isNaN(data5))) {
            const err8 = {
              instancePath: instancePath + '/query/limit',
              schemaPath: '#/properties/query/properties/limit/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err8];
            } else {
              vErrors.push(err8);
            }
            errors++;
          }
          if (typeof data5 == 'number') {
            if (data5 > 100 || isNaN(data5)) {
              const err9 = {
                instancePath: instancePath + '/query/limit',
                schemaPath: '#/properties/query/properties/limit/maximum',
                keyword: 'maximum',
                params: { comparison: '<=', limit: 100 },
                message: 'must be <= 100',
              };
              if (vErrors === null) {
                vErrors = [err9];
              } else {
                vErrors.push(err9);
              }
              errors++;
            }
            if (data5 < 1 || isNaN(data5)) {
              const err10 = {
                instancePath: instancePath + '/query/limit',
                schemaPath: '#/properties/query/properties/limit/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err10];
              } else {
                vErrors.push(err10);
              }
              errors++;
            }
          }
        }
        if (data2.fields !== undefined) {
          let data6 = data2.fields;
          if (typeof data6 === 'string') {
            if (func1(data6) > 4096) {
              const err11 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/maxLength',
                keyword: 'maxLength',
                params: { limit: 4096 },
                message: 'must NOT have more than 4096 characters',
              };
              if (vErrors === null) {
                vErrors = [err11];
              } else {
                vErrors.push(err11);
              }
              errors++;
            }
            if (func1(data6) < 1) {
              const err12 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/minLength',
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
          } else {
            const err13 = {
              instancePath: instancePath + '/query/fields',
              schemaPath: '#/properties/query/properties/fields/type',
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
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
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
    }
  } else {
    const err15 = {
      instancePath,
      schemaPath: '#/type',
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
  validate1394.errors = vErrors;
  return errors === 0;
}
validate1394.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const listTenantDomainsOutput = validate1395;
const schema1542 = {
  anyOf: [
    {
      $ref: 'https://edition.invalid/control#/components/schemas/TenantDomainPage',
    },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialTenantDomainPage',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/listTenantDomainsOutput',
};
const schema1543 = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { $ref: '#/components/schemas/TenantDomainSummary' },
    },
    nextCursor: { type: 'string' },
    total: { type: 'integer', format: 'int64' },
    sites: {
      type: 'array',
      items: { $ref: '#/components/schemas/DomainSiteChoice' },
    },
  },
  required: ['items', 'sites'],
};
const schema1544 = {
  type: 'object',
  properties: {
    host: { type: 'string' },
    verified: { type: 'boolean' },
    isPrimary: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
    siteId: { type: 'string', format: 'uuid' },
    siteName: { type: 'string' },
    allowedActions: {
      type: 'array',
      items: { type: 'string' },
      uniqueItems: true,
    },
  },
  required: [
    'allowedActions',
    'createdAt',
    'host',
    'isPrimary',
    'siteId',
    'siteName',
    'verified',
  ],
};
const schema1545 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    allowedActions: {
      type: 'array',
      items: { type: 'string' },
      uniqueItems: true,
    },
  },
  required: ['allowedActions', 'id', 'name'],
};
const formats10 = fullFormats['date-time'];
function validate1396(
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
  const evaluated0 = validate1396.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.items === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'items' },
        message: "must have required property '" + 'items' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.sites === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'sites' },
        message: "must have required property '" + 'sites' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
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
              const err2 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/TenantDomainSummary/required',
                keyword: 'required',
                params: { missingProperty: 'allowedActions' },
                message:
                  "must have required property '" + 'allowedActions' + "'",
              };
              if (vErrors === null) {
                vErrors = [err2];
              } else {
                vErrors.push(err2);
              }
              errors++;
            }
            if (data1.createdAt === undefined) {
              const err3 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/TenantDomainSummary/required',
                keyword: 'required',
                params: { missingProperty: 'createdAt' },
                message: "must have required property '" + 'createdAt' + "'",
              };
              if (vErrors === null) {
                vErrors = [err3];
              } else {
                vErrors.push(err3);
              }
              errors++;
            }
            if (data1.host === undefined) {
              const err4 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/TenantDomainSummary/required',
                keyword: 'required',
                params: { missingProperty: 'host' },
                message: "must have required property '" + 'host' + "'",
              };
              if (vErrors === null) {
                vErrors = [err4];
              } else {
                vErrors.push(err4);
              }
              errors++;
            }
            if (data1.isPrimary === undefined) {
              const err5 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/TenantDomainSummary/required',
                keyword: 'required',
                params: { missingProperty: 'isPrimary' },
                message: "must have required property '" + 'isPrimary' + "'",
              };
              if (vErrors === null) {
                vErrors = [err5];
              } else {
                vErrors.push(err5);
              }
              errors++;
            }
            if (data1.siteId === undefined) {
              const err6 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/TenantDomainSummary/required',
                keyword: 'required',
                params: { missingProperty: 'siteId' },
                message: "must have required property '" + 'siteId' + "'",
              };
              if (vErrors === null) {
                vErrors = [err6];
              } else {
                vErrors.push(err6);
              }
              errors++;
            }
            if (data1.siteName === undefined) {
              const err7 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/TenantDomainSummary/required',
                keyword: 'required',
                params: { missingProperty: 'siteName' },
                message: "must have required property '" + 'siteName' + "'",
              };
              if (vErrors === null) {
                vErrors = [err7];
              } else {
                vErrors.push(err7);
              }
              errors++;
            }
            if (data1.verified === undefined) {
              const err8 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/TenantDomainSummary/required',
                keyword: 'required',
                params: { missingProperty: 'verified' },
                message: "must have required property '" + 'verified' + "'",
              };
              if (vErrors === null) {
                vErrors = [err8];
              } else {
                vErrors.push(err8);
              }
              errors++;
            }
            if (data1.host !== undefined) {
              if (typeof data1.host !== 'string') {
                const err9 = {
                  instancePath: instancePath + '/items/' + i0 + '/host',
                  schemaPath:
                    '#/components/schemas/TenantDomainSummary/properties/host/type',
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
            if (data1.verified !== undefined) {
              if (typeof data1.verified !== 'boolean') {
                const err10 = {
                  instancePath: instancePath + '/items/' + i0 + '/verified',
                  schemaPath:
                    '#/components/schemas/TenantDomainSummary/properties/verified/type',
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
            if (data1.isPrimary !== undefined) {
              if (typeof data1.isPrimary !== 'boolean') {
                const err11 = {
                  instancePath: instancePath + '/items/' + i0 + '/isPrimary',
                  schemaPath:
                    '#/components/schemas/TenantDomainSummary/properties/isPrimary/type',
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
            if (data1.createdAt !== undefined) {
              let data5 = data1.createdAt;
              if (typeof data5 === 'string') {
                if (!formats10.validate(data5)) {
                  const err12 = {
                    instancePath: instancePath + '/items/' + i0 + '/createdAt',
                    schemaPath:
                      '#/components/schemas/TenantDomainSummary/properties/createdAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
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
                  instancePath: instancePath + '/items/' + i0 + '/createdAt',
                  schemaPath:
                    '#/components/schemas/TenantDomainSummary/properties/createdAt/type',
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
            if (data1.siteId !== undefined) {
              let data6 = data1.siteId;
              if (typeof data6 === 'string') {
                if (!formats0.test(data6)) {
                  const err14 = {
                    instancePath: instancePath + '/items/' + i0 + '/siteId',
                    schemaPath:
                      '#/components/schemas/TenantDomainSummary/properties/siteId/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/siteId',
                  schemaPath:
                    '#/components/schemas/TenantDomainSummary/properties/siteId/type',
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
            if (data1.siteName !== undefined) {
              if (typeof data1.siteName !== 'string') {
                const err16 = {
                  instancePath: instancePath + '/items/' + i0 + '/siteName',
                  schemaPath:
                    '#/components/schemas/TenantDomainSummary/properties/siteName/type',
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
            if (data1.allowedActions !== undefined) {
              let data8 = data1.allowedActions;
              if (Array.isArray(data8)) {
                const len1 = data8.length;
                for (let i1 = 0; i1 < len1; i1++) {
                  if (typeof data8[i1] !== 'string') {
                    const err17 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/allowedActions/' + i1,
                      schemaPath:
                        '#/components/schemas/TenantDomainSummary/properties/allowedActions/items/type',
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
                let i2 = data8.length;
                let j0;
                if (i2 > 1) {
                  const indices0 = {};
                  for (; i2--;) {
                    let item0 = data8[i2];
                    if (typeof item0 !== 'string') {
                      continue;
                    }
                    if (typeof indices0[item0] == 'number') {
                      j0 = indices0[item0];
                      const err18 = {
                        instancePath:
                          instancePath + '/items/' + i0 + '/allowedActions',
                        schemaPath:
                          '#/components/schemas/TenantDomainSummary/properties/allowedActions/uniqueItems',
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
                        vErrors = [err18];
                      } else {
                        vErrors.push(err18);
                      }
                      errors++;
                      break;
                    }
                    indices0[item0] = i2;
                  }
                }
              } else {
                const err19 = {
                  instancePath:
                    instancePath + '/items/' + i0 + '/allowedActions',
                  schemaPath:
                    '#/components/schemas/TenantDomainSummary/properties/allowedActions/type',
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
          } else {
            const err20 = {
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/TenantDomainSummary/type',
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
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err21];
        } else {
          vErrors.push(err21);
        }
        errors++;
      }
    }
    if (data.nextCursor !== undefined) {
      if (typeof data.nextCursor !== 'string') {
        const err22 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
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
    if (data.total !== undefined) {
      let data11 = data.total;
      if (!(typeof data11 == 'number' && !(data11 % 1) && !isNaN(data11))) {
        const err23 = {
          instancePath: instancePath + '/total',
          schemaPath: '#/properties/total/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
    }
    if (data.sites !== undefined) {
      let data12 = data.sites;
      if (Array.isArray(data12)) {
        const len2 = data12.length;
        for (let i3 = 0; i3 < len2; i3++) {
          let data13 = data12[i3];
          if (data13 && typeof data13 == 'object' && !Array.isArray(data13)) {
            if (data13.allowedActions === undefined) {
              const err24 = {
                instancePath: instancePath + '/sites/' + i3,
                schemaPath: '#/components/schemas/DomainSiteChoice/required',
                keyword: 'required',
                params: { missingProperty: 'allowedActions' },
                message:
                  "must have required property '" + 'allowedActions' + "'",
              };
              if (vErrors === null) {
                vErrors = [err24];
              } else {
                vErrors.push(err24);
              }
              errors++;
            }
            if (data13.id === undefined) {
              const err25 = {
                instancePath: instancePath + '/sites/' + i3,
                schemaPath: '#/components/schemas/DomainSiteChoice/required',
                keyword: 'required',
                params: { missingProperty: 'id' },
                message: "must have required property '" + 'id' + "'",
              };
              if (vErrors === null) {
                vErrors = [err25];
              } else {
                vErrors.push(err25);
              }
              errors++;
            }
            if (data13.name === undefined) {
              const err26 = {
                instancePath: instancePath + '/sites/' + i3,
                schemaPath: '#/components/schemas/DomainSiteChoice/required',
                keyword: 'required',
                params: { missingProperty: 'name' },
                message: "must have required property '" + 'name' + "'",
              };
              if (vErrors === null) {
                vErrors = [err26];
              } else {
                vErrors.push(err26);
              }
              errors++;
            }
            if (data13.id !== undefined) {
              let data14 = data13.id;
              if (typeof data14 === 'string') {
                if (!formats0.test(data14)) {
                  const err27 = {
                    instancePath: instancePath + '/sites/' + i3 + '/id',
                    schemaPath:
                      '#/components/schemas/DomainSiteChoice/properties/id/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err27];
                  } else {
                    vErrors.push(err27);
                  }
                  errors++;
                }
              } else {
                const err28 = {
                  instancePath: instancePath + '/sites/' + i3 + '/id',
                  schemaPath:
                    '#/components/schemas/DomainSiteChoice/properties/id/type',
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
            }
            if (data13.name !== undefined) {
              if (typeof data13.name !== 'string') {
                const err29 = {
                  instancePath: instancePath + '/sites/' + i3 + '/name',
                  schemaPath:
                    '#/components/schemas/DomainSiteChoice/properties/name/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err29];
                } else {
                  vErrors.push(err29);
                }
                errors++;
              }
            }
            if (data13.allowedActions !== undefined) {
              let data16 = data13.allowedActions;
              if (Array.isArray(data16)) {
                const len3 = data16.length;
                for (let i4 = 0; i4 < len3; i4++) {
                  if (typeof data16[i4] !== 'string') {
                    const err30 = {
                      instancePath:
                        instancePath + '/sites/' + i3 + '/allowedActions/' + i4,
                      schemaPath:
                        '#/components/schemas/DomainSiteChoice/properties/allowedActions/items/type',
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
                let i5 = data16.length;
                let j1;
                if (i5 > 1) {
                  const indices1 = {};
                  for (; i5--;) {
                    let item1 = data16[i5];
                    if (typeof item1 !== 'string') {
                      continue;
                    }
                    if (typeof indices1[item1] == 'number') {
                      j1 = indices1[item1];
                      const err31 = {
                        instancePath:
                          instancePath + '/sites/' + i3 + '/allowedActions',
                        schemaPath:
                          '#/components/schemas/DomainSiteChoice/properties/allowedActions/uniqueItems',
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
                        vErrors = [err31];
                      } else {
                        vErrors.push(err31);
                      }
                      errors++;
                      break;
                    }
                    indices1[item1] = i5;
                  }
                }
              } else {
                const err32 = {
                  instancePath:
                    instancePath + '/sites/' + i3 + '/allowedActions',
                  schemaPath:
                    '#/components/schemas/DomainSiteChoice/properties/allowedActions/type',
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
          } else {
            const err33 = {
              instancePath: instancePath + '/sites/' + i3,
              schemaPath: '#/components/schemas/DomainSiteChoice/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
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
          instancePath: instancePath + '/sites',
          schemaPath: '#/properties/sites/type',
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
  validate1396.errors = vErrors;
  return errors === 0;
}
validate1396.evaluated = {
  props: { items: true, nextCursor: true, total: true, sites: true },
  dynamicProps: false,
  dynamicItems: false,
};
const schema1546 = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialTenantDomainSummary' },
    },
    nextCursor: { type: 'string' },
    total: { type: 'integer', format: 'int64' },
    sites: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialDomainSiteChoice' },
    },
  },
};
const schema1547 = {
  type: 'object',
  properties: {
    host: { type: 'string' },
    verified: { type: 'boolean' },
    isPrimary: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
    siteId: { type: 'string', format: 'uuid' },
    siteName: { type: 'string' },
    allowedActions: {
      type: 'array',
      items: { type: 'string' },
      uniqueItems: true,
    },
  },
};
const schema1548 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    allowedActions: {
      type: 'array',
      items: { type: 'string' },
      uniqueItems: true,
    },
  },
};
function validate1398(
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
  const evaluated0 = validate1398.evaluated;
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
            if (data1.host !== undefined) {
              if (typeof data1.host !== 'string') {
                const err0 = {
                  instancePath: instancePath + '/items/' + i0 + '/host',
                  schemaPath:
                    '#/components/schemas/PartialTenantDomainSummary/properties/host/type',
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
            if (data1.verified !== undefined) {
              if (typeof data1.verified !== 'boolean') {
                const err1 = {
                  instancePath: instancePath + '/items/' + i0 + '/verified',
                  schemaPath:
                    '#/components/schemas/PartialTenantDomainSummary/properties/verified/type',
                  keyword: 'type',
                  params: { type: 'boolean' },
                  message: 'must be boolean',
                };
                if (vErrors === null) {
                  vErrors = [err1];
                } else {
                  vErrors.push(err1);
                }
                errors++;
              }
            }
            if (data1.isPrimary !== undefined) {
              if (typeof data1.isPrimary !== 'boolean') {
                const err2 = {
                  instancePath: instancePath + '/items/' + i0 + '/isPrimary',
                  schemaPath:
                    '#/components/schemas/PartialTenantDomainSummary/properties/isPrimary/type',
                  keyword: 'type',
                  params: { type: 'boolean' },
                  message: 'must be boolean',
                };
                if (vErrors === null) {
                  vErrors = [err2];
                } else {
                  vErrors.push(err2);
                }
                errors++;
              }
            }
            if (data1.createdAt !== undefined) {
              let data5 = data1.createdAt;
              if (typeof data5 === 'string') {
                if (!formats10.validate(data5)) {
                  const err3 = {
                    instancePath: instancePath + '/items/' + i0 + '/createdAt',
                    schemaPath:
                      '#/components/schemas/PartialTenantDomainSummary/properties/createdAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
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
                  instancePath: instancePath + '/items/' + i0 + '/createdAt',
                  schemaPath:
                    '#/components/schemas/PartialTenantDomainSummary/properties/createdAt/type',
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
            if (data1.siteId !== undefined) {
              let data6 = data1.siteId;
              if (typeof data6 === 'string') {
                if (!formats0.test(data6)) {
                  const err5 = {
                    instancePath: instancePath + '/items/' + i0 + '/siteId',
                    schemaPath:
                      '#/components/schemas/PartialTenantDomainSummary/properties/siteId/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/siteId',
                  schemaPath:
                    '#/components/schemas/PartialTenantDomainSummary/properties/siteId/type',
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
            if (data1.siteName !== undefined) {
              if (typeof data1.siteName !== 'string') {
                const err7 = {
                  instancePath: instancePath + '/items/' + i0 + '/siteName',
                  schemaPath:
                    '#/components/schemas/PartialTenantDomainSummary/properties/siteName/type',
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
            if (data1.allowedActions !== undefined) {
              let data8 = data1.allowedActions;
              if (Array.isArray(data8)) {
                const len1 = data8.length;
                for (let i1 = 0; i1 < len1; i1++) {
                  if (typeof data8[i1] !== 'string') {
                    const err8 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/allowedActions/' + i1,
                      schemaPath:
                        '#/components/schemas/PartialTenantDomainSummary/properties/allowedActions/items/type',
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
                let i2 = data8.length;
                let j0;
                if (i2 > 1) {
                  const indices0 = {};
                  for (; i2--;) {
                    let item0 = data8[i2];
                    if (typeof item0 !== 'string') {
                      continue;
                    }
                    if (typeof indices0[item0] == 'number') {
                      j0 = indices0[item0];
                      const err9 = {
                        instancePath:
                          instancePath + '/items/' + i0 + '/allowedActions',
                        schemaPath:
                          '#/components/schemas/PartialTenantDomainSummary/properties/allowedActions/uniqueItems',
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
                        vErrors = [err9];
                      } else {
                        vErrors.push(err9);
                      }
                      errors++;
                      break;
                    }
                    indices0[item0] = i2;
                  }
                }
              } else {
                const err10 = {
                  instancePath:
                    instancePath + '/items/' + i0 + '/allowedActions',
                  schemaPath:
                    '#/components/schemas/PartialTenantDomainSummary/properties/allowedActions/type',
                  keyword: 'type',
                  params: { type: 'array' },
                  message: 'must be array',
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
              schemaPath:
                '#/components/schemas/PartialTenantDomainSummary/type',
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
    if (data.total !== undefined) {
      let data11 = data.total;
      if (!(typeof data11 == 'number' && !(data11 % 1) && !isNaN(data11))) {
        const err14 = {
          instancePath: instancePath + '/total',
          schemaPath: '#/properties/total/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err14];
        } else {
          vErrors.push(err14);
        }
        errors++;
      }
    }
    if (data.sites !== undefined) {
      let data12 = data.sites;
      if (Array.isArray(data12)) {
        const len2 = data12.length;
        for (let i3 = 0; i3 < len2; i3++) {
          let data13 = data12[i3];
          if (data13 && typeof data13 == 'object' && !Array.isArray(data13)) {
            if (data13.id !== undefined) {
              let data14 = data13.id;
              if (typeof data14 === 'string') {
                if (!formats0.test(data14)) {
                  const err15 = {
                    instancePath: instancePath + '/sites/' + i3 + '/id',
                    schemaPath:
                      '#/components/schemas/PartialDomainSiteChoice/properties/id/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
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
                  instancePath: instancePath + '/sites/' + i3 + '/id',
                  schemaPath:
                    '#/components/schemas/PartialDomainSiteChoice/properties/id/type',
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
            if (data13.name !== undefined) {
              if (typeof data13.name !== 'string') {
                const err17 = {
                  instancePath: instancePath + '/sites/' + i3 + '/name',
                  schemaPath:
                    '#/components/schemas/PartialDomainSiteChoice/properties/name/type',
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
            if (data13.allowedActions !== undefined) {
              let data16 = data13.allowedActions;
              if (Array.isArray(data16)) {
                const len3 = data16.length;
                for (let i4 = 0; i4 < len3; i4++) {
                  if (typeof data16[i4] !== 'string') {
                    const err18 = {
                      instancePath:
                        instancePath + '/sites/' + i3 + '/allowedActions/' + i4,
                      schemaPath:
                        '#/components/schemas/PartialDomainSiteChoice/properties/allowedActions/items/type',
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
                let i5 = data16.length;
                let j1;
                if (i5 > 1) {
                  const indices1 = {};
                  for (; i5--;) {
                    let item1 = data16[i5];
                    if (typeof item1 !== 'string') {
                      continue;
                    }
                    if (typeof indices1[item1] == 'number') {
                      j1 = indices1[item1];
                      const err19 = {
                        instancePath:
                          instancePath + '/sites/' + i3 + '/allowedActions',
                        schemaPath:
                          '#/components/schemas/PartialDomainSiteChoice/properties/allowedActions/uniqueItems',
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
                        vErrors = [err19];
                      } else {
                        vErrors.push(err19);
                      }
                      errors++;
                      break;
                    }
                    indices1[item1] = i5;
                  }
                }
              } else {
                const err20 = {
                  instancePath:
                    instancePath + '/sites/' + i3 + '/allowedActions',
                  schemaPath:
                    '#/components/schemas/PartialDomainSiteChoice/properties/allowedActions/type',
                  keyword: 'type',
                  params: { type: 'array' },
                  message: 'must be array',
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
              instancePath: instancePath + '/sites/' + i3,
              schemaPath: '#/components/schemas/PartialDomainSiteChoice/type',
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
        }
      } else {
        const err22 = {
          instancePath: instancePath + '/sites',
          schemaPath: '#/properties/sites/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
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
  validate1398.errors = vErrors;
  return errors === 0;
}
validate1398.evaluated = {
  props: { items: true, nextCursor: true, total: true, sites: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1395(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listTenantDomainsOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1395.evaluated;
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
    !validate1396(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1396.errors
        : vErrors.concat(validate1396.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = {};
    props0.items = true;
    props0.nextCursor = true;
    props0.total = true;
    props0.sites = true;
  }
  const _errs2 = errors;
  if (
    !validate1398(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1398.errors
        : vErrors.concat(validate1398.errors);
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
      props0.sites = true;
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
  validate1395.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate1395.evaluated = { dynamicProps: true, dynamicItems: false };
export const listTenantDomainsOutputFull = validate1400;
const schema1549 = {
  $ref: 'https://edition.invalid/control#/components/schemas/TenantDomainPage',
  $id: 'https://edition.invalid/validators/listTenantDomainsOutputFull',
};
function validate1401(
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
  const evaluated0 = validate1401.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.items === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'items' },
        message: "must have required property '" + 'items' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.sites === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'sites' },
        message: "must have required property '" + 'sites' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
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
              const err2 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/TenantDomainSummary/required',
                keyword: 'required',
                params: { missingProperty: 'allowedActions' },
                message:
                  "must have required property '" + 'allowedActions' + "'",
              };
              if (vErrors === null) {
                vErrors = [err2];
              } else {
                vErrors.push(err2);
              }
              errors++;
            }
            if (data1.createdAt === undefined) {
              const err3 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/TenantDomainSummary/required',
                keyword: 'required',
                params: { missingProperty: 'createdAt' },
                message: "must have required property '" + 'createdAt' + "'",
              };
              if (vErrors === null) {
                vErrors = [err3];
              } else {
                vErrors.push(err3);
              }
              errors++;
            }
            if (data1.host === undefined) {
              const err4 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/TenantDomainSummary/required',
                keyword: 'required',
                params: { missingProperty: 'host' },
                message: "must have required property '" + 'host' + "'",
              };
              if (vErrors === null) {
                vErrors = [err4];
              } else {
                vErrors.push(err4);
              }
              errors++;
            }
            if (data1.isPrimary === undefined) {
              const err5 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/TenantDomainSummary/required',
                keyword: 'required',
                params: { missingProperty: 'isPrimary' },
                message: "must have required property '" + 'isPrimary' + "'",
              };
              if (vErrors === null) {
                vErrors = [err5];
              } else {
                vErrors.push(err5);
              }
              errors++;
            }
            if (data1.siteId === undefined) {
              const err6 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/TenantDomainSummary/required',
                keyword: 'required',
                params: { missingProperty: 'siteId' },
                message: "must have required property '" + 'siteId' + "'",
              };
              if (vErrors === null) {
                vErrors = [err6];
              } else {
                vErrors.push(err6);
              }
              errors++;
            }
            if (data1.siteName === undefined) {
              const err7 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/TenantDomainSummary/required',
                keyword: 'required',
                params: { missingProperty: 'siteName' },
                message: "must have required property '" + 'siteName' + "'",
              };
              if (vErrors === null) {
                vErrors = [err7];
              } else {
                vErrors.push(err7);
              }
              errors++;
            }
            if (data1.verified === undefined) {
              const err8 = {
                instancePath: instancePath + '/items/' + i0,
                schemaPath: '#/components/schemas/TenantDomainSummary/required',
                keyword: 'required',
                params: { missingProperty: 'verified' },
                message: "must have required property '" + 'verified' + "'",
              };
              if (vErrors === null) {
                vErrors = [err8];
              } else {
                vErrors.push(err8);
              }
              errors++;
            }
            if (data1.host !== undefined) {
              if (typeof data1.host !== 'string') {
                const err9 = {
                  instancePath: instancePath + '/items/' + i0 + '/host',
                  schemaPath:
                    '#/components/schemas/TenantDomainSummary/properties/host/type',
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
            if (data1.verified !== undefined) {
              if (typeof data1.verified !== 'boolean') {
                const err10 = {
                  instancePath: instancePath + '/items/' + i0 + '/verified',
                  schemaPath:
                    '#/components/schemas/TenantDomainSummary/properties/verified/type',
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
            if (data1.isPrimary !== undefined) {
              if (typeof data1.isPrimary !== 'boolean') {
                const err11 = {
                  instancePath: instancePath + '/items/' + i0 + '/isPrimary',
                  schemaPath:
                    '#/components/schemas/TenantDomainSummary/properties/isPrimary/type',
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
            if (data1.createdAt !== undefined) {
              let data5 = data1.createdAt;
              if (typeof data5 === 'string') {
                if (!formats10.validate(data5)) {
                  const err12 = {
                    instancePath: instancePath + '/items/' + i0 + '/createdAt',
                    schemaPath:
                      '#/components/schemas/TenantDomainSummary/properties/createdAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
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
                  instancePath: instancePath + '/items/' + i0 + '/createdAt',
                  schemaPath:
                    '#/components/schemas/TenantDomainSummary/properties/createdAt/type',
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
            if (data1.siteId !== undefined) {
              let data6 = data1.siteId;
              if (typeof data6 === 'string') {
                if (!formats0.test(data6)) {
                  const err14 = {
                    instancePath: instancePath + '/items/' + i0 + '/siteId',
                    schemaPath:
                      '#/components/schemas/TenantDomainSummary/properties/siteId/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/siteId',
                  schemaPath:
                    '#/components/schemas/TenantDomainSummary/properties/siteId/type',
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
            if (data1.siteName !== undefined) {
              if (typeof data1.siteName !== 'string') {
                const err16 = {
                  instancePath: instancePath + '/items/' + i0 + '/siteName',
                  schemaPath:
                    '#/components/schemas/TenantDomainSummary/properties/siteName/type',
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
            if (data1.allowedActions !== undefined) {
              let data8 = data1.allowedActions;
              if (Array.isArray(data8)) {
                const len1 = data8.length;
                for (let i1 = 0; i1 < len1; i1++) {
                  if (typeof data8[i1] !== 'string') {
                    const err17 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/allowedActions/' + i1,
                      schemaPath:
                        '#/components/schemas/TenantDomainSummary/properties/allowedActions/items/type',
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
                let i2 = data8.length;
                let j0;
                if (i2 > 1) {
                  const indices0 = {};
                  for (; i2--;) {
                    let item0 = data8[i2];
                    if (typeof item0 !== 'string') {
                      continue;
                    }
                    if (typeof indices0[item0] == 'number') {
                      j0 = indices0[item0];
                      const err18 = {
                        instancePath:
                          instancePath + '/items/' + i0 + '/allowedActions',
                        schemaPath:
                          '#/components/schemas/TenantDomainSummary/properties/allowedActions/uniqueItems',
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
                        vErrors = [err18];
                      } else {
                        vErrors.push(err18);
                      }
                      errors++;
                      break;
                    }
                    indices0[item0] = i2;
                  }
                }
              } else {
                const err19 = {
                  instancePath:
                    instancePath + '/items/' + i0 + '/allowedActions',
                  schemaPath:
                    '#/components/schemas/TenantDomainSummary/properties/allowedActions/type',
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
          } else {
            const err20 = {
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/TenantDomainSummary/type',
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
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err21];
        } else {
          vErrors.push(err21);
        }
        errors++;
      }
    }
    if (data.nextCursor !== undefined) {
      if (typeof data.nextCursor !== 'string') {
        const err22 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
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
    if (data.total !== undefined) {
      let data11 = data.total;
      if (!(typeof data11 == 'number' && !(data11 % 1) && !isNaN(data11))) {
        const err23 = {
          instancePath: instancePath + '/total',
          schemaPath: '#/properties/total/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
    }
    if (data.sites !== undefined) {
      let data12 = data.sites;
      if (Array.isArray(data12)) {
        const len2 = data12.length;
        for (let i3 = 0; i3 < len2; i3++) {
          let data13 = data12[i3];
          if (data13 && typeof data13 == 'object' && !Array.isArray(data13)) {
            if (data13.allowedActions === undefined) {
              const err24 = {
                instancePath: instancePath + '/sites/' + i3,
                schemaPath: '#/components/schemas/DomainSiteChoice/required',
                keyword: 'required',
                params: { missingProperty: 'allowedActions' },
                message:
                  "must have required property '" + 'allowedActions' + "'",
              };
              if (vErrors === null) {
                vErrors = [err24];
              } else {
                vErrors.push(err24);
              }
              errors++;
            }
            if (data13.id === undefined) {
              const err25 = {
                instancePath: instancePath + '/sites/' + i3,
                schemaPath: '#/components/schemas/DomainSiteChoice/required',
                keyword: 'required',
                params: { missingProperty: 'id' },
                message: "must have required property '" + 'id' + "'",
              };
              if (vErrors === null) {
                vErrors = [err25];
              } else {
                vErrors.push(err25);
              }
              errors++;
            }
            if (data13.name === undefined) {
              const err26 = {
                instancePath: instancePath + '/sites/' + i3,
                schemaPath: '#/components/schemas/DomainSiteChoice/required',
                keyword: 'required',
                params: { missingProperty: 'name' },
                message: "must have required property '" + 'name' + "'",
              };
              if (vErrors === null) {
                vErrors = [err26];
              } else {
                vErrors.push(err26);
              }
              errors++;
            }
            if (data13.id !== undefined) {
              let data14 = data13.id;
              if (typeof data14 === 'string') {
                if (!formats0.test(data14)) {
                  const err27 = {
                    instancePath: instancePath + '/sites/' + i3 + '/id',
                    schemaPath:
                      '#/components/schemas/DomainSiteChoice/properties/id/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err27];
                  } else {
                    vErrors.push(err27);
                  }
                  errors++;
                }
              } else {
                const err28 = {
                  instancePath: instancePath + '/sites/' + i3 + '/id',
                  schemaPath:
                    '#/components/schemas/DomainSiteChoice/properties/id/type',
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
            }
            if (data13.name !== undefined) {
              if (typeof data13.name !== 'string') {
                const err29 = {
                  instancePath: instancePath + '/sites/' + i3 + '/name',
                  schemaPath:
                    '#/components/schemas/DomainSiteChoice/properties/name/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err29];
                } else {
                  vErrors.push(err29);
                }
                errors++;
              }
            }
            if (data13.allowedActions !== undefined) {
              let data16 = data13.allowedActions;
              if (Array.isArray(data16)) {
                const len3 = data16.length;
                for (let i4 = 0; i4 < len3; i4++) {
                  if (typeof data16[i4] !== 'string') {
                    const err30 = {
                      instancePath:
                        instancePath + '/sites/' + i3 + '/allowedActions/' + i4,
                      schemaPath:
                        '#/components/schemas/DomainSiteChoice/properties/allowedActions/items/type',
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
                let i5 = data16.length;
                let j1;
                if (i5 > 1) {
                  const indices1 = {};
                  for (; i5--;) {
                    let item1 = data16[i5];
                    if (typeof item1 !== 'string') {
                      continue;
                    }
                    if (typeof indices1[item1] == 'number') {
                      j1 = indices1[item1];
                      const err31 = {
                        instancePath:
                          instancePath + '/sites/' + i3 + '/allowedActions',
                        schemaPath:
                          '#/components/schemas/DomainSiteChoice/properties/allowedActions/uniqueItems',
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
                        vErrors = [err31];
                      } else {
                        vErrors.push(err31);
                      }
                      errors++;
                      break;
                    }
                    indices1[item1] = i5;
                  }
                }
              } else {
                const err32 = {
                  instancePath:
                    instancePath + '/sites/' + i3 + '/allowedActions',
                  schemaPath:
                    '#/components/schemas/DomainSiteChoice/properties/allowedActions/type',
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
          } else {
            const err33 = {
              instancePath: instancePath + '/sites/' + i3,
              schemaPath: '#/components/schemas/DomainSiteChoice/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
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
          instancePath: instancePath + '/sites',
          schemaPath: '#/properties/sites/type',
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
  validate1401.errors = vErrors;
  return errors === 0;
}
validate1401.evaluated = {
  props: { items: true, nextCursor: true, total: true, sites: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1400(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listTenantDomainsOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1400.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate1401(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1401.errors
        : vErrors.concat(validate1401.errors);
    errors = vErrors.length;
  }
  validate1400.errors = vErrors;
  return errors === 0;
}
validate1400.evaluated = {
  props: { items: true, nextCursor: true, total: true, sites: true },
  dynamicProps: false,
  dynamicItems: false,
};
