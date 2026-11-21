// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const schema_ReslugPageRequest = validate1554;
const schema625 = {
  type: 'object',
  properties: { slug: { type: 'string', maxLength: 2048, minLength: 0 } },
  required: ['slug'],
};
const func1 = ucs2Length;
function validate1554(
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
  const evaluated0 = validate1554.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.slug === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'slug' },
        message: "must have required property '" + 'slug' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.slug !== undefined) {
      let data0 = data.slug;
      if (typeof data0 === 'string') {
        if (func1(data0) > 2048) {
          const err1 = {
            instancePath: instancePath + '/slug',
            schemaPath: '#/properties/slug/maxLength',
            keyword: 'maxLength',
            params: { limit: 2048 },
            message: 'must NOT have more than 2048 characters',
          };
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
        if (func1(data0) < 0) {
          const err2 = {
            instancePath: instancePath + '/slug',
            schemaPath: '#/properties/slug/minLength',
            keyword: 'minLength',
            params: { limit: 0 },
            message: 'must NOT have fewer than 0 characters',
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
      } else {
        const err3 = {
          instancePath: instancePath + '/slug',
          schemaPath: '#/properties/slug/type',
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
      instancePath,
      schemaPath: '#/type',
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
  validate1554.errors = vErrors;
  return errors === 0;
}
validate1554.evaluated = {
  props: { slug: true },
  dynamicProps: false,
  dynamicItems: false,
};
