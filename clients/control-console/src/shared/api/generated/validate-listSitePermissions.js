// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const listSitePermissionsInput = validate1271;
const schema1434 = {
  type: 'object',
  properties: {
    path: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', format: 'uuid' },
        siteId: { type: 'string', format: 'uuid' },
      },
      required: ['tenantId', 'siteId'],
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
  $id: 'https://edition.invalid/validators/listSitePermissionsInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
function validate1271(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listSitePermissionsInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1271.evaluated;
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
        if (data0.siteId === undefined) {
          const err2 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'siteId' },
            message: "must have required property '" + 'siteId' + "'",
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
        if (data0.siteId !== undefined) {
          let data2 = data0.siteId;
          if (typeof data2 === 'string') {
            if (!formats0.test(data2)) {
              const err5 = {
                instancePath: instancePath + '/path/siteId',
                schemaPath: '#/properties/path/properties/siteId/format',
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
              instancePath: instancePath + '/path/siteId',
              schemaPath: '#/properties/path/properties/siteId/type',
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
  validate1271.errors = vErrors;
  return errors === 0;
}
validate1271.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const listSitePermissionsOutput = validate1272;
const schema1435 = {
  anyOf: [
    { $ref: 'https://edition.invalid/control#/components/schemas/GrantPage' },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialGrantPage',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/listSitePermissionsOutput',
};
const schema1265 = {
  type: 'object',
  properties: {
    items: { type: 'array', items: { $ref: '#/components/schemas/GrantView' } },
    nextCursor: { type: ['string', 'null'] },
    allowedActions: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          'grant',
          'override',
          'set_none',
          'change_role',
          'revoke',
          'explain',
          'restrict',
          'replace_restriction',
          'narrow_restriction',
          'unrestrict',
        ],
      },
    },
  },
};
const schema49 = {
  type: 'object',
  properties: {
    resource: { $ref: '#/components/schemas/ResourceView' },
    principal: { $ref: '#/components/schemas/PrincipalView' },
    role: {
      type: 'string',
      enum: ['admin', 'maintainer', 'author', 'reader', 'none'],
    },
    operations: {
      type: 'array',
      items: { type: 'string', enum: ['read', 'write', 'publish', 'admin'] },
    },
    editable: { type: 'boolean' },
    allowedActions: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          'grant',
          'override',
          'set_none',
          'change_role',
          'revoke',
          'explain',
          'restrict',
          'replace_restriction',
          'narrow_restriction',
          'unrestrict',
        ],
      },
    },
  },
};
const schema50 = {
  type: 'object',
  properties: {
    type: { type: 'string' },
    id: { type: 'string', format: 'uuid' },
    source: { type: 'string' },
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
function validate1101(
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
  const evaluated0 = validate1101.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.resource !== undefined) {
      let data0 = data.resource;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.type !== undefined) {
          if (typeof data0.type !== 'string') {
            const err0 = {
              instancePath: instancePath + '/resource/type',
              schemaPath:
                '#/components/schemas/ResourceView/properties/type/type',
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
        if (data0.id !== undefined) {
          let data2 = data0.id;
          if (typeof data2 === 'string') {
            if (!formats0.test(data2)) {
              const err1 = {
                instancePath: instancePath + '/resource/id',
                schemaPath:
                  '#/components/schemas/ResourceView/properties/id/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
              };
              if (vErrors === null) {
                vErrors = [err1];
              } else {
                vErrors.push(err1);
              }
              errors++;
            }
          } else {
            const err2 = {
              instancePath: instancePath + '/resource/id',
              schemaPath:
                '#/components/schemas/ResourceView/properties/id/type',
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
        if (data0.source !== undefined) {
          if (typeof data0.source !== 'string') {
            const err3 = {
              instancePath: instancePath + '/resource/source',
              schemaPath:
                '#/components/schemas/ResourceView/properties/source/type',
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
          instancePath: instancePath + '/resource',
          schemaPath: '#/components/schemas/ResourceView/type',
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
    if (data.principal !== undefined) {
      let data4 = data.principal;
      if (data4 && typeof data4 == 'object' && !Array.isArray(data4)) {
        if (data4.key !== undefined) {
          if (typeof data4.key !== 'string') {
            const err5 = {
              instancePath: instancePath + '/principal/key',
              schemaPath:
                '#/components/schemas/PrincipalView/properties/key/type',
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
        if (data4.type !== undefined) {
          if (typeof data4.type !== 'string') {
            const err6 = {
              instancePath: instancePath + '/principal/type',
              schemaPath:
                '#/components/schemas/PrincipalView/properties/type/type',
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
        if (data4.id !== undefined) {
          let data7 = data4.id;
          if (typeof data7 !== 'string' && data7 !== null) {
            const err7 = {
              instancePath: instancePath + '/principal/id',
              schemaPath:
                '#/components/schemas/PrincipalView/properties/id/type',
              keyword: 'type',
              params: { type: schema51.properties.id.type },
              message: 'must be string,null',
            };
            if (vErrors === null) {
              vErrors = [err7];
            } else {
              vErrors.push(err7);
            }
            errors++;
          }
          if (typeof data7 === 'string') {
            if (!formats0.test(data7)) {
              const err8 = {
                instancePath: instancePath + '/principal/id',
                schemaPath:
                  '#/components/schemas/PrincipalView/properties/id/format',
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
        if (data4.name !== undefined) {
          if (typeof data4.name !== 'string') {
            const err9 = {
              instancePath: instancePath + '/principal/name',
              schemaPath:
                '#/components/schemas/PrincipalView/properties/name/type',
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
        if (data4.status !== undefined) {
          if (typeof data4.status !== 'string') {
            const err10 = {
              instancePath: instancePath + '/principal/status',
              schemaPath:
                '#/components/schemas/PrincipalView/properties/status/type',
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
        if (data4.email !== undefined) {
          let data10 = data4.email;
          if (typeof data10 !== 'string' && data10 !== null) {
            const err11 = {
              instancePath: instancePath + '/principal/email',
              schemaPath:
                '#/components/schemas/PrincipalView/properties/email/type',
              keyword: 'type',
              params: { type: schema51.properties.email.type },
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
        if (data4.avatar !== undefined) {
          let data11 = data4.avatar;
          if (typeof data11 !== 'string' && data11 !== null) {
            const err12 = {
              instancePath: instancePath + '/principal/avatar',
              schemaPath:
                '#/components/schemas/PrincipalView/properties/avatar/type',
              keyword: 'type',
              params: { type: schema51.properties.avatar.type },
              message: 'must be string,null',
            };
            if (vErrors === null) {
              vErrors = [err12];
            } else {
              vErrors.push(err12);
            }
            errors++;
          }
        }
        if (data4.memberCount !== undefined) {
          let data12 = data4.memberCount;
          if (
            !(typeof data12 == 'number' && !(data12 % 1) && !isNaN(data12)) &&
            data12 !== null
          ) {
            const err13 = {
              instancePath: instancePath + '/principal/memberCount',
              schemaPath:
                '#/components/schemas/PrincipalView/properties/memberCount/type',
              keyword: 'type',
              params: { type: schema51.properties.memberCount.type },
              message: 'must be integer,null',
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
          instancePath: instancePath + '/principal',
          schemaPath: '#/components/schemas/PrincipalView/type',
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
    if (data.role !== undefined) {
      let data13 = data.role;
      if (typeof data13 !== 'string') {
        const err15 = {
          instancePath: instancePath + '/role',
          schemaPath: '#/properties/role/type',
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
      if (!(
        data13 === 'admin' ||
        data13 === 'maintainer' ||
        data13 === 'author' ||
        data13 === 'reader' ||
        data13 === 'none'
      )) {
        const err16 = {
          instancePath: instancePath + '/role',
          schemaPath: '#/properties/role/enum',
          keyword: 'enum',
          params: { allowedValues: schema49.properties.role.enum },
          message: 'must be equal to one of the allowed values',
        };
        if (vErrors === null) {
          vErrors = [err16];
        } else {
          vErrors.push(err16);
        }
        errors++;
      }
    }
    if (data.operations !== undefined) {
      let data14 = data.operations;
      if (Array.isArray(data14)) {
        const len0 = data14.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data15 = data14[i0];
          if (typeof data15 !== 'string') {
            const err17 = {
              instancePath: instancePath + '/operations/' + i0,
              schemaPath: '#/properties/operations/items/type',
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
          if (!(
            data15 === 'read' ||
            data15 === 'write' ||
            data15 === 'publish' ||
            data15 === 'admin'
          )) {
            const err18 = {
              instancePath: instancePath + '/operations/' + i0,
              schemaPath: '#/properties/operations/items/enum',
              keyword: 'enum',
              params: {
                allowedValues: schema49.properties.operations.items.enum,
              },
              message: 'must be equal to one of the allowed values',
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
          instancePath: instancePath + '/operations',
          schemaPath: '#/properties/operations/type',
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
    if (data.editable !== undefined) {
      if (typeof data.editable !== 'boolean') {
        const err20 = {
          instancePath: instancePath + '/editable',
          schemaPath: '#/properties/editable/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.allowedActions !== undefined) {
      let data17 = data.allowedActions;
      if (Array.isArray(data17)) {
        const len1 = data17.length;
        for (let i1 = 0; i1 < len1; i1++) {
          let data18 = data17[i1];
          if (typeof data18 !== 'string') {
            const err21 = {
              instancePath: instancePath + '/allowedActions/' + i1,
              schemaPath: '#/properties/allowedActions/items/type',
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
          if (!(
            data18 === 'grant' ||
            data18 === 'override' ||
            data18 === 'set_none' ||
            data18 === 'change_role' ||
            data18 === 'revoke' ||
            data18 === 'explain' ||
            data18 === 'restrict' ||
            data18 === 'replace_restriction' ||
            data18 === 'narrow_restriction' ||
            data18 === 'unrestrict'
          )) {
            const err22 = {
              instancePath: instancePath + '/allowedActions/' + i1,
              schemaPath: '#/properties/allowedActions/items/enum',
              keyword: 'enum',
              params: {
                allowedValues: schema49.properties.allowedActions.items.enum,
              },
              message: 'must be equal to one of the allowed values',
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
          instancePath: instancePath + '/allowedActions',
          schemaPath: '#/properties/allowedActions/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
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
  validate1101.errors = vErrors;
  return errors === 0;
}
validate1101.evaluated = {
  props: {
    resource: true,
    principal: true,
    role: true,
    operations: true,
    editable: true,
    allowedActions: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1273(
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
  const evaluated0 = validate1273.evaluated;
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
            !validate1101(data0[i0], {
              instancePath: instancePath + '/items/' + i0,
              parentData: data0,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors =
              vErrors === null
                ? validate1101.errors
                : vErrors.concat(validate1101.errors);
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
          params: { type: schema1265.properties.nextCursor.type },
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
    if (data.allowedActions !== undefined) {
      let data3 = data.allowedActions;
      if (Array.isArray(data3)) {
        const len1 = data3.length;
        for (let i1 = 0; i1 < len1; i1++) {
          let data4 = data3[i1];
          if (typeof data4 !== 'string') {
            const err2 = {
              instancePath: instancePath + '/allowedActions/' + i1,
              schemaPath: '#/properties/allowedActions/items/type',
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
          if (!(
            data4 === 'grant' ||
            data4 === 'override' ||
            data4 === 'set_none' ||
            data4 === 'change_role' ||
            data4 === 'revoke' ||
            data4 === 'explain' ||
            data4 === 'restrict' ||
            data4 === 'replace_restriction' ||
            data4 === 'narrow_restriction' ||
            data4 === 'unrestrict'
          )) {
            const err3 = {
              instancePath: instancePath + '/allowedActions/' + i1,
              schemaPath: '#/properties/allowedActions/items/enum',
              keyword: 'enum',
              params: {
                allowedValues: schema1265.properties.allowedActions.items.enum,
              },
              message: 'must be equal to one of the allowed values',
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
          instancePath: instancePath + '/allowedActions',
          schemaPath: '#/properties/allowedActions/type',
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
  validate1273.errors = vErrors;
  return errors === 0;
}
validate1273.evaluated = {
  props: { items: true, nextCursor: true, allowedActions: true },
  dynamicProps: false,
  dynamicItems: false,
};
const schema1269 = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialGrantView' },
    },
    nextCursor: { type: ['string', 'null'] },
    allowedActions: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          'grant',
          'override',
          'set_none',
          'change_role',
          'revoke',
          'explain',
          'restrict',
          'replace_restriction',
          'narrow_restriction',
          'unrestrict',
        ],
      },
    },
  },
};
const schema1270 = {
  type: 'object',
  properties: {
    resource: { $ref: '#/components/schemas/PartialResourceView' },
    principal: { $ref: '#/components/schemas/PartialPrincipalView' },
    role: {
      type: 'string',
      enum: ['admin', 'maintainer', 'author', 'reader', 'none'],
    },
    operations: {
      type: 'array',
      items: { type: 'string', enum: ['read', 'write', 'publish', 'admin'] },
    },
    editable: { type: 'boolean' },
    allowedActions: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          'grant',
          'override',
          'set_none',
          'change_role',
          'revoke',
          'explain',
          'restrict',
          'replace_restriction',
          'narrow_restriction',
          'unrestrict',
        ],
      },
    },
  },
};
const schema1271 = {
  type: 'object',
  properties: {
    type: { type: 'string' },
    id: { type: 'string', format: 'uuid' },
    source: { type: 'string' },
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
function validate1105(
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
  const evaluated0 = validate1105.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.resource !== undefined) {
      let data0 = data.resource;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.type !== undefined) {
          if (typeof data0.type !== 'string') {
            const err0 = {
              instancePath: instancePath + '/resource/type',
              schemaPath:
                '#/components/schemas/PartialResourceView/properties/type/type',
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
        if (data0.id !== undefined) {
          let data2 = data0.id;
          if (typeof data2 === 'string') {
            if (!formats0.test(data2)) {
              const err1 = {
                instancePath: instancePath + '/resource/id',
                schemaPath:
                  '#/components/schemas/PartialResourceView/properties/id/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
              };
              if (vErrors === null) {
                vErrors = [err1];
              } else {
                vErrors.push(err1);
              }
              errors++;
            }
          } else {
            const err2 = {
              instancePath: instancePath + '/resource/id',
              schemaPath:
                '#/components/schemas/PartialResourceView/properties/id/type',
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
        if (data0.source !== undefined) {
          if (typeof data0.source !== 'string') {
            const err3 = {
              instancePath: instancePath + '/resource/source',
              schemaPath:
                '#/components/schemas/PartialResourceView/properties/source/type',
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
          instancePath: instancePath + '/resource',
          schemaPath: '#/components/schemas/PartialResourceView/type',
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
    if (data.principal !== undefined) {
      let data4 = data.principal;
      if (data4 && typeof data4 == 'object' && !Array.isArray(data4)) {
        if (data4.key !== undefined) {
          if (typeof data4.key !== 'string') {
            const err5 = {
              instancePath: instancePath + '/principal/key',
              schemaPath:
                '#/components/schemas/PartialPrincipalView/properties/key/type',
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
        if (data4.type !== undefined) {
          if (typeof data4.type !== 'string') {
            const err6 = {
              instancePath: instancePath + '/principal/type',
              schemaPath:
                '#/components/schemas/PartialPrincipalView/properties/type/type',
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
        if (data4.id !== undefined) {
          let data7 = data4.id;
          if (typeof data7 !== 'string' && data7 !== null) {
            const err7 = {
              instancePath: instancePath + '/principal/id',
              schemaPath:
                '#/components/schemas/PartialPrincipalView/properties/id/type',
              keyword: 'type',
              params: { type: schema1272.properties.id.type },
              message: 'must be string,null',
            };
            if (vErrors === null) {
              vErrors = [err7];
            } else {
              vErrors.push(err7);
            }
            errors++;
          }
          if (typeof data7 === 'string') {
            if (!formats0.test(data7)) {
              const err8 = {
                instancePath: instancePath + '/principal/id',
                schemaPath:
                  '#/components/schemas/PartialPrincipalView/properties/id/format',
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
        if (data4.name !== undefined) {
          if (typeof data4.name !== 'string') {
            const err9 = {
              instancePath: instancePath + '/principal/name',
              schemaPath:
                '#/components/schemas/PartialPrincipalView/properties/name/type',
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
        if (data4.status !== undefined) {
          if (typeof data4.status !== 'string') {
            const err10 = {
              instancePath: instancePath + '/principal/status',
              schemaPath:
                '#/components/schemas/PartialPrincipalView/properties/status/type',
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
        if (data4.email !== undefined) {
          let data10 = data4.email;
          if (typeof data10 !== 'string' && data10 !== null) {
            const err11 = {
              instancePath: instancePath + '/principal/email',
              schemaPath:
                '#/components/schemas/PartialPrincipalView/properties/email/type',
              keyword: 'type',
              params: { type: schema1272.properties.email.type },
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
        if (data4.avatar !== undefined) {
          let data11 = data4.avatar;
          if (typeof data11 !== 'string' && data11 !== null) {
            const err12 = {
              instancePath: instancePath + '/principal/avatar',
              schemaPath:
                '#/components/schemas/PartialPrincipalView/properties/avatar/type',
              keyword: 'type',
              params: { type: schema1272.properties.avatar.type },
              message: 'must be string,null',
            };
            if (vErrors === null) {
              vErrors = [err12];
            } else {
              vErrors.push(err12);
            }
            errors++;
          }
        }
        if (data4.memberCount !== undefined) {
          let data12 = data4.memberCount;
          if (
            !(typeof data12 == 'number' && !(data12 % 1) && !isNaN(data12)) &&
            data12 !== null
          ) {
            const err13 = {
              instancePath: instancePath + '/principal/memberCount',
              schemaPath:
                '#/components/schemas/PartialPrincipalView/properties/memberCount/type',
              keyword: 'type',
              params: { type: schema1272.properties.memberCount.type },
              message: 'must be integer,null',
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
          instancePath: instancePath + '/principal',
          schemaPath: '#/components/schemas/PartialPrincipalView/type',
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
    if (data.role !== undefined) {
      let data13 = data.role;
      if (typeof data13 !== 'string') {
        const err15 = {
          instancePath: instancePath + '/role',
          schemaPath: '#/properties/role/type',
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
      if (!(
        data13 === 'admin' ||
        data13 === 'maintainer' ||
        data13 === 'author' ||
        data13 === 'reader' ||
        data13 === 'none'
      )) {
        const err16 = {
          instancePath: instancePath + '/role',
          schemaPath: '#/properties/role/enum',
          keyword: 'enum',
          params: { allowedValues: schema1270.properties.role.enum },
          message: 'must be equal to one of the allowed values',
        };
        if (vErrors === null) {
          vErrors = [err16];
        } else {
          vErrors.push(err16);
        }
        errors++;
      }
    }
    if (data.operations !== undefined) {
      let data14 = data.operations;
      if (Array.isArray(data14)) {
        const len0 = data14.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data15 = data14[i0];
          if (typeof data15 !== 'string') {
            const err17 = {
              instancePath: instancePath + '/operations/' + i0,
              schemaPath: '#/properties/operations/items/type',
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
          if (!(
            data15 === 'read' ||
            data15 === 'write' ||
            data15 === 'publish' ||
            data15 === 'admin'
          )) {
            const err18 = {
              instancePath: instancePath + '/operations/' + i0,
              schemaPath: '#/properties/operations/items/enum',
              keyword: 'enum',
              params: {
                allowedValues: schema1270.properties.operations.items.enum,
              },
              message: 'must be equal to one of the allowed values',
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
          instancePath: instancePath + '/operations',
          schemaPath: '#/properties/operations/type',
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
    if (data.editable !== undefined) {
      if (typeof data.editable !== 'boolean') {
        const err20 = {
          instancePath: instancePath + '/editable',
          schemaPath: '#/properties/editable/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.allowedActions !== undefined) {
      let data17 = data.allowedActions;
      if (Array.isArray(data17)) {
        const len1 = data17.length;
        for (let i1 = 0; i1 < len1; i1++) {
          let data18 = data17[i1];
          if (typeof data18 !== 'string') {
            const err21 = {
              instancePath: instancePath + '/allowedActions/' + i1,
              schemaPath: '#/properties/allowedActions/items/type',
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
          if (!(
            data18 === 'grant' ||
            data18 === 'override' ||
            data18 === 'set_none' ||
            data18 === 'change_role' ||
            data18 === 'revoke' ||
            data18 === 'explain' ||
            data18 === 'restrict' ||
            data18 === 'replace_restriction' ||
            data18 === 'narrow_restriction' ||
            data18 === 'unrestrict'
          )) {
            const err22 = {
              instancePath: instancePath + '/allowedActions/' + i1,
              schemaPath: '#/properties/allowedActions/items/enum',
              keyword: 'enum',
              params: {
                allowedValues: schema1270.properties.allowedActions.items.enum,
              },
              message: 'must be equal to one of the allowed values',
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
          instancePath: instancePath + '/allowedActions',
          schemaPath: '#/properties/allowedActions/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
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
  validate1105.errors = vErrors;
  return errors === 0;
}
validate1105.evaluated = {
  props: {
    resource: true,
    principal: true,
    role: true,
    operations: true,
    editable: true,
    allowedActions: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1276(
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
  const evaluated0 = validate1276.evaluated;
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
            !validate1105(data0[i0], {
              instancePath: instancePath + '/items/' + i0,
              parentData: data0,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors =
              vErrors === null
                ? validate1105.errors
                : vErrors.concat(validate1105.errors);
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
          params: { type: schema1269.properties.nextCursor.type },
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
    if (data.allowedActions !== undefined) {
      let data3 = data.allowedActions;
      if (Array.isArray(data3)) {
        const len1 = data3.length;
        for (let i1 = 0; i1 < len1; i1++) {
          let data4 = data3[i1];
          if (typeof data4 !== 'string') {
            const err2 = {
              instancePath: instancePath + '/allowedActions/' + i1,
              schemaPath: '#/properties/allowedActions/items/type',
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
          if (!(
            data4 === 'grant' ||
            data4 === 'override' ||
            data4 === 'set_none' ||
            data4 === 'change_role' ||
            data4 === 'revoke' ||
            data4 === 'explain' ||
            data4 === 'restrict' ||
            data4 === 'replace_restriction' ||
            data4 === 'narrow_restriction' ||
            data4 === 'unrestrict'
          )) {
            const err3 = {
              instancePath: instancePath + '/allowedActions/' + i1,
              schemaPath: '#/properties/allowedActions/items/enum',
              keyword: 'enum',
              params: {
                allowedValues: schema1269.properties.allowedActions.items.enum,
              },
              message: 'must be equal to one of the allowed values',
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
          instancePath: instancePath + '/allowedActions',
          schemaPath: '#/properties/allowedActions/type',
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
  validate1276.errors = vErrors;
  return errors === 0;
}
validate1276.evaluated = {
  props: { items: true, nextCursor: true, allowedActions: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1272(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listSitePermissionsOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1272.evaluated;
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
    !validate1273(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1273.errors
        : vErrors.concat(validate1273.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = {};
    props0.items = true;
    props0.nextCursor = true;
    props0.allowedActions = true;
  }
  const _errs2 = errors;
  if (
    !validate1276(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1276.errors
        : vErrors.concat(validate1276.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = props0 || {};
      props0.items = true;
      props0.nextCursor = true;
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
  validate1272.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate1272.evaluated = { dynamicProps: true, dynamicItems: false };
export const listSitePermissionsOutputFull = validate1279;
const schema1438 = {
  $ref: 'https://edition.invalid/control#/components/schemas/GrantPage',
  $id: 'https://edition.invalid/validators/listSitePermissionsOutputFull',
};
function validate1280(
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
  const evaluated0 = validate1280.evaluated;
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
            !validate1101(data0[i0], {
              instancePath: instancePath + '/items/' + i0,
              parentData: data0,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors =
              vErrors === null
                ? validate1101.errors
                : vErrors.concat(validate1101.errors);
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
          params: { type: schema1265.properties.nextCursor.type },
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
    if (data.allowedActions !== undefined) {
      let data3 = data.allowedActions;
      if (Array.isArray(data3)) {
        const len1 = data3.length;
        for (let i1 = 0; i1 < len1; i1++) {
          let data4 = data3[i1];
          if (typeof data4 !== 'string') {
            const err2 = {
              instancePath: instancePath + '/allowedActions/' + i1,
              schemaPath: '#/properties/allowedActions/items/type',
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
          if (!(
            data4 === 'grant' ||
            data4 === 'override' ||
            data4 === 'set_none' ||
            data4 === 'change_role' ||
            data4 === 'revoke' ||
            data4 === 'explain' ||
            data4 === 'restrict' ||
            data4 === 'replace_restriction' ||
            data4 === 'narrow_restriction' ||
            data4 === 'unrestrict'
          )) {
            const err3 = {
              instancePath: instancePath + '/allowedActions/' + i1,
              schemaPath: '#/properties/allowedActions/items/enum',
              keyword: 'enum',
              params: {
                allowedValues: schema1265.properties.allowedActions.items.enum,
              },
              message: 'must be equal to one of the allowed values',
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
          instancePath: instancePath + '/allowedActions',
          schemaPath: '#/properties/allowedActions/type',
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
  validate1280.errors = vErrors;
  return errors === 0;
}
validate1280.evaluated = {
  props: { items: true, nextCursor: true, allowedActions: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1279(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listSitePermissionsOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1279.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate1280(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1280.errors
        : vErrors.concat(validate1280.errors);
    errors = vErrors.length;
  }
  validate1279.errors = vErrors;
  return errors === 0;
}
validate1279.evaluated = {
  props: { items: true, nextCursor: true, allowedActions: true },
  dynamicProps: false,
  dynamicItems: false,
};
