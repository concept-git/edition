// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const schema_Save = validate1523;
const schema213 = {
  type: 'object',
  properties: {
    baseRevision: { type: 'integer', format: 'int32', minimum: 1 },
    name: { type: 'string', minLength: 1 },
    contentType: { type: 'string', minLength: 1 },
    source: { $ref: '#/components/schemas/Source' },
  },
  required: ['contentType', 'name', 'source'],
};
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
const func1 = ucs2Length;
function validate1523(
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
  const evaluated0 = validate1523.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.contentType === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'contentType' },
        message: "must have required property '" + 'contentType' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.name === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'name' },
        message: "must have required property '" + 'name' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.source === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'source' },
        message: "must have required property '" + 'source' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.baseRevision !== undefined) {
      let data0 = data.baseRevision;
      if (!(typeof data0 == 'number' && !(data0 % 1) && !isNaN(data0))) {
        const err3 = {
          instancePath: instancePath + '/baseRevision',
          schemaPath: '#/properties/baseRevision/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
      if (typeof data0 == 'number') {
        if (data0 < 1 || isNaN(data0)) {
          const err4 = {
            instancePath: instancePath + '/baseRevision',
            schemaPath: '#/properties/baseRevision/minimum',
            keyword: 'minimum',
            params: { comparison: '>=', limit: 1 },
            message: 'must be >= 1',
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
      }
    }
    if (data.name !== undefined) {
      let data1 = data.name;
      if (typeof data1 === 'string') {
        if (func1(data1) < 1) {
          const err5 = {
            instancePath: instancePath + '/name',
            schemaPath: '#/properties/name/minLength',
            keyword: 'minLength',
            params: { limit: 1 },
            message: 'must NOT have fewer than 1 characters',
          };
          if (vErrors === null) {
            vErrors = [err5];
          } else {
            vErrors.push(err5);
          }
          errors++;
        }
      } else {
        const err6 = {
          instancePath: instancePath + '/name',
          schemaPath: '#/properties/name/type',
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
    if (data.contentType !== undefined) {
      let data2 = data.contentType;
      if (typeof data2 === 'string') {
        if (func1(data2) < 1) {
          const err7 = {
            instancePath: instancePath + '/contentType',
            schemaPath: '#/properties/contentType/minLength',
            keyword: 'minLength',
            params: { limit: 1 },
            message: 'must NOT have fewer than 1 characters',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      } else {
        const err8 = {
          instancePath: instancePath + '/contentType',
          schemaPath: '#/properties/contentType/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.source !== undefined) {
      let data3 = data.source;
      if (data3 && typeof data3 == 'object' && !Array.isArray(data3)) {
        if (data3.files !== undefined) {
          let data4 = data3.files;
          if (data4 && typeof data4 == 'object' && !Array.isArray(data4)) {
            for (const key0 in data4) {
              if (typeof data4[key0] !== 'string') {
                const err9 = {
                  instancePath:
                    instancePath +
                    '/source/files/' +
                    key0.replace(/~/g, '~0').replace(/\//g, '~1'),
                  schemaPath:
                    '#/components/schemas/Source/properties/files/additionalProperties/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err9];
                } else {
                  vErrors.push(err9);
                }
                errors++;
              }
            }
          } else {
            const err10 = {
              instancePath: instancePath + '/source/files',
              schemaPath: '#/components/schemas/Source/properties/files/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
            };
            if (vErrors === null) {
              vErrors = [err10];
            } else {
              vErrors.push(err10);
            }
            errors++;
          }
        }
        if (data3.manifest !== undefined) {
          if (typeof data3.manifest !== 'string') {
            const err11 = {
              instancePath: instancePath + '/source/manifest',
              schemaPath:
                '#/components/schemas/Source/properties/manifest/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err11];
            } else {
              vErrors.push(err11);
            }
            errors++;
          }
        }
        if (data3.configuration !== undefined) {
          if (typeof data3.configuration !== 'string') {
            const err12 = {
              instancePath: instancePath + '/source/configuration',
              schemaPath:
                '#/components/schemas/Source/properties/configuration/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err12];
            } else {
              vErrors.push(err12);
            }
            errors++;
          }
        }
        if (data3.fixtures !== undefined) {
          if (typeof data3.fixtures !== 'string') {
            const err13 = {
              instancePath: instancePath + '/source/fixtures',
              schemaPath:
                '#/components/schemas/Source/properties/fixtures/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err13];
            } else {
              vErrors.push(err13);
            }
            errors++;
          }
        }
        if (data3.dependencyLock !== undefined) {
          if (typeof data3.dependencyLock !== 'string') {
            const err14 = {
              instancePath: instancePath + '/source/dependencyLock',
              schemaPath:
                '#/components/schemas/Source/properties/dependencyLock/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
        }
        if (data3.baselineRef !== undefined) {
          if (typeof data3.baselineRef !== 'string') {
            const err15 = {
              instancePath: instancePath + '/source/baselineRef',
              schemaPath:
                '#/components/schemas/Source/properties/baselineRef/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err15];
            } else {
              vErrors.push(err15);
            }
            errors++;
          }
        }
      } else {
        const err16 = {
          instancePath: instancePath + '/source',
          schemaPath: '#/components/schemas/Source/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err16];
        } else {
          vErrors.push(err16);
        }
        errors++;
      }
    }
  } else {
    const err17 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err17];
    } else {
      vErrors.push(err17);
    }
    errors++;
  }
  validate1523.errors = vErrors;
  return errors === 0;
}
validate1523.evaluated = {
  props: { baseRevision: true, name: true, contentType: true, source: true },
  dynamicProps: false,
  dynamicItems: false,
};
