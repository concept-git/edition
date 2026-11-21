// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const schema_Verify = validate1559;
const schema742 = {
  type: 'object',
  properties: {
    developmentId: { type: 'string', format: 'uuid' },
    candidateId: { type: 'string', format: 'uuid' },
    fixtureDigest: { type: 'string', minLength: 1 },
    environment: { type: 'string', minLength: 1 },
    browserEvidence: { $ref: '#/components/schemas/Evidence' },
  },
  required: [
    'browserEvidence',
    'candidateId',
    'developmentId',
    'environment',
    'fixtureDigest',
  ],
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
const schema743 = {
  type: 'object',
  properties: {
    passed: { type: 'boolean' },
    checks: { type: 'array', items: { $ref: '#/components/schemas/Check' } },
  },
};
const schema744 = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    passed: { type: 'boolean' },
    message: { type: 'string' },
  },
};
function validate622(
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
  const evaluated0 = validate622.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.passed !== undefined) {
      if (typeof data.passed !== 'boolean') {
        const err0 = {
          instancePath: instancePath + '/passed',
          schemaPath: '#/properties/passed/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
    if (data.checks !== undefined) {
      let data1 = data.checks;
      if (Array.isArray(data1)) {
        const len0 = data1.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data2 = data1[i0];
          if (data2 && typeof data2 == 'object' && !Array.isArray(data2)) {
            if (data2.name !== undefined) {
              if (typeof data2.name !== 'string') {
                const err1 = {
                  instancePath: instancePath + '/checks/' + i0 + '/name',
                  schemaPath: '#/components/schemas/Check/properties/name/type',
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
            if (data2.passed !== undefined) {
              if (typeof data2.passed !== 'boolean') {
                const err2 = {
                  instancePath: instancePath + '/checks/' + i0 + '/passed',
                  schemaPath:
                    '#/components/schemas/Check/properties/passed/type',
                  keyword: 'type',
                  params: { type: 'boolean' },
                  message: 'must be boolean',
                };
                if (vErrors === null) {
                  vErrors = [err2];
                } else {
                  vErrors.push(err2);
                }
                errors++;
              }
            }
            if (data2.message !== undefined) {
              if (typeof data2.message !== 'string') {
                const err3 = {
                  instancePath: instancePath + '/checks/' + i0 + '/message',
                  schemaPath:
                    '#/components/schemas/Check/properties/message/type',
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
          } else {
            const err4 = {
              instancePath: instancePath + '/checks/' + i0,
              schemaPath: '#/components/schemas/Check/type',
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
      } else {
        const err5 = {
          instancePath: instancePath + '/checks',
          schemaPath: '#/properties/checks/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
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
  validate622.errors = vErrors;
  return errors === 0;
}
validate622.evaluated = {
  props: { passed: true, checks: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1559(
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
  const evaluated0 = validate1559.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.browserEvidence === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'browserEvidence' },
        message: "must have required property '" + 'browserEvidence' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.candidateId === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'candidateId' },
        message: "must have required property '" + 'candidateId' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.developmentId === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'developmentId' },
        message: "must have required property '" + 'developmentId' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.environment === undefined) {
      const err3 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'environment' },
        message: "must have required property '" + 'environment' + "'",
      };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.fixtureDigest === undefined) {
      const err4 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'fixtureDigest' },
        message: "must have required property '" + 'fixtureDigest' + "'",
      };
      if (vErrors === null) {
        vErrors = [err4];
      } else {
        vErrors.push(err4);
      }
      errors++;
    }
    if (data.developmentId !== undefined) {
      let data0 = data.developmentId;
      if (typeof data0 === 'string') {
        if (!formats0.test(data0)) {
          const err5 = {
            instancePath: instancePath + '/developmentId',
            schemaPath: '#/properties/developmentId/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
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
          instancePath: instancePath + '/developmentId',
          schemaPath: '#/properties/developmentId/type',
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
    if (data.candidateId !== undefined) {
      let data1 = data.candidateId;
      if (typeof data1 === 'string') {
        if (!formats0.test(data1)) {
          const err7 = {
            instancePath: instancePath + '/candidateId',
            schemaPath: '#/properties/candidateId/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
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
          instancePath: instancePath + '/candidateId',
          schemaPath: '#/properties/candidateId/type',
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
    if (data.fixtureDigest !== undefined) {
      let data2 = data.fixtureDigest;
      if (typeof data2 === 'string') {
        if (func1(data2) < 1) {
          const err9 = {
            instancePath: instancePath + '/fixtureDigest',
            schemaPath: '#/properties/fixtureDigest/minLength',
            keyword: 'minLength',
            params: { limit: 1 },
            message: 'must NOT have fewer than 1 characters',
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
      } else {
        const err10 = {
          instancePath: instancePath + '/fixtureDigest',
          schemaPath: '#/properties/fixtureDigest/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.environment !== undefined) {
      let data3 = data.environment;
      if (typeof data3 === 'string') {
        if (func1(data3) < 1) {
          const err11 = {
            instancePath: instancePath + '/environment',
            schemaPath: '#/properties/environment/minLength',
            keyword: 'minLength',
            params: { limit: 1 },
            message: 'must NOT have fewer than 1 characters',
          };
          if (vErrors === null) {
            vErrors = [err11];
          } else {
            vErrors.push(err11);
          }
          errors++;
        }
      } else {
        const err12 = {
          instancePath: instancePath + '/environment',
          schemaPath: '#/properties/environment/type',
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
    if (data.browserEvidence !== undefined) {
      if (
        !validate622(data.browserEvidence, {
          instancePath: instancePath + '/browserEvidence',
          parentData: data,
          parentDataProperty: 'browserEvidence',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors =
          vErrors === null
            ? validate622.errors
            : vErrors.concat(validate622.errors);
        errors = vErrors.length;
      }
    }
  } else {
    const err13 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err13];
    } else {
      vErrors.push(err13);
    }
    errors++;
  }
  validate1559.errors = vErrors;
  return errors === 0;
}
validate1559.evaluated = {
  props: {
    developmentId: true,
    candidateId: true,
    fixtureDigest: true,
    environment: true,
    browserEvidence: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
