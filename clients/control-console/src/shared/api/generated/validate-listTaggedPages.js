// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const listTaggedPagesInput = validate1022;
const schema1196 = {
  type: 'object',
  properties: {
    path: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', format: 'uuid' },
        label: { type: 'string' },
      },
      required: ['tenantId', 'label'],
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
  $id: 'https://edition.invalid/validators/listTaggedPagesInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
function validate1022(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listTaggedPagesInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1022.evaluated;
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
        if (data0.label === undefined) {
          const err2 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'label' },
            message: "must have required property '" + 'label' + "'",
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
        if (data0.label !== undefined) {
          if (typeof data0.label !== 'string') {
            const err5 = {
              instancePath: instancePath + '/path/label',
              schemaPath: '#/properties/path/properties/label/type',
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
      } else {
        const err6 = {
          instancePath: instancePath + '/path',
          schemaPath: '#/properties/path/type',
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
    }
    if (data.query !== undefined) {
      let data3 = data.query;
      if (data3 && typeof data3 == 'object' && !Array.isArray(data3)) {
        if (data3.cursor !== undefined) {
          if (typeof data3.cursor !== 'string') {
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
        if (data3.limit !== undefined) {
          let data5 = data3.limit;
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
        if (data3.fields !== undefined) {
          let data6 = data3.fields;
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
  validate1022.errors = vErrors;
  return errors === 0;
}
validate1022.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const listTaggedPagesOutput = validate1023;
const schema1197 = {
  anyOf: [
    {
      $ref: 'https://edition.invalid/control#/components/schemas/TaggedPagePage',
    },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialTaggedPagePage',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/listTaggedPagesOutput',
};
const schema1198 = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { $ref: '#/components/schemas/TaggedPage' },
    },
    nextCursor: { type: 'string' },
  },
};
const schema1199 = {
  type: 'object',
  description: 'PageSummary plus spaceId for cross-space aggregation',
  properties: {
    id: { type: 'string', format: 'uuid' },
    title: { type: 'string' },
    slug: { type: 'string' },
    spaceId: { type: 'string', format: 'uuid' },
    status: { type: 'string' },
    format: { type: 'string' },
    icon: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' } },
    driftFlag: { type: 'boolean' },
    updatedAt: { type: 'string', format: 'date-time' },
    updatedBy: { type: 'string', format: 'uuid' },
    publishedAt: { type: 'string', format: 'date-time' },
    allowedActions: {
      type: 'array',
      items: { type: 'string' },
      uniqueItems: true,
    },
  },
};
const formats10 = fullFormats['date-time'];
function validate1024(
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
  const evaluated0 = validate1024.evaluated;
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
                      '#/components/schemas/TaggedPage/properties/id/format',
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
                    '#/components/schemas/TaggedPage/properties/id/type',
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
                    '#/components/schemas/TaggedPage/properties/title/type',
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
                    '#/components/schemas/TaggedPage/properties/slug/type',
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
            if (data1.spaceId !== undefined) {
              let data5 = data1.spaceId;
              if (typeof data5 === 'string') {
                if (!formats0.test(data5)) {
                  const err4 = {
                    instancePath: instancePath + '/items/' + i0 + '/spaceId',
                    schemaPath:
                      '#/components/schemas/TaggedPage/properties/spaceId/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/spaceId',
                  schemaPath:
                    '#/components/schemas/TaggedPage/properties/spaceId/type',
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
            if (data1.status !== undefined) {
              if (typeof data1.status !== 'string') {
                const err6 = {
                  instancePath: instancePath + '/items/' + i0 + '/status',
                  schemaPath:
                    '#/components/schemas/TaggedPage/properties/status/type',
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
            if (data1.format !== undefined) {
              if (typeof data1.format !== 'string') {
                const err7 = {
                  instancePath: instancePath + '/items/' + i0 + '/format',
                  schemaPath:
                    '#/components/schemas/TaggedPage/properties/format/type',
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
            if (data1.icon !== undefined) {
              if (typeof data1.icon !== 'string') {
                const err8 = {
                  instancePath: instancePath + '/items/' + i0 + '/icon',
                  schemaPath:
                    '#/components/schemas/TaggedPage/properties/icon/type',
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
            if (data1.tags !== undefined) {
              let data9 = data1.tags;
              if (Array.isArray(data9)) {
                const len1 = data9.length;
                for (let i1 = 0; i1 < len1; i1++) {
                  if (typeof data9[i1] !== 'string') {
                    const err9 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/tags/' + i1,
                      schemaPath:
                        '#/components/schemas/TaggedPage/properties/tags/items/type',
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
              } else {
                const err10 = {
                  instancePath: instancePath + '/items/' + i0 + '/tags',
                  schemaPath:
                    '#/components/schemas/TaggedPage/properties/tags/type',
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
            if (data1.driftFlag !== undefined) {
              if (typeof data1.driftFlag !== 'boolean') {
                const err11 = {
                  instancePath: instancePath + '/items/' + i0 + '/driftFlag',
                  schemaPath:
                    '#/components/schemas/TaggedPage/properties/driftFlag/type',
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
            if (data1.updatedAt !== undefined) {
              let data12 = data1.updatedAt;
              if (typeof data12 === 'string') {
                if (!formats10.validate(data12)) {
                  const err12 = {
                    instancePath: instancePath + '/items/' + i0 + '/updatedAt',
                    schemaPath:
                      '#/components/schemas/TaggedPage/properties/updatedAt/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/updatedAt',
                  schemaPath:
                    '#/components/schemas/TaggedPage/properties/updatedAt/type',
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
            if (data1.updatedBy !== undefined) {
              let data13 = data1.updatedBy;
              if (typeof data13 === 'string') {
                if (!formats0.test(data13)) {
                  const err14 = {
                    instancePath: instancePath + '/items/' + i0 + '/updatedBy',
                    schemaPath:
                      '#/components/schemas/TaggedPage/properties/updatedBy/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/updatedBy',
                  schemaPath:
                    '#/components/schemas/TaggedPage/properties/updatedBy/type',
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
            if (data1.publishedAt !== undefined) {
              let data14 = data1.publishedAt;
              if (typeof data14 === 'string') {
                if (!formats10.validate(data14)) {
                  const err16 = {
                    instancePath:
                      instancePath + '/items/' + i0 + '/publishedAt',
                    schemaPath:
                      '#/components/schemas/TaggedPage/properties/publishedAt/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/publishedAt',
                  schemaPath:
                    '#/components/schemas/TaggedPage/properties/publishedAt/type',
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
            if (data1.allowedActions !== undefined) {
              let data15 = data1.allowedActions;
              if (Array.isArray(data15)) {
                const len2 = data15.length;
                for (let i2 = 0; i2 < len2; i2++) {
                  if (typeof data15[i2] !== 'string') {
                    const err18 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/allowedActions/' + i2,
                      schemaPath:
                        '#/components/schemas/TaggedPage/properties/allowedActions/items/type',
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
                let i3 = data15.length;
                let j0;
                if (i3 > 1) {
                  const indices0 = {};
                  for (; i3--;) {
                    let item0 = data15[i3];
                    if (typeof item0 !== 'string') {
                      continue;
                    }
                    if (typeof indices0[item0] == 'number') {
                      j0 = indices0[item0];
                      const err19 = {
                        instancePath:
                          instancePath + '/items/' + i0 + '/allowedActions',
                        schemaPath:
                          '#/components/schemas/TaggedPage/properties/allowedActions/uniqueItems',
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
                        vErrors = [err19];
                      } else {
                        vErrors.push(err19);
                      }
                      errors++;
                      break;
                    }
                    indices0[item0] = i3;
                  }
                }
              } else {
                const err20 = {
                  instancePath:
                    instancePath + '/items/' + i0 + '/allowedActions',
                  schemaPath:
                    '#/components/schemas/TaggedPage/properties/allowedActions/type',
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
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/TaggedPage/type',
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
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
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
    if (data.nextCursor !== undefined) {
      if (typeof data.nextCursor !== 'string') {
        const err23 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
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
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err24];
    } else {
      vErrors.push(err24);
    }
    errors++;
  }
  validate1024.errors = vErrors;
  return errors === 0;
}
validate1024.evaluated = {
  props: { items: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
const schema1200 = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialTaggedPage' },
    },
    nextCursor: { type: 'string' },
  },
};
const schema1201 = {
  type: 'object',
  description: 'PageSummary plus spaceId for cross-space aggregation',
  properties: {
    id: { type: 'string', format: 'uuid' },
    title: { type: 'string' },
    slug: { type: 'string' },
    spaceId: { type: 'string', format: 'uuid' },
    status: { type: 'string' },
    format: { type: 'string' },
    icon: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' } },
    driftFlag: { type: 'boolean' },
    updatedAt: { type: 'string', format: 'date-time' },
    updatedBy: { type: 'string', format: 'uuid' },
    publishedAt: { type: 'string', format: 'date-time' },
    allowedActions: {
      type: 'array',
      items: { type: 'string' },
      uniqueItems: true,
    },
  },
};
function validate1026(
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
  const evaluated0 = validate1026.evaluated;
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
                      '#/components/schemas/PartialTaggedPage/properties/id/format',
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
                    '#/components/schemas/PartialTaggedPage/properties/id/type',
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
                    '#/components/schemas/PartialTaggedPage/properties/title/type',
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
                    '#/components/schemas/PartialTaggedPage/properties/slug/type',
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
            if (data1.spaceId !== undefined) {
              let data5 = data1.spaceId;
              if (typeof data5 === 'string') {
                if (!formats0.test(data5)) {
                  const err4 = {
                    instancePath: instancePath + '/items/' + i0 + '/spaceId',
                    schemaPath:
                      '#/components/schemas/PartialTaggedPage/properties/spaceId/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/spaceId',
                  schemaPath:
                    '#/components/schemas/PartialTaggedPage/properties/spaceId/type',
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
            if (data1.status !== undefined) {
              if (typeof data1.status !== 'string') {
                const err6 = {
                  instancePath: instancePath + '/items/' + i0 + '/status',
                  schemaPath:
                    '#/components/schemas/PartialTaggedPage/properties/status/type',
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
            if (data1.format !== undefined) {
              if (typeof data1.format !== 'string') {
                const err7 = {
                  instancePath: instancePath + '/items/' + i0 + '/format',
                  schemaPath:
                    '#/components/schemas/PartialTaggedPage/properties/format/type',
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
            if (data1.icon !== undefined) {
              if (typeof data1.icon !== 'string') {
                const err8 = {
                  instancePath: instancePath + '/items/' + i0 + '/icon',
                  schemaPath:
                    '#/components/schemas/PartialTaggedPage/properties/icon/type',
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
            if (data1.tags !== undefined) {
              let data9 = data1.tags;
              if (Array.isArray(data9)) {
                const len1 = data9.length;
                for (let i1 = 0; i1 < len1; i1++) {
                  if (typeof data9[i1] !== 'string') {
                    const err9 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/tags/' + i1,
                      schemaPath:
                        '#/components/schemas/PartialTaggedPage/properties/tags/items/type',
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
              } else {
                const err10 = {
                  instancePath: instancePath + '/items/' + i0 + '/tags',
                  schemaPath:
                    '#/components/schemas/PartialTaggedPage/properties/tags/type',
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
            if (data1.driftFlag !== undefined) {
              if (typeof data1.driftFlag !== 'boolean') {
                const err11 = {
                  instancePath: instancePath + '/items/' + i0 + '/driftFlag',
                  schemaPath:
                    '#/components/schemas/PartialTaggedPage/properties/driftFlag/type',
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
            if (data1.updatedAt !== undefined) {
              let data12 = data1.updatedAt;
              if (typeof data12 === 'string') {
                if (!formats10.validate(data12)) {
                  const err12 = {
                    instancePath: instancePath + '/items/' + i0 + '/updatedAt',
                    schemaPath:
                      '#/components/schemas/PartialTaggedPage/properties/updatedAt/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/updatedAt',
                  schemaPath:
                    '#/components/schemas/PartialTaggedPage/properties/updatedAt/type',
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
            if (data1.updatedBy !== undefined) {
              let data13 = data1.updatedBy;
              if (typeof data13 === 'string') {
                if (!formats0.test(data13)) {
                  const err14 = {
                    instancePath: instancePath + '/items/' + i0 + '/updatedBy',
                    schemaPath:
                      '#/components/schemas/PartialTaggedPage/properties/updatedBy/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/updatedBy',
                  schemaPath:
                    '#/components/schemas/PartialTaggedPage/properties/updatedBy/type',
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
            if (data1.publishedAt !== undefined) {
              let data14 = data1.publishedAt;
              if (typeof data14 === 'string') {
                if (!formats10.validate(data14)) {
                  const err16 = {
                    instancePath:
                      instancePath + '/items/' + i0 + '/publishedAt',
                    schemaPath:
                      '#/components/schemas/PartialTaggedPage/properties/publishedAt/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/publishedAt',
                  schemaPath:
                    '#/components/schemas/PartialTaggedPage/properties/publishedAt/type',
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
            if (data1.allowedActions !== undefined) {
              let data15 = data1.allowedActions;
              if (Array.isArray(data15)) {
                const len2 = data15.length;
                for (let i2 = 0; i2 < len2; i2++) {
                  if (typeof data15[i2] !== 'string') {
                    const err18 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/allowedActions/' + i2,
                      schemaPath:
                        '#/components/schemas/PartialTaggedPage/properties/allowedActions/items/type',
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
                let i3 = data15.length;
                let j0;
                if (i3 > 1) {
                  const indices0 = {};
                  for (; i3--;) {
                    let item0 = data15[i3];
                    if (typeof item0 !== 'string') {
                      continue;
                    }
                    if (typeof indices0[item0] == 'number') {
                      j0 = indices0[item0];
                      const err19 = {
                        instancePath:
                          instancePath + '/items/' + i0 + '/allowedActions',
                        schemaPath:
                          '#/components/schemas/PartialTaggedPage/properties/allowedActions/uniqueItems',
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
                        vErrors = [err19];
                      } else {
                        vErrors.push(err19);
                      }
                      errors++;
                      break;
                    }
                    indices0[item0] = i3;
                  }
                }
              } else {
                const err20 = {
                  instancePath:
                    instancePath + '/items/' + i0 + '/allowedActions',
                  schemaPath:
                    '#/components/schemas/PartialTaggedPage/properties/allowedActions/type',
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
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/PartialTaggedPage/type',
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
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
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
    if (data.nextCursor !== undefined) {
      if (typeof data.nextCursor !== 'string') {
        const err23 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
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
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err24];
    } else {
      vErrors.push(err24);
    }
    errors++;
  }
  validate1026.errors = vErrors;
  return errors === 0;
}
validate1026.evaluated = {
  props: { items: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1023(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listTaggedPagesOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1023.evaluated;
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
    !validate1024(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1024.errors
        : vErrors.concat(validate1024.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = {};
    props0.items = true;
    props0.nextCursor = true;
  }
  const _errs2 = errors;
  if (
    !validate1026(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1026.errors
        : vErrors.concat(validate1026.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = props0 || {};
      props0.items = true;
      props0.nextCursor = true;
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
  validate1023.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate1023.evaluated = { dynamicProps: true, dynamicItems: false };
export const listTaggedPagesOutputFull = validate1028;
const schema1202 = {
  $ref: 'https://edition.invalid/control#/components/schemas/TaggedPagePage',
  $id: 'https://edition.invalid/validators/listTaggedPagesOutputFull',
};
function validate1029(
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
  const evaluated0 = validate1029.evaluated;
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
                      '#/components/schemas/TaggedPage/properties/id/format',
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
                    '#/components/schemas/TaggedPage/properties/id/type',
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
                    '#/components/schemas/TaggedPage/properties/title/type',
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
                    '#/components/schemas/TaggedPage/properties/slug/type',
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
            if (data1.spaceId !== undefined) {
              let data5 = data1.spaceId;
              if (typeof data5 === 'string') {
                if (!formats0.test(data5)) {
                  const err4 = {
                    instancePath: instancePath + '/items/' + i0 + '/spaceId',
                    schemaPath:
                      '#/components/schemas/TaggedPage/properties/spaceId/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/spaceId',
                  schemaPath:
                    '#/components/schemas/TaggedPage/properties/spaceId/type',
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
            if (data1.status !== undefined) {
              if (typeof data1.status !== 'string') {
                const err6 = {
                  instancePath: instancePath + '/items/' + i0 + '/status',
                  schemaPath:
                    '#/components/schemas/TaggedPage/properties/status/type',
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
            if (data1.format !== undefined) {
              if (typeof data1.format !== 'string') {
                const err7 = {
                  instancePath: instancePath + '/items/' + i0 + '/format',
                  schemaPath:
                    '#/components/schemas/TaggedPage/properties/format/type',
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
            if (data1.icon !== undefined) {
              if (typeof data1.icon !== 'string') {
                const err8 = {
                  instancePath: instancePath + '/items/' + i0 + '/icon',
                  schemaPath:
                    '#/components/schemas/TaggedPage/properties/icon/type',
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
            if (data1.tags !== undefined) {
              let data9 = data1.tags;
              if (Array.isArray(data9)) {
                const len1 = data9.length;
                for (let i1 = 0; i1 < len1; i1++) {
                  if (typeof data9[i1] !== 'string') {
                    const err9 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/tags/' + i1,
                      schemaPath:
                        '#/components/schemas/TaggedPage/properties/tags/items/type',
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
              } else {
                const err10 = {
                  instancePath: instancePath + '/items/' + i0 + '/tags',
                  schemaPath:
                    '#/components/schemas/TaggedPage/properties/tags/type',
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
            if (data1.driftFlag !== undefined) {
              if (typeof data1.driftFlag !== 'boolean') {
                const err11 = {
                  instancePath: instancePath + '/items/' + i0 + '/driftFlag',
                  schemaPath:
                    '#/components/schemas/TaggedPage/properties/driftFlag/type',
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
            if (data1.updatedAt !== undefined) {
              let data12 = data1.updatedAt;
              if (typeof data12 === 'string') {
                if (!formats10.validate(data12)) {
                  const err12 = {
                    instancePath: instancePath + '/items/' + i0 + '/updatedAt',
                    schemaPath:
                      '#/components/schemas/TaggedPage/properties/updatedAt/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/updatedAt',
                  schemaPath:
                    '#/components/schemas/TaggedPage/properties/updatedAt/type',
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
            if (data1.updatedBy !== undefined) {
              let data13 = data1.updatedBy;
              if (typeof data13 === 'string') {
                if (!formats0.test(data13)) {
                  const err14 = {
                    instancePath: instancePath + '/items/' + i0 + '/updatedBy',
                    schemaPath:
                      '#/components/schemas/TaggedPage/properties/updatedBy/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/updatedBy',
                  schemaPath:
                    '#/components/schemas/TaggedPage/properties/updatedBy/type',
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
            if (data1.publishedAt !== undefined) {
              let data14 = data1.publishedAt;
              if (typeof data14 === 'string') {
                if (!formats10.validate(data14)) {
                  const err16 = {
                    instancePath:
                      instancePath + '/items/' + i0 + '/publishedAt',
                    schemaPath:
                      '#/components/schemas/TaggedPage/properties/publishedAt/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/publishedAt',
                  schemaPath:
                    '#/components/schemas/TaggedPage/properties/publishedAt/type',
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
            if (data1.allowedActions !== undefined) {
              let data15 = data1.allowedActions;
              if (Array.isArray(data15)) {
                const len2 = data15.length;
                for (let i2 = 0; i2 < len2; i2++) {
                  if (typeof data15[i2] !== 'string') {
                    const err18 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/allowedActions/' + i2,
                      schemaPath:
                        '#/components/schemas/TaggedPage/properties/allowedActions/items/type',
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
                let i3 = data15.length;
                let j0;
                if (i3 > 1) {
                  const indices0 = {};
                  for (; i3--;) {
                    let item0 = data15[i3];
                    if (typeof item0 !== 'string') {
                      continue;
                    }
                    if (typeof indices0[item0] == 'number') {
                      j0 = indices0[item0];
                      const err19 = {
                        instancePath:
                          instancePath + '/items/' + i0 + '/allowedActions',
                        schemaPath:
                          '#/components/schemas/TaggedPage/properties/allowedActions/uniqueItems',
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
                        vErrors = [err19];
                      } else {
                        vErrors.push(err19);
                      }
                      errors++;
                      break;
                    }
                    indices0[item0] = i3;
                  }
                }
              } else {
                const err20 = {
                  instancePath:
                    instancePath + '/items/' + i0 + '/allowedActions',
                  schemaPath:
                    '#/components/schemas/TaggedPage/properties/allowedActions/type',
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
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/TaggedPage/type',
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
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
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
    if (data.nextCursor !== undefined) {
      if (typeof data.nextCursor !== 'string') {
        const err23 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
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
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err24];
    } else {
      vErrors.push(err24);
    }
    errors++;
  }
  validate1029.errors = vErrors;
  return errors === 0;
}
validate1029.evaluated = {
  props: { items: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1028(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listTaggedPagesOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1028.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate1029(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1029.errors
        : vErrors.concat(validate1029.errors);
    errors = vErrors.length;
  }
  validate1028.errors = vErrors;
  return errors === 0;
}
validate1028.evaluated = {
  props: { items: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
