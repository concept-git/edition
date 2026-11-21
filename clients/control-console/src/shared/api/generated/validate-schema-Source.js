// Generated from contracts/openapi.json. Do not edit.
'use strict';
export const schema_Source = validate1511;
const schema206 = {
  type: 'object',
  properties: {
    files: { type: 'object', additionalProperties: { type: 'string' } },
    manifest: { type: 'string' },
    configuration: { type: 'string' },
    fixtures: { type: 'string' },
    dependencyLock: { type: 'string' },
    baselineRef: { type: 'string' },
  },
};
function validate1511(
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
  const evaluated0 = validate1511.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.files !== undefined) {
      let data0 = data.files;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        for (const key0 in data0) {
          if (typeof data0[key0] !== 'string') {
            const err0 = {
              instancePath:
                instancePath +
                '/files/' +
                key0.replace(/~/g, '~0').replace(/\//g, '~1'),
              schemaPath: '#/properties/files/additionalProperties/type',
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
          instancePath: instancePath + '/files',
          schemaPath: '#/properties/files/type',
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
    if (data.manifest !== undefined) {
      if (typeof data.manifest !== 'string') {
        const err2 = {
          instancePath: instancePath + '/manifest',
          schemaPath: '#/properties/manifest/type',
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
    if (data.configuration !== undefined) {
      if (typeof data.configuration !== 'string') {
        const err3 = {
          instancePath: instancePath + '/configuration',
          schemaPath: '#/properties/configuration/type',
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
    if (data.fixtures !== undefined) {
      if (typeof data.fixtures !== 'string') {
        const err4 = {
          instancePath: instancePath + '/fixtures',
          schemaPath: '#/properties/fixtures/type',
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
    if (data.dependencyLock !== undefined) {
      if (typeof data.dependencyLock !== 'string') {
        const err5 = {
          instancePath: instancePath + '/dependencyLock',
          schemaPath: '#/properties/dependencyLock/type',
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
    if (data.baselineRef !== undefined) {
      if (typeof data.baselineRef !== 'string') {
        const err6 = {
          instancePath: instancePath + '/baselineRef',
          schemaPath: '#/properties/baselineRef/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
  } else {
    const err7 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err7];
    } else {
      vErrors.push(err7);
    }
    errors++;
  }
  validate1511.errors = vErrors;
  return errors === 0;
}
validate1511.evaluated = {
  props: {
    files: true,
    manifest: true,
    configuration: true,
    fixtures: true,
    dependencyLock: true,
    baselineRef: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
