// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const listPluginVerificationsInput = validate611;
const schema732 = {
  type: 'object',
  properties: {
    path: {
      type: 'object',
      properties: { tenantId: { type: 'string', format: 'uuid' } },
      required: ['tenantId'],
    },
    query: {
      type: 'object',
      properties: {
        developmentId: { type: 'string', format: 'uuid' },
        fields: { type: 'string', maxLength: 4096, minLength: 1 },
      },
      required: [],
    },
  },
  required: ['path'],
  $id: 'https://edition.invalid/validators/listPluginVerificationsInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
function validate611(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listPluginVerificationsInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate611.evaluated;
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
    if (data.path !== undefined) {
      let data0 = data.path;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.tenantId === undefined) {
          const err1 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'tenantId' },
            message: "must have required property '" + 'tenantId' + "'",
          };
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
        if (data0.tenantId !== undefined) {
          let data1 = data0.tenantId;
          if (typeof data1 === 'string') {
            if (!formats0.test(data1)) {
              const err2 = {
                instancePath: instancePath + '/path/tenantId',
                schemaPath: '#/properties/path/properties/tenantId/format',
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
              instancePath: instancePath + '/path/tenantId',
              schemaPath: '#/properties/path/properties/tenantId/type',
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
          instancePath: instancePath + '/path',
          schemaPath: '#/properties/path/type',
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
    if (data.query !== undefined) {
      let data2 = data.query;
      if (data2 && typeof data2 == 'object' && !Array.isArray(data2)) {
        if (data2.developmentId !== undefined) {
          let data3 = data2.developmentId;
          if (typeof data3 === 'string') {
            if (!formats0.test(data3)) {
              const err5 = {
                instancePath: instancePath + '/query/developmentId',
                schemaPath:
                  '#/properties/query/properties/developmentId/format',
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
              instancePath: instancePath + '/query/developmentId',
              schemaPath: '#/properties/query/properties/developmentId/type',
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
        if (data2.fields !== undefined) {
          let data4 = data2.fields;
          if (typeof data4 === 'string') {
            if (func1(data4) > 4096) {
              const err7 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/maxLength',
                keyword: 'maxLength',
                params: { limit: 4096 },
                message: 'must NOT have more than 4096 characters',
              };
              if (vErrors === null) {
                vErrors = [err7];
              } else {
                vErrors.push(err7);
              }
              errors++;
            }
            if (func1(data4) < 1) {
              const err8 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/minLength',
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
              instancePath: instancePath + '/query/fields',
              schemaPath: '#/properties/query/properties/fields/type',
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
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
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
  } else {
    const err11 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err11];
    } else {
      vErrors.push(err11);
    }
    errors++;
  }
  validate611.errors = vErrors;
  return errors === 0;
}
validate611.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const listPluginVerificationsOutput = validate612;
const schema733 = {
  anyOf: [
    {
      $ref: 'https://edition.invalid/control#/components/schemas/VerificationList',
    },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialVerificationList',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/listPluginVerificationsOutput',
};
const schema734 = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { $ref: '#/components/schemas/VerificationSummary' },
    },
  },
};
const schema735 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    developmentId: { type: 'string', format: 'uuid' },
    candidateId: { type: 'string', format: 'uuid' },
    sourceDigest: { type: 'string' },
    bundleDigest: { type: 'string' },
    fixtureDigest: { type: 'string' },
    environment: { type: 'string' },
    browserPassed: { type: 'boolean' },
    serverPassed: { type: 'boolean' },
    productionEligible: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
  },
};
const formats10 = fullFormats['date-time'];
function validate613(
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
  const evaluated0 = validate613.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.items !== undefined) {
      let data0 = data.items;
      if (Array.isArray(data0)) {
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data1 = data0[i0];
          if (data1 && typeof data1 == 'object' && !Array.isArray(data1)) {
            if (data1.id !== undefined) {
              let data2 = data1.id;
              if (typeof data2 === 'string') {
                if (!formats0.test(data2)) {
                  const err0 = {
                    instancePath: instancePath + '/items/' + i0 + '/id',
                    schemaPath:
                      '#/components/schemas/VerificationSummary/properties/id/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/id',
                  schemaPath:
                    '#/components/schemas/VerificationSummary/properties/id/type',
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
            if (data1.developmentId !== undefined) {
              let data3 = data1.developmentId;
              if (typeof data3 === 'string') {
                if (!formats0.test(data3)) {
                  const err2 = {
                    instancePath:
                      instancePath + '/items/' + i0 + '/developmentId',
                    schemaPath:
                      '#/components/schemas/VerificationSummary/properties/developmentId/format',
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
                  instancePath:
                    instancePath + '/items/' + i0 + '/developmentId',
                  schemaPath:
                    '#/components/schemas/VerificationSummary/properties/developmentId/type',
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
            if (data1.candidateId !== undefined) {
              let data4 = data1.candidateId;
              if (typeof data4 === 'string') {
                if (!formats0.test(data4)) {
                  const err4 = {
                    instancePath:
                      instancePath + '/items/' + i0 + '/candidateId',
                    schemaPath:
                      '#/components/schemas/VerificationSummary/properties/candidateId/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/candidateId',
                  schemaPath:
                    '#/components/schemas/VerificationSummary/properties/candidateId/type',
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
            if (data1.sourceDigest !== undefined) {
              if (typeof data1.sourceDigest !== 'string') {
                const err6 = {
                  instancePath: instancePath + '/items/' + i0 + '/sourceDigest',
                  schemaPath:
                    '#/components/schemas/VerificationSummary/properties/sourceDigest/type',
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
            if (data1.bundleDigest !== undefined) {
              if (typeof data1.bundleDigest !== 'string') {
                const err7 = {
                  instancePath: instancePath + '/items/' + i0 + '/bundleDigest',
                  schemaPath:
                    '#/components/schemas/VerificationSummary/properties/bundleDigest/type',
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
            if (data1.fixtureDigest !== undefined) {
              if (typeof data1.fixtureDigest !== 'string') {
                const err8 = {
                  instancePath:
                    instancePath + '/items/' + i0 + '/fixtureDigest',
                  schemaPath:
                    '#/components/schemas/VerificationSummary/properties/fixtureDigest/type',
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
            if (data1.environment !== undefined) {
              if (typeof data1.environment !== 'string') {
                const err9 = {
                  instancePath: instancePath + '/items/' + i0 + '/environment',
                  schemaPath:
                    '#/components/schemas/VerificationSummary/properties/environment/type',
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
            if (data1.browserPassed !== undefined) {
              if (typeof data1.browserPassed !== 'boolean') {
                const err10 = {
                  instancePath:
                    instancePath + '/items/' + i0 + '/browserPassed',
                  schemaPath:
                    '#/components/schemas/VerificationSummary/properties/browserPassed/type',
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
            if (data1.serverPassed !== undefined) {
              if (typeof data1.serverPassed !== 'boolean') {
                const err11 = {
                  instancePath: instancePath + '/items/' + i0 + '/serverPassed',
                  schemaPath:
                    '#/components/schemas/VerificationSummary/properties/serverPassed/type',
                  keyword: 'type',
                  params: { type: 'boolean' },
                  message: 'must be boolean',
                };
                if (vErrors === null) {
                  vErrors = [err11];
                } else {
                  vErrors.push(err11);
                }
                errors++;
              }
            }
            if (data1.productionEligible !== undefined) {
              if (typeof data1.productionEligible !== 'boolean') {
                const err12 = {
                  instancePath:
                    instancePath + '/items/' + i0 + '/productionEligible',
                  schemaPath:
                    '#/components/schemas/VerificationSummary/properties/productionEligible/type',
                  keyword: 'type',
                  params: { type: 'boolean' },
                  message: 'must be boolean',
                };
                if (vErrors === null) {
                  vErrors = [err12];
                } else {
                  vErrors.push(err12);
                }
                errors++;
              }
            }
            if (data1.createdAt !== undefined) {
              let data12 = data1.createdAt;
              if (typeof data12 === 'string') {
                if (!formats10.validate(data12)) {
                  const err13 = {
                    instancePath: instancePath + '/items/' + i0 + '/createdAt',
                    schemaPath:
                      '#/components/schemas/VerificationSummary/properties/createdAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err13];
                  } else {
                    vErrors.push(err13);
                  }
                  errors++;
                }
              } else {
                const err14 = {
                  instancePath: instancePath + '/items/' + i0 + '/createdAt',
                  schemaPath:
                    '#/components/schemas/VerificationSummary/properties/createdAt/type',
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
          } else {
            const err15 = {
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/VerificationSummary/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
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
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
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
  validate613.errors = vErrors;
  return errors === 0;
}
validate613.evaluated = {
  props: { items: true },
  dynamicProps: false,
  dynamicItems: false,
};
const schema736 = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialVerificationSummary' },
    },
  },
};
const schema737 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    developmentId: { type: 'string', format: 'uuid' },
    candidateId: { type: 'string', format: 'uuid' },
    sourceDigest: { type: 'string' },
    bundleDigest: { type: 'string' },
    fixtureDigest: { type: 'string' },
    environment: { type: 'string' },
    browserPassed: { type: 'boolean' },
    serverPassed: { type: 'boolean' },
    productionEligible: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
  },
};
function validate615(
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
  const evaluated0 = validate615.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.items !== undefined) {
      let data0 = data.items;
      if (Array.isArray(data0)) {
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data1 = data0[i0];
          if (data1 && typeof data1 == 'object' && !Array.isArray(data1)) {
            if (data1.id !== undefined) {
              let data2 = data1.id;
              if (typeof data2 === 'string') {
                if (!formats0.test(data2)) {
                  const err0 = {
                    instancePath: instancePath + '/items/' + i0 + '/id',
                    schemaPath:
                      '#/components/schemas/PartialVerificationSummary/properties/id/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/id',
                  schemaPath:
                    '#/components/schemas/PartialVerificationSummary/properties/id/type',
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
            if (data1.developmentId !== undefined) {
              let data3 = data1.developmentId;
              if (typeof data3 === 'string') {
                if (!formats0.test(data3)) {
                  const err2 = {
                    instancePath:
                      instancePath + '/items/' + i0 + '/developmentId',
                    schemaPath:
                      '#/components/schemas/PartialVerificationSummary/properties/developmentId/format',
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
                  instancePath:
                    instancePath + '/items/' + i0 + '/developmentId',
                  schemaPath:
                    '#/components/schemas/PartialVerificationSummary/properties/developmentId/type',
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
            if (data1.candidateId !== undefined) {
              let data4 = data1.candidateId;
              if (typeof data4 === 'string') {
                if (!formats0.test(data4)) {
                  const err4 = {
                    instancePath:
                      instancePath + '/items/' + i0 + '/candidateId',
                    schemaPath:
                      '#/components/schemas/PartialVerificationSummary/properties/candidateId/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/candidateId',
                  schemaPath:
                    '#/components/schemas/PartialVerificationSummary/properties/candidateId/type',
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
            if (data1.sourceDigest !== undefined) {
              if (typeof data1.sourceDigest !== 'string') {
                const err6 = {
                  instancePath: instancePath + '/items/' + i0 + '/sourceDigest',
                  schemaPath:
                    '#/components/schemas/PartialVerificationSummary/properties/sourceDigest/type',
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
            if (data1.bundleDigest !== undefined) {
              if (typeof data1.bundleDigest !== 'string') {
                const err7 = {
                  instancePath: instancePath + '/items/' + i0 + '/bundleDigest',
                  schemaPath:
                    '#/components/schemas/PartialVerificationSummary/properties/bundleDigest/type',
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
            if (data1.fixtureDigest !== undefined) {
              if (typeof data1.fixtureDigest !== 'string') {
                const err8 = {
                  instancePath:
                    instancePath + '/items/' + i0 + '/fixtureDigest',
                  schemaPath:
                    '#/components/schemas/PartialVerificationSummary/properties/fixtureDigest/type',
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
            if (data1.environment !== undefined) {
              if (typeof data1.environment !== 'string') {
                const err9 = {
                  instancePath: instancePath + '/items/' + i0 + '/environment',
                  schemaPath:
                    '#/components/schemas/PartialVerificationSummary/properties/environment/type',
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
            if (data1.browserPassed !== undefined) {
              if (typeof data1.browserPassed !== 'boolean') {
                const err10 = {
                  instancePath:
                    instancePath + '/items/' + i0 + '/browserPassed',
                  schemaPath:
                    '#/components/schemas/PartialVerificationSummary/properties/browserPassed/type',
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
            if (data1.serverPassed !== undefined) {
              if (typeof data1.serverPassed !== 'boolean') {
                const err11 = {
                  instancePath: instancePath + '/items/' + i0 + '/serverPassed',
                  schemaPath:
                    '#/components/schemas/PartialVerificationSummary/properties/serverPassed/type',
                  keyword: 'type',
                  params: { type: 'boolean' },
                  message: 'must be boolean',
                };
                if (vErrors === null) {
                  vErrors = [err11];
                } else {
                  vErrors.push(err11);
                }
                errors++;
              }
            }
            if (data1.productionEligible !== undefined) {
              if (typeof data1.productionEligible !== 'boolean') {
                const err12 = {
                  instancePath:
                    instancePath + '/items/' + i0 + '/productionEligible',
                  schemaPath:
                    '#/components/schemas/PartialVerificationSummary/properties/productionEligible/type',
                  keyword: 'type',
                  params: { type: 'boolean' },
                  message: 'must be boolean',
                };
                if (vErrors === null) {
                  vErrors = [err12];
                } else {
                  vErrors.push(err12);
                }
                errors++;
              }
            }
            if (data1.createdAt !== undefined) {
              let data12 = data1.createdAt;
              if (typeof data12 === 'string') {
                if (!formats10.validate(data12)) {
                  const err13 = {
                    instancePath: instancePath + '/items/' + i0 + '/createdAt',
                    schemaPath:
                      '#/components/schemas/PartialVerificationSummary/properties/createdAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err13];
                  } else {
                    vErrors.push(err13);
                  }
                  errors++;
                }
              } else {
                const err14 = {
                  instancePath: instancePath + '/items/' + i0 + '/createdAt',
                  schemaPath:
                    '#/components/schemas/PartialVerificationSummary/properties/createdAt/type',
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
          } else {
            const err15 = {
              instancePath: instancePath + '/items/' + i0,
              schemaPath:
                '#/components/schemas/PartialVerificationSummary/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
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
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
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
  validate615.errors = vErrors;
  return errors === 0;
}
validate615.evaluated = {
  props: { items: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate612(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listPluginVerificationsOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate612.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  const _errs0 = errors;
  let valid0 = false;
  const _errs1 = errors;
  if (
    !validate613(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate613.errors
        : vErrors.concat(validate613.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = {};
    props0.items = true;
  }
  const _errs2 = errors;
  if (
    !validate615(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate615.errors
        : vErrors.concat(validate615.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = props0 || {};
      props0.items = true;
    }
  }
  if (!valid0) {
    const err0 = {
      instancePath,
      schemaPath: '#/anyOf',
      keyword: 'anyOf',
      params: {},
      message: 'must match a schema in anyOf',
    };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate612.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate612.evaluated = { dynamicProps: true, dynamicItems: false };
export const listPluginVerificationsOutputFull = validate617;
const schema738 = {
  $ref: 'https://edition.invalid/control#/components/schemas/VerificationList',
  $id: 'https://edition.invalid/validators/listPluginVerificationsOutputFull',
};
function validate618(
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
  const evaluated0 = validate618.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.items !== undefined) {
      let data0 = data.items;
      if (Array.isArray(data0)) {
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data1 = data0[i0];
          if (data1 && typeof data1 == 'object' && !Array.isArray(data1)) {
            if (data1.id !== undefined) {
              let data2 = data1.id;
              if (typeof data2 === 'string') {
                if (!formats0.test(data2)) {
                  const err0 = {
                    instancePath: instancePath + '/items/' + i0 + '/id',
                    schemaPath:
                      '#/components/schemas/VerificationSummary/properties/id/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/id',
                  schemaPath:
                    '#/components/schemas/VerificationSummary/properties/id/type',
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
            if (data1.developmentId !== undefined) {
              let data3 = data1.developmentId;
              if (typeof data3 === 'string') {
                if (!formats0.test(data3)) {
                  const err2 = {
                    instancePath:
                      instancePath + '/items/' + i0 + '/developmentId',
                    schemaPath:
                      '#/components/schemas/VerificationSummary/properties/developmentId/format',
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
                  instancePath:
                    instancePath + '/items/' + i0 + '/developmentId',
                  schemaPath:
                    '#/components/schemas/VerificationSummary/properties/developmentId/type',
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
            if (data1.candidateId !== undefined) {
              let data4 = data1.candidateId;
              if (typeof data4 === 'string') {
                if (!formats0.test(data4)) {
                  const err4 = {
                    instancePath:
                      instancePath + '/items/' + i0 + '/candidateId',
                    schemaPath:
                      '#/components/schemas/VerificationSummary/properties/candidateId/format',
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
                  instancePath: instancePath + '/items/' + i0 + '/candidateId',
                  schemaPath:
                    '#/components/schemas/VerificationSummary/properties/candidateId/type',
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
            if (data1.sourceDigest !== undefined) {
              if (typeof data1.sourceDigest !== 'string') {
                const err6 = {
                  instancePath: instancePath + '/items/' + i0 + '/sourceDigest',
                  schemaPath:
                    '#/components/schemas/VerificationSummary/properties/sourceDigest/type',
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
            if (data1.bundleDigest !== undefined) {
              if (typeof data1.bundleDigest !== 'string') {
                const err7 = {
                  instancePath: instancePath + '/items/' + i0 + '/bundleDigest',
                  schemaPath:
                    '#/components/schemas/VerificationSummary/properties/bundleDigest/type',
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
            if (data1.fixtureDigest !== undefined) {
              if (typeof data1.fixtureDigest !== 'string') {
                const err8 = {
                  instancePath:
                    instancePath + '/items/' + i0 + '/fixtureDigest',
                  schemaPath:
                    '#/components/schemas/VerificationSummary/properties/fixtureDigest/type',
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
            if (data1.environment !== undefined) {
              if (typeof data1.environment !== 'string') {
                const err9 = {
                  instancePath: instancePath + '/items/' + i0 + '/environment',
                  schemaPath:
                    '#/components/schemas/VerificationSummary/properties/environment/type',
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
            if (data1.browserPassed !== undefined) {
              if (typeof data1.browserPassed !== 'boolean') {
                const err10 = {
                  instancePath:
                    instancePath + '/items/' + i0 + '/browserPassed',
                  schemaPath:
                    '#/components/schemas/VerificationSummary/properties/browserPassed/type',
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
            if (data1.serverPassed !== undefined) {
              if (typeof data1.serverPassed !== 'boolean') {
                const err11 = {
                  instancePath: instancePath + '/items/' + i0 + '/serverPassed',
                  schemaPath:
                    '#/components/schemas/VerificationSummary/properties/serverPassed/type',
                  keyword: 'type',
                  params: { type: 'boolean' },
                  message: 'must be boolean',
                };
                if (vErrors === null) {
                  vErrors = [err11];
                } else {
                  vErrors.push(err11);
                }
                errors++;
              }
            }
            if (data1.productionEligible !== undefined) {
              if (typeof data1.productionEligible !== 'boolean') {
                const err12 = {
                  instancePath:
                    instancePath + '/items/' + i0 + '/productionEligible',
                  schemaPath:
                    '#/components/schemas/VerificationSummary/properties/productionEligible/type',
                  keyword: 'type',
                  params: { type: 'boolean' },
                  message: 'must be boolean',
                };
                if (vErrors === null) {
                  vErrors = [err12];
                } else {
                  vErrors.push(err12);
                }
                errors++;
              }
            }
            if (data1.createdAt !== undefined) {
              let data12 = data1.createdAt;
              if (typeof data12 === 'string') {
                if (!formats10.validate(data12)) {
                  const err13 = {
                    instancePath: instancePath + '/items/' + i0 + '/createdAt',
                    schemaPath:
                      '#/components/schemas/VerificationSummary/properties/createdAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err13];
                  } else {
                    vErrors.push(err13);
                  }
                  errors++;
                }
              } else {
                const err14 = {
                  instancePath: instancePath + '/items/' + i0 + '/createdAt',
                  schemaPath:
                    '#/components/schemas/VerificationSummary/properties/createdAt/type',
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
          } else {
            const err15 = {
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/VerificationSummary/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
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
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
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
  validate618.errors = vErrors;
  return errors === 0;
}
validate618.evaluated = {
  props: { items: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate617(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listPluginVerificationsOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate617.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate618(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate618.errors
        : vErrors.concat(validate618.errors);
    errors = vErrors.length;
  }
  validate617.errors = vErrors;
  return errors === 0;
}
validate617.evaluated = {
  props: { items: true },
  dynamicProps: false,
  dynamicItems: false,
};
