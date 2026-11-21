// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const schema_CreatePageRequest = validate1548;
const schema538 = {
  type: 'object',
  properties: {
    format: {
      type: 'string',
      minLength: 1,
      pattern: 'markdown|html|txt|json|xml',
    },
    title: { type: 'string', maxLength: 200, minLength: 0 },
    slug: { type: 'string', maxLength: 2048, minLength: 0 },
    contentType: { type: 'string' },
    versionRef: { type: ['string', 'null'] },
    interpretation: { type: 'object', additionalProperties: {} },
  },
  required: ['format', 'slug', 'title'],
};
const func1 = ucs2Length;
const pattern61 = new RegExp('markdown|html|txt|json|xml', 'u');
function validate1548(
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
  const evaluated0 = validate1548.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.format === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'format' },
        message: "must have required property '" + 'format' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.slug === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'slug' },
        message: "must have required property '" + 'slug' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.title === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'title' },
        message: "must have required property '" + 'title' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.format !== undefined) {
      let data0 = data.format;
      if (typeof data0 === 'string') {
        if (func1(data0) < 1) {
          const err3 = {
            instancePath: instancePath + '/format',
            schemaPath: '#/properties/format/minLength',
            keyword: 'minLength',
            params: { limit: 1 },
            message: 'must NOT have fewer than 1 characters',
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
        if (!pattern61.test(data0)) {
          const err4 = {
            instancePath: instancePath + '/format',
            schemaPath: '#/properties/format/pattern',
            keyword: 'pattern',
            params: { pattern: 'markdown|html|txt|json|xml' },
            message:
              'must match pattern "' + 'markdown|html|txt|json|xml' + '"',
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
          instancePath: instancePath + '/format',
          schemaPath: '#/properties/format/type',
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
    if (data.title !== undefined) {
      let data1 = data.title;
      if (typeof data1 === 'string') {
        if (func1(data1) > 200) {
          const err6 = {
            instancePath: instancePath + '/title',
            schemaPath: '#/properties/title/maxLength',
            keyword: 'maxLength',
            params: { limit: 200 },
            message: 'must NOT have more than 200 characters',
          };
          if (vErrors === null) {
            vErrors = [err6];
          } else {
            vErrors.push(err6);
          }
          errors++;
        }
        if (func1(data1) < 0) {
          const err7 = {
            instancePath: instancePath + '/title',
            schemaPath: '#/properties/title/minLength',
            keyword: 'minLength',
            params: { limit: 0 },
            message: 'must NOT have fewer than 0 characters',
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
          instancePath: instancePath + '/title',
          schemaPath: '#/properties/title/type',
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
    if (data.slug !== undefined) {
      let data2 = data.slug;
      if (typeof data2 === 'string') {
        if (func1(data2) > 2048) {
          const err9 = {
            instancePath: instancePath + '/slug',
            schemaPath: '#/properties/slug/maxLength',
            keyword: 'maxLength',
            params: { limit: 2048 },
            message: 'must NOT have more than 2048 characters',
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
        if (func1(data2) < 0) {
          const err10 = {
            instancePath: instancePath + '/slug',
            schemaPath: '#/properties/slug/minLength',
            keyword: 'minLength',
            params: { limit: 0 },
            message: 'must NOT have fewer than 0 characters',
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
          instancePath: instancePath + '/slug',
          schemaPath: '#/properties/slug/type',
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
    if (data.contentType !== undefined) {
      if (typeof data.contentType !== 'string') {
        const err12 = {
          instancePath: instancePath + '/contentType',
          schemaPath: '#/properties/contentType/type',
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
    if (data.versionRef !== undefined) {
      let data4 = data.versionRef;
      if (typeof data4 !== 'string' && data4 !== null) {
        const err13 = {
          instancePath: instancePath + '/versionRef',
          schemaPath: '#/properties/versionRef/type',
          keyword: 'type',
          params: { type: schema538.properties.versionRef.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
    }
    if (data.interpretation !== undefined) {
      let data5 = data.interpretation;
      if (data5 && typeof data5 == 'object' && !Array.isArray(data5)) {
      } else {
        const err14 = {
          instancePath: instancePath + '/interpretation',
          schemaPath: '#/properties/interpretation/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err14];
        } else {
          vErrors.push(err14);
        }
        errors++;
      }
    }
  } else {
    const err15 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err15];
    } else {
      vErrors.push(err15);
    }
    errors++;
  }
  validate1548.errors = vErrors;
  return errors === 0;
}
validate1548.evaluated = {
  props: {
    format: true,
    title: true,
    slug: true,
    contentType: true,
    versionRef: true,
    interpretation: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
