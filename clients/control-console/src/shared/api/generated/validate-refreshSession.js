// Generated from contracts/openapi.json. Do not edit.
'use strict';
export const refreshSessionInput = validate244;
const schema325 = {
  type: 'object',
  properties: {},
  required: [],
  $id: 'https://edition.invalid/validators/refreshSessionInput',
};
function validate244(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/refreshSessionInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate244.evaluated;
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
  validate244.errors = vErrors;
  return errors === 0;
}
validate244.evaluated = { dynamicProps: false, dynamicItems: false };
export const refreshSessionOutput = validate245;
const schema326 = {
  $ref: 'https://edition.invalid/control#/components/schemas/TokenResponse',
  $id: 'https://edition.invalid/validators/refreshSessionOutput',
};
const schema327 = {
  type: 'object',
  properties: {
    accessToken: { type: 'string' },
    tokenType: { type: 'string' },
    expiresIn: { type: 'integer', format: 'int64' },
  },
};
function validate245(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/refreshSessionOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate245.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.accessToken !== undefined) {
      if (typeof data.accessToken !== 'string') {
        const err0 = {
          instancePath: instancePath + '/accessToken',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TokenResponse/properties/accessToken/type',
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
    if (data.tokenType !== undefined) {
      if (typeof data.tokenType !== 'string') {
        const err1 = {
          instancePath: instancePath + '/tokenType',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TokenResponse/properties/tokenType/type',
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
    if (data.expiresIn !== undefined) {
      let data2 = data.expiresIn;
      if (!(typeof data2 == 'number' && !(data2 % 1) && !isNaN(data2))) {
        const err2 = {
          instancePath: instancePath + '/expiresIn',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TokenResponse/properties/expiresIn/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
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
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/TokenResponse/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err3];
    } else {
      vErrors.push(err3);
    }
    errors++;
  }
  validate245.errors = vErrors;
  return errors === 0;
}
validate245.evaluated = {
  props: { accessToken: true, tokenType: true, expiresIn: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const refreshSessionOutputFull = validate246;
const schema328 = {
  $ref: 'https://edition.invalid/control#/components/schemas/TokenResponse',
  $id: 'https://edition.invalid/validators/refreshSessionOutputFull',
};
function validate246(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/refreshSessionOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate246.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.accessToken !== undefined) {
      if (typeof data.accessToken !== 'string') {
        const err0 = {
          instancePath: instancePath + '/accessToken',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TokenResponse/properties/accessToken/type',
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
    if (data.tokenType !== undefined) {
      if (typeof data.tokenType !== 'string') {
        const err1 = {
          instancePath: instancePath + '/tokenType',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TokenResponse/properties/tokenType/type',
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
    if (data.expiresIn !== undefined) {
      let data2 = data.expiresIn;
      if (!(typeof data2 == 'number' && !(data2 % 1) && !isNaN(data2))) {
        const err2 = {
          instancePath: instancePath + '/expiresIn',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TokenResponse/properties/expiresIn/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
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
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/TokenResponse/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err3];
    } else {
      vErrors.push(err3);
    }
    errors++;
  }
  validate246.errors = vErrors;
  return errors === 0;
}
validate246.evaluated = {
  props: { accessToken: true, tokenType: true, expiresIn: true },
  dynamicProps: false,
  dynamicItems: false,
};
