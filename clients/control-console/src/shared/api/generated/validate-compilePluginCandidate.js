// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const compilePluginCandidateInput = validate662;
const schema776 = {
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
      $ref: 'https://edition.invalid/control#/components/schemas/Compile',
    },
  },
  required: ['path', 'header', 'body'],
  $id: 'https://edition.invalid/validators/compilePluginCandidateInput',
};
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
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
const pattern4 = new RegExp('^[a-zA-Z0-9._:-]+$', 'u');
function validate662(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/compilePluginCandidateInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate662.evaluated;
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
        if (data0.id === undefined) {
          const err4 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'id' },
            message: "must have required property '" + 'id' + "'",
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
        if (data0.tenantId !== undefined) {
          let data1 = data0.tenantId;
          if (typeof data1 === 'string') {
            if (!formats0.test(data1)) {
              const err5 = {
                instancePath: instancePath + '/path/tenantId',
                schemaPath: '#/properties/path/properties/tenantId/format',
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
              instancePath: instancePath + '/path/tenantId',
              schemaPath: '#/properties/path/properties/tenantId/type',
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
        if (data0.id !== undefined) {
          let data2 = data0.id;
          if (typeof data2 === 'string') {
            if (!formats0.test(data2)) {
              const err7 = {
                instancePath: instancePath + '/path/id',
                schemaPath: '#/properties/path/properties/id/format',
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
              instancePath: instancePath + '/path/id',
              schemaPath: '#/properties/path/properties/id/type',
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
      } else {
        const err9 = {
          instancePath: instancePath + '/path',
          schemaPath: '#/properties/path/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.header !== undefined) {
      let data3 = data.header;
      if (data3 && typeof data3 == 'object' && !Array.isArray(data3)) {
        if (data3['Idempotency-Key'] === undefined) {
          const err10 = {
            instancePath: instancePath + '/header',
            schemaPath: '#/properties/header/required',
            keyword: 'required',
            params: { missingProperty: 'Idempotency-Key' },
            message: "must have required property '" + 'Idempotency-Key' + "'",
          };
          if (vErrors === null) {
            vErrors = [err10];
          } else {
            vErrors.push(err10);
          }
          errors++;
        }
        if (data3['Idempotency-Key'] !== undefined) {
          let data4 = data3['Idempotency-Key'];
          if (typeof data4 === 'string') {
            if (func1(data4) > 128) {
              const err11 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/maxLength',
                keyword: 'maxLength',
                params: { limit: 128 },
                message: 'must NOT have more than 128 characters',
              };
              if (vErrors === null) {
                vErrors = [err11];
              } else {
                vErrors.push(err11);
              }
              errors++;
            }
            if (func1(data4) < 1) {
              const err12 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/minLength',
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
            if (!pattern4.test(data4)) {
              const err13 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/pattern',
                keyword: 'pattern',
                params: { pattern: '^[a-zA-Z0-9._:-]+$' },
                message: 'must match pattern "' + '^[a-zA-Z0-9._:-]+$' + '"',
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
              instancePath: instancePath + '/header/Idempotency-Key',
              schemaPath: '#/properties/header/properties/Idempotency-Key/type',
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
          instancePath: instancePath + '/header',
          schemaPath: '#/properties/header/type',
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
    if (data.body !== undefined) {
      let data5 = data.body;
      if (data5 && typeof data5 == 'object' && !Array.isArray(data5)) {
        if (data5.bundle === undefined) {
          const err16 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/Compile/required',
            keyword: 'required',
            params: { missingProperty: 'bundle' },
            message: "must have required property '" + 'bundle' + "'",
          };
          if (vErrors === null) {
            vErrors = [err16];
          } else {
            vErrors.push(err16);
          }
          errors++;
        }
        if (data5.entryPoint === undefined) {
          const err17 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/Compile/required',
            keyword: 'required',
            params: { missingProperty: 'entryPoint' },
            message: "must have required property '" + 'entryPoint' + "'",
          };
          if (vErrors === null) {
            vErrors = [err17];
          } else {
            vErrors.push(err17);
          }
          errors++;
        }
        if (data5.environment === undefined) {
          const err18 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/Compile/required',
            keyword: 'required',
            params: { missingProperty: 'environment' },
            message: "must have required property '" + 'environment' + "'",
          };
          if (vErrors === null) {
            vErrors = [err18];
          } else {
            vErrors.push(err18);
          }
          errors++;
        }
        if (data5.sourceDigest === undefined) {
          const err19 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/Compile/required',
            keyword: 'required',
            params: { missingProperty: 'sourceDigest' },
            message: "must have required property '" + 'sourceDigest' + "'",
          };
          if (vErrors === null) {
            vErrors = [err19];
          } else {
            vErrors.push(err19);
          }
          errors++;
        }
        if (data5.baseRevision !== undefined) {
          let data6 = data5.baseRevision;
          if (!(typeof data6 == 'number' && !(data6 % 1) && !isNaN(data6))) {
            const err20 = {
              instancePath: instancePath + '/body/baseRevision',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/Compile/properties/baseRevision/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err20];
            } else {
              vErrors.push(err20);
            }
            errors++;
          }
          if (typeof data6 == 'number') {
            if (data6 < 1 || isNaN(data6)) {
              const err21 = {
                instancePath: instancePath + '/body/baseRevision',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/Compile/properties/baseRevision/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err21];
              } else {
                vErrors.push(err21);
              }
              errors++;
            }
          }
        }
        if (data5.sourceDigest !== undefined) {
          let data7 = data5.sourceDigest;
          if (typeof data7 === 'string') {
            if (func1(data7) < 1) {
              const err22 = {
                instancePath: instancePath + '/body/sourceDigest',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/Compile/properties/sourceDigest/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
              };
              if (vErrors === null) {
                vErrors = [err22];
              } else {
                vErrors.push(err22);
              }
              errors++;
            }
          } else {
            const err23 = {
              instancePath: instancePath + '/body/sourceDigest',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/Compile/properties/sourceDigest/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err23];
            } else {
              vErrors.push(err23);
            }
            errors++;
          }
        }
        if (data5.entryPoint !== undefined) {
          let data8 = data5.entryPoint;
          if (typeof data8 === 'string') {
            if (func1(data8) < 1) {
              const err24 = {
                instancePath: instancePath + '/body/entryPoint',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/Compile/properties/entryPoint/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
              };
              if (vErrors === null) {
                vErrors = [err24];
              } else {
                vErrors.push(err24);
              }
              errors++;
            }
          } else {
            const err25 = {
              instancePath: instancePath + '/body/entryPoint',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/Compile/properties/entryPoint/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err25];
            } else {
              vErrors.push(err25);
            }
            errors++;
          }
        }
        if (data5.bundle !== undefined) {
          let data9 = data5.bundle;
          if (typeof data9 === 'string') {
            if (func1(data9) < 1) {
              const err26 = {
                instancePath: instancePath + '/body/bundle',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/Compile/properties/bundle/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
              };
              if (vErrors === null) {
                vErrors = [err26];
              } else {
                vErrors.push(err26);
              }
              errors++;
            }
          } else {
            const err27 = {
              instancePath: instancePath + '/body/bundle',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/Compile/properties/bundle/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err27];
            } else {
              vErrors.push(err27);
            }
            errors++;
          }
        }
        if (data5.environment !== undefined) {
          let data10 = data5.environment;
          if (typeof data10 === 'string') {
            if (func1(data10) < 1) {
              const err28 = {
                instancePath: instancePath + '/body/environment',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/Compile/properties/environment/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
              };
              if (vErrors === null) {
                vErrors = [err28];
              } else {
                vErrors.push(err28);
              }
              errors++;
            }
          } else {
            const err29 = {
              instancePath: instancePath + '/body/environment',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/Compile/properties/environment/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err29];
            } else {
              vErrors.push(err29);
            }
            errors++;
          }
        }
      } else {
        const err30 = {
          instancePath: instancePath + '/body',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Compile/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err30];
        } else {
          vErrors.push(err30);
        }
        errors++;
      }
    }
  } else {
    const err31 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err31];
    } else {
      vErrors.push(err31);
    }
    errors++;
  }
  validate662.errors = vErrors;
  return errors === 0;
}
validate662.evaluated = {
  props: { path: true, header: true, body: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const compilePluginCandidateOutput = validate663;
const schema778 = {
  $ref: 'https://edition.invalid/control#/components/schemas/Candidate',
  $id: 'https://edition.invalid/validators/compilePluginCandidateOutput',
};
const schema779 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    developmentId: { type: 'string', format: 'uuid' },
    sourceRevision: { type: 'integer', format: 'int32' },
    sourceDigest: { type: 'string' },
    bundleDigest: { type: 'string' },
    entryPoint: { type: 'string' },
    bundle: { type: 'string' },
    environment: { type: 'string' },
    source: { $ref: '#/components/schemas/Source' },
    createdAt: { type: 'string', format: 'date-time' },
  },
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
const formats10 = fullFormats['date-time'];
function validate664(
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
  const evaluated0 = validate664.evaluated;
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
    if (data.sourceRevision !== undefined) {
      let data2 = data.sourceRevision;
      if (!(typeof data2 == 'number' && !(data2 % 1) && !isNaN(data2))) {
        const err4 = {
          instancePath: instancePath + '/sourceRevision',
          schemaPath: '#/properties/sourceRevision/type',
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
    }
    if (data.sourceDigest !== undefined) {
      if (typeof data.sourceDigest !== 'string') {
        const err5 = {
          instancePath: instancePath + '/sourceDigest',
          schemaPath: '#/properties/sourceDigest/type',
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
    if (data.bundleDigest !== undefined) {
      if (typeof data.bundleDigest !== 'string') {
        const err6 = {
          instancePath: instancePath + '/bundleDigest',
          schemaPath: '#/properties/bundleDigest/type',
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
    if (data.entryPoint !== undefined) {
      if (typeof data.entryPoint !== 'string') {
        const err7 = {
          instancePath: instancePath + '/entryPoint',
          schemaPath: '#/properties/entryPoint/type',
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
    if (data.bundle !== undefined) {
      if (typeof data.bundle !== 'string') {
        const err8 = {
          instancePath: instancePath + '/bundle',
          schemaPath: '#/properties/bundle/type',
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
    if (data.source !== undefined) {
      let data8 = data.source;
      if (data8 && typeof data8 == 'object' && !Array.isArray(data8)) {
        if (data8.files !== undefined) {
          let data9 = data8.files;
          if (data9 && typeof data9 == 'object' && !Array.isArray(data9)) {
            for (const key0 in data9) {
              if (typeof data9[key0] !== 'string') {
                const err10 = {
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
                  vErrors = [err10];
                } else {
                  vErrors.push(err10);
                }
                errors++;
              }
            }
          } else {
            const err11 = {
              instancePath: instancePath + '/source/files',
              schemaPath: '#/components/schemas/Source/properties/files/type',
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
        if (data8.manifest !== undefined) {
          if (typeof data8.manifest !== 'string') {
            const err12 = {
              instancePath: instancePath + '/source/manifest',
              schemaPath:
                '#/components/schemas/Source/properties/manifest/type',
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
        if (data8.configuration !== undefined) {
          if (typeof data8.configuration !== 'string') {
            const err13 = {
              instancePath: instancePath + '/source/configuration',
              schemaPath:
                '#/components/schemas/Source/properties/configuration/type',
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
        if (data8.fixtures !== undefined) {
          if (typeof data8.fixtures !== 'string') {
            const err14 = {
              instancePath: instancePath + '/source/fixtures',
              schemaPath:
                '#/components/schemas/Source/properties/fixtures/type',
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
        if (data8.dependencyLock !== undefined) {
          if (typeof data8.dependencyLock !== 'string') {
            const err15 = {
              instancePath: instancePath + '/source/dependencyLock',
              schemaPath:
                '#/components/schemas/Source/properties/dependencyLock/type',
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
        if (data8.baselineRef !== undefined) {
          if (typeof data8.baselineRef !== 'string') {
            const err16 = {
              instancePath: instancePath + '/source/baselineRef',
              schemaPath:
                '#/components/schemas/Source/properties/baselineRef/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
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
          instancePath: instancePath + '/source',
          schemaPath: '#/components/schemas/Source/type',
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
    }
    if (data.createdAt !== undefined) {
      let data16 = data.createdAt;
      if (typeof data16 === 'string') {
        if (!formats10.validate(data16)) {
          const err18 = {
            instancePath: instancePath + '/createdAt',
            schemaPath: '#/properties/createdAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err18];
          } else {
            vErrors.push(err18);
          }
          errors++;
        }
      } else {
        const err19 = {
          instancePath: instancePath + '/createdAt',
          schemaPath: '#/properties/createdAt/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err19];
        } else {
          vErrors.push(err19);
        }
        errors++;
      }
    }
  } else {
    const err20 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err20];
    } else {
      vErrors.push(err20);
    }
    errors++;
  }
  validate664.errors = vErrors;
  return errors === 0;
}
validate664.evaluated = {
  props: {
    id: true,
    developmentId: true,
    sourceRevision: true,
    sourceDigest: true,
    bundleDigest: true,
    entryPoint: true,
    bundle: true,
    environment: true,
    source: true,
    createdAt: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate663(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/compilePluginCandidateOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate663.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate664(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate664.errors
        : vErrors.concat(validate664.errors);
    errors = vErrors.length;
  }
  validate663.errors = vErrors;
  return errors === 0;
}
validate663.evaluated = {
  props: {
    id: true,
    developmentId: true,
    sourceRevision: true,
    sourceDigest: true,
    bundleDigest: true,
    entryPoint: true,
    bundle: true,
    environment: true,
    source: true,
    createdAt: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
export const compilePluginCandidateOutputFull = validate666;
const schema781 = {
  $ref: 'https://edition.invalid/control#/components/schemas/Candidate',
  $id: 'https://edition.invalid/validators/compilePluginCandidateOutputFull',
};
function validate667(
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
  const evaluated0 = validate667.evaluated;
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
    if (data.sourceRevision !== undefined) {
      let data2 = data.sourceRevision;
      if (!(typeof data2 == 'number' && !(data2 % 1) && !isNaN(data2))) {
        const err4 = {
          instancePath: instancePath + '/sourceRevision',
          schemaPath: '#/properties/sourceRevision/type',
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
    }
    if (data.sourceDigest !== undefined) {
      if (typeof data.sourceDigest !== 'string') {
        const err5 = {
          instancePath: instancePath + '/sourceDigest',
          schemaPath: '#/properties/sourceDigest/type',
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
    if (data.bundleDigest !== undefined) {
      if (typeof data.bundleDigest !== 'string') {
        const err6 = {
          instancePath: instancePath + '/bundleDigest',
          schemaPath: '#/properties/bundleDigest/type',
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
    if (data.entryPoint !== undefined) {
      if (typeof data.entryPoint !== 'string') {
        const err7 = {
          instancePath: instancePath + '/entryPoint',
          schemaPath: '#/properties/entryPoint/type',
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
    if (data.bundle !== undefined) {
      if (typeof data.bundle !== 'string') {
        const err8 = {
          instancePath: instancePath + '/bundle',
          schemaPath: '#/properties/bundle/type',
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
    if (data.source !== undefined) {
      let data8 = data.source;
      if (data8 && typeof data8 == 'object' && !Array.isArray(data8)) {
        if (data8.files !== undefined) {
          let data9 = data8.files;
          if (data9 && typeof data9 == 'object' && !Array.isArray(data9)) {
            for (const key0 in data9) {
              if (typeof data9[key0] !== 'string') {
                const err10 = {
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
                  vErrors = [err10];
                } else {
                  vErrors.push(err10);
                }
                errors++;
              }
            }
          } else {
            const err11 = {
              instancePath: instancePath + '/source/files',
              schemaPath: '#/components/schemas/Source/properties/files/type',
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
        if (data8.manifest !== undefined) {
          if (typeof data8.manifest !== 'string') {
            const err12 = {
              instancePath: instancePath + '/source/manifest',
              schemaPath:
                '#/components/schemas/Source/properties/manifest/type',
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
        if (data8.configuration !== undefined) {
          if (typeof data8.configuration !== 'string') {
            const err13 = {
              instancePath: instancePath + '/source/configuration',
              schemaPath:
                '#/components/schemas/Source/properties/configuration/type',
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
        if (data8.fixtures !== undefined) {
          if (typeof data8.fixtures !== 'string') {
            const err14 = {
              instancePath: instancePath + '/source/fixtures',
              schemaPath:
                '#/components/schemas/Source/properties/fixtures/type',
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
        if (data8.dependencyLock !== undefined) {
          if (typeof data8.dependencyLock !== 'string') {
            const err15 = {
              instancePath: instancePath + '/source/dependencyLock',
              schemaPath:
                '#/components/schemas/Source/properties/dependencyLock/type',
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
        if (data8.baselineRef !== undefined) {
          if (typeof data8.baselineRef !== 'string') {
            const err16 = {
              instancePath: instancePath + '/source/baselineRef',
              schemaPath:
                '#/components/schemas/Source/properties/baselineRef/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
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
          instancePath: instancePath + '/source',
          schemaPath: '#/components/schemas/Source/type',
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
    }
    if (data.createdAt !== undefined) {
      let data16 = data.createdAt;
      if (typeof data16 === 'string') {
        if (!formats10.validate(data16)) {
          const err18 = {
            instancePath: instancePath + '/createdAt',
            schemaPath: '#/properties/createdAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err18];
          } else {
            vErrors.push(err18);
          }
          errors++;
        }
      } else {
        const err19 = {
          instancePath: instancePath + '/createdAt',
          schemaPath: '#/properties/createdAt/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err19];
        } else {
          vErrors.push(err19);
        }
        errors++;
      }
    }
  } else {
    const err20 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err20];
    } else {
      vErrors.push(err20);
    }
    errors++;
  }
  validate667.errors = vErrors;
  return errors === 0;
}
validate667.evaluated = {
  props: {
    id: true,
    developmentId: true,
    sourceRevision: true,
    sourceDigest: true,
    bundleDigest: true,
    entryPoint: true,
    bundle: true,
    environment: true,
    source: true,
    createdAt: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate666(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/compilePluginCandidateOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate666.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate667(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate667.errors
        : vErrors.concat(validate667.errors);
    errors = vErrors.length;
  }
  validate666.errors = vErrors;
  return errors === 0;
}
validate666.evaluated = {
  props: {
    id: true,
    developmentId: true,
    sourceRevision: true,
    sourceDigest: true,
    bundleDigest: true,
    entryPoint: true,
    bundle: true,
    environment: true,
    source: true,
    createdAt: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
