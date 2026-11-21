// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const list_1Input = validate270;
const schema365 = {
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
  $id: 'https://edition.invalid/validators/list_1Input',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
function validate270(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/list_1Input" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate270.evaluated;
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
  validate270.errors = vErrors;
  return errors === 0;
}
validate270.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const list_1Output = validate271;
const schema366 = {
  anyOf: [
    { $ref: 'https://edition.invalid/control#/components/schemas/TeamPage' },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialTeamPage',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/list_1Output',
};
const schema367 = {
  type: 'object',
  properties: {
    items: { type: 'array', items: { $ref: '#/components/schemas/TeamView' } },
    nextCursor: { type: ['string', 'null'] },
  },
};
const schema368 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    tenantId: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    callerRole: { type: 'string' },
    memberCount: { type: 'integer', format: 'int64' },
    ownerCount: { type: 'integer', format: 'int64' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};
const formats10 = fullFormats['date-time'];
function validate272(
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
  const evaluated0 = validate272.evaluated;
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
                      '#/components/schemas/TeamView/properties/id/format',
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
                    '#/components/schemas/TeamView/properties/id/type',
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
            if (data1.tenantId !== undefined) {
              let data3 = data1.tenantId;
              if (typeof data3 === 'string') {
                if (!formats0.test(data3)) {
                  const err2 = {
                    instancePath: instancePath + '/items/' + i0 + '/tenantId',
                    schemaPath:
                      '#/components/schemas/TeamView/properties/tenantId/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/tenantId',
                  schemaPath:
                    '#/components/schemas/TeamView/properties/tenantId/type',
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
            if (data1.name !== undefined) {
              if (typeof data1.name !== 'string') {
                const err4 = {
                  instancePath: instancePath + '/items/' + i0 + '/name',
                  schemaPath:
                    '#/components/schemas/TeamView/properties/name/type',
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
            if (data1.callerRole !== undefined) {
              if (typeof data1.callerRole !== 'string') {
                const err5 = {
                  instancePath: instancePath + '/items/' + i0 + '/callerRole',
                  schemaPath:
                    '#/components/schemas/TeamView/properties/callerRole/type',
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
            if (data1.memberCount !== undefined) {
              let data6 = data1.memberCount;
              if (!(
                typeof data6 == 'number' &&
                !(data6 % 1) &&
                !isNaN(data6)
              )) {
                const err6 = {
                  instancePath: instancePath + '/items/' + i0 + '/memberCount',
                  schemaPath:
                    '#/components/schemas/TeamView/properties/memberCount/type',
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
            }
            if (data1.ownerCount !== undefined) {
              let data7 = data1.ownerCount;
              if (!(
                typeof data7 == 'number' &&
                !(data7 % 1) &&
                !isNaN(data7)
              )) {
                const err7 = {
                  instancePath: instancePath + '/items/' + i0 + '/ownerCount',
                  schemaPath:
                    '#/components/schemas/TeamView/properties/ownerCount/type',
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
            }
            if (data1.createdAt !== undefined) {
              let data8 = data1.createdAt;
              if (typeof data8 === 'string') {
                if (!formats10.validate(data8)) {
                  const err8 = {
                    instancePath: instancePath + '/items/' + i0 + '/createdAt',
                    schemaPath:
                      '#/components/schemas/TeamView/properties/createdAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err8];
                  } else {
                    vErrors.push(err8);
                  }
                  errors++;
                }
              } else {
                const err9 = {
                  instancePath: instancePath + '/items/' + i0 + '/createdAt',
                  schemaPath:
                    '#/components/schemas/TeamView/properties/createdAt/type',
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
            if (data1.updatedAt !== undefined) {
              let data9 = data1.updatedAt;
              if (typeof data9 === 'string') {
                if (!formats10.validate(data9)) {
                  const err10 = {
                    instancePath: instancePath + '/items/' + i0 + '/updatedAt',
                    schemaPath:
                      '#/components/schemas/TeamView/properties/updatedAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
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
                  instancePath: instancePath + '/items/' + i0 + '/updatedAt',
                  schemaPath:
                    '#/components/schemas/TeamView/properties/updatedAt/type',
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
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/TeamView/type',
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
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
    }
    if (data.nextCursor !== undefined) {
      let data10 = data.nextCursor;
      if (typeof data10 !== 'string' && data10 !== null) {
        const err14 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
          keyword: 'type',
          params: { type: schema367.properties.nextCursor.type },
          message: 'must be string,null',
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
  validate272.errors = vErrors;
  return errors === 0;
}
validate272.evaluated = {
  props: { items: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
const schema369 = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialTeamView' },
    },
    nextCursor: { type: ['string', 'null'] },
  },
};
const schema370 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    tenantId: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    callerRole: { type: 'string' },
    memberCount: { type: 'integer', format: 'int64' },
    ownerCount: { type: 'integer', format: 'int64' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};
function validate274(
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
  const evaluated0 = validate274.evaluated;
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
                      '#/components/schemas/PartialTeamView/properties/id/format',
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
                    '#/components/schemas/PartialTeamView/properties/id/type',
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
            if (data1.tenantId !== undefined) {
              let data3 = data1.tenantId;
              if (typeof data3 === 'string') {
                if (!formats0.test(data3)) {
                  const err2 = {
                    instancePath: instancePath + '/items/' + i0 + '/tenantId',
                    schemaPath:
                      '#/components/schemas/PartialTeamView/properties/tenantId/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/tenantId',
                  schemaPath:
                    '#/components/schemas/PartialTeamView/properties/tenantId/type',
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
            if (data1.name !== undefined) {
              if (typeof data1.name !== 'string') {
                const err4 = {
                  instancePath: instancePath + '/items/' + i0 + '/name',
                  schemaPath:
                    '#/components/schemas/PartialTeamView/properties/name/type',
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
            if (data1.callerRole !== undefined) {
              if (typeof data1.callerRole !== 'string') {
                const err5 = {
                  instancePath: instancePath + '/items/' + i0 + '/callerRole',
                  schemaPath:
                    '#/components/schemas/PartialTeamView/properties/callerRole/type',
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
            if (data1.memberCount !== undefined) {
              let data6 = data1.memberCount;
              if (!(
                typeof data6 == 'number' &&
                !(data6 % 1) &&
                !isNaN(data6)
              )) {
                const err6 = {
                  instancePath: instancePath + '/items/' + i0 + '/memberCount',
                  schemaPath:
                    '#/components/schemas/PartialTeamView/properties/memberCount/type',
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
            }
            if (data1.ownerCount !== undefined) {
              let data7 = data1.ownerCount;
              if (!(
                typeof data7 == 'number' &&
                !(data7 % 1) &&
                !isNaN(data7)
              )) {
                const err7 = {
                  instancePath: instancePath + '/items/' + i0 + '/ownerCount',
                  schemaPath:
                    '#/components/schemas/PartialTeamView/properties/ownerCount/type',
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
            }
            if (data1.createdAt !== undefined) {
              let data8 = data1.createdAt;
              if (typeof data8 === 'string') {
                if (!formats10.validate(data8)) {
                  const err8 = {
                    instancePath: instancePath + '/items/' + i0 + '/createdAt',
                    schemaPath:
                      '#/components/schemas/PartialTeamView/properties/createdAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err8];
                  } else {
                    vErrors.push(err8);
                  }
                  errors++;
                }
              } else {
                const err9 = {
                  instancePath: instancePath + '/items/' + i0 + '/createdAt',
                  schemaPath:
                    '#/components/schemas/PartialTeamView/properties/createdAt/type',
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
            if (data1.updatedAt !== undefined) {
              let data9 = data1.updatedAt;
              if (typeof data9 === 'string') {
                if (!formats10.validate(data9)) {
                  const err10 = {
                    instancePath: instancePath + '/items/' + i0 + '/updatedAt',
                    schemaPath:
                      '#/components/schemas/PartialTeamView/properties/updatedAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
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
                  instancePath: instancePath + '/items/' + i0 + '/updatedAt',
                  schemaPath:
                    '#/components/schemas/PartialTeamView/properties/updatedAt/type',
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
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/PartialTeamView/type',
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
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
    }
    if (data.nextCursor !== undefined) {
      let data10 = data.nextCursor;
      if (typeof data10 !== 'string' && data10 !== null) {
        const err14 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
          keyword: 'type',
          params: { type: schema369.properties.nextCursor.type },
          message: 'must be string,null',
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
  validate274.errors = vErrors;
  return errors === 0;
}
validate274.evaluated = {
  props: { items: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate271(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/list_1Output" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate271.evaluated;
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
    !validate272(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate272.errors
        : vErrors.concat(validate272.errors);
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
    !validate274(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate274.errors
        : vErrors.concat(validate274.errors);
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
  validate271.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate271.evaluated = { dynamicProps: true, dynamicItems: false };
export const list_1OutputFull = validate276;
const schema371 = {
  $ref: 'https://edition.invalid/control#/components/schemas/TeamPage',
  $id: 'https://edition.invalid/validators/list_1OutputFull',
};
function validate277(
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
  const evaluated0 = validate277.evaluated;
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
                      '#/components/schemas/TeamView/properties/id/format',
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
                    '#/components/schemas/TeamView/properties/id/type',
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
            if (data1.tenantId !== undefined) {
              let data3 = data1.tenantId;
              if (typeof data3 === 'string') {
                if (!formats0.test(data3)) {
                  const err2 = {
                    instancePath: instancePath + '/items/' + i0 + '/tenantId',
                    schemaPath:
                      '#/components/schemas/TeamView/properties/tenantId/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/tenantId',
                  schemaPath:
                    '#/components/schemas/TeamView/properties/tenantId/type',
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
            if (data1.name !== undefined) {
              if (typeof data1.name !== 'string') {
                const err4 = {
                  instancePath: instancePath + '/items/' + i0 + '/name',
                  schemaPath:
                    '#/components/schemas/TeamView/properties/name/type',
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
            if (data1.callerRole !== undefined) {
              if (typeof data1.callerRole !== 'string') {
                const err5 = {
                  instancePath: instancePath + '/items/' + i0 + '/callerRole',
                  schemaPath:
                    '#/components/schemas/TeamView/properties/callerRole/type',
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
            if (data1.memberCount !== undefined) {
              let data6 = data1.memberCount;
              if (!(
                typeof data6 == 'number' &&
                !(data6 % 1) &&
                !isNaN(data6)
              )) {
                const err6 = {
                  instancePath: instancePath + '/items/' + i0 + '/memberCount',
                  schemaPath:
                    '#/components/schemas/TeamView/properties/memberCount/type',
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
            }
            if (data1.ownerCount !== undefined) {
              let data7 = data1.ownerCount;
              if (!(
                typeof data7 == 'number' &&
                !(data7 % 1) &&
                !isNaN(data7)
              )) {
                const err7 = {
                  instancePath: instancePath + '/items/' + i0 + '/ownerCount',
                  schemaPath:
                    '#/components/schemas/TeamView/properties/ownerCount/type',
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
            }
            if (data1.createdAt !== undefined) {
              let data8 = data1.createdAt;
              if (typeof data8 === 'string') {
                if (!formats10.validate(data8)) {
                  const err8 = {
                    instancePath: instancePath + '/items/' + i0 + '/createdAt',
                    schemaPath:
                      '#/components/schemas/TeamView/properties/createdAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err8];
                  } else {
                    vErrors.push(err8);
                  }
                  errors++;
                }
              } else {
                const err9 = {
                  instancePath: instancePath + '/items/' + i0 + '/createdAt',
                  schemaPath:
                    '#/components/schemas/TeamView/properties/createdAt/type',
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
            if (data1.updatedAt !== undefined) {
              let data9 = data1.updatedAt;
              if (typeof data9 === 'string') {
                if (!formats10.validate(data9)) {
                  const err10 = {
                    instancePath: instancePath + '/items/' + i0 + '/updatedAt',
                    schemaPath:
                      '#/components/schemas/TeamView/properties/updatedAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
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
                  instancePath: instancePath + '/items/' + i0 + '/updatedAt',
                  schemaPath:
                    '#/components/schemas/TeamView/properties/updatedAt/type',
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
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/TeamView/type',
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
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
    }
    if (data.nextCursor !== undefined) {
      let data10 = data.nextCursor;
      if (typeof data10 !== 'string' && data10 !== null) {
        const err14 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
          keyword: 'type',
          params: { type: schema367.properties.nextCursor.type },
          message: 'must be string,null',
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
  validate277.errors = vErrors;
  return errors === 0;
}
validate277.evaluated = {
  props: { items: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate276(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/list_1OutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate276.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate277(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate277.errors
        : vErrors.concat(validate277.errors);
    errors = vErrors.length;
  }
  validate276.errors = vErrors;
  return errors === 0;
}
validate276.evaluated = {
  props: { items: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
