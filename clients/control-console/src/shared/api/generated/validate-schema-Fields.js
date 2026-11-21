// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const schema_Fields = validate1520;
const schema152 = {
  type: 'object',
  properties: {
    fields: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['title', 'headings', 'body'],
        minLength: 1,
      },
      maxItems: 3,
      minItems: 3,
      uniqueItems: true,
    },
  },
  required: ['fields'],
};
const func1 = ucs2Length;
function validate1520(
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
  const evaluated0 = validate1520.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.fields === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'fields' },
        message: "must have required property '" + 'fields' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.fields !== undefined) {
      let data0 = data.fields;
      if (Array.isArray(data0)) {
        if (data0.length > 3) {
          const err1 = {
            instancePath: instancePath + '/fields',
            schemaPath: '#/properties/fields/maxItems',
            keyword: 'maxItems',
            params: { limit: 3 },
            message: 'must NOT have more than 3 items',
          };
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
        if (data0.length < 3) {
          const err2 = {
            instancePath: instancePath + '/fields',
            schemaPath: '#/properties/fields/minItems',
            keyword: 'minItems',
            params: { limit: 3 },
            message: 'must NOT have fewer than 3 items',
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data1 = data0[i0];
          if (!(
            data1 === 'title' ||
            data1 === 'headings' ||
            data1 === 'body'
          )) {
            const err3 = {
              instancePath: instancePath + '/fields/' + i0,
              schemaPath: '#/properties/fields/items/enum',
              keyword: 'enum',
              params: { allowedValues: schema152.properties.fields.items.enum },
              message: 'must be equal to one of the allowed values',
            };
            if (vErrors === null) {
              vErrors = [err3];
            } else {
              vErrors.push(err3);
            }
            errors++;
          }
          if (typeof data1 === 'string') {
            if (func1(data1) < 1) {
              const err4 = {
                instancePath: instancePath + '/fields/' + i0,
                schemaPath: '#/properties/fields/items/minLength',
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
          } else {
            const err5 = {
              instancePath: instancePath + '/fields/' + i0,
              schemaPath: '#/properties/fields/items/type',
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
        let i1 = data0.length;
        let j0;
        if (i1 > 1) {
          const indices0 = {};
          for (; i1--;) {
            let item0 = data0[i1];
            if (typeof item0 !== 'string') {
              continue;
            }
            if (typeof indices0[item0] == 'number') {
              j0 = indices0[item0];
              const err6 = {
                instancePath: instancePath + '/fields',
                schemaPath: '#/properties/fields/uniqueItems',
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
                vErrors = [err6];
              } else {
                vErrors.push(err6);
              }
              errors++;
              break;
            }
            indices0[item0] = i1;
          }
        }
      } else {
        const err7 = {
          instancePath: instancePath + '/fields',
          schemaPath: '#/properties/fields/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
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
  validate1520.errors = vErrors;
  return errors === 0;
}
validate1520.evaluated = {
  props: { fields: true },
  dynamicProps: false,
  dynamicItems: false,
};
