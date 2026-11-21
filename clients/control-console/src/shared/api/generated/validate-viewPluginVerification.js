// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const viewPluginVerificationInput = validate1351;
const schema1503 = {
  type: 'object',
  properties: {
    path: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', format: 'uuid' },
        id: { type: 'string', format: 'uuid' },
      },
      required: ['tenantId', 'id'],
    },
    query: {
      type: 'object',
      properties: { fields: { type: 'string', maxLength: 4096, minLength: 1 } },
      required: [],
    },
  },
  required: ['path'],
  $id: 'https://edition.invalid/validators/viewPluginVerificationInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
function validate1351(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/viewPluginVerificationInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1351.evaluated;
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
        if (data0.id === undefined) {
          const err2 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'id' },
            message: "must have required property '" + 'id' + "'",
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
        if (data0.tenantId !== undefined) {
          let data1 = data0.tenantId;
          if (typeof data1 === 'string') {
            if (!formats0.test(data1)) {
              const err3 = {
                instancePath: instancePath + '/path/tenantId',
                schemaPath: '#/properties/path/properties/tenantId/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
              };
              if (vErrors === null) {
                vErrors = [err3];
              } else {
                vErrors.push(err3);
              }
              errors++;
            }
          } else {
            const err4 = {
              instancePath: instancePath + '/path/tenantId',
              schemaPath: '#/properties/path/properties/tenantId/type',
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
        if (data0.id !== undefined) {
          let data2 = data0.id;
          if (typeof data2 === 'string') {
            if (!formats0.test(data2)) {
              const err5 = {
                instancePath: instancePath + '/path/id',
                schemaPath: '#/properties/path/properties/id/format',
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
              instancePath: instancePath + '/path/id',
              schemaPath: '#/properties/path/properties/id/type',
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
          instancePath: instancePath + '/path',
          schemaPath: '#/properties/path/type',
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
    }
    if (data.query !== undefined) {
      let data3 = data.query;
      if (data3 && typeof data3 == 'object' && !Array.isArray(data3)) {
        if (data3.fields !== undefined) {
          let data4 = data3.fields;
          if (typeof data4 === 'string') {
            if (func1(data4) > 4096) {
              const err8 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/maxLength',
                keyword: 'maxLength',
                params: { limit: 4096 },
                message: 'must NOT have more than 4096 characters',
              };
              if (vErrors === null) {
                vErrors = [err8];
              } else {
                vErrors.push(err8);
              }
              errors++;
            }
            if (func1(data4) < 1) {
              const err9 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/minLength',
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
              instancePath: instancePath + '/query/fields',
              schemaPath: '#/properties/query/properties/fields/type',
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
      } else {
        const err11 = {
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
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
    }
  } else {
    const err12 = {
      instancePath,
      schemaPath: '#/type',
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
  validate1351.errors = vErrors;
  return errors === 0;
}
validate1351.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const viewPluginVerificationOutput = validate1352;
const schema1504 = {
  anyOf: [
    {
      $ref: 'https://edition.invalid/control#/components/schemas/Verification',
    },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialVerification',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/viewPluginVerificationOutput',
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
function validate1353(
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
  const evaluated0 = validate1353.evaluated;
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
  validate1353.errors = vErrors;
  return errors === 0;
}
validate1353.evaluated = {
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
const schema1506 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    developmentId: { type: 'string', format: 'uuid' },
    candidateId: { type: 'string', format: 'uuid' },
    sourceDigest: { type: 'string' },
    bundleDigest: { type: 'string' },
    fixtureDigest: { type: 'string' },
    environment: { type: 'string' },
    browserEvidence: { $ref: '#/components/schemas/PartialEvidence' },
    serverValidation: { $ref: '#/components/schemas/PartialEvidence' },
    productionEligible: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
  },
};
const schema1507 = {
  type: 'object',
  properties: {
    passed: { type: 'boolean' },
    checks: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialCheck' },
    },
  },
};
const schema1508 = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    passed: { type: 'boolean' },
    message: { type: 'string' },
  },
};
function validate1358(
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
  const evaluated0 = validate1358.evaluated;
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
                  schemaPath:
                    '#/components/schemas/PartialCheck/properties/name/type',
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
                    '#/components/schemas/PartialCheck/properties/passed/type',
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
                    '#/components/schemas/PartialCheck/properties/message/type',
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
              schemaPath: '#/components/schemas/PartialCheck/type',
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
  validate1358.errors = vErrors;
  return errors === 0;
}
validate1358.evaluated = {
  props: { passed: true, checks: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1357(
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
  const evaluated0 = validate1357.evaluated;
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
        !validate1358(data.browserEvidence, {
          instancePath: instancePath + '/browserEvidence',
          parentData: data,
          parentDataProperty: 'browserEvidence',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors =
          vErrors === null
            ? validate1358.errors
            : vErrors.concat(validate1358.errors);
        errors = vErrors.length;
      }
    }
    if (data.serverValidation !== undefined) {
      if (
        !validate1358(data.serverValidation, {
          instancePath: instancePath + '/serverValidation',
          parentData: data,
          parentDataProperty: 'serverValidation',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors =
          vErrors === null
            ? validate1358.errors
            : vErrors.concat(validate1358.errors);
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
  validate1357.errors = vErrors;
  return errors === 0;
}
validate1357.evaluated = {
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
function validate1352(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/viewPluginVerificationOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1352.evaluated;
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
    !validate1353(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1353.errors
        : vErrors.concat(validate1353.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = {};
    props0.id = true;
    props0.developmentId = true;
    props0.candidateId = true;
    props0.sourceDigest = true;
    props0.bundleDigest = true;
    props0.fixtureDigest = true;
    props0.environment = true;
    props0.browserEvidence = true;
    props0.serverValidation = true;
    props0.productionEligible = true;
    props0.createdAt = true;
  }
  const _errs2 = errors;
  if (
    !validate1357(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1357.errors
        : vErrors.concat(validate1357.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = props0 || {};
      props0.id = true;
      props0.developmentId = true;
      props0.candidateId = true;
      props0.sourceDigest = true;
      props0.bundleDigest = true;
      props0.fixtureDigest = true;
      props0.environment = true;
      props0.browserEvidence = true;
      props0.serverValidation = true;
      props0.productionEligible = true;
      props0.createdAt = true;
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
  validate1352.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate1352.evaluated = { dynamicProps: true, dynamicItems: false };
export const viewPluginVerificationOutputFull = validate1362;
const schema1509 = {
  $ref: 'https://edition.invalid/control#/components/schemas/Verification',
  $id: 'https://edition.invalid/validators/viewPluginVerificationOutputFull',
};
function validate1363(
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
  const evaluated0 = validate1363.evaluated;
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
  validate1363.errors = vErrors;
  return errors === 0;
}
validate1363.evaluated = {
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
function validate1362(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/viewPluginVerificationOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1362.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate1363(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1363.errors
        : vErrors.concat(validate1363.errors);
    errors = vErrors.length;
  }
  validate1362.errors = vErrors;
  return errors === 0;
}
validate1362.evaluated = {
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
