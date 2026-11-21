// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const schema_IssueRequest = validate1570;
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
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const formats10 = fullFormats['date-time'];
function validate1570(
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
  const evaluated0 = validate1570.evaluated;
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
    if (data.scopes === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'scopes' },
        message: "must have required property '" + 'scopes' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.name !== undefined) {
      let data0 = data.name;
      if (typeof data0 === 'string') {
        if (func1(data0) > 120) {
          const err3 = {
            instancePath: instancePath + '/name',
            schemaPath: '#/properties/name/maxLength',
            keyword: 'maxLength',
            params: { limit: 120 },
            message: 'must NOT have more than 120 characters',
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
        if (func1(data0) < 0) {
          const err4 = {
            instancePath: instancePath + '/name',
            schemaPath: '#/properties/name/minLength',
            keyword: 'minLength',
            params: { limit: 0 },
            message: 'must NOT have fewer than 0 characters',
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
          instancePath: instancePath + '/name',
          schemaPath: '#/properties/name/type',
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
    if (data.scopes !== undefined) {
      let data1 = data.scopes;
      if (Array.isArray(data1)) {
        if (data1.length < 1) {
          const err6 = {
            instancePath: instancePath + '/scopes',
            schemaPath: '#/properties/scopes/minItems',
            keyword: 'minItems',
            params: { limit: 1 },
            message: 'must NOT have fewer than 1 items',
          };
          if (vErrors === null) {
            vErrors = [err6];
          } else {
            vErrors.push(err6);
          }
          errors++;
        }
        const len0 = data1.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data2 = data1[i0];
          if (!(
            data2 === 'content:read' ||
            data2 === 'content:write' ||
            data2 === 'content:publish' ||
            data2 === 'members:read' ||
            data2 === 'members:write' ||
            data2 === 'permissions:read' ||
            data2 === 'permissions:write' ||
            data2 === 'hosting:read' ||
            data2 === 'hosting:write' ||
            data2 === 'audit:read' ||
            data2 === 'operations:read' ||
            data2 === 'operations:write' ||
            data2 === 'account:read' ||
            data2 === 'account:write' ||
            data2 === 'platform:read' ||
            data2 === 'platform:write' ||
            data2 === 'platform:erase'
          )) {
            const err7 = {
              instancePath: instancePath + '/scopes/' + i0,
              schemaPath: '#/properties/scopes/items/enum',
              keyword: 'enum',
              params: { allowedValues: schema865.properties.scopes.items.enum },
              message: 'must be equal to one of the allowed values',
            };
            if (vErrors === null) {
              vErrors = [err7];
            } else {
              vErrors.push(err7);
            }
            errors++;
          }
          if (typeof data2 === 'string') {
            if (func1(data2) < 1) {
              const err8 = {
                instancePath: instancePath + '/scopes/' + i0,
                schemaPath: '#/properties/scopes/items/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
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
              instancePath: instancePath + '/scopes/' + i0,
              schemaPath: '#/properties/scopes/items/type',
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
        let i1 = data1.length;
        let j0;
        if (i1 > 1) {
          const indices0 = {};
          for (; i1--;) {
            let item0 = data1[i1];
            if (typeof item0 !== 'string') {
              continue;
            }
            if (typeof indices0[item0] == 'number') {
              j0 = indices0[item0];
              const err10 = {
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
                vErrors = [err10];
              } else {
                vErrors.push(err10);
              }
              errors++;
              break;
            }
            indices0[item0] = i1;
          }
        }
      } else {
        const err11 = {
          instancePath: instancePath + '/scopes',
          schemaPath: '#/properties/scopes/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.tenantId !== undefined) {
      let data3 = data.tenantId;
      if (typeof data3 !== 'string' && data3 !== null) {
        const err12 = {
          instancePath: instancePath + '/tenantId',
          schemaPath: '#/properties/tenantId/type',
          keyword: 'type',
          params: { type: schema865.properties.tenantId.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
      if (typeof data3 === 'string') {
        if (!formats0.test(data3)) {
          const err13 = {
            instancePath: instancePath + '/tenantId',
            schemaPath: '#/properties/tenantId/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err13];
          } else {
            vErrors.push(err13);
          }
          errors++;
        }
      }
    }
    if (data.expiry !== undefined) {
      let data4 = data.expiry;
      if (typeof data4 === 'string') {
        if (!formats10.validate(data4)) {
          const err14 = {
            instancePath: instancePath + '/expiry',
            schemaPath: '#/properties/expiry/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
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
          instancePath: instancePath + '/expiry',
          schemaPath: '#/properties/expiry/type',
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
  validate1570.errors = vErrors;
  return errors === 0;
}
validate1570.evaluated = {
  props: { name: true, scopes: true, tenantId: true, expiry: true },
  dynamicProps: false,
  dynamicItems: false,
};
