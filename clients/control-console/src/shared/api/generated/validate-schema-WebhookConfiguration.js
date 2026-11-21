// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const schema_WebhookConfiguration = validate1512;
const schema33 = {
  type: 'object',
  properties: {
    url: { type: 'string', maxLength: 2048, minLength: 0 },
    scopeType: { type: 'string', pattern: 'tenant|space|site' },
    scopeId: { type: 'string', format: 'uuid' },
    events: {
      type: 'array',
      items: { type: 'string', minLength: 1 },
      minItems: 1,
      uniqueItems: true,
    },
    active: { type: 'boolean' },
  },
  required: ['events', 'scopeType', 'url'],
};
const func1 = ucs2Length;
const pattern5 = new RegExp('tenant|space|site', 'u');
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
function validate1512(
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
  const evaluated0 = validate1512.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.events === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'events' },
        message: "must have required property '" + 'events' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.scopeType === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'scopeType' },
        message: "must have required property '" + 'scopeType' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.url === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'url' },
        message: "must have required property '" + 'url' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.url !== undefined) {
      let data0 = data.url;
      if (typeof data0 === 'string') {
        if (func1(data0) > 2048) {
          const err3 = {
            instancePath: instancePath + '/url',
            schemaPath: '#/properties/url/maxLength',
            keyword: 'maxLength',
            params: { limit: 2048 },
            message: 'must NOT have more than 2048 characters',
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
            instancePath: instancePath + '/url',
            schemaPath: '#/properties/url/minLength',
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
          instancePath: instancePath + '/url',
          schemaPath: '#/properties/url/type',
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
    if (data.scopeType !== undefined) {
      let data1 = data.scopeType;
      if (typeof data1 === 'string') {
        if (!pattern5.test(data1)) {
          const err6 = {
            instancePath: instancePath + '/scopeType',
            schemaPath: '#/properties/scopeType/pattern',
            keyword: 'pattern',
            params: { pattern: 'tenant|space|site' },
            message: 'must match pattern "' + 'tenant|space|site' + '"',
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
          instancePath: instancePath + '/scopeType',
          schemaPath: '#/properties/scopeType/type',
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
    if (data.scopeId !== undefined) {
      let data2 = data.scopeId;
      if (typeof data2 === 'string') {
        if (!formats0.test(data2)) {
          const err8 = {
            instancePath: instancePath + '/scopeId',
            schemaPath: '#/properties/scopeId/format',
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
          instancePath: instancePath + '/scopeId',
          schemaPath: '#/properties/scopeId/type',
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
    if (data.events !== undefined) {
      let data3 = data.events;
      if (Array.isArray(data3)) {
        if (data3.length < 1) {
          const err10 = {
            instancePath: instancePath + '/events',
            schemaPath: '#/properties/events/minItems',
            keyword: 'minItems',
            params: { limit: 1 },
            message: 'must NOT have fewer than 1 items',
          };
          if (vErrors === null) {
            vErrors = [err10];
          } else {
            vErrors.push(err10);
          }
          errors++;
        }
        const len0 = data3.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data4 = data3[i0];
          if (typeof data4 === 'string') {
            if (func1(data4) < 1) {
              const err11 = {
                instancePath: instancePath + '/events/' + i0,
                schemaPath: '#/properties/events/items/minLength',
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
              instancePath: instancePath + '/events/' + i0,
              schemaPath: '#/properties/events/items/type',
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
              const err13 = {
                instancePath: instancePath + '/events',
                schemaPath: '#/properties/events/uniqueItems',
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
                vErrors = [err13];
              } else {
                vErrors.push(err13);
              }
              errors++;
              break;
            }
            indices0[item0] = i1;
          }
        }
      } else {
        const err14 = {
          instancePath: instancePath + '/events',
          schemaPath: '#/properties/events/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err14];
        } else {
          vErrors.push(err14);
        }
        errors++;
      }
    }
    if (data.active !== undefined) {
      if (typeof data.active !== 'boolean') {
        const err15 = {
          instancePath: instancePath + '/active',
          schemaPath: '#/properties/active/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
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
  validate1512.errors = vErrors;
  return errors === 0;
}
validate1512.evaluated = {
  props: {
    url: true,
    scopeType: true,
    scopeId: true,
    events: true,
    active: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
