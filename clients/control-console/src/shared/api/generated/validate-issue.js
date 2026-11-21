// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const issueInput = validate267;
const schema359 = {
  type: 'object',
  properties: {
    path: {
      type: 'object',
      properties: { tenantId: { type: 'string', format: 'uuid' } },
      required: ['tenantId'],
    },
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
      $ref: 'https://edition.invalid/control#/components/schemas/IssueTokenRequest',
    },
  },
  required: ['path', 'header', 'body'],
  $id: 'https://edition.invalid/validators/issueInput',
};
const schema360 = {
  type: 'object',
  properties: {
    name: { type: 'string', maxLength: 120, minLength: 0 },
    spaceId: { type: 'string', format: 'uuid' },
    role: { type: 'string', maxLength: 80, minLength: 0 },
    scopes: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['read', 'write', 'publish'],
        minLength: 1,
      },
      minItems: 1,
      uniqueItems: true,
    },
    expiry: { type: 'string', format: 'date-time' },
  },
  required: ['expiry', 'name', 'role', 'scopes', 'spaceId'],
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const formats10 = fullFormats['date-time'];
const func1 = ucs2Length;
const pattern4 = new RegExp('^[a-zA-Z0-9._:-]+$', 'u');
function validate267(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/issueInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate267.evaluated;
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
    if (data.header === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'header' },
        message: "must have required property '" + 'header' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.body === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'body' },
        message: "must have required property '" + 'body' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.path !== undefined) {
      let data0 = data.path;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.tenantId === undefined) {
          const err3 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'tenantId' },
            message: "must have required property '" + 'tenantId' + "'",
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
    if (data.header !== undefined) {
      let data2 = data.header;
      if (data2 && typeof data2 == 'object' && !Array.isArray(data2)) {
        if (data2['Idempotency-Key'] === undefined) {
          const err7 = {
            instancePath: instancePath + '/header',
            schemaPath: '#/properties/header/required',
            keyword: 'required',
            params: { missingProperty: 'Idempotency-Key' },
            message: "must have required property '" + 'Idempotency-Key' + "'",
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
        if (data2['Idempotency-Key'] !== undefined) {
          let data3 = data2['Idempotency-Key'];
          if (typeof data3 === 'string') {
            if (func1(data3) > 128) {
              const err8 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/maxLength',
                keyword: 'maxLength',
                params: { limit: 128 },
                message: 'must NOT have more than 128 characters',
              };
              if (vErrors === null) {
                vErrors = [err8];
              } else {
                vErrors.push(err8);
              }
              errors++;
            }
            if (func1(data3) < 1) {
              const err9 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
              };
              if (vErrors === null) {
                vErrors = [err9];
              } else {
                vErrors.push(err9);
              }
              errors++;
            }
            if (!pattern4.test(data3)) {
              const err10 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/pattern',
                keyword: 'pattern',
                params: { pattern: '^[a-zA-Z0-9._:-]+$' },
                message: 'must match pattern "' + '^[a-zA-Z0-9._:-]+$' + '"',
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
              instancePath: instancePath + '/header/Idempotency-Key',
              schemaPath: '#/properties/header/properties/Idempotency-Key/type',
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
          instancePath: instancePath + '/header',
          schemaPath: '#/properties/header/type',
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
    if (data.body !== undefined) {
      let data4 = data.body;
      if (data4 && typeof data4 == 'object' && !Array.isArray(data4)) {
        if (data4.expiry === undefined) {
          const err13 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/IssueTokenRequest/required',
            keyword: 'required',
            params: { missingProperty: 'expiry' },
            message: "must have required property '" + 'expiry' + "'",
          };
          if (vErrors === null) {
            vErrors = [err13];
          } else {
            vErrors.push(err13);
          }
          errors++;
        }
        if (data4.name === undefined) {
          const err14 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/IssueTokenRequest/required',
            keyword: 'required',
            params: { missingProperty: 'name' },
            message: "must have required property '" + 'name' + "'",
          };
          if (vErrors === null) {
            vErrors = [err14];
          } else {
            vErrors.push(err14);
          }
          errors++;
        }
        if (data4.role === undefined) {
          const err15 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/IssueTokenRequest/required',
            keyword: 'required',
            params: { missingProperty: 'role' },
            message: "must have required property '" + 'role' + "'",
          };
          if (vErrors === null) {
            vErrors = [err15];
          } else {
            vErrors.push(err15);
          }
          errors++;
        }
        if (data4.scopes === undefined) {
          const err16 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/IssueTokenRequest/required',
            keyword: 'required',
            params: { missingProperty: 'scopes' },
            message: "must have required property '" + 'scopes' + "'",
          };
          if (vErrors === null) {
            vErrors = [err16];
          } else {
            vErrors.push(err16);
          }
          errors++;
        }
        if (data4.spaceId === undefined) {
          const err17 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/IssueTokenRequest/required',
            keyword: 'required',
            params: { missingProperty: 'spaceId' },
            message: "must have required property '" + 'spaceId' + "'",
          };
          if (vErrors === null) {
            vErrors = [err17];
          } else {
            vErrors.push(err17);
          }
          errors++;
        }
        if (data4.name !== undefined) {
          let data5 = data4.name;
          if (typeof data5 === 'string') {
            if (func1(data5) > 120) {
              const err18 = {
                instancePath: instancePath + '/body/name',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/IssueTokenRequest/properties/name/maxLength',
                keyword: 'maxLength',
                params: { limit: 120 },
                message: 'must NOT have more than 120 characters',
              };
              if (vErrors === null) {
                vErrors = [err18];
              } else {
                vErrors.push(err18);
              }
              errors++;
            }
            if (func1(data5) < 0) {
              const err19 = {
                instancePath: instancePath + '/body/name',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/IssueTokenRequest/properties/name/minLength',
                keyword: 'minLength',
                params: { limit: 0 },
                message: 'must NOT have fewer than 0 characters',
              };
              if (vErrors === null) {
                vErrors = [err19];
              } else {
                vErrors.push(err19);
              }
              errors++;
            }
          } else {
            const err20 = {
              instancePath: instancePath + '/body/name',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/IssueTokenRequest/properties/name/type',
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
        if (data4.spaceId !== undefined) {
          let data6 = data4.spaceId;
          if (typeof data6 === 'string') {
            if (!formats0.test(data6)) {
              const err21 = {
                instancePath: instancePath + '/body/spaceId',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/IssueTokenRequest/properties/spaceId/format',
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
          } else {
            const err22 = {
              instancePath: instancePath + '/body/spaceId',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/IssueTokenRequest/properties/spaceId/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err22];
            } else {
              vErrors.push(err22);
            }
            errors++;
          }
        }
        if (data4.role !== undefined) {
          let data7 = data4.role;
          if (typeof data7 === 'string') {
            if (func1(data7) > 80) {
              const err23 = {
                instancePath: instancePath + '/body/role',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/IssueTokenRequest/properties/role/maxLength',
                keyword: 'maxLength',
                params: { limit: 80 },
                message: 'must NOT have more than 80 characters',
              };
              if (vErrors === null) {
                vErrors = [err23];
              } else {
                vErrors.push(err23);
              }
              errors++;
            }
            if (func1(data7) < 0) {
              const err24 = {
                instancePath: instancePath + '/body/role',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/IssueTokenRequest/properties/role/minLength',
                keyword: 'minLength',
                params: { limit: 0 },
                message: 'must NOT have fewer than 0 characters',
              };
              if (vErrors === null) {
                vErrors = [err24];
              } else {
                vErrors.push(err24);
              }
              errors++;
            }
          } else {
            const err25 = {
              instancePath: instancePath + '/body/role',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/IssueTokenRequest/properties/role/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err25];
            } else {
              vErrors.push(err25);
            }
            errors++;
          }
        }
        if (data4.scopes !== undefined) {
          let data8 = data4.scopes;
          if (Array.isArray(data8)) {
            if (data8.length < 1) {
              const err26 = {
                instancePath: instancePath + '/body/scopes',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/IssueTokenRequest/properties/scopes/minItems',
                keyword: 'minItems',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 items',
              };
              if (vErrors === null) {
                vErrors = [err26];
              } else {
                vErrors.push(err26);
              }
              errors++;
            }
            const len0 = data8.length;
            for (let i0 = 0; i0 < len0; i0++) {
              let data9 = data8[i0];
              if (!(
                data9 === 'read' ||
                data9 === 'write' ||
                data9 === 'publish'
              )) {
                const err27 = {
                  instancePath: instancePath + '/body/scopes/' + i0,
                  schemaPath:
                    'https://edition.invalid/control#/components/schemas/IssueTokenRequest/properties/scopes/items/enum',
                  keyword: 'enum',
                  params: {
                    allowedValues: schema360.properties.scopes.items.enum,
                  },
                  message: 'must be equal to one of the allowed values',
                };
                if (vErrors === null) {
                  vErrors = [err27];
                } else {
                  vErrors.push(err27);
                }
                errors++;
              }
              if (typeof data9 === 'string') {
                if (func1(data9) < 1) {
                  const err28 = {
                    instancePath: instancePath + '/body/scopes/' + i0,
                    schemaPath:
                      'https://edition.invalid/control#/components/schemas/IssueTokenRequest/properties/scopes/items/minLength',
                    keyword: 'minLength',
                    params: { limit: 1 },
                    message: 'must NOT have fewer than 1 characters',
                  };
                  if (vErrors === null) {
                    vErrors = [err28];
                  } else {
                    vErrors.push(err28);
                  }
                  errors++;
                }
              } else {
                const err29 = {
                  instancePath: instancePath + '/body/scopes/' + i0,
                  schemaPath:
                    'https://edition.invalid/control#/components/schemas/IssueTokenRequest/properties/scopes/items/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err29];
                } else {
                  vErrors.push(err29);
                }
                errors++;
              }
            }
            let i1 = data8.length;
            let j0;
            if (i1 > 1) {
              const indices0 = {};
              for (; i1--;) {
                let item0 = data8[i1];
                if (typeof item0 !== 'string') {
                  continue;
                }
                if (typeof indices0[item0] == 'number') {
                  j0 = indices0[item0];
                  const err30 = {
                    instancePath: instancePath + '/body/scopes',
                    schemaPath:
                      'https://edition.invalid/control#/components/schemas/IssueTokenRequest/properties/scopes/uniqueItems',
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
                    vErrors = [err30];
                  } else {
                    vErrors.push(err30);
                  }
                  errors++;
                  break;
                }
                indices0[item0] = i1;
              }
            }
          } else {
            const err31 = {
              instancePath: instancePath + '/body/scopes',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/IssueTokenRequest/properties/scopes/type',
              keyword: 'type',
              params: { type: 'array' },
              message: 'must be array',
            };
            if (vErrors === null) {
              vErrors = [err31];
            } else {
              vErrors.push(err31);
            }
            errors++;
          }
        }
        if (data4.expiry !== undefined) {
          let data10 = data4.expiry;
          if (typeof data10 === 'string') {
            if (!formats10.validate(data10)) {
              const err32 = {
                instancePath: instancePath + '/body/expiry',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/IssueTokenRequest/properties/expiry/format',
                keyword: 'format',
                params: { format: 'date-time' },
                message: 'must match format "' + 'date-time' + '"',
              };
              if (vErrors === null) {
                vErrors = [err32];
              } else {
                vErrors.push(err32);
              }
              errors++;
            }
          } else {
            const err33 = {
              instancePath: instancePath + '/body/expiry',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/IssueTokenRequest/properties/expiry/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err33];
            } else {
              vErrors.push(err33);
            }
            errors++;
          }
        }
      } else {
        const err34 = {
          instancePath: instancePath + '/body',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/IssueTokenRequest/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err34];
        } else {
          vErrors.push(err34);
        }
        errors++;
      }
    }
  } else {
    const err35 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err35];
    } else {
      vErrors.push(err35);
    }
    errors++;
  }
  validate267.errors = vErrors;
  return errors === 0;
}
validate267.evaluated = {
  props: { path: true, header: true, body: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const issueOutput = validate268;
const schema361 = {
  $ref: 'https://edition.invalid/control#/components/schemas/IssuedToken',
  $id: 'https://edition.invalid/validators/issueOutput',
};
const schema362 = {
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
    secret: { type: 'string' },
  },
};
function validate268(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/issueOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate268.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.id !== undefined) {
      let data0 = data.id;
      if (typeof data0 === 'string') {
        if (!formats0.test(data0)) {
          const err0 = {
            instancePath: instancePath + '/id',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/IssuedToken/properties/id/format',
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
          instancePath: instancePath + '/id',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/IssuedToken/properties/id/type',
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
    if (data.name !== undefined) {
      if (typeof data.name !== 'string') {
        const err2 = {
          instancePath: instancePath + '/name',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/IssuedToken/properties/name/type',
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
    if (data.ownerId !== undefined) {
      let data2 = data.ownerId;
      if (typeof data2 === 'string') {
        if (!formats0.test(data2)) {
          const err3 = {
            instancePath: instancePath + '/ownerId',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/IssuedToken/properties/ownerId/format',
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
          instancePath: instancePath + '/ownerId',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/IssuedToken/properties/ownerId/type',
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
    if (data.tenantId !== undefined) {
      let data3 = data.tenantId;
      if (typeof data3 === 'string') {
        if (!formats0.test(data3)) {
          const err5 = {
            instancePath: instancePath + '/tenantId',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/IssuedToken/properties/tenantId/format',
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
          instancePath: instancePath + '/tenantId',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/IssuedToken/properties/tenantId/type',
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
    if (data.spaceId !== undefined) {
      let data4 = data.spaceId;
      if (typeof data4 === 'string') {
        if (!formats0.test(data4)) {
          const err7 = {
            instancePath: instancePath + '/spaceId',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/IssuedToken/properties/spaceId/format',
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
          instancePath: instancePath + '/spaceId',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/IssuedToken/properties/spaceId/type',
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
    if (data.role !== undefined) {
      if (typeof data.role !== 'string') {
        const err9 = {
          instancePath: instancePath + '/role',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/IssuedToken/properties/role/type',
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
    if (data.scopes !== undefined) {
      let data6 = data.scopes;
      if (Array.isArray(data6)) {
        const len0 = data6.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (typeof data6[i0] !== 'string') {
            const err10 = {
              instancePath: instancePath + '/scopes/' + i0,
              schemaPath:
                'https://edition.invalid/control#/components/schemas/IssuedToken/properties/scopes/items/type',
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
        let i1 = data6.length;
        let j0;
        if (i1 > 1) {
          const indices0 = {};
          for (; i1--;) {
            let item0 = data6[i1];
            if (typeof item0 !== 'string') {
              continue;
            }
            if (typeof indices0[item0] == 'number') {
              j0 = indices0[item0];
              const err11 = {
                instancePath: instancePath + '/scopes',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/IssuedToken/properties/scopes/uniqueItems',
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
                vErrors = [err11];
              } else {
                vErrors.push(err11);
              }
              errors++;
              break;
            }
            indices0[item0] = i1;
          }
        }
      } else {
        const err12 = {
          instancePath: instancePath + '/scopes',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/IssuedToken/properties/scopes/type',
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
    if (data.expiry !== undefined) {
      let data8 = data.expiry;
      if (typeof data8 === 'string') {
        if (!formats10.validate(data8)) {
          const err13 = {
            instancePath: instancePath + '/expiry',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/IssuedToken/properties/expiry/format',
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
          instancePath: instancePath + '/expiry',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/IssuedToken/properties/expiry/type',
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
    if (data.status !== undefined) {
      if (typeof data.status !== 'string') {
        const err15 = {
          instancePath: instancePath + '/status',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/IssuedToken/properties/status/type',
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
    if (data.createdAt !== undefined) {
      let data10 = data.createdAt;
      if (typeof data10 === 'string') {
        if (!formats10.validate(data10)) {
          const err16 = {
            instancePath: instancePath + '/createdAt',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/IssuedToken/properties/createdAt/format',
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
          instancePath: instancePath + '/createdAt',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/IssuedToken/properties/createdAt/type',
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
    if (data.secret !== undefined) {
      if (typeof data.secret !== 'string') {
        const err18 = {
          instancePath: instancePath + '/secret',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/IssuedToken/properties/secret/type',
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
  } else {
    const err19 = {
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/IssuedToken/type',
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
  validate268.errors = vErrors;
  return errors === 0;
}
validate268.evaluated = {
  props: {
    id: true,
    name: true,
    ownerId: true,
    tenantId: true,
    spaceId: true,
    role: true,
    scopes: true,
    expiry: true,
    status: true,
    createdAt: true,
    secret: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
export const issueOutputFull = validate269;
const schema363 = {
  $ref: 'https://edition.invalid/control#/components/schemas/IssuedToken',
  $id: 'https://edition.invalid/validators/issueOutputFull',
};
function validate269(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/issueOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate269.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.id !== undefined) {
      let data0 = data.id;
      if (typeof data0 === 'string') {
        if (!formats0.test(data0)) {
          const err0 = {
            instancePath: instancePath + '/id',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/IssuedToken/properties/id/format',
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
          instancePath: instancePath + '/id',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/IssuedToken/properties/id/type',
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
    if (data.name !== undefined) {
      if (typeof data.name !== 'string') {
        const err2 = {
          instancePath: instancePath + '/name',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/IssuedToken/properties/name/type',
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
    if (data.ownerId !== undefined) {
      let data2 = data.ownerId;
      if (typeof data2 === 'string') {
        if (!formats0.test(data2)) {
          const err3 = {
            instancePath: instancePath + '/ownerId',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/IssuedToken/properties/ownerId/format',
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
          instancePath: instancePath + '/ownerId',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/IssuedToken/properties/ownerId/type',
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
    if (data.tenantId !== undefined) {
      let data3 = data.tenantId;
      if (typeof data3 === 'string') {
        if (!formats0.test(data3)) {
          const err5 = {
            instancePath: instancePath + '/tenantId',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/IssuedToken/properties/tenantId/format',
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
          instancePath: instancePath + '/tenantId',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/IssuedToken/properties/tenantId/type',
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
    if (data.spaceId !== undefined) {
      let data4 = data.spaceId;
      if (typeof data4 === 'string') {
        if (!formats0.test(data4)) {
          const err7 = {
            instancePath: instancePath + '/spaceId',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/IssuedToken/properties/spaceId/format',
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
          instancePath: instancePath + '/spaceId',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/IssuedToken/properties/spaceId/type',
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
    if (data.role !== undefined) {
      if (typeof data.role !== 'string') {
        const err9 = {
          instancePath: instancePath + '/role',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/IssuedToken/properties/role/type',
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
    if (data.scopes !== undefined) {
      let data6 = data.scopes;
      if (Array.isArray(data6)) {
        const len0 = data6.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (typeof data6[i0] !== 'string') {
            const err10 = {
              instancePath: instancePath + '/scopes/' + i0,
              schemaPath:
                'https://edition.invalid/control#/components/schemas/IssuedToken/properties/scopes/items/type',
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
        let i1 = data6.length;
        let j0;
        if (i1 > 1) {
          const indices0 = {};
          for (; i1--;) {
            let item0 = data6[i1];
            if (typeof item0 !== 'string') {
              continue;
            }
            if (typeof indices0[item0] == 'number') {
              j0 = indices0[item0];
              const err11 = {
                instancePath: instancePath + '/scopes',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/IssuedToken/properties/scopes/uniqueItems',
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
                vErrors = [err11];
              } else {
                vErrors.push(err11);
              }
              errors++;
              break;
            }
            indices0[item0] = i1;
          }
        }
      } else {
        const err12 = {
          instancePath: instancePath + '/scopes',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/IssuedToken/properties/scopes/type',
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
    if (data.expiry !== undefined) {
      let data8 = data.expiry;
      if (typeof data8 === 'string') {
        if (!formats10.validate(data8)) {
          const err13 = {
            instancePath: instancePath + '/expiry',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/IssuedToken/properties/expiry/format',
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
          instancePath: instancePath + '/expiry',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/IssuedToken/properties/expiry/type',
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
    if (data.status !== undefined) {
      if (typeof data.status !== 'string') {
        const err15 = {
          instancePath: instancePath + '/status',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/IssuedToken/properties/status/type',
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
    if (data.createdAt !== undefined) {
      let data10 = data.createdAt;
      if (typeof data10 === 'string') {
        if (!formats10.validate(data10)) {
          const err16 = {
            instancePath: instancePath + '/createdAt',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/IssuedToken/properties/createdAt/format',
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
          instancePath: instancePath + '/createdAt',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/IssuedToken/properties/createdAt/type',
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
    if (data.secret !== undefined) {
      if (typeof data.secret !== 'string') {
        const err18 = {
          instancePath: instancePath + '/secret',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/IssuedToken/properties/secret/type',
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
  } else {
    const err19 = {
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/IssuedToken/type',
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
  validate269.errors = vErrors;
  return errors === 0;
}
validate269.evaluated = {
  props: {
    id: true,
    name: true,
    ownerId: true,
    tenantId: true,
    spaceId: true,
    role: true,
    scopes: true,
    expiry: true,
    status: true,
    createdAt: true,
    secret: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
