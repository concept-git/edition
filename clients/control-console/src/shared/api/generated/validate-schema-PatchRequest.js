// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const schema_PatchRequest = validate1582;
const schema1056 = {
  type: 'object',
  properties: {
    name: { type: ['string', 'null'], maxLength: 200 },
    icon: {
      type: ['string', 'null'],
      enum: ['book', 'code', 'api', 'guide', 'reference', null],
    },
  },
};
const func1 = ucs2Length;
function validate1582(
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
  const evaluated0 = validate1582.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.name !== undefined) {
      let data0 = data.name;
      if (typeof data0 !== 'string' && data0 !== null) {
        const err0 = {
          instancePath: instancePath + '/name',
          schemaPath: '#/properties/name/type',
          keyword: 'type',
          params: { type: schema1056.properties.name.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
      if (typeof data0 === 'string') {
        if (func1(data0) > 200) {
          const err1 = {
            instancePath: instancePath + '/name',
            schemaPath: '#/properties/name/maxLength',
            keyword: 'maxLength',
            params: { limit: 200 },
            message: 'must NOT have more than 200 characters',
          };
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
      }
    }
    if (data.icon !== undefined) {
      let data1 = data.icon;
      if (typeof data1 !== 'string' && data1 !== null) {
        const err2 = {
          instancePath: instancePath + '/icon',
          schemaPath: '#/properties/icon/type',
          keyword: 'type',
          params: { type: schema1056.properties.icon.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
      if (!(
        data1 === 'book' ||
        data1 === 'code' ||
        data1 === 'api' ||
        data1 === 'guide' ||
        data1 === 'reference' ||
        data1 === null
      )) {
        const err3 = {
          instancePath: instancePath + '/icon',
          schemaPath: '#/properties/icon/enum',
          keyword: 'enum',
          params: { allowedValues: schema1056.properties.icon.enum },
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
  validate1582.errors = vErrors;
  return errors === 0;
}
validate1582.evaluated = {
  props: { name: true, icon: true },
  dynamicProps: false,
  dynamicItems: false,
};
