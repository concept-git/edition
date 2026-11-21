// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
('use strict');
export const ingestAnalyticsInput = validate238;
const schema313 = {
  type: 'object',
  properties: {
    body: {
      type: 'array',
      items: {
        $ref: 'https://edition.invalid/control#/components/schemas/TelemetryEvent',
      },
    },
  },
  required: ['body'],
  $id: 'https://edition.invalid/validators/ingestAnalyticsInput',
};
const schema314 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    sourceId: { type: 'string', format: 'uuid' },
    time: { type: 'string', format: 'date-time' },
    tenantId: { type: 'string', format: 'uuid' },
    siteId: { type: 'string', format: 'uuid' },
    pageId: { type: 'string', format: 'uuid' },
    type: { type: 'string' },
    path: { type: 'string' },
    query: { type: 'string' },
    searchId: { type: 'string', format: 'uuid' },
    visitor: { type: 'string' },
    referrer: { type: 'string' },
    zero: { type: 'boolean' },
    observable: { type: 'boolean' },
    dropped: { type: 'integer', format: 'int64' },
  },
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const formats10 = fullFormats['date-time'];
function validate238(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/ingestAnalyticsInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate238.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.body === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'body' },
        message: "must have required property '" + 'body' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.body !== undefined) {
      let data0 = data.body;
      if (Array.isArray(data0)) {
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data1 = data0[i0];
          if (data1 && typeof data1 == 'object' && !Array.isArray(data1)) {
            if (data1.id !== undefined) {
              let data2 = data1.id;
              if (typeof data2 === 'string') {
                if (!formats0.test(data2)) {
                  const err1 = {
                    instancePath: instancePath + '/body/' + i0 + '/id',
                    schemaPath:
                      'https://edition.invalid/control#/components/schemas/TelemetryEvent/properties/id/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err1];
                  } else {
                    vErrors.push(err1);
                  }
                  errors++;
                }
              } else {
                const err2 = {
                  instancePath: instancePath + '/body/' + i0 + '/id',
                  schemaPath:
                    'https://edition.invalid/control#/components/schemas/TelemetryEvent/properties/id/type',
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
            if (data1.sourceId !== undefined) {
              let data3 = data1.sourceId;
              if (typeof data3 === 'string') {
                if (!formats0.test(data3)) {
                  const err3 = {
                    instancePath: instancePath + '/body/' + i0 + '/sourceId',
                    schemaPath:
                      'https://edition.invalid/control#/components/schemas/TelemetryEvent/properties/sourceId/format',
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
                  instancePath: instancePath + '/body/' + i0 + '/sourceId',
                  schemaPath:
                    'https://edition.invalid/control#/components/schemas/TelemetryEvent/properties/sourceId/type',
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
            if (data1.time !== undefined) {
              let data4 = data1.time;
              if (typeof data4 === 'string') {
                if (!formats10.validate(data4)) {
                  const err5 = {
                    instancePath: instancePath + '/body/' + i0 + '/time',
                    schemaPath:
                      'https://edition.invalid/control#/components/schemas/TelemetryEvent/properties/time/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
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
                  instancePath: instancePath + '/body/' + i0 + '/time',
                  schemaPath:
                    'https://edition.invalid/control#/components/schemas/TelemetryEvent/properties/time/type',
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
            if (data1.tenantId !== undefined) {
              let data5 = data1.tenantId;
              if (typeof data5 === 'string') {
                if (!formats0.test(data5)) {
                  const err7 = {
                    instancePath: instancePath + '/body/' + i0 + '/tenantId',
                    schemaPath:
                      'https://edition.invalid/control#/components/schemas/TelemetryEvent/properties/tenantId/format',
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
                  instancePath: instancePath + '/body/' + i0 + '/tenantId',
                  schemaPath:
                    'https://edition.invalid/control#/components/schemas/TelemetryEvent/properties/tenantId/type',
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
            if (data1.siteId !== undefined) {
              let data6 = data1.siteId;
              if (typeof data6 === 'string') {
                if (!formats0.test(data6)) {
                  const err9 = {
                    instancePath: instancePath + '/body/' + i0 + '/siteId',
                    schemaPath:
                      'https://edition.invalid/control#/components/schemas/TelemetryEvent/properties/siteId/format',
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
                  instancePath: instancePath + '/body/' + i0 + '/siteId',
                  schemaPath:
                    'https://edition.invalid/control#/components/schemas/TelemetryEvent/properties/siteId/type',
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
            if (data1.pageId !== undefined) {
              let data7 = data1.pageId;
              if (typeof data7 === 'string') {
                if (!formats0.test(data7)) {
                  const err11 = {
                    instancePath: instancePath + '/body/' + i0 + '/pageId',
                    schemaPath:
                      'https://edition.invalid/control#/components/schemas/TelemetryEvent/properties/pageId/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
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
                  instancePath: instancePath + '/body/' + i0 + '/pageId',
                  schemaPath:
                    'https://edition.invalid/control#/components/schemas/TelemetryEvent/properties/pageId/type',
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
            if (data1.type !== undefined) {
              if (typeof data1.type !== 'string') {
                const err13 = {
                  instancePath: instancePath + '/body/' + i0 + '/type',
                  schemaPath:
                    'https://edition.invalid/control#/components/schemas/TelemetryEvent/properties/type/type',
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
            if (data1.path !== undefined) {
              if (typeof data1.path !== 'string') {
                const err14 = {
                  instancePath: instancePath + '/body/' + i0 + '/path',
                  schemaPath:
                    'https://edition.invalid/control#/components/schemas/TelemetryEvent/properties/path/type',
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
            if (data1.query !== undefined) {
              if (typeof data1.query !== 'string') {
                const err15 = {
                  instancePath: instancePath + '/body/' + i0 + '/query',
                  schemaPath:
                    'https://edition.invalid/control#/components/schemas/TelemetryEvent/properties/query/type',
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
            if (data1.searchId !== undefined) {
              let data11 = data1.searchId;
              if (typeof data11 === 'string') {
                if (!formats0.test(data11)) {
                  const err16 = {
                    instancePath: instancePath + '/body/' + i0 + '/searchId',
                    schemaPath:
                      'https://edition.invalid/control#/components/schemas/TelemetryEvent/properties/searchId/format',
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
                  instancePath: instancePath + '/body/' + i0 + '/searchId',
                  schemaPath:
                    'https://edition.invalid/control#/components/schemas/TelemetryEvent/properties/searchId/type',
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
            if (data1.visitor !== undefined) {
              if (typeof data1.visitor !== 'string') {
                const err18 = {
                  instancePath: instancePath + '/body/' + i0 + '/visitor',
                  schemaPath:
                    'https://edition.invalid/control#/components/schemas/TelemetryEvent/properties/visitor/type',
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
            if (data1.referrer !== undefined) {
              if (typeof data1.referrer !== 'string') {
                const err19 = {
                  instancePath: instancePath + '/body/' + i0 + '/referrer',
                  schemaPath:
                    'https://edition.invalid/control#/components/schemas/TelemetryEvent/properties/referrer/type',
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
            if (data1.zero !== undefined) {
              if (typeof data1.zero !== 'boolean') {
                const err20 = {
                  instancePath: instancePath + '/body/' + i0 + '/zero',
                  schemaPath:
                    'https://edition.invalid/control#/components/schemas/TelemetryEvent/properties/zero/type',
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
            if (data1.observable !== undefined) {
              if (typeof data1.observable !== 'boolean') {
                const err21 = {
                  instancePath: instancePath + '/body/' + i0 + '/observable',
                  schemaPath:
                    'https://edition.invalid/control#/components/schemas/TelemetryEvent/properties/observable/type',
                  keyword: 'type',
                  params: { type: 'boolean' },
                  message: 'must be boolean',
                };
                if (vErrors === null) {
                  vErrors = [err21];
                } else {
                  vErrors.push(err21);
                }
                errors++;
              }
            }
            if (data1.dropped !== undefined) {
              let data16 = data1.dropped;
              if (!(
                typeof data16 == 'number' &&
                !(data16 % 1) &&
                !isNaN(data16)
              )) {
                const err22 = {
                  instancePath: instancePath + '/body/' + i0 + '/dropped',
                  schemaPath:
                    'https://edition.invalid/control#/components/schemas/TelemetryEvent/properties/dropped/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
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
              instancePath: instancePath + '/body/' + i0,
              schemaPath:
                'https://edition.invalid/control#/components/schemas/TelemetryEvent/type',
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
          instancePath: instancePath + '/body',
          schemaPath: '#/properties/body/type',
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
  validate238.errors = vErrors;
  return errors === 0;
}
validate238.evaluated = {
  props: { body: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const ingestAnalyticsOutput = validate239;
const schema315 = {
  $ref: 'https://edition.invalid/control#/components/schemas/Accepted',
  $id: 'https://edition.invalid/validators/ingestAnalyticsOutput',
};
const schema316 = {
  type: 'object',
  properties: { accepted: { type: 'integer', format: 'int32' } },
};
function validate239(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/ingestAnalyticsOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate239.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.accepted !== undefined) {
      let data0 = data.accepted;
      if (!(typeof data0 == 'number' && !(data0 % 1) && !isNaN(data0))) {
        const err0 = {
          instancePath: instancePath + '/accepted',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Accepted/properties/accepted/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
  } else {
    const err1 = {
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/Accepted/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err1];
    } else {
      vErrors.push(err1);
    }
    errors++;
  }
  validate239.errors = vErrors;
  return errors === 0;
}
validate239.evaluated = {
  props: { accepted: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const ingestAnalyticsOutputFull = validate240;
const schema317 = {
  $ref: 'https://edition.invalid/control#/components/schemas/Accepted',
  $id: 'https://edition.invalid/validators/ingestAnalyticsOutputFull',
};
function validate240(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/ingestAnalyticsOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate240.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.accepted !== undefined) {
      let data0 = data.accepted;
      if (!(typeof data0 == 'number' && !(data0 % 1) && !isNaN(data0))) {
        const err0 = {
          instancePath: instancePath + '/accepted',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Accepted/properties/accepted/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
  } else {
    const err1 = {
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/Accepted/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err1];
    } else {
      vErrors.push(err1);
    }
    errors++;
  }
  validate240.errors = vErrors;
  return errors === 0;
}
validate240.evaluated = {
  props: { accepted: true },
  dynamicProps: false,
  dynamicItems: false,
};
