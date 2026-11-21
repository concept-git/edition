// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const verifyPluginCandidateInput = validate620;
const schema741 = {
  type: 'object',
  properties: {
    path: {
      type: 'object',
      properties: { tenantId: { type: 'string', format: 'uuid' } },
      required: ['tenantId'],
    },
    header: {
      type: 'object',
      properties: {
        'Idempotency-Key': {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
      required: ['Idempotency-Key'],
    },
    body: {
      $ref: 'https://edition.invalid/control#/components/schemas/Verify',
    },
  },
  required: ['path', 'header', 'body'],
  $id: 'https://edition.invalid/validators/verifyPluginCandidateInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
const pattern4 = new RegExp('^[a-zA-Z0-9._:-]+$', 'u');
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
function validate621(
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
  const evaluated0 = validate621.evaluated;
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
  validate621.errors = vErrors;
  return errors === 0;
}
validate621.evaluated = {
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
function validate620(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/verifyPluginCandidateInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate620.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.path === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'path' },
        message: "must have required property '" + 'path' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.header === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'header' },
        message: "must have required property '" + 'header' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.body === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'body' },
        message: "must have required property '" + 'body' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.path !== undefined) {
      let data0 = data.path;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.tenantId === undefined) {
          const err3 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'tenantId' },
            message: "must have required property '" + 'tenantId' + "'",
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
        if (data0.tenantId !== undefined) {
          let data1 = data0.tenantId;
          if (typeof data1 === 'string') {
            if (!formats0.test(data1)) {
              const err4 = {
                instancePath: instancePath + '/path/tenantId',
                schemaPath: '#/properties/path/properties/tenantId/format',
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
              instancePath: instancePath + '/path/tenantId',
              schemaPath: '#/properties/path/properties/tenantId/type',
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
          instancePath: instancePath + '/path',
          schemaPath: '#/properties/path/type',
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
    }
    if (data.header !== undefined) {
      let data2 = data.header;
      if (data2 && typeof data2 == 'object' && !Array.isArray(data2)) {
        if (data2['Idempotency-Key'] === undefined) {
          const err7 = {
            instancePath: instancePath + '/header',
            schemaPath: '#/properties/header/required',
            keyword: 'required',
            params: { missingProperty: 'Idempotency-Key' },
            message: "must have required property '" + 'Idempotency-Key' + "'",
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
        if (data2['Idempotency-Key'] !== undefined) {
          let data3 = data2['Idempotency-Key'];
          if (typeof data3 === 'string') {
            if (func1(data3) > 128) {
              const err8 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/maxLength',
                keyword: 'maxLength',
                params: { limit: 128 },
                message: 'must NOT have more than 128 characters',
              };
              if (vErrors === null) {
                vErrors = [err8];
              } else {
                vErrors.push(err8);
              }
              errors++;
            }
            if (func1(data3) < 1) {
              const err9 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/minLength',
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
            if (!pattern4.test(data3)) {
              const err10 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/pattern',
                keyword: 'pattern',
                params: { pattern: '^[a-zA-Z0-9._:-]+$' },
                message: 'must match pattern "' + '^[a-zA-Z0-9._:-]+$' + '"',
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
              instancePath: instancePath + '/header/Idempotency-Key',
              schemaPath: '#/properties/header/properties/Idempotency-Key/type',
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
      } else {
        const err12 = {
          instancePath: instancePath + '/header',
          schemaPath: '#/properties/header/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
    }
    if (data.body !== undefined) {
      if (
        !validate621(data.body, {
          instancePath: instancePath + '/body',
          parentData: data,
          parentDataProperty: 'body',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors =
          vErrors === null
            ? validate621.errors
            : vErrors.concat(validate621.errors);
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
  validate620.errors = vErrors;
  return errors === 0;
}
validate620.evaluated = {
  props: { path: true, header: true, body: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const verifyPluginCandidateOutput = validate625;
const schema745 = {
  $ref: 'https://edition.invalid/control#/components/schemas/Verification',
  $id: 'https://edition.invalid/validators/verifyPluginCandidateOutput',
};
const schema746 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    developmentId: { type: 'string', format: 'uuid' },
    candidateId: { type: 'string', format: 'uuid' },
    sourceDigest: { type: 'string' },
    bundleDigest: { type: 'string' },
    fixtureDigest: { type: 'string' },
    environment: { type: 'string' },
    browserEvidence: { $ref: '#/components/schemas/Evidence' },
    serverValidation: { $ref: '#/components/schemas/Evidence' },
    productionEligible: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
  },
};
const formats10 = fullFormats['date-time'];
function validate626(
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
  const evaluated0 = validate626.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.id !== undefined) {
      let data0 = data.id;
      if (typeof data0 === 'string') {
        if (!formats0.test(data0)) {
          const err0 = {
            instancePath: instancePath + '/id',
            schemaPath: '#/properties/id/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err0];
          } else {
            vErrors.push(err0);
          }
          errors++;
        }
      } else {
        const err1 = {
          instancePath: instancePath + '/id',
          schemaPath: '#/properties/id/type',
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
    if (data.developmentId !== undefined) {
      let data1 = data.developmentId;
      if (typeof data1 === 'string') {
        if (!formats0.test(data1)) {
          const err2 = {
            instancePath: instancePath + '/developmentId',
            schemaPath: '#/properties/developmentId/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
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
          instancePath: instancePath + '/developmentId',
          schemaPath: '#/properties/developmentId/type',
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
    if (data.candidateId !== undefined) {
      let data2 = data.candidateId;
      if (typeof data2 === 'string') {
        if (!formats0.test(data2)) {
          const err4 = {
            instancePath: instancePath + '/candidateId',
            schemaPath: '#/properties/candidateId/format',
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
          instancePath: instancePath + '/candidateId',
          schemaPath: '#/properties/candidateId/type',
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
    if (data.sourceDigest !== undefined) {
      if (typeof data.sourceDigest !== 'string') {
        const err6 = {
          instancePath: instancePath + '/sourceDigest',
          schemaPath: '#/properties/sourceDigest/type',
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
    if (data.bundleDigest !== undefined) {
      if (typeof data.bundleDigest !== 'string') {
        const err7 = {
          instancePath: instancePath + '/bundleDigest',
          schemaPath: '#/properties/bundleDigest/type',
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
    if (data.fixtureDigest !== undefined) {
      if (typeof data.fixtureDigest !== 'string') {
        const err8 = {
          instancePath: instancePath + '/fixtureDigest',
          schemaPath: '#/properties/fixtureDigest/type',
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
    if (data.environment !== undefined) {
      if (typeof data.environment !== 'string') {
        const err9 = {
          instancePath: instancePath + '/environment',
          schemaPath: '#/properties/environment/type',
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
    if (data.serverValidation !== undefined) {
      if (
        !validate622(data.serverValidation, {
          instancePath: instancePath + '/serverValidation',
          parentData: data,
          parentDataProperty: 'serverValidation',
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
    if (data.productionEligible !== undefined) {
      if (typeof data.productionEligible !== 'boolean') {
        const err10 = {
          instancePath: instancePath + '/productionEligible',
          schemaPath: '#/properties/productionEligible/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.createdAt !== undefined) {
      let data10 = data.createdAt;
      if (typeof data10 === 'string') {
        if (!formats10.validate(data10)) {
          const err11 = {
            instancePath: instancePath + '/createdAt',
            schemaPath: '#/properties/createdAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
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
          instancePath: instancePath + '/createdAt',
          schemaPath: '#/properties/createdAt/type',
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
  validate626.errors = vErrors;
  return errors === 0;
}
validate626.evaluated = {
  props: {
    id: true,
    developmentId: true,
    candidateId: true,
    sourceDigest: true,
    bundleDigest: true,
    fixtureDigest: true,
    environment: true,
    browserEvidence: true,
    serverValidation: true,
    productionEligible: true,
    createdAt: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate625(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/verifyPluginCandidateOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate625.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate626(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate626.errors
        : vErrors.concat(validate626.errors);
    errors = vErrors.length;
  }
  validate625.errors = vErrors;
  return errors === 0;
}
validate625.evaluated = {
  props: {
    id: true,
    developmentId: true,
    candidateId: true,
    sourceDigest: true,
    bundleDigest: true,
    fixtureDigest: true,
    environment: true,
    browserEvidence: true,
    serverValidation: true,
    productionEligible: true,
    createdAt: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
export const verifyPluginCandidateOutputFull = validate630;
const schema747 = {
  $ref: 'https://edition.invalid/control#/components/schemas/Verification',
  $id: 'https://edition.invalid/validators/verifyPluginCandidateOutputFull',
};
function validate631(
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
  const evaluated0 = validate631.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.id !== undefined) {
      let data0 = data.id;
      if (typeof data0 === 'string') {
        if (!formats0.test(data0)) {
          const err0 = {
            instancePath: instancePath + '/id',
            schemaPath: '#/properties/id/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err0];
          } else {
            vErrors.push(err0);
          }
          errors++;
        }
      } else {
        const err1 = {
          instancePath: instancePath + '/id',
          schemaPath: '#/properties/id/type',
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
    if (data.developmentId !== undefined) {
      let data1 = data.developmentId;
      if (typeof data1 === 'string') {
        if (!formats0.test(data1)) {
          const err2 = {
            instancePath: instancePath + '/developmentId',
            schemaPath: '#/properties/developmentId/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
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
          instancePath: instancePath + '/developmentId',
          schemaPath: '#/properties/developmentId/type',
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
    if (data.candidateId !== undefined) {
      let data2 = data.candidateId;
      if (typeof data2 === 'string') {
        if (!formats0.test(data2)) {
          const err4 = {
            instancePath: instancePath + '/candidateId',
            schemaPath: '#/properties/candidateId/format',
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
          instancePath: instancePath + '/candidateId',
          schemaPath: '#/properties/candidateId/type',
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
    if (data.sourceDigest !== undefined) {
      if (typeof data.sourceDigest !== 'string') {
        const err6 = {
          instancePath: instancePath + '/sourceDigest',
          schemaPath: '#/properties/sourceDigest/type',
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
    if (data.bundleDigest !== undefined) {
      if (typeof data.bundleDigest !== 'string') {
        const err7 = {
          instancePath: instancePath + '/bundleDigest',
          schemaPath: '#/properties/bundleDigest/type',
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
    if (data.fixtureDigest !== undefined) {
      if (typeof data.fixtureDigest !== 'string') {
        const err8 = {
          instancePath: instancePath + '/fixtureDigest',
          schemaPath: '#/properties/fixtureDigest/type',
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
    if (data.environment !== undefined) {
      if (typeof data.environment !== 'string') {
        const err9 = {
          instancePath: instancePath + '/environment',
          schemaPath: '#/properties/environment/type',
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
    if (data.serverValidation !== undefined) {
      if (
        !validate622(data.serverValidation, {
          instancePath: instancePath + '/serverValidation',
          parentData: data,
          parentDataProperty: 'serverValidation',
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
    if (data.productionEligible !== undefined) {
      if (typeof data.productionEligible !== 'boolean') {
        const err10 = {
          instancePath: instancePath + '/productionEligible',
          schemaPath: '#/properties/productionEligible/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.createdAt !== undefined) {
      let data10 = data.createdAt;
      if (typeof data10 === 'string') {
        if (!formats10.validate(data10)) {
          const err11 = {
            instancePath: instancePath + '/createdAt',
            schemaPath: '#/properties/createdAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
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
          instancePath: instancePath + '/createdAt',
          schemaPath: '#/properties/createdAt/type',
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
  validate631.errors = vErrors;
  return errors === 0;
}
validate631.evaluated = {
  props: {
    id: true,
    developmentId: true,
    candidateId: true,
    sourceDigest: true,
    bundleDigest: true,
    fixtureDigest: true,
    environment: true,
    browserEvidence: true,
    serverValidation: true,
    productionEligible: true,
    createdAt: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate630(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/verifyPluginCandidateOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate630.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate631(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate631.errors
        : vErrors.concat(validate631.errors);
    errors = vErrors.length;
  }
  validate630.errors = vErrors;
  return errors === 0;
}
validate630.evaluated = {
  props: {
    id: true,
    developmentId: true,
    candidateId: true,
    sourceDigest: true,
    bundleDigest: true,
    fixtureDigest: true,
    environment: true,
    browserEvidence: true,
    serverValidation: true,
    productionEligible: true,
    createdAt: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
