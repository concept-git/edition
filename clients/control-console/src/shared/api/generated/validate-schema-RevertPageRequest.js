// Generated from contracts/openapi.json. Do not edit.
'use strict';
export const schema_RevertPageRequest = validate1553;
const schema606 = {
  type: 'object',
  properties: { n: { type: 'integer', format: 'int32', minimum: 1 } },
};
function validate1553(
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
  const evaluated0 = validate1553.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.n !== undefined) {
      let data0 = data.n;
      if (!(typeof data0 == 'number' && !(data0 % 1) && !isNaN(data0))) {
        const err0 = {
          instancePath: instancePath + '/n',
          schemaPath: '#/properties/n/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
      if (typeof data0 == 'number') {
        if (data0 < 1 || isNaN(data0)) {
          const err1 = {
            instancePath: instancePath + '/n',
            schemaPath: '#/properties/n/minimum',
            keyword: 'minimum',
            params: { comparison: '>=', limit: 1 },
            message: 'must be >= 1',
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
  } else {
    const err2 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err2];
    } else {
      vErrors.push(err2);
    }
    errors++;
  }
  validate1553.errors = vErrors;
  return errors === 0;
}
validate1553.evaluated = {
  props: { n: true },
  dynamicProps: false,
  dynamicItems: false,
};
