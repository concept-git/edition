// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const publishPagesInput = validate463;
const schema555 = {
  type: 'object',
  properties: {
    path: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', format: 'uuid' },
        spaceId: { type: 'string', format: 'uuid' },
      },
      required: ['tenantId', 'spaceId'],
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
      $ref: 'https://edition.invalid/control#/components/schemas/PageIdsRequest',
    },
  },
  required: ['path', 'header', 'body'],
  $id: 'https://edition.invalid/validators/publishPagesInput',
};
const schema548 = {
  type: 'object',
  properties: {
    ids: {
      type: 'array',
      items: { type: 'string', format: 'uuid' },
      maxItems: 100,
      minItems: 1,
    },
  },
  required: ['ids'],
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
const pattern4 = new RegExp('^[a-zA-Z0-9._:-]+$', 'u');
function validate463(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/publishPagesInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate463.evaluated;
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
        if (data0.spaceId === undefined) {
          const err4 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'spaceId' },
            message: "must have required property '" + 'spaceId' + "'",
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
        if (data0.spaceId !== undefined) {
          let data2 = data0.spaceId;
          if (typeof data2 === 'string') {
            if (!formats0.test(data2)) {
              const err7 = {
                instancePath: instancePath + '/path/spaceId',
                schemaPath: '#/properties/path/properties/spaceId/format',
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
              instancePath: instancePath + '/path/spaceId',
              schemaPath: '#/properties/path/properties/spaceId/type',
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
        if (data5.ids === undefined) {
          const err16 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/PageIdsRequest/required',
            keyword: 'required',
            params: { missingProperty: 'ids' },
            message: "must have required property '" + 'ids' + "'",
          };
          if (vErrors === null) {
            vErrors = [err16];
          } else {
            vErrors.push(err16);
          }
          errors++;
        }
        if (data5.ids !== undefined) {
          let data6 = data5.ids;
          if (Array.isArray(data6)) {
            if (data6.length > 100) {
              const err17 = {
                instancePath: instancePath + '/body/ids',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/PageIdsRequest/properties/ids/maxItems',
                keyword: 'maxItems',
                params: { limit: 100 },
                message: 'must NOT have more than 100 items',
              };
              if (vErrors === null) {
                vErrors = [err17];
              } else {
                vErrors.push(err17);
              }
              errors++;
            }
            if (data6.length < 1) {
              const err18 = {
                instancePath: instancePath + '/body/ids',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/PageIdsRequest/properties/ids/minItems',
                keyword: 'minItems',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 items',
              };
              if (vErrors === null) {
                vErrors = [err18];
              } else {
                vErrors.push(err18);
              }
              errors++;
            }
            const len0 = data6.length;
            for (let i0 = 0; i0 < len0; i0++) {
              let data7 = data6[i0];
              if (typeof data7 === 'string') {
                if (!formats0.test(data7)) {
                  const err19 = {
                    instancePath: instancePath + '/body/ids/' + i0,
                    schemaPath:
                      'https://edition.invalid/control#/components/schemas/PageIdsRequest/properties/ids/items/format',
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
              } else {
                const err20 = {
                  instancePath: instancePath + '/body/ids/' + i0,
                  schemaPath:
                    'https://edition.invalid/control#/components/schemas/PageIdsRequest/properties/ids/items/type',
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
          } else {
            const err21 = {
              instancePath: instancePath + '/body/ids',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/PageIdsRequest/properties/ids/type',
              keyword: 'type',
              params: { type: 'array' },
              message: 'must be array',
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
          instancePath: instancePath + '/body',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PageIdsRequest/type',
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
    }
  } else {
    const err23 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err23];
    } else {
      vErrors.push(err23);
    }
    errors++;
  }
  validate463.errors = vErrors;
  return errors === 0;
}
validate463.evaluated = {
  props: { path: true, header: true, body: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const publishPagesOutput = validate464;
const schema557 = {
  $ref: 'https://edition.invalid/control#/components/schemas/BatchPublishResult',
  $id: 'https://edition.invalid/validators/publishPagesOutput',
};
const schema550 = {
  type: 'object',
  properties: {
    pages: {
      type: 'array',
      items: { $ref: '#/components/schemas/PageSummary' },
    },
    outcome: {
      type: 'string',
      enum: ['promoted', 'skipped', 'held', 'unchanged'],
    },
    release: { $ref: '#/components/schemas/ReleaseDetail' },
  },
};
const schema531 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    title: { type: 'string' },
    slug: { type: 'string' },
    status: { type: 'string' },
    format: { type: 'string' },
    icon: { type: ['string', 'null'] },
    tags: { type: 'array', items: { type: 'string' } },
    driftFlag: { type: 'boolean' },
    updatedAt: { type: 'string', format: 'date-time' },
    updatedBy: { type: 'string', format: 'uuid' },
    publishedAt: { type: ['string', 'null'], format: 'date-time' },
    allowedActions: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          'create',
          'read',
          'rename',
          'edit',
          'revert',
          'reslug',
          'transfer',
          'publish',
          'unpublish',
        ],
      },
      uniqueItems: true,
    },
    contentType: { type: 'string' },
    versionRef: { type: 'string' },
    interpretation: { type: 'object', additionalProperties: {} },
  },
};
const formats10 = fullFormats['date-time'];
const schema477 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    label: { type: 'string' },
    status: {
      type: 'string',
      enum: ['draft', 'flagged', 'validated', 'live', 'archived'],
    },
    source: { $ref: '#/components/schemas/ReleaseSource' },
    pageCount: { type: 'integer', format: 'int32' },
    createdAt: { type: 'string', format: 'date-time' },
    promotedAt: { type: 'string', format: 'date-time' },
    allowedActions: {
      type: 'array',
      items: { type: 'string' },
      uniqueItems: true,
    },
    notes: { type: 'string' },
    report: { $ref: '#/components/schemas/ReportView' },
    diffSummary: { $ref: '#/components/schemas/DiffSummary' },
    size: { type: 'integer', format: 'int64' },
  },
};
const schema478 = {
  type: 'object',
  properties: {
    kind: { type: 'string' },
    ref: { type: 'string' },
    actor: { type: 'string', format: 'uuid' },
  },
};
const schema483 = {
  type: 'object',
  properties: {
    added: { type: 'integer', format: 'int32' },
    changed: { type: 'integer', format: 'int32' },
    removed: { type: 'integer', format: 'int32' },
  },
};
const schema479 = {
  type: 'object',
  properties: {
    errors: {
      type: 'array',
      items: { $ref: '#/components/schemas/IssueView' },
    },
    warnings: {
      type: 'array',
      items: { $ref: '#/components/schemas/IssueView' },
    },
    info: { type: 'array', items: { $ref: '#/components/schemas/IssueView' } },
  },
};
const schema480 = {
  type: 'object',
  properties: {
    code: { type: 'string' },
    path: { type: 'string' },
    pageId: { type: 'string', format: 'uuid' },
    detail: { type: 'string' },
  },
};
function validate381(
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
  const evaluated0 = validate381.evaluated;
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
                    '#/components/schemas/IssueView/properties/code/type',
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
              if (typeof data1.path !== 'string') {
                const err1 = {
                  instancePath: instancePath + '/errors/' + i0 + '/path',
                  schemaPath:
                    '#/components/schemas/IssueView/properties/path/type',
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
            if (data1.pageId !== undefined) {
              let data4 = data1.pageId;
              if (typeof data4 === 'string') {
                if (!formats0.test(data4)) {
                  const err2 = {
                    instancePath: instancePath + '/errors/' + i0 + '/pageId',
                    schemaPath:
                      '#/components/schemas/IssueView/properties/pageId/format',
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
                  instancePath: instancePath + '/errors/' + i0 + '/pageId',
                  schemaPath:
                    '#/components/schemas/IssueView/properties/pageId/type',
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
            if (data1.detail !== undefined) {
              if (typeof data1.detail !== 'string') {
                const err4 = {
                  instancePath: instancePath + '/errors/' + i0 + '/detail',
                  schemaPath:
                    '#/components/schemas/IssueView/properties/detail/type',
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
          } else {
            const err5 = {
              instancePath: instancePath + '/errors/' + i0,
              schemaPath: '#/components/schemas/IssueView/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
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
          instancePath: instancePath + '/errors',
          schemaPath: '#/properties/errors/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.warnings !== undefined) {
      let data6 = data.warnings;
      if (Array.isArray(data6)) {
        const len1 = data6.length;
        for (let i1 = 0; i1 < len1; i1++) {
          let data7 = data6[i1];
          if (data7 && typeof data7 == 'object' && !Array.isArray(data7)) {
            if (data7.code !== undefined) {
              if (typeof data7.code !== 'string') {
                const err7 = {
                  instancePath: instancePath + '/warnings/' + i1 + '/code',
                  schemaPath:
                    '#/components/schemas/IssueView/properties/code/type',
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
            if (data7.path !== undefined) {
              if (typeof data7.path !== 'string') {
                const err8 = {
                  instancePath: instancePath + '/warnings/' + i1 + '/path',
                  schemaPath:
                    '#/components/schemas/IssueView/properties/path/type',
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
            if (data7.pageId !== undefined) {
              let data10 = data7.pageId;
              if (typeof data10 === 'string') {
                if (!formats0.test(data10)) {
                  const err9 = {
                    instancePath: instancePath + '/warnings/' + i1 + '/pageId',
                    schemaPath:
                      '#/components/schemas/IssueView/properties/pageId/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
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
                  instancePath: instancePath + '/warnings/' + i1 + '/pageId',
                  schemaPath:
                    '#/components/schemas/IssueView/properties/pageId/type',
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
            if (data7.detail !== undefined) {
              if (typeof data7.detail !== 'string') {
                const err11 = {
                  instancePath: instancePath + '/warnings/' + i1 + '/detail',
                  schemaPath:
                    '#/components/schemas/IssueView/properties/detail/type',
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
              instancePath: instancePath + '/warnings/' + i1,
              schemaPath: '#/components/schemas/IssueView/type',
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
      } else {
        const err13 = {
          instancePath: instancePath + '/warnings',
          schemaPath: '#/properties/warnings/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
    }
    if (data.info !== undefined) {
      let data12 = data.info;
      if (Array.isArray(data12)) {
        const len2 = data12.length;
        for (let i2 = 0; i2 < len2; i2++) {
          let data13 = data12[i2];
          if (data13 && typeof data13 == 'object' && !Array.isArray(data13)) {
            if (data13.code !== undefined) {
              if (typeof data13.code !== 'string') {
                const err14 = {
                  instancePath: instancePath + '/info/' + i2 + '/code',
                  schemaPath:
                    '#/components/schemas/IssueView/properties/code/type',
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
            if (data13.path !== undefined) {
              if (typeof data13.path !== 'string') {
                const err15 = {
                  instancePath: instancePath + '/info/' + i2 + '/path',
                  schemaPath:
                    '#/components/schemas/IssueView/properties/path/type',
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
            if (data13.pageId !== undefined) {
              let data16 = data13.pageId;
              if (typeof data16 === 'string') {
                if (!formats0.test(data16)) {
                  const err16 = {
                    instancePath: instancePath + '/info/' + i2 + '/pageId',
                    schemaPath:
                      '#/components/schemas/IssueView/properties/pageId/format',
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
                  instancePath: instancePath + '/info/' + i2 + '/pageId',
                  schemaPath:
                    '#/components/schemas/IssueView/properties/pageId/type',
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
            if (data13.detail !== undefined) {
              if (typeof data13.detail !== 'string') {
                const err18 = {
                  instancePath: instancePath + '/info/' + i2 + '/detail',
                  schemaPath:
                    '#/components/schemas/IssueView/properties/detail/type',
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
          } else {
            const err19 = {
              instancePath: instancePath + '/info/' + i2,
              schemaPath: '#/components/schemas/IssueView/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
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
          instancePath: instancePath + '/info',
          schemaPath: '#/properties/info/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
  } else {
    const err21 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err21];
    } else {
      vErrors.push(err21);
    }
    errors++;
  }
  validate381.errors = vErrors;
  return errors === 0;
}
validate381.evaluated = {
  props: { errors: true, warnings: true, info: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate380(
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
  const evaluated0 = validate380.evaluated;
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
    if (data.label !== undefined) {
      if (typeof data.label !== 'string') {
        const err2 = {
          instancePath: instancePath + '/label',
          schemaPath: '#/properties/label/type',
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
    if (data.status !== undefined) {
      let data2 = data.status;
      if (typeof data2 !== 'string') {
        const err3 = {
          instancePath: instancePath + '/status',
          schemaPath: '#/properties/status/type',
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
      if (!(
        data2 === 'draft' ||
        data2 === 'flagged' ||
        data2 === 'validated' ||
        data2 === 'live' ||
        data2 === 'archived'
      )) {
        const err4 = {
          instancePath: instancePath + '/status',
          schemaPath: '#/properties/status/enum',
          keyword: 'enum',
          params: { allowedValues: schema477.properties.status.enum },
          message: 'must be equal to one of the allowed values',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.source !== undefined) {
      let data3 = data.source;
      if (data3 && typeof data3 == 'object' && !Array.isArray(data3)) {
        if (data3.kind !== undefined) {
          if (typeof data3.kind !== 'string') {
            const err5 = {
              instancePath: instancePath + '/source/kind',
              schemaPath:
                '#/components/schemas/ReleaseSource/properties/kind/type',
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
        if (data3.ref !== undefined) {
          if (typeof data3.ref !== 'string') {
            const err6 = {
              instancePath: instancePath + '/source/ref',
              schemaPath:
                '#/components/schemas/ReleaseSource/properties/ref/type',
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
        if (data3.actor !== undefined) {
          let data6 = data3.actor;
          if (typeof data6 === 'string') {
            if (!formats0.test(data6)) {
              const err7 = {
                instancePath: instancePath + '/source/actor',
                schemaPath:
                  '#/components/schemas/ReleaseSource/properties/actor/format',
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
              instancePath: instancePath + '/source/actor',
              schemaPath:
                '#/components/schemas/ReleaseSource/properties/actor/type',
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
          instancePath: instancePath + '/source',
          schemaPath: '#/components/schemas/ReleaseSource/type',
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
    if (data.pageCount !== undefined) {
      let data7 = data.pageCount;
      if (!(typeof data7 == 'number' && !(data7 % 1) && !isNaN(data7))) {
        const err10 = {
          instancePath: instancePath + '/pageCount',
          schemaPath: '#/properties/pageCount/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
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
      let data8 = data.createdAt;
      if (typeof data8 === 'string') {
        if (!formats10.validate(data8)) {
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
    if (data.promotedAt !== undefined) {
      let data9 = data.promotedAt;
      if (typeof data9 === 'string') {
        if (!formats10.validate(data9)) {
          const err13 = {
            instancePath: instancePath + '/promotedAt',
            schemaPath: '#/properties/promotedAt/format',
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
          instancePath: instancePath + '/promotedAt',
          schemaPath: '#/properties/promotedAt/type',
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
    if (data.allowedActions !== undefined) {
      let data10 = data.allowedActions;
      if (Array.isArray(data10)) {
        const len0 = data10.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (typeof data10[i0] !== 'string') {
            const err15 = {
              instancePath: instancePath + '/allowedActions/' + i0,
              schemaPath: '#/properties/allowedActions/items/type',
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
        let i1 = data10.length;
        let j0;
        if (i1 > 1) {
          const indices0 = {};
          for (; i1--;) {
            let item0 = data10[i1];
            if (typeof item0 !== 'string') {
              continue;
            }
            if (typeof indices0[item0] == 'number') {
              j0 = indices0[item0];
              const err16 = {
                instancePath: instancePath + '/allowedActions',
                schemaPath: '#/properties/allowedActions/uniqueItems',
                keyword: 'uniqueItems',
                params: { i: i1, j: j0 },
                message:
                  'must NOT have duplicate items (items ## ' +
                  j0 +
                  ' and ' +
                  i1 +
                  ' are identical)',
              };
              if (vErrors === null) {
                vErrors = [err16];
              } else {
                vErrors.push(err16);
              }
              errors++;
              break;
            }
            indices0[item0] = i1;
          }
        }
      } else {
        const err17 = {
          instancePath: instancePath + '/allowedActions',
          schemaPath: '#/properties/allowedActions/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err17];
        } else {
          vErrors.push(err17);
        }
        errors++;
      }
    }
    if (data.notes !== undefined) {
      if (typeof data.notes !== 'string') {
        const err18 = {
          instancePath: instancePath + '/notes',
          schemaPath: '#/properties/notes/type',
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
    if (data.report !== undefined) {
      if (
        !validate381(data.report, {
          instancePath: instancePath + '/report',
          parentData: data,
          parentDataProperty: 'report',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors =
          vErrors === null
            ? validate381.errors
            : vErrors.concat(validate381.errors);
        errors = vErrors.length;
      }
    }
    if (data.diffSummary !== undefined) {
      let data14 = data.diffSummary;
      if (data14 && typeof data14 == 'object' && !Array.isArray(data14)) {
        if (data14.added !== undefined) {
          let data15 = data14.added;
          if (!(typeof data15 == 'number' && !(data15 % 1) && !isNaN(data15))) {
            const err19 = {
              instancePath: instancePath + '/diffSummary/added',
              schemaPath:
                '#/components/schemas/DiffSummary/properties/added/type',
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
        if (data14.changed !== undefined) {
          let data16 = data14.changed;
          if (!(typeof data16 == 'number' && !(data16 % 1) && !isNaN(data16))) {
            const err20 = {
              instancePath: instancePath + '/diffSummary/changed',
              schemaPath:
                '#/components/schemas/DiffSummary/properties/changed/type',
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
        }
        if (data14.removed !== undefined) {
          let data17 = data14.removed;
          if (!(typeof data17 == 'number' && !(data17 % 1) && !isNaN(data17))) {
            const err21 = {
              instancePath: instancePath + '/diffSummary/removed',
              schemaPath:
                '#/components/schemas/DiffSummary/properties/removed/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
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
          instancePath: instancePath + '/diffSummary',
          schemaPath: '#/components/schemas/DiffSummary/type',
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
    }
    if (data.size !== undefined) {
      let data18 = data.size;
      if (!(typeof data18 == 'number' && !(data18 % 1) && !isNaN(data18))) {
        const err23 = {
          instancePath: instancePath + '/size',
          schemaPath: '#/properties/size/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
    }
  } else {
    const err24 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err24];
    } else {
      vErrors.push(err24);
    }
    errors++;
  }
  validate380.errors = vErrors;
  return errors === 0;
}
validate380.evaluated = {
  props: {
    id: true,
    label: true,
    status: true,
    source: true,
    pageCount: true,
    createdAt: true,
    promotedAt: true,
    allowedActions: true,
    notes: true,
    report: true,
    diffSummary: true,
    size: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate465(
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
  const evaluated0 = validate465.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.pages !== undefined) {
      let data0 = data.pages;
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
                    instancePath: instancePath + '/pages/' + i0 + '/id',
                    schemaPath:
                      '#/components/schemas/PageSummary/properties/id/format',
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
                  instancePath: instancePath + '/pages/' + i0 + '/id',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/id/type',
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
            if (data1.title !== undefined) {
              if (typeof data1.title !== 'string') {
                const err2 = {
                  instancePath: instancePath + '/pages/' + i0 + '/title',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/title/type',
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
            if (data1.slug !== undefined) {
              if (typeof data1.slug !== 'string') {
                const err3 = {
                  instancePath: instancePath + '/pages/' + i0 + '/slug',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/slug/type',
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
            if (data1.status !== undefined) {
              if (typeof data1.status !== 'string') {
                const err4 = {
                  instancePath: instancePath + '/pages/' + i0 + '/status',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/status/type',
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
            if (data1.format !== undefined) {
              if (typeof data1.format !== 'string') {
                const err5 = {
                  instancePath: instancePath + '/pages/' + i0 + '/format',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/format/type',
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
            if (data1.icon !== undefined) {
              let data7 = data1.icon;
              if (typeof data7 !== 'string' && data7 !== null) {
                const err6 = {
                  instancePath: instancePath + '/pages/' + i0 + '/icon',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/icon/type',
                  keyword: 'type',
                  params: { type: schema531.properties.icon.type },
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
            if (data1.tags !== undefined) {
              let data8 = data1.tags;
              if (Array.isArray(data8)) {
                const len1 = data8.length;
                for (let i1 = 0; i1 < len1; i1++) {
                  if (typeof data8[i1] !== 'string') {
                    const err7 = {
                      instancePath:
                        instancePath + '/pages/' + i0 + '/tags/' + i1,
                      schemaPath:
                        '#/components/schemas/PageSummary/properties/tags/items/type',
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
              } else {
                const err8 = {
                  instancePath: instancePath + '/pages/' + i0 + '/tags',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/tags/type',
                  keyword: 'type',
                  params: { type: 'array' },
                  message: 'must be array',
                };
                if (vErrors === null) {
                  vErrors = [err8];
                } else {
                  vErrors.push(err8);
                }
                errors++;
              }
            }
            if (data1.driftFlag !== undefined) {
              if (typeof data1.driftFlag !== 'boolean') {
                const err9 = {
                  instancePath: instancePath + '/pages/' + i0 + '/driftFlag',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/driftFlag/type',
                  keyword: 'type',
                  params: { type: 'boolean' },
                  message: 'must be boolean',
                };
                if (vErrors === null) {
                  vErrors = [err9];
                } else {
                  vErrors.push(err9);
                }
                errors++;
              }
            }
            if (data1.updatedAt !== undefined) {
              let data11 = data1.updatedAt;
              if (typeof data11 === 'string') {
                if (!formats10.validate(data11)) {
                  const err10 = {
                    instancePath: instancePath + '/pages/' + i0 + '/updatedAt',
                    schemaPath:
                      '#/components/schemas/PageSummary/properties/updatedAt/format',
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
                  instancePath: instancePath + '/pages/' + i0 + '/updatedAt',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/updatedAt/type',
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
            if (data1.updatedBy !== undefined) {
              let data12 = data1.updatedBy;
              if (typeof data12 === 'string') {
                if (!formats0.test(data12)) {
                  const err12 = {
                    instancePath: instancePath + '/pages/' + i0 + '/updatedBy',
                    schemaPath:
                      '#/components/schemas/PageSummary/properties/updatedBy/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
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
                  instancePath: instancePath + '/pages/' + i0 + '/updatedBy',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/updatedBy/type',
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
            if (data1.publishedAt !== undefined) {
              let data13 = data1.publishedAt;
              if (typeof data13 !== 'string' && data13 !== null) {
                const err14 = {
                  instancePath: instancePath + '/pages/' + i0 + '/publishedAt',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/publishedAt/type',
                  keyword: 'type',
                  params: { type: schema531.properties.publishedAt.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err14];
                } else {
                  vErrors.push(err14);
                }
                errors++;
              }
              if (typeof data13 === 'string') {
                if (!formats10.validate(data13)) {
                  const err15 = {
                    instancePath:
                      instancePath + '/pages/' + i0 + '/publishedAt',
                    schemaPath:
                      '#/components/schemas/PageSummary/properties/publishedAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err15];
                  } else {
                    vErrors.push(err15);
                  }
                  errors++;
                }
              }
            }
            if (data1.allowedActions !== undefined) {
              let data14 = data1.allowedActions;
              if (Array.isArray(data14)) {
                const len2 = data14.length;
                for (let i2 = 0; i2 < len2; i2++) {
                  let data15 = data14[i2];
                  if (typeof data15 !== 'string') {
                    const err16 = {
                      instancePath:
                        instancePath + '/pages/' + i0 + '/allowedActions/' + i2,
                      schemaPath:
                        '#/components/schemas/PageSummary/properties/allowedActions/items/type',
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
                  if (!(
                    data15 === 'create' ||
                    data15 === 'read' ||
                    data15 === 'rename' ||
                    data15 === 'edit' ||
                    data15 === 'revert' ||
                    data15 === 'reslug' ||
                    data15 === 'transfer' ||
                    data15 === 'publish' ||
                    data15 === 'unpublish'
                  )) {
                    const err17 = {
                      instancePath:
                        instancePath + '/pages/' + i0 + '/allowedActions/' + i2,
                      schemaPath:
                        '#/components/schemas/PageSummary/properties/allowedActions/items/enum',
                      keyword: 'enum',
                      params: {
                        allowedValues:
                          schema531.properties.allowedActions.items.enum,
                      },
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
                let i3 = data14.length;
                let j0;
                if (i3 > 1) {
                  const indices0 = {};
                  for (; i3--;) {
                    let item0 = data14[i3];
                    if (typeof item0 !== 'string') {
                      continue;
                    }
                    if (typeof indices0[item0] == 'number') {
                      j0 = indices0[item0];
                      const err18 = {
                        instancePath:
                          instancePath + '/pages/' + i0 + '/allowedActions',
                        schemaPath:
                          '#/components/schemas/PageSummary/properties/allowedActions/uniqueItems',
                        keyword: 'uniqueItems',
                        params: { i: i3, j: j0 },
                        message:
                          'must NOT have duplicate items (items ## ' +
                          j0 +
                          ' and ' +
                          i3 +
                          ' are identical)',
                      };
                      if (vErrors === null) {
                        vErrors = [err18];
                      } else {
                        vErrors.push(err18);
                      }
                      errors++;
                      break;
                    }
                    indices0[item0] = i3;
                  }
                }
              } else {
                const err19 = {
                  instancePath:
                    instancePath + '/pages/' + i0 + '/allowedActions',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/allowedActions/type',
                  keyword: 'type',
                  params: { type: 'array' },
                  message: 'must be array',
                };
                if (vErrors === null) {
                  vErrors = [err19];
                } else {
                  vErrors.push(err19);
                }
                errors++;
              }
            }
            if (data1.contentType !== undefined) {
              if (typeof data1.contentType !== 'string') {
                const err20 = {
                  instancePath: instancePath + '/pages/' + i0 + '/contentType',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/contentType/type',
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
            if (data1.versionRef !== undefined) {
              if (typeof data1.versionRef !== 'string') {
                const err21 = {
                  instancePath: instancePath + '/pages/' + i0 + '/versionRef',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/versionRef/type',
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
            if (data1.interpretation !== undefined) {
              let data18 = data1.interpretation;
              if (
                data18 &&
                typeof data18 == 'object' &&
                !Array.isArray(data18)
              ) {
              } else {
                const err22 = {
                  instancePath:
                    instancePath + '/pages/' + i0 + '/interpretation',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/interpretation/type',
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
            }
          } else {
            const err23 = {
              instancePath: instancePath + '/pages/' + i0,
              schemaPath: '#/components/schemas/PageSummary/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
            };
            if (vErrors === null) {
              vErrors = [err23];
            } else {
              vErrors.push(err23);
            }
            errors++;
          }
        }
      } else {
        const err24 = {
          instancePath: instancePath + '/pages',
          schemaPath: '#/properties/pages/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err24];
        } else {
          vErrors.push(err24);
        }
        errors++;
      }
    }
    if (data.outcome !== undefined) {
      let data19 = data.outcome;
      if (typeof data19 !== 'string') {
        const err25 = {
          instancePath: instancePath + '/outcome',
          schemaPath: '#/properties/outcome/type',
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
      if (!(
        data19 === 'promoted' ||
        data19 === 'skipped' ||
        data19 === 'held' ||
        data19 === 'unchanged'
      )) {
        const err26 = {
          instancePath: instancePath + '/outcome',
          schemaPath: '#/properties/outcome/enum',
          keyword: 'enum',
          params: { allowedValues: schema550.properties.outcome.enum },
          message: 'must be equal to one of the allowed values',
        };
        if (vErrors === null) {
          vErrors = [err26];
        } else {
          vErrors.push(err26);
        }
        errors++;
      }
    }
    if (data.release !== undefined) {
      if (
        !validate380(data.release, {
          instancePath: instancePath + '/release',
          parentData: data,
          parentDataProperty: 'release',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors =
          vErrors === null
            ? validate380.errors
            : vErrors.concat(validate380.errors);
        errors = vErrors.length;
      }
    }
  } else {
    const err27 = {
      instancePath,
      schemaPath: '#/type',
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
  validate465.errors = vErrors;
  return errors === 0;
}
validate465.evaluated = {
  props: { pages: true, outcome: true, release: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate464(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/publishPagesOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate464.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate465(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate465.errors
        : vErrors.concat(validate465.errors);
    errors = vErrors.length;
  }
  validate464.errors = vErrors;
  return errors === 0;
}
validate464.evaluated = {
  props: { pages: true, outcome: true, release: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const publishPagesOutputFull = validate468;
const schema560 = {
  $ref: 'https://edition.invalid/control#/components/schemas/BatchPublishResult',
  $id: 'https://edition.invalid/validators/publishPagesOutputFull',
};
function validate469(
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
  const evaluated0 = validate469.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.pages !== undefined) {
      let data0 = data.pages;
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
                    instancePath: instancePath + '/pages/' + i0 + '/id',
                    schemaPath:
                      '#/components/schemas/PageSummary/properties/id/format',
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
                  instancePath: instancePath + '/pages/' + i0 + '/id',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/id/type',
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
            if (data1.title !== undefined) {
              if (typeof data1.title !== 'string') {
                const err2 = {
                  instancePath: instancePath + '/pages/' + i0 + '/title',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/title/type',
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
            if (data1.slug !== undefined) {
              if (typeof data1.slug !== 'string') {
                const err3 = {
                  instancePath: instancePath + '/pages/' + i0 + '/slug',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/slug/type',
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
            if (data1.status !== undefined) {
              if (typeof data1.status !== 'string') {
                const err4 = {
                  instancePath: instancePath + '/pages/' + i0 + '/status',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/status/type',
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
            if (data1.format !== undefined) {
              if (typeof data1.format !== 'string') {
                const err5 = {
                  instancePath: instancePath + '/pages/' + i0 + '/format',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/format/type',
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
            if (data1.icon !== undefined) {
              let data7 = data1.icon;
              if (typeof data7 !== 'string' && data7 !== null) {
                const err6 = {
                  instancePath: instancePath + '/pages/' + i0 + '/icon',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/icon/type',
                  keyword: 'type',
                  params: { type: schema531.properties.icon.type },
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
            if (data1.tags !== undefined) {
              let data8 = data1.tags;
              if (Array.isArray(data8)) {
                const len1 = data8.length;
                for (let i1 = 0; i1 < len1; i1++) {
                  if (typeof data8[i1] !== 'string') {
                    const err7 = {
                      instancePath:
                        instancePath + '/pages/' + i0 + '/tags/' + i1,
                      schemaPath:
                        '#/components/schemas/PageSummary/properties/tags/items/type',
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
              } else {
                const err8 = {
                  instancePath: instancePath + '/pages/' + i0 + '/tags',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/tags/type',
                  keyword: 'type',
                  params: { type: 'array' },
                  message: 'must be array',
                };
                if (vErrors === null) {
                  vErrors = [err8];
                } else {
                  vErrors.push(err8);
                }
                errors++;
              }
            }
            if (data1.driftFlag !== undefined) {
              if (typeof data1.driftFlag !== 'boolean') {
                const err9 = {
                  instancePath: instancePath + '/pages/' + i0 + '/driftFlag',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/driftFlag/type',
                  keyword: 'type',
                  params: { type: 'boolean' },
                  message: 'must be boolean',
                };
                if (vErrors === null) {
                  vErrors = [err9];
                } else {
                  vErrors.push(err9);
                }
                errors++;
              }
            }
            if (data1.updatedAt !== undefined) {
              let data11 = data1.updatedAt;
              if (typeof data11 === 'string') {
                if (!formats10.validate(data11)) {
                  const err10 = {
                    instancePath: instancePath + '/pages/' + i0 + '/updatedAt',
                    schemaPath:
                      '#/components/schemas/PageSummary/properties/updatedAt/format',
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
                  instancePath: instancePath + '/pages/' + i0 + '/updatedAt',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/updatedAt/type',
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
            if (data1.updatedBy !== undefined) {
              let data12 = data1.updatedBy;
              if (typeof data12 === 'string') {
                if (!formats0.test(data12)) {
                  const err12 = {
                    instancePath: instancePath + '/pages/' + i0 + '/updatedBy',
                    schemaPath:
                      '#/components/schemas/PageSummary/properties/updatedBy/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
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
                  instancePath: instancePath + '/pages/' + i0 + '/updatedBy',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/updatedBy/type',
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
            if (data1.publishedAt !== undefined) {
              let data13 = data1.publishedAt;
              if (typeof data13 !== 'string' && data13 !== null) {
                const err14 = {
                  instancePath: instancePath + '/pages/' + i0 + '/publishedAt',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/publishedAt/type',
                  keyword: 'type',
                  params: { type: schema531.properties.publishedAt.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err14];
                } else {
                  vErrors.push(err14);
                }
                errors++;
              }
              if (typeof data13 === 'string') {
                if (!formats10.validate(data13)) {
                  const err15 = {
                    instancePath:
                      instancePath + '/pages/' + i0 + '/publishedAt',
                    schemaPath:
                      '#/components/schemas/PageSummary/properties/publishedAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err15];
                  } else {
                    vErrors.push(err15);
                  }
                  errors++;
                }
              }
            }
            if (data1.allowedActions !== undefined) {
              let data14 = data1.allowedActions;
              if (Array.isArray(data14)) {
                const len2 = data14.length;
                for (let i2 = 0; i2 < len2; i2++) {
                  let data15 = data14[i2];
                  if (typeof data15 !== 'string') {
                    const err16 = {
                      instancePath:
                        instancePath + '/pages/' + i0 + '/allowedActions/' + i2,
                      schemaPath:
                        '#/components/schemas/PageSummary/properties/allowedActions/items/type',
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
                  if (!(
                    data15 === 'create' ||
                    data15 === 'read' ||
                    data15 === 'rename' ||
                    data15 === 'edit' ||
                    data15 === 'revert' ||
                    data15 === 'reslug' ||
                    data15 === 'transfer' ||
                    data15 === 'publish' ||
                    data15 === 'unpublish'
                  )) {
                    const err17 = {
                      instancePath:
                        instancePath + '/pages/' + i0 + '/allowedActions/' + i2,
                      schemaPath:
                        '#/components/schemas/PageSummary/properties/allowedActions/items/enum',
                      keyword: 'enum',
                      params: {
                        allowedValues:
                          schema531.properties.allowedActions.items.enum,
                      },
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
                let i3 = data14.length;
                let j0;
                if (i3 > 1) {
                  const indices0 = {};
                  for (; i3--;) {
                    let item0 = data14[i3];
                    if (typeof item0 !== 'string') {
                      continue;
                    }
                    if (typeof indices0[item0] == 'number') {
                      j0 = indices0[item0];
                      const err18 = {
                        instancePath:
                          instancePath + '/pages/' + i0 + '/allowedActions',
                        schemaPath:
                          '#/components/schemas/PageSummary/properties/allowedActions/uniqueItems',
                        keyword: 'uniqueItems',
                        params: { i: i3, j: j0 },
                        message:
                          'must NOT have duplicate items (items ## ' +
                          j0 +
                          ' and ' +
                          i3 +
                          ' are identical)',
                      };
                      if (vErrors === null) {
                        vErrors = [err18];
                      } else {
                        vErrors.push(err18);
                      }
                      errors++;
                      break;
                    }
                    indices0[item0] = i3;
                  }
                }
              } else {
                const err19 = {
                  instancePath:
                    instancePath + '/pages/' + i0 + '/allowedActions',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/allowedActions/type',
                  keyword: 'type',
                  params: { type: 'array' },
                  message: 'must be array',
                };
                if (vErrors === null) {
                  vErrors = [err19];
                } else {
                  vErrors.push(err19);
                }
                errors++;
              }
            }
            if (data1.contentType !== undefined) {
              if (typeof data1.contentType !== 'string') {
                const err20 = {
                  instancePath: instancePath + '/pages/' + i0 + '/contentType',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/contentType/type',
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
            if (data1.versionRef !== undefined) {
              if (typeof data1.versionRef !== 'string') {
                const err21 = {
                  instancePath: instancePath + '/pages/' + i0 + '/versionRef',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/versionRef/type',
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
            if (data1.interpretation !== undefined) {
              let data18 = data1.interpretation;
              if (
                data18 &&
                typeof data18 == 'object' &&
                !Array.isArray(data18)
              ) {
              } else {
                const err22 = {
                  instancePath:
                    instancePath + '/pages/' + i0 + '/interpretation',
                  schemaPath:
                    '#/components/schemas/PageSummary/properties/interpretation/type',
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
            }
          } else {
            const err23 = {
              instancePath: instancePath + '/pages/' + i0,
              schemaPath: '#/components/schemas/PageSummary/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
            };
            if (vErrors === null) {
              vErrors = [err23];
            } else {
              vErrors.push(err23);
            }
            errors++;
          }
        }
      } else {
        const err24 = {
          instancePath: instancePath + '/pages',
          schemaPath: '#/properties/pages/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err24];
        } else {
          vErrors.push(err24);
        }
        errors++;
      }
    }
    if (data.outcome !== undefined) {
      let data19 = data.outcome;
      if (typeof data19 !== 'string') {
        const err25 = {
          instancePath: instancePath + '/outcome',
          schemaPath: '#/properties/outcome/type',
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
      if (!(
        data19 === 'promoted' ||
        data19 === 'skipped' ||
        data19 === 'held' ||
        data19 === 'unchanged'
      )) {
        const err26 = {
          instancePath: instancePath + '/outcome',
          schemaPath: '#/properties/outcome/enum',
          keyword: 'enum',
          params: { allowedValues: schema550.properties.outcome.enum },
          message: 'must be equal to one of the allowed values',
        };
        if (vErrors === null) {
          vErrors = [err26];
        } else {
          vErrors.push(err26);
        }
        errors++;
      }
    }
    if (data.release !== undefined) {
      if (
        !validate380(data.release, {
          instancePath: instancePath + '/release',
          parentData: data,
          parentDataProperty: 'release',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors =
          vErrors === null
            ? validate380.errors
            : vErrors.concat(validate380.errors);
        errors = vErrors.length;
      }
    }
  } else {
    const err27 = {
      instancePath,
      schemaPath: '#/type',
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
  validate469.errors = vErrors;
  return errors === 0;
}
validate469.evaluated = {
  props: { pages: true, outcome: true, release: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate468(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/publishPagesOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate468.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate469(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate469.errors
        : vErrors.concat(validate469.errors);
    errors = vErrors.length;
  }
  validate468.errors = vErrors;
  return errors === 0;
}
validate468.evaluated = {
  props: { pages: true, outcome: true, release: true },
  dynamicProps: false,
  dynamicItems: false,
};
