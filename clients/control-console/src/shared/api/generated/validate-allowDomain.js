// Generated from contracts/openapi.json. Do not edit.
'use strict';
export const allowDomainInput = validate987;
const schema1155 = {
  type: 'object',
  properties: {
    query: {
      type: 'object',
      properties: { domain: { type: 'string' } },
      required: [],
    },
  },
  required: [],
  $id: 'https://edition.invalid/validators/allowDomainInput',
};
function validate987(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/allowDomainInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate987.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.query !== undefined) {
      let data0 = data.query;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.domain !== undefined) {
          if (typeof data0.domain !== 'string') {
            const err0 = {
              instancePath: instancePath + '/query/domain',
              schemaPath: '#/properties/query/properties/domain/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err0];
            } else {
              vErrors.push(err0);
            }
            errors++;
          }
        }
      } else {
        const err1 = {
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
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
  validate987.errors = vErrors;
  return errors === 0;
}
validate987.evaluated = {
  props: { query: true },
  dynamicProps: false,
  dynamicItems: false,
};
