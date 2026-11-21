// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const schema_RelabelRequest = validate1576;
const schema950 = {
  type: 'object',
  properties: { label: { type: 'string', maxLength: 200, minLength: 0 } },
  required: ['label'],
};
const func1 = ucs2Length;
function validate1576(
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
  const evaluated0 = validate1576.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.label === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'label' },
        message: "must have required property '" + 'label' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.label !== undefined) {
      let data0 = data.label;
      if (typeof data0 === 'string') {
        if (func1(data0) > 200) {
          const err1 = {
            instancePath: instancePath + '/label',
            schemaPath: '#/properties/label/maxLength',
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
        if (func1(data0) < 0) {
          const err2 = {
            instancePath: instancePath + '/label',
            schemaPath: '#/properties/label/minLength',
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
          instancePath: instancePath + '/label',
          schemaPath: '#/properties/label/type',
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
  validate1576.errors = vErrors;
  return errors === 0;
}
validate1576.evaluated = {
  props: { label: true },
  dynamicProps: false,
  dynamicItems: false,
};
