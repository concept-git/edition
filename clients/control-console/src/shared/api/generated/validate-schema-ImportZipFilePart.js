// Generated from contracts/openapi.json. Do not edit.
'use strict';
export const schema_ImportZipFilePart = validate1546;
const schema1694 = {
  type: 'object',
  properties: { file: { type: 'string', format: 'binary' } },
};
function validate1546(
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
  const evaluated0 = validate1546.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.file !== undefined) {
      if (!(typeof data.file === 'string')) {
        const err0 = {
          instancePath: instancePath + '/file',
          schemaPath: '#/properties/file/type',
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
      instancePath,
      schemaPath: '#/type',
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
  validate1546.errors = vErrors;
  return errors === 0;
}
validate1546.evaluated = {
  props: { file: true },
  dynamicProps: false,
  dynamicItems: false,
};
