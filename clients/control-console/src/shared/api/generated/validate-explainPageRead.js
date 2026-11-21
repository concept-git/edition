// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const explainPageReadInput = validate1189;
const schema1339 = {
  type: 'object',
  properties: {
    path: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', format: 'uuid' },
        spaceId: { type: 'string', format: 'uuid' },
        pageId: { type: 'string', format: 'uuid' },
      },
      required: ['tenantId', 'spaceId', 'pageId'],
    },
    query: {
      type: 'object',
      properties: {
        principal: {
          type: 'string',
          pattern:
            '(?:user|team|token):[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|anonymous',
        },
        fields: { type: 'string', maxLength: 4096, minLength: 1 },
      },
      required: ['principal'],
    },
  },
  required: ['path', 'query'],
  $id: 'https://edition.invalid/validators/explainPageReadInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const pattern7 = new RegExp(
  '(?:user|team|token):[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|anonymous',
  'u',
);
const func1 = ucs2Length;
function validate1189(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/explainPageReadInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1189.evaluated;
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
        if (data0.pageId === undefined) {
          const err4 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'pageId' },
            message: "must have required property '" + 'pageId' + "'",
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
        if (data0.spaceId !== undefined) {
          let data2 = data0.spaceId;
          if (typeof data2 === 'string') {
            if (!formats0.test(data2)) {
              const err7 = {
                instancePath: instancePath + '/path/spaceId',
                schemaPath: '#/properties/path/properties/spaceId/format',
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
              instancePath: instancePath + '/path/spaceId',
              schemaPath: '#/properties/path/properties/spaceId/type',
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
        if (data0.pageId !== undefined) {
          let data3 = data0.pageId;
          if (typeof data3 === 'string') {
            if (!formats0.test(data3)) {
              const err9 = {
                instancePath: instancePath + '/path/pageId',
                schemaPath: '#/properties/path/properties/pageId/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
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
              instancePath: instancePath + '/path/pageId',
              schemaPath: '#/properties/path/properties/pageId/type',
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
    if (data.query !== undefined) {
      let data4 = data.query;
      if (data4 && typeof data4 == 'object' && !Array.isArray(data4)) {
        if (data4.principal === undefined) {
          const err12 = {
            instancePath: instancePath + '/query',
            schemaPath: '#/properties/query/required',
            keyword: 'required',
            params: { missingProperty: 'principal' },
            message: "must have required property '" + 'principal' + "'",
          };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
        if (data4.principal !== undefined) {
          let data5 = data4.principal;
          if (typeof data5 === 'string') {
            if (!pattern7.test(data5)) {
              const err13 = {
                instancePath: instancePath + '/query/principal',
                schemaPath: '#/properties/query/properties/principal/pattern',
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
                vErrors = [err13];
              } else {
                vErrors.push(err13);
              }
              errors++;
            }
          } else {
            const err14 = {
              instancePath: instancePath + '/query/principal',
              schemaPath: '#/properties/query/properties/principal/type',
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
        if (data4.fields !== undefined) {
          let data6 = data4.fields;
          if (typeof data6 === 'string') {
            if (func1(data6) > 4096) {
              const err15 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/maxLength',
                keyword: 'maxLength',
                params: { limit: 4096 },
                message: 'must NOT have more than 4096 characters',
              };
              if (vErrors === null) {
                vErrors = [err15];
              } else {
                vErrors.push(err15);
              }
              errors++;
            }
            if (func1(data6) < 1) {
              const err16 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
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
              instancePath: instancePath + '/query/fields',
              schemaPath: '#/properties/query/properties/fields/type',
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
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
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
      instancePath,
      schemaPath: '#/type',
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
  validate1189.errors = vErrors;
  return errors === 0;
}
validate1189.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const explainPageReadOutput = validate1190;
const schema1340 = {
  anyOf: [
    {
      $ref: 'https://edition.invalid/control#/components/schemas/EffectivePermissionView',
    },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialEffectivePermissionView',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/explainPageReadOutput',
};
const schema1341 = {
  type: 'object',
  properties: {
    principal: { $ref: '#/components/schemas/PrincipalView' },
    allowed: { type: 'boolean' },
    reason: {
      type: 'string',
      enum: [
        'direct_grant',
        'team_grant',
        'explicit_none',
        'no_grant',
        'restriction_miss',
      ],
    },
    effectiveOperations: {
      type: 'array',
      items: { type: 'string', enum: ['read', 'write', 'publish', 'admin'] },
    },
    matchedLayer: { $ref: '#/components/schemas/ResourceView' },
    matchedGrants: {
      type: 'array',
      items: { $ref: '#/components/schemas/EffectiveGrantView' },
    },
    trace: {
      type: 'array',
      items: { $ref: '#/components/schemas/DecisionTraceView' },
    },
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
const schema50 = {
  type: 'object',
  properties: {
    type: { type: 'string' },
    id: { type: 'string', format: 'uuid' },
    source: { type: 'string' },
  },
};
const schema1344 = {
  type: 'object',
  properties: {
    resource: { $ref: '#/components/schemas/ResourceView' },
    principalKey: { type: 'string' },
    role: {
      type: 'string',
      enum: ['admin', 'maintainer', 'author', 'reader', 'none'],
    },
  },
};
function validate1192(
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
  const evaluated0 = validate1192.evaluated;
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
    if (data.principalKey !== undefined) {
      if (typeof data.principalKey !== 'string') {
        const err5 = {
          instancePath: instancePath + '/principalKey',
          schemaPath: '#/properties/principalKey/type',
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
    if (data.role !== undefined) {
      let data5 = data.role;
      if (typeof data5 !== 'string') {
        const err6 = {
          instancePath: instancePath + '/role',
          schemaPath: '#/properties/role/type',
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
      if (!(
        data5 === 'admin' ||
        data5 === 'maintainer' ||
        data5 === 'author' ||
        data5 === 'reader' ||
        data5 === 'none'
      )) {
        const err7 = {
          instancePath: instancePath + '/role',
          schemaPath: '#/properties/role/enum',
          keyword: 'enum',
          params: { allowedValues: schema1344.properties.role.enum },
          message: 'must be equal to one of the allowed values',
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
      instancePath,
      schemaPath: '#/type',
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
  validate1192.errors = vErrors;
  return errors === 0;
}
validate1192.evaluated = {
  props: { resource: true, principalKey: true, role: true },
  dynamicProps: false,
  dynamicItems: false,
};
const schema1346 = {
  type: 'object',
  properties: {
    resource: { $ref: '#/components/schemas/ResourceView' },
    subjectGrants: {
      type: 'array',
      items: { $ref: '#/components/schemas/EffectiveGrantView' },
    },
    restrictionActive: { type: 'boolean' },
    restrictionRevision: { type: 'integer', format: 'int64' },
    restrictionMatches: { type: 'array', items: { type: 'string' } },
    restrictionSatisfied: { type: 'boolean' },
    decisive: { type: 'boolean' },
  },
};
function validate1194(
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
  const evaluated0 = validate1194.evaluated;
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
    if (data.subjectGrants !== undefined) {
      let data4 = data.subjectGrants;
      if (Array.isArray(data4)) {
        const len0 = data4.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (
            !validate1192(data4[i0], {
              instancePath: instancePath + '/subjectGrants/' + i0,
              parentData: data4,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors =
              vErrors === null
                ? validate1192.errors
                : vErrors.concat(validate1192.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err5 = {
          instancePath: instancePath + '/subjectGrants',
          schemaPath: '#/properties/subjectGrants/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.restrictionActive !== undefined) {
      if (typeof data.restrictionActive !== 'boolean') {
        const err6 = {
          instancePath: instancePath + '/restrictionActive',
          schemaPath: '#/properties/restrictionActive/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.restrictionRevision !== undefined) {
      let data7 = data.restrictionRevision;
      if (!(typeof data7 == 'number' && !(data7 % 1) && !isNaN(data7))) {
        const err7 = {
          instancePath: instancePath + '/restrictionRevision',
          schemaPath: '#/properties/restrictionRevision/type',
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
    if (data.restrictionMatches !== undefined) {
      let data8 = data.restrictionMatches;
      if (Array.isArray(data8)) {
        const len1 = data8.length;
        for (let i1 = 0; i1 < len1; i1++) {
          if (typeof data8[i1] !== 'string') {
            const err8 = {
              instancePath: instancePath + '/restrictionMatches/' + i1,
              schemaPath: '#/properties/restrictionMatches/items/type',
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
          instancePath: instancePath + '/restrictionMatches',
          schemaPath: '#/properties/restrictionMatches/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.restrictionSatisfied !== undefined) {
      if (typeof data.restrictionSatisfied !== 'boolean') {
        const err10 = {
          instancePath: instancePath + '/restrictionSatisfied',
          schemaPath: '#/properties/restrictionSatisfied/type',
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
    if (data.decisive !== undefined) {
      if (typeof data.decisive !== 'boolean') {
        const err11 = {
          instancePath: instancePath + '/decisive',
          schemaPath: '#/properties/decisive/type',
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
  validate1194.errors = vErrors;
  return errors === 0;
}
validate1194.evaluated = {
  props: {
    resource: true,
    subjectGrants: true,
    restrictionActive: true,
    restrictionRevision: true,
    restrictionMatches: true,
    restrictionSatisfied: true,
    decisive: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1191(
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
  const evaluated0 = validate1191.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.principal !== undefined) {
      let data0 = data.principal;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.key !== undefined) {
          if (typeof data0.key !== 'string') {
            const err0 = {
              instancePath: instancePath + '/principal/key',
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
        if (data0.type !== undefined) {
          if (typeof data0.type !== 'string') {
            const err1 = {
              instancePath: instancePath + '/principal/type',
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
        if (data0.id !== undefined) {
          let data3 = data0.id;
          if (typeof data3 !== 'string' && data3 !== null) {
            const err2 = {
              instancePath: instancePath + '/principal/id',
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
          if (typeof data3 === 'string') {
            if (!formats0.test(data3)) {
              const err3 = {
                instancePath: instancePath + '/principal/id',
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
        if (data0.name !== undefined) {
          if (typeof data0.name !== 'string') {
            const err4 = {
              instancePath: instancePath + '/principal/name',
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
        if (data0.status !== undefined) {
          if (typeof data0.status !== 'string') {
            const err5 = {
              instancePath: instancePath + '/principal/status',
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
        if (data0.email !== undefined) {
          let data6 = data0.email;
          if (typeof data6 !== 'string' && data6 !== null) {
            const err6 = {
              instancePath: instancePath + '/principal/email',
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
        if (data0.avatar !== undefined) {
          let data7 = data0.avatar;
          if (typeof data7 !== 'string' && data7 !== null) {
            const err7 = {
              instancePath: instancePath + '/principal/avatar',
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
        if (data0.memberCount !== undefined) {
          let data8 = data0.memberCount;
          if (
            !(typeof data8 == 'number' && !(data8 % 1) && !isNaN(data8)) &&
            data8 !== null
          ) {
            const err8 = {
              instancePath: instancePath + '/principal/memberCount',
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
          instancePath: instancePath + '/principal',
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
    if (data.allowed !== undefined) {
      if (typeof data.allowed !== 'boolean') {
        const err10 = {
          instancePath: instancePath + '/allowed',
          schemaPath: '#/properties/allowed/type',
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
    if (data.reason !== undefined) {
      let data10 = data.reason;
      if (typeof data10 !== 'string') {
        const err11 = {
          instancePath: instancePath + '/reason',
          schemaPath: '#/properties/reason/type',
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
        data10 === 'direct_grant' ||
        data10 === 'team_grant' ||
        data10 === 'explicit_none' ||
        data10 === 'no_grant' ||
        data10 === 'restriction_miss'
      )) {
        const err12 = {
          instancePath: instancePath + '/reason',
          schemaPath: '#/properties/reason/enum',
          keyword: 'enum',
          params: { allowedValues: schema1341.properties.reason.enum },
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
    if (data.effectiveOperations !== undefined) {
      let data11 = data.effectiveOperations;
      if (Array.isArray(data11)) {
        const len0 = data11.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data12 = data11[i0];
          if (typeof data12 !== 'string') {
            const err13 = {
              instancePath: instancePath + '/effectiveOperations/' + i0,
              schemaPath: '#/properties/effectiveOperations/items/type',
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
          if (!(
            data12 === 'read' ||
            data12 === 'write' ||
            data12 === 'publish' ||
            data12 === 'admin'
          )) {
            const err14 = {
              instancePath: instancePath + '/effectiveOperations/' + i0,
              schemaPath: '#/properties/effectiveOperations/items/enum',
              keyword: 'enum',
              params: {
                allowedValues:
                  schema1341.properties.effectiveOperations.items.enum,
              },
              message: 'must be equal to one of the allowed values',
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
          instancePath: instancePath + '/effectiveOperations',
          schemaPath: '#/properties/effectiveOperations/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err15];
        } else {
          vErrors.push(err15);
        }
        errors++;
      }
    }
    if (data.matchedLayer !== undefined) {
      let data13 = data.matchedLayer;
      if (data13 && typeof data13 == 'object' && !Array.isArray(data13)) {
        if (data13.type !== undefined) {
          if (typeof data13.type !== 'string') {
            const err16 = {
              instancePath: instancePath + '/matchedLayer/type',
              schemaPath:
                '#/components/schemas/ResourceView/properties/type/type',
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
        if (data13.id !== undefined) {
          let data15 = data13.id;
          if (typeof data15 === 'string') {
            if (!formats0.test(data15)) {
              const err17 = {
                instancePath: instancePath + '/matchedLayer/id',
                schemaPath:
                  '#/components/schemas/ResourceView/properties/id/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
              };
              if (vErrors === null) {
                vErrors = [err17];
              } else {
                vErrors.push(err17);
              }
              errors++;
            }
          } else {
            const err18 = {
              instancePath: instancePath + '/matchedLayer/id',
              schemaPath:
                '#/components/schemas/ResourceView/properties/id/type',
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
        if (data13.source !== undefined) {
          if (typeof data13.source !== 'string') {
            const err19 = {
              instancePath: instancePath + '/matchedLayer/source',
              schemaPath:
                '#/components/schemas/ResourceView/properties/source/type',
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
          instancePath: instancePath + '/matchedLayer',
          schemaPath: '#/components/schemas/ResourceView/type',
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
    if (data.matchedGrants !== undefined) {
      let data17 = data.matchedGrants;
      if (Array.isArray(data17)) {
        const len1 = data17.length;
        for (let i1 = 0; i1 < len1; i1++) {
          if (
            !validate1192(data17[i1], {
              instancePath: instancePath + '/matchedGrants/' + i1,
              parentData: data17,
              parentDataProperty: i1,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors =
              vErrors === null
                ? validate1192.errors
                : vErrors.concat(validate1192.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err21 = {
          instancePath: instancePath + '/matchedGrants',
          schemaPath: '#/properties/matchedGrants/type',
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
    if (data.trace !== undefined) {
      let data19 = data.trace;
      if (Array.isArray(data19)) {
        const len2 = data19.length;
        for (let i2 = 0; i2 < len2; i2++) {
          if (
            !validate1194(data19[i2], {
              instancePath: instancePath + '/trace/' + i2,
              parentData: data19,
              parentDataProperty: i2,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors =
              vErrors === null
                ? validate1194.errors
                : vErrors.concat(validate1194.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err22 = {
          instancePath: instancePath + '/trace',
          schemaPath: '#/properties/trace/type',
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
  validate1191.errors = vErrors;
  return errors === 0;
}
validate1191.evaluated = {
  props: {
    principal: true,
    allowed: true,
    reason: true,
    effectiveOperations: true,
    matchedLayer: true,
    matchedGrants: true,
    trace: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
const schema1348 = {
  type: 'object',
  properties: {
    principal: { $ref: '#/components/schemas/PartialPrincipalView' },
    allowed: { type: 'boolean' },
    reason: {
      type: 'string',
      enum: [
        'direct_grant',
        'team_grant',
        'explicit_none',
        'no_grant',
        'restriction_miss',
      ],
    },
    effectiveOperations: {
      type: 'array',
      items: { type: 'string', enum: ['read', 'write', 'publish', 'admin'] },
    },
    matchedLayer: { $ref: '#/components/schemas/PartialResourceView' },
    matchedGrants: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialEffectiveGrantView' },
    },
    trace: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialDecisionTraceView' },
    },
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
const schema1271 = {
  type: 'object',
  properties: {
    type: { type: 'string' },
    id: { type: 'string', format: 'uuid' },
    source: { type: 'string' },
  },
};
const schema1351 = {
  type: 'object',
  properties: {
    resource: { $ref: '#/components/schemas/PartialResourceView' },
    principalKey: { type: 'string' },
    role: {
      type: 'string',
      enum: ['admin', 'maintainer', 'author', 'reader', 'none'],
    },
  },
};
function validate1199(
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
  const evaluated0 = validate1199.evaluated;
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
    if (data.principalKey !== undefined) {
      if (typeof data.principalKey !== 'string') {
        const err5 = {
          instancePath: instancePath + '/principalKey',
          schemaPath: '#/properties/principalKey/type',
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
    if (data.role !== undefined) {
      let data5 = data.role;
      if (typeof data5 !== 'string') {
        const err6 = {
          instancePath: instancePath + '/role',
          schemaPath: '#/properties/role/type',
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
      if (!(
        data5 === 'admin' ||
        data5 === 'maintainer' ||
        data5 === 'author' ||
        data5 === 'reader' ||
        data5 === 'none'
      )) {
        const err7 = {
          instancePath: instancePath + '/role',
          schemaPath: '#/properties/role/enum',
          keyword: 'enum',
          params: { allowedValues: schema1351.properties.role.enum },
          message: 'must be equal to one of the allowed values',
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
      instancePath,
      schemaPath: '#/type',
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
  validate1199.errors = vErrors;
  return errors === 0;
}
validate1199.evaluated = {
  props: { resource: true, principalKey: true, role: true },
  dynamicProps: false,
  dynamicItems: false,
};
const schema1353 = {
  type: 'object',
  properties: {
    resource: { $ref: '#/components/schemas/PartialResourceView' },
    subjectGrants: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialEffectiveGrantView' },
    },
    restrictionActive: { type: 'boolean' },
    restrictionRevision: { type: 'integer', format: 'int64' },
    restrictionMatches: { type: 'array', items: { type: 'string' } },
    restrictionSatisfied: { type: 'boolean' },
    decisive: { type: 'boolean' },
  },
};
function validate1201(
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
  const evaluated0 = validate1201.evaluated;
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
    if (data.subjectGrants !== undefined) {
      let data4 = data.subjectGrants;
      if (Array.isArray(data4)) {
        const len0 = data4.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (
            !validate1199(data4[i0], {
              instancePath: instancePath + '/subjectGrants/' + i0,
              parentData: data4,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors =
              vErrors === null
                ? validate1199.errors
                : vErrors.concat(validate1199.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err5 = {
          instancePath: instancePath + '/subjectGrants',
          schemaPath: '#/properties/subjectGrants/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.restrictionActive !== undefined) {
      if (typeof data.restrictionActive !== 'boolean') {
        const err6 = {
          instancePath: instancePath + '/restrictionActive',
          schemaPath: '#/properties/restrictionActive/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.restrictionRevision !== undefined) {
      let data7 = data.restrictionRevision;
      if (!(typeof data7 == 'number' && !(data7 % 1) && !isNaN(data7))) {
        const err7 = {
          instancePath: instancePath + '/restrictionRevision',
          schemaPath: '#/properties/restrictionRevision/type',
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
    if (data.restrictionMatches !== undefined) {
      let data8 = data.restrictionMatches;
      if (Array.isArray(data8)) {
        const len1 = data8.length;
        for (let i1 = 0; i1 < len1; i1++) {
          if (typeof data8[i1] !== 'string') {
            const err8 = {
              instancePath: instancePath + '/restrictionMatches/' + i1,
              schemaPath: '#/properties/restrictionMatches/items/type',
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
          instancePath: instancePath + '/restrictionMatches',
          schemaPath: '#/properties/restrictionMatches/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.restrictionSatisfied !== undefined) {
      if (typeof data.restrictionSatisfied !== 'boolean') {
        const err10 = {
          instancePath: instancePath + '/restrictionSatisfied',
          schemaPath: '#/properties/restrictionSatisfied/type',
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
    if (data.decisive !== undefined) {
      if (typeof data.decisive !== 'boolean') {
        const err11 = {
          instancePath: instancePath + '/decisive',
          schemaPath: '#/properties/decisive/type',
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
  validate1201.errors = vErrors;
  return errors === 0;
}
validate1201.evaluated = {
  props: {
    resource: true,
    subjectGrants: true,
    restrictionActive: true,
    restrictionRevision: true,
    restrictionMatches: true,
    restrictionSatisfied: true,
    decisive: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1198(
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
  const evaluated0 = validate1198.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.principal !== undefined) {
      let data0 = data.principal;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.key !== undefined) {
          if (typeof data0.key !== 'string') {
            const err0 = {
              instancePath: instancePath + '/principal/key',
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
        if (data0.type !== undefined) {
          if (typeof data0.type !== 'string') {
            const err1 = {
              instancePath: instancePath + '/principal/type',
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
        if (data0.id !== undefined) {
          let data3 = data0.id;
          if (typeof data3 !== 'string' && data3 !== null) {
            const err2 = {
              instancePath: instancePath + '/principal/id',
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
          if (typeof data3 === 'string') {
            if (!formats0.test(data3)) {
              const err3 = {
                instancePath: instancePath + '/principal/id',
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
        if (data0.name !== undefined) {
          if (typeof data0.name !== 'string') {
            const err4 = {
              instancePath: instancePath + '/principal/name',
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
        if (data0.status !== undefined) {
          if (typeof data0.status !== 'string') {
            const err5 = {
              instancePath: instancePath + '/principal/status',
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
        if (data0.email !== undefined) {
          let data6 = data0.email;
          if (typeof data6 !== 'string' && data6 !== null) {
            const err6 = {
              instancePath: instancePath + '/principal/email',
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
        if (data0.avatar !== undefined) {
          let data7 = data0.avatar;
          if (typeof data7 !== 'string' && data7 !== null) {
            const err7 = {
              instancePath: instancePath + '/principal/avatar',
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
        if (data0.memberCount !== undefined) {
          let data8 = data0.memberCount;
          if (
            !(typeof data8 == 'number' && !(data8 % 1) && !isNaN(data8)) &&
            data8 !== null
          ) {
            const err8 = {
              instancePath: instancePath + '/principal/memberCount',
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
          instancePath: instancePath + '/principal',
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
    if (data.allowed !== undefined) {
      if (typeof data.allowed !== 'boolean') {
        const err10 = {
          instancePath: instancePath + '/allowed',
          schemaPath: '#/properties/allowed/type',
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
    if (data.reason !== undefined) {
      let data10 = data.reason;
      if (typeof data10 !== 'string') {
        const err11 = {
          instancePath: instancePath + '/reason',
          schemaPath: '#/properties/reason/type',
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
        data10 === 'direct_grant' ||
        data10 === 'team_grant' ||
        data10 === 'explicit_none' ||
        data10 === 'no_grant' ||
        data10 === 'restriction_miss'
      )) {
        const err12 = {
          instancePath: instancePath + '/reason',
          schemaPath: '#/properties/reason/enum',
          keyword: 'enum',
          params: { allowedValues: schema1348.properties.reason.enum },
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
    if (data.effectiveOperations !== undefined) {
      let data11 = data.effectiveOperations;
      if (Array.isArray(data11)) {
        const len0 = data11.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data12 = data11[i0];
          if (typeof data12 !== 'string') {
            const err13 = {
              instancePath: instancePath + '/effectiveOperations/' + i0,
              schemaPath: '#/properties/effectiveOperations/items/type',
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
          if (!(
            data12 === 'read' ||
            data12 === 'write' ||
            data12 === 'publish' ||
            data12 === 'admin'
          )) {
            const err14 = {
              instancePath: instancePath + '/effectiveOperations/' + i0,
              schemaPath: '#/properties/effectiveOperations/items/enum',
              keyword: 'enum',
              params: {
                allowedValues:
                  schema1348.properties.effectiveOperations.items.enum,
              },
              message: 'must be equal to one of the allowed values',
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
          instancePath: instancePath + '/effectiveOperations',
          schemaPath: '#/properties/effectiveOperations/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err15];
        } else {
          vErrors.push(err15);
        }
        errors++;
      }
    }
    if (data.matchedLayer !== undefined) {
      let data13 = data.matchedLayer;
      if (data13 && typeof data13 == 'object' && !Array.isArray(data13)) {
        if (data13.type !== undefined) {
          if (typeof data13.type !== 'string') {
            const err16 = {
              instancePath: instancePath + '/matchedLayer/type',
              schemaPath:
                '#/components/schemas/PartialResourceView/properties/type/type',
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
        if (data13.id !== undefined) {
          let data15 = data13.id;
          if (typeof data15 === 'string') {
            if (!formats0.test(data15)) {
              const err17 = {
                instancePath: instancePath + '/matchedLayer/id',
                schemaPath:
                  '#/components/schemas/PartialResourceView/properties/id/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
              };
              if (vErrors === null) {
                vErrors = [err17];
              } else {
                vErrors.push(err17);
              }
              errors++;
            }
          } else {
            const err18 = {
              instancePath: instancePath + '/matchedLayer/id',
              schemaPath:
                '#/components/schemas/PartialResourceView/properties/id/type',
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
        if (data13.source !== undefined) {
          if (typeof data13.source !== 'string') {
            const err19 = {
              instancePath: instancePath + '/matchedLayer/source',
              schemaPath:
                '#/components/schemas/PartialResourceView/properties/source/type',
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
          instancePath: instancePath + '/matchedLayer',
          schemaPath: '#/components/schemas/PartialResourceView/type',
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
    if (data.matchedGrants !== undefined) {
      let data17 = data.matchedGrants;
      if (Array.isArray(data17)) {
        const len1 = data17.length;
        for (let i1 = 0; i1 < len1; i1++) {
          if (
            !validate1199(data17[i1], {
              instancePath: instancePath + '/matchedGrants/' + i1,
              parentData: data17,
              parentDataProperty: i1,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors =
              vErrors === null
                ? validate1199.errors
                : vErrors.concat(validate1199.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err21 = {
          instancePath: instancePath + '/matchedGrants',
          schemaPath: '#/properties/matchedGrants/type',
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
    if (data.trace !== undefined) {
      let data19 = data.trace;
      if (Array.isArray(data19)) {
        const len2 = data19.length;
        for (let i2 = 0; i2 < len2; i2++) {
          if (
            !validate1201(data19[i2], {
              instancePath: instancePath + '/trace/' + i2,
              parentData: data19,
              parentDataProperty: i2,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors =
              vErrors === null
                ? validate1201.errors
                : vErrors.concat(validate1201.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err22 = {
          instancePath: instancePath + '/trace',
          schemaPath: '#/properties/trace/type',
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
  validate1198.errors = vErrors;
  return errors === 0;
}
validate1198.evaluated = {
  props: {
    principal: true,
    allowed: true,
    reason: true,
    effectiveOperations: true,
    matchedLayer: true,
    matchedGrants: true,
    trace: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1190(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/explainPageReadOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1190.evaluated;
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
    !validate1191(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1191.errors
        : vErrors.concat(validate1191.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = {};
    props0.principal = true;
    props0.allowed = true;
    props0.reason = true;
    props0.effectiveOperations = true;
    props0.matchedLayer = true;
    props0.matchedGrants = true;
    props0.trace = true;
  }
  const _errs2 = errors;
  if (
    !validate1198(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1198.errors
        : vErrors.concat(validate1198.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = props0 || {};
      props0.principal = true;
      props0.allowed = true;
      props0.reason = true;
      props0.effectiveOperations = true;
      props0.matchedLayer = true;
      props0.matchedGrants = true;
      props0.trace = true;
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
  validate1190.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate1190.evaluated = { dynamicProps: true, dynamicItems: false };
export const explainPageReadOutputFull = validate1205;
const schema1355 = {
  $ref: 'https://edition.invalid/control#/components/schemas/EffectivePermissionView',
  $id: 'https://edition.invalid/validators/explainPageReadOutputFull',
};
function validate1206(
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
  const evaluated0 = validate1206.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.principal !== undefined) {
      let data0 = data.principal;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.key !== undefined) {
          if (typeof data0.key !== 'string') {
            const err0 = {
              instancePath: instancePath + '/principal/key',
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
        if (data0.type !== undefined) {
          if (typeof data0.type !== 'string') {
            const err1 = {
              instancePath: instancePath + '/principal/type',
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
        if (data0.id !== undefined) {
          let data3 = data0.id;
          if (typeof data3 !== 'string' && data3 !== null) {
            const err2 = {
              instancePath: instancePath + '/principal/id',
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
          if (typeof data3 === 'string') {
            if (!formats0.test(data3)) {
              const err3 = {
                instancePath: instancePath + '/principal/id',
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
        if (data0.name !== undefined) {
          if (typeof data0.name !== 'string') {
            const err4 = {
              instancePath: instancePath + '/principal/name',
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
        if (data0.status !== undefined) {
          if (typeof data0.status !== 'string') {
            const err5 = {
              instancePath: instancePath + '/principal/status',
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
        if (data0.email !== undefined) {
          let data6 = data0.email;
          if (typeof data6 !== 'string' && data6 !== null) {
            const err6 = {
              instancePath: instancePath + '/principal/email',
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
        if (data0.avatar !== undefined) {
          let data7 = data0.avatar;
          if (typeof data7 !== 'string' && data7 !== null) {
            const err7 = {
              instancePath: instancePath + '/principal/avatar',
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
        if (data0.memberCount !== undefined) {
          let data8 = data0.memberCount;
          if (
            !(typeof data8 == 'number' && !(data8 % 1) && !isNaN(data8)) &&
            data8 !== null
          ) {
            const err8 = {
              instancePath: instancePath + '/principal/memberCount',
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
          instancePath: instancePath + '/principal',
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
    if (data.allowed !== undefined) {
      if (typeof data.allowed !== 'boolean') {
        const err10 = {
          instancePath: instancePath + '/allowed',
          schemaPath: '#/properties/allowed/type',
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
    if (data.reason !== undefined) {
      let data10 = data.reason;
      if (typeof data10 !== 'string') {
        const err11 = {
          instancePath: instancePath + '/reason',
          schemaPath: '#/properties/reason/type',
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
        data10 === 'direct_grant' ||
        data10 === 'team_grant' ||
        data10 === 'explicit_none' ||
        data10 === 'no_grant' ||
        data10 === 'restriction_miss'
      )) {
        const err12 = {
          instancePath: instancePath + '/reason',
          schemaPath: '#/properties/reason/enum',
          keyword: 'enum',
          params: { allowedValues: schema1341.properties.reason.enum },
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
    if (data.effectiveOperations !== undefined) {
      let data11 = data.effectiveOperations;
      if (Array.isArray(data11)) {
        const len0 = data11.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data12 = data11[i0];
          if (typeof data12 !== 'string') {
            const err13 = {
              instancePath: instancePath + '/effectiveOperations/' + i0,
              schemaPath: '#/properties/effectiveOperations/items/type',
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
          if (!(
            data12 === 'read' ||
            data12 === 'write' ||
            data12 === 'publish' ||
            data12 === 'admin'
          )) {
            const err14 = {
              instancePath: instancePath + '/effectiveOperations/' + i0,
              schemaPath: '#/properties/effectiveOperations/items/enum',
              keyword: 'enum',
              params: {
                allowedValues:
                  schema1341.properties.effectiveOperations.items.enum,
              },
              message: 'must be equal to one of the allowed values',
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
          instancePath: instancePath + '/effectiveOperations',
          schemaPath: '#/properties/effectiveOperations/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err15];
        } else {
          vErrors.push(err15);
        }
        errors++;
      }
    }
    if (data.matchedLayer !== undefined) {
      let data13 = data.matchedLayer;
      if (data13 && typeof data13 == 'object' && !Array.isArray(data13)) {
        if (data13.type !== undefined) {
          if (typeof data13.type !== 'string') {
            const err16 = {
              instancePath: instancePath + '/matchedLayer/type',
              schemaPath:
                '#/components/schemas/ResourceView/properties/type/type',
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
        if (data13.id !== undefined) {
          let data15 = data13.id;
          if (typeof data15 === 'string') {
            if (!formats0.test(data15)) {
              const err17 = {
                instancePath: instancePath + '/matchedLayer/id',
                schemaPath:
                  '#/components/schemas/ResourceView/properties/id/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
              };
              if (vErrors === null) {
                vErrors = [err17];
              } else {
                vErrors.push(err17);
              }
              errors++;
            }
          } else {
            const err18 = {
              instancePath: instancePath + '/matchedLayer/id',
              schemaPath:
                '#/components/schemas/ResourceView/properties/id/type',
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
        if (data13.source !== undefined) {
          if (typeof data13.source !== 'string') {
            const err19 = {
              instancePath: instancePath + '/matchedLayer/source',
              schemaPath:
                '#/components/schemas/ResourceView/properties/source/type',
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
          instancePath: instancePath + '/matchedLayer',
          schemaPath: '#/components/schemas/ResourceView/type',
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
    if (data.matchedGrants !== undefined) {
      let data17 = data.matchedGrants;
      if (Array.isArray(data17)) {
        const len1 = data17.length;
        for (let i1 = 0; i1 < len1; i1++) {
          if (
            !validate1192(data17[i1], {
              instancePath: instancePath + '/matchedGrants/' + i1,
              parentData: data17,
              parentDataProperty: i1,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors =
              vErrors === null
                ? validate1192.errors
                : vErrors.concat(validate1192.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err21 = {
          instancePath: instancePath + '/matchedGrants',
          schemaPath: '#/properties/matchedGrants/type',
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
    if (data.trace !== undefined) {
      let data19 = data.trace;
      if (Array.isArray(data19)) {
        const len2 = data19.length;
        for (let i2 = 0; i2 < len2; i2++) {
          if (
            !validate1194(data19[i2], {
              instancePath: instancePath + '/trace/' + i2,
              parentData: data19,
              parentDataProperty: i2,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors =
              vErrors === null
                ? validate1194.errors
                : vErrors.concat(validate1194.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err22 = {
          instancePath: instancePath + '/trace',
          schemaPath: '#/properties/trace/type',
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
  validate1206.errors = vErrors;
  return errors === 0;
}
validate1206.evaluated = {
  props: {
    principal: true,
    allowed: true,
    reason: true,
    effectiveOperations: true,
    matchedLayer: true,
    matchedGrants: true,
    trace: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1205(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/explainPageReadOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1205.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate1206(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1206.errors
        : vErrors.concat(validate1206.errors);
    errors = vErrors.length;
  }
  validate1205.errors = vErrors;
  return errors === 0;
}
validate1205.evaluated = {
  props: {
    principal: true,
    allowed: true,
    reason: true,
    effectiveOperations: true,
    matchedLayer: true,
    matchedGrants: true,
    trace: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
