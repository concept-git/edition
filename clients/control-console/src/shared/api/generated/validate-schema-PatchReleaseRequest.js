// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const schema_PatchReleaseRequest = validate1577;
const schema972 = {
  type: 'object',
  description: 'JSON Merge Patch: omitted keeps',
  properties: {
    label: { type: ['string', 'null'], maxLength: 32 },
    notes: { type: ['string', 'null'] },
  },
};
const func1 = ucs2Length;
function validate1577(
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
  const evaluated0 = validate1577.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.label !== undefined) {
      let data0 = data.label;
      if (typeof data0 !== 'string' && data0 !== null) {
        const err0 = {
          instancePath: instancePath + '/label',
          schemaPath: '#/properties/label/type',
          keyword: 'type',
          params: { type: schema972.properties.label.type },
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
        if (func1(data0) > 32) {
          const err1 = {
            instancePath: instancePath + '/label',
            schemaPath: '#/properties/label/maxLength',
            keyword: 'maxLength',
            params: { limit: 32 },
            message: 'must NOT have more than 32 characters',
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
    if (data.notes !== undefined) {
      let data1 = data.notes;
      if (typeof data1 !== 'string' && data1 !== null) {
        const err2 = {
          instancePath: instancePath + '/notes',
          schemaPath: '#/properties/notes/type',
          keyword: 'type',
          params: { type: schema972.properties.notes.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
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
  validate1577.errors = vErrors;
  return errors === 0;
}
validate1577.evaluated = {
  props: { label: true, notes: true },
  dynamicProps: false,
  dynamicItems: false,
};
