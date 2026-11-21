// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const schema_Compile = validate1562;
const schema777 = {
  type: 'object',
  properties: {
    baseRevision: { type: 'integer', format: 'int32', minimum: 1 },
    sourceDigest: { type: 'string', minLength: 1 },
    entryPoint: { type: 'string', minLength: 1 },
    bundle: { type: 'string', minLength: 1 },
    environment: { type: 'string', minLength: 1 },
  },
  required: ['bundle', 'entryPoint', 'environment', 'sourceDigest'],
};
const func1 = ucs2Length;
function validate1562(
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
  const evaluated0 = validate1562.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.bundle === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'bundle' },
        message: "must have required property '" + 'bundle' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.entryPoint === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'entryPoint' },
        message: "must have required property '" + 'entryPoint' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.environment === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'environment' },
        message: "must have required property '" + 'environment' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.sourceDigest === undefined) {
      const err3 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'sourceDigest' },
        message: "must have required property '" + 'sourceDigest' + "'",
      };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.baseRevision !== undefined) {
      let data0 = data.baseRevision;
      if (!(typeof data0 == 'number' && !(data0 % 1) && !isNaN(data0))) {
        const err4 = {
          instancePath: instancePath + '/baseRevision',
          schemaPath: '#/properties/baseRevision/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
      if (typeof data0 == 'number') {
        if (data0 < 1 || isNaN(data0)) {
          const err5 = {
            instancePath: instancePath + '/baseRevision',
            schemaPath: '#/properties/baseRevision/minimum',
            keyword: 'minimum',
            params: { comparison: '>=', limit: 1 },
            message: 'must be >= 1',
          };
          if (vErrors === null) {
            vErrors = [err5];
          } else {
            vErrors.push(err5);
          }
          errors++;
        }
      }
    }
    if (data.sourceDigest !== undefined) {
      let data1 = data.sourceDigest;
      if (typeof data1 === 'string') {
        if (func1(data1) < 1) {
          const err6 = {
            instancePath: instancePath + '/sourceDigest',
            schemaPath: '#/properties/sourceDigest/minLength',
            keyword: 'minLength',
            params: { limit: 1 },
            message: 'must NOT have fewer than 1 characters',
          };
          if (vErrors === null) {
            vErrors = [err6];
          } else {
            vErrors.push(err6);
          }
          errors++;
        }
      } else {
        const err7 = {
          instancePath: instancePath + '/sourceDigest',
          schemaPath: '#/properties/sourceDigest/type',
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
    }
    if (data.entryPoint !== undefined) {
      let data2 = data.entryPoint;
      if (typeof data2 === 'string') {
        if (func1(data2) < 1) {
          const err8 = {
            instancePath: instancePath + '/entryPoint',
            schemaPath: '#/properties/entryPoint/minLength',
            keyword: 'minLength',
            params: { limit: 1 },
            message: 'must NOT have fewer than 1 characters',
          };
          if (vErrors === null) {
            vErrors = [err8];
          } else {
            vErrors.push(err8);
          }
          errors++;
        }
      } else {
        const err9 = {
          instancePath: instancePath + '/entryPoint',
          schemaPath: '#/properties/entryPoint/type',
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
    if (data.bundle !== undefined) {
      let data3 = data.bundle;
      if (typeof data3 === 'string') {
        if (func1(data3) < 1) {
          const err10 = {
            instancePath: instancePath + '/bundle',
            schemaPath: '#/properties/bundle/minLength',
            keyword: 'minLength',
            params: { limit: 1 },
            message: 'must NOT have fewer than 1 characters',
          };
          if (vErrors === null) {
            vErrors = [err10];
          } else {
            vErrors.push(err10);
          }
          errors++;
        }
      } else {
        const err11 = {
          instancePath: instancePath + '/bundle',
          schemaPath: '#/properties/bundle/type',
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
    if (data.environment !== undefined) {
      let data4 = data.environment;
      if (typeof data4 === 'string') {
        if (func1(data4) < 1) {
          const err12 = {
            instancePath: instancePath + '/environment',
            schemaPath: '#/properties/environment/minLength',
            keyword: 'minLength',
            params: { limit: 1 },
            message: 'must NOT have fewer than 1 characters',
          };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
      } else {
        const err13 = {
          instancePath: instancePath + '/environment',
          schemaPath: '#/properties/environment/type',
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
  } else {
    const err14 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err14];
    } else {
      vErrors.push(err14);
    }
    errors++;
  }
  validate1562.errors = vErrors;
  return errors === 0;
}
validate1562.evaluated = {
  props: {
    baseRevision: true,
    sourceDigest: true,
    entryPoint: true,
    bundle: true,
    environment: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
