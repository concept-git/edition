// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const buildReleaseInput = validate393;
const schema491 = {
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
  },
  required: ['path', 'header'],
  $id: 'https://edition.invalid/validators/buildReleaseInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
const pattern4 = new RegExp('^[a-zA-Z0-9._:-]+$', 'u');
function validate393(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/buildReleaseInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate393.evaluated;
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
    if (data.path !== undefined) {
      let data0 = data.path;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.tenantId === undefined) {
          const err2 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'tenantId' },
            message: "must have required property '" + 'tenantId' + "'",
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
        if (data0.spaceId === undefined) {
          const err3 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'spaceId' },
            message: "must have required property '" + 'spaceId' + "'",
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
      } else {
        const err8 = {
          instancePath: instancePath + '/path',
          schemaPath: '#/properties/path/type',
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
    if (data.header !== undefined) {
      let data3 = data.header;
      if (data3 && typeof data3 == 'object' && !Array.isArray(data3)) {
        if (data3['Idempotency-Key'] === undefined) {
          const err9 = {
            instancePath: instancePath + '/header',
            schemaPath: '#/properties/header/required',
            keyword: 'required',
            params: { missingProperty: 'Idempotency-Key' },
            message: "must have required property '" + 'Idempotency-Key' + "'",
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
        if (data3['Idempotency-Key'] !== undefined) {
          let data4 = data3['Idempotency-Key'];
          if (typeof data4 === 'string') {
            if (func1(data4) > 128) {
              const err10 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/maxLength',
                keyword: 'maxLength',
                params: { limit: 128 },
                message: 'must NOT have more than 128 characters',
              };
              if (vErrors === null) {
                vErrors = [err10];
              } else {
                vErrors.push(err10);
              }
              errors++;
            }
            if (func1(data4) < 1) {
              const err11 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/minLength',
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
            if (!pattern4.test(data4)) {
              const err12 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/pattern',
                keyword: 'pattern',
                params: { pattern: '^[a-zA-Z0-9._:-]+$' },
                message: 'must match pattern "' + '^[a-zA-Z0-9._:-]+$' + '"',
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
              instancePath: instancePath + '/header/Idempotency-Key',
              schemaPath: '#/properties/header/properties/Idempotency-Key/type',
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
          instancePath: instancePath + '/header',
          schemaPath: '#/properties/header/type',
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
  validate393.errors = vErrors;
  return errors === 0;
}
validate393.evaluated = {
  props: { path: true, header: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const buildReleaseOutput = validate394;
const schema492 = {
  $ref: 'https://edition.invalid/control#/components/schemas/BuildReleaseResult',
  $id: 'https://edition.invalid/validators/buildReleaseOutput',
};
const schema493 = {
  type: 'object',
  properties: {
    outcome: {
      type: 'string',
      enum: ['promoted', 'skipped', 'held', 'unchanged'],
    },
    release: { $ref: '#/components/schemas/ReleaseDetail' },
  },
};
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
const formats10 = fullFormats['date-time'];
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
function validate395(
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
  const evaluated0 = validate395.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.outcome !== undefined) {
      let data0 = data.outcome;
      if (typeof data0 !== 'string') {
        const err0 = {
          instancePath: instancePath + '/outcome',
          schemaPath: '#/properties/outcome/type',
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
      if (!(
        data0 === 'promoted' ||
        data0 === 'skipped' ||
        data0 === 'held' ||
        data0 === 'unchanged'
      )) {
        const err1 = {
          instancePath: instancePath + '/outcome',
          schemaPath: '#/properties/outcome/enum',
          keyword: 'enum',
          params: { allowedValues: schema493.properties.outcome.enum },
          message: 'must be equal to one of the allowed values',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
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
    const err2 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err2];
    } else {
      vErrors.push(err2);
    }
    errors++;
  }
  validate395.errors = vErrors;
  return errors === 0;
}
validate395.evaluated = {
  props: { outcome: true, release: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate394(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/buildReleaseOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate394.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate395(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate395.errors
        : vErrors.concat(validate395.errors);
    errors = vErrors.length;
  }
  validate394.errors = vErrors;
  return errors === 0;
}
validate394.evaluated = {
  props: { outcome: true, release: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const buildReleaseOutputFull = validate398;
const schema494 = {
  $ref: 'https://edition.invalid/control#/components/schemas/BuildReleaseResult',
  $id: 'https://edition.invalid/validators/buildReleaseOutputFull',
};
function validate399(
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
  const evaluated0 = validate399.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.outcome !== undefined) {
      let data0 = data.outcome;
      if (typeof data0 !== 'string') {
        const err0 = {
          instancePath: instancePath + '/outcome',
          schemaPath: '#/properties/outcome/type',
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
      if (!(
        data0 === 'promoted' ||
        data0 === 'skipped' ||
        data0 === 'held' ||
        data0 === 'unchanged'
      )) {
        const err1 = {
          instancePath: instancePath + '/outcome',
          schemaPath: '#/properties/outcome/enum',
          keyword: 'enum',
          params: { allowedValues: schema493.properties.outcome.enum },
          message: 'must be equal to one of the allowed values',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
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
    const err2 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err2];
    } else {
      vErrors.push(err2);
    }
    errors++;
  }
  validate399.errors = vErrors;
  return errors === 0;
}
validate399.evaluated = {
  props: { outcome: true, release: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate398(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/buildReleaseOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate398.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate399(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate399.errors
        : vErrors.concat(validate399.errors);
    errors = vErrors.length;
  }
  validate398.errors = vErrors;
  return errors === 0;
}
validate398.evaluated = {
  props: { outcome: true, release: true },
  dynamicProps: false,
  dynamicItems: false,
};
