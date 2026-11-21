// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const schema_Activate = validate1566;
const schema828 = {
  type: 'object',
  properties: {
    contentType: { type: 'string', minLength: 1 },
    baseRevision: { type: 'integer', format: 'int32', minimum: 0 },
    versionRef: { type: 'string', minLength: 1 },
  },
  required: ['contentType', 'versionRef'],
};
const func1 = ucs2Length;
function validate1566(
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
  const evaluated0 = validate1566.evaluated;
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
    if (data.versionRef === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'versionRef' },
        message: "must have required property '" + 'versionRef' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.contentType !== undefined) {
      let data0 = data.contentType;
      if (typeof data0 === 'string') {
        if (func1(data0) < 1) {
          const err2 = {
            instancePath: instancePath + '/contentType',
            schemaPath: '#/properties/contentType/minLength',
            keyword: 'minLength',
            params: { limit: 1 },
            message: 'must NOT have fewer than 1 characters',
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
      } else {
        const err3 = {
          instancePath: instancePath + '/contentType',
          schemaPath: '#/properties/contentType/type',
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
    if (data.baseRevision !== undefined) {
      let data1 = data.baseRevision;
      if (!(typeof data1 == 'number' && !(data1 % 1) && !isNaN(data1))) {
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
      if (typeof data1 == 'number') {
        if (data1 < 0 || isNaN(data1)) {
          const err5 = {
            instancePath: instancePath + '/baseRevision',
            schemaPath: '#/properties/baseRevision/minimum',
            keyword: 'minimum',
            params: { comparison: '>=', limit: 0 },
            message: 'must be >= 0',
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
    if (data.versionRef !== undefined) {
      let data2 = data.versionRef;
      if (typeof data2 === 'string') {
        if (func1(data2) < 1) {
          const err6 = {
            instancePath: instancePath + '/versionRef',
            schemaPath: '#/properties/versionRef/minLength',
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
          instancePath: instancePath + '/versionRef',
          schemaPath: '#/properties/versionRef/type',
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
  } else {
    const err8 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err8];
    } else {
      vErrors.push(err8);
    }
    errors++;
  }
  validate1566.errors = vErrors;
  return errors === 0;
}
validate1566.evaluated = {
  props: { contentType: true, baseRevision: true, versionRef: true },
  dynamicProps: false,
  dynamicItems: false,
};
