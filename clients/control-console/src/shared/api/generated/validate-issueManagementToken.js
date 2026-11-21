// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const issueManagementTokenInput = validate755;
const schema864 = {
  type: 'object',
  properties: {
    header: {
      type: 'object',
      properties: {
        'Idempotency-Key': {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
      required: ['Idempotency-Key'],
    },
    body: {
      $ref: 'https://edition.invalid/control#/components/schemas/IssueRequest',
    },
  },
  required: ['header', 'body'],
  $id: 'https://edition.invalid/validators/issueManagementTokenInput',
};
const schema865 = {
  type: 'object',
  properties: {
    name: { type: 'string', maxLength: 120, minLength: 0 },
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
        minLength: 1,
      },
      minItems: 1,
      uniqueItems: true,
    },
    tenantId: { type: ['string', 'null'], format: 'uuid' },
    expiry: { type: 'string', format: 'date-time' },
  },
  required: ['expiry', 'name', 'scopes'],
};
const func1 = ucs2Length;
const pattern4 = new RegExp('^[a-zA-Z0-9._:-]+$', 'u');
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const formats10 = fullFormats['date-time'];
function validate755(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/issueManagementTokenInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate755.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.header === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'header' },
        message: "must have required property '" + 'header' + "'",
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
    if (data.header !== undefined) {
      let data0 = data.header;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0['Idempotency-Key'] === undefined) {
          const err2 = {
            instancePath: instancePath + '/header',
            schemaPath: '#/properties/header/required',
            keyword: 'required',
            params: { missingProperty: 'Idempotency-Key' },
            message: "must have required property '" + 'Idempotency-Key' + "'",
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
        if (data0['Idempotency-Key'] !== undefined) {
          let data1 = data0['Idempotency-Key'];
          if (typeof data1 === 'string') {
            if (func1(data1) > 128) {
              const err3 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/maxLength',
                keyword: 'maxLength',
                params: { limit: 128 },
                message: 'must NOT have more than 128 characters',
              };
              if (vErrors === null) {
                vErrors = [err3];
              } else {
                vErrors.push(err3);
              }
              errors++;
            }
            if (func1(data1) < 1) {
              const err4 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
              };
              if (vErrors === null) {
                vErrors = [err4];
              } else {
                vErrors.push(err4);
              }
              errors++;
            }
            if (!pattern4.test(data1)) {
              const err5 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/pattern',
                keyword: 'pattern',
                params: { pattern: '^[a-zA-Z0-9._:-]+$' },
                message: 'must match pattern "' + '^[a-zA-Z0-9._:-]+$' + '"',
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
              instancePath: instancePath + '/header/Idempotency-Key',
              schemaPath: '#/properties/header/properties/Idempotency-Key/type',
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
          instancePath: instancePath + '/header',
          schemaPath: '#/properties/header/type',
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
    if (data.body !== undefined) {
      let data2 = data.body;
      if (data2 && typeof data2 == 'object' && !Array.isArray(data2)) {
        if (data2.expiry === undefined) {
          const err8 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/IssueRequest/required',
            keyword: 'required',
            params: { missingProperty: 'expiry' },
            message: "must have required property '" + 'expiry' + "'",
          };
          if (vErrors === null) {
            vErrors = [err8];
          } else {
            vErrors.push(err8);
          }
          errors++;
        }
        if (data2.name === undefined) {
          const err9 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/IssueRequest/required',
            keyword: 'required',
            params: { missingProperty: 'name' },
            message: "must have required property '" + 'name' + "'",
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
        if (data2.scopes === undefined) {
          const err10 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/IssueRequest/required',
            keyword: 'required',
            params: { missingProperty: 'scopes' },
            message: "must have required property '" + 'scopes' + "'",
          };
          if (vErrors === null) {
            vErrors = [err10];
          } else {
            vErrors.push(err10);
          }
          errors++;
        }
        if (data2.name !== undefined) {
          let data3 = data2.name;
          if (typeof data3 === 'string') {
            if (func1(data3) > 120) {
              const err11 = {
                instancePath: instancePath + '/body/name',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/IssueRequest/properties/name/maxLength',
                keyword: 'maxLength',
                params: { limit: 120 },
                message: 'must NOT have more than 120 characters',
              };
              if (vErrors === null) {
                vErrors = [err11];
              } else {
                vErrors.push(err11);
              }
              errors++;
            }
            if (func1(data3) < 0) {
              const err12 = {
                instancePath: instancePath + '/body/name',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/IssueRequest/properties/name/minLength',
                keyword: 'minLength',
                params: { limit: 0 },
                message: 'must NOT have fewer than 0 characters',
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
              instancePath: instancePath + '/body/name',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/IssueRequest/properties/name/type',
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
        if (data2.scopes !== undefined) {
          let data4 = data2.scopes;
          if (Array.isArray(data4)) {
            if (data4.length < 1) {
              const err14 = {
                instancePath: instancePath + '/body/scopes',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/IssueRequest/properties/scopes/minItems',
                keyword: 'minItems',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 items',
              };
              if (vErrors === null) {
                vErrors = [err14];
              } else {
                vErrors.push(err14);
              }
              errors++;
            }
            const len0 = data4.length;
            for (let i0 = 0; i0 < len0; i0++) {
              let data5 = data4[i0];
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
                const err15 = {
                  instancePath: instancePath + '/body/scopes/' + i0,
                  schemaPath:
                    'https://edition.invalid/control#/components/schemas/IssueRequest/properties/scopes/items/enum',
                  keyword: 'enum',
                  params: {
                    allowedValues: schema865.properties.scopes.items.enum,
                  },
                  message: 'must be equal to one of the allowed values',
                };
                if (vErrors === null) {
                  vErrors = [err15];
                } else {
                  vErrors.push(err15);
                }
                errors++;
              }
              if (typeof data5 === 'string') {
                if (func1(data5) < 1) {
                  const err16 = {
                    instancePath: instancePath + '/body/scopes/' + i0,
                    schemaPath:
                      'https://edition.invalid/control#/components/schemas/IssueRequest/properties/scopes/items/minLength',
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
                  instancePath: instancePath + '/body/scopes/' + i0,
                  schemaPath:
                    'https://edition.invalid/control#/components/schemas/IssueRequest/properties/scopes/items/type',
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
            let i1 = data4.length;
            let j0;
            if (i1 > 1) {
              const indices0 = {};
              for (; i1--;) {
                let item0 = data4[i1];
                if (typeof item0 !== 'string') {
                  continue;
                }
                if (typeof indices0[item0] == 'number') {
                  j0 = indices0[item0];
                  const err18 = {
                    instancePath: instancePath + '/body/scopes',
                    schemaPath:
                      'https://edition.invalid/control#/components/schemas/IssueRequest/properties/scopes/uniqueItems',
                    keyword: 'uniqueItems',
                    params: { i: i1, j: j0 },
                    message:
                      'must NOT have duplicate items (items ## ' +
                      j0 +
                      ' and ' +
                      i1 +
                      ' are identical)',
                  };
                  if (vErrors === null) {
                    vErrors = [err18];
                  } else {
                    vErrors.push(err18);
                  }
                  errors++;
                  break;
                }
                indices0[item0] = i1;
              }
            }
          } else {
            const err19 = {
              instancePath: instancePath + '/body/scopes',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/IssueRequest/properties/scopes/type',
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
        if (data2.tenantId !== undefined) {
          let data6 = data2.tenantId;
          if (typeof data6 !== 'string' && data6 !== null) {
            const err20 = {
              instancePath: instancePath + '/body/tenantId',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/IssueRequest/properties/tenantId/type',
              keyword: 'type',
              params: { type: schema865.properties.tenantId.type },
              message: 'must be string,null',
            };
            if (vErrors === null) {
              vErrors = [err20];
            } else {
              vErrors.push(err20);
            }
            errors++;
          }
          if (typeof data6 === 'string') {
            if (!formats0.test(data6)) {
              const err21 = {
                instancePath: instancePath + '/body/tenantId',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/IssueRequest/properties/tenantId/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
              };
              if (vErrors === null) {
                vErrors = [err21];
              } else {
                vErrors.push(err21);
              }
              errors++;
            }
          }
        }
        if (data2.expiry !== undefined) {
          let data7 = data2.expiry;
          if (typeof data7 === 'string') {
            if (!formats10.validate(data7)) {
              const err22 = {
                instancePath: instancePath + '/body/expiry',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/IssueRequest/properties/expiry/format',
                keyword: 'format',
                params: { format: 'date-time' },
                message: 'must match format "' + 'date-time' + '"',
              };
              if (vErrors === null) {
                vErrors = [err22];
              } else {
                vErrors.push(err22);
              }
              errors++;
            }
          } else {
            const err23 = {
              instancePath: instancePath + '/body/expiry',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/IssueRequest/properties/expiry/type',
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
          instancePath: instancePath + '/body',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/IssueRequest/type',
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
    }
  } else {
    const err25 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err25];
    } else {
      vErrors.push(err25);
    }
    errors++;
  }
  validate755.errors = vErrors;
  return errors === 0;
}
validate755.evaluated = {
  props: { header: true, body: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const issueManagementTokenOutput = validate756;
const schema866 = {
  $ref: 'https://edition.invalid/control#/components/schemas/IssuedManagementToken',
  $id: 'https://edition.invalid/validators/issueManagementTokenOutput',
};
const schema867 = {
  type: 'object',
  properties: {
    token: { $ref: '#/components/schemas/ManagementTokenView' },
    secret: { type: 'string' },
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
function validate757(
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
  const evaluated0 = validate757.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.token !== undefined) {
      let data0 = data.token;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.id !== undefined) {
          let data1 = data0.id;
          if (typeof data1 === 'string') {
            if (!formats0.test(data1)) {
              const err0 = {
                instancePath: instancePath + '/token/id',
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
              instancePath: instancePath + '/token/id',
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
        if (data0.name !== undefined) {
          if (typeof data0.name !== 'string') {
            const err2 = {
              instancePath: instancePath + '/token/name',
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
        if (data0.scopes !== undefined) {
          let data3 = data0.scopes;
          if (Array.isArray(data3)) {
            const len0 = data3.length;
            for (let i0 = 0; i0 < len0; i0++) {
              let data4 = data3[i0];
              if (typeof data4 !== 'string') {
                const err3 = {
                  instancePath: instancePath + '/token/scopes/' + i0,
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
                data4 === 'content:read' ||
                data4 === 'content:write' ||
                data4 === 'content:publish' ||
                data4 === 'members:read' ||
                data4 === 'members:write' ||
                data4 === 'permissions:read' ||
                data4 === 'permissions:write' ||
                data4 === 'hosting:read' ||
                data4 === 'hosting:write' ||
                data4 === 'audit:read' ||
                data4 === 'operations:read' ||
                data4 === 'operations:write' ||
                data4 === 'account:read' ||
                data4 === 'account:write' ||
                data4 === 'platform:read' ||
                data4 === 'platform:write' ||
                data4 === 'platform:erase'
              )) {
                const err4 = {
                  instancePath: instancePath + '/token/scopes/' + i0,
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
            let i1 = data3.length;
            let j0;
            if (i1 > 1) {
              const indices0 = {};
              for (; i1--;) {
                let item0 = data3[i1];
                if (typeof item0 !== 'string') {
                  continue;
                }
                if (typeof indices0[item0] == 'number') {
                  j0 = indices0[item0];
                  const err5 = {
                    instancePath: instancePath + '/token/scopes',
                    schemaPath:
                      '#/components/schemas/ManagementTokenView/properties/scopes/uniqueItems',
                    keyword: 'uniqueItems',
                    params: { i: i1, j: j0 },
                    message:
                      'must NOT have duplicate items (items ## ' +
                      j0 +
                      ' and ' +
                      i1 +
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
                indices0[item0] = i1;
              }
            }
          } else {
            const err6 = {
              instancePath: instancePath + '/token/scopes',
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
        if (data0.tenantId !== undefined) {
          let data5 = data0.tenantId;
          if (typeof data5 !== 'string' && data5 !== null) {
            const err7 = {
              instancePath: instancePath + '/token/tenantId',
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
          if (typeof data5 === 'string') {
            if (!formats0.test(data5)) {
              const err8 = {
                instancePath: instancePath + '/token/tenantId',
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
        if (data0.expiry !== undefined) {
          let data6 = data0.expiry;
          if (typeof data6 === 'string') {
            if (!formats10.validate(data6)) {
              const err9 = {
                instancePath: instancePath + '/token/expiry',
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
              instancePath: instancePath + '/token/expiry',
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
        if (data0.status !== undefined) {
          let data7 = data0.status;
          if (typeof data7 !== 'string') {
            const err11 = {
              instancePath: instancePath + '/token/status',
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
            data7 === 'active' ||
            data7 === 'expired' ||
            data7 === 'revoked'
          )) {
            const err12 = {
              instancePath: instancePath + '/token/status',
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
        if (data0.createdAt !== undefined) {
          let data8 = data0.createdAt;
          if (typeof data8 === 'string') {
            if (!formats10.validate(data8)) {
              const err13 = {
                instancePath: instancePath + '/token/createdAt',
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
              instancePath: instancePath + '/token/createdAt',
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
        if (data0.lastUsedAt !== undefined) {
          let data9 = data0.lastUsedAt;
          if (typeof data9 !== 'string' && data9 !== null) {
            const err15 = {
              instancePath: instancePath + '/token/lastUsedAt',
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
          if (typeof data9 === 'string') {
            if (!formats10.validate(data9)) {
              const err16 = {
                instancePath: instancePath + '/token/lastUsedAt',
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
        if (data0.revokedAt !== undefined) {
          let data10 = data0.revokedAt;
          if (typeof data10 !== 'string' && data10 !== null) {
            const err17 = {
              instancePath: instancePath + '/token/revokedAt',
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
          if (typeof data10 === 'string') {
            if (!formats10.validate(data10)) {
              const err18 = {
                instancePath: instancePath + '/token/revokedAt',
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
          instancePath: instancePath + '/token',
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
    if (data.secret !== undefined) {
      if (typeof data.secret !== 'string') {
        const err20 = {
          instancePath: instancePath + '/secret',
          schemaPath: '#/properties/secret/type',
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
  validate757.errors = vErrors;
  return errors === 0;
}
validate757.evaluated = {
  props: { token: true, secret: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate756(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/issueManagementTokenOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate756.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate757(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate757.errors
        : vErrors.concat(validate757.errors);
    errors = vErrors.length;
  }
  validate756.errors = vErrors;
  return errors === 0;
}
validate756.evaluated = {
  props: { token: true, secret: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const issueManagementTokenOutputFull = validate759;
const schema869 = {
  $ref: 'https://edition.invalid/control#/components/schemas/IssuedManagementToken',
  $id: 'https://edition.invalid/validators/issueManagementTokenOutputFull',
};
function validate760(
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
  const evaluated0 = validate760.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.token !== undefined) {
      let data0 = data.token;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.id !== undefined) {
          let data1 = data0.id;
          if (typeof data1 === 'string') {
            if (!formats0.test(data1)) {
              const err0 = {
                instancePath: instancePath + '/token/id',
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
              instancePath: instancePath + '/token/id',
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
        if (data0.name !== undefined) {
          if (typeof data0.name !== 'string') {
            const err2 = {
              instancePath: instancePath + '/token/name',
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
        if (data0.scopes !== undefined) {
          let data3 = data0.scopes;
          if (Array.isArray(data3)) {
            const len0 = data3.length;
            for (let i0 = 0; i0 < len0; i0++) {
              let data4 = data3[i0];
              if (typeof data4 !== 'string') {
                const err3 = {
                  instancePath: instancePath + '/token/scopes/' + i0,
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
                data4 === 'content:read' ||
                data4 === 'content:write' ||
                data4 === 'content:publish' ||
                data4 === 'members:read' ||
                data4 === 'members:write' ||
                data4 === 'permissions:read' ||
                data4 === 'permissions:write' ||
                data4 === 'hosting:read' ||
                data4 === 'hosting:write' ||
                data4 === 'audit:read' ||
                data4 === 'operations:read' ||
                data4 === 'operations:write' ||
                data4 === 'account:read' ||
                data4 === 'account:write' ||
                data4 === 'platform:read' ||
                data4 === 'platform:write' ||
                data4 === 'platform:erase'
              )) {
                const err4 = {
                  instancePath: instancePath + '/token/scopes/' + i0,
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
            let i1 = data3.length;
            let j0;
            if (i1 > 1) {
              const indices0 = {};
              for (; i1--;) {
                let item0 = data3[i1];
                if (typeof item0 !== 'string') {
                  continue;
                }
                if (typeof indices0[item0] == 'number') {
                  j0 = indices0[item0];
                  const err5 = {
                    instancePath: instancePath + '/token/scopes',
                    schemaPath:
                      '#/components/schemas/ManagementTokenView/properties/scopes/uniqueItems',
                    keyword: 'uniqueItems',
                    params: { i: i1, j: j0 },
                    message:
                      'must NOT have duplicate items (items ## ' +
                      j0 +
                      ' and ' +
                      i1 +
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
                indices0[item0] = i1;
              }
            }
          } else {
            const err6 = {
              instancePath: instancePath + '/token/scopes',
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
        if (data0.tenantId !== undefined) {
          let data5 = data0.tenantId;
          if (typeof data5 !== 'string' && data5 !== null) {
            const err7 = {
              instancePath: instancePath + '/token/tenantId',
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
          if (typeof data5 === 'string') {
            if (!formats0.test(data5)) {
              const err8 = {
                instancePath: instancePath + '/token/tenantId',
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
        if (data0.expiry !== undefined) {
          let data6 = data0.expiry;
          if (typeof data6 === 'string') {
            if (!formats10.validate(data6)) {
              const err9 = {
                instancePath: instancePath + '/token/expiry',
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
              instancePath: instancePath + '/token/expiry',
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
        if (data0.status !== undefined) {
          let data7 = data0.status;
          if (typeof data7 !== 'string') {
            const err11 = {
              instancePath: instancePath + '/token/status',
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
            data7 === 'active' ||
            data7 === 'expired' ||
            data7 === 'revoked'
          )) {
            const err12 = {
              instancePath: instancePath + '/token/status',
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
        if (data0.createdAt !== undefined) {
          let data8 = data0.createdAt;
          if (typeof data8 === 'string') {
            if (!formats10.validate(data8)) {
              const err13 = {
                instancePath: instancePath + '/token/createdAt',
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
              instancePath: instancePath + '/token/createdAt',
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
        if (data0.lastUsedAt !== undefined) {
          let data9 = data0.lastUsedAt;
          if (typeof data9 !== 'string' && data9 !== null) {
            const err15 = {
              instancePath: instancePath + '/token/lastUsedAt',
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
          if (typeof data9 === 'string') {
            if (!formats10.validate(data9)) {
              const err16 = {
                instancePath: instancePath + '/token/lastUsedAt',
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
        if (data0.revokedAt !== undefined) {
          let data10 = data0.revokedAt;
          if (typeof data10 !== 'string' && data10 !== null) {
            const err17 = {
              instancePath: instancePath + '/token/revokedAt',
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
          if (typeof data10 === 'string') {
            if (!formats10.validate(data10)) {
              const err18 = {
                instancePath: instancePath + '/token/revokedAt',
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
          instancePath: instancePath + '/token',
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
    if (data.secret !== undefined) {
      if (typeof data.secret !== 'string') {
        const err20 = {
          instancePath: instancePath + '/secret',
          schemaPath: '#/properties/secret/type',
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
  validate760.errors = vErrors;
  return errors === 0;
}
validate760.evaluated = {
  props: { token: true, secret: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate759(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/issueManagementTokenOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate759.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate760(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate760.errors
        : vErrors.concat(validate760.errors);
    errors = vErrors.length;
  }
  validate759.errors = vErrors;
  return errors === 0;
}
validate759.evaluated = {
  props: { token: true, secret: true },
  dynamicProps: false,
  dynamicItems: false,
};
