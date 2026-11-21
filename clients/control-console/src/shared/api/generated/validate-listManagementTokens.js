// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
('use strict');
export const listManagementTokensInput = validate748;
const schema857 = {
  type: 'object',
  properties: {
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
      },
      required: [],
    },
  },
  required: [],
  $id: 'https://edition.invalid/validators/listManagementTokensInput',
};
function validate748(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listManagementTokensInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate748.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.query !== undefined) {
      let data0 = data.query;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.cursor !== undefined) {
          if (typeof data0.cursor !== 'string') {
            const err0 = {
              instancePath: instancePath + '/query/cursor',
              schemaPath: '#/properties/query/properties/cursor/type',
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
        if (data0.limit !== undefined) {
          let data2 = data0.limit;
          if (!(typeof data2 == 'number' && !(data2 % 1) && !isNaN(data2))) {
            const err1 = {
              instancePath: instancePath + '/query/limit',
              schemaPath: '#/properties/query/properties/limit/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err1];
            } else {
              vErrors.push(err1);
            }
            errors++;
          }
          if (typeof data2 == 'number') {
            if (data2 > 100 || isNaN(data2)) {
              const err2 = {
                instancePath: instancePath + '/query/limit',
                schemaPath: '#/properties/query/properties/limit/maximum',
                keyword: 'maximum',
                params: { comparison: '<=', limit: 100 },
                message: 'must be <= 100',
              };
              if (vErrors === null) {
                vErrors = [err2];
              } else {
                vErrors.push(err2);
              }
              errors++;
            }
            if (data2 < 1 || isNaN(data2)) {
              const err3 = {
                instancePath: instancePath + '/query/limit',
                schemaPath: '#/properties/query/properties/limit/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err3];
              } else {
                vErrors.push(err3);
              }
              errors++;
            }
          }
        }
      } else {
        const err4 = {
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
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
  } else {
    const err5 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err5];
    } else {
      vErrors.push(err5);
    }
    errors++;
  }
  validate748.errors = vErrors;
  return errors === 0;
}
validate748.evaluated = {
  props: { query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const listManagementTokensOutput = validate749;
const schema858 = {
  $ref: 'https://edition.invalid/control#/components/schemas/ManagementTokenPage',
  $id: 'https://edition.invalid/validators/listManagementTokensOutput',
};
const schema859 = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { $ref: '#/components/schemas/ManagementTokenView' },
    },
    nextCursor: { type: ['string', 'null'] },
  },
};
const schema860 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    scopes: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          'content:read',
          'content:write',
          'content:publish',
          'members:read',
          'members:write',
          'permissions:read',
          'permissions:write',
          'hosting:read',
          'hosting:write',
          'audit:read',
          'operations:read',
          'operations:write',
          'account:read',
          'account:write',
          'platform:read',
          'platform:write',
          'platform:erase',
        ],
      },
      uniqueItems: true,
    },
    tenantId: { type: ['string', 'null'], format: 'uuid' },
    expiry: { type: 'string', format: 'date-time' },
    status: { type: 'string', enum: ['active', 'expired', 'revoked'] },
    createdAt: { type: 'string', format: 'date-time' },
    lastUsedAt: { type: ['string', 'null'], format: 'date-time' },
    revokedAt: { type: ['string', 'null'], format: 'date-time' },
  },
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const formats10 = fullFormats['date-time'];
function validate750(
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
  const evaluated0 = validate750.evaluated;
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
                      '#/components/schemas/ManagementTokenView/properties/id/format',
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
                    '#/components/schemas/ManagementTokenView/properties/id/type',
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
            if (data1.name !== undefined) {
              if (typeof data1.name !== 'string') {
                const err2 = {
                  instancePath: instancePath + '/items/' + i0 + '/name',
                  schemaPath:
                    '#/components/schemas/ManagementTokenView/properties/name/type',
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
            if (data1.scopes !== undefined) {
              let data4 = data1.scopes;
              if (Array.isArray(data4)) {
                const len1 = data4.length;
                for (let i1 = 0; i1 < len1; i1++) {
                  let data5 = data4[i1];
                  if (typeof data5 !== 'string') {
                    const err3 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/scopes/' + i1,
                      schemaPath:
                        '#/components/schemas/ManagementTokenView/properties/scopes/items/type',
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
                    data5 === 'content:read' ||
                    data5 === 'content:write' ||
                    data5 === 'content:publish' ||
                    data5 === 'members:read' ||
                    data5 === 'members:write' ||
                    data5 === 'permissions:read' ||
                    data5 === 'permissions:write' ||
                    data5 === 'hosting:read' ||
                    data5 === 'hosting:write' ||
                    data5 === 'audit:read' ||
                    data5 === 'operations:read' ||
                    data5 === 'operations:write' ||
                    data5 === 'account:read' ||
                    data5 === 'account:write' ||
                    data5 === 'platform:read' ||
                    data5 === 'platform:write' ||
                    data5 === 'platform:erase'
                  )) {
                    const err4 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/scopes/' + i1,
                      schemaPath:
                        '#/components/schemas/ManagementTokenView/properties/scopes/items/enum',
                      keyword: 'enum',
                      params: {
                        allowedValues: schema860.properties.scopes.items.enum,
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
                let i2 = data4.length;
                let j0;
                if (i2 > 1) {
                  const indices0 = {};
                  for (; i2--;) {
                    let item0 = data4[i2];
                    if (typeof item0 !== 'string') {
                      continue;
                    }
                    if (typeof indices0[item0] == 'number') {
                      j0 = indices0[item0];
                      const err5 = {
                        instancePath: instancePath + '/items/' + i0 + '/scopes',
                        schemaPath:
                          '#/components/schemas/ManagementTokenView/properties/scopes/uniqueItems',
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
                        vErrors = [err5];
                      } else {
                        vErrors.push(err5);
                      }
                      errors++;
                      break;
                    }
                    indices0[item0] = i2;
                  }
                }
              } else {
                const err6 = {
                  instancePath: instancePath + '/items/' + i0 + '/scopes',
                  schemaPath:
                    '#/components/schemas/ManagementTokenView/properties/scopes/type',
                  keyword: 'type',
                  params: { type: 'array' },
                  message: 'must be array',
                };
                if (vErrors === null) {
                  vErrors = [err6];
                } else {
                  vErrors.push(err6);
                }
                errors++;
              }
            }
            if (data1.tenantId !== undefined) {
              let data6 = data1.tenantId;
              if (typeof data6 !== 'string' && data6 !== null) {
                const err7 = {
                  instancePath: instancePath + '/items/' + i0 + '/tenantId',
                  schemaPath:
                    '#/components/schemas/ManagementTokenView/properties/tenantId/type',
                  keyword: 'type',
                  params: { type: schema860.properties.tenantId.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err7];
                } else {
                  vErrors.push(err7);
                }
                errors++;
              }
              if (typeof data6 === 'string') {
                if (!formats0.test(data6)) {
                  const err8 = {
                    instancePath: instancePath + '/items/' + i0 + '/tenantId',
                    schemaPath:
                      '#/components/schemas/ManagementTokenView/properties/tenantId/format',
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
              }
            }
            if (data1.expiry !== undefined) {
              let data7 = data1.expiry;
              if (typeof data7 === 'string') {
                if (!formats10.validate(data7)) {
                  const err9 = {
                    instancePath: instancePath + '/items/' + i0 + '/expiry',
                    schemaPath:
                      '#/components/schemas/ManagementTokenView/properties/expiry/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
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
                  instancePath: instancePath + '/items/' + i0 + '/expiry',
                  schemaPath:
                    '#/components/schemas/ManagementTokenView/properties/expiry/type',
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
            if (data1.status !== undefined) {
              let data8 = data1.status;
              if (typeof data8 !== 'string') {
                const err11 = {
                  instancePath: instancePath + '/items/' + i0 + '/status',
                  schemaPath:
                    '#/components/schemas/ManagementTokenView/properties/status/type',
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
              if (!(
                data8 === 'active' ||
                data8 === 'expired' ||
                data8 === 'revoked'
              )) {
                const err12 = {
                  instancePath: instancePath + '/items/' + i0 + '/status',
                  schemaPath:
                    '#/components/schemas/ManagementTokenView/properties/status/enum',
                  keyword: 'enum',
                  params: { allowedValues: schema860.properties.status.enum },
                  message: 'must be equal to one of the allowed values',
                };
                if (vErrors === null) {
                  vErrors = [err12];
                } else {
                  vErrors.push(err12);
                }
                errors++;
              }
            }
            if (data1.createdAt !== undefined) {
              let data9 = data1.createdAt;
              if (typeof data9 === 'string') {
                if (!formats10.validate(data9)) {
                  const err13 = {
                    instancePath: instancePath + '/items/' + i0 + '/createdAt',
                    schemaPath:
                      '#/components/schemas/ManagementTokenView/properties/createdAt/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/createdAt',
                  schemaPath:
                    '#/components/schemas/ManagementTokenView/properties/createdAt/type',
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
            if (data1.lastUsedAt !== undefined) {
              let data10 = data1.lastUsedAt;
              if (typeof data10 !== 'string' && data10 !== null) {
                const err15 = {
                  instancePath: instancePath + '/items/' + i0 + '/lastUsedAt',
                  schemaPath:
                    '#/components/schemas/ManagementTokenView/properties/lastUsedAt/type',
                  keyword: 'type',
                  params: { type: schema860.properties.lastUsedAt.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err15];
                } else {
                  vErrors.push(err15);
                }
                errors++;
              }
              if (typeof data10 === 'string') {
                if (!formats10.validate(data10)) {
                  const err16 = {
                    instancePath: instancePath + '/items/' + i0 + '/lastUsedAt',
                    schemaPath:
                      '#/components/schemas/ManagementTokenView/properties/lastUsedAt/format',
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
              }
            }
            if (data1.revokedAt !== undefined) {
              let data11 = data1.revokedAt;
              if (typeof data11 !== 'string' && data11 !== null) {
                const err17 = {
                  instancePath: instancePath + '/items/' + i0 + '/revokedAt',
                  schemaPath:
                    '#/components/schemas/ManagementTokenView/properties/revokedAt/type',
                  keyword: 'type',
                  params: { type: schema860.properties.revokedAt.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err17];
                } else {
                  vErrors.push(err17);
                }
                errors++;
              }
              if (typeof data11 === 'string') {
                if (!formats10.validate(data11)) {
                  const err18 = {
                    instancePath: instancePath + '/items/' + i0 + '/revokedAt',
                    schemaPath:
                      '#/components/schemas/ManagementTokenView/properties/revokedAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
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
          } else {
            const err19 = {
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/ManagementTokenView/type',
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
        }
      } else {
        const err20 = {
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
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
    if (data.nextCursor !== undefined) {
      let data12 = data.nextCursor;
      if (typeof data12 !== 'string' && data12 !== null) {
        const err21 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
          keyword: 'type',
          params: { type: schema859.properties.nextCursor.type },
          message: 'must be string,null',
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
      instancePath,
      schemaPath: '#/type',
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
  validate750.errors = vErrors;
  return errors === 0;
}
validate750.evaluated = {
  props: { items: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate749(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listManagementTokensOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate749.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate750(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate750.errors
        : vErrors.concat(validate750.errors);
    errors = vErrors.length;
  }
  validate749.errors = vErrors;
  return errors === 0;
}
validate749.evaluated = {
  props: { items: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const listManagementTokensOutputFull = validate752;
const schema861 = {
  $ref: 'https://edition.invalid/control#/components/schemas/ManagementTokenPage',
  $id: 'https://edition.invalid/validators/listManagementTokensOutputFull',
};
function validate753(
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
  const evaluated0 = validate753.evaluated;
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
                      '#/components/schemas/ManagementTokenView/properties/id/format',
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
                    '#/components/schemas/ManagementTokenView/properties/id/type',
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
            if (data1.name !== undefined) {
              if (typeof data1.name !== 'string') {
                const err2 = {
                  instancePath: instancePath + '/items/' + i0 + '/name',
                  schemaPath:
                    '#/components/schemas/ManagementTokenView/properties/name/type',
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
            if (data1.scopes !== undefined) {
              let data4 = data1.scopes;
              if (Array.isArray(data4)) {
                const len1 = data4.length;
                for (let i1 = 0; i1 < len1; i1++) {
                  let data5 = data4[i1];
                  if (typeof data5 !== 'string') {
                    const err3 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/scopes/' + i1,
                      schemaPath:
                        '#/components/schemas/ManagementTokenView/properties/scopes/items/type',
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
                    data5 === 'content:read' ||
                    data5 === 'content:write' ||
                    data5 === 'content:publish' ||
                    data5 === 'members:read' ||
                    data5 === 'members:write' ||
                    data5 === 'permissions:read' ||
                    data5 === 'permissions:write' ||
                    data5 === 'hosting:read' ||
                    data5 === 'hosting:write' ||
                    data5 === 'audit:read' ||
                    data5 === 'operations:read' ||
                    data5 === 'operations:write' ||
                    data5 === 'account:read' ||
                    data5 === 'account:write' ||
                    data5 === 'platform:read' ||
                    data5 === 'platform:write' ||
                    data5 === 'platform:erase'
                  )) {
                    const err4 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/scopes/' + i1,
                      schemaPath:
                        '#/components/schemas/ManagementTokenView/properties/scopes/items/enum',
                      keyword: 'enum',
                      params: {
                        allowedValues: schema860.properties.scopes.items.enum,
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
                let i2 = data4.length;
                let j0;
                if (i2 > 1) {
                  const indices0 = {};
                  for (; i2--;) {
                    let item0 = data4[i2];
                    if (typeof item0 !== 'string') {
                      continue;
                    }
                    if (typeof indices0[item0] == 'number') {
                      j0 = indices0[item0];
                      const err5 = {
                        instancePath: instancePath + '/items/' + i0 + '/scopes',
                        schemaPath:
                          '#/components/schemas/ManagementTokenView/properties/scopes/uniqueItems',
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
                        vErrors = [err5];
                      } else {
                        vErrors.push(err5);
                      }
                      errors++;
                      break;
                    }
                    indices0[item0] = i2;
                  }
                }
              } else {
                const err6 = {
                  instancePath: instancePath + '/items/' + i0 + '/scopes',
                  schemaPath:
                    '#/components/schemas/ManagementTokenView/properties/scopes/type',
                  keyword: 'type',
                  params: { type: 'array' },
                  message: 'must be array',
                };
                if (vErrors === null) {
                  vErrors = [err6];
                } else {
                  vErrors.push(err6);
                }
                errors++;
              }
            }
            if (data1.tenantId !== undefined) {
              let data6 = data1.tenantId;
              if (typeof data6 !== 'string' && data6 !== null) {
                const err7 = {
                  instancePath: instancePath + '/items/' + i0 + '/tenantId',
                  schemaPath:
                    '#/components/schemas/ManagementTokenView/properties/tenantId/type',
                  keyword: 'type',
                  params: { type: schema860.properties.tenantId.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err7];
                } else {
                  vErrors.push(err7);
                }
                errors++;
              }
              if (typeof data6 === 'string') {
                if (!formats0.test(data6)) {
                  const err8 = {
                    instancePath: instancePath + '/items/' + i0 + '/tenantId',
                    schemaPath:
                      '#/components/schemas/ManagementTokenView/properties/tenantId/format',
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
              }
            }
            if (data1.expiry !== undefined) {
              let data7 = data1.expiry;
              if (typeof data7 === 'string') {
                if (!formats10.validate(data7)) {
                  const err9 = {
                    instancePath: instancePath + '/items/' + i0 + '/expiry',
                    schemaPath:
                      '#/components/schemas/ManagementTokenView/properties/expiry/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
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
                  instancePath: instancePath + '/items/' + i0 + '/expiry',
                  schemaPath:
                    '#/components/schemas/ManagementTokenView/properties/expiry/type',
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
            if (data1.status !== undefined) {
              let data8 = data1.status;
              if (typeof data8 !== 'string') {
                const err11 = {
                  instancePath: instancePath + '/items/' + i0 + '/status',
                  schemaPath:
                    '#/components/schemas/ManagementTokenView/properties/status/type',
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
              if (!(
                data8 === 'active' ||
                data8 === 'expired' ||
                data8 === 'revoked'
              )) {
                const err12 = {
                  instancePath: instancePath + '/items/' + i0 + '/status',
                  schemaPath:
                    '#/components/schemas/ManagementTokenView/properties/status/enum',
                  keyword: 'enum',
                  params: { allowedValues: schema860.properties.status.enum },
                  message: 'must be equal to one of the allowed values',
                };
                if (vErrors === null) {
                  vErrors = [err12];
                } else {
                  vErrors.push(err12);
                }
                errors++;
              }
            }
            if (data1.createdAt !== undefined) {
              let data9 = data1.createdAt;
              if (typeof data9 === 'string') {
                if (!formats10.validate(data9)) {
                  const err13 = {
                    instancePath: instancePath + '/items/' + i0 + '/createdAt',
                    schemaPath:
                      '#/components/schemas/ManagementTokenView/properties/createdAt/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/createdAt',
                  schemaPath:
                    '#/components/schemas/ManagementTokenView/properties/createdAt/type',
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
            if (data1.lastUsedAt !== undefined) {
              let data10 = data1.lastUsedAt;
              if (typeof data10 !== 'string' && data10 !== null) {
                const err15 = {
                  instancePath: instancePath + '/items/' + i0 + '/lastUsedAt',
                  schemaPath:
                    '#/components/schemas/ManagementTokenView/properties/lastUsedAt/type',
                  keyword: 'type',
                  params: { type: schema860.properties.lastUsedAt.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err15];
                } else {
                  vErrors.push(err15);
                }
                errors++;
              }
              if (typeof data10 === 'string') {
                if (!formats10.validate(data10)) {
                  const err16 = {
                    instancePath: instancePath + '/items/' + i0 + '/lastUsedAt',
                    schemaPath:
                      '#/components/schemas/ManagementTokenView/properties/lastUsedAt/format',
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
              }
            }
            if (data1.revokedAt !== undefined) {
              let data11 = data1.revokedAt;
              if (typeof data11 !== 'string' && data11 !== null) {
                const err17 = {
                  instancePath: instancePath + '/items/' + i0 + '/revokedAt',
                  schemaPath:
                    '#/components/schemas/ManagementTokenView/properties/revokedAt/type',
                  keyword: 'type',
                  params: { type: schema860.properties.revokedAt.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err17];
                } else {
                  vErrors.push(err17);
                }
                errors++;
              }
              if (typeof data11 === 'string') {
                if (!formats10.validate(data11)) {
                  const err18 = {
                    instancePath: instancePath + '/items/' + i0 + '/revokedAt',
                    schemaPath:
                      '#/components/schemas/ManagementTokenView/properties/revokedAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
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
          } else {
            const err19 = {
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/ManagementTokenView/type',
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
        }
      } else {
        const err20 = {
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
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
    if (data.nextCursor !== undefined) {
      let data12 = data.nextCursor;
      if (typeof data12 !== 'string' && data12 !== null) {
        const err21 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
          keyword: 'type',
          params: { type: schema859.properties.nextCursor.type },
          message: 'must be string,null',
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
      instancePath,
      schemaPath: '#/type',
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
  validate753.errors = vErrors;
  return errors === 0;
}
validate753.evaluated = {
  props: { items: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate752(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listManagementTokensOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate752.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate753(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate753.errors
        : vErrors.concat(validate753.errors);
    errors = vErrors.length;
  }
  validate752.errors = vErrors;
  return errors === 0;
}
validate752.evaluated = {
  props: { items: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
