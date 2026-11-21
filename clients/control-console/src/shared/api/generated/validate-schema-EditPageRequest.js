// Generated from contracts/openapi.json. Do not edit.
'use strict';
export const schema_EditPageRequest = validate1518;
const schema124 = {
  type: 'object',
  properties: {
    content: { type: 'string' },
    contentType: { type: 'string' },
    versionRef: { type: ['string', 'null'] },
    interpretation: { type: 'object', additionalProperties: {} },
    intent: {
      type: ['string', 'null'],
      description:
        'Explicit effect constraint; omitted only for legacy clients',
      enum: ['draft_only', 'hotfix', null],
    },
  },
  required: ['content'],
};
function validate1518(
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
  const evaluated0 = validate1518.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.content === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'content' },
        message: "must have required property '" + 'content' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.content !== undefined) {
      if (typeof data.content !== 'string') {
        const err1 = {
          instancePath: instancePath + '/content',
          schemaPath: '#/properties/content/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.contentType !== undefined) {
      if (typeof data.contentType !== 'string') {
        const err2 = {
          instancePath: instancePath + '/contentType',
          schemaPath: '#/properties/contentType/type',
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
    if (data.versionRef !== undefined) {
      let data2 = data.versionRef;
      if (typeof data2 !== 'string' && data2 !== null) {
        const err3 = {
          instancePath: instancePath + '/versionRef',
          schemaPath: '#/properties/versionRef/type',
          keyword: 'type',
          params: { type: schema124.properties.versionRef.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.interpretation !== undefined) {
      let data3 = data.interpretation;
      if (data3 && typeof data3 == 'object' && !Array.isArray(data3)) {
      } else {
        const err4 = {
          instancePath: instancePath + '/interpretation',
          schemaPath: '#/properties/interpretation/type',
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
    }
    if (data.intent !== undefined) {
      let data4 = data.intent;
      if (typeof data4 !== 'string' && data4 !== null) {
        const err5 = {
          instancePath: instancePath + '/intent',
          schemaPath: '#/properties/intent/type',
          keyword: 'type',
          params: { type: schema124.properties.intent.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
      if (!(data4 === 'draft_only' || data4 === 'hotfix' || data4 === null)) {
        const err6 = {
          instancePath: instancePath + '/intent',
          schemaPath: '#/properties/intent/enum',
          keyword: 'enum',
          params: { allowedValues: schema124.properties.intent.enum },
          message: 'must be equal to one of the allowed values',
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
  validate1518.errors = vErrors;
  return errors === 0;
}
validate1518.evaluated = {
  props: {
    content: true,
    contentType: true,
    versionRef: true,
    interpretation: true,
    intent: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
