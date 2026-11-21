// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const searchPermissionTeamsInput = validate1121;
const schema1284 = {
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
        q: { type: 'string', maxLength: 2147483647, minLength: 2 },
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
      required: ['q'],
    },
  },
  required: ['path', 'query'],
  $id: 'https://edition.invalid/validators/searchPermissionTeamsInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
function validate1121(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/searchPermissionTeamsInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1121.evaluated;
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
    if (data.query === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'query' },
        message: "must have required property '" + 'query' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.path !== undefined) {
      let data0 = data.path;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.tenantId === undefined) {
          const err2 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'tenantId' },
            message: "must have required property '" + 'tenantId' + "'",
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
        if (data0.spaceId === undefined) {
          const err3 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'spaceId' },
            message: "must have required property '" + 'spaceId' + "'",
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
        if (data0.tenantId !== undefined) {
          let data1 = data0.tenantId;
          if (typeof data1 === 'string') {
            if (!formats0.test(data1)) {
              const err4 = {
                instancePath: instancePath + '/path/tenantId',
                schemaPath: '#/properties/path/properties/tenantId/format',
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
              instancePath: instancePath + '/path/tenantId',
              schemaPath: '#/properties/path/properties/tenantId/type',
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
        if (data0.spaceId !== undefined) {
          let data2 = data0.spaceId;
          if (typeof data2 === 'string') {
            if (!formats0.test(data2)) {
              const err6 = {
                instancePath: instancePath + '/path/spaceId',
                schemaPath: '#/properties/path/properties/spaceId/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
              };
              if (vErrors === null) {
                vErrors = [err6];
              } else {
                vErrors.push(err6);
              }
              errors++;
            }
          } else {
            const err7 = {
              instancePath: instancePath + '/path/spaceId',
              schemaPath: '#/properties/path/properties/spaceId/type',
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
          instancePath: instancePath + '/path',
          schemaPath: '#/properties/path/type',
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
    if (data.query !== undefined) {
      let data3 = data.query;
      if (data3 && typeof data3 == 'object' && !Array.isArray(data3)) {
        if (data3.q === undefined) {
          const err9 = {
            instancePath: instancePath + '/query',
            schemaPath: '#/properties/query/required',
            keyword: 'required',
            params: { missingProperty: 'q' },
            message: "must have required property '" + 'q' + "'",
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
        if (data3.q !== undefined) {
          let data4 = data3.q;
          if (typeof data4 === 'string') {
            if (func1(data4) > 2147483647) {
              const err10 = {
                instancePath: instancePath + '/query/q',
                schemaPath: '#/properties/query/properties/q/maxLength',
                keyword: 'maxLength',
                params: { limit: 2147483647 },
                message: 'must NOT have more than 2147483647 characters',
              };
              if (vErrors === null) {
                vErrors = [err10];
              } else {
                vErrors.push(err10);
              }
              errors++;
            }
            if (func1(data4) < 2) {
              const err11 = {
                instancePath: instancePath + '/query/q',
                schemaPath: '#/properties/query/properties/q/minLength',
                keyword: 'minLength',
                params: { limit: 2 },
                message: 'must NOT have fewer than 2 characters',
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
              instancePath: instancePath + '/query/q',
              schemaPath: '#/properties/query/properties/q/type',
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
        if (data3.cursor !== undefined) {
          if (typeof data3.cursor !== 'string') {
            const err13 = {
              instancePath: instancePath + '/query/cursor',
              schemaPath: '#/properties/query/properties/cursor/type',
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
        if (data3.limit !== undefined) {
          let data6 = data3.limit;
          if (!(typeof data6 == 'number' && !(data6 % 1) && !isNaN(data6))) {
            const err14 = {
              instancePath: instancePath + '/query/limit',
              schemaPath: '#/properties/query/properties/limit/type',
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
          if (typeof data6 == 'number') {
            if (data6 > 100 || isNaN(data6)) {
              const err15 = {
                instancePath: instancePath + '/query/limit',
                schemaPath: '#/properties/query/properties/limit/maximum',
                keyword: 'maximum',
                params: { comparison: '<=', limit: 100 },
                message: 'must be <= 100',
              };
              if (vErrors === null) {
                vErrors = [err15];
              } else {
                vErrors.push(err15);
              }
              errors++;
            }
            if (data6 < 1 || isNaN(data6)) {
              const err16 = {
                instancePath: instancePath + '/query/limit',
                schemaPath: '#/properties/query/properties/limit/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
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
        if (data3.fields !== undefined) {
          let data7 = data3.fields;
          if (typeof data7 === 'string') {
            if (func1(data7) > 4096) {
              const err17 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/maxLength',
                keyword: 'maxLength',
                params: { limit: 4096 },
                message: 'must NOT have more than 4096 characters',
              };
              if (vErrors === null) {
                vErrors = [err17];
              } else {
                vErrors.push(err17);
              }
              errors++;
            }
            if (func1(data7) < 1) {
              const err18 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
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
              instancePath: instancePath + '/query/fields',
              schemaPath: '#/properties/query/properties/fields/type',
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
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
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
  validate1121.errors = vErrors;
  return errors === 0;
}
validate1121.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const searchPermissionTeamsOutput = validate1122;
const schema1285 = {
  anyOf: [
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PrincipalPage',
    },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialPrincipalPage',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/searchPermissionTeamsOutput',
};
const schema1277 = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { $ref: '#/components/schemas/PrincipalView' },
    },
    nextCursor: { type: ['string', 'null'] },
  },
};
const schema51 = {
  type: 'object',
  properties: {
    key: { type: 'string' },
    type: { type: 'string' },
    id: { type: ['string', 'null'], format: 'uuid' },
    name: { type: 'string' },
    status: { type: 'string' },
    email: { type: ['string', 'null'] },
    avatar: { type: ['string', 'null'] },
    memberCount: { type: ['integer', 'null'], format: 'int64' },
  },
};
function validate1123(
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
  const evaluated0 = validate1123.evaluated;
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
            if (data1.key !== undefined) {
              if (typeof data1.key !== 'string') {
                const err0 = {
                  instancePath: instancePath + '/items/' + i0 + '/key',
                  schemaPath:
                    '#/components/schemas/PrincipalView/properties/key/type',
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
            if (data1.type !== undefined) {
              if (typeof data1.type !== 'string') {
                const err1 = {
                  instancePath: instancePath + '/items/' + i0 + '/type',
                  schemaPath:
                    '#/components/schemas/PrincipalView/properties/type/type',
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
            if (data1.id !== undefined) {
              let data4 = data1.id;
              if (typeof data4 !== 'string' && data4 !== null) {
                const err2 = {
                  instancePath: instancePath + '/items/' + i0 + '/id',
                  schemaPath:
                    '#/components/schemas/PrincipalView/properties/id/type',
                  keyword: 'type',
                  params: { type: schema51.properties.id.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err2];
                } else {
                  vErrors.push(err2);
                }
                errors++;
              }
              if (typeof data4 === 'string') {
                if (!formats0.test(data4)) {
                  const err3 = {
                    instancePath: instancePath + '/items/' + i0 + '/id',
                    schemaPath:
                      '#/components/schemas/PrincipalView/properties/id/format',
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
              }
            }
            if (data1.name !== undefined) {
              if (typeof data1.name !== 'string') {
                const err4 = {
                  instancePath: instancePath + '/items/' + i0 + '/name',
                  schemaPath:
                    '#/components/schemas/PrincipalView/properties/name/type',
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
                    '#/components/schemas/PrincipalView/properties/status/type',
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
            if (data1.email !== undefined) {
              let data7 = data1.email;
              if (typeof data7 !== 'string' && data7 !== null) {
                const err6 = {
                  instancePath: instancePath + '/items/' + i0 + '/email',
                  schemaPath:
                    '#/components/schemas/PrincipalView/properties/email/type',
                  keyword: 'type',
                  params: { type: schema51.properties.email.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err6];
                } else {
                  vErrors.push(err6);
                }
                errors++;
              }
            }
            if (data1.avatar !== undefined) {
              let data8 = data1.avatar;
              if (typeof data8 !== 'string' && data8 !== null) {
                const err7 = {
                  instancePath: instancePath + '/items/' + i0 + '/avatar',
                  schemaPath:
                    '#/components/schemas/PrincipalView/properties/avatar/type',
                  keyword: 'type',
                  params: { type: schema51.properties.avatar.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err7];
                } else {
                  vErrors.push(err7);
                }
                errors++;
              }
            }
            if (data1.memberCount !== undefined) {
              let data9 = data1.memberCount;
              if (
                !(typeof data9 == 'number' && !(data9 % 1) && !isNaN(data9)) &&
                data9 !== null
              ) {
                const err8 = {
                  instancePath: instancePath + '/items/' + i0 + '/memberCount',
                  schemaPath:
                    '#/components/schemas/PrincipalView/properties/memberCount/type',
                  keyword: 'type',
                  params: { type: schema51.properties.memberCount.type },
                  message: 'must be integer,null',
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
              schemaPath: '#/components/schemas/PrincipalView/type',
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
      let data10 = data.nextCursor;
      if (typeof data10 !== 'string' && data10 !== null) {
        const err11 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
          keyword: 'type',
          params: { type: schema1277.properties.nextCursor.type },
          message: 'must be string,null',
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
      instancePath,
      schemaPath: '#/type',
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
  validate1123.errors = vErrors;
  return errors === 0;
}
validate1123.evaluated = {
  props: { items: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
const schema1279 = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialPrincipalView' },
    },
    nextCursor: { type: ['string', 'null'] },
  },
};
const schema1272 = {
  type: 'object',
  properties: {
    key: { type: 'string' },
    type: { type: 'string' },
    id: { type: ['string', 'null'], format: 'uuid' },
    name: { type: 'string' },
    status: { type: 'string' },
    email: { type: ['string', 'null'] },
    avatar: { type: ['string', 'null'] },
    memberCount: { type: ['integer', 'null'], format: 'int64' },
  },
};
function validate1125(
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
  const evaluated0 = validate1125.evaluated;
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
            if (data1.key !== undefined) {
              if (typeof data1.key !== 'string') {
                const err0 = {
                  instancePath: instancePath + '/items/' + i0 + '/key',
                  schemaPath:
                    '#/components/schemas/PartialPrincipalView/properties/key/type',
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
            if (data1.type !== undefined) {
              if (typeof data1.type !== 'string') {
                const err1 = {
                  instancePath: instancePath + '/items/' + i0 + '/type',
                  schemaPath:
                    '#/components/schemas/PartialPrincipalView/properties/type/type',
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
            if (data1.id !== undefined) {
              let data4 = data1.id;
              if (typeof data4 !== 'string' && data4 !== null) {
                const err2 = {
                  instancePath: instancePath + '/items/' + i0 + '/id',
                  schemaPath:
                    '#/components/schemas/PartialPrincipalView/properties/id/type',
                  keyword: 'type',
                  params: { type: schema1272.properties.id.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err2];
                } else {
                  vErrors.push(err2);
                }
                errors++;
              }
              if (typeof data4 === 'string') {
                if (!formats0.test(data4)) {
                  const err3 = {
                    instancePath: instancePath + '/items/' + i0 + '/id',
                    schemaPath:
                      '#/components/schemas/PartialPrincipalView/properties/id/format',
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
              }
            }
            if (data1.name !== undefined) {
              if (typeof data1.name !== 'string') {
                const err4 = {
                  instancePath: instancePath + '/items/' + i0 + '/name',
                  schemaPath:
                    '#/components/schemas/PartialPrincipalView/properties/name/type',
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
                    '#/components/schemas/PartialPrincipalView/properties/status/type',
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
            if (data1.email !== undefined) {
              let data7 = data1.email;
              if (typeof data7 !== 'string' && data7 !== null) {
                const err6 = {
                  instancePath: instancePath + '/items/' + i0 + '/email',
                  schemaPath:
                    '#/components/schemas/PartialPrincipalView/properties/email/type',
                  keyword: 'type',
                  params: { type: schema1272.properties.email.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err6];
                } else {
                  vErrors.push(err6);
                }
                errors++;
              }
            }
            if (data1.avatar !== undefined) {
              let data8 = data1.avatar;
              if (typeof data8 !== 'string' && data8 !== null) {
                const err7 = {
                  instancePath: instancePath + '/items/' + i0 + '/avatar',
                  schemaPath:
                    '#/components/schemas/PartialPrincipalView/properties/avatar/type',
                  keyword: 'type',
                  params: { type: schema1272.properties.avatar.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err7];
                } else {
                  vErrors.push(err7);
                }
                errors++;
              }
            }
            if (data1.memberCount !== undefined) {
              let data9 = data1.memberCount;
              if (
                !(typeof data9 == 'number' && !(data9 % 1) && !isNaN(data9)) &&
                data9 !== null
              ) {
                const err8 = {
                  instancePath: instancePath + '/items/' + i0 + '/memberCount',
                  schemaPath:
                    '#/components/schemas/PartialPrincipalView/properties/memberCount/type',
                  keyword: 'type',
                  params: { type: schema1272.properties.memberCount.type },
                  message: 'must be integer,null',
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
              schemaPath: '#/components/schemas/PartialPrincipalView/type',
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
      let data10 = data.nextCursor;
      if (typeof data10 !== 'string' && data10 !== null) {
        const err11 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
          keyword: 'type',
          params: { type: schema1279.properties.nextCursor.type },
          message: 'must be string,null',
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
      instancePath,
      schemaPath: '#/type',
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
  validate1125.errors = vErrors;
  return errors === 0;
}
validate1125.evaluated = {
  props: { items: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1122(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/searchPermissionTeamsOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1122.evaluated;
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
    !validate1123(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1123.errors
        : vErrors.concat(validate1123.errors);
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
    !validate1125(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1125.errors
        : vErrors.concat(validate1125.errors);
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
  validate1122.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate1122.evaluated = { dynamicProps: true, dynamicItems: false };
export const searchPermissionTeamsOutputFull = validate1127;
const schema1290 = {
  $ref: 'https://edition.invalid/control#/components/schemas/PrincipalPage',
  $id: 'https://edition.invalid/validators/searchPermissionTeamsOutputFull',
};
function validate1128(
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
  const evaluated0 = validate1128.evaluated;
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
            if (data1.key !== undefined) {
              if (typeof data1.key !== 'string') {
                const err0 = {
                  instancePath: instancePath + '/items/' + i0 + '/key',
                  schemaPath:
                    '#/components/schemas/PrincipalView/properties/key/type',
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
            if (data1.type !== undefined) {
              if (typeof data1.type !== 'string') {
                const err1 = {
                  instancePath: instancePath + '/items/' + i0 + '/type',
                  schemaPath:
                    '#/components/schemas/PrincipalView/properties/type/type',
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
            if (data1.id !== undefined) {
              let data4 = data1.id;
              if (typeof data4 !== 'string' && data4 !== null) {
                const err2 = {
                  instancePath: instancePath + '/items/' + i0 + '/id',
                  schemaPath:
                    '#/components/schemas/PrincipalView/properties/id/type',
                  keyword: 'type',
                  params: { type: schema51.properties.id.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err2];
                } else {
                  vErrors.push(err2);
                }
                errors++;
              }
              if (typeof data4 === 'string') {
                if (!formats0.test(data4)) {
                  const err3 = {
                    instancePath: instancePath + '/items/' + i0 + '/id',
                    schemaPath:
                      '#/components/schemas/PrincipalView/properties/id/format',
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
              }
            }
            if (data1.name !== undefined) {
              if (typeof data1.name !== 'string') {
                const err4 = {
                  instancePath: instancePath + '/items/' + i0 + '/name',
                  schemaPath:
                    '#/components/schemas/PrincipalView/properties/name/type',
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
                    '#/components/schemas/PrincipalView/properties/status/type',
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
            if (data1.email !== undefined) {
              let data7 = data1.email;
              if (typeof data7 !== 'string' && data7 !== null) {
                const err6 = {
                  instancePath: instancePath + '/items/' + i0 + '/email',
                  schemaPath:
                    '#/components/schemas/PrincipalView/properties/email/type',
                  keyword: 'type',
                  params: { type: schema51.properties.email.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err6];
                } else {
                  vErrors.push(err6);
                }
                errors++;
              }
            }
            if (data1.avatar !== undefined) {
              let data8 = data1.avatar;
              if (typeof data8 !== 'string' && data8 !== null) {
                const err7 = {
                  instancePath: instancePath + '/items/' + i0 + '/avatar',
                  schemaPath:
                    '#/components/schemas/PrincipalView/properties/avatar/type',
                  keyword: 'type',
                  params: { type: schema51.properties.avatar.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err7];
                } else {
                  vErrors.push(err7);
                }
                errors++;
              }
            }
            if (data1.memberCount !== undefined) {
              let data9 = data1.memberCount;
              if (
                !(typeof data9 == 'number' && !(data9 % 1) && !isNaN(data9)) &&
                data9 !== null
              ) {
                const err8 = {
                  instancePath: instancePath + '/items/' + i0 + '/memberCount',
                  schemaPath:
                    '#/components/schemas/PrincipalView/properties/memberCount/type',
                  keyword: 'type',
                  params: { type: schema51.properties.memberCount.type },
                  message: 'must be integer,null',
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
              schemaPath: '#/components/schemas/PrincipalView/type',
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
      let data10 = data.nextCursor;
      if (typeof data10 !== 'string' && data10 !== null) {
        const err11 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
          keyword: 'type',
          params: { type: schema1277.properties.nextCursor.type },
          message: 'must be string,null',
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
      instancePath,
      schemaPath: '#/type',
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
  validate1128.errors = vErrors;
  return errors === 0;
}
validate1128.evaluated = {
  props: { items: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1127(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/searchPermissionTeamsOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1127.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate1128(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1128.errors
        : vErrors.concat(validate1128.errors);
    errors = vErrors.length;
  }
  validate1127.errors = vErrors;
  return errors === 0;
}
validate1127.evaluated = {
  props: { items: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
