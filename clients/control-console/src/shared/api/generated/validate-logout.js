// Generated from contracts/openapi.json. Do not edit.
'use strict';
export const logoutInput = validate249;
const schema334 = {
  type: 'object',
  properties: {},
  required: [],
  $id: 'https://edition.invalid/validators/logoutInput',
};
function validate249(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/logoutInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate249.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (!(data && typeof data == 'object' && !Array.isArray(data))) {
    const err0 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
  }
  validate249.errors = vErrors;
  return errors === 0;
}
validate249.evaluated = { dynamicProps: false, dynamicItems: false };
