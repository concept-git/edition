// Generated from contracts/openapi.json. Do not edit.
'use strict';
export const schema_RetentionRequest = validate1513;
const schema39 = {
  type: 'object',
  properties: {
    keep: { type: 'integer', format: 'int32', maximum: 50, minimum: 1 },
  },
  required: ['keep'],
};
function validate1513(
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
  const evaluated0 = validate1513.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.keep === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'keep' },
        message: "must have required property '" + 'keep' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.keep !== undefined) {
      let data0 = data.keep;
      if (!(typeof data0 == 'number' && !(data0 % 1) && !isNaN(data0))) {
        const err1 = {
          instancePath: instancePath + '/keep',
          schemaPath: '#/properties/keep/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
      if (typeof data0 == 'number') {
        if (data0 > 50 || isNaN(data0)) {
          const err2 = {
            instancePath: instancePath + '/keep',
            schemaPath: '#/properties/keep/maximum',
            keyword: 'maximum',
            params: { comparison: '<=', limit: 50 },
            message: 'must be <= 50',
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
        if (data0 < 1 || isNaN(data0)) {
          const err3 = {
            instancePath: instancePath + '/keep',
            schemaPath: '#/properties/keep/minimum',
            keyword: 'minimum',
            params: { comparison: '>=', limit: 1 },
            message: 'must be >= 1',
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
  validate1513.errors = vErrors;
  return errors === 0;
}
validate1513.evaluated = {
  props: { keep: true },
  dynamicProps: false,
  dynamicItems: false,
};
