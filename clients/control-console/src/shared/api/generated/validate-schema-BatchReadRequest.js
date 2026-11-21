// Generated from contracts/openapi.json. Do not edit.
'use strict';
export const schema_BatchReadRequest = validate1551;
const schema570 = {
  type: 'object',
  properties: {
    ids: {
      type: 'array',
      items: { type: 'string', format: 'uuid' },
      maxItems: 100,
      minItems: 1,
    },
    view: { type: 'string', enum: ['summary', 'content'] },
  },
  required: ['ids', 'view'],
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
function validate1551(
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
  const evaluated0 = validate1551.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.ids === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'ids' },
        message: "must have required property '" + 'ids' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.view === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'view' },
        message: "must have required property '" + 'view' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.ids !== undefined) {
      let data0 = data.ids;
      if (Array.isArray(data0)) {
        if (data0.length > 100) {
          const err2 = {
            instancePath: instancePath + '/ids',
            schemaPath: '#/properties/ids/maxItems',
            keyword: 'maxItems',
            params: { limit: 100 },
            message: 'must NOT have more than 100 items',
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
        if (data0.length < 1) {
          const err3 = {
            instancePath: instancePath + '/ids',
            schemaPath: '#/properties/ids/minItems',
            keyword: 'minItems',
            params: { limit: 1 },
            message: 'must NOT have fewer than 1 items',
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data1 = data0[i0];
          if (typeof data1 === 'string') {
            if (!formats0.test(data1)) {
              const err4 = {
                instancePath: instancePath + '/ids/' + i0,
                schemaPath: '#/properties/ids/items/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
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
              instancePath: instancePath + '/ids/' + i0,
              schemaPath: '#/properties/ids/items/type',
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
          instancePath: instancePath + '/ids',
          schemaPath: '#/properties/ids/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.view !== undefined) {
      let data2 = data.view;
      if (typeof data2 !== 'string') {
        const err7 = {
          instancePath: instancePath + '/view',
          schemaPath: '#/properties/view/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
      if (!(data2 === 'summary' || data2 === 'content')) {
        const err8 = {
          instancePath: instancePath + '/view',
          schemaPath: '#/properties/view/enum',
          keyword: 'enum',
          params: { allowedValues: schema570.properties.view.enum },
          message: 'must be equal to one of the allowed values',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
  } else {
    const err9 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err9];
    } else {
      vErrors.push(err9);
    }
    errors++;
  }
  validate1551.errors = vErrors;
  return errors === 0;
}
validate1551.evaluated = {
  props: { ids: true, view: true },
  dynamicProps: false,
  dynamicItems: false,
};
