// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const schema_PreviewPageRequest = validate1550;
const schema564 = {
  type: 'object',
  properties: {
    format: {
      type: 'string',
      minLength: 1,
      pattern: 'markdown|html|txt|json|xml',
    },
    content: { type: 'string' },
  },
  required: ['content', 'format'],
};
const func1 = ucs2Length;
const pattern61 = new RegExp('markdown|html|txt|json|xml', 'u');
function validate1550(
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
  const evaluated0 = validate1550.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.content === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'content' },
        message: "must have required property '" + 'content' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.format === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'format' },
        message: "must have required property '" + 'format' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.format !== undefined) {
      let data0 = data.format;
      if (typeof data0 === 'string') {
        if (func1(data0) < 1) {
          const err2 = {
            instancePath: instancePath + '/format',
            schemaPath: '#/properties/format/minLength',
            keyword: 'minLength',
            params: { limit: 1 },
            message: 'must NOT have fewer than 1 characters',
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
        if (!pattern61.test(data0)) {
          const err3 = {
            instancePath: instancePath + '/format',
            schemaPath: '#/properties/format/pattern',
            keyword: 'pattern',
            params: { pattern: 'markdown|html|txt|json|xml' },
            message:
              'must match pattern "' + 'markdown|html|txt|json|xml' + '"',
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
      } else {
        const err4 = {
          instancePath: instancePath + '/format',
          schemaPath: '#/properties/format/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.content !== undefined) {
      if (typeof data.content !== 'string') {
        const err5 = {
          instancePath: instancePath + '/content',
          schemaPath: '#/properties/content/type',
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
  } else {
    const err6 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err6];
    } else {
      vErrors.push(err6);
    }
    errors++;
  }
  validate1550.errors = vErrors;
  return errors === 0;
}
validate1550.evaluated = {
  props: { format: true, content: true },
  dynamicProps: false,
  dynamicItems: false,
};
