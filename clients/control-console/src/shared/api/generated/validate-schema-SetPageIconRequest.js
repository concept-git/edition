// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const schema_SetPageIconRequest = validate1517;
const schema108 = {
  type: 'object',
  description: 'icon 为 http(s) URL；null 清空',
  properties: {
    icon: { type: ['string', 'null'], maxLength: 2048, minLength: 0 },
  },
};
const func1 = ucs2Length;
function validate1517(
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
  const evaluated0 = validate1517.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.icon !== undefined) {
      let data0 = data.icon;
      if (typeof data0 !== 'string' && data0 !== null) {
        const err0 = {
          instancePath: instancePath + '/icon',
          schemaPath: '#/properties/icon/type',
          keyword: 'type',
          params: { type: schema108.properties.icon.type },
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
        if (func1(data0) > 2048) {
          const err1 = {
            instancePath: instancePath + '/icon',
            schemaPath: '#/properties/icon/maxLength',
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
            instancePath: instancePath + '/icon',
            schemaPath: '#/properties/icon/minLength',
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
      }
    }
  } else {
    const err3 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err3];
    } else {
      vErrors.push(err3);
    }
    errors++;
  }
  validate1517.errors = vErrors;
  return errors === 0;
}
validate1517.evaluated = {
  props: { icon: true },
  dynamicProps: false,
  dynamicItems: false,
};
