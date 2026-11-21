// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const viewImportJobInput = validate1224;
const schema1382 = {
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
  $id: 'https://edition.invalid/validators/viewImportJobInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
function validate1224(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/viewImportJobInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1224.evaluated;
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
  validate1224.errors = vErrors;
  return errors === 0;
}
validate1224.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const viewImportJobOutput = validate1225;
const schema1383 = {
  anyOf: [
    { $ref: 'https://edition.invalid/control#/components/schemas/ImportJob' },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialImportJob',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/viewImportJobOutput',
};
const schema472 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    status: {
      type: 'string',
      enum: ['queued', 'running', 'retrying', 'held', 'failed', 'completed'],
    },
    phase: {
      type: 'string',
      enum: [
        'queued',
        'inspecting',
        'adapting',
        'storing',
        'loading',
        'validating',
        'comparing',
        'promoting',
        'mirroring',
        'completing',
        'running',
        'retrying',
        'held',
        'failed',
        'completed',
      ],
    },
    progress: { $ref: '#/components/schemas/ImportJobProgress' },
    attempt: { type: 'integer', format: 'int32' },
    nextRunAt: { type: ['string', 'null'], format: 'date-time' },
    traceId: { type: 'string' },
    outcome: {
      type: ['string', 'null'],
      enum: [
        'promoted',
        'skipped',
        'held',
        'flagged',
        'invalid_bundle',
        'dependency_failed',
        'unexpected_error',
        'resource_unavailable',
        'resource_deleted',
        null,
      ],
    },
    releaseId: { type: ['string', 'null'], format: 'uuid' },
    sourceUrl: {
      type: ['string', 'null'],
      description:
        'Public https address the zip was fetched from; null for uploads',
    },
    adapterId: {
      type: ['string', 'null'],
      description:
        'Import format detected by sniffing (bundle-v1, hwcloud-docs, okf-v0.1, file-tree); null until the zip has been inspected or when no adapter matched',
    },
    report: { $ref: '#/components/schemas/ImportJobReport' },
    terminal: { type: 'boolean' },
    successful: { type: 'boolean' },
    nextPollAfterSeconds: {
      type: ['integer', 'null'],
      format: 'int32',
      description: 'Suggested read-only polling interval; null when terminal',
    },
  },
  required: ['nextPollAfterSeconds', 'successful', 'terminal'],
};
const schema473 = {
  type: 'object',
  properties: {
    done: { type: ['integer', 'null'], format: 'int32' },
    total: { type: ['integer', 'null'], format: 'int32' },
  },
};
const formats10 = fullFormats['date-time'];
const schema474 = {
  type: 'object',
  properties: {
    errors: {
      type: 'array',
      items: { $ref: '#/components/schemas/ImportJobIssue' },
    },
    info: {
      type: 'array',
      items: { $ref: '#/components/schemas/ImportJobIssue' },
    },
  },
};
const schema475 = {
  type: 'object',
  properties: {
    code: { type: 'string' },
    path: { type: ['string', 'null'] },
    detail: { type: ['string', 'null'] },
  },
};
function validate377(
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
  const evaluated0 = validate377.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.errors !== undefined) {
      let data0 = data.errors;
      if (Array.isArray(data0)) {
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data1 = data0[i0];
          if (data1 && typeof data1 == 'object' && !Array.isArray(data1)) {
            if (data1.code !== undefined) {
              if (typeof data1.code !== 'string') {
                const err0 = {
                  instancePath: instancePath + '/errors/' + i0 + '/code',
                  schemaPath:
                    '#/components/schemas/ImportJobIssue/properties/code/type',
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
            if (data1.path !== undefined) {
              let data3 = data1.path;
              if (typeof data3 !== 'string' && data3 !== null) {
                const err1 = {
                  instancePath: instancePath + '/errors/' + i0 + '/path',
                  schemaPath:
                    '#/components/schemas/ImportJobIssue/properties/path/type',
                  keyword: 'type',
                  params: { type: schema475.properties.path.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err1];
                } else {
                  vErrors.push(err1);
                }
                errors++;
              }
            }
            if (data1.detail !== undefined) {
              let data4 = data1.detail;
              if (typeof data4 !== 'string' && data4 !== null) {
                const err2 = {
                  instancePath: instancePath + '/errors/' + i0 + '/detail',
                  schemaPath:
                    '#/components/schemas/ImportJobIssue/properties/detail/type',
                  keyword: 'type',
                  params: { type: schema475.properties.detail.type },
                  message: 'must be string,null',
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
              instancePath: instancePath + '/errors/' + i0,
              schemaPath: '#/components/schemas/ImportJobIssue/type',
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
        }
      } else {
        const err4 = {
          instancePath: instancePath + '/errors',
          schemaPath: '#/properties/errors/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.info !== undefined) {
      let data5 = data.info;
      if (Array.isArray(data5)) {
        const len1 = data5.length;
        for (let i1 = 0; i1 < len1; i1++) {
          let data6 = data5[i1];
          if (data6 && typeof data6 == 'object' && !Array.isArray(data6)) {
            if (data6.code !== undefined) {
              if (typeof data6.code !== 'string') {
                const err5 = {
                  instancePath: instancePath + '/info/' + i1 + '/code',
                  schemaPath:
                    '#/components/schemas/ImportJobIssue/properties/code/type',
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
            if (data6.path !== undefined) {
              let data8 = data6.path;
              if (typeof data8 !== 'string' && data8 !== null) {
                const err6 = {
                  instancePath: instancePath + '/info/' + i1 + '/path',
                  schemaPath:
                    '#/components/schemas/ImportJobIssue/properties/path/type',
                  keyword: 'type',
                  params: { type: schema475.properties.path.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err6];
                } else {
                  vErrors.push(err6);
                }
                errors++;
              }
            }
            if (data6.detail !== undefined) {
              let data9 = data6.detail;
              if (typeof data9 !== 'string' && data9 !== null) {
                const err7 = {
                  instancePath: instancePath + '/info/' + i1 + '/detail',
                  schemaPath:
                    '#/components/schemas/ImportJobIssue/properties/detail/type',
                  keyword: 'type',
                  params: { type: schema475.properties.detail.type },
                  message: 'must be string,null',
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
              instancePath: instancePath + '/info/' + i1,
              schemaPath: '#/components/schemas/ImportJobIssue/type',
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
        }
      } else {
        const err9 = {
          instancePath: instancePath + '/info',
          schemaPath: '#/properties/info/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
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
      instancePath,
      schemaPath: '#/type',
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
  validate377.errors = vErrors;
  return errors === 0;
}
validate377.evaluated = {
  props: { errors: true, info: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1226(
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
  const evaluated0 = validate1226.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.nextPollAfterSeconds === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'nextPollAfterSeconds' },
        message: "must have required property '" + 'nextPollAfterSeconds' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.successful === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'successful' },
        message: "must have required property '" + 'successful' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.terminal === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'terminal' },
        message: "must have required property '" + 'terminal' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.id !== undefined) {
      let data0 = data.id;
      if (typeof data0 === 'string') {
        if (!formats0.test(data0)) {
          const err3 = {
            instancePath: instancePath + '/id',
            schemaPath: '#/properties/id/format',
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
          instancePath: instancePath + '/id',
          schemaPath: '#/properties/id/type',
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
    if (data.status !== undefined) {
      let data1 = data.status;
      if (typeof data1 !== 'string') {
        const err5 = {
          instancePath: instancePath + '/status',
          schemaPath: '#/properties/status/type',
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
      if (!(
        data1 === 'queued' ||
        data1 === 'running' ||
        data1 === 'retrying' ||
        data1 === 'held' ||
        data1 === 'failed' ||
        data1 === 'completed'
      )) {
        const err6 = {
          instancePath: instancePath + '/status',
          schemaPath: '#/properties/status/enum',
          keyword: 'enum',
          params: { allowedValues: schema472.properties.status.enum },
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
    if (data.phase !== undefined) {
      let data2 = data.phase;
      if (typeof data2 !== 'string') {
        const err7 = {
          instancePath: instancePath + '/phase',
          schemaPath: '#/properties/phase/type',
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
      if (!(
        data2 === 'queued' ||
        data2 === 'inspecting' ||
        data2 === 'adapting' ||
        data2 === 'storing' ||
        data2 === 'loading' ||
        data2 === 'validating' ||
        data2 === 'comparing' ||
        data2 === 'promoting' ||
        data2 === 'mirroring' ||
        data2 === 'completing' ||
        data2 === 'running' ||
        data2 === 'retrying' ||
        data2 === 'held' ||
        data2 === 'failed' ||
        data2 === 'completed'
      )) {
        const err8 = {
          instancePath: instancePath + '/phase',
          schemaPath: '#/properties/phase/enum',
          keyword: 'enum',
          params: { allowedValues: schema472.properties.phase.enum },
          message: 'must be equal to one of the allowed values',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.progress !== undefined) {
      let data3 = data.progress;
      if (data3 && typeof data3 == 'object' && !Array.isArray(data3)) {
        if (data3.done !== undefined) {
          let data4 = data3.done;
          if (
            !(typeof data4 == 'number' && !(data4 % 1) && !isNaN(data4)) &&
            data4 !== null
          ) {
            const err9 = {
              instancePath: instancePath + '/progress/done',
              schemaPath:
                '#/components/schemas/ImportJobProgress/properties/done/type',
              keyword: 'type',
              params: { type: schema473.properties.done.type },
              message: 'must be integer,null',
            };
            if (vErrors === null) {
              vErrors = [err9];
            } else {
              vErrors.push(err9);
            }
            errors++;
          }
        }
        if (data3.total !== undefined) {
          let data5 = data3.total;
          if (
            !(typeof data5 == 'number' && !(data5 % 1) && !isNaN(data5)) &&
            data5 !== null
          ) {
            const err10 = {
              instancePath: instancePath + '/progress/total',
              schemaPath:
                '#/components/schemas/ImportJobProgress/properties/total/type',
              keyword: 'type',
              params: { type: schema473.properties.total.type },
              message: 'must be integer,null',
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
          instancePath: instancePath + '/progress',
          schemaPath: '#/components/schemas/ImportJobProgress/type',
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
    if (data.attempt !== undefined) {
      let data6 = data.attempt;
      if (!(typeof data6 == 'number' && !(data6 % 1) && !isNaN(data6))) {
        const err12 = {
          instancePath: instancePath + '/attempt',
          schemaPath: '#/properties/attempt/type',
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
    if (data.nextRunAt !== undefined) {
      let data7 = data.nextRunAt;
      if (typeof data7 !== 'string' && data7 !== null) {
        const err13 = {
          instancePath: instancePath + '/nextRunAt',
          schemaPath: '#/properties/nextRunAt/type',
          keyword: 'type',
          params: { type: schema472.properties.nextRunAt.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
      if (typeof data7 === 'string') {
        if (!formats10.validate(data7)) {
          const err14 = {
            instancePath: instancePath + '/nextRunAt',
            schemaPath: '#/properties/nextRunAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err14];
          } else {
            vErrors.push(err14);
          }
          errors++;
        }
      }
    }
    if (data.traceId !== undefined) {
      if (typeof data.traceId !== 'string') {
        const err15 = {
          instancePath: instancePath + '/traceId',
          schemaPath: '#/properties/traceId/type',
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
    if (data.outcome !== undefined) {
      let data9 = data.outcome;
      if (typeof data9 !== 'string' && data9 !== null) {
        const err16 = {
          instancePath: instancePath + '/outcome',
          schemaPath: '#/properties/outcome/type',
          keyword: 'type',
          params: { type: schema472.properties.outcome.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err16];
        } else {
          vErrors.push(err16);
        }
        errors++;
      }
      if (!(
        data9 === 'promoted' ||
        data9 === 'skipped' ||
        data9 === 'held' ||
        data9 === 'flagged' ||
        data9 === 'invalid_bundle' ||
        data9 === 'dependency_failed' ||
        data9 === 'unexpected_error' ||
        data9 === 'resource_unavailable' ||
        data9 === 'resource_deleted' ||
        data9 === null
      )) {
        const err17 = {
          instancePath: instancePath + '/outcome',
          schemaPath: '#/properties/outcome/enum',
          keyword: 'enum',
          params: { allowedValues: schema472.properties.outcome.enum },
          message: 'must be equal to one of the allowed values',
        };
        if (vErrors === null) {
          vErrors = [err17];
        } else {
          vErrors.push(err17);
        }
        errors++;
      }
    }
    if (data.releaseId !== undefined) {
      let data10 = data.releaseId;
      if (typeof data10 !== 'string' && data10 !== null) {
        const err18 = {
          instancePath: instancePath + '/releaseId',
          schemaPath: '#/properties/releaseId/type',
          keyword: 'type',
          params: { type: schema472.properties.releaseId.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err18];
        } else {
          vErrors.push(err18);
        }
        errors++;
      }
      if (typeof data10 === 'string') {
        if (!formats0.test(data10)) {
          const err19 = {
            instancePath: instancePath + '/releaseId',
            schemaPath: '#/properties/releaseId/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err19];
          } else {
            vErrors.push(err19);
          }
          errors++;
        }
      }
    }
    if (data.sourceUrl !== undefined) {
      let data11 = data.sourceUrl;
      if (typeof data11 !== 'string' && data11 !== null) {
        const err20 = {
          instancePath: instancePath + '/sourceUrl',
          schemaPath: '#/properties/sourceUrl/type',
          keyword: 'type',
          params: { type: schema472.properties.sourceUrl.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.adapterId !== undefined) {
      let data12 = data.adapterId;
      if (typeof data12 !== 'string' && data12 !== null) {
        const err21 = {
          instancePath: instancePath + '/adapterId',
          schemaPath: '#/properties/adapterId/type',
          keyword: 'type',
          params: { type: schema472.properties.adapterId.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err21];
        } else {
          vErrors.push(err21);
        }
        errors++;
      }
    }
    if (data.report !== undefined) {
      if (
        !validate377(data.report, {
          instancePath: instancePath + '/report',
          parentData: data,
          parentDataProperty: 'report',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors =
          vErrors === null
            ? validate377.errors
            : vErrors.concat(validate377.errors);
        errors = vErrors.length;
      }
    }
    if (data.terminal !== undefined) {
      if (typeof data.terminal !== 'boolean') {
        const err22 = {
          instancePath: instancePath + '/terminal',
          schemaPath: '#/properties/terminal/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.successful !== undefined) {
      if (typeof data.successful !== 'boolean') {
        const err23 = {
          instancePath: instancePath + '/successful',
          schemaPath: '#/properties/successful/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
    }
    if (data.nextPollAfterSeconds !== undefined) {
      let data16 = data.nextPollAfterSeconds;
      if (
        !(typeof data16 == 'number' && !(data16 % 1) && !isNaN(data16)) &&
        data16 !== null
      ) {
        const err24 = {
          instancePath: instancePath + '/nextPollAfterSeconds',
          schemaPath: '#/properties/nextPollAfterSeconds/type',
          keyword: 'type',
          params: { type: schema472.properties.nextPollAfterSeconds.type },
          message: 'must be integer,null',
        };
        if (vErrors === null) {
          vErrors = [err24];
        } else {
          vErrors.push(err24);
        }
        errors++;
      }
    }
  } else {
    const err25 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err25];
    } else {
      vErrors.push(err25);
    }
    errors++;
  }
  validate1226.errors = vErrors;
  return errors === 0;
}
validate1226.evaluated = {
  props: {
    id: true,
    status: true,
    phase: true,
    progress: true,
    attempt: true,
    nextRunAt: true,
    traceId: true,
    outcome: true,
    releaseId: true,
    sourceUrl: true,
    adapterId: true,
    report: true,
    terminal: true,
    successful: true,
    nextPollAfterSeconds: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
const schema1386 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    status: {
      type: 'string',
      enum: ['queued', 'running', 'retrying', 'held', 'failed', 'completed'],
    },
    phase: {
      type: 'string',
      enum: [
        'queued',
        'inspecting',
        'adapting',
        'storing',
        'loading',
        'validating',
        'comparing',
        'promoting',
        'mirroring',
        'completing',
        'running',
        'retrying',
        'held',
        'failed',
        'completed',
      ],
    },
    progress: { $ref: '#/components/schemas/PartialImportJobProgress' },
    attempt: { type: 'integer', format: 'int32' },
    nextRunAt: { type: ['string', 'null'], format: 'date-time' },
    traceId: { type: 'string' },
    outcome: {
      type: ['string', 'null'],
      enum: [
        'promoted',
        'skipped',
        'held',
        'flagged',
        'invalid_bundle',
        'dependency_failed',
        'unexpected_error',
        'resource_unavailable',
        'resource_deleted',
        null,
      ],
    },
    releaseId: { type: ['string', 'null'], format: 'uuid' },
    sourceUrl: {
      type: ['string', 'null'],
      description:
        'Public https address the zip was fetched from; null for uploads',
    },
    adapterId: {
      type: ['string', 'null'],
      description:
        'Import format detected by sniffing (bundle-v1, hwcloud-docs, okf-v0.1, file-tree); null until the zip has been inspected or when no adapter matched',
    },
    report: { $ref: '#/components/schemas/PartialImportJobReport' },
    terminal: { type: 'boolean' },
    successful: { type: 'boolean' },
    nextPollAfterSeconds: {
      type: ['integer', 'null'],
      format: 'int32',
      description: 'Suggested read-only polling interval; null when terminal',
    },
  },
};
const schema1387 = {
  type: 'object',
  properties: {
    done: { type: ['integer', 'null'], format: 'int32' },
    total: { type: ['integer', 'null'], format: 'int32' },
  },
};
const schema1388 = {
  type: 'object',
  properties: {
    errors: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialImportJobIssue' },
    },
    info: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialImportJobIssue' },
    },
  },
};
const schema1389 = {
  type: 'object',
  properties: {
    code: { type: 'string' },
    path: { type: ['string', 'null'] },
    detail: { type: ['string', 'null'] },
  },
};
function validate1230(
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
  const evaluated0 = validate1230.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.errors !== undefined) {
      let data0 = data.errors;
      if (Array.isArray(data0)) {
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data1 = data0[i0];
          if (data1 && typeof data1 == 'object' && !Array.isArray(data1)) {
            if (data1.code !== undefined) {
              if (typeof data1.code !== 'string') {
                const err0 = {
                  instancePath: instancePath + '/errors/' + i0 + '/code',
                  schemaPath:
                    '#/components/schemas/PartialImportJobIssue/properties/code/type',
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
            if (data1.path !== undefined) {
              let data3 = data1.path;
              if (typeof data3 !== 'string' && data3 !== null) {
                const err1 = {
                  instancePath: instancePath + '/errors/' + i0 + '/path',
                  schemaPath:
                    '#/components/schemas/PartialImportJobIssue/properties/path/type',
                  keyword: 'type',
                  params: { type: schema1389.properties.path.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err1];
                } else {
                  vErrors.push(err1);
                }
                errors++;
              }
            }
            if (data1.detail !== undefined) {
              let data4 = data1.detail;
              if (typeof data4 !== 'string' && data4 !== null) {
                const err2 = {
                  instancePath: instancePath + '/errors/' + i0 + '/detail',
                  schemaPath:
                    '#/components/schemas/PartialImportJobIssue/properties/detail/type',
                  keyword: 'type',
                  params: { type: schema1389.properties.detail.type },
                  message: 'must be string,null',
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
              instancePath: instancePath + '/errors/' + i0,
              schemaPath: '#/components/schemas/PartialImportJobIssue/type',
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
        }
      } else {
        const err4 = {
          instancePath: instancePath + '/errors',
          schemaPath: '#/properties/errors/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.info !== undefined) {
      let data5 = data.info;
      if (Array.isArray(data5)) {
        const len1 = data5.length;
        for (let i1 = 0; i1 < len1; i1++) {
          let data6 = data5[i1];
          if (data6 && typeof data6 == 'object' && !Array.isArray(data6)) {
            if (data6.code !== undefined) {
              if (typeof data6.code !== 'string') {
                const err5 = {
                  instancePath: instancePath + '/info/' + i1 + '/code',
                  schemaPath:
                    '#/components/schemas/PartialImportJobIssue/properties/code/type',
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
            if (data6.path !== undefined) {
              let data8 = data6.path;
              if (typeof data8 !== 'string' && data8 !== null) {
                const err6 = {
                  instancePath: instancePath + '/info/' + i1 + '/path',
                  schemaPath:
                    '#/components/schemas/PartialImportJobIssue/properties/path/type',
                  keyword: 'type',
                  params: { type: schema1389.properties.path.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err6];
                } else {
                  vErrors.push(err6);
                }
                errors++;
              }
            }
            if (data6.detail !== undefined) {
              let data9 = data6.detail;
              if (typeof data9 !== 'string' && data9 !== null) {
                const err7 = {
                  instancePath: instancePath + '/info/' + i1 + '/detail',
                  schemaPath:
                    '#/components/schemas/PartialImportJobIssue/properties/detail/type',
                  keyword: 'type',
                  params: { type: schema1389.properties.detail.type },
                  message: 'must be string,null',
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
              instancePath: instancePath + '/info/' + i1,
              schemaPath: '#/components/schemas/PartialImportJobIssue/type',
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
        }
      } else {
        const err9 = {
          instancePath: instancePath + '/info',
          schemaPath: '#/properties/info/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
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
      instancePath,
      schemaPath: '#/type',
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
  validate1230.errors = vErrors;
  return errors === 0;
}
validate1230.evaluated = {
  props: { errors: true, info: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1229(
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
  const evaluated0 = validate1229.evaluated;
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
    if (data.status !== undefined) {
      let data1 = data.status;
      if (typeof data1 !== 'string') {
        const err2 = {
          instancePath: instancePath + '/status',
          schemaPath: '#/properties/status/type',
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
      if (!(
        data1 === 'queued' ||
        data1 === 'running' ||
        data1 === 'retrying' ||
        data1 === 'held' ||
        data1 === 'failed' ||
        data1 === 'completed'
      )) {
        const err3 = {
          instancePath: instancePath + '/status',
          schemaPath: '#/properties/status/enum',
          keyword: 'enum',
          params: { allowedValues: schema1386.properties.status.enum },
          message: 'must be equal to one of the allowed values',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.phase !== undefined) {
      let data2 = data.phase;
      if (typeof data2 !== 'string') {
        const err4 = {
          instancePath: instancePath + '/phase',
          schemaPath: '#/properties/phase/type',
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
      if (!(
        data2 === 'queued' ||
        data2 === 'inspecting' ||
        data2 === 'adapting' ||
        data2 === 'storing' ||
        data2 === 'loading' ||
        data2 === 'validating' ||
        data2 === 'comparing' ||
        data2 === 'promoting' ||
        data2 === 'mirroring' ||
        data2 === 'completing' ||
        data2 === 'running' ||
        data2 === 'retrying' ||
        data2 === 'held' ||
        data2 === 'failed' ||
        data2 === 'completed'
      )) {
        const err5 = {
          instancePath: instancePath + '/phase',
          schemaPath: '#/properties/phase/enum',
          keyword: 'enum',
          params: { allowedValues: schema1386.properties.phase.enum },
          message: 'must be equal to one of the allowed values',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.progress !== undefined) {
      let data3 = data.progress;
      if (data3 && typeof data3 == 'object' && !Array.isArray(data3)) {
        if (data3.done !== undefined) {
          let data4 = data3.done;
          if (
            !(typeof data4 == 'number' && !(data4 % 1) && !isNaN(data4)) &&
            data4 !== null
          ) {
            const err6 = {
              instancePath: instancePath + '/progress/done',
              schemaPath:
                '#/components/schemas/PartialImportJobProgress/properties/done/type',
              keyword: 'type',
              params: { type: schema1387.properties.done.type },
              message: 'must be integer,null',
            };
            if (vErrors === null) {
              vErrors = [err6];
            } else {
              vErrors.push(err6);
            }
            errors++;
          }
        }
        if (data3.total !== undefined) {
          let data5 = data3.total;
          if (
            !(typeof data5 == 'number' && !(data5 % 1) && !isNaN(data5)) &&
            data5 !== null
          ) {
            const err7 = {
              instancePath: instancePath + '/progress/total',
              schemaPath:
                '#/components/schemas/PartialImportJobProgress/properties/total/type',
              keyword: 'type',
              params: { type: schema1387.properties.total.type },
              message: 'must be integer,null',
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
          instancePath: instancePath + '/progress',
          schemaPath: '#/components/schemas/PartialImportJobProgress/type',
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
    }
    if (data.attempt !== undefined) {
      let data6 = data.attempt;
      if (!(typeof data6 == 'number' && !(data6 % 1) && !isNaN(data6))) {
        const err9 = {
          instancePath: instancePath + '/attempt',
          schemaPath: '#/properties/attempt/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.nextRunAt !== undefined) {
      let data7 = data.nextRunAt;
      if (typeof data7 !== 'string' && data7 !== null) {
        const err10 = {
          instancePath: instancePath + '/nextRunAt',
          schemaPath: '#/properties/nextRunAt/type',
          keyword: 'type',
          params: { type: schema1386.properties.nextRunAt.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
      if (typeof data7 === 'string') {
        if (!formats10.validate(data7)) {
          const err11 = {
            instancePath: instancePath + '/nextRunAt',
            schemaPath: '#/properties/nextRunAt/format',
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
      }
    }
    if (data.traceId !== undefined) {
      if (typeof data.traceId !== 'string') {
        const err12 = {
          instancePath: instancePath + '/traceId',
          schemaPath: '#/properties/traceId/type',
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
    if (data.outcome !== undefined) {
      let data9 = data.outcome;
      if (typeof data9 !== 'string' && data9 !== null) {
        const err13 = {
          instancePath: instancePath + '/outcome',
          schemaPath: '#/properties/outcome/type',
          keyword: 'type',
          params: { type: schema1386.properties.outcome.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
      if (!(
        data9 === 'promoted' ||
        data9 === 'skipped' ||
        data9 === 'held' ||
        data9 === 'flagged' ||
        data9 === 'invalid_bundle' ||
        data9 === 'dependency_failed' ||
        data9 === 'unexpected_error' ||
        data9 === 'resource_unavailable' ||
        data9 === 'resource_deleted' ||
        data9 === null
      )) {
        const err14 = {
          instancePath: instancePath + '/outcome',
          schemaPath: '#/properties/outcome/enum',
          keyword: 'enum',
          params: { allowedValues: schema1386.properties.outcome.enum },
          message: 'must be equal to one of the allowed values',
        };
        if (vErrors === null) {
          vErrors = [err14];
        } else {
          vErrors.push(err14);
        }
        errors++;
      }
    }
    if (data.releaseId !== undefined) {
      let data10 = data.releaseId;
      if (typeof data10 !== 'string' && data10 !== null) {
        const err15 = {
          instancePath: instancePath + '/releaseId',
          schemaPath: '#/properties/releaseId/type',
          keyword: 'type',
          params: { type: schema1386.properties.releaseId.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err15];
        } else {
          vErrors.push(err15);
        }
        errors++;
      }
      if (typeof data10 === 'string') {
        if (!formats0.test(data10)) {
          const err16 = {
            instancePath: instancePath + '/releaseId',
            schemaPath: '#/properties/releaseId/format',
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
      }
    }
    if (data.sourceUrl !== undefined) {
      let data11 = data.sourceUrl;
      if (typeof data11 !== 'string' && data11 !== null) {
        const err17 = {
          instancePath: instancePath + '/sourceUrl',
          schemaPath: '#/properties/sourceUrl/type',
          keyword: 'type',
          params: { type: schema1386.properties.sourceUrl.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err17];
        } else {
          vErrors.push(err17);
        }
        errors++;
      }
    }
    if (data.adapterId !== undefined) {
      let data12 = data.adapterId;
      if (typeof data12 !== 'string' && data12 !== null) {
        const err18 = {
          instancePath: instancePath + '/adapterId',
          schemaPath: '#/properties/adapterId/type',
          keyword: 'type',
          params: { type: schema1386.properties.adapterId.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err18];
        } else {
          vErrors.push(err18);
        }
        errors++;
      }
    }
    if (data.report !== undefined) {
      if (
        !validate1230(data.report, {
          instancePath: instancePath + '/report',
          parentData: data,
          parentDataProperty: 'report',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors =
          vErrors === null
            ? validate1230.errors
            : vErrors.concat(validate1230.errors);
        errors = vErrors.length;
      }
    }
    if (data.terminal !== undefined) {
      if (typeof data.terminal !== 'boolean') {
        const err19 = {
          instancePath: instancePath + '/terminal',
          schemaPath: '#/properties/terminal/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err19];
        } else {
          vErrors.push(err19);
        }
        errors++;
      }
    }
    if (data.successful !== undefined) {
      if (typeof data.successful !== 'boolean') {
        const err20 = {
          instancePath: instancePath + '/successful',
          schemaPath: '#/properties/successful/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.nextPollAfterSeconds !== undefined) {
      let data16 = data.nextPollAfterSeconds;
      if (
        !(typeof data16 == 'number' && !(data16 % 1) && !isNaN(data16)) &&
        data16 !== null
      ) {
        const err21 = {
          instancePath: instancePath + '/nextPollAfterSeconds',
          schemaPath: '#/properties/nextPollAfterSeconds/type',
          keyword: 'type',
          params: { type: schema1386.properties.nextPollAfterSeconds.type },
          message: 'must be integer,null',
        };
        if (vErrors === null) {
          vErrors = [err21];
        } else {
          vErrors.push(err21);
        }
        errors++;
      }
    }
  } else {
    const err22 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err22];
    } else {
      vErrors.push(err22);
    }
    errors++;
  }
  validate1229.errors = vErrors;
  return errors === 0;
}
validate1229.evaluated = {
  props: {
    id: true,
    status: true,
    phase: true,
    progress: true,
    attempt: true,
    nextRunAt: true,
    traceId: true,
    outcome: true,
    releaseId: true,
    sourceUrl: true,
    adapterId: true,
    report: true,
    terminal: true,
    successful: true,
    nextPollAfterSeconds: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1225(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/viewImportJobOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1225.evaluated;
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
    !validate1226(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1226.errors
        : vErrors.concat(validate1226.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = {};
    props0.id = true;
    props0.status = true;
    props0.phase = true;
    props0.progress = true;
    props0.attempt = true;
    props0.nextRunAt = true;
    props0.traceId = true;
    props0.outcome = true;
    props0.releaseId = true;
    props0.sourceUrl = true;
    props0.adapterId = true;
    props0.report = true;
    props0.terminal = true;
    props0.successful = true;
    props0.nextPollAfterSeconds = true;
  }
  const _errs2 = errors;
  if (
    !validate1229(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1229.errors
        : vErrors.concat(validate1229.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = props0 || {};
      props0.id = true;
      props0.status = true;
      props0.phase = true;
      props0.progress = true;
      props0.attempt = true;
      props0.nextRunAt = true;
      props0.traceId = true;
      props0.outcome = true;
      props0.releaseId = true;
      props0.sourceUrl = true;
      props0.adapterId = true;
      props0.report = true;
      props0.terminal = true;
      props0.successful = true;
      props0.nextPollAfterSeconds = true;
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
  validate1225.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate1225.evaluated = { dynamicProps: true, dynamicItems: false };
export const viewImportJobOutputFull = validate1233;
const schema1391 = {
  $ref: 'https://edition.invalid/control#/components/schemas/ImportJob',
  $id: 'https://edition.invalid/validators/viewImportJobOutputFull',
};
function validate1234(
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
  const evaluated0 = validate1234.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.nextPollAfterSeconds === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'nextPollAfterSeconds' },
        message: "must have required property '" + 'nextPollAfterSeconds' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.successful === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'successful' },
        message: "must have required property '" + 'successful' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.terminal === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'terminal' },
        message: "must have required property '" + 'terminal' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.id !== undefined) {
      let data0 = data.id;
      if (typeof data0 === 'string') {
        if (!formats0.test(data0)) {
          const err3 = {
            instancePath: instancePath + '/id',
            schemaPath: '#/properties/id/format',
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
          instancePath: instancePath + '/id',
          schemaPath: '#/properties/id/type',
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
    if (data.status !== undefined) {
      let data1 = data.status;
      if (typeof data1 !== 'string') {
        const err5 = {
          instancePath: instancePath + '/status',
          schemaPath: '#/properties/status/type',
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
      if (!(
        data1 === 'queued' ||
        data1 === 'running' ||
        data1 === 'retrying' ||
        data1 === 'held' ||
        data1 === 'failed' ||
        data1 === 'completed'
      )) {
        const err6 = {
          instancePath: instancePath + '/status',
          schemaPath: '#/properties/status/enum',
          keyword: 'enum',
          params: { allowedValues: schema472.properties.status.enum },
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
    if (data.phase !== undefined) {
      let data2 = data.phase;
      if (typeof data2 !== 'string') {
        const err7 = {
          instancePath: instancePath + '/phase',
          schemaPath: '#/properties/phase/type',
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
      if (!(
        data2 === 'queued' ||
        data2 === 'inspecting' ||
        data2 === 'adapting' ||
        data2 === 'storing' ||
        data2 === 'loading' ||
        data2 === 'validating' ||
        data2 === 'comparing' ||
        data2 === 'promoting' ||
        data2 === 'mirroring' ||
        data2 === 'completing' ||
        data2 === 'running' ||
        data2 === 'retrying' ||
        data2 === 'held' ||
        data2 === 'failed' ||
        data2 === 'completed'
      )) {
        const err8 = {
          instancePath: instancePath + '/phase',
          schemaPath: '#/properties/phase/enum',
          keyword: 'enum',
          params: { allowedValues: schema472.properties.phase.enum },
          message: 'must be equal to one of the allowed values',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.progress !== undefined) {
      let data3 = data.progress;
      if (data3 && typeof data3 == 'object' && !Array.isArray(data3)) {
        if (data3.done !== undefined) {
          let data4 = data3.done;
          if (
            !(typeof data4 == 'number' && !(data4 % 1) && !isNaN(data4)) &&
            data4 !== null
          ) {
            const err9 = {
              instancePath: instancePath + '/progress/done',
              schemaPath:
                '#/components/schemas/ImportJobProgress/properties/done/type',
              keyword: 'type',
              params: { type: schema473.properties.done.type },
              message: 'must be integer,null',
            };
            if (vErrors === null) {
              vErrors = [err9];
            } else {
              vErrors.push(err9);
            }
            errors++;
          }
        }
        if (data3.total !== undefined) {
          let data5 = data3.total;
          if (
            !(typeof data5 == 'number' && !(data5 % 1) && !isNaN(data5)) &&
            data5 !== null
          ) {
            const err10 = {
              instancePath: instancePath + '/progress/total',
              schemaPath:
                '#/components/schemas/ImportJobProgress/properties/total/type',
              keyword: 'type',
              params: { type: schema473.properties.total.type },
              message: 'must be integer,null',
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
          instancePath: instancePath + '/progress',
          schemaPath: '#/components/schemas/ImportJobProgress/type',
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
    if (data.attempt !== undefined) {
      let data6 = data.attempt;
      if (!(typeof data6 == 'number' && !(data6 % 1) && !isNaN(data6))) {
        const err12 = {
          instancePath: instancePath + '/attempt',
          schemaPath: '#/properties/attempt/type',
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
    if (data.nextRunAt !== undefined) {
      let data7 = data.nextRunAt;
      if (typeof data7 !== 'string' && data7 !== null) {
        const err13 = {
          instancePath: instancePath + '/nextRunAt',
          schemaPath: '#/properties/nextRunAt/type',
          keyword: 'type',
          params: { type: schema472.properties.nextRunAt.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
      if (typeof data7 === 'string') {
        if (!formats10.validate(data7)) {
          const err14 = {
            instancePath: instancePath + '/nextRunAt',
            schemaPath: '#/properties/nextRunAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err14];
          } else {
            vErrors.push(err14);
          }
          errors++;
        }
      }
    }
    if (data.traceId !== undefined) {
      if (typeof data.traceId !== 'string') {
        const err15 = {
          instancePath: instancePath + '/traceId',
          schemaPath: '#/properties/traceId/type',
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
    if (data.outcome !== undefined) {
      let data9 = data.outcome;
      if (typeof data9 !== 'string' && data9 !== null) {
        const err16 = {
          instancePath: instancePath + '/outcome',
          schemaPath: '#/properties/outcome/type',
          keyword: 'type',
          params: { type: schema472.properties.outcome.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err16];
        } else {
          vErrors.push(err16);
        }
        errors++;
      }
      if (!(
        data9 === 'promoted' ||
        data9 === 'skipped' ||
        data9 === 'held' ||
        data9 === 'flagged' ||
        data9 === 'invalid_bundle' ||
        data9 === 'dependency_failed' ||
        data9 === 'unexpected_error' ||
        data9 === 'resource_unavailable' ||
        data9 === 'resource_deleted' ||
        data9 === null
      )) {
        const err17 = {
          instancePath: instancePath + '/outcome',
          schemaPath: '#/properties/outcome/enum',
          keyword: 'enum',
          params: { allowedValues: schema472.properties.outcome.enum },
          message: 'must be equal to one of the allowed values',
        };
        if (vErrors === null) {
          vErrors = [err17];
        } else {
          vErrors.push(err17);
        }
        errors++;
      }
    }
    if (data.releaseId !== undefined) {
      let data10 = data.releaseId;
      if (typeof data10 !== 'string' && data10 !== null) {
        const err18 = {
          instancePath: instancePath + '/releaseId',
          schemaPath: '#/properties/releaseId/type',
          keyword: 'type',
          params: { type: schema472.properties.releaseId.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err18];
        } else {
          vErrors.push(err18);
        }
        errors++;
      }
      if (typeof data10 === 'string') {
        if (!formats0.test(data10)) {
          const err19 = {
            instancePath: instancePath + '/releaseId',
            schemaPath: '#/properties/releaseId/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err19];
          } else {
            vErrors.push(err19);
          }
          errors++;
        }
      }
    }
    if (data.sourceUrl !== undefined) {
      let data11 = data.sourceUrl;
      if (typeof data11 !== 'string' && data11 !== null) {
        const err20 = {
          instancePath: instancePath + '/sourceUrl',
          schemaPath: '#/properties/sourceUrl/type',
          keyword: 'type',
          params: { type: schema472.properties.sourceUrl.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.adapterId !== undefined) {
      let data12 = data.adapterId;
      if (typeof data12 !== 'string' && data12 !== null) {
        const err21 = {
          instancePath: instancePath + '/adapterId',
          schemaPath: '#/properties/adapterId/type',
          keyword: 'type',
          params: { type: schema472.properties.adapterId.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err21];
        } else {
          vErrors.push(err21);
        }
        errors++;
      }
    }
    if (data.report !== undefined) {
      if (
        !validate377(data.report, {
          instancePath: instancePath + '/report',
          parentData: data,
          parentDataProperty: 'report',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors =
          vErrors === null
            ? validate377.errors
            : vErrors.concat(validate377.errors);
        errors = vErrors.length;
      }
    }
    if (data.terminal !== undefined) {
      if (typeof data.terminal !== 'boolean') {
        const err22 = {
          instancePath: instancePath + '/terminal',
          schemaPath: '#/properties/terminal/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.successful !== undefined) {
      if (typeof data.successful !== 'boolean') {
        const err23 = {
          instancePath: instancePath + '/successful',
          schemaPath: '#/properties/successful/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
    }
    if (data.nextPollAfterSeconds !== undefined) {
      let data16 = data.nextPollAfterSeconds;
      if (
        !(typeof data16 == 'number' && !(data16 % 1) && !isNaN(data16)) &&
        data16 !== null
      ) {
        const err24 = {
          instancePath: instancePath + '/nextPollAfterSeconds',
          schemaPath: '#/properties/nextPollAfterSeconds/type',
          keyword: 'type',
          params: { type: schema472.properties.nextPollAfterSeconds.type },
          message: 'must be integer,null',
        };
        if (vErrors === null) {
          vErrors = [err24];
        } else {
          vErrors.push(err24);
        }
        errors++;
      }
    }
  } else {
    const err25 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err25];
    } else {
      vErrors.push(err25);
    }
    errors++;
  }
  validate1234.errors = vErrors;
  return errors === 0;
}
validate1234.evaluated = {
  props: {
    id: true,
    status: true,
    phase: true,
    progress: true,
    attempt: true,
    nextRunAt: true,
    traceId: true,
    outcome: true,
    releaseId: true,
    sourceUrl: true,
    adapterId: true,
    report: true,
    terminal: true,
    successful: true,
    nextPollAfterSeconds: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1233(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/viewImportJobOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1233.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate1234(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1234.errors
        : vErrors.concat(validate1234.errors);
    errors = vErrors.length;
  }
  validate1233.errors = vErrors;
  return errors === 0;
}
validate1233.evaluated = {
  props: {
    id: true,
    status: true,
    phase: true,
    progress: true,
    attempt: true,
    nextRunAt: true,
    traceId: true,
    outcome: true,
    releaseId: true,
    sourceUrl: true,
    adapterId: true,
    report: true,
    terminal: true,
    successful: true,
    nextPollAfterSeconds: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
