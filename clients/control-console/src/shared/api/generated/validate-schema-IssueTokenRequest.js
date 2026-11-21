// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const schema_IssueTokenRequest = validate1537;
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
const func1 = ucs2Length;
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const formats10 = fullFormats['date-time'];
function validate1537(
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
  const evaluated0 = validate1537.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.expiry === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'expiry' },
        message: "must have required property '" + 'expiry' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.name === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'name' },
        message: "must have required property '" + 'name' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.role === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'role' },
        message: "must have required property '" + 'role' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.scopes === undefined) {
      const err3 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'scopes' },
        message: "must have required property '" + 'scopes' + "'",
      };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.spaceId === undefined) {
      const err4 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'spaceId' },
        message: "must have required property '" + 'spaceId' + "'",
      };
      if (vErrors === null) {
        vErrors = [err4];
      } else {
        vErrors.push(err4);
      }
      errors++;
    }
    if (data.name !== undefined) {
      let data0 = data.name;
      if (typeof data0 === 'string') {
        if (func1(data0) > 120) {
          const err5 = {
            instancePath: instancePath + '/name',
            schemaPath: '#/properties/name/maxLength',
            keyword: 'maxLength',
            params: { limit: 120 },
            message: 'must NOT have more than 120 characters',
          };
          if (vErrors === null) {
            vErrors = [err5];
          } else {
            vErrors.push(err5);
          }
          errors++;
        }
        if (func1(data0) < 0) {
          const err6 = {
            instancePath: instancePath + '/name',
            schemaPath: '#/properties/name/minLength',
            keyword: 'minLength',
            params: { limit: 0 },
            message: 'must NOT have fewer than 0 characters',
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
          instancePath: instancePath + '/name',
          schemaPath: '#/properties/name/type',
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
    if (data.spaceId !== undefined) {
      let data1 = data.spaceId;
      if (typeof data1 === 'string') {
        if (!formats0.test(data1)) {
          const err8 = {
            instancePath: instancePath + '/spaceId',
            schemaPath: '#/properties/spaceId/format',
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
      } else {
        const err9 = {
          instancePath: instancePath + '/spaceId',
          schemaPath: '#/properties/spaceId/type',
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
    if (data.role !== undefined) {
      let data2 = data.role;
      if (typeof data2 === 'string') {
        if (func1(data2) > 80) {
          const err10 = {
            instancePath: instancePath + '/role',
            schemaPath: '#/properties/role/maxLength',
            keyword: 'maxLength',
            params: { limit: 80 },
            message: 'must NOT have more than 80 characters',
          };
          if (vErrors === null) {
            vErrors = [err10];
          } else {
            vErrors.push(err10);
          }
          errors++;
        }
        if (func1(data2) < 0) {
          const err11 = {
            instancePath: instancePath + '/role',
            schemaPath: '#/properties/role/minLength',
            keyword: 'minLength',
            params: { limit: 0 },
            message: 'must NOT have fewer than 0 characters',
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
          instancePath: instancePath + '/role',
          schemaPath: '#/properties/role/type',
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
    if (data.scopes !== undefined) {
      let data3 = data.scopes;
      if (Array.isArray(data3)) {
        if (data3.length < 1) {
          const err13 = {
            instancePath: instancePath + '/scopes',
            schemaPath: '#/properties/scopes/minItems',
            keyword: 'minItems',
            params: { limit: 1 },
            message: 'must NOT have fewer than 1 items',
          };
          if (vErrors === null) {
            vErrors = [err13];
          } else {
            vErrors.push(err13);
          }
          errors++;
        }
        const len0 = data3.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data4 = data3[i0];
          if (!(data4 === 'read' || data4 === 'write' || data4 === 'publish')) {
            const err14 = {
              instancePath: instancePath + '/scopes/' + i0,
              schemaPath: '#/properties/scopes/items/enum',
              keyword: 'enum',
              params: { allowedValues: schema360.properties.scopes.items.enum },
              message: 'must be equal to one of the allowed values',
            };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
          if (typeof data4 === 'string') {
            if (func1(data4) < 1) {
              const err15 = {
                instancePath: instancePath + '/scopes/' + i0,
                schemaPath: '#/properties/scopes/items/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
              };
              if (vErrors === null) {
                vErrors = [err15];
              } else {
                vErrors.push(err15);
              }
              errors++;
            }
          } else {
            const err16 = {
              instancePath: instancePath + '/scopes/' + i0,
              schemaPath: '#/properties/scopes/items/type',
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
              const err17 = {
                instancePath: instancePath + '/scopes',
                schemaPath: '#/properties/scopes/uniqueItems',
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
                vErrors = [err17];
              } else {
                vErrors.push(err17);
              }
              errors++;
              break;
            }
            indices0[item0] = i1;
          }
        }
      } else {
        const err18 = {
          instancePath: instancePath + '/scopes',
          schemaPath: '#/properties/scopes/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err18];
        } else {
          vErrors.push(err18);
        }
        errors++;
      }
    }
    if (data.expiry !== undefined) {
      let data5 = data.expiry;
      if (typeof data5 === 'string') {
        if (!formats10.validate(data5)) {
          const err19 = {
            instancePath: instancePath + '/expiry',
            schemaPath: '#/properties/expiry/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
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
          instancePath: instancePath + '/expiry',
          schemaPath: '#/properties/expiry/type',
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
  validate1537.errors = vErrors;
  return errors === 0;
}
validate1537.evaluated = {
  props: { name: true, spaceId: true, role: true, scopes: true, expiry: true },
  dynamicProps: false,
  dynamicItems: false,
};
