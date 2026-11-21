// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const viewBundleExportInput = validate1246;
const schema1403 = {
  type: 'object',
  properties: {
    path: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', format: 'uuid' },
        spaceId: { type: 'string', format: 'uuid' },
        jobId: { type: 'string', format: 'uuid' },
      },
      required: ['tenantId', 'spaceId', 'jobId'],
    },
    query: {
      type: 'object',
      properties: { fields: { type: 'string', maxLength: 4096, minLength: 1 } },
      required: [],
    },
  },
  required: ['path'],
  $id: 'https://edition.invalid/validators/viewBundleExportInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
function validate1246(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/viewBundleExportInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1246.evaluated;
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
        if (data0.spaceId === undefined) {
          const err2 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'spaceId' },
            message: "must have required property '" + 'spaceId' + "'",
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
        if (data0.jobId === undefined) {
          const err3 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'jobId' },
            message: "must have required property '" + 'jobId' + "'",
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
        if (data0.spaceId !== undefined) {
          let data2 = data0.spaceId;
          if (typeof data2 === 'string') {
            if (!formats0.test(data2)) {
              const err6 = {
                instancePath: instancePath + '/path/spaceId',
                schemaPath: '#/properties/path/properties/spaceId/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
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
              instancePath: instancePath + '/path/spaceId',
              schemaPath: '#/properties/path/properties/spaceId/type',
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
        if (data0.jobId !== undefined) {
          let data3 = data0.jobId;
          if (typeof data3 === 'string') {
            if (!formats0.test(data3)) {
              const err8 = {
                instancePath: instancePath + '/path/jobId',
                schemaPath: '#/properties/path/properties/jobId/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
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
              instancePath: instancePath + '/path/jobId',
              schemaPath: '#/properties/path/properties/jobId/type',
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
          instancePath: instancePath + '/path',
          schemaPath: '#/properties/path/type',
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
    if (data.query !== undefined) {
      let data4 = data.query;
      if (data4 && typeof data4 == 'object' && !Array.isArray(data4)) {
        if (data4.fields !== undefined) {
          let data5 = data4.fields;
          if (typeof data5 === 'string') {
            if (func1(data5) > 4096) {
              const err11 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/maxLength',
                keyword: 'maxLength',
                params: { limit: 4096 },
                message: 'must NOT have more than 4096 characters',
              };
              if (vErrors === null) {
                vErrors = [err11];
              } else {
                vErrors.push(err11);
              }
              errors++;
            }
            if (func1(data5) < 1) {
              const err12 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/minLength',
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
              instancePath: instancePath + '/query/fields',
              schemaPath: '#/properties/query/properties/fields/type',
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
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
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
    }
  } else {
    const err15 = {
      instancePath,
      schemaPath: '#/type',
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
  validate1246.errors = vErrors;
  return errors === 0;
}
validate1246.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const viewBundleExportOutput = validate1247;
const schema1404 = {
  anyOf: [
    {
      $ref: 'https://edition.invalid/control#/components/schemas/BundleExportJob',
    },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialBundleExportJob',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/viewBundleExportOutput',
};
const schema430 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    releaseId: { type: 'string', format: 'uuid' },
    status: { type: 'string' },
    attempts: { type: 'integer', format: 'int32' },
    error: { type: 'string' },
    traceId: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    expiresAt: { type: 'string', format: 'date-time' },
    bytes: { type: 'integer', format: 'int64' },
  },
};
const schema1399 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    releaseId: { type: 'string', format: 'uuid' },
    status: { type: 'string' },
    attempts: { type: 'integer', format: 'int32' },
    error: { type: 'string' },
    traceId: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    expiresAt: { type: 'string', format: 'date-time' },
    bytes: { type: 'integer', format: 'int64' },
  },
};
const formats10 = fullFormats['date-time'];
function validate1247(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/viewBundleExportOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1247.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  const _errs0 = errors;
  let valid0 = false;
  const _errs1 = errors;
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.id !== undefined) {
      let data0 = data.id;
      if (typeof data0 === 'string') {
        if (!formats0.test(data0)) {
          const err0 = {
            instancePath: instancePath + '/id',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/BundleExportJob/properties/id/format',
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
          schemaPath:
            'https://edition.invalid/control#/components/schemas/BundleExportJob/properties/id/type',
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
    if (data.releaseId !== undefined) {
      let data1 = data.releaseId;
      if (typeof data1 === 'string') {
        if (!formats0.test(data1)) {
          const err2 = {
            instancePath: instancePath + '/releaseId',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/BundleExportJob/properties/releaseId/format',
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
          instancePath: instancePath + '/releaseId',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/BundleExportJob/properties/releaseId/type',
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
    if (data.status !== undefined) {
      if (typeof data.status !== 'string') {
        const err4 = {
          instancePath: instancePath + '/status',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/BundleExportJob/properties/status/type',
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
    if (data.attempts !== undefined) {
      let data3 = data.attempts;
      if (!(typeof data3 == 'number' && !(data3 % 1) && !isNaN(data3))) {
        const err5 = {
          instancePath: instancePath + '/attempts',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/BundleExportJob/properties/attempts/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.error !== undefined) {
      if (typeof data.error !== 'string') {
        const err6 = {
          instancePath: instancePath + '/error',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/BundleExportJob/properties/error/type',
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
    if (data.traceId !== undefined) {
      if (typeof data.traceId !== 'string') {
        const err7 = {
          instancePath: instancePath + '/traceId',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/BundleExportJob/properties/traceId/type',
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
    if (data.createdAt !== undefined) {
      let data6 = data.createdAt;
      if (typeof data6 === 'string') {
        if (!formats10.validate(data6)) {
          const err8 = {
            instancePath: instancePath + '/createdAt',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/BundleExportJob/properties/createdAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
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
          instancePath: instancePath + '/createdAt',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/BundleExportJob/properties/createdAt/type',
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
    if (data.expiresAt !== undefined) {
      let data7 = data.expiresAt;
      if (typeof data7 === 'string') {
        if (!formats10.validate(data7)) {
          const err10 = {
            instancePath: instancePath + '/expiresAt',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/BundleExportJob/properties/expiresAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
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
          instancePath: instancePath + '/expiresAt',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/BundleExportJob/properties/expiresAt/type',
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
    if (data.bytes !== undefined) {
      let data8 = data.bytes;
      if (!(typeof data8 == 'number' && !(data8 % 1) && !isNaN(data8))) {
        const err12 = {
          instancePath: instancePath + '/bytes',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/BundleExportJob/properties/bytes/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
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
      schemaPath:
        'https://edition.invalid/control#/components/schemas/BundleExportJob/type',
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
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = {};
    props0.id = true;
    props0.releaseId = true;
    props0.status = true;
    props0.attempts = true;
    props0.error = true;
    props0.traceId = true;
    props0.createdAt = true;
    props0.expiresAt = true;
    props0.bytes = true;
  }
  const _errs22 = errors;
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.id !== undefined) {
      let data9 = data.id;
      if (typeof data9 === 'string') {
        if (!formats0.test(data9)) {
          const err14 = {
            instancePath: instancePath + '/id',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/PartialBundleExportJob/properties/id/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err14];
          } else {
            vErrors.push(err14);
          }
          errors++;
        }
      } else {
        const err15 = {
          instancePath: instancePath + '/id',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialBundleExportJob/properties/id/type',
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
    if (data.releaseId !== undefined) {
      let data10 = data.releaseId;
      if (typeof data10 === 'string') {
        if (!formats0.test(data10)) {
          const err16 = {
            instancePath: instancePath + '/releaseId',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/PartialBundleExportJob/properties/releaseId/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err16];
          } else {
            vErrors.push(err16);
          }
          errors++;
        }
      } else {
        const err17 = {
          instancePath: instancePath + '/releaseId',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialBundleExportJob/properties/releaseId/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err17];
        } else {
          vErrors.push(err17);
        }
        errors++;
      }
    }
    if (data.status !== undefined) {
      if (typeof data.status !== 'string') {
        const err18 = {
          instancePath: instancePath + '/status',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialBundleExportJob/properties/status/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err18];
        } else {
          vErrors.push(err18);
        }
        errors++;
      }
    }
    if (data.attempts !== undefined) {
      let data12 = data.attempts;
      if (!(typeof data12 == 'number' && !(data12 % 1) && !isNaN(data12))) {
        const err19 = {
          instancePath: instancePath + '/attempts',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialBundleExportJob/properties/attempts/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err19];
        } else {
          vErrors.push(err19);
        }
        errors++;
      }
    }
    if (data.error !== undefined) {
      if (typeof data.error !== 'string') {
        const err20 = {
          instancePath: instancePath + '/error',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialBundleExportJob/properties/error/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.traceId !== undefined) {
      if (typeof data.traceId !== 'string') {
        const err21 = {
          instancePath: instancePath + '/traceId',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialBundleExportJob/properties/traceId/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err21];
        } else {
          vErrors.push(err21);
        }
        errors++;
      }
    }
    if (data.createdAt !== undefined) {
      let data15 = data.createdAt;
      if (typeof data15 === 'string') {
        if (!formats10.validate(data15)) {
          const err22 = {
            instancePath: instancePath + '/createdAt',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/PartialBundleExportJob/properties/createdAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
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
          instancePath: instancePath + '/createdAt',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialBundleExportJob/properties/createdAt/type',
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
    if (data.expiresAt !== undefined) {
      let data16 = data.expiresAt;
      if (typeof data16 === 'string') {
        if (!formats10.validate(data16)) {
          const err24 = {
            instancePath: instancePath + '/expiresAt',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/PartialBundleExportJob/properties/expiresAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
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
          instancePath: instancePath + '/expiresAt',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialBundleExportJob/properties/expiresAt/type',
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
    if (data.bytes !== undefined) {
      let data17 = data.bytes;
      if (!(typeof data17 == 'number' && !(data17 % 1) && !isNaN(data17))) {
        const err26 = {
          instancePath: instancePath + '/bytes',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialBundleExportJob/properties/bytes/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err26];
        } else {
          vErrors.push(err26);
        }
        errors++;
      }
    }
  } else {
    const err27 = {
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/PartialBundleExportJob/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err27];
    } else {
      vErrors.push(err27);
    }
    errors++;
  }
  var _valid0 = _errs22 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = props0 || {};
      props0.id = true;
      props0.releaseId = true;
      props0.status = true;
      props0.attempts = true;
      props0.error = true;
      props0.traceId = true;
      props0.createdAt = true;
      props0.expiresAt = true;
      props0.bytes = true;
    }
  }
  if (!valid0) {
    const err28 = {
      instancePath,
      schemaPath: '#/anyOf',
      keyword: 'anyOf',
      params: {},
      message: 'must match a schema in anyOf',
    };
    if (vErrors === null) {
      vErrors = [err28];
    } else {
      vErrors.push(err28);
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
  validate1247.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate1247.evaluated = { dynamicProps: true, dynamicItems: false };
export const viewBundleExportOutputFull = validate1248;
const schema1407 = {
  $ref: 'https://edition.invalid/control#/components/schemas/BundleExportJob',
  $id: 'https://edition.invalid/validators/viewBundleExportOutputFull',
};
function validate1248(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/viewBundleExportOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1248.evaluated;
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
            schemaPath:
              'https://edition.invalid/control#/components/schemas/BundleExportJob/properties/id/format',
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
          schemaPath:
            'https://edition.invalid/control#/components/schemas/BundleExportJob/properties/id/type',
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
    if (data.releaseId !== undefined) {
      let data1 = data.releaseId;
      if (typeof data1 === 'string') {
        if (!formats0.test(data1)) {
          const err2 = {
            instancePath: instancePath + '/releaseId',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/BundleExportJob/properties/releaseId/format',
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
          instancePath: instancePath + '/releaseId',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/BundleExportJob/properties/releaseId/type',
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
    if (data.status !== undefined) {
      if (typeof data.status !== 'string') {
        const err4 = {
          instancePath: instancePath + '/status',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/BundleExportJob/properties/status/type',
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
    if (data.attempts !== undefined) {
      let data3 = data.attempts;
      if (!(typeof data3 == 'number' && !(data3 % 1) && !isNaN(data3))) {
        const err5 = {
          instancePath: instancePath + '/attempts',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/BundleExportJob/properties/attempts/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.error !== undefined) {
      if (typeof data.error !== 'string') {
        const err6 = {
          instancePath: instancePath + '/error',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/BundleExportJob/properties/error/type',
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
    if (data.traceId !== undefined) {
      if (typeof data.traceId !== 'string') {
        const err7 = {
          instancePath: instancePath + '/traceId',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/BundleExportJob/properties/traceId/type',
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
    if (data.createdAt !== undefined) {
      let data6 = data.createdAt;
      if (typeof data6 === 'string') {
        if (!formats10.validate(data6)) {
          const err8 = {
            instancePath: instancePath + '/createdAt',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/BundleExportJob/properties/createdAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
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
          instancePath: instancePath + '/createdAt',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/BundleExportJob/properties/createdAt/type',
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
    if (data.expiresAt !== undefined) {
      let data7 = data.expiresAt;
      if (typeof data7 === 'string') {
        if (!formats10.validate(data7)) {
          const err10 = {
            instancePath: instancePath + '/expiresAt',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/BundleExportJob/properties/expiresAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
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
          instancePath: instancePath + '/expiresAt',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/BundleExportJob/properties/expiresAt/type',
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
    if (data.bytes !== undefined) {
      let data8 = data.bytes;
      if (!(typeof data8 == 'number' && !(data8 % 1) && !isNaN(data8))) {
        const err12 = {
          instancePath: instancePath + '/bytes',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/BundleExportJob/properties/bytes/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
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
      schemaPath:
        'https://edition.invalid/control#/components/schemas/BundleExportJob/type',
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
  validate1248.errors = vErrors;
  return errors === 0;
}
validate1248.evaluated = {
  props: {
    id: true,
    releaseId: true,
    status: true,
    attempts: true,
    error: true,
    traceId: true,
    createdAt: true,
    expiresAt: true,
    bytes: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
