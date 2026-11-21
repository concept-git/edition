// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const schema_PageSeoPatchRequest = validate1579;
const schema1004 = {
  type: 'object',
  description: 'JSON Merge Patch: omitted keeps, null clears',
  properties: {
    title: { type: ['string', 'null'], maxLength: 200 },
    description: { type: ['string', 'null'], maxLength: 500 },
    keywords: { type: ['string', 'null'], maxLength: 500 },
    ogImage: { type: ['string', 'null'], maxLength: 2048 },
    noIndex: { type: ['boolean', 'null'] },
  },
};
const func1 = ucs2Length;
function validate1579(
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
  const evaluated0 = validate1579.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.title !== undefined) {
      let data0 = data.title;
      if (typeof data0 !== 'string' && data0 !== null) {
        const err0 = {
          instancePath: instancePath + '/title',
          schemaPath: '#/properties/title/type',
          keyword: 'type',
          params: { type: schema1004.properties.title.type },
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
            instancePath: instancePath + '/title',
            schemaPath: '#/properties/title/maxLength',
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
    if (data.description !== undefined) {
      let data1 = data.description;
      if (typeof data1 !== 'string' && data1 !== null) {
        const err2 = {
          instancePath: instancePath + '/description',
          schemaPath: '#/properties/description/type',
          keyword: 'type',
          params: { type: schema1004.properties.description.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
      if (typeof data1 === 'string') {
        if (func1(data1) > 500) {
          const err3 = {
            instancePath: instancePath + '/description',
            schemaPath: '#/properties/description/maxLength',
            keyword: 'maxLength',
            params: { limit: 500 },
            message: 'must NOT have more than 500 characters',
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
      }
    }
    if (data.keywords !== undefined) {
      let data2 = data.keywords;
      if (typeof data2 !== 'string' && data2 !== null) {
        const err4 = {
          instancePath: instancePath + '/keywords',
          schemaPath: '#/properties/keywords/type',
          keyword: 'type',
          params: { type: schema1004.properties.keywords.type },
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
        if (func1(data2) > 500) {
          const err5 = {
            instancePath: instancePath + '/keywords',
            schemaPath: '#/properties/keywords/maxLength',
            keyword: 'maxLength',
            params: { limit: 500 },
            message: 'must NOT have more than 500 characters',
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
    if (data.ogImage !== undefined) {
      let data3 = data.ogImage;
      if (typeof data3 !== 'string' && data3 !== null) {
        const err6 = {
          instancePath: instancePath + '/ogImage',
          schemaPath: '#/properties/ogImage/type',
          keyword: 'type',
          params: { type: schema1004.properties.ogImage.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
      if (typeof data3 === 'string') {
        if (func1(data3) > 2048) {
          const err7 = {
            instancePath: instancePath + '/ogImage',
            schemaPath: '#/properties/ogImage/maxLength',
            keyword: 'maxLength',
            params: { limit: 2048 },
            message: 'must NOT have more than 2048 characters',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      }
    }
    if (data.noIndex !== undefined) {
      let data4 = data.noIndex;
      if (typeof data4 !== 'boolean' && data4 !== null) {
        const err8 = {
          instancePath: instancePath + '/noIndex',
          schemaPath: '#/properties/noIndex/type',
          keyword: 'type',
          params: { type: schema1004.properties.noIndex.type },
          message: 'must be boolean,null',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
  } else {
    const err9 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err9];
    } else {
      vErrors.push(err9);
    }
    errors++;
  }
  validate1579.errors = vErrors;
  return errors === 0;
}
validate1579.evaluated = {
  props: {
    title: true,
    description: true,
    keywords: true,
    ogImage: true,
    noIndex: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
