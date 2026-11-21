// Generated from contracts/openapi.json. Do not edit.
'use strict';
export const schema_RestrictionRequest = validate1516;
const schema95 = {
  type: 'object',
  properties: {
    principals: {
      type: 'array',
      items: {
        type: 'string',
        pattern:
          '(?:user|team|token):[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|anonymous',
      },
    },
  },
  required: ['principals'],
};
const pattern7 = new RegExp(
  '(?:user|team|token):[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|anonymous',
  'u',
);
function validate1516(
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
  const evaluated0 = validate1516.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.principals === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'principals' },
        message: "must have required property '" + 'principals' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.principals !== undefined) {
      let data0 = data.principals;
      if (Array.isArray(data0)) {
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data1 = data0[i0];
          if (typeof data1 === 'string') {
            if (!pattern7.test(data1)) {
              const err1 = {
                instancePath: instancePath + '/principals/' + i0,
                schemaPath: '#/properties/principals/items/pattern',
                keyword: 'pattern',
                params: {
                  pattern:
                    '(?:user|team|token):[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|anonymous',
                },
                message:
                  'must match pattern "' +
                  '(?:user|team|token):[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|anonymous' +
                  '"',
              };
              if (vErrors === null) {
                vErrors = [err1];
              } else {
                vErrors.push(err1);
              }
              errors++;
            }
          } else {
            const err2 = {
              instancePath: instancePath + '/principals/' + i0,
              schemaPath: '#/properties/principals/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
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
          instancePath: instancePath + '/principals',
          schemaPath: '#/properties/principals/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
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
  validate1516.errors = vErrors;
  return errors === 0;
}
validate1516.evaluated = {
  props: { principals: true },
  dynamicProps: false,
  dynamicItems: false,
};
