// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const schema_ImportFromUploadRequest = validate1547;
const schema469 = {
  type: 'object',
  description:
    'Exactly one of uploadKey (presigned upload) or url (public https zip fetched by the server).',
  properties: {
    uploadKey: { type: ['string', 'null'], maxLength: 512, minLength: 0 },
    url: { type: ['string', 'null'], maxLength: 2048, minLength: 0 },
  },
};
const func1 = ucs2Length;
function validate1547(
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
  const evaluated0 = validate1547.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.uploadKey !== undefined) {
      let data0 = data.uploadKey;
      if (typeof data0 !== 'string' && data0 !== null) {
        const err0 = {
          instancePath: instancePath + '/uploadKey',
          schemaPath: '#/properties/uploadKey/type',
          keyword: 'type',
          params: { type: schema469.properties.uploadKey.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
      if (typeof data0 === 'string') {
        if (func1(data0) > 512) {
          const err1 = {
            instancePath: instancePath + '/uploadKey',
            schemaPath: '#/properties/uploadKey/maxLength',
            keyword: 'maxLength',
            params: { limit: 512 },
            message: 'must NOT have more than 512 characters',
          };
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
        if (func1(data0) < 0) {
          const err2 = {
            instancePath: instancePath + '/uploadKey',
            schemaPath: '#/properties/uploadKey/minLength',
            keyword: 'minLength',
            params: { limit: 0 },
            message: 'must NOT have fewer than 0 characters',
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
      }
    }
    if (data.url !== undefined) {
      let data1 = data.url;
      if (typeof data1 !== 'string' && data1 !== null) {
        const err3 = {
          instancePath: instancePath + '/url',
          schemaPath: '#/properties/url/type',
          keyword: 'type',
          params: { type: schema469.properties.url.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
      if (typeof data1 === 'string') {
        if (func1(data1) > 2048) {
          const err4 = {
            instancePath: instancePath + '/url',
            schemaPath: '#/properties/url/maxLength',
            keyword: 'maxLength',
            params: { limit: 2048 },
            message: 'must NOT have more than 2048 characters',
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
        if (func1(data1) < 0) {
          const err5 = {
            instancePath: instancePath + '/url',
            schemaPath: '#/properties/url/minLength',
            keyword: 'minLength',
            params: { limit: 0 },
            message: 'must NOT have fewer than 0 characters',
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
  } else {
    const err6 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err6];
    } else {
      vErrors.push(err6);
    }
    errors++;
  }
  validate1547.errors = vErrors;
  return errors === 0;
}
validate1547.evaluated = {
  props: { uploadKey: true, url: true },
  dynamicProps: false,
  dynamicItems: false,
};
