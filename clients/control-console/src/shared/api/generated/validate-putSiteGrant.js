// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const putSiteGrantInput = validate116;
const schema157 = {
  type: 'object',
  properties: {
    path: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', format: 'uuid' },
        siteId: { type: 'string', format: 'uuid' },
        principalKey: {
          type: 'string',
          pattern:
            '(?:user|team|token):[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|anonymous',
        },
      },
      required: ['tenantId', 'siteId', 'principalKey'],
    },
    body: {
      $ref: 'https://edition.invalid/control#/components/schemas/GrantRequest',
    },
  },
  required: ['path', 'body'],
  $id: 'https://edition.invalid/validators/putSiteGrantInput',
};
const schema47 = {
  type: 'object',
  properties: { role: { type: 'string', minLength: 1 } },
  required: ['role'],
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const pattern7 = new RegExp(
  '(?:user|team|token):[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|anonymous',
  'u',
);
const func1 = ucs2Length;
function validate116(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/putSiteGrantInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate116.evaluated;
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
    if (data.body === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'body' },
        message: "must have required property '" + 'body' + "'",
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
        if (data0.siteId === undefined) {
          const err3 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'siteId' },
            message: "must have required property '" + 'siteId' + "'",
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
        if (data0.principalKey === undefined) {
          const err4 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'principalKey' },
            message: "must have required property '" + 'principalKey' + "'",
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
        if (data0.tenantId !== undefined) {
          let data1 = data0.tenantId;
          if (typeof data1 === 'string') {
            if (!formats0.test(data1)) {
              const err5 = {
                instancePath: instancePath + '/path/tenantId',
                schemaPath: '#/properties/path/properties/tenantId/format',
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
              instancePath: instancePath + '/path/tenantId',
              schemaPath: '#/properties/path/properties/tenantId/type',
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
        if (data0.siteId !== undefined) {
          let data2 = data0.siteId;
          if (typeof data2 === 'string') {
            if (!formats0.test(data2)) {
              const err7 = {
                instancePath: instancePath + '/path/siteId',
                schemaPath: '#/properties/path/properties/siteId/format',
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
              instancePath: instancePath + '/path/siteId',
              schemaPath: '#/properties/path/properties/siteId/type',
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
        if (data0.principalKey !== undefined) {
          let data3 = data0.principalKey;
          if (typeof data3 === 'string') {
            if (!pattern7.test(data3)) {
              const err9 = {
                instancePath: instancePath + '/path/principalKey',
                schemaPath: '#/properties/path/properties/principalKey/pattern',
                keyword: 'pattern',
                params: {
                  pattern:
                    '(?:user|team|token):[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|anonymous',
                },
                message:
                  'must match pattern "' +
                  '(?:user|team|token):[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|anonymous' +
                  '"',
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
              instancePath: instancePath + '/path/principalKey',
              schemaPath: '#/properties/path/properties/principalKey/type',
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
      } else {
        const err11 = {
          instancePath: instancePath + '/path',
          schemaPath: '#/properties/path/type',
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
    if (data.body !== undefined) {
      let data4 = data.body;
      if (data4 && typeof data4 == 'object' && !Array.isArray(data4)) {
        if (data4.role === undefined) {
          const err12 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/GrantRequest/required',
            keyword: 'required',
            params: { missingProperty: 'role' },
            message: "must have required property '" + 'role' + "'",
          };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
        if (data4.role !== undefined) {
          let data5 = data4.role;
          if (typeof data5 === 'string') {
            if (func1(data5) < 1) {
              const err13 = {
                instancePath: instancePath + '/body/role',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/GrantRequest/properties/role/minLength',
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
              instancePath: instancePath + '/body/role',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/GrantRequest/properties/role/type',
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
          instancePath: instancePath + '/body',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/GrantRequest/type',
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
  validate116.errors = vErrors;
  return errors === 0;
}
validate116.evaluated = {
  props: { path: true, body: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const putSiteGrantOutput = validate117;
const schema159 = {
  $ref: 'https://edition.invalid/control#/components/schemas/GrantView',
  $id: 'https://edition.invalid/validators/putSiteGrantOutput',
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
function validate118(
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
  const evaluated0 = validate118.evaluated;
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
  validate118.errors = vErrors;
  return errors === 0;
}
validate118.evaluated = {
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
function validate117(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/putSiteGrantOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate117.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate118(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate118.errors
        : vErrors.concat(validate118.errors);
    errors = vErrors.length;
  }
  validate117.errors = vErrors;
  return errors === 0;
}
validate117.evaluated = {
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
export const putSiteGrantOutputFull = validate120;
const schema163 = {
  $ref: 'https://edition.invalid/control#/components/schemas/GrantView',
  $id: 'https://edition.invalid/validators/putSiteGrantOutputFull',
};
function validate121(
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
  const evaluated0 = validate121.evaluated;
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
  validate121.errors = vErrors;
  return errors === 0;
}
validate121.evaluated = {
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
function validate120(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/putSiteGrantOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate120.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate121(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate121.errors
        : vErrors.concat(validate121.errors);
    errors = vErrors.length;
  }
  validate120.errors = vErrors;
  return errors === 0;
}
validate120.evaluated = {
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
