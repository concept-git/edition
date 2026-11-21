// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const listTrashInput = validate1034;
const schema1211 = {
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
        fields: { type: 'string', maxLength: 4096, minLength: 1 },
      },
      required: [],
    },
  },
  required: ['path'],
  $id: 'https://edition.invalid/validators/listTrashInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
function validate1034(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listTrashInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1034.evaluated;
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
        if (data3.fields !== undefined) {
          let data6 = data3.fields;
          if (typeof data6 === 'string') {
            if (func1(data6) > 4096) {
              const err12 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/maxLength',
                keyword: 'maxLength',
                params: { limit: 4096 },
                message: 'must NOT have more than 4096 characters',
              };
              if (vErrors === null) {
                vErrors = [err12];
              } else {
                vErrors.push(err12);
              }
              errors++;
            }
            if (func1(data6) < 1) {
              const err13 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
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
              instancePath: instancePath + '/query/fields',
              schemaPath: '#/properties/query/properties/fields/type',
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
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
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
  } else {
    const err16 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err16];
    } else {
      vErrors.push(err16);
    }
    errors++;
  }
  validate1034.errors = vErrors;
  return errors === 0;
}
validate1034.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const listTrashOutput = validate1035;
const schema1212 = {
  anyOf: [
    { $ref: 'https://edition.invalid/control#/components/schemas/TrashPage' },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialTrashPage',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/listTrashOutput',
};
const schema1213 = {
  type: 'object',
  properties: {
    items: { type: 'array', items: { $ref: '#/components/schemas/TrashItem' } },
    nextCursor: { type: ['string', 'null'] },
    total: { type: ['integer', 'null'], format: 'int64' },
    allowedActions: {
      type: 'array',
      items: { type: 'string' },
      uniqueItems: true,
    },
  },
};
const schema1214 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    title: { type: 'string' },
    slug: { type: 'string' },
    status: { type: 'string' },
    format: { type: 'string' },
    trashedAt: { type: ['string', 'null'], format: 'date-time' },
    allowedActions: {
      type: 'array',
      items: { type: 'string' },
      uniqueItems: true,
    },
  },
};
const formats10 = fullFormats['date-time'];
function validate1036(
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
  const evaluated0 = validate1036.evaluated;
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
                      '#/components/schemas/TrashItem/properties/id/format',
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
                    '#/components/schemas/TrashItem/properties/id/type',
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
                    '#/components/schemas/TrashItem/properties/title/type',
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
                    '#/components/schemas/TrashItem/properties/slug/type',
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
                    '#/components/schemas/TrashItem/properties/status/type',
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
                    '#/components/schemas/TrashItem/properties/format/type',
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
            if (data1.trashedAt !== undefined) {
              let data7 = data1.trashedAt;
              if (typeof data7 !== 'string' && data7 !== null) {
                const err6 = {
                  instancePath: instancePath + '/items/' + i0 + '/trashedAt',
                  schemaPath:
                    '#/components/schemas/TrashItem/properties/trashedAt/type',
                  keyword: 'type',
                  params: { type: schema1214.properties.trashedAt.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err6];
                } else {
                  vErrors.push(err6);
                }
                errors++;
              }
              if (typeof data7 === 'string') {
                if (!formats10.validate(data7)) {
                  const err7 = {
                    instancePath: instancePath + '/items/' + i0 + '/trashedAt',
                    schemaPath:
                      '#/components/schemas/TrashItem/properties/trashedAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
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
                        '#/components/schemas/TrashItem/properties/allowedActions/items/type',
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
                          '#/components/schemas/TrashItem/properties/allowedActions/uniqueItems',
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
                    '#/components/schemas/TrashItem/properties/allowedActions/type',
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
              schemaPath: '#/components/schemas/TrashItem/type',
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
      let data10 = data.nextCursor;
      if (typeof data10 !== 'string' && data10 !== null) {
        const err13 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
          keyword: 'type',
          params: { type: schema1213.properties.nextCursor.type },
          message: 'must be string,null',
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
      if (
        !(typeof data11 == 'number' && !(data11 % 1) && !isNaN(data11)) &&
        data11 !== null
      ) {
        const err14 = {
          instancePath: instancePath + '/total',
          schemaPath: '#/properties/total/type',
          keyword: 'type',
          params: { type: schema1213.properties.total.type },
          message: 'must be integer,null',
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
      let data12 = data.allowedActions;
      if (Array.isArray(data12)) {
        const len2 = data12.length;
        for (let i3 = 0; i3 < len2; i3++) {
          if (typeof data12[i3] !== 'string') {
            const err15 = {
              instancePath: instancePath + '/allowedActions/' + i3,
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
        let i4 = data12.length;
        let j1;
        if (i4 > 1) {
          const indices1 = {};
          for (; i4--;) {
            let item1 = data12[i4];
            if (typeof item1 !== 'string') {
              continue;
            }
            if (typeof indices1[item1] == 'number') {
              j1 = indices1[item1];
              const err16 = {
                instancePath: instancePath + '/allowedActions',
                schemaPath: '#/properties/allowedActions/uniqueItems',
                keyword: 'uniqueItems',
                params: { i: i4, j: j1 },
                message:
                  'must NOT have duplicate items (items ## ' +
                  j1 +
                  ' and ' +
                  i4 +
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
            indices1[item1] = i4;
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
  validate1036.errors = vErrors;
  return errors === 0;
}
validate1036.evaluated = {
  props: { items: true, nextCursor: true, total: true, allowedActions: true },
  dynamicProps: false,
  dynamicItems: false,
};
const schema1215 = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialTrashItem' },
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
const schema1216 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    title: { type: 'string' },
    slug: { type: 'string' },
    status: { type: 'string' },
    format: { type: 'string' },
    trashedAt: { type: ['string', 'null'], format: 'date-time' },
    allowedActions: {
      type: 'array',
      items: { type: 'string' },
      uniqueItems: true,
    },
  },
};
function validate1038(
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
  const evaluated0 = validate1038.evaluated;
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
                      '#/components/schemas/PartialTrashItem/properties/id/format',
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
                    '#/components/schemas/PartialTrashItem/properties/id/type',
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
                    '#/components/schemas/PartialTrashItem/properties/title/type',
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
                    '#/components/schemas/PartialTrashItem/properties/slug/type',
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
                    '#/components/schemas/PartialTrashItem/properties/status/type',
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
                    '#/components/schemas/PartialTrashItem/properties/format/type',
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
            if (data1.trashedAt !== undefined) {
              let data7 = data1.trashedAt;
              if (typeof data7 !== 'string' && data7 !== null) {
                const err6 = {
                  instancePath: instancePath + '/items/' + i0 + '/trashedAt',
                  schemaPath:
                    '#/components/schemas/PartialTrashItem/properties/trashedAt/type',
                  keyword: 'type',
                  params: { type: schema1216.properties.trashedAt.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err6];
                } else {
                  vErrors.push(err6);
                }
                errors++;
              }
              if (typeof data7 === 'string') {
                if (!formats10.validate(data7)) {
                  const err7 = {
                    instancePath: instancePath + '/items/' + i0 + '/trashedAt',
                    schemaPath:
                      '#/components/schemas/PartialTrashItem/properties/trashedAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
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
                        '#/components/schemas/PartialTrashItem/properties/allowedActions/items/type',
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
                          '#/components/schemas/PartialTrashItem/properties/allowedActions/uniqueItems',
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
                    '#/components/schemas/PartialTrashItem/properties/allowedActions/type',
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
              schemaPath: '#/components/schemas/PartialTrashItem/type',
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
      let data10 = data.nextCursor;
      if (typeof data10 !== 'string' && data10 !== null) {
        const err13 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
          keyword: 'type',
          params: { type: schema1215.properties.nextCursor.type },
          message: 'must be string,null',
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
      if (
        !(typeof data11 == 'number' && !(data11 % 1) && !isNaN(data11)) &&
        data11 !== null
      ) {
        const err14 = {
          instancePath: instancePath + '/total',
          schemaPath: '#/properties/total/type',
          keyword: 'type',
          params: { type: schema1215.properties.total.type },
          message: 'must be integer,null',
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
      let data12 = data.allowedActions;
      if (Array.isArray(data12)) {
        const len2 = data12.length;
        for (let i3 = 0; i3 < len2; i3++) {
          if (typeof data12[i3] !== 'string') {
            const err15 = {
              instancePath: instancePath + '/allowedActions/' + i3,
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
        let i4 = data12.length;
        let j1;
        if (i4 > 1) {
          const indices1 = {};
          for (; i4--;) {
            let item1 = data12[i4];
            if (typeof item1 !== 'string') {
              continue;
            }
            if (typeof indices1[item1] == 'number') {
              j1 = indices1[item1];
              const err16 = {
                instancePath: instancePath + '/allowedActions',
                schemaPath: '#/properties/allowedActions/uniqueItems',
                keyword: 'uniqueItems',
                params: { i: i4, j: j1 },
                message:
                  'must NOT have duplicate items (items ## ' +
                  j1 +
                  ' and ' +
                  i4 +
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
            indices1[item1] = i4;
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
  validate1038.errors = vErrors;
  return errors === 0;
}
validate1038.evaluated = {
  props: { items: true, nextCursor: true, total: true, allowedActions: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1035(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listTrashOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1035.evaluated;
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
    !validate1036(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1036.errors
        : vErrors.concat(validate1036.errors);
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
    !validate1038(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1038.errors
        : vErrors.concat(validate1038.errors);
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
  validate1035.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate1035.evaluated = { dynamicProps: true, dynamicItems: false };
export const listTrashOutputFull = validate1040;
const schema1217 = {
  $ref: 'https://edition.invalid/control#/components/schemas/TrashPage',
  $id: 'https://edition.invalid/validators/listTrashOutputFull',
};
function validate1041(
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
  const evaluated0 = validate1041.evaluated;
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
                      '#/components/schemas/TrashItem/properties/id/format',
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
                    '#/components/schemas/TrashItem/properties/id/type',
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
                    '#/components/schemas/TrashItem/properties/title/type',
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
                    '#/components/schemas/TrashItem/properties/slug/type',
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
                    '#/components/schemas/TrashItem/properties/status/type',
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
                    '#/components/schemas/TrashItem/properties/format/type',
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
            if (data1.trashedAt !== undefined) {
              let data7 = data1.trashedAt;
              if (typeof data7 !== 'string' && data7 !== null) {
                const err6 = {
                  instancePath: instancePath + '/items/' + i0 + '/trashedAt',
                  schemaPath:
                    '#/components/schemas/TrashItem/properties/trashedAt/type',
                  keyword: 'type',
                  params: { type: schema1214.properties.trashedAt.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err6];
                } else {
                  vErrors.push(err6);
                }
                errors++;
              }
              if (typeof data7 === 'string') {
                if (!formats10.validate(data7)) {
                  const err7 = {
                    instancePath: instancePath + '/items/' + i0 + '/trashedAt',
                    schemaPath:
                      '#/components/schemas/TrashItem/properties/trashedAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
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
                        '#/components/schemas/TrashItem/properties/allowedActions/items/type',
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
                          '#/components/schemas/TrashItem/properties/allowedActions/uniqueItems',
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
                    '#/components/schemas/TrashItem/properties/allowedActions/type',
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
              schemaPath: '#/components/schemas/TrashItem/type',
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
      let data10 = data.nextCursor;
      if (typeof data10 !== 'string' && data10 !== null) {
        const err13 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
          keyword: 'type',
          params: { type: schema1213.properties.nextCursor.type },
          message: 'must be string,null',
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
      if (
        !(typeof data11 == 'number' && !(data11 % 1) && !isNaN(data11)) &&
        data11 !== null
      ) {
        const err14 = {
          instancePath: instancePath + '/total',
          schemaPath: '#/properties/total/type',
          keyword: 'type',
          params: { type: schema1213.properties.total.type },
          message: 'must be integer,null',
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
      let data12 = data.allowedActions;
      if (Array.isArray(data12)) {
        const len2 = data12.length;
        for (let i3 = 0; i3 < len2; i3++) {
          if (typeof data12[i3] !== 'string') {
            const err15 = {
              instancePath: instancePath + '/allowedActions/' + i3,
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
        let i4 = data12.length;
        let j1;
        if (i4 > 1) {
          const indices1 = {};
          for (; i4--;) {
            let item1 = data12[i4];
            if (typeof item1 !== 'string') {
              continue;
            }
            if (typeof indices1[item1] == 'number') {
              j1 = indices1[item1];
              const err16 = {
                instancePath: instancePath + '/allowedActions',
                schemaPath: '#/properties/allowedActions/uniqueItems',
                keyword: 'uniqueItems',
                params: { i: i4, j: j1 },
                message:
                  'must NOT have duplicate items (items ## ' +
                  j1 +
                  ' and ' +
                  i4 +
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
            indices1[item1] = i4;
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
  validate1041.errors = vErrors;
  return errors === 0;
}
validate1041.evaluated = {
  props: { items: true, nextCursor: true, total: true, allowedActions: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1040(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listTrashOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1040.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate1041(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1041.errors
        : vErrors.concat(validate1041.errors);
    errors = vErrors.length;
  }
  validate1040.errors = vErrors;
  return errors === 0;
}
validate1040.evaluated = {
  props: { items: true, nextCursor: true, total: true, allowedActions: true },
  dynamicProps: false,
  dynamicItems: false,
};
