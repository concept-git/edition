// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const schema_UpdateSpaceRequest = validate1575;
const schema937 = {
  type: 'object',
  description: 'JSON Merge Patch: omitted keeps, null clears',
  properties: {
    name: { type: ['string', 'null'], maxLength: 120 },
    icon: {
      type: ['string', 'null'],
      enum: ['book', 'code', 'api', 'guide', 'reference', null],
    },
    description: { type: ['string', 'null'], maxLength: 4000 },
    autoRelease: { type: ['boolean', 'null'] },
  },
};
const func1 = ucs2Length;
function validate1575(
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
  const evaluated0 = validate1575.evaluated;
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
          params: { type: schema937.properties.name.type },
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
        if (func1(data0) > 120) {
          const err1 = {
            instancePath: instancePath + '/name',
            schemaPath: '#/properties/name/maxLength',
            keyword: 'maxLength',
            params: { limit: 120 },
            message: 'must NOT have more than 120 characters',
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
          params: { type: schema937.properties.icon.type },
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
          params: { allowedValues: schema937.properties.icon.enum },
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
    if (data.description !== undefined) {
      let data2 = data.description;
      if (typeof data2 !== 'string' && data2 !== null) {
        const err4 = {
          instancePath: instancePath + '/description',
          schemaPath: '#/properties/description/type',
          keyword: 'type',
          params: { type: schema937.properties.description.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
      if (typeof data2 === 'string') {
        if (func1(data2) > 4000) {
          const err5 = {
            instancePath: instancePath + '/description',
            schemaPath: '#/properties/description/maxLength',
            keyword: 'maxLength',
            params: { limit: 4000 },
            message: 'must NOT have more than 4000 characters',
          };
          if (vErrors === null) {
            vErrors = [err5];
          } else {
            vErrors.push(err5);
          }
          errors++;
        }
      }
    }
    if (data.autoRelease !== undefined) {
      let data3 = data.autoRelease;
      if (typeof data3 !== 'boolean' && data3 !== null) {
        const err6 = {
          instancePath: instancePath + '/autoRelease',
          schemaPath: '#/properties/autoRelease/type',
          keyword: 'type',
          params: { type: schema937.properties.autoRelease.type },
          message: 'must be boolean,null',
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
      instancePath,
      schemaPath: '#/type',
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
  validate1575.errors = vErrors;
  return errors === 0;
}
validate1575.evaluated = {
  props: { name: true, icon: true, description: true, autoRelease: true },
  dynamicProps: false,
  dynamicItems: false,
};
