// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
('use strict');
export const listInput = validate260;
const schema352 = {
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
      },
      required: [],
    },
  },
  required: ['path'],
  $id: 'https://edition.invalid/validators/listInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
function validate260(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate260.evaluated;
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
      } else {
        const err9 = {
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
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
  validate260.errors = vErrors;
  return errors === 0;
}
validate260.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const listOutput = validate261;
const schema353 = {
  $ref: 'https://edition.invalid/control#/components/schemas/TokenPage',
  $id: 'https://edition.invalid/validators/listOutput',
};
const schema354 = {
  type: 'object',
  properties: {
    tokens: {
      type: 'array',
      items: { $ref: '#/components/schemas/TokenView' },
    },
    nextCursor: { type: 'string' },
    total: { type: 'integer', format: 'int64' },
  },
};
const schema355 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    ownerId: { type: 'string', format: 'uuid' },
    tenantId: { type: 'string', format: 'uuid' },
    spaceId: { type: 'string', format: 'uuid' },
    role: { type: 'string' },
    scopes: { type: 'array', items: { type: 'string' }, uniqueItems: true },
    expiry: { type: 'string', format: 'date-time' },
    status: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
  },
};
const formats10 = fullFormats['date-time'];
function validate262(
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
  const evaluated0 = validate262.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.tokens !== undefined) {
      let data0 = data.tokens;
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
                    instancePath: instancePath + '/tokens/' + i0 + '/id',
                    schemaPath:
                      '#/components/schemas/TokenView/properties/id/format',
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
                  instancePath: instancePath + '/tokens/' + i0 + '/id',
                  schemaPath:
                    '#/components/schemas/TokenView/properties/id/type',
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
                  instancePath: instancePath + '/tokens/' + i0 + '/name',
                  schemaPath:
                    '#/components/schemas/TokenView/properties/name/type',
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
            if (data1.ownerId !== undefined) {
              let data4 = data1.ownerId;
              if (typeof data4 === 'string') {
                if (!formats0.test(data4)) {
                  const err3 = {
                    instancePath: instancePath + '/tokens/' + i0 + '/ownerId',
                    schemaPath:
                      '#/components/schemas/TokenView/properties/ownerId/format',
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
                  instancePath: instancePath + '/tokens/' + i0 + '/ownerId',
                  schemaPath:
                    '#/components/schemas/TokenView/properties/ownerId/type',
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
            if (data1.tenantId !== undefined) {
              let data5 = data1.tenantId;
              if (typeof data5 === 'string') {
                if (!formats0.test(data5)) {
                  const err5 = {
                    instancePath: instancePath + '/tokens/' + i0 + '/tenantId',
                    schemaPath:
                      '#/components/schemas/TokenView/properties/tenantId/format',
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
                  instancePath: instancePath + '/tokens/' + i0 + '/tenantId',
                  schemaPath:
                    '#/components/schemas/TokenView/properties/tenantId/type',
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
            if (data1.spaceId !== undefined) {
              let data6 = data1.spaceId;
              if (typeof data6 === 'string') {
                if (!formats0.test(data6)) {
                  const err7 = {
                    instancePath: instancePath + '/tokens/' + i0 + '/spaceId',
                    schemaPath:
                      '#/components/schemas/TokenView/properties/spaceId/format',
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
                  instancePath: instancePath + '/tokens/' + i0 + '/spaceId',
                  schemaPath:
                    '#/components/schemas/TokenView/properties/spaceId/type',
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
            if (data1.role !== undefined) {
              if (typeof data1.role !== 'string') {
                const err9 = {
                  instancePath: instancePath + '/tokens/' + i0 + '/role',
                  schemaPath:
                    '#/components/schemas/TokenView/properties/role/type',
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
            if (data1.scopes !== undefined) {
              let data8 = data1.scopes;
              if (Array.isArray(data8)) {
                const len1 = data8.length;
                for (let i1 = 0; i1 < len1; i1++) {
                  if (typeof data8[i1] !== 'string') {
                    const err10 = {
                      instancePath:
                        instancePath + '/tokens/' + i0 + '/scopes/' + i1,
                      schemaPath:
                        '#/components/schemas/TokenView/properties/scopes/items/type',
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
                      const err11 = {
                        instancePath:
                          instancePath + '/tokens/' + i0 + '/scopes',
                        schemaPath:
                          '#/components/schemas/TokenView/properties/scopes/uniqueItems',
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
                        vErrors = [err11];
                      } else {
                        vErrors.push(err11);
                      }
                      errors++;
                      break;
                    }
                    indices0[item0] = i2;
                  }
                }
              } else {
                const err12 = {
                  instancePath: instancePath + '/tokens/' + i0 + '/scopes',
                  schemaPath:
                    '#/components/schemas/TokenView/properties/scopes/type',
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
            if (data1.expiry !== undefined) {
              let data10 = data1.expiry;
              if (typeof data10 === 'string') {
                if (!formats10.validate(data10)) {
                  const err13 = {
                    instancePath: instancePath + '/tokens/' + i0 + '/expiry',
                    schemaPath:
                      '#/components/schemas/TokenView/properties/expiry/format',
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
                  instancePath: instancePath + '/tokens/' + i0 + '/expiry',
                  schemaPath:
                    '#/components/schemas/TokenView/properties/expiry/type',
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
            if (data1.status !== undefined) {
              if (typeof data1.status !== 'string') {
                const err15 = {
                  instancePath: instancePath + '/tokens/' + i0 + '/status',
                  schemaPath:
                    '#/components/schemas/TokenView/properties/status/type',
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
            if (data1.createdAt !== undefined) {
              let data12 = data1.createdAt;
              if (typeof data12 === 'string') {
                if (!formats10.validate(data12)) {
                  const err16 = {
                    instancePath: instancePath + '/tokens/' + i0 + '/createdAt',
                    schemaPath:
                      '#/components/schemas/TokenView/properties/createdAt/format',
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
                  instancePath: instancePath + '/tokens/' + i0 + '/createdAt',
                  schemaPath:
                    '#/components/schemas/TokenView/properties/createdAt/type',
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
              instancePath: instancePath + '/tokens/' + i0,
              schemaPath: '#/components/schemas/TokenView/type',
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
          instancePath: instancePath + '/tokens',
          schemaPath: '#/properties/tokens/type',
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
    if (data.nextCursor !== undefined) {
      if (typeof data.nextCursor !== 'string') {
        const err20 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
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
    if (data.total !== undefined) {
      let data14 = data.total;
      if (!(typeof data14 == 'number' && !(data14 % 1) && !isNaN(data14))) {
        const err21 = {
          instancePath: instancePath + '/total',
          schemaPath: '#/properties/total/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
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
  validate262.errors = vErrors;
  return errors === 0;
}
validate262.evaluated = {
  props: { tokens: true, nextCursor: true, total: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate261(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate261.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate262(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate262.errors
        : vErrors.concat(validate262.errors);
    errors = vErrors.length;
  }
  validate261.errors = vErrors;
  return errors === 0;
}
validate261.evaluated = {
  props: { tokens: true, nextCursor: true, total: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const listOutputFull = validate264;
const schema356 = {
  $ref: 'https://edition.invalid/control#/components/schemas/TokenPage',
  $id: 'https://edition.invalid/validators/listOutputFull',
};
function validate265(
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
  const evaluated0 = validate265.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.tokens !== undefined) {
      let data0 = data.tokens;
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
                    instancePath: instancePath + '/tokens/' + i0 + '/id',
                    schemaPath:
                      '#/components/schemas/TokenView/properties/id/format',
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
                  instancePath: instancePath + '/tokens/' + i0 + '/id',
                  schemaPath:
                    '#/components/schemas/TokenView/properties/id/type',
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
                  instancePath: instancePath + '/tokens/' + i0 + '/name',
                  schemaPath:
                    '#/components/schemas/TokenView/properties/name/type',
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
            if (data1.ownerId !== undefined) {
              let data4 = data1.ownerId;
              if (typeof data4 === 'string') {
                if (!formats0.test(data4)) {
                  const err3 = {
                    instancePath: instancePath + '/tokens/' + i0 + '/ownerId',
                    schemaPath:
                      '#/components/schemas/TokenView/properties/ownerId/format',
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
                  instancePath: instancePath + '/tokens/' + i0 + '/ownerId',
                  schemaPath:
                    '#/components/schemas/TokenView/properties/ownerId/type',
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
            if (data1.tenantId !== undefined) {
              let data5 = data1.tenantId;
              if (typeof data5 === 'string') {
                if (!formats0.test(data5)) {
                  const err5 = {
                    instancePath: instancePath + '/tokens/' + i0 + '/tenantId',
                    schemaPath:
                      '#/components/schemas/TokenView/properties/tenantId/format',
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
                  instancePath: instancePath + '/tokens/' + i0 + '/tenantId',
                  schemaPath:
                    '#/components/schemas/TokenView/properties/tenantId/type',
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
            if (data1.spaceId !== undefined) {
              let data6 = data1.spaceId;
              if (typeof data6 === 'string') {
                if (!formats0.test(data6)) {
                  const err7 = {
                    instancePath: instancePath + '/tokens/' + i0 + '/spaceId',
                    schemaPath:
                      '#/components/schemas/TokenView/properties/spaceId/format',
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
                  instancePath: instancePath + '/tokens/' + i0 + '/spaceId',
                  schemaPath:
                    '#/components/schemas/TokenView/properties/spaceId/type',
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
            if (data1.role !== undefined) {
              if (typeof data1.role !== 'string') {
                const err9 = {
                  instancePath: instancePath + '/tokens/' + i0 + '/role',
                  schemaPath:
                    '#/components/schemas/TokenView/properties/role/type',
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
            if (data1.scopes !== undefined) {
              let data8 = data1.scopes;
              if (Array.isArray(data8)) {
                const len1 = data8.length;
                for (let i1 = 0; i1 < len1; i1++) {
                  if (typeof data8[i1] !== 'string') {
                    const err10 = {
                      instancePath:
                        instancePath + '/tokens/' + i0 + '/scopes/' + i1,
                      schemaPath:
                        '#/components/schemas/TokenView/properties/scopes/items/type',
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
                      const err11 = {
                        instancePath:
                          instancePath + '/tokens/' + i0 + '/scopes',
                        schemaPath:
                          '#/components/schemas/TokenView/properties/scopes/uniqueItems',
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
                        vErrors = [err11];
                      } else {
                        vErrors.push(err11);
                      }
                      errors++;
                      break;
                    }
                    indices0[item0] = i2;
                  }
                }
              } else {
                const err12 = {
                  instancePath: instancePath + '/tokens/' + i0 + '/scopes',
                  schemaPath:
                    '#/components/schemas/TokenView/properties/scopes/type',
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
            if (data1.expiry !== undefined) {
              let data10 = data1.expiry;
              if (typeof data10 === 'string') {
                if (!formats10.validate(data10)) {
                  const err13 = {
                    instancePath: instancePath + '/tokens/' + i0 + '/expiry',
                    schemaPath:
                      '#/components/schemas/TokenView/properties/expiry/format',
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
                  instancePath: instancePath + '/tokens/' + i0 + '/expiry',
                  schemaPath:
                    '#/components/schemas/TokenView/properties/expiry/type',
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
            if (data1.status !== undefined) {
              if (typeof data1.status !== 'string') {
                const err15 = {
                  instancePath: instancePath + '/tokens/' + i0 + '/status',
                  schemaPath:
                    '#/components/schemas/TokenView/properties/status/type',
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
            if (data1.createdAt !== undefined) {
              let data12 = data1.createdAt;
              if (typeof data12 === 'string') {
                if (!formats10.validate(data12)) {
                  const err16 = {
                    instancePath: instancePath + '/tokens/' + i0 + '/createdAt',
                    schemaPath:
                      '#/components/schemas/TokenView/properties/createdAt/format',
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
                  instancePath: instancePath + '/tokens/' + i0 + '/createdAt',
                  schemaPath:
                    '#/components/schemas/TokenView/properties/createdAt/type',
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
              instancePath: instancePath + '/tokens/' + i0,
              schemaPath: '#/components/schemas/TokenView/type',
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
          instancePath: instancePath + '/tokens',
          schemaPath: '#/properties/tokens/type',
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
    if (data.nextCursor !== undefined) {
      if (typeof data.nextCursor !== 'string') {
        const err20 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
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
    if (data.total !== undefined) {
      let data14 = data.total;
      if (!(typeof data14 == 'number' && !(data14 % 1) && !isNaN(data14))) {
        const err21 = {
          instancePath: instancePath + '/total',
          schemaPath: '#/properties/total/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
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
  validate265.errors = vErrors;
  return errors === 0;
}
validate265.evaluated = {
  props: { tokens: true, nextCursor: true, total: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate264(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate264.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate265(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate265.errors
        : vErrors.concat(validate265.errors);
    errors = vErrors.length;
  }
  validate264.errors = vErrors;
  return errors === 0;
}
validate264.evaluated = {
  props: { tokens: true, nextCursor: true, total: true },
  dynamicProps: false,
  dynamicItems: false,
};
