// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const listDeletionsInput = validate1403;
const schema1553 = {
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
        cursor: { type: 'string', format: 'uuid' },
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
  $id: 'https://edition.invalid/validators/listDeletionsInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
function validate1403(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listDeletionsInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1403.evaluated;
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
          let data3 = data2.cursor;
          if (typeof data3 === 'string') {
            if (!formats0.test(data3)) {
              const err5 = {
                instancePath: instancePath + '/query/cursor',
                schemaPath: '#/properties/query/properties/cursor/format',
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
              instancePath: instancePath + '/query/cursor',
              schemaPath: '#/properties/query/properties/cursor/type',
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
        if (data2.limit !== undefined) {
          let data4 = data2.limit;
          if (!(typeof data4 == 'number' && !(data4 % 1) && !isNaN(data4))) {
            const err7 = {
              instancePath: instancePath + '/query/limit',
              schemaPath: '#/properties/query/properties/limit/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err7];
            } else {
              vErrors.push(err7);
            }
            errors++;
          }
          if (typeof data4 == 'number') {
            if (data4 > 100 || isNaN(data4)) {
              const err8 = {
                instancePath: instancePath + '/query/limit',
                schemaPath: '#/properties/query/properties/limit/maximum',
                keyword: 'maximum',
                params: { comparison: '<=', limit: 100 },
                message: 'must be <= 100',
              };
              if (vErrors === null) {
                vErrors = [err8];
              } else {
                vErrors.push(err8);
              }
              errors++;
            }
            if (data4 < 1 || isNaN(data4)) {
              const err9 = {
                instancePath: instancePath + '/query/limit',
                schemaPath: '#/properties/query/properties/limit/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err9];
              } else {
                vErrors.push(err9);
              }
              errors++;
            }
          }
        }
        if (data2.fields !== undefined) {
          let data5 = data2.fields;
          if (typeof data5 === 'string') {
            if (func1(data5) > 4096) {
              const err10 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/maxLength',
                keyword: 'maxLength',
                params: { limit: 4096 },
                message: 'must NOT have more than 4096 characters',
              };
              if (vErrors === null) {
                vErrors = [err10];
              } else {
                vErrors.push(err10);
              }
              errors++;
            }
            if (func1(data5) < 1) {
              const err11 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
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
              instancePath: instancePath + '/query/fields',
              schemaPath: '#/properties/query/properties/fields/type',
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
      } else {
        const err13 = {
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
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
      instancePath,
      schemaPath: '#/type',
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
  validate1403.errors = vErrors;
  return errors === 0;
}
validate1403.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const listDeletionsOutput = validate1404;
const schema1554 = {
  anyOf: [
    {
      $ref: 'https://edition.invalid/control#/components/schemas/DeletionPage',
    },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialDeletionPage',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/listDeletionsOutput',
};
const schema1555 = {
  type: 'object',
  properties: {
    items: { type: 'array', items: { $ref: '#/components/schemas/Deletion' } },
    nextCursor: { type: 'string', format: 'uuid' },
  },
};
const schema933 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    resourceType: { type: 'string' },
    resourceId: { type: 'string', format: 'uuid' },
    status: { type: 'string' },
    error: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
  },
};
const formats10 = fullFormats['date-time'];
function validate1405(
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
  const evaluated0 = validate1405.evaluated;
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
                      '#/components/schemas/Deletion/properties/id/format',
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
                    '#/components/schemas/Deletion/properties/id/type',
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
            if (data1.resourceType !== undefined) {
              if (typeof data1.resourceType !== 'string') {
                const err2 = {
                  instancePath: instancePath + '/items/' + i0 + '/resourceType',
                  schemaPath:
                    '#/components/schemas/Deletion/properties/resourceType/type',
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
            if (data1.resourceId !== undefined) {
              let data4 = data1.resourceId;
              if (typeof data4 === 'string') {
                if (!formats0.test(data4)) {
                  const err3 = {
                    instancePath: instancePath + '/items/' + i0 + '/resourceId',
                    schemaPath:
                      '#/components/schemas/Deletion/properties/resourceId/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/resourceId',
                  schemaPath:
                    '#/components/schemas/Deletion/properties/resourceId/type',
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
            if (data1.status !== undefined) {
              if (typeof data1.status !== 'string') {
                const err5 = {
                  instancePath: instancePath + '/items/' + i0 + '/status',
                  schemaPath:
                    '#/components/schemas/Deletion/properties/status/type',
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
            if (data1.error !== undefined) {
              if (typeof data1.error !== 'string') {
                const err6 = {
                  instancePath: instancePath + '/items/' + i0 + '/error',
                  schemaPath:
                    '#/components/schemas/Deletion/properties/error/type',
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
            if (data1.createdAt !== undefined) {
              let data7 = data1.createdAt;
              if (typeof data7 === 'string') {
                if (!formats10.validate(data7)) {
                  const err7 = {
                    instancePath: instancePath + '/items/' + i0 + '/createdAt',
                    schemaPath:
                      '#/components/schemas/Deletion/properties/createdAt/format',
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
              } else {
                const err8 = {
                  instancePath: instancePath + '/items/' + i0 + '/createdAt',
                  schemaPath:
                    '#/components/schemas/Deletion/properties/createdAt/type',
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
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/Deletion/type',
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
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
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
    if (data.nextCursor !== undefined) {
      let data8 = data.nextCursor;
      if (typeof data8 === 'string') {
        if (!formats0.test(data8)) {
          const err11 = {
            instancePath: instancePath + '/nextCursor',
            schemaPath: '#/properties/nextCursor/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
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
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
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
  validate1405.errors = vErrors;
  return errors === 0;
}
validate1405.evaluated = {
  props: { items: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
const schema1557 = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialDeletion' },
    },
    nextCursor: { type: 'string', format: 'uuid' },
  },
};
const schema1558 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    resourceType: { type: 'string' },
    resourceId: { type: 'string', format: 'uuid' },
    status: { type: 'string' },
    error: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
  },
};
function validate1407(
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
  const evaluated0 = validate1407.evaluated;
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
                      '#/components/schemas/PartialDeletion/properties/id/format',
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
                    '#/components/schemas/PartialDeletion/properties/id/type',
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
            if (data1.resourceType !== undefined) {
              if (typeof data1.resourceType !== 'string') {
                const err2 = {
                  instancePath: instancePath + '/items/' + i0 + '/resourceType',
                  schemaPath:
                    '#/components/schemas/PartialDeletion/properties/resourceType/type',
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
            if (data1.resourceId !== undefined) {
              let data4 = data1.resourceId;
              if (typeof data4 === 'string') {
                if (!formats0.test(data4)) {
                  const err3 = {
                    instancePath: instancePath + '/items/' + i0 + '/resourceId',
                    schemaPath:
                      '#/components/schemas/PartialDeletion/properties/resourceId/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/resourceId',
                  schemaPath:
                    '#/components/schemas/PartialDeletion/properties/resourceId/type',
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
            if (data1.status !== undefined) {
              if (typeof data1.status !== 'string') {
                const err5 = {
                  instancePath: instancePath + '/items/' + i0 + '/status',
                  schemaPath:
                    '#/components/schemas/PartialDeletion/properties/status/type',
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
            if (data1.error !== undefined) {
              if (typeof data1.error !== 'string') {
                const err6 = {
                  instancePath: instancePath + '/items/' + i0 + '/error',
                  schemaPath:
                    '#/components/schemas/PartialDeletion/properties/error/type',
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
            if (data1.createdAt !== undefined) {
              let data7 = data1.createdAt;
              if (typeof data7 === 'string') {
                if (!formats10.validate(data7)) {
                  const err7 = {
                    instancePath: instancePath + '/items/' + i0 + '/createdAt',
                    schemaPath:
                      '#/components/schemas/PartialDeletion/properties/createdAt/format',
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
              } else {
                const err8 = {
                  instancePath: instancePath + '/items/' + i0 + '/createdAt',
                  schemaPath:
                    '#/components/schemas/PartialDeletion/properties/createdAt/type',
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
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/PartialDeletion/type',
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
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
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
    if (data.nextCursor !== undefined) {
      let data8 = data.nextCursor;
      if (typeof data8 === 'string') {
        if (!formats0.test(data8)) {
          const err11 = {
            instancePath: instancePath + '/nextCursor',
            schemaPath: '#/properties/nextCursor/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
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
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
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
  validate1407.errors = vErrors;
  return errors === 0;
}
validate1407.evaluated = {
  props: { items: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1404(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listDeletionsOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1404.evaluated;
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
    !validate1405(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1405.errors
        : vErrors.concat(validate1405.errors);
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
    !validate1407(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1407.errors
        : vErrors.concat(validate1407.errors);
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
  validate1404.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate1404.evaluated = { dynamicProps: true, dynamicItems: false };
export const listDeletionsOutputFull = validate1409;
const schema1559 = {
  $ref: 'https://edition.invalid/control#/components/schemas/DeletionPage',
  $id: 'https://edition.invalid/validators/listDeletionsOutputFull',
};
function validate1410(
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
  const evaluated0 = validate1410.evaluated;
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
                      '#/components/schemas/Deletion/properties/id/format',
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
                    '#/components/schemas/Deletion/properties/id/type',
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
            if (data1.resourceType !== undefined) {
              if (typeof data1.resourceType !== 'string') {
                const err2 = {
                  instancePath: instancePath + '/items/' + i0 + '/resourceType',
                  schemaPath:
                    '#/components/schemas/Deletion/properties/resourceType/type',
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
            if (data1.resourceId !== undefined) {
              let data4 = data1.resourceId;
              if (typeof data4 === 'string') {
                if (!formats0.test(data4)) {
                  const err3 = {
                    instancePath: instancePath + '/items/' + i0 + '/resourceId',
                    schemaPath:
                      '#/components/schemas/Deletion/properties/resourceId/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/resourceId',
                  schemaPath:
                    '#/components/schemas/Deletion/properties/resourceId/type',
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
            if (data1.status !== undefined) {
              if (typeof data1.status !== 'string') {
                const err5 = {
                  instancePath: instancePath + '/items/' + i0 + '/status',
                  schemaPath:
                    '#/components/schemas/Deletion/properties/status/type',
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
            if (data1.error !== undefined) {
              if (typeof data1.error !== 'string') {
                const err6 = {
                  instancePath: instancePath + '/items/' + i0 + '/error',
                  schemaPath:
                    '#/components/schemas/Deletion/properties/error/type',
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
            if (data1.createdAt !== undefined) {
              let data7 = data1.createdAt;
              if (typeof data7 === 'string') {
                if (!formats10.validate(data7)) {
                  const err7 = {
                    instancePath: instancePath + '/items/' + i0 + '/createdAt',
                    schemaPath:
                      '#/components/schemas/Deletion/properties/createdAt/format',
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
              } else {
                const err8 = {
                  instancePath: instancePath + '/items/' + i0 + '/createdAt',
                  schemaPath:
                    '#/components/schemas/Deletion/properties/createdAt/type',
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
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/Deletion/type',
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
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
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
    if (data.nextCursor !== undefined) {
      let data8 = data.nextCursor;
      if (typeof data8 === 'string') {
        if (!formats0.test(data8)) {
          const err11 = {
            instancePath: instancePath + '/nextCursor',
            schemaPath: '#/properties/nextCursor/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
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
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
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
  validate1410.errors = vErrors;
  return errors === 0;
}
validate1410.evaluated = {
  props: { items: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1409(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listDeletionsOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1409.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate1410(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1410.errors
        : vErrors.concat(validate1410.errors);
    errors = vErrors.length;
  }
  validate1409.errors = vErrors;
  return errors === 0;
}
validate1409.evaluated = {
  props: { items: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
